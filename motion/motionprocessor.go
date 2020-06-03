// thermal-recorder - record thermal video footage of warm moving objects
//  Copyright (C) 2018, The Cacophony Project
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

package motion

import (
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"math"
	"os"
	"path"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	config "github.com/TheCacophonyProject/go-config"
	"github.com/TheCacophonyProject/go-cptv/cptvframe"
	"github.com/TheCacophonyProject/window"
	"github.com/feverscreen/feverscreen/loglimiter"
	"github.com/feverscreen/feverscreen/recorder"
	"github.com/godbus/dbus"
)

const (
	maxFFCWarmupDuration = 10 * time.Minute
	ffcTriggerPeriod     = 5 * time.Second
	targetTempFile       = "/etc/cacophony/camera-target-temp"

	minLogInterval = time.Minute
)

type FrameParser func([]byte, *cptvframe.Frame) error

func NewMotionProcessor(
	parseFrame FrameParser,
	motionConf *config.ThermalMotion,
	recorderConf *recorder.RecorderConfig,
	locationConf *config.Location,
	listener RecordingListener,
	recorder recorder.Recorder, c cptvframe.CameraSpec,
) *MotionProcessor {
	go readTemps()
	readCameraTargetTemp()
	log.Printf("camera target temp is %v", targetCameraTemp)
	return &MotionProcessor{
		parseFrame:     parseFrame,
		minFrames:      recorderConf.MinSecs * c.FPS(),
		maxFrames:      recorderConf.MaxSecs * c.FPS(),
		motionDetector: NewMotionDetector(*motionConf, recorderConf.PreviewSecs*c.FPS(), c),
		frameLoop:      NewFrameLoop(recorderConf.PreviewSecs*c.FPS()+motionConf.TriggerFrames, c),
		isRecording:    false,
		window:         recorderConf.Window,
		listener:       listener,
		conf:           recorderConf,
		triggerFrames:  motionConf.TriggerFrames,
		recorder:       recorder,
		locationConfig: locationConf,
		log:            loglimiter.New(minLogInterval),
	}
}

var (
	temps            = []int{}
	mu               sync.Mutex
	targetCameraTemp = 28.0
)

func readCameraTargetTemp() {
	data, err := ioutil.ReadFile(targetTempFile)
	if err != nil {
		log.Println(err)
		return
	}
	i, err := strconv.ParseFloat(strings.TrimSpace(string(data)), 64)
	if err != nil {
		log.Println(err)
		return
	}
	targetCameraTemp = i
}

func readTemps() {

	matches, err := filepath.Glob("/sys/bus/w1/devices/28-*")
	if err != nil {
		log.Println(err)
	}
	tempFiles := make([]string, len(matches))
	temps = make([]int, len(matches))
	for i, match := range matches {
		tempFiles[i] = path.Join(match, "w1_slave")
	}
	log.Println(tempFiles)

	for {
		for i, tempFile := range tempFiles {
			data, err := ioutil.ReadFile(tempFile)
			if err != nil {
				log.Println(err)
				continue
			}

			tempStr := strings.ReplaceAll(string(data), "\n", "")
			split := strings.Split(tempStr, "t=")
			if len(split) != 2 {
				log.Println(tempStr)
				log.Println("failed parsing temp file")
				continue
			}

			t, err := strconv.Atoi(split[1])
			if err != nil {
				log.Println(err)
				continue
			}
			mu.Lock()
			temps[i] = t
			mu.Unlock()
		}
		time.Sleep(time.Second * 3)
	}
}

type MotionProcessor struct {
	recordingLock sync.Mutex

	parseFrame          FrameParser
	minFrames           int
	maxFrames           int
	framesWritten       int
	motionDetector      *motionDetector
	frameLoop           *FrameLoop
	isRecording         bool
	writeUntil          int
	window              window.Window
	conf                *recorder.RecorderConfig
	listener            RecordingListener
	triggerFrames       int
	triggered           int
	recorder            recorder.Recorder
	locationConfig      *config.Location
	sunriseSunsetWindow bool
	sunriseOffset       int
	sunsetOffset        int
	nextSunriseCheck    time.Time
	log                 *loglimiter.LogLimiter
	lastCameraTempSave  time.Time
	finishedWarmup      bool
}

