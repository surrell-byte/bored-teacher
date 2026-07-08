import { STRINGS, NAMES, TILT_DIR, MIN_ROLL_TICKS, ROLL_TICK_MS } from "./constants.js";
import { initAudio, setMuted, isMuted, playTick, playSnip, playSplash } from "./audio.js";
import {
  ui,
  setStatus,
  setDieFace,
  updateTurnUI,
  setRollingVisual,
  setRollButtonState,
  setMuteIcon,
  cutString,
  tiltRig,
  updateHearts,
  showDrop,
  showModal,
  resetBoard
} from "./ui.js";

const tournament = {
  left: 0,
  right: 0,
  target: 3
};

const state = {
  current: "left",
  cut: { left: new Set(), right: new Set() },
  tilt: { left: 0, right: 0 },
  rolling: false,
  over: false,
  rollInterval: null,
  rollTicks: 0,
  leoPowerUsed: false,
  miaPowerUsed: false
};

function pickFace() {
  if (Math.random() < 0.1) {
    return "shield";
  }
  return 1 + Math.floor(Math.random() * 6);
}

function dramaticReveal(face) {
  const die = document.getElementById("die");
  setStatus("🎲 Stopping...");
  die.style.transform = "scale(1.5)";
  setTimeout(() => {
    setStatus(`🎯 ${face}!`);
    die.style.transform = "scale(1)";
    setTimeout(() => {
      finishRoll(face);
    }, 700);
  }, 700);
}

function sideForFace(face) {
  return face % 2 === 1 ? "left" : "right";
}

function afterAction() {
  state.rolling = false;
  if (state.over) return;
  state.current = state.current === "left" ? "right" : "left";
  updateTurnUI(state);
  ui.rollBtn.disabled = false;
  setStatus(`${NAMES[state.current]}'s turn — click Start to roll, then Stop whenever you dare!`);
}

function dropPlayer(side) {
  state.over = true;
  ui.rollBtn.disabled = true;

  showDrop(side, {
    onSplash: () => playSplash(),
    onModal: () => {
      const winner = side === "left" ? "right" : "left";

      tournament[winner]++;
      document.getElementById("leoScore").textContent = tournament.left;
      document.getElementById("miaScore").textContent = tournament.right;

      if (tournament[winner] >= tournament.target) {
        showModal(
          `${NAMES[winner]} wins the tournament! 🏆`,
          `Final score: ${tournament.left} - ${tournament.right}`
        );
      } else {
        showModal(
          `${NAMES[winner]} wins the round!`,
          `First to ${tournament.target} wins the tournament.`
        );
      }
    }
  });
}

function updateMood(side) {
  const lost = state.cut[side].size;
  const el = document.getElementById(side === "left" ? "leoMood" : "miaMood");
  if (lost === 0) el.textContent = "😎";
  else if (lost === 1) el.textContent = "😬";
  else if (lost === 2) el.textContent = "😱";
}

function finishRoll(face) {
  // Shield: no ropes cut
  if (face === "shield") {
    setDieFace(1);
    setRollingVisual(false);
    setStatus("🛡 Shield! No ropes cut.");
    setTimeout(afterAction, 1000);
    return;
  }

  setDieFace(face);
  setRollingVisual(false);

  const side = sideForFace(face);
  const name = NAMES[side];

  // Leo Power: Lucky Escape (one-time, 25% chance)
  if (side === "left" && !state.leoPowerUsed && Math.random() < 0.25) {
    state.leoPowerUsed = true;
    setStatus("🍀 Lucky Leo escaped the cut!");
    setTimeout(afterAction, 1200);
    return;
  }

  if (state.cut[side].has(face)) {
    setStatus(`Rolled a ${face} — that string's already gone. Safe roll for ${name}!`);
    setTimeout(afterAction, 500);
    return;
  }

  state.cut[side].add(face);
  cutString(face);
  updateHearts(side, state.cut[side].size);
  updateMood(side);

  state.tilt[side] += TILT_DIR[face] * 5;
  tiltRig(side, state.tilt[side]);

  playSnip();
  setStatus(`Rolled a ${face} — snip! ${name} loses a string.`);

  // Mia Power: Double Trouble (one-time, 25% chance) — cuts an extra Leo rope
  if (side === "right" && !state.miaPowerUsed && Math.random() < 0.25) {
    state.miaPowerUsed = true;
    setStatus("⚡ Mia activates Double Trouble!");
    setTimeout(() => {
      const extra = STRINGS.left.find(n => !state.cut.left.has(n));
      if (extra) {
        state.cut.left.add(extra);
        cutString("left", extra);
        updateHearts("left", state.cut.left.size);
        updateMood("left");
        tiltRig("left", extra);
      }
    }, 800);
  }

  const remaining = STRINGS[side].length - state.cut[side].size;
  if (remaining <= 0) {
    setStatus(`${name}'s last string just snapped...`);
    setTimeout(() => dropPlayer(side), 550);
  } else {
    setTimeout(afterAction, 650);
  }
}

function startRoll() {
  if (state.rolling || state.over) return;
  initAudio();
  state.rolling = true;
  state.rollTicks = 0;

  setRollingVisual(true);
  setRollButtonState({ holding: true });
  setStatus(`Rolling for ${NAMES[state.current]}... tap Stop whenever you're ready!`);

  state.rollInterval = setInterval(() => {
    setDieFace(pickFace());
    playTick();
    state.rollTicks++;
  }, ROLL_TICK_MS);
}

function stopRoll() {
  if (!state.rolling) return;
  if (state.rollTicks < MIN_ROLL_TICKS) {
    setStatus("Hold on, let it spin a moment longer!");
    return;
  }
  clearInterval(state.rollInterval);
  state.rollInterval = null;
  state.rolling = false;
  setRollButtonState({ holding: false, disabled: true });

  dramaticReveal(pickFace());
}

function toggleRoll() {
  if (state.over) return;
  state.rolling ? stopRoll() : startRoll();
}

function restart() {
  if (state.rollInterval) {
    clearInterval(state.rollInterval);
    state.rollInterval = null;
  }
  state.current = "left";
  state.cut.left.clear();
  state.cut.right.clear();
  state.tilt.left = 0;
  state.tilt.right = 0;
  state.rolling = false;
  state.over = false;
  state.rollTicks = 0;
  state.leoPowerUsed = false;
  state.miaPowerUsed = false;

  // Reset tournament if someone reached the target
  if (tournament.left >= tournament.target || tournament.right >= tournament.target) {
    tournament.left = 0;
    tournament.right = 0;
    document.getElementById("leoScore").textContent = 0;
    document.getElementById("miaScore").textContent = 0;
  }

  // Reset moods
  document.getElementById("leoMood").textContent = "😎";
  document.getElementById("miaMood").textContent = "😎";

  resetBoard();
  setStatus("Leo's turn — click Start to roll, then Stop whenever you dare!");
  updateTurnUI(state);
}

function init() {
  setDieFace(1);
  updateTurnUI(state);

  ui.rollBtn.addEventListener("click", toggleRoll);
  ui.restartBtn.addEventListener("click", restart);
  ui.modalRestart.addEventListener("click", restart);
  ui.muteBtn.addEventListener("click", () => {
    setMuted(!isMuted());
    setMuteIcon(isMuted());
  });
}

init();
