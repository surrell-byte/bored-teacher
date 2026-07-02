const screens = {
  welcome: document.querySelector("#welcomeScreen"),
  select: document.querySelector("#selectScreen"),
  race: document.querySelector("#raceScreen"),
  victory: document.querySelector("#victoryScreen")
};

const planeData = {
  red: {
    name: "Jett",
    image: "assets/images/characters/avatars/red-plane.png",
    offset: { x: -1.1, y: -3.2 }
  },
  blue: {
    name: "Donnie",
    image: "assets/images/characters/avatars/blue-plane.png",
    offset: { x: 1.1, y: 3.2 }
  },
  green: {
    name: "Mira",
    image: "assets/images/characters/avatars/green-plane.png",
    offset: { x: 0.6, y: -3.2 }
  }
};

const boardPath = [
  { x: 8.3, y: 82.8 },
  { x: 26.1, y: 78.4 },
  { x: 41.0, y: 78.4 },
  { x: 56.0, y: 78.1 },
  { x: 70.9, y: 77.9 },
  { x: 85.1, y: 77.1 },
  { x: 83.1, y: 51.7 },
  { x: 69.2, y: 50.5 },
  { x: 54.4, y: 50.1 },
  { x: 39.2, y: 49.9 },
  { x: 24.1, y: 50.2 },
  { x: 26.6, y: 24.1 },
  { x: 42.1, y: 23.8 },
  { x: 58.0, y: 23.6 },
  { x: 74.1, y: 23.8 },
  { x: 88.3, y: 24.1 }
];

const state = {
  players: [
    { plane: "red", position: 0 },
    { plane: "blue", position: 0 }
  ],
  turn: 0,
  sound: true,
  rolling: false,
  spinning: false,
  spinnerTimer: null,
  timers: []
};

const p1Choice = document.querySelector("#p1Choice");
const p2Choice = document.querySelector("#p2Choice");
const p1Name = document.querySelector("#p1Name");
const p2Name = document.querySelector("#p2Name");
const p1Panel = document.querySelector("#p1Panel");
const p2Panel = document.querySelector("#p2Panel");
const p1Token = document.querySelector("#p1Token");
const p2Token = document.querySelector("#p2Token");
const rollButton = document.querySelector("#rollButton");
const rollValue = document.querySelector("#rollValue");
const rollLabel = document.querySelector("#rollLabel");
const raceMessage = document.querySelector("#raceMessage");
const winnerName = document.querySelector("#winnerName");
const modal = document.querySelector("#modal");
const modalTitle = document.querySelector("#modalTitle");
const modalBody = document.querySelector("#modalBody");
const closeModal = document.querySelector("#closeModal");

function showScreen(name) {
  Object.values(screens).forEach((screen) => screen.classList.remove("is-active"));
  screens[name].classList.add("is-active");
}

function trackTimer(timer, type) {
  state.timers.push({ timer, type });
  return timer;
}

function clearGameTimers() {
  state.timers.forEach(({ timer, type }) => {
    if (type === "interval") window.clearInterval(timer);
    if (type === "timeout") window.clearTimeout(timer);
  });
  state.timers = [];
  state.rolling = false;
  state.spinning = false;
  state.spinnerTimer = null;
  rollButton.disabled = false;
  rollButton.classList.remove("is-rolling");
  p1Token.classList.remove("is-flying");
  p2Token.classList.remove("is-flying");
}

function choosePlane(playerIndex, plane) {
  state.players[playerIndex].plane = plane;
  document.querySelectorAll(`.character-pick[data-player="${playerIndex}"]`).forEach((card) => {
    card.classList.toggle("is-selected", card.dataset.plane === plane);
  });
  updateSelectionText();
}

function updateSelectionText() {
  p1Choice.textContent = `P1: ${planeData[state.players[0].plane].name}`;
  p2Choice.textContent = `P2: ${planeData[state.players[1].plane].name}`;
}

function startRace() {
  clearGameTimers();
  state.players[0].position = 0;
  state.players[1].position = 0;
  state.turn = 0;
  state.rolling = false;
  p1Name.textContent = planeData[state.players[0].plane].name;
  p2Name.textContent = planeData[state.players[1].plane].name;
  p1Token.style.backgroundImage = `url("${planeData[state.players[0].plane].image}")`;
  p2Token.style.backgroundImage = `url("${planeData[state.players[1].plane].image}")`;
  rollValue.textContent = "GO";
  rollLabel.textContent = "ROLL";
  rollButton.disabled = false;
  updateTokens();
  updateTurn();
  raceMessage.textContent = "Player 1, roll to fly!";
  showScreen("race");
}

function updateTurn() {
  p1Panel.classList.toggle("is-turn", state.turn === 0);
  p2Panel.classList.toggle("is-turn", state.turn === 1);
}

function updateTokens() {
  positionToken(p1Token, state.players[0], 0);
  positionToken(p2Token, state.players[1], 1);
}

