# llama2.go.wasm

<p align="center">
  <img src="https://github.com/MrHuxu/llama2.go.wasm/blob/master/static/logo.jpeg" alt="drawing" width="350"/>
  <br>
  <a href="https://llama2.xhu.me" target="_blank">Demo</a>
</p>

## Description

llama2.go.wasm is a web application that combines Go and JavaScript using WebAssembly (WASM). It enables you to perform prompt inference locally in your browser, inspired by the [llama2.c](https://github.com/karpathy/llama2.c) and [llama2.c-web](https://github.com/dmarcos/llama2.c-web) project.

## Features

- Perform prompt inference using Go and JavaScript with WebAssembly.
- Interactive web interface for input and output display.

## Installation

To run the project locally, follow these steps:

1. Clone the repository: `git clone https://github.com/MrHuxu/llama2.go.wasm.git`
2. Navigate to the project directory: `cd llama2.go.wasm`
3. Download checkpoint file `https://huggingface.co/karpathy/tinyllamas/resolve/main/stories15M.bin` into `models` directory
4. Build the WebAssembly binary: `make build`
5. Start the development server: `make dev`
6. Open your web browser and visit: `http://localhost:1234`

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
- `style.css`: Stylesheet for defining the visual appearance of the application.
- `static/`: Static assets such as WASM runtime and logo image.

## Related Projects

- [llama2.c](https://github.com/karpathy/llama2.c): Inference Llama 2 in one file of pure C.
- [llama2.c-web](https://github.com/dmarcos/llama2.c-web): Simple repo that compiles and runs llama2.c on the Web.
- [llama2.go](https://github.com/nikolaydubina/llama2.go): LLaMA-2 in native Go.

## License

This project is licensed under the [MIT License](LICENSE).
