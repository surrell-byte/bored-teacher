const fruits = [
  "🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🍍", "🥝", "🍑"
];

let missingIndex;
let score = 0;

const board = document.getElementById("board");
const statusText = document.getElementById("status");

// START GAME
function startGame() {
  board.innerHTML = "";
  statusText.innerText = "Memorise the fruits!";
  score = 0;

  // shuffle fruits
  const shuffled = [...fruits].sort(() => Math.random() - 0.5);

  // pick missing fruit
  missingIndex = Math.floor(Math.random() * shuffled.length);

  shuffled.forEach((fruit, index) => {
    const div = document.createElement("div");
    div.classList.add("fruit");
    div.innerText = fruit;

    div.dataset.index = index;
    div.dataset.fruit = fruit;

    div.addEventListener("click", () => handleGuess(index));

    board.appendChild(div);
  });

  // show for 5 seconds then hide one
  setTimeout(() => {
    hideOne();
    statusText.innerText = "Which fruit is missing?";
  }, 5000);
}

// HIDE ONE FRUIT
function hideOne() {
  const cards = document.querySelectorAll(".fruit");
  cards[missingIndex].classList.add("hidden");
}

// HANDLE CLICK
function handleGuess(index) {
  const cards = document.querySelectorAll(".fruit");

  if (!cards[missingIndex].classList.contains("hidden")) return;

  if (index == missingIndex) {
    cards[index].classList.remove("hidden");
    cards[index].classList.add("correct");
    statusText.innerText = "🎉 Correct!";
    score = 10;
    updateProgress(score);
  } else {
    statusText.innerText = "❌ Try again!";
    cards[index].classList.add("wrong");

    setTimeout(() => {
      cards[index].classList.remove("wrong");
    }, 500);
  }
}

// PROGRESS HOOK (connects to your system)
function updateProgress(score) {
  let player = JSON.parse(localStorage.getItem("player"));
  if (!player) return;

  player.gamesPlayed += 1;
  player.totalScore += score;

  localStorage.setItem("player", JSON.stringify(player));
}

// INIT
startGame();