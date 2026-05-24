const data = [
  { word: "Apple", meaning: "A red or green fruit" },
  { word: "Dog", meaning: "A loyal pet animal" },
  { word: "Car", meaning: "A vehicle with four wheels" },
  { word: "Sun", meaning: "The star that gives us light" }
];

let selectedWord = null;
let selectedMeaning = null;
let score = 0;

const wordsDiv = document.getElementById("words");
const meaningsDiv = document.getElementById("meanings");
const result = document.getElementById("result");

// START GAME
function startGame() {
  wordsDiv.innerHTML = "<h2>Words</h2>";
  meaningsDiv.innerHTML = "<h2>Meanings</h2>";
  result.innerText = "";

  selectedWord = null;
  selectedMeaning = null;
  score = 0;

  // shuffle meanings separately
  const shuffledMeanings = [...data]
    .sort(() => Math.random() - 0.5);

  // render words
  data.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerText = item.word;

    div.onclick = () => selectWord(div, item.word);

    wordsDiv.appendChild(div);
  });

  // render meanings
  shuffledMeanings.forEach(item => {
    const div = document.createElement("div");
    div.classList.add("item");
    div.innerText = item.meaning;

    div.onclick = () => selectMeaning(div, item.word);

    meaningsDiv.appendChild(div);
  });
}

// SELECT WORD
function selectWord(el, word) {
  clearSelection("word");
  selectedWord = { el, word };
  el.classList.add("selected");
}

// SELECT MEANING
function selectMeaning(el, word) {
  clearSelection("meaning");
  selectedMeaning = { el, word };
  el.classList.add("selected");

  checkMatch();
}

// CHECK MATCH
function checkMatch() {
  if (!selectedWord || !selectedMeaning) return;

  if (selectedWord.word === selectedMeaning.word) {
    selectedWord.el.classList.add("matched");
    selectedMeaning.el.classList.add("matched");

    score++;

    result.innerText = `✅ Correct! Score: ${score}`;

    if (score === data.length) {
      result.innerText = "🎉 You completed the game!";
      updateProgress(10);
    }

  } else {
    result.innerText = "❌ Try again!";
  }

  selectedWord = null;
  selectedMeaning = null;
}

// CLEAR SELECTION
function clearSelection(type) {
  document.querySelectorAll(".selected").forEach(el => {
    el.classList.remove("selected");
  });
}

// PROGRESS HOOK
function updateProgress(score) {
  let player = JSON.parse(localStorage.getItem("player"));
  if (!player) return;

  player.gamesPlayed += 1;
  player.totalScore += score;

  localStorage.setItem("player", JSON.stringify(player));
}

// INIT
startGame();