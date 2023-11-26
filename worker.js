importScripts('static/wasm_exec.js');

const go = new Go();

const isLocalhost = () => {
    var url = self.location.origin;
    return url.indexOf('127.0.0.1') !== -1 || url.indexOf('localhost') !== -1;
}

const sendAppendAnswerText = text => {
    self.postMessage({
        type: 'appendAnswerText',
        payload: text
    });
};
const sendEnableInput = text => {
    self.postMessage({
        type: 'enableInput'
    });
};
const sendModelLoading = ratio => {
    self.postMessage({
        type: 'modelLoading',
        payload: ratio
    });
}
const sendModelLoaded = () => {
    self.postMessage({
        type: 'modelLoaded'
    });
}


const tokenizerURL = isLocalhost() ? self.location.origin + '/' + 'models/tokenizer.bin'
    : 'https://github.com/karpathy/llama2.c/raw/master/tokenizer.bin';
const modelURL = isLocalhost() ? self.location.origin + '/' + 'models/stories15M.bin'
    : 'https://huggingface.co/karpathy/tinyllamas/resolve/main/stories15M.bin';

let tokenizerFileLength, tokenizerFileContent, modelFileLength, modelFileContent;
Promise.all([
    fetch(tokenizerURL), fetch(modelURL)
]).then(([tokenizerFileResponse, modelFileResponse]) => {
    tokenizerFileLength = parseInt(tokenizerFileResponse.headers.get('Content-Length'));
    modelFileLength = parseInt(modelFileResponse.headers.get('Content-Length'));

    return Promise.all([
        tokenizerFileResponse.arrayBuffer(),
        modelFileResponse.arrayBuffer()
    ]);
}).then(([content1, content2]) => {
    tokenizerFileContent = content1;
    modelFileContent = content2;

    sendModelLoaded();
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

    generate('Once upon a time', sendAppendAnswerText, sendEnableInput);
});

self.addEventListener('message', ({ data }) => {
    const { type, payload } = data;

    if (type === 'generateAnswer') {
        generate(payload, sendAppendAnswerText, sendEnableInput);
    }
})