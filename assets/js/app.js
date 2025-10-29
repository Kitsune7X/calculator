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

let variableA = "";
let variableB = "";
let sign = "";

// Operator object
const operator = {
  "btn-plus": (a, b) => a + b,
  "btn-minus": (a, b) => a - b,
  "btn-divide": (a, b) => a / b,
  "btn-multiply": (a, b) => a * b,
};

let isOperatorClicked = false;
let isValidForCalculation = false;
// -------------------------------
// Main
// -------------------------------
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    const key = e.target;
    // console.log(e.target.className);

    audio();
    if (key.id === "btn-sound-switch") {
      mute(key);
    }

    // Process user input
    processKey(key, displayBottom.textContent.length);
  });
});

// Display what's being pressed

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
        variableA += key.textContent;
        displayBottom.textContent = `${variableA}`;
      } else {
        variableB += key.textContent;
        displayBottom.textContent = `${variableB}`;
        isValidForCalculation = true;
      }
    }

    // Operator
    if (
      key.className === "operator" &&
      displayBottom.textContent !== "" &&
      !isOperatorClicked
    ) {
      // a = numberArray.join("");
      isOperatorClicked = true;
      sign = key.id;
      displayTop.textContent += `${displayBottom.textContent}${key.textContent}`;
    }
  }

  // Pass in a and b from previous calculation
  // Equal
  if (key.id === "btn-equal") {
    if (!isValidForCalculation) return;
    else mathCalculation(variableA, variableB, sign);
  }
}

// ---------- Mathematic function ----------
function mathCalculation(a, b, sign) {
  if (sign in operator) {
    a = operator[sign](+a, +b);
    displayTop.textContent += `${b}=`;
    displayBottom.textContent = `${a}`;
    isValidForCalculation = false;
    b = "";
    // return operator[sign](a, b);
  }
}
