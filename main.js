const answerElementClass = "answer";
const appendAnswerText = text => {
    const answerElements = document.getElementsByClassName(answerElementClass);
    const answerElement = answerElements[answerElements.length - 1];
    answerElement.textContent += text;
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

const input = document.querySelector('input');
const submitButton = document.getElementById('submit');

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
    submitButton.classList.add('opacity-50');
}
const enableSubmit = () => {
    submitButton.disabled = false;
    submitButton.classList.remove('opacity-50');
}
const container = document.querySelector('.container');
const flexDiv = document.querySelector('.container > div.flex');
const handleSubmit = () => {
    disableInput();
    disableSubmit();
    const userInput = input.value;

    const newPrompt = document.createElement('div');
    newPrompt.classList.add('prompt', 'bg-gray-100', 'rounded-lg', 'my-2', 'py-2', 'px-4', 'self-end');
    newPrompt.textContent = userInput === '' ? 'User input' : userInput;
    flexDiv.appendChild(newPrompt);
    input.value = '';

    const newAnswer = document.createElement('div');
    newAnswer.classList.add('answer', 'bg-green-100', 'rounded-lg', 'my-2', 'py-2', 'px-4', 'self-start');
    newAnswer.textContent = '';
    flexDiv.appendChild(newAnswer);

    container.scrollTop = container.scrollHeight;

    worker.postMessage({
        type: 'generateAnswer',
        payload: userInput
    });
}