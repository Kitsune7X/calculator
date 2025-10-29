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

// Number buttons used for building operands digit by digit
const numberKey = buttons.filter((button) => button.className === "number");

// Operator buttons trigger the arithmetic function to apply
const operatorKey = buttons.filter((button) => button.className === "operator");

let sign = "";

// Operator lookup maps button ids to their corresponding math routine
const mathExpression = {
  variableA: "",
  variableB: "",
  "btn-plus": (a, b) => a + b,
  "btn-minus": (a, b) => a - b,
  "btn-divide": (a, b) => a / b,
  "btn-multiply": (a, b) => a * b,
  isEvaluated: false,
};

// UI state flags track what kind of input the next key press represents
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

    // After Math calculation, trigger actions depend on user input
    if (mathExpression.isEvaluated) {
      nextAction(key, mathExpression);
    }
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
  if (key.className === "number" && !(length < MAX_LENGTH)) return;

  //
  if (key.className === "number" && !mathExpression.isEvaluated) {
    if (!isOperatorClicked) {
      // Populate the first operand during initial number entry
      mathExpression.variableA += key.textContent;
    } else if (isOperatorClicked) {
      // Once an operator is picked, incoming digits belong to the second operand
      mathExpression.variableB += key.textContent;

      isValidForCalculation = true;
    }
  } else if (key.className === "number" && mathExpression.isEvaluated) {
    mathExpression.variableA = key.textContent;
    mathExpression.isEvaluated = false;
  }

  if (key.className === "operator" && !isOperatorClicked) {
    // Prevent user from using operator before inputting any value
    if (mathExpression.variableA === "") return;
    else {
      isOperatorClicked = true; // Flip state so subsequent digits go to variableB
      sign = key.id; // Remember which operator was chosen for later evaluation
    }
  }

  // Pass in variable for previous input for calculation when "=" is clicked
  // Trigger final evaluation and reset state to accept chaining
  if (key.id === "btn-equal") {
    // Bail out if the equation is still incomplete (e.g., missing second operand)
    if (!isValidForCalculation) return;
    // When the expression is valid, fire the math calculation function
    else {
      mathCalculation(mathExpression, sign);
      sign = "";
      isOperatorClicked = false;
      isValidForCalculation = false;
    }
  }
  // Diagnostic logging keeps the developer aware of current operands and state flags
  console.log(`A: ${mathExpression.variableA}`);
  console.log(`B: ${mathExpression.variableB}`);
  console.log(`Current class: ${key.className}`);
  console.log(`isEval: ${mathExpression.isEvaluated}`);
}

// ---------- Mathematic function ----------
// Executes the chosen operation, updates the displays, and resets temporary state
function mathCalculation(expression, sign) {
  if (sign in expression) {
    expression.variableA = expression[sign](
      +expression.variableA,
      +expression.variableB
    );
    isValidForCalculation = false;
    expression.variableB = "";
    expression.isEvaluated = true;
  }
  return expression;
}

// ---------- Consecutive state management function ----------
// Handles the scenario where a user begins a new calculation immediately after one completes
function nextAction(key, expression) {
  // If user presses a number key after evaluation, reassign variableA to a the new value
  if (key.className === "number") {
    expression.variableA = key.textContent;
  } else if (key.className === "operator") {
    console.log("Here!");
    isOperatorClicked = true;
    expression.isEvaluated = false;
  }
  return expression;
}

// ---------- New State function ----------
function newState(key, expression) {
  expression.variableA = key.textContent;
  expression.variableB = "";
  return expression;
}

// Need a switch to change behavior depend on what user input next after calculation
// Done for new calculation after the first one complete, need to handle cases where user make consecutive calculation
// Need to fix the display

// Consecutive calculation done.

// Handle cases where user reach max digit

// Handle decimals as well as long decimals

// Add Clear all and Clear 1 by 1 function

// Remove Parenthesis function because it seems unecessary

// Add keyboard mapping??????

// Make chaining with operators work instead of just "="

// Need to make state check after evaluted
// Write separate Display render function

// Just console log for now. Display later

// Refactor to just switch state with only isEvaluated
