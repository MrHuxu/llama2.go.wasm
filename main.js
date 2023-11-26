const input = document.querySelector('input');
const submitButton = document.getElementById('submit');
const container = document.querySelector('.container');

const answerElementClass = "answer";
const appendAnswerText = text => {
    const answerElements = document.getElementsByClassName(answerElementClass);
    const answerElement = answerElements[answerElements.length - 1];
    answerElement.setAttribute(
        'text',
        ((answerElement.getAttribute('text') || '') + text).replace('<0x0A>', '\x0a')
    );

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
    }
});


const enableInput = () => {
    input.disabled = false;
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
    disableInput();
    disableSubmit();
    const userInput = input.value;

    const newPrompt = document.createElement('div');
    newPrompt.classList.add('prompt');
    newPrompt.textContent = userInput === '' ? 'User input' : userInput;
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