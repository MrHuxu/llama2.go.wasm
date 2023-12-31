NProgress.configure({
    parent: '#container',
    showSpinner: false
});
NProgress.start();

const input = document.querySelector('input');
const submitButton = document.getElementById('submit');
const container = document.getElementById('container');

const tokenSpeedPrefix = '[TOKEN_SPEED]';
const breakLineChar = '<0x0A>';
const answerElementClass = 'answer';
const appendAnswerText = text => {
    const answerElements = document.getElementsByClassName(answerElementClass);
    const answerElement = answerElements[answerElements.length - 1];

    let ele;
    if (text.startsWith(tokenSpeedPrefix)) {
        answerElement.appendChild(document.createElement('br'));
        answerElement.appendChild(document.createElement('br'));
        ele = document.createElement('strong');
        ele.textContent = `[Achieved tok/s: ${text.replace(tokenSpeedPrefix, '')}]`;
    } else if (text === breakLineChar) {
        ele = document.createElement('br');
    } else {
        ele = document.createElement('span');
        ele.textContent = text;
    }
    answerElement.appendChild(ele);

    container.scrollTop = container.scrollHeight;
}

var worker = new Worker('worker.js');
worker.addEventListener('message', ({ data }) => {
    const { type, payload } = data;

    switch (type) {
        case 'appendAnswerText':
            appendAnswerText(payload);
            break;
        case 'enableInput':
            enableInput();
            break;
        case 'modelLoading':
            NProgress.set(payload);
            break;
        case 'modelLoaded':
            NProgress.done();
            break;
    }
});


const enableInput = () => {
    input.disabled = false;
    input.focus();
}
const disableInput = () => {
    input.disabled = true;
}
const handleInput = () => {
    if (input.value.trim() === '') {
        disableSubmit();
    } else {
        enableSubmit();
    }
}
const handleInputKeyPress = event => {
    if (input.value === '') return;

    if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
    }
}

const disableSubmit = () => {
    submitButton.disabled = true;
}
const enableSubmit = () => {
    submitButton.disabled = false;
}
const handleSubmit = () => {
    const userInput = input.value;

    if (userInput === '') {
        return;
    }

    disableInput();
    disableSubmit();

    const newPrompt = document.createElement('div');
    newPrompt.classList.add('prompt');
    newPrompt.textContent = userInput;
    container.appendChild(newPrompt);
    input.value = '';

    const newAnswer = document.createElement('div');
    newAnswer.classList.add('answer');
    container.appendChild(newAnswer);

    container.scrollTop = container.scrollHeight;

    worker.postMessage({
        type: 'generateAnswer',
        payload: userInput
    });
}