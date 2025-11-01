// ==============================
// * Global Variables — START
// ==============================

// Max length of digits allowed on the display
const MAX_LENGTH = 17;

// Collect all calculator buttons once so listeners can be attached in bulk
const buttons = Array.from(document.querySelectorAll("button"));

// Calculation State object that determine the state of the script
const calcState = {
  variableA: "",
  variableB: "",
  sign: "",
  "btn-plus": (a, b) => +(a + b).toFixed(2),
  "btn-minus": (a, b) => +(a - b).toFixed(2),
  "btn-divide": (a, b) =>
    +b === 0
      ? (variableA = "(˘･_･˘)") // Handle infinity decimal
      : +(a / b).toFixed(2),
  "btn-multiply": (a, b) => +(a * b).toFixed(2),
  lastInputWasOperator: false,
  canEvaluate: false,
  isEvaluated: false,
  isDecimal: false,
  isNegative: false,
};

// ==============================
// * Global Variables — END
// ==============================

// Flow overview: bind DOM/state, listen for user input, funnel it through the
// handlers below, and reuse nextAction to chain calculations.

// ==============================
// * Main — START
// ==============================
// Attach a click handler to every calculator button to orchestrate the UI flow
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const key = e.target;

    // References to the display rows that show the current and historical input
    const displayTop = document.querySelector("#calculator-display-row-top");
    const displayBottom = document.querySelector(
      "#calculator-display-row-bottom"
    );

    // ---------- Audio Handling - START ----------
    audio();
    // Optional mute toggle happens independently of the math flow.
    if (
      key.id === "btn-sound-switch" ||
      key.parentElement.id === "btn-sound-switch"
    ) {
      mute();
    }
    // ---------- Audio Handling - END ----------

    // ---------- Process Key - START ----------
    // Main function to handle most of the functionalities of the app
    processKey(key, displayTop.textContent.length);

    // If a result was just produced, hand off to nextAction for chaining.
    if (calcState.isEvaluated) {
      nextAction(key, calcState);
    }

    // ---------- Process Key - END ----------

    // ---------- Render to Display - START ----------
    render(key, calcState, displayTop, displayBottom);
    // ---------- Render to Display - END ----------
  });
});

// ==============================
// * Main — END
// ==============================

// ==============================
// * Functions — START
// ==============================

// ---------- Play audio function ----------
// Provides instant tactile feedback on every button press
function audio() {
  const audio = document.querySelector("#btn-audio");
  audio.currentTime = 0;
  audio.play();
}

// ---------- Mute audio function ----------
// Toggle button sound on/off and update the toggle label
function mute() {
  const audio = document.querySelector("#btn-audio");
  const musicNote = document.querySelector("#btn-sound-switch img");
  if (audio.muted) {
    audio.muted = false;
    musicNote.setAttribute("src", "./assets/images/music_on.svg");
  } else {
    audio.muted = true;
    musicNote.setAttribute("src", "./assets/images/music_off.svg");
  }
}

// ---------- Process input function ----------
// Routes the button press to the correct state mutation path
function processKey(key, length) {
  // Guard before append: only add when current length < MAX_LENGTH.
  // Using <= would allow one extra digit (overflow by one).
  if (key.className === "number" && !(length < MAX_LENGTH)) return;

  // Numbers either build the current operand or reset after a completed expression.
  // Build operand case
  if (key.className === "number" && !calcState.isEvaluated) {
    assignVariable(calcState, key);
    // Reset after a completed evaluation
  } else if (key.className === "number" && calcState.isEvaluated) {
    resetState(calcState, key);
  }

  // 2) Operators capture pending operations or trigger chained evaluations.
  if (key.className === "operator" && !calcState.lastInputWasOperator) {
    // Prevent user from using operator before inputting any value
    if (!calcState.variableA) return;
    else {
      calcState.lastInputWasOperator = true; // Flip state so subsequent digits go to variableB
      calcState.sign = key.id; // Remember which operator was chosen for later evaluation
      calcState.isDecimal = false; // Reset decimal state
      calcState.isNegative = false;
    }
  } else if (
    key.className === "operator" &&
    calcState.lastInputWasOperator &&
    calcState.canEvaluate // Flag check to prevent user from trying to calculate without variable B
  ) {
    mathCalculation(calcState);
    // After calculation, assign that operator to sign for consecutive calculation
    calcState.sign = key.id;
  }

  // 3) "=" finalizes the expression and resets state for whatever comes next.
  if (key.id === "btn-equal") {
    // Bail out if the equation is still incomplete (e.g., missing second operand)
    if (!calcState.canEvaluate) return;
    // When the expression is valid, fire the math calculation function
    else {
      mathCalculation(calcState);
      calcState.sign = "";
      calcState.lastInputWasOperator = false;
      calcState.canEvaluate = false;
    }
  }

  // Handling decimal
  if (key.id === "btn-decimal") {
    handleDecimal(calcState);
  }

  // Plus Minus
  if (key.id === "btn-plus-minus") {
    handlePlusMinus(calcState);
  }

  // Clear all
  if (key.id === "btn-clear-all") {
    clearAll(calcState);
  }

  if (key.id === "btn-clear") {
    clearOneByOne(calcState);
  }
  // Trace the current state so the flow is easy to debug during development.
  console.log(`A: ${calcState.variableA}`);
  console.log(typeof calcState.variableA);
  // console.log(calcState.sign);
  // console.log(`B: ${calcState.variableB}`);
  // console.log(`Current class: ${key.className}`);
  // console.log(`isEval: ${calcState.isEvaluated}`);
}

