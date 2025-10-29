// -------------------------------
// Variable Declaration
// -------------------------------
// Max length of digits
const MAX_LENGTH = 11;

// Get all the buttons
const buttons = Array.from(document.querySelectorAll("button"));

// Get the display
const displayTop = document.querySelector("#calculator-display-row-top");
const displayBottom = document.querySelector("#calculator-display-row-bottom");
// console.log(displayBottom);

// Create an array of number key
const numberKey = buttons.filter((button) => button.className === "number");
// console.log(numberKey);

// Create an array of operator key
const operatorKey = buttons.filter((button) => button.className === "operator");
// console.log(operatorKey);

// let variableA = "";
// let variableB = "";
let sign = "";

// Operator object
const mathExpression = {
  variableA: "",
  variableB: "",
  "btn-plus": (a, b) => a + b,
  "btn-minus": (a, b) => a - b,
  "btn-divide": (a, b) => a / b,
  "btn-multiply": (a, b) => a * b,
};

let isOperatorClicked = false;
let isValidForCalculation = false;
let isConsecutive = false;
// -------------------------------
// Main
// -------------------------------
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const key = e.target;

    audio();
    if (key.id === "btn-sound-switch") {
      mute(key);
    }

    // Process user input
    processKey(key, displayBottom.textContent.length);
  });
});

// -------------------------------
// Helper functions
// -------------------------------

// ---------- Play audio function ----------
function audio() {
  const audio = document.querySelector("#btn-audio");
  audio.currentTime = 0;
  audio.play();
}

// ---------- Mute audio function ----------
function mute(target) {
  const audio = document.querySelector("#btn-audio");
  if (audio.muted) {
    audio.muted = false;
    target.textContent = "ON";
  } else {
    audio.muted = true;
    target.textContent = "OFF";
  }
}

// ---------- Process input function ----------
function processKey(key, length) {
  // Guard before append: only add when current length < MAX_LENGTH.
  // Using <= would allow one extra digit (overflow by one).
  if (length < MAX_LENGTH) {
    if (key.className === "number") {
      if (!isOperatorClicked) {
        mathExpression.variableA += key.textContent;
        displayBottom.textContent = `${mathExpression.variableA}`;
      } else {
        mathExpression.variableB += key.textContent;
        displayBottom.textContent = `${mathExpression.variableB}`;
        isValidForCalculation = true;
      }
    }

    // Operator
    if (
      key.className === "operator" &&
      displayBottom.textContent !== "" &&
      !isOperatorClicked
    ) {
      isOperatorClicked = true;
      sign = key.id;
      displayTop.textContent += `${displayBottom.textContent}${key.textContent}`;
    }
  }

  // Pass in variable for previous input for calculation when "=" is clicked
  if (key.id === "btn-equal") {
    if (!isValidForCalculation) return;
    // When the expression is valid, fire the math calculation function
    else mathCalculation(mathExpression, sign);
    sign = "";
    isOperatorClicked = false;
    isValidForCalculation = false;
    isConsecutive = true;
  }

  // After the first calculation, depend on what user input next, app state will change
  if (isConsecutive) {
    console.log(nextAction(key));
  }

  console.log(mathExpression.variableA);
}

// ---------- Mathematic function ----------
function mathCalculation(expression, sign) {
  if (sign in expression) {
    expression.variableA = expression[sign](
      +expression.variableA,
      +expression.variableB
    );
    displayTop.textContent += `${expression.variableB}=`;
    displayBottom.textContent = `${expression.variableA}`;
    isValidForCalculation = false;
    expression.variableB = "";
  }
  return expression;
}

// Need a switch to change behavior depend on what user input next after calculation

// ---------- Consecutive state management function ----------
function nextAction(key) {
  if (key.className === "number") {
    isConsecutive = false;
    displayTop.textContent = "";
    displayBottom.textContent = key.textContent;
    return (mathExpression.variableA = key.textContent);
  }
}
