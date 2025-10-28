const buttons = Array.from(document.querySelectorAll("button"));

console.log(buttons);

buttons.forEach((button) => {
  button.addEventListener("click", (e) => {
    console.log(e.target.id);
    audio();
    if (e.target.id === "btn-sound-switch") {
      mute(e.target);
      //   e.target.
    }
  });
});

function audio() {
  const audio = document.querySelector("#btn-audio");
  audio.currentTime = 0;
  audio.play();
}

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
