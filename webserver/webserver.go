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
	"fmt"
	"github.com/gobuffalo/packr"
	"github.com/gorilla/mux"
	"log"
	"net/http"
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
}

func HeaderInfo() *headers.HeaderInfo {
	return cameraInfo
}
func SetHeadInfo(headerInfo *headers.HeaderInfo) {
	cameraInfo = headerInfo
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