function positionToken(token, player, index) {
  const point = boardPath[player.position];
  const plane = planeData[player.plane];
  const sideOffset = index === 0 ? -1 : 1;
  token.style.left = `${point.x + plane.offset.x * 0.35 + sideOffset * 1.2}%`;
  token.style.top = `${point.y + plane.offset.y * 0.35 + sideOffset * 2.2}%`;
}

function rollDice() {
  if (state.spinning) {
    stopDice();
  } else {
    startDice();
  }
}

function startDice() {
  if (state.rolling) return; // ignore clicks while a move is animating

  state.rolling = true;
  state.spinning = true;
  rollButton.classList.add("is-rolling");
  rollLabel.textContent = "STOP";
  playTone(540, 0.08);

  state.spinnerTimer = trackTimer(window.setInterval(() => {
    rollValue.textContent = String(1 + Math.floor(Math.random() * 3));
  }, 85), "interval");
}

function stopDice() {
  window.clearInterval(state.spinnerTimer);
  state.timers = state.timers.filter(({ timer }) => timer !== state.spinnerTimer);
  state.spinnerTimer = null;
  state.spinning = false;

  rollButton.disabled = true; // re-enabled in finishTurn()
  rollButton.classList.remove("is-rolling");
  rollLabel.textContent = "FLY";

  const roll = 1 + Math.floor(Math.random() * 3);
  rollValue.textContent = String(roll);
  playTone(640, 0.1);
  moveCurrentPlayer(roll);
}

function moveCurrentPlayer(roll) {
  const playerIndex = state.turn;
  const player = state.players[playerIndex];
  const token = playerIndex === 0 ? p1Token : p2Token;
  const playerLabel = `Player ${playerIndex + 1}`;
  const target = Math.min(player.position + roll, boardPath.length - 1);
  let step = player.position;

  raceMessage.textContent = `${playerLabel} rolled ${roll}!`;
  token.classList.add("is-flying");

  const mover = trackTimer(window.setInterval(() => {
    step += 1;
    player.position = step;
    updateTokens();
    playTone(720 + step * 18, 0.045);

    if (step >= target) {
      window.clearInterval(mover);
      state.timers = state.timers.filter(({ timer }) => timer !== mover);
      token.classList.remove("is-flying");
      finishTurn(playerIndex);
    }
  }, 460), "interval");
}

function finishTurn(playerIndex) {
  const player = state.players[playerIndex];

  if (player.position >= boardPath.length - 1) {
    playTone(920, 0.2);
    winnerName.textContent = `Player ${playerIndex + 1} wins with ${planeData[player.plane].name}!`;
    trackTimer(window.setTimeout(() => {
      state.timers = [];
      showScreen("victory");
    }, 650), "timeout");
    return;
  }

  state.turn = state.turn === 0 ? 1 : 0;
  state.rolling = false;
  rollButton.disabled = false;
  rollButton.classList.remove("is-rolling");
  rollLabel.textContent = "ROLL";
  updateTurn();
  raceMessage.textContent = `Player ${state.turn + 1}, your turn!`;
}

function openModal(type) {
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");

  if (type === "help") {
    modalTitle.textContent = "How to Play";
    modalBody.innerHTML = `
      <p>Pick a plane for each player, then press Ready.</p>
      <p>Click ROLL to start spinning, then click STOP to lock in your number. Your plane flies along the clouds by that amount.</p>
      <p>Reach the finish cloud first to win the race.</p>
    `;
    return;
  }

  modalTitle.textContent = "Settings";
  modalBody.innerHTML = `
    <p>Adjust the race before takeoff.</p>
    <label>
      <input id="soundToggle" type="checkbox" ${state.sound ? "checked" : ""}>
      Sound effects
    </label>
  `;

  document.querySelector("#soundToggle").addEventListener("change", (event) => {
    state.sound = event.target.checked;
    if (state.sound) playTone(620, 0.08);
  });
}

function closeActiveModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function playTone(frequency, duration) {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!state.sound || !AudioEngine) return;

  const context = new AudioEngine();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.05, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + duration);
  oscillator.addEventListener("ended", () => context.close());
}

document.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  const action = actionButton.dataset.action;
  if (action === "play") showScreen("select");
  if (action === "home") {
    clearGameTimers();
    showScreen("welcome");
  }
  if (action === "start") startRace();
  if (action === "restart") startRace();
  if (action === "settings") openModal("settings");
  if (action === "help") openModal("help");
});

document.querySelectorAll(".character-pick").forEach((button) => {
  button.addEventListener("click", () => {
    choosePlane(Number(button.dataset.player), button.dataset.plane);
    playTone(660, 0.06);
  });
});

rollButton.addEventListener("click", rollDice);
closeModal.addEventListener("click", closeActiveModal);
modal.addEventListener("click", (event) => {
  if (event.target === modal) closeActiveModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeActiveModal();
  if ((event.key === " " || event.key === "Enter") && screens.race.classList.contains("is-active")) {
    event.preventDefault();
    rollDice();
  }
});

updateSelectionText();