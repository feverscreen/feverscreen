/*
management-interface - Web based management of Raspberry Pis over WiFi
Copyright (C) 2018, The Cacophony Project

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

package webserver

import (
	"bytes"
	"encoding/binary"
	"encoding/json"
	"fmt"
	"github.com/gobuffalo/packr"
	"github.com/gorilla/mux"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"sync"

	goconfig "github.com/TheCacophonyProject/go-config"
	"github.com/TheCacophonyProject/go-cptv/cptvframe"
	"github.com/feverscreen/feverscreen/headers"
	"github.com/feverscreen/feverscreen/webserver/api"
)

const (
	configDir = goconfig.DefaultConfigDir
)

var version = "<not set>"
var lastFrame *cptvframe.Frame
var cameraInfo *headers.HeaderInfo
var lastFrameLock sync.RWMutex
var nextFrame = make(chan bool)

func LastFrame() *cptvframe.Frame {
	if lastFrame == nil {
		return nil
	}
	lastFrameLock.RLock()
	defer lastFrameLock.RUnlock()
	return lastFrame.CreateCopy()
}
func SetLastFrame(frame *cptvframe.Frame) {
	lastFrameLock.Lock()
	defer lastFrameLock.Unlock()
	lastFrame = frame
	nextFrame <- true
	// We want to notify a channel to send this frame via the websocket.
}

func HeaderInfo() *headers.HeaderInfo {
	return cameraInfo
}
func SetHeadInfo(headerInfo *headers.HeaderInfo) {
	cameraInfo = headerInfo
}

type message struct {
	// the json tag means this will serialize as a lowercased field
	Message string `json:"message"`
}

func WebsocketServer(ws *websocket.Conn) {

	// TODO(jon): If we don't get a heart-beat from the client we should probably drop them.
	buffer := bytes.NewBuffer(make([]byte, 0))
	frameNum := 0
	for {
		frameReady := <-nextFrame
		go func() {
			if frameReady {
				// TODO(jon): Seems like we might be running into locking issues with the frame.
				// Better to just copy the current frame out into a buffer once we have it, then
				// switch to the channel.
				lastFrameLock.RLock()
				defer lastFrameLock.RUnlock()

				// NOTE: we reuse this buffer allocation for each write.
				//  There should be one buffer allocated per web socket client.
				//  At the moment we're assuming all I/O ops succeed, and ignoring errors.
				buffer.Reset()

				telemetry, _ := json.Marshal(lastFrame.Status)
				telemetryLen := len(telemetry)
				c := HeaderInfo().Brand()
				headerInfoJson, _ := json.Marshal(c)
				headerInfoLen := len(headerInfoJson)

				fmt.Println("header json length", headerInfoLen, headerInfoJson)
				// Write out the length of the telemetry json as a u16
				_ = binary.Write(buffer, binary.LittleEndian, uint16(telemetryLen))
				// Write out the telemetry JSON
				_ = binary.Write(buffer, binary.LittleEndian, telemetry)
				// Write out the common camera header info, even though it doesn't change from frame to frame
				// Write out the header info json length as a u16
				_ = binary.Write(buffer, binary.LittleEndian, uint16(headerInfoLen))
				// Write out the header info json
				_ = binary.Write(buffer, binary.LittleEndian, headerInfoJson)
				// Write out the frame data, the length of which we know from the header info.
				_ = binary.Write(buffer, binary.LittleEndian, lastFrame.Pix)

				// Send the buffer back to the client
				_ = websocket.Message.Send(ws, buffer.Bytes())
				frameNum++
			}
		}()
	}
}

func Run() error {
	config, err := ParseConfig(configDir)

	if config.Port != 80 {
		log.Printf("warning: avahi service is advertised on port 80 but port %v is being used", config.Port)
	}

	router := mux.NewRouter()

	// Serve up static content.
	static := packr.NewBox("./static")
	router.PathPrefix("/static/").Handler(http.StripPrefix("/static/", http.FileServer(static)))
	router.Handle("/ws", websocket.Handler(WebsocketServer))
	// UI handlers.
	router.HandleFunc("/", IndexHandler).Methods("GET")
	router.HandleFunc("/wifi-networks", WifiNetworkHandler).Methods("GET", "POST")
	router.HandleFunc("/network", NetworkHandler).Methods("GET")
	router.HandleFunc("/interface-status/{name:[a-zA-Z0-9-* ]+}", CheckInterfaceHandler).Methods("GET")
	router.HandleFunc("/disk-memory", DiskMemoryHandler).Methods("GET")
	router.HandleFunc("/location", GenLocationHandler(config.config)).Methods("GET") // Form to view and/or set location manually.
	router.HandleFunc("/clock", TimeHandler).Methods("GET")                          // Form to view and/or adjust time settings.
	router.HandleFunc("/about", AboutHandlerGen(config.config)).Methods("GET")
	router.HandleFunc("/audiobait", AudiobaitHandlerGen(config.config)).Methods("GET", "POST")
	router.HandleFunc("/audiobait-log-entries", AudiobaitLogEntriesHandler).Methods("GET")
	router.HandleFunc("/audiobait-test-sound/{fileName}/{volume}", AudiobaitSoundsHandlerGen(config.config)).Methods("GET")
	router.HandleFunc("/advanced", AdvancedMenuHandler).Methods("GET")
	router.HandleFunc("/camera", CameraHandler).Methods("GET")
	router.HandleFunc("/camera/snapshot", CameraSnapshot).Methods("GET")
	router.HandleFunc("/camera/snapshot-raw", CameraRawSnapshot).Methods("GET")
	router.HandleFunc("/camera/snapshot-telemetry", CameraTelemetrySnapshot).Methods("GET")
	router.HandleFunc("/camera/headers", CameraHeaders).Methods("GET")

	router.HandleFunc("/rename", Rename).Methods("GET")

	// Get the app version from dpkg:
	out, _ := exec.Command("dpkg", "-l", "feverscreen").Output()
	if len(out) != 0 {
		out, _ := exec.Command("bash", "-c", "dpkg -s feverscreen | egrep 'Version'").Output()
		version = strings.TrimSpace(strings.Split(string(out), ":")[1])
	}

	// API
	apiObj, err := api.NewAPI(config.config, version)
	if err != nil {
		return err
	}
	apiRouter := router.PathPrefix("/api").Subrouter()
	apiRouter.HandleFunc("/device-info", apiObj.GetDeviceInfo).Methods("GET")
	apiRouter.HandleFunc("/recordings", apiObj.GetRecordings).Methods("GET")
	apiRouter.HandleFunc("/recording/{id}", apiObj.GetRecording).Methods("GET")
	apiRouter.HandleFunc("/recording/{id}", apiObj.DeleteRecording).Methods("DELETE")
	apiRouter.HandleFunc("/camera/snapshot", apiObj.TakeSnapshot).Methods("PUT")
	apiRouter.HandleFunc("/camera/snapshot-raw", apiObj.TakeRawSnapshot).Methods("PUT")
	apiRouter.HandleFunc("/camera/metadata", apiObj.FrameMetadata).Methods("GET")
	apiRouter.HandleFunc("/signal-strength", apiObj.GetSignalStrength).Methods("GET")
	apiRouter.HandleFunc("/reregister", apiObj.Reregister).Methods("POST")
	apiRouter.HandleFunc("/reboot", apiObj.Reboot).Methods("POST")
	apiRouter.HandleFunc("/config", apiObj.GetConfig).Methods("GET")
	apiRouter.HandleFunc("/clear-config-section", apiObj.ClearConfigSection).Methods("POST")
	apiRouter.HandleFunc("/location", apiObj.SetLocation).Methods("POST") // Set location via a POST request.
	apiRouter.HandleFunc("/clock", apiObj.GetClock).Methods("GET")
	apiRouter.HandleFunc("/clock", apiObj.PostClock).Methods("POST")
	apiRouter.HandleFunc("/version", apiObj.GetVersion).Methods("GET")
	apiRouter.HandleFunc("/event-keys", apiObj.GetEventKeys).Methods("GET")
	apiRouter.HandleFunc("/events", apiObj.GetEvents).Methods("GET")
	apiRouter.HandleFunc("/events", apiObj.DeleteEvents).Methods("DELETE")
	apiRouter.HandleFunc("/calibration/save", apiObj.SaveCalibration).Methods("POST")
	apiRouter.HandleFunc("/calibration/get", apiObj.GetCalibration).Methods("GET")
	apiRouter.HandleFunc("/network-info", apiObj.GetNetworkInfo).Methods("GET")
	apiRouter.Use(basicAuth)

	listenAddr := fmt.Sprintf(":%d", config.Port)
	log.Printf("listening on %s", listenAddr)
	log.Fatal(http.ListenAndServe(listenAddr, router))
	return nil
}

func basicAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userPassEncoded := "YWRtaW46ZmVhdGhlcnM=" // admin:feathers base64 encoded.
		if r.Header.Get("Authorization") == "Basic "+userPassEncoded {
			next.ServeHTTP(w, r)
		} else {
			http.Error(w, "Forbidden", http.StatusForbidden)
		}
	})
}
