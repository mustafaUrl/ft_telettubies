//create a canvas and inside it display a math question
//question should be a (operator) b = (answerbox)
//user should be able to input the answer in a text box



var correctanswer = 0;

function createQuestion() {
    //a and b can be negative

    var a = Math.floor(Math.random() * 50);
    var b = Math.floor(Math.random() * 50);
    a = Math.random() > 0.5 ? a : -a;
    b = Math.random() > 0.5 ? b : -b;
    const operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
    correctanswer = eval(`${a} ${operator} ${b}`);
    return `${a} ${operator} ${b} = `;
}

function checkAnswer(correctanswer, answer) {
    return eval(correctanswer) === answer;
}

export default function Game2() {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    document.getElementById('main-content').appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.font = '24px serif';

    // Question text
    const questionText = createQuestion();
    ctx.fillText(questionText, 10, 50);

    // Input field rectangle
    const inputField = { x: 200, y: 20, width: 140, height: 40 };
    ctx.strokeRect(inputField.x, inputField.y, inputField.width, inputField.height);
    //input field placeholder question mark
    ctx.fillText("?", inputField.x + 10, inputField.y + 27);
    // HTML input field
    const inputElement = document.createElement('input');
    inputElement.type = 'number';
    inputElement.id = 'inputField';
    inputElement.min = '-1000';
    inputElement.max = '1000';
    document.getElementById('main-content').appendChild(inputElement);


    // Submit button rectangle
    const submitButton = { x: 350, y: 20, width: 100, height: 40 };
    ctx.fillRect(submitButton.x, submitButton.y, submitButton.width, submitButton.height);
    ctx.fillStyle = 'white';
    ctx.fillText("Submit", submitButton.x + 10, submitButton.y + 27);
    ctx.fillStyle = 'black'; // Reset fillStyle for other drawings

    // Click event listener to detect interaction with the submit button
    canvas.addEventListener('click', function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Check if click is within the submit button bounds
        if (x > submitButton.x && x < submitButton.x + submitButton.width &&
            y > submitButton.y && y < submitButton.y + submitButton.height) {
            console.log("Submit button clicked");
            // Get the answer from the input field
            var answer = parseInt(document.getElementById('inputField').value);
            if (checkAnswer(correctanswer, answer)) {
                alert("Correct!");
            } else {
                alert("Incorrect!");
            }
            // Clear the canvas and create a new question
            ctx.clearRect(0, 0, canvas.width, canvas.height);

        }
    });
}
