build:
	GOOS=js GOARCH=wasm go build -o main.wasm main.go

dev:
	python3 -m http.server 1234