type RecordingListener interface {
	MotionDetected()
	RecordingStarted()
	RecordingEnded()
}

func (mp *MotionProcessor) Process(rawFrame []byte) error {
	frame := mp.frameLoop.Current()
	if err := mp.parseFrame(rawFrame, frame); err != nil {
		return err
	}
	mp.process(frame)
	mp.cameraTempControl(frame)

	if mp.conf.LogRate != 0 && frame.Status.FrameCount%mp.conf.LogRate == 0 {
		go func() {
			if err := mp.csvLog(frame); err != nil {
				log.Println(err)
			}
		}()
	}
	return nil
}

func (mp *MotionProcessor) cameraTempControl(frame *cptvframe.Frame) {
	if mp.moduleTempRequiresSaving(frame) {
		log.Printf("saving target temp as %v", frame.Status.TempC)
		mp.lastCameraTempSave = time.Now()
		err := ioutil.WriteFile(targetTempFile, []byte(fmt.Sprintf("%f", frame.Status.TempC)), 0644)
		if err != nil {
			log.Println(err)
		}
	}

	if !mp.finishedWarmup {
		if frame.Status.TimeOn > maxFFCWarmupDuration {
			log.Printf("finished camera warmup beacuse warmup time exceeded %v", maxFFCWarmupDuration)
			mp.finishedWarmup = true
		} else if frame.Status.TempC >= targetCameraTemp {
			log.Printf("finished camera warmup beacuse target temp of %v reached or exceeded", targetCameraTemp)
			mp.finishedWarmup = true
		} else if frame.Status.TimeOn-frame.Status.LastFFCTime > ffcTriggerPeriod {
			if err := runFFC(); err != nil {
				log.Println(err)
			}
		}
	}
}

func (mp *MotionProcessor) moduleTempRequiresSaving(frame *cptvframe.Frame) bool {
	return mp.finishedWarmup &&
		frame.Status.TimeOn-frame.Status.LastFFCTime > 2*time.Minute &&
		frame.Status.TimeOn > 30*time.Minute &&
		time.Now().Sub(mp.lastCameraTempSave) > 30*time.Minute
}

func runFFC() error {
	log.Println("triggering FFC")
	conn, err := dbus.SystemBus()
	if err != nil {
		return err
	}
	recorder := conn.Object("org.cacophony.leptond", "/org/cacophony/leptond")
	return recorder.Call("org.cacophony.leptond.RunFFC", 0).Err
}

var csvFileName = "/var/spool/feverscreen/datalog-" + time.Now().Format("2006-01-02 15:04:05") + ".csv"

