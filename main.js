const answerElementClass = "answer";
const appendText = text => {
    const answerElements = document.getElementsByClassName(answerElementClass);
    const answerElement = answerElements[answerElements.length - 1];
    answerElement.textContent += text;
}

var worker = new Worker('worker.js');
worker.addEventListener('message', ({ data }) => {
    const { type, payload } = data;

    if (type === 'append') {
        appendText(payload);
    }
});

const input = document.querySelector('input');
const submitButton = document.getElementById('submit');

const disableSubmit = () => {
    submitButton.disabled = true;
    submitButton.classList.add('opacity-50');
}
const enableSubmit = () => {
    submitButton.disabled = false;
    submitButton.classList.remove('opacity-50');
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

const container = document.querySelector('.container');
const flexDiv = document.querySelector('.container > div.flex');
const handleSubmit = () => {
    const userInput = input.value;

    const newPrompt = document.createElement('div');
    newPrompt.classList.add('prompt', 'bg-gray-100', 'rounded-lg', 'my-2', 'py-2', 'px-4', 'self-end');
    newPrompt.textContent = userInput === '' ? 'User input' : userInput;
    flexDiv.appendChild(newPrompt);
    input.value = '';
    disableSubmit();

    const newAnswer = document.createElement('div');
    newAnswer.classList.add('answer', 'bg-green-100', 'rounded-lg', 'my-2', 'py-2', 'px-4', 'self-start');
    newAnswer.textContent = '';
    flexDiv.appendChild(newAnswer);

    container.scrollTop = container.scrollHeight;

    worker.postMessage({
        type: 'generate',
        payload: userInput
    });
}