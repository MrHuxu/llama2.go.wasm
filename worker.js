importScripts('static/wasm_exec.js');

const go = new Go();

const isLocalhost = () => {
    var url = self.location.origin;
    return url.indexOf('127.0.0.1') !== -1 || url.indexOf('localhost') !== -1;
}

const appendAnswerText = text => {
    self.postMessage({
        type: 'appendAnswerText',
        payload: text
    });
};
const enableInput = text => {
    self.postMessage({
        type: 'enableInput'
    });
};

const tokenizerURL = self.location.origin + '/' + 'models/tokenizer.bin';
const modelURL = isLocalhost() ? self.location.origin + '/' + 'models/stories15M.bin'
    : 'https://huggingface.co/karpathy/tinyllamas/resolve/main/stories15M.bin';

let tokenizerFileLength, tokenizerFileContent, modelFileLength, modelFileContent;
Promise.all([
    fetch(tokenizerURL), fetch(modelURL)
]).then(([tokenizerFileRequest, modelFileRequest]) => {
    tokenizerFileLength = parseInt(tokenizerFileRequest.headers.get('Content-Length'));
    modelFileLength = parseInt(modelFileRequest.headers.get('Content-Length'));

    return Promise.all([
        tokenizerFileRequest.arrayBuffer(),
        modelFileRequest.arrayBuffer()
    ]);
}).then(([content1, content2]) => {
    tokenizerFileContent = content1;
    modelFileContent = content2;
}).then(
    () => fetch('main.wasm')
).then(
    wasmResponse => wasmResponse.arrayBuffer()
).then(
    wasmBytes => WebAssembly.instantiate(wasmBytes, go.importObject)
).then(wasm => {
    go.run(wasm.instance);

    prepare(
        new Uint8Array(modelFileContent),
        modelFileLength,
        new Uint8Array(tokenizerFileContent),
        tokenizerFileLength,
    );

    generate('Once upon a time', appendAnswerText, enableInput);
});

self.addEventListener('message', ({ data }) => {
    const { type, payload } = data;

    if (type === 'generateAnswer') {
        generate(payload, appendAnswerText, enableInput);
    }
})