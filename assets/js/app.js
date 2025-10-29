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
const calcState = {
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

// Flow overview: bind DOM/state, listen for user input, funnel it through the
// handlers below, and reuse nextAction to chain calculations.

// -------------------------------
// Main
// -------------------------------

// Attach a click handler to every calculator button to orchestrate the UI flow
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const key = e.target;

    // Step 1: deliver audio feedback so the button feels instant.
    audio();
    // Step 2: optional mute toggle happens independently of the math flow.
    if (key.id === "btn-sound-switch") {
      mute(key);
    }

    // Step 3: process the key to mutate operands and pending operators.
    processKey(key, displayBottom.textContent.length);

    // Step 4: if a result was just produced, hand off to nextAction for chaining.
    if (calcState.isEvaluated) {
      nextAction(key, calcState);
    }

    // Extra features:
    // Clear all
    if (key.id === "btn-clear-all") {
      clearAll(calcState);
      console.log(calcState);
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

  // 1) Numbers either build the current operand or reset after a completed expression.
  if (key.className === "number" && !calcState.isEvaluated) {
    // Assign value to variable A or B depend on whether operator is clicked
    const targetOperand = isOperatorClicked ? "variableB" : "variableA";
    calcState[targetOperand] += key.textContent;

    if (isOperatorClicked) isValidForCalculation = true;
  } else if (key.className === "number" && calcState.isEvaluated) {
    calcState.variableA = key.textContent;
    calcState.isEvaluated = false;
  }

  // 2) Operators capture pending operations or trigger chained evaluations.
  if (key.className === "operator" && !isOperatorClicked) {
    // Prevent user from using operator before inputting any value
    if (calcState.variableA === "") return;
    else {
      isOperatorClicked = true; // Flip state so subsequent digits go to variableB
      sign = key.id; // Remember which operator was chosen for later evaluation
    }
  } else if (
    key.className === "operator" &&
    isOperatorClicked &&
    isValidForCalculation
  ) {
    mathCalculation(calcState, sign);
    sign = key.id;
  }

  // 3) "=" finalizes the expression and resets state for whatever comes next.
  if (key.id === "btn-equal") {
    // Bail out if the equation is still incomplete (e.g., missing second operand)
    if (!isValidForCalculation) return;
    // When the expression is valid, fire the math calculation function
    else {
      mathCalculation(calcState, sign);
      sign = "";
      isOperatorClicked = false;
      isValidForCalculation = false;
    }
  }
  // Trace the current state so the flow is easy to debug during development.
  console.log(`A: ${calcState.variableA}`);
  console.log(`B: ${calcState.variableB}`);
  console.log(`Current class: ${key.className}`);
  console.log(`isEval: ${calcState.isEvaluated}`);
}

// ---------- Mathematic function ----------
// Executes the chosen operation, updates the displays, and resets temporary state
function mathCalculation(state, sign) {
  if (sign in state) {
    state.variableA = state[sign](+state.variableA, +state.variableB);
    isValidForCalculation = false;
    state.variableB = "";
    state.isEvaluated = true;
  }
  return state;
}

// ---------- Consecutive state management function ----------
// Handles the scenario where a user begins a new calculation immediately after one completes
function nextAction(key, state) {
  // If user presses a number key after evaluation, reassign variableA to a the new value
  if (key.className === "number") state.variableA = key.textContent;
  else if (key.className === "operator") {
    isOperatorClicked = true;
    state.isEvaluated = false;
  }
  return state;
}

// ---------- Clear all function ----------
function clearAll(state) {
  state.variableA = "";
  state.variableB = ""; // Set variable B to ""  too in case user press Clear All midway through inputting B
  state.isEvaluated = "false";
  return state;
}

// Handle decimals as well as long decimals

// Add Clear all and Clear 1 by 1 function

// Remove Parenthesis function because it seems unecessary

// Add keyboard mapping??????

// Write separate Display render function

// Just console log for now. Display later

// Refactor to just switch state with only isEvaluated

// Render function will be at the end

// Make Clear All function
