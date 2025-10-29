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

const numberArray = [];
const operatorArray = [];
let a = "";
let b = "";

let isOperatorClicked = false;
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

// ---------- Display function ----------
function processKey(key, length) {
  // Guard before append: only add when current length < MAX_LENGTH.
  // Using <= would allow one extra digit (overflow by one).
  if (length < MAX_LENGTH) {
    if (key.className === "number") {
      if (!isOperatorClicked) {
        a += key.textContent;
        displayBottom.textContent = `${a}`;
      } else {
        b += key.textContent;
        displayBottom.textContent = `${b}`;
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
      displayTop.textContent += `${displayBottom.textContent}${key.textContent}`;
    }
  }
}
