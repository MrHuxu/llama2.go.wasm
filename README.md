# llama2.go.wasm

![Project Logo](placeholder-image.png)

## Description

llama2.go.wasm is a web application that combines Go and JavaScript using WebAssembly (WASM). It enables you to perform prompt inference locally in your browser, inspired by the [llama2.c](https://github.com/karpathy/llama2.c) project.

## Features

- Perform prompt inference using Go and JavaScript with WebAssembly.
- Interactive web interface for input and output display.

## Installation

To run the project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/MrHuxu/llama2.go.wasm.git`
2. Navigate to the project directory: `cd llama2.go.wasm`
3. Build the WebAssembly binary: `make build`
4. Start the development server: `make dev`
5. Open your web browser and visit: `http://localhost:1234`

## Usage

1. Open the web application in your browser.
2. Enter the prompt in the provided input field.
3. Click the "Submit" button to perform prompt inference.
4. The output will be displayed on the web page.

## Project Structure

- `index.html`: Main entrance of the application.
- `main.go`: Go source code for the WebAssembly application.
- `main.js`: JavaScript code for interacting with the UI.
- `worker.js`: JavaScript code for interacting with the WebAssembly module.
- `static/`: Static assets such as WASM runtime and logo image.

## Related Projects

- [llama2.c](https://github.com/karpathy/llama2.c): Inference Llama 2 in one file of pure C.
- [llama2.c-web](https://github.com/dmarcos/llama2.c-web): Simple repo that compiles and runs llama2.c on the Web.
- [llama2.go](https://github.com/nikolaydubina/llama2.go): LLaMA-2 in native Go.

## License

This project is licensed under the [MIT License](LICENSE).
