module github.com/feverscreen/feverscreen

go 1.13

require (
	github.com/TheCacophonyProject/audiobait v0.0.0-20191024224540-9caccf222bd2
	github.com/TheCacophonyProject/event-reporter v1.3.2-0.20200210010421-ca3fcb76a231
	github.com/TheCacophonyProject/go-api v0.0.0-20200210030345-722430c24511
	github.com/TheCacophonyProject/go-config v1.4.0
	github.com/TheCacophonyProject/go-cptv v0.0.0-20200225002107-8095b1b6b929
	github.com/TheCacophonyProject/lepton3 v0.0.0-20200213011619-1934a9300bd3
	github.com/TheCacophonyProject/management-interface v1.6.0
	github.com/TheCacophonyProject/rtc-utils v1.2.0
	github.com/TheCacophonyProject/thermal-recorder v1.22.0
	github.com/TheCacophonyProject/window v0.0.0-20190821235241-ab92c2ee24b6
	github.com/alexflint/go-arg v1.2.0
	github.com/coreos/go-systemd v0.0.0-20190321100706-95778dfbb74e
	github.com/gobuffalo/packr v1.30.1
	github.com/godbus/dbus v4.1.0+incompatible
	github.com/gorilla/mux v1.7.4
	github.com/juju/ratelimit v1.0.1
	github.com/pelletier/go-toml v1.6.0 // indirect
	github.com/spf13/jwalterweatherman v1.1.0 // indirect
	github.com/spf13/pflag v1.0.5 // indirect
	github.com/spf13/viper v1.5.0 // indirect
	github.com/stretchr/testify v1.4.0
	golang.org/x/net v0.0.0-20200222125558-5a598a2470a0 // indirect
	golang.org/x/sys v0.0.0-20191117211529-81af7394a238 // indirect
	gopkg.in/yaml.v1 v1.0.0-20140924161607-9f9df34309c0
	gopkg.in/yaml.v2 v2.2.8
	periph.io/x/periph v3.6.2+incompatible
)

// We maintain a custom fork of periph.io at the moment.
replace periph.io/x/periph => github.com/TheCacophonyProject/periph v2.0.1-0.20171123021141-d06ef89e37e8+incompatible
