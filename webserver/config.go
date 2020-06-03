package webserver

import (
	"fmt"

	goconfig "github.com/TheCacophonyProject/go-config"
)

// Config for management interface
type Config struct {
	Port    int
	CPTVDir string
	config  *goconfig.Config
}

func (c Config) String() string {
	return fmt.Sprintf("{ Port: %d, CPTVDir: %s }", c.Port, c.CPTVDir)
}

// ParseConfig parses the config
func ParseConfig(configDir string) (*Config, error) {
	config, err := goconfig.New(configDir)
	if err != nil {
		return nil, err
	}

	ports := goconfig.DefaultPorts()
	if err := config.Unmarshal(goconfig.PortsKey, &ports); err != nil {
		return nil, err
	}

	thermalRecorder := goconfig.DefaultThermalRecorder()
	if err := config.Unmarshal(goconfig.ThermalRecorderKey, &thermalRecorder); err != nil {
		return nil, err
	}

	return &Config{
		Port:    ports.Managementd,
		CPTVDir: thermalRecorder.OutputDir,
		config:  config,
	}, nil
}
