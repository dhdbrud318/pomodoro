// declariation of DOM elements
const body = $("body");
const modeOptions = $("input:radio[name=controller]");

const pomodoro = $(".pomodoro_frame");
const pomodoroDisplay = $(".pomodoro_display");
const pomodoroProgress = $(".pomodoro_progress");

const pomodoroMin = $("#minute");
const pomodoroSec = $("#second");

const pomodoroController = $("#pomodoro_controller");

const settingTimes = $("input[name=time]");
const settingColors = $("input[name=color]");
const settingFonts = $("input[name=font]");

const settingOverlay = $(".overlay");
const settingToggler = $(".setting-btn");
const settingClose = $(".close-btn");
const settingApply = $("#apply");

// properties & attrs for operating pomodoro
const timeSetting = {
  pomodoro: 25,
  short: 5,
  long: 15,
};

const currSetting = { font: "kumbh", color: "red" };

let isTimerActive = false;
let isTimeout = false;
let currMode = "pomodoro";
let timer; // for setInterval()

let currMin, currSec;

// function declarations for pomodoro operations
function setCurrTimes() {
  currMin = timeSetting[currMode];
  currSec = 0;
}

function runTimer() {
  currSec = currSec === 0 ? 59 : currSec - 1;
  if (currSec === 59) currMin--;
  checkTimeout();
  updateDisplay();
}

function checkTimeout() {
  isTimeout = currSec === 0 && currMin === 0;

  if (isTimeout) {
    clearInterval(timer);
    isTimerActive = false;
  }
}

function updateDisplay() {
  if (currSec < 10) pomodoroSec.text("0" + currSec);
  else pomodoroSec.text(currSec);

  if (currMin < 10) pomodoroMin.text("0" + currMin);
  else pomodoroMin.text(currMin);

  updateProgress();

  if (currMin && isTimeout) {
    pomodoroController.text("start");
    pomodoroDisplay.removeClass("shake_anim");
  } else if (!currMin && isTimeout) {
    pomodoroController.text("restart");
    pomodoroDisplay.addClass("shake_anim");
  }
}

function updateProgress() {
  const total = timeSetting[currMode] * 60;
  const curr = currMin * 60 + currSec;

  const progress = Math.round((curr / total) * 360);

  pomodoroProgress.css(
    "background",
    `conic-gradient(
        hsl(var(--primary-${currSetting["color"]})) ${360 - progress}deg,
        hsl(var(--clr-dark)) 0deg
      )`
  );
}

function resetTimer() {
  setCurrTimes();
  updateDisplay();
  isTimeout = false;
}

function updateSetting() {
  // update time settings
  settingTimes.each(function () {
    timeSetting[$(this).attr("id")] = Number($(this).val());
  });

  // update font settings
  const selectedFont = $("input[name=font]:checked").val();
  if (currSetting["font"] !== selectedFont) {
    currSetting["font"] = selectedFont;
    body.css("font-family", `var(--ff-${selectedFont})`);
  }

  // update color settings
  const selectedColor = $("input[name=color]:checked").val();
  if (currSetting["color"] !== selectedColor) {
    $("input[name=controller]:checked + label").toggleClass(
      `bg-${currSetting["color"]} bg-${selectedColor}`
    );
    currSetting["color"] = selectedColor;
    settingApply.css(
      "background-color",
      `hsl(var(--primary-${selectedColor}))`
    );
  }
  setCookies(...Object.values(currSetting));
}

function setCookies(font = "kumbh", color = "red", daysToLive = 1) {
  if (!navigator.cookieEnabled) return;
  const date = new Date();
  date.setTime(date.getTime() + daysToLive * 24 * 60 * 60 * 1000);
  const expires = "expires= " + date.toUTCString();

  document.cookie = `font=${font}; ${expires}`;
  document.cookie = `color=${color}; ${expires}`;
}

function getCookies() {
  if (!navigator.cookieEnabled) return;
  const cookies = decodeURIComponent(document.cookie).split("; ");

  cookies.forEach((c) => {
    const [key, val] = c.split("=");
    currSetting[key] = val;
  });
}

$(document).ready(function () {
  settingOverlay.removeClass("invisible").hide();

  if (document.cookie) getCookies();
  else {
    setCookies();
  }

  $("input[name=controller]:checked + label").addClass(
    `bg-${currSetting["color"]}`
  );

  $(`input[name=color][id=${currSetting["color"]}]`).prop("checked", true);

  settingApply.css(
    "background-color",
    `hsl(var(--primary-${currSetting["color"]}))`
  );

  $(`input[name=font][id=${currSetting["font"]}]`).prop("checked", true);

  body.css("font-family", `var(--ff-${currSetting["font"]})`);

  setCurrTimes();

  pomodoro.click(function () {
    if (isTimeout) {
      resetTimer();
    } else {
      pomodoroController.text(isTimerActive ? "resume" : "pause");
      isTimerActive = !isTimerActive;
    }

    if (isTimerActive || !timer) {
      timer = setInterval(runTimer, 1000);
    } else {
      clearInterval(timer);
    }
  });

  modeOptions.each(function () {
    $(this).on("click", function () {
      const prevMode = currMode;
      const tempMode = $(this).val();
      if (timer) clearInterval(timer);
      isTimerActive = false;

      if (tempMode !== prevMode) {
        currMode = tempMode;
        $(`input[id=ctrl_${prevMode}] + label`).removeClass(
          `bg-${currSetting["color"]}`
        );

        $(this).next("label").addClass(`bg-${currSetting["color"]}`);
      }

      resetTimer();
      pomodoroController.text("start");
    });
  });

  settingToggler.on("click", function () {
    if (timer) clearInterval(timer);
    pomodoroController.text("resume");
    isTimerActive = false;
    settingOverlay.fadeIn(500);
  });

  settingClose.on("click", function () {
    settingOverlay.fadeOut(500);
  });

  settingApply.on("click", function (e) {
    e.preventDefault();
    settingOverlay.fadeOut(500);
    updateSetting();
    resetTimer();
    pomodoroController.text("start");
  });
});