func (mp *MotionProcessor) csvLog(frame *cptvframe.Frame) error {
	var min uint16 = math.MaxUint16
	var max uint16

	for _, row := range frame.Pix {
		for _, val := range row {
			if val > max {
				max = val
			}
			if val < min {
				min = val
			}
		}
	}

	data := []string{
		time.Now().Format("2006-01-02 15:04:05.99"),
		strconv.Itoa(frame.Status.FrameCount),
		strconv.FormatInt(frame.Status.TimeOn.Milliseconds(), 10),
		strconv.FormatInt(frame.Status.LastFFCTime.Milliseconds(), 10),
		strconv.FormatFloat(frame.Status.TempC, 'f', -1, 64),
		strconv.FormatFloat(frame.Status.LastFFCTempC, 'f', -1, 64),
		strconv.Itoa(int(max)),
		strconv.Itoa(int(frame.Status.FrameMean)),
		strconv.Itoa(int(min)),
	}

	mu.Lock()
	for _, temp := range temps {
		data = append(data, strconv.Itoa(temp))
	}
	mu.Unlock()

	dataStr := strings.Join(data, ", ")
	if _, err := os.Stat(csvFileName); os.IsNotExist(err) {
		if err := os.MkdirAll(path.Dir(csvFileName), 0755); err != nil {
			return err
		}
		// Add name of columns to string if file does not exist
		dataStr = strings.Join([]string{
			"time",
			"Frame Count",
			"Lepton Time On (ms)",
			"Lepton LastFFCTime (ms)",
			"Lepton Temp (C)",
			"Lepton Last FFC Temp (C)",
			"Lepton raw MAX",
			"Lepton raw MEAN",
			"Lepton raw MIN",
		}, ", ") + "\n" + dataStr
	}

	f, err := os.OpenFile(csvFileName, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	if _, err := f.Write([]byte(dataStr + "\n")); err != nil {
		f.Close() // ignore error; Write error takes precedence
		return err
	}
	return f.Close()
}

func (mp *MotionProcessor) StartRecordingManual() error {
	mp.recordingLock.Lock()
	defer mp.recordingLock.Unlock()
	if mp.isRecording {
		return errors.New("Already recording")
	}
	mp.isRecording = true
	mp.writeUntil = -1
	if err := mp.recorder.StartRecording(); err != nil {
		return err
	}
	return nil
}

func (mp *MotionProcessor) process(frame *cptvframe.Frame) {
	if mp.conf.Active && mp.motionDetector.Detect(frame) {
		if mp.listener != nil {
			mp.listener.MotionDetected()
		}
		mp.triggered++

		if mp.isRecording {
			// increase the length of recording
			mp.writeUntil = min(mp.framesWritten+mp.minFrames, mp.maxFrames)
		} else if mp.triggered < mp.triggerFrames {
			// Only start recording after n (triggerFrames) consecutive frames with motion detected.
		} else if err := mp.canStartWriting(); err != nil {
			mp.log.Printf("Recording not started: %v", err)
		} else if err := mp.startRecording(); err != nil {
			mp.log.Printf("Can't start recording file: %v", err)
		} else {
			mp.writeUntil = mp.minFrames
		}
	} else {
		mp.triggered = 0
	}

	// If recording, write the frame.
	if mp.isRecording {
		err := mp.recorder.WriteFrame(frame)
		if err != nil {
			mp.log.Printf("Failed to write to CPTV file %v", err)
		}
		mp.framesWritten++
	}

	mp.frameLoop.Move()

	if mp.isRecording && mp.framesWritten >= mp.writeUntil && mp.writeUntil != -1 {
		_, err := mp.StopRecording()
		if err != nil {
			mp.log.Printf("Failed to stop recording CPTV file %v", err)
		}
	}
}

func (mp *MotionProcessor) ProcessFrame(srcFrame *cptvframe.Frame) {
	frame := mp.frameLoop.Current()
	frame.Copy(srcFrame)
	mp.process(frame)
}

func (mp *MotionProcessor) GetCurrentFrame() *cptvframe.Frame {
	return mp.frameLoop.CopyRecent()
}

func (mp *MotionProcessor) GetRecentFrame() *cptvframe.Frame {
	return mp.frameLoop.CopyRecent()
}

func (mp *MotionProcessor) canStartWriting() error {
	if !mp.window.Active() {
		return errors.New("motion detected but outside of recording window")
	}
	return mp.recorder.CheckCanRecord()
}

func (mp *MotionProcessor) startRecording() error {
	mp.recordingLock.Lock()
	defer mp.recordingLock.Unlock()
	if mp.isRecording {
		return errors.New("Already recording")
	}
	if err := mp.recorder.StartRecording(); err != nil {
		return err
	}

	mp.isRecording = true
	if mp.listener != nil {
		mp.listener.RecordingStarted()
	}

	return mp.recordPreTriggerFrames()
}

func (mp *MotionProcessor) StopRecording() (string, error) {
	mp.recordingLock.Lock()
	defer mp.recordingLock.Unlock()
	if mp.listener != nil {
		mp.listener.RecordingEnded()
	}

	file, err := mp.recorder.StopRecording()

	mp.framesWritten = 0
	mp.writeUntil = 0
	mp.isRecording = false
	mp.triggered = 0
	// if it starts recording again very quickly it won't write the same frames again
	mp.frameLoop.SetAsOldest()

	return file, err
}

func (mp *MotionProcessor) recordPreTriggerFrames() error {
	frames := mp.frameLoop.GetHistory()
	var frame *cptvframe.Frame
	ii := 0

	// it never writes the current frame as this will be written later
	for ii < len(frames)-1 {
		frame = frames[ii]
		if err := mp.recorder.WriteFrame(frame); err != nil {
			return err
		}
		ii++
	}

	return nil
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
