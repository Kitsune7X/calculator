// -------------------------------
// Variable Declaration
// -------------------------------
// Get all the buttons
const buttons = Array.from(document.querySelectorAll("button"));

// Get the display
const displayBottom = document.querySelector("#calculator-display-row-bottom");
console.log(displayBottom);

// Create an array of number key
const numberKey = buttons.filter((button) => button.className === "number");
// console.log(numberKey);

// Create an array of operator key
const operatorKey = buttons.filter((button) => button.className === "operator");
console.log(operatorKey);

// -------------------------------
// Main
// -------------------------------
buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    // const key = e.target;
    // console.log(e.target.className);

    audio();
    if (key.id === "btn-sound-switch") {
      mute(key);
    }

    // When there is no input, display the initial value on the bottom row
    if (key.className === "number") {
      // Add comma for each 1000
      if (Number(displayBottom.textContent) >= 1000) {
        displayBottom.textContent;
      }
      displayBottom.textContent = displayBottom.textContent + key.textContent;
    }
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
