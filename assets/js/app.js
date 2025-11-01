// -------------------------------
// Variable Declaration
// -------------------------------
// Max length of digits allowed on the display
const MAX_LENGTH = 11;

// Collect all calculator buttons once so listeners can be attached in bulk
const buttons = Array.from(document.querySelectorAll("button"));

// Number buttons used for building operands digit by digit
const numberKey = buttons.filter((button) => button.className === "number");

// Operator buttons trigger the arithmetic function to apply
const operatorKey = buttons.filter((button) => button.className === "operator");

// Operator lookup maps button ids to their corresponding math routine
const calcState = {
  variableA: "",
  variableB: "",
  sign: "",
  "btn-plus": (a, b) => +(a + b).toFixed(2),
  "btn-minus": (a, b) => +(a - b).toFixed(2),
  "btn-divide": (a, b) => {
    if (+b === 0) return;
    return +(a / b).toFixed(2);
  }, // Handle infinity decimal
  "btn-multiply": (a, b) => +(a * b).toFixed(2),
  lastInputWasOperator: false,
  canEvaluate: false,
  isEvaluated: false,
  isDecimal: false,
  isNegative: false,
};

// Flow overview: bind DOM/state, listen for user input, funnel it through the
// handlers below, and reuse nextAction to chain calculations.

// -------------------------------
// Main
// -------------------------------

// Attach a click handler to every calculator button to orchestrate the UI flow
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const key = e.target;

    // References to the display rows that show the current and historical input
    const displayTop = document.querySelector("#calculator-display-row-top");
    const displayBottom = document.querySelector(
      "#calculator-display-row-bottom"
    );

    // console.log(key);
    // Step 1: deliver audio feedback so the button feels instant.
    audio();
    // Step 2: optional mute toggle happens independently of the math flow.
    if (
      key.id === "btn-sound-switch" ||
      key.parentElement.id === "btn-sound-switch"
    ) {
      mute();
    }

    // Step 3: process the key to mutate operands and pending operators.
    processKey(key, displayBottom.textContent.length);

    // Step 4: if a result was just produced, hand off to nextAction for chaining.
    if (calcState.isEvaluated) {
      nextAction(key, calcState);
    }

    // Render to display
    render(key, calcState, displayTop, displayBottom);
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

  // 1) Numbers either build the current operand or reset after a completed expression.
  if (key.className === "number" && !calcState.isEvaluated) {
    // Assign value to variable A or B depend on whether operator is clicked
    const targetOperand = calcState.lastInputWasOperator
      ? "variableB"
      : "variableA";
    calcState[targetOperand] += key.textContent;

    if (calcState.lastInputWasOperator) calcState.canEvaluate = true;
  } else if (key.className === "number" && calcState.isEvaluated) {
    calcState.variableA = key.textContent;
    calcState.isEvaluated = false;
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
    calcState.canEvaluate
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
  // console.log(typeof calcState.variableA);
  // console.log(calcState.sign);
  // console.log(`B: ${calcState.variableB}`);
  // console.log(`Current class: ${key.className}`);
  // console.log(`isEval: ${calcState.isEvaluated}`);
}

// ---------- Mathematic function ----------
// Executes the chosen operation, updates the displays, and resets temporary state
function mathCalculation(state) {
  if (state.sign in state) {
    renderPrevious(state);
    // Runn the calculation depends on the sign being passed on and assign the value to A
    state.variableA = state[state.sign](+state.variableA, +state.variableB);
    // When the result of calculation is valid (not divide by 0), convert it to Str
    if (state.variableA) state.variableA = state.variableA.toString();
    else state.variableA = "÷ 0 = +_+";
    // Reset the state
    state.canEvaluate = false;
    state.variableB = "";
    state.isEvaluated = true;
    state.isDecimal = false;
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
  if (!Number.isInteger(+state.variableA)) return;

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
  // if (!state.lastInputWasOperator) {
  //   if (key.id === "btn-clear") {
  //     if (top.textContent) top.textContent = `${state.variableA}`;
  //     else if (!top.textContent) bottom.textContent = `${state.variableA}`;
  //   } else top.textContent = `${state.variableA}`;
  // } else {
  //   const operator = document.getElementById(state.sign);
  //   top.textContent = `${state.variableA}${operator.textContent}${state.variableB}`;
  //   bottom.textContent = "";
  // }
  // const operator = document.getElementById(state.sign);
  // if (!operator) top.textContent = `${state.variableA}`;

  if (state.isEvaluated) {
    bottom.textContent = `${state.variableA}`;
  }

  if (key.id === "btn-clear-all") {
    top.textContent = "";
    bottom.textContent = "";
  }
}

// ---------- Render previous math expression ----------
function renderPrevious(state) {
  const top = document.querySelector("#calculator-display-row-top");
  const operator = document.getElementById(state.sign);
  return (top.textContent = `${state.variableA}${operator.textContent}${state.variableB}=`);
}
