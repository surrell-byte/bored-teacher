const words = [
  { word: "Apple", emoji: "🍎" },
  { word: "Dog", emoji: "🐶" },
  { word: "Car", emoji: "🚗" },
  { word: "Sun", emoji: "☀️" }
];

let cards = [];
let flippedCards = [];
let matchedPairs = 0;

const board = document.getElementById("gameBoard");
const statusText = document.getElementById("status");

// START GAME
function startGame() {
  board.innerHTML = "";
  flippedCards = [];
  matchedPairs = 0;

  // duplicate + shuffle
  cards = [...words, ...words]
    .sort(() => Math.random() - 0.5);

  cards.forEach((item, index) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.word = item.word;
    card.dataset.index = index;
    card.innerHTML = "?";

    card.addEventListener("click", () => flipCard(card, item));

    board.appendChild(card);
  });

  statusText.innerText = "Find all the pairs!";
}

// FLIP CARD
function flipCard(card, item) {
  if (
    card.classList.contains("flipped") ||
    card.classList.contains("matched") ||
    flippedCards.length === 2
  ) return;

  card.classList.add("flipped");
  card.innerHTML = `${item.emoji}<br>${item.word}`;

  flippedCards.push({ card, word: item.word });

  if (flippedCards.length === 2) {
    checkMatch();
  }
}

// CHECK MATCH
function checkMatch() {
  const [first, second] = flippedCards;

  if (first.word === second.word) {
    first.card.classList.add("matched");
    second.card.classList.add("matched");
    matchedPairs++;

    if (matchedPairs === words.length) {
      statusText.innerText = "🎉 You win!";
      updateProgress(10); // ← hook to your system
    }
  } else {
    setTimeout(() => {
      first.card.classList.remove("flipped");
      second.card.classList.remove("flipped");
      first.card.innerHTML = "?";
      second.card.innerHTML = "?";
    }, 800);
  }

  flippedCards = [];
}

// PROGRESS SYSTEM HOOK
function updateProgress(score) {
  let player = JSON.parse(localStorage.getItem("player"));
  if (!player) return;

  player.gamesPlayed += 1;
  player.totalScore += score;

  localStorage.setItem("player", JSON.stringify(player));
}

// INIT
startGame();