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

package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"image"
	"image/color"
	"image/png"
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

	"github.com/TheCacophonyProject/lepton3"
)

const (
	snapshotName          = "still.png"
	rawSnapshotName       = "still-raw.png"
	allowedSnapshotPeriod = 500 * time.Millisecond
)

var (
	previousSnapshotID   = 0
	previousSnapshotTime time.Time
	mu                   sync.Mutex
)

func newSnapshot(dir string, raw bool) error {
	mu.Lock()
	defer mu.Unlock()

	if time.Since(previousSnapshotTime) < allowedSnapshotPeriod {
		return nil
	}

	if processor == nil {
		return errors.New("Reading from camera has not started yet.")
	}
	f := processor.GetRecentFrame()
	if f == nil {
		return errors.New("no frames yet")
	}
	g16 := image.NewGray16(image.Rect(0, 0, lepton3.FrameCols, lepton3.FrameRows))
	// Max and min are needed for normalization of the frame
	var valMax uint16
	var valMaxLow uint16
	var valMaxHigh uint16
	var valMin uint16 = math.MaxUint16
	var id int
	lowLine := 90
	for i, row := range f.Pix {
		for _, val := range row {
			id += int(val)
			if i > lowLine {
				valMaxLow = maxUint16(valMaxLow, val)
			} else {
				valMaxHigh = maxUint16(valMaxHigh, val)
			}
			valMin = minUint16(valMin, val)
		}
	}
	valMax = maxUint16(valMaxHigh, valMaxLow)

	// Check if frame had already been processed
	if id == previousSnapshotID {
		return nil
	}
	previousSnapshotID = id

	fmt.Printf("val min=%d max=%d valMaxLow=%d valMaxHigh=%d\n", valMin, valMax, valMaxLow, valMaxHigh)

	temp := readTempSensor()
	var norm = math.MaxUint16 / (valMax - valMin)
	for y, row := range f.Pix {
		for x, val := range row {
			if raw {
				g16.SetGray16(x, y, color.Gray16{Y: val})
			} else {
				if y == lowLine {
					g16.SetGray16(x, y, color.Gray16{Y: (valMax - valMin) * norm})
				} else {
					g16.SetGray16(x, y, color.Gray16{Y: (val - valMin) * norm})
				}
			}
		}
	}

	filename := snapshotName
	if raw {
		filename = rawSnapshotName
	}
	out, err := os.Create(path.Join(dir, filename))
	if err != nil {
		return err
	}
	defer out.Close()

	if err := png.Encode(out, g16); err != nil {
		return err
	}
	metadata := map[string]interface{}{
		"valMax":     valMax,
		"valMin":     valMin,
		"valMaxLow":  valMaxLow,
		"valMaxHigh": valMaxHigh,
		"temp":       temp,
	}
	jsonData, err := json.Marshal(metadata)
	if err != nil {
		log.Println(err)
	}
	err = ioutil.WriteFile(path.Join(dir, "metadata"), jsonData, 0644)
	if err != nil {
		log.Println(err)
	}

	/*
		err = ioutil.WriteFile(path.Join(dir, "vlaMax"), []byte(strconv.Itoa(int(valMax))), 0644)
		if err != nil {
			log.Println(err)
		}
		err = ioutil.WriteFile(path.Join(dir, "vlaMaxMin"), []byte(strconv.Itoa(int(valMin))), 0644)
		if err != nil {
			log.Println(err)
		}
		err = ioutil.WriteFile(path.Join(dir, "vlaMaxLow"), []byte(strconv.Itoa(int(valMaxLow))), 0644)
		if err != nil {
			log.Println(err)
		}
		err = ioutil.WriteFile(path.Join(dir, "vlaMaxHigh"), []byte(strconv.Itoa(int(valMaxHigh))), 0644)
		if err != nil {
			log.Println(err)
		}
		err = ioutil.WriteFile(path.Join(dir, "tmep"), []byte(strconv.Itoa(int(temp))), 0644)
		if err != nil {
			log.Println(err)
		}
	*/

	// the time will be changed only if the attempt is successful
	previousSnapshotTime = time.Now()
	return nil
}

func readTempSensor() int64 {
	folders, err := filepath.Glob("/sys/bus/w1/devices/28*")
	if err != nil {
		log.Println(err)
		return 0
	}

	dat, err := ioutil.ReadFile(folders[0] + "/w1_slave")
	if err != nil {
		log.Println("Error: ", err)
	}
	dataStr := string(dat)
	lines := strings.Split(dataStr, "\n")
	tempStrs := strings.Split(lines[1], "t=")
	//log.Println(tempStrs[1])

	temp, err := strconv.ParseInt(tempStrs[1], 10, 64)
	if err != nil {
		log.Println(err)
	}
	//temp = temp / 1000.0
	return temp
	//log.Println(temp)
}

func deleteSnapshot(dir string) {
	deleteSnapshotFile(dir, snapshotName)
	deleteSnapshotFile(dir, rawSnapshotName)
}

func deleteSnapshotFile(dir, basename string) {
	if err := os.Remove(path.Join(dir, basename)); err != nil && !os.IsNotExist(err) {
		log.Printf("error deleting snapshot image: %v", err)
	}
}

func maxUint16(a, b uint16) uint16 {
	if a > b {
		return a
	}
	return b
}

func minUint16(a, b uint16) uint16 {
	if a < b {
		return a
	}
	return b
}
