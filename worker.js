importScripts('static/wasm_exec.js');

const MODEL_CACHE_NAME = 'llama2.models';

const go = new Go();


const isLocalhost = () => {
    var url = self.location.origin;
    return url.indexOf('127.0.0.1:1234') !== -1 || url.indexOf('localhost:1234') !== -1;
}
const isCacheEnabled = () => 'caches' in self;

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


const tokenizerURL = self.location.origin + '/' + 'models/tokenizer.bin';
const modelURL = isLocalhost() ? self.location.origin + '/' + 'models/stories15M.bin'
    : 'https://huggingface.co/karpathy/tinyllamas/resolve/main/stories15M.bin';

let tokenizerFileLength, tokenizerFileContent, modelFileLength, modelFileContent;

const retrieveModelCache = () => {
    if (!isCacheEnabled()) {
        return Promise.all([
            fetch(tokenizerURL), fetch(modelURL)
        ]);
    }

    return caches.open(MODEL_CACHE_NAME).then(cache => {
        return Promise.all([
            cache.match(tokenizerURL), cache.match(modelURL)
        ]).then(([tokenizerFileResponse, modelFileResponse]) => {
            if (tokenizerFileResponse && modelFileResponse) {
                return [tokenizerFileResponse, modelFileResponse];
            }

            return Promise.all([
                fetch(tokenizerURL), fetch(modelURL)
            ]);
        });
    })
};
retrieveModelCache().then(([tokenizerFileResponse, modelFileResponse]) => {
    tokenizerFileLength = parseInt(tokenizerFileResponse.headers.get('Content-Length'));
    modelFileLength = parseInt(modelFileResponse.headers.get('Content-Length'));

    if (isCacheEnabled()) {
        const clone1 = tokenizerFileResponse.clone();
        const clone2 = modelFileResponse.clone();
        caches.open(MODEL_CACHE_NAME).then(cache => {
            cache.put(tokenizerURL, clone1);
            cache.put(modelURL, clone2);
        })
    }

    return Promise.all([
        tokenizerFileResponse.arrayBuffer(),
        modelFileResponse.arrayBuffer()
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
    sendModelLoaded();

    generate('Once upon a time', sendAppendAnswerText, sendEnableInput);
});

self.addEventListener('message', ({ data }) => {
    const { type, payload } = data;

    if (type === 'generateAnswer') {
        generate(payload, sendAppendAnswerText, sendEnableInput);
    }
})