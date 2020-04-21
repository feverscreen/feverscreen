.PHONY: build-arm
build-arm: install-packr
	tsc -p ./webserver
	GOOS=linux GOARCH=arm GOARM=7 packr build -ldflags="-s -w" ./cmd/feverscreen

.PHONY: install-packr
install-packr:
	go get github.com/gobuffalo/packr/packr

.PHONY: build
build: install-packr
	tsc -p ./webserver
	packr build -ldflags="-s -w" ./cmd/feverscreen

.PHONY: release
release: install-packr
	curl -sL https://git.io/goreleaser | bash

.PHONY: clean
clean:
	packr clean
	rm feverscreen

.PHONY: install-typescript
install-typescript:
	npm install -g typescript
