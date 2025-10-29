// -------------------------------
// Variable Declaration
// -------------------------------
// Max length of digits allowed on the display
const MAX_LENGTH = 11;

// Collect all calculator buttons once so listeners can be attached in bulk
const buttons = Array.from(document.querySelectorAll("button"));

// References to the display rows that show the current and historical input
const displayTop = document.querySelector("#calculator-display-row-top");
const displayBottom = document.querySelector("#calculator-display-row-bottom");

// Create an array of number key
const numberKey = buttons.filter((button) => button.className === "number");

// Create an array of operator key
const operatorKey = buttons.filter((button) => button.className === "operator");

let sign = "";

// Operator object maps button ids to the concrete math operation
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
let isNewCalculation = true;

// -------------------------------
// Main
// -------------------------------

// Attach a click handler to every calculator button to orchestrate the UI flow
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
// Provides instant tactile feedback on every button press
function audio() {
  const audio = document.querySelector("#btn-audio");
  audio.currentTime = 0;
  audio.play();
}

// ---------- Mute audio function ----------
// Toggle button sound on/off and update the toggle label
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
// Routes the button press to the correct state mutation path
function processKey(key, length) {
  // Guard before append: only add when current length < MAX_LENGTH.
  // Using <= would allow one extra digit (overflow by one).
  if (length < MAX_LENGTH) {
    // New Calculation Scenario
    if (key.className === "number" && isNewCalculation) {
      if (!isOperatorClicked) {
        mathExpression.variableA += key.textContent;
        displayBottom.textContent = `${mathExpression.variableA}`;
      } else {
        mathExpression.variableB += key.textContent;
        displayBottom.textContent = `${mathExpression.variableB}`;
        isValidForCalculation = true;
      }
    }

    // Consecutive calculation Scenario
    if (key.className === "number" && isConsecutive) {
      mathExpression.variableB += key.textContent;
      displayBottom.textContent = `${mathExpression.variableB}`;
      isValidForCalculation = true;
    }

    // Operator
    if (
      key.className === "operator" &&
      displayBottom.textContent !== "" &&
      !isOperatorClicked
    ) {
      isOperatorClicked = true;
      sign = key.id;
      if (!isConsecutive) {
        displayTop.textContent += `${displayBottom.textContent}${key.textContent}`;
      } else if (isConsecutive) {
        displayTop.textContent = `${mathExpression.variableA}${key.textContent}`;
      }
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
    // isConsecutive = true;
    isNewCalculation = false;
  }

  // After the first calculation, depend on what user input next, app state will change
  if (!isNewCalculation && !isConsecutive) {
    nextAction(key);
  }

  console.log(`A: ${mathExpression.variableA}`);
  console.log(`B: ${mathExpression.variableB}`);
  console.log(isOperatorClicked);
}

// ---------- Mathematic function ----------
// Executes the chosen operation, updates the displays, and resets temporary state
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

// ---------- Consecutive state management function ----------
// Handles the scenario where a user begins a new calculation immediately after one completes
function nextAction(key) {
  if (key.className === "number") {
    isConsecutive = false;
    isNewCalculation = true;
    displayTop.textContent = "";
    displayBottom.textContent = key.textContent;
    mathExpression.variableA = key.textContent;
    return isNewCalculation;
  } else if (key.className === "operator") {
    displayTop.textContent = `${mathExpression.variableA}${key.textContent}`;
    isOperatorClicked = true;
    isConsecutive = true;
    return (sign = key.id);
  }
}

// Need a switch to change behavior depend on what user input next after calculation
// Done for new calculation after the first one complete, need to handle cases where user make consecutive calculation
// Need to fix the display

// Consecutive calculation done.

// Handle cases where user reach max digit
