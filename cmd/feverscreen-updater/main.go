package main

import (
	"errors"
	"log"
	"os/exec"
	"runtime"

	arg "github.com/alexflint/go-arg"
	"github.com/godbus/dbus"
	"github.com/godbus/dbus/introspect"
)

const (
	dbusName = "org.cacophony.FeverscreenUpdater"
	dbusPath = "/org/cacophony/FeverscreenUpdater"
)

var version = "<not set>"

type Args struct{}

func (Args) Version() string {
	return version
}

func procArgs() Args {
	args := Args{}
	arg.MustParse(&args)
	return args
}

func main() {
	if err := runMain(); err != nil {
		log.Fatal(err)
	}
	runtime.Goexit()
}

func runMain() error {
	_ = procArgs()
	log.SetFlags(0)
	return startService()
}

type service struct{}

func startService() error {
	conn, err := dbus.SystemBus()
	if err != nil {
		return nil
	}
	reply, err := conn.RequestName(dbusName, dbus.NameFlagDoNotQueue)
	if err != nil {
		return err
	}
	if reply != dbus.RequestNameReplyPrimaryOwner {
		return errors.New("name already taken")
	}
	s := &service{}
	if err := conn.Export(s, dbusPath, dbusName); err != nil {
		return err
	}
	return conn.Export(genIntrospectable(s), dbusPath, "org.freedesktop.DBus.Introspectable")
}

func genIntrospectable(v interface{}) introspect.Introspectable {
	return introspect.NewIntrospectable(&introspect.Node{
		Interfaces: []introspect.Interface{{
			Name:    dbusName,
			Methods: introspect.Methods(v),
		}},
	})
}

func (s service) RunUpdate() *dbus.Error {
	go func() {
		if err := exec.Command("tko-update").Run(); err != nil {
			log.Printf("error with running tko update %v\n", err)
		}
	}()
	return nil
}
