module github.com/feverscreen/feverscreen

go 1.13

// We maintain a custom fork of periph.io at the moment.
replace periph.io/x/periph => github.com/TheCacophonyProject/periph v2.1.1-0.20200615222341-6834cd5be8c1+incompatible

replace github.com/TheCacophonyProject/go-config => github.com/feverscreen/go-config v1.7.0

require (
	github.com/LK4D4/trylock v0.0.0-20191027065348-ff7e133a5c54
	github.com/TheCacophonyProject/audiobait v1.5.1-0.20200210043233-4de72199941a
	github.com/TheCacophonyProject/event-reporter v1.3.2-0.20200210010421-ca3fcb76a231
	github.com/TheCacophonyProject/go-api v0.0.0-20200210030345-722430c24511
	github.com/TheCacophonyProject/go-config v1.4.0
	github.com/TheCacophonyProject/go-cptv v0.0.0-20200616224711-fc633122087a
	github.com/TheCacophonyProject/lepton3 v0.0.0-20200615223119-045204f5d53f
	github.com/TheCacophonyProject/management-interface v1.6.0
	github.com/TheCacophonyProject/rtc-utils v1.3.0
	github.com/TheCacophonyProject/window v0.0.0-20200312071457-7fc8799fdce7
	github.com/alexflint/go-arg v1.3.0
	github.com/coreos/go-systemd v0.0.0-20191104093116-d3cd4ed1dbcf
	github.com/fsnotify/fsnotify v1.4.9 // indirect
	github.com/gobuffalo/envy v1.9.0 // indirect
	github.com/gobuffalo/packd v1.0.0 // indirect
	github.com/gobuffalo/packr v1.30.1
	github.com/godbus/dbus v4.1.0+incompatible
	github.com/gorilla/mux v1.7.4
	github.com/juju/ratelimit v1.0.1
	github.com/mitchellh/mapstructure v1.2.2 // indirect
	github.com/pelletier/go-toml v1.6.0 // indirect
	github.com/rogpeppe/go-internal v1.5.2 // indirect
	github.com/spf13/cast v1.3.1 // indirect
	github.com/spf13/jwalterweatherman v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/spf13/viper v1.6.2 // indirect
	github.com/stretchr/testify v1.5.1
	golang.org/x/net v0.0.0-20200226121028-0de0cce0169b
	golang.org/x/sys v0.0.0-20200413165638-669c56c373c4 // indirect
	gopkg.in/ini.v1 v1.55.0 // indirect
	gopkg.in/yaml.v1 v1.0.0-20140924161607-9f9df34309c0
	gopkg.in/yaml.v2 v2.2.8
	periph.io/x/periph v3.6.2+incompatible
)
