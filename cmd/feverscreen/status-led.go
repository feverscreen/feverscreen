package main

import (
	"fmt"
	"log"
	"os/exec"
	"strings"
	"sync"
	"time"

	"periph.io/x/periph/conn/gpio"
	"periph.io/x/periph/conn/gpio/gpioreg"
	"periph.io/x/periph/host"
)

var blinks = 2
var mux sync.Mutex

const (
	ledGPIOName         = "GPIO27"
	pwmLEDGPIOName      = "GPIO12"
	tabletInterfaceName = "usb0"
)

func runStatusLED() error {
	if _, err := host.Init(); err != nil {
		log.Fatal(err)
	}
	p := gpioreg.ByName(ledGPIOName)
	pwmPin := gpioreg.ByName(pwmLEDGPIOName)

	if p == nil {
		return fmt.Errorf("Failed to find GPIO pin %s", ledGPIOName)
	}
	if pwmPin == nil {
		return fmt.Errorf("Failed to find GPIO pin %s", pwmLEDGPIOName)
	}
	go pulse(p, pwmPin)
	go updateBlinks()
	return nil
}

func updateBlinks() {
	for true {
		newBlinks := 2
		hasUSBConn, err := hasInterface(tabletInterfaceName)
		if err != nil {
			log.Println(err)
		}

		if hasUSBConn {
			if pingTest() {
				newBlinks = 0
			} else {
				newBlinks = 1
			}
		}

		mux.Lock()
		blinks = newBlinks
		mux.Unlock()

		if blinks == 0 {
			time.Sleep(20 * time.Second)
		} else {
			time.Sleep(5 * time.Second)
		}
	}
}

func pingTest() bool {
	cmd := exec.Command(
		"ping",
		"-n",
		"-q",
		"-c1", // only do one ping
		"-w5", // wait 5 seconds for ping test
		"1.1.1.1")
	return cmd.Run() == nil
}

func hasInterface(name string) (bool, error) {
	outByte, err := exec.Command("ip", "route").Output()
	if err != nil {
		return false, err
	}
	search := fmt.Sprintf(" dev %s ", name)
	return strings.Contains(string(outByte), search), nil
}

func pulse(p gpio.PinIO, pwmPin gpio.PinIO) {
	for true {
		p.Out(gpio.High)
		pwmPin.Out(gpio.High)
		time.Sleep(4 * time.Second)

		mux.Lock()
		x := blinks
		mux.Unlock()

		if x > 0 {
			p.Out(gpio.Low)
			pwmPin.Out(gpio.Low)
			time.Sleep(time.Second)

			for i := 0; i < x; i++ {
				p.Out(gpio.High)
				pwmPin.Out(gpio.High)
				time.Sleep(400 * time.Millisecond)

				p.Out(gpio.Low)
				pwmPin.Out(gpio.Low)
				time.Sleep(400 * time.Millisecond)
			}
			time.Sleep(time.Second)
		}
	}
}
