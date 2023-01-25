const body = document.querySelector("body");
const promodoroBoard = document.querySelector(".pomodoro_frame");
const pomodoroDisplayBoard = document.querySelector(".pomodoro_display");
const pomodoroTimer = document.querySelector("#pomodoro_time");
const pomodoroMinute = document.querySelector("#minute");
const pomodoroSecond = document.querySelector("#second");
const pomodoroProgress = document.querySelector(".pomodoro_progress");
const pomodoroBtn = document.querySelector("#pomodoro_controller");
const pomodoroControllers = document.querySelectorAll(
  'input[name="controller"]'
);

const timeOptions = document.querySelectorAll('input[name="time"]');
const colorOptions = document.querySelectorAll('input[name="color"]');
const fontOptions = document.querySelectorAll('input[name="font"]');

const settingOverlay = document.querySelector(".overlay");
const settingBtn = document.querySelector(".setting-btn");
const settingCloseBtn = document.querySelector(".close-btn");
const applyBtn = document.querySelector("#apply");

let isTimerActive = false;
let isTimeout = false;
let currentMode = "pomodoro";
let timer;

const timerSettings = {
  pomodoro: 25,
  short: 5,
  long: 15,
};

const setting = {
  color: "red",
  font: "kumbh",
};

let min = timerSettings[currentMode];
let sec = 0;

const setMinSec = () => {
  min = timerSettings[currentMode];
  sec = 0;
};

function runTimer() {
  sec--;

  if (sec === -1) {
    sec = 59;
    min--;
  }

  isTimeout = min === 0 && sec === 0;

  if (isTimeout) {
    clearInterval(timer);
    isTimerActive = false;
  }

  updateTimer();
}

function updateTimer() {
  if (sec < 10) pomodoroSecond.innerText = "0" + sec;
  else pomodoroSecond.innerText = sec;
  if (min < 10) pomodoroMinute.innerText = "0" + min;
  else pomodoroMinute.innerText = min;

  updateProgress();

  if (min && isTimeout) {
    pomodoroBtn.innerText = "start";
    pomodoroDisplayBoard.classList.remove("shake_anim");
  } else if (!min && isTimeout) {
    pomodoroBtn.innerText = "restart";
    pomodoroDisplayBoard.classList.add("shake_anim");
  }
}

function updateProgress() {
  const total = timerSettings[currentMode] * 60;
  const curr = min * 60 + sec;

  const progress = Math.round((curr / total) * 360);

  pomodoroProgress.style.background = `conic-gradient(
    hsl(var(--primary-red)) ${360 - progress}deg,
    hsl(var(--clr-dark)) 0deg
  )`;
}

function resetTimer() {
  setMinSec();
  console.log("executed", min, sec);
  updateTimer();
  isTimeout = false;
}

function updateSetting() {
  timeOptions.forEach((time) => {
    timerSettings[time.id] = Number(time.value);
  });

  fontOptions.forEach((font) => {
    if (font.checked) {
      body.style.fontFamily = `var(--ff-${font.value})`;
      setting["font"] = font.value;
    }
  });

  colorOptions.forEach((color) => {
    if (color.checked) {
      setting["color"] = color.value;
      applyBtn.style.backgroundColor = `hsl(var(--primary-${setting["color"]}))`;
    }
  });

  pomodoroControllers.forEach((ctrl) => {
    const mode = document.querySelector(`label[for="${ctrl.id}"]`);
    if (ctrl.checked) {
      mode.style.backgroundColor = `hsl(var(--primary-${setting["color"]}))`;
    } else {
      mode.style.backgroundColor = "hsl(var(--bg-dark))";
    }
  });
}

promodoroBoard.addEventListener("click", (e) => {
  if (isTimeout) {
    resetTimer();
  } else {
    pomodoroBtn.innerText = isTimerActive ? "resume" : "pause";
    isTimerActive = !isTimerActive;
  }

  if (isTimerActive || !timer) timer = setInterval(runTimer, 1000);
  else clearInterval(timer);
});

pomodoroControllers.forEach((controller) => {
  controller.addEventListener("click", ({ target }) => {
    clearInterval(timer);
    isTimerActive = false;

    if (target.value !== currentMode) {
      currentMode = target.value;
      resetTimer();
      pomodoroBtn.innerText = "start";
    }
  });
});

settingBtn.addEventListener("click", () => {
  settingOverlay.classList.toggle("overlayAppear");
});

settingCloseBtn.addEventListener("click", () => {
  settingOverlay.classList.toggle("overlayAppear");
});

applyBtn.addEventListener("click", (e) => {
  e.preventDefault();
  settingOverlay.classList.toggle("overlayAppear");
  isTimerActive = false;
  updateSetting();
  resetTimer();
});
