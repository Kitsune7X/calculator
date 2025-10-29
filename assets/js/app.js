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

  // New Calculation Scenario
  // Build operands while the user is entering a fresh equation
  if (key.className === "number" && isNewCalculation) {
    if (!isOperatorClicked) {
      // Populate the first operand during initial number entry
      mathExpression.variableA += key.textContent;
      displayBottom.textContent = `${mathExpression.variableA}`;
    } else {
      // Once an operator is picked, incoming digits belong to the second operand
      mathExpression.variableB += key.textContent;
      displayBottom.textContent = `${mathExpression.variableB}`;
      isValidForCalculation = true;
    }
  }

  // Consecutive calculation Scenario
  // Treat new digits as the second operand when chaining operations
  if (key.className === "number" && isConsecutive) {
    // Continue building variableB so the last result can be reused as variableA
    mathExpression.variableB += key.textContent;
    displayBottom.textContent = `${mathExpression.variableB}`;
    isValidForCalculation = true;
  }

  // Record chosen operator and reflect it on the top display
  if (
    key.className === "operator" &&
    displayBottom.textContent !== "" &&
    !isOperatorClicked
  ) {
    isOperatorClicked = true; // Flip state so subsequent digits go to variableB
    sign = key.id; // Remember which operator was chosen for later evaluation
    if (!isConsecutive) {
      displayTop.textContent += `${displayBottom.textContent}${key.textContent}`; // Append current operand and operator to the history display
      displayBottom.textContent = "";
    } else if (isConsecutive) {
      displayTop.textContent = `${mathExpression.variableA}${key.textContent}`; // Refresh history so it shows the carried-over result and the new operator
      displayBottom.textContent = "";
    }
  }

  // Pass in variable for previous input for calculation when "=" is clicked
  // Trigger final evaluation and reset state to accept chaining
  if (key.id === "btn-equal") {
    // Bail out if the equation is still incomplete (e.g., missing second operand)
    if (!isValidForCalculation) return;
    // When the expression is valid, fire the math calculation function
    else mathCalculation(mathExpression, sign);
    sign = "";
    isOperatorClicked = false;
    isValidForCalculation = false;
    isNewCalculation = false;
    mathExpression.isEvaluated = true;
  }

  // After the first calculation, depend on what user input next, app state will change
  // Delegate to the consecutive handler when chaining operations
  if (!isNewCalculation && !isConsecutive) {
    // Inspect the next key press to decide whether to reset or keep chaining
    nextAction(key);
  }

  // Diagnostic logging keeps the developer aware of current operands and state flags
  console.log(`A: ${mathExpression.variableA}`);
  console.log(`B: ${mathExpression.variableB}`);
  console.log(isOperatorClicked);
  console.log(isNewCalculation);
  console.log(isConsecutive);
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
    isConsecutive = false; // Exit consecutive mode so future input rebuilds from scratch
    isNewCalculation = true; // Flag that we are starting a fresh equation flow
    displayTop.textContent = ""; // Clear the history display to remove previous expression
    displayBottom.textContent = key.textContent; // Show the seed digit for the new calculation
    mathExpression.variableA = key.textContent; // Replace the stored result with the new first operand
    return isNewCalculation;
  } else if (key.className === "operator") {
    displayTop.textContent = `${mathExpression.variableA}${key.textContent}`; // Show current result paired with the operator
    isOperatorClicked = true; // Mark that an operator is pending so next digits target variableB
    isConsecutive = true; // Keep consecutive mode active to support operator chaining
    return (sign = key.id); // Store and expose the chosen operator for the next evaluation
  }
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
