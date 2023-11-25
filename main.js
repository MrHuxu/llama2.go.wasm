const tokenizerFileRequest = await fetch(self.location.origin + '/' + 'models/tokenizer.bin');
const tokenizerFileContent = await tokenizerFileRequest.arrayBuffer();
const tokenizerFileLength = parseInt(tokenizerFileRequest.headers.get('Content-Length'));

const modelURL = isLocalhost() ? self.location.origin + '/' + 'models/stories15M.bin'
    : 'https://huggingface.co/karpathy/tinyllamas/resolve/main/stories15M.bin';
const modelFileRequest = await fetch(modelURL);
const modelFileContent = await modelFileRequest.arrayBuffer();
const modelFileLength = parseInt(modelFileRequest.headers.get('Content-Length'));

function isLocalhost() {
    var url = self.location.origin;
    return url.indexOf('127.0.0.1') !== -1 || url.indexOf('localhost') !== -1;
}

const go = new Go();

const wasmResponse = await fetch('main.wasm');
const wasmBytes = await wasmResponse.arrayBuffer();
const wasm = await WebAssembly.instantiate(wasmBytes, go.importObject);
go.run(wasm.instance);


const answerElementClass = "answer";
const appendText = text => {
    const answerElements = document.getElementsByClassName(answerElementClass);
    const answerElement = answerElements[answerElements.length - 1];
    answerElement.textContent += text;
}

prepare(
    new Uint8Array(modelFileContent),
    modelFileLength,
    new Uint8Array(tokenizerFileContent),
    tokenizerFileLength,
);

generate('once upon a time');

