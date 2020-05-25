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
	goconfig "github.com/TheCacophonyProject/go-config"
	"github.com/TheCacophonyProject/go-cptv/cptvframe"
	"github.com/feverscreen/feverscreen/headers"
	"github.com/feverscreen/feverscreen/webserver/api"
	"github.com/gobuffalo/packr"
	"github.com/gorilla/mux"
	"golang.org/x/net/websocket"
	"log"
	"net/http"
	"os/exec"
	"strings"
	"sync"
	"sync/atomic"
	"time"
)

const (
	configDir = goconfig.DefaultConfigDir
)

var version = "<not set>"
var lastFrame *cptvframe.Frame
var cameraInfo *headers.HeaderInfo
var lastFrameLock sync.RWMutex
var nextFrame = make(chan bool)
var sockets = make(map[int64]*WebsocketRegistration)
var socketsLock sync.RWMutex
var managementAPI *api.ManagementAPI

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
	lastFrame = frame
	lastFrameLock.Unlock()
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
	Type string `json:"type"`
	Data string `json:"data"`
	Uuid int64  `json:"uuid"`
}

type CameraInfo struct {
	ResX  int
	ResY  int
	FPS   int
	Model string
	Brand string
}

type FrameInfo struct {
	Camera        CameraInfo
	Telemetry     cptvframe.Telemetry
	Calibration   api.CalibrationInfo
	BinaryVersion string
	AppVersion    string
	Mode          string
}

type WebsocketRegistration struct {
	AtomicLock      uint32
	Socket          *websocket.Conn
	LastHeartbeatAt int64
}

func WebsocketServer(ws *websocket.Conn) {
	for {
		// Receive any messages from the client
		message := message{}

		if err := websocket.JSON.Receive(ws, &message); err != nil {
			// Probably EOF error, when there's no message.  Maybe could sleep, so we're not thrashing this?
		} else {
			// When we first get a connection, register the websocket and push it onto an array of websockets.
			// Occasionally go through the list and cull any that are no-longer sending heart-beats.
			if message.Type == "Register" {
				socketsLock.Lock()
				sockets[message.Uuid] = &WebsocketRegistration{
					Socket:          ws,
					LastHeartbeatAt: time.Now().Round(time.Millisecond).UnixNano() / 1e6,
					AtomicLock:      0,
				}
				socketsLock.Unlock()
			}
			if message.Type == "Heartbeat" {
				if socket, ok := sockets[message.Uuid]; ok {
					socket.LastHeartbeatAt = time.Now().Round(time.Millisecond).UnixNano() / 1e6
				}
			}
		}
		// TODO(jon): This blocks, so lets avoid busy-waiting
		time.Sleep(1 * time.Millisecond)
	}
}

func HandleFrameServingToWebsocketClients() {
	frameNum := 0
	for {
		if <-nextFrame {
			// NOTE: Only bother with this work if we have clients connected.
			if len(sockets) != 0 {
				// Make the frame info
				buffer := bytes.NewBuffer(make([]byte, 0))
				lastFrameLock.RLock()
				frameInfo := FrameInfo{
					Camera: CameraInfo{
						ResX:  cameraInfo.ResX(),
						ResY:  cameraInfo.ResY(),
						FPS:   cameraInfo.FPS(),
						Model: cameraInfo.Model(),
						Brand: cameraInfo.Brand(),
					},
					Telemetry:     lastFrame.Status,
					Calibration:   managementAPI.LatestCalibration,
					BinaryVersion: managementAPI.BinaryVersion,
					AppVersion:    managementAPI.AppVersion,
					Mode:          managementAPI.Mode,
				}
				frameInfoJson, _ := json.Marshal(frameInfo)
				frameInfoLen := len(frameInfoJson)
				// Write out the length of the frameInfo json as a u16
				_ = binary.Write(buffer, binary.LittleEndian, uint16(frameInfoLen))
				_ = binary.Write(buffer, binary.LittleEndian, frameInfoJson)
				for _, row := range lastFrame.Pix {
					_ = binary.Write(buffer, binary.LittleEndian, row)
				}
				lastFrameLock.RUnlock()
				// Send the buffer back to the client
				frameBytes := buffer.Bytes()
				socketsLock.RLock()
				for uuid, _ := range sockets {
					uuid := uuid
					go func() {
						if socket, ok := sockets[uuid]; ok {
							// If the socket is busy sending the previous frame,
							// don't block, just move on to the next socket.
							if atomic.CompareAndSwapUint32(&socket.AtomicLock, 0, 1) {
								_ = websocket.Message.Send(socket.Socket, frameBytes)
								atomic.StoreUint32(&socket.AtomicLock, 0)
							}
							// Locked, skip this frame to let client catch up.
						}
					}()
				}
				socketsLock.RUnlock()
				frameNum++
			}
		}
		if len(sockets) != 0 {
			var socketsToRemove []int64
			socketsLock.RLock()
			for uuid, socket := range sockets {
				if socket.LastHeartbeatAt < (time.Now().Round(time.Millisecond).UnixNano()/1e6)-7000 {
					socketsToRemove = append(socketsToRemove, uuid)
				}
			}
			socketsLock.RUnlock()
			if len(socketsToRemove) != 0 {
				socketsLock.Lock()
				for _, socketUuid := range socketsToRemove {
					socket := sockets[socketUuid]
					delete(sockets, socketUuid)
					go func() {
						uuid := socketUuid
						log.Println("Dropping old socket", uuid)
						_ = socket.Socket.Close()
						log.Println("Dropped old socket", uuid)
					}()
				}
				socketsLock.Unlock()
			}
		}
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
	go HandleFrameServingToWebsocketClients()

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
	managementAPI = apiObj
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
	apiRouter.HandleFunc("/camera/run-ffc", apiObj.RunFFC).Methods("PUT")
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