// ---------- Assign variables function ----------
function assignVariable(state, key) {
  // Assign value to variable A or B depend on whether operator is clicked
  const targetOperand = state.lastInputWasOperator ? "variableB" : "variableA";
  state[targetOperand] += key.textContent;

  if (state.lastInputWasOperator) state.canEvaluate = true;

  return state;
}

// ---------- Resiet state function ----------
function resetState(state, key) {
  state.variableA = key.textContent;
  state.isEvaluated = false;
  state.isDecimal = false;
  return state;
}

// ---------- Mathematic function ----------
// Executes the chosen operation, updates the displays, and resets temporary state
function mathCalculation(state) {
  if (state.sign in state) {
    renderPrevious(state);
    // Runn the calculation depends on the sign being passed on and assign the value to A
    state.variableA = state[state.sign](+state.variableA, +state.variableB);
    // When the result of calculation is valid (not divide by 0), convert it to Str
    state.variableA = state.variableA.toString();

    renderCurrent(state);
    // Reset the state
    state.canEvaluate = false;
    state.variableB = "";
    state.isEvaluated = true;
    if (Number.isInteger(+state.variableA)) state.isDecimal = false;
    else state.isDecimal = true;
  }
  return state;
}

// ---------- Consecutive state management function ----------
// Handles the scenario where a user begins a new calculation immediately after one completes
function nextAction(key, state) {
  // If user presses a number key after evaluation, reassign variableA to a the new value
  if (key.className === "number") state.variableA = key.textContent;
  else if (key.className === "operator") {
    state.lastInputWasOperator = true;
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

// ---------- Decimal handling function ----------
function handleDecimal(state) {
  // If the decimal button is clicked before A was input, return
  if (!state.variableA) return;

  // When the result of a calculation is a float with decimal, return
  // if (!Number.isInteger(+state.variableA)) return;
  // Handle result after calculation
  if (state.isEvaluated) state.isEvaluated = false;

  if (!state.isDecimal) {
    // Apply decimal to variable A or B depend on whether an operator was activated
    if (state.lastInputWasOperator) state.variableB += ".";
    else state.variableA += ".";
    state.isDecimal = true;
  }

  return state;
}

// ---------- Plus Minus handling function ----------
function handlePlusMinus(state) {
  // If the plus minus button was clicked before A was input, return
  if (!state.variableA || +state.variableA === 0) return;

  // Handle the result of evaluation
  if (state.isEvaluated) {
    if (+state.variableA > 0) state.isNegative = false;
    else if (+state.variableA < 0) state.isNegative = true;
    else return;
  }

  const targetOperand = state.lastInputWasOperator ? "variableB" : "variableA";
  if (!state.isNegative) {
    // Put the methods in separate lines due to unshift and shift return added or removed
    // elements perspectively. No chaining
    state[targetOperand] = [...state[targetOperand]];
    state[targetOperand].unshift("-");

    // Need to reassgin back to variable A due to join() method return a copy
    state[targetOperand] = state[targetOperand].join("");

    state.isNegative = true;
  } else {
    state[targetOperand] = [...state[targetOperand]];
    state[targetOperand].shift();

    state[targetOperand] = state[targetOperand].join("");

    state.isNegative = false;
  }
  return state;
}

// ---------- Delete One by one function ----------
function clearOneByOne(state) {
  if (!state.variableA) return;

  // Clear one by one based on what being input
  if (!state.lastInputWasOperator) {
    state.variableA = [...state.variableA];
    state.variableA.pop();
    state.variableA = state.variableA.join("");
  } else {
    if (!state.variableB) {
      state.sign = "";
      state.lastInputWasOperator = false;
    } else {
      state.variableB = [...state.variableB];
      state.variableB.pop();
      state.variableB = state.variableB.join("");
    }
  }
}

// ---------- Render function ----------
function render(key, state, top, bottom) {
  if (key.id === "btn-clear-all") {
    top.textContent = "";
    bottom.textContent = "";
  }

  if (key.id === "btn-plus-minus") {
    top.textContent = `${state.variableA}`;
    bottom.textContent = `${state.variableB}`;
  }

  // if (key.id === "btn-decimal") {
  //   bottom.textContent = "";
  // }
  if (state.isEvaluated) return;
  const operator = document.getElementById(state.sign);
  if (!operator) top.textContent = `${state.variableA}`;
  else
    top.textContent = `${state.variableA}${operator.textContent}${state.variableB}`;
}

// ---------- Render previous math expression ----------
function renderPrevious(state) {
  const top = document.querySelector("#calculator-display-row-top");
  const operator = document.getElementById(state.sign);
  return (top.textContent = `${state.variableA}${operator.textContent}${state.variableB}=`);
}

function renderCurrent(state) {
  const bottom = document.querySelector("#calculator-display-row-bottom");
  return (bottom.textContent = `${state.variableA}`);
}

// ==============================
// * Functions — END
// ==============================
