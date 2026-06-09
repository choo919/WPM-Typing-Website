import { words as WORD_LIST, shuffleArray } from './words.js';
import stats from './stats.js';

const textLayer = document.getElementById("text-layer");
const textarea = document.getElementById("user-input");
const resetBtn = document.getElementById("reset-btn");
const clearStatsBtn = document.getElementById("clear-stats-btn");
const themeToggle = document.getElementById("theme-toggle");
const autoNextCheckbox = document.getElementById("auto-next");

const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const bestEl = document.getElementById("best-letter");
const worstEl = document.getElementById("worst-letter");

const modal = document.getElementById("complete-modal");
const modalWpm = document.getElementById("modal-wpm");
const modalAccuracy = document.getElementById("modal-accuracy");
const letterTableBody = document.querySelector("#letter-table tbody");
const downloadCsvBtn = document.getElementById("download-csv");
const closeModalBtn = document.getElementById("close-modal");
const nextRoundBtn = document.getElementById("next-round");

let target = "";
let startTime = null;
let correctChars = 0;
let totalTyped = 0;
let prevValue = "";
let finished = false;

const WORD_COUNT = 12;
const AUTO_NEXT_KEY = "typing_auto_next";
const THEME_KEY = "typing_theme_dark";

function getRandomWords(count = WORD_COUNT) {
  const arr = [...WORD_LIST];
  shuffleArray(arr);
  return arr.slice(0, count).join(" ");
}



function renderText(t) {
  textLayer.innerHTML = "";
  let idx = 0;
  const words = t.split(" ");
  for (let w = 0; w < words.length; w++) {
    const wordText = words[w];
    const wordSpan = document.createElement("span");
    wordSpan.className = "word";
    // create char spans inside the word (prevent line breaks inside word)
    for (let i = 0; i < wordText.length; i++) {
      const ch = wordText[i];
      const span = document.createElement("span");
      span.className = "char";
      span.dataset.index = idx++;
      span.textContent = ch;
      wordSpan.appendChild(span);
    }
    textLayer.appendChild(wordSpan);

    // add the separating space as its own .char so indexing lines up with target string
    if (w < words.length - 1) {
      const spaceSpan = document.createElement("span");
      spaceSpan.className = "char space";
      spaceSpan.dataset.index = idx++;
      spaceSpan.textContent = " ";
      textLayer.appendChild(spaceSpan);
    }
  }
  markCurrent(0);
}


function markCurrent(index) {
  const prev = textLayer.querySelector(".char.current");
  if (prev) prev.classList.remove("current");
  const next = textLayer.querySelector(`.char[data-index="${index}"]`);
  if (next) next.classList.add("current");
}

function resetUIForNewRun() {
  correctChars = 0;
  totalTyped = 0;
  prevValue = "";
  startTime = null;
  finished = false;
  textarea.disabled = false;
  textarea.value = "";
  textarea.focus();
  wpmEl.textContent = "WPM: —";
  accuracyEl.textContent = "Accuracy: —";
}

function startNewRound() {
  resetUIForNewRun();
  target = getRandomWords(WORD_COUNT);
  renderText(target);
  updateLetterSummary();
}

function finishTest() {
  if (finished) return;
  finished = true;
  textarea.disabled = true;
  updateResults(true);
  showCompletionModal();
  updateLetterSummary();

  const autoNext = localStorage.getItem(AUTO_NEXT_KEY) === "1";
  if (autoNext) {
    setTimeout(() => {
      hideCompletionModal();
      startNewRound();
    }, 1400);
  }
}

function updateTyping(value) {
  if (value.length === 0) {
    const spans = textLayer.querySelectorAll(".char");
    spans.forEach(s => s.classList.remove("correct", "incorrect"));
    markCurrent(0);
    prevValue = "";
    startTime = null;
    correctChars = 0;
    totalTyped = 0;
    updateResults();
    return;
  }

  if (!startTime) startTime = Date.now();

  const spans = textLayer.querySelectorAll(".char");
  totalTyped = value.length;
  correctChars = 0;
  for (let i = 0; i < spans.length; i++) {
    const span = spans[i];
    const expected = span.textContent;
    const typedChar = value[i];
    span.classList.remove("correct", "incorrect");
    if (typedChar == null) {
      // not typed
    } else {
      if (typedChar === expected) {
        span.classList.add("correct");
        correctChars++;
      } else {
        span.classList.add("incorrect");
      }
    }
  }

  // collect per-letter stats for newly typed characters only
  if (value.length > prevValue.length) {
    for (let i = prevValue.length; i < value.length; i++) {
      const typedChar = value[i];
      const expected = target[i] || null;
      if (expected) {
        stats.update(expected, typedChar === expected);
      }
    }
  }

  prevValue = value;

  const nextIndex = Math.min(value.length, spans.length - 1);
  markCurrent(nextIndex);
  updateResults();

  if (value.length >= target.length) {
    setTimeout(() => finishTest(), 50);
  }
}

function updateResults(final = false) {
  if (!startTime) {
    wpmEl.textContent = "WPM: —";
    accuracyEl.textContent = "Accuracy: —";
    return;
  }
  const minutes = (Date.now() - startTime) / 60000;
  const wpm = minutes > 0 ? ((correctChars / 5) / minutes) : 0;
  const accuracy = totalTyped > 0 ? (correctChars / totalTyped) * 100 : 0;
  wpmEl.textContent = `WPM: ${Math.round(wpm)}`;
  accuracyEl.textContent = `Accuracy: ${Math.round(accuracy)}%`;

  // also keep modal values ready
  modalWpm.textContent = `WPM: ${Math.round(wpm)}`;
  modalAccuracy.textContent = `Accuracy: ${Math.round(accuracy)}%`;
}

function updateLetterSummary() {
  const { best, worst } = stats.getBestAndWorst();
  bestEl.textContent = best ? best.toUpperCase() : "—";
  worstEl.textContent = worst ? worst.toUpperCase() : "—";
}

function showCompletionModal() {
  // populate table with all letter data
  const data = stats.getAllData();
  const keys = Object.keys(data).sort();
  letterTableBody.innerHTML = "";
  keys.forEach(k => {
    const v = data[k];
    const rate = v.attempts ? (v.correct / v.attempts) : 0;
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k.toUpperCase()}</td><td>${v.attempts}</td><td>${v.correct}</td><td>${(rate*100).toFixed(1)}%</td>`;
    letterTableBody.appendChild(tr);
  });

  modal.setAttribute("aria-hidden", "false");
}

function hideCompletionModal() {
  modal.setAttribute("aria-hidden", "true");
}

downloadCsvBtn.addEventListener("click", () => {
  const csv = stats.toCSV();
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "typing_letter_stats.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

closeModalBtn.addEventListener("click", () => {
  hideCompletionModal();
});

nextRoundBtn.addEventListener("click", () => {
  hideCompletionModal();
  startNewRound();
});

resetBtn.addEventListener("click", () => {
  // start new round but preserve aggregated stats
  startNewRound();
});

clearStatsBtn.addEventListener("click", () => {
  if (!confirm("Clear all saved letter stats? This cannot be undone.")) return;
  stats.resetAll();
  updateLetterSummary();
  // refresh modal if visible
  if (modal.getAttribute("aria-hidden") === "false") showCompletionModal();
});

themeToggle.addEventListener("change", (e) => {
  const isDark = e.target.checked;
  document.body.classList.toggle("dark", isDark);
  try { localStorage.setItem(THEME_KEY, isDark ? "1" : "0"); } catch {}
});

autoNextCheckbox.addEventListener("change", (e) => {
  const on = e.target.checked;
  try { localStorage.setItem(AUTO_NEXT_KEY, on ? "1" : "0"); } catch {}
});

// keys and input
textarea.addEventListener("input", (e) => {
  updateTyping(e.target.value);
});

textarea.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    textarea.value = "";
    updateTyping("");
  }
});

// initialize theme & auto-next
(function initSettings(){
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "1") {
      document.body.classList.add("dark");
      themeToggle.checked = true;
    }
    const a = localStorage.getItem(AUTO_NEXT_KEY);
    if (a === "1") autoNextCheckbox.checked = true;
  } catch {}
})();

// initial render
startNewRound();