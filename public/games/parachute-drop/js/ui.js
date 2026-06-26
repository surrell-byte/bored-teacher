import { NAMES, FACE_PATTERNS } from "./constants.js";

// ---------- single source of truth for every DOM node we touch ----------
// Anything that needs an element on the page reads it from here instead of
// calling document.getElementById / querySelector directly. If a feature
// later needs a new element, add one line here rather than scattering
// lookups through game logic.
export const ui = {
  die: document.getElementById("die"),
  pips: Array.from(document.querySelectorAll(".pip")),
  rollBtn: document.getElementById("rollBtn"),
  muteBtn: document.getElementById("muteBtn"),
  restartBtn: document.getElementById("restartBtn"),
  status: document.getElementById("status"),
  cardLeft: document.getElementById("card-left"),
  cardRight: document.getElementById("card-right"),
  modal: document.getElementById("modal"),
  modalTitle: document.getElementById("modalTitle"),
  modalText: document.getElementById("modalText"),
  modalRestart: document.getElementById("modalRestart"),
  rigLeft: document.getElementById("rig-left"),
  rigRight: document.getElementById("rig-right"),
  sharkLeft: document.getElementById("sharkLeft"),
  sharkRight: document.getElementById("sharkRight"),
  splashLeft: document.getElementById("splash-left"),
  splashRight: document.getElementById("splash-right")
};

function rigFor(side) {
  return side === "left" ? ui.rigLeft : ui.rigRight;
}

function sharkFor(side) {
  return side === "left" ? ui.sharkLeft : ui.sharkRight;
}

function splashFor(side) {
  return side === "left" ? ui.splashLeft : ui.splashRight;
}

export function setStatus(text) {
  ui.status.textContent = text;
}

export function setDieFace(face) {
  const active = new Set(FACE_PATTERNS[face]);
  ui.pips.forEach((p, i) => p.classList.toggle("show", active.has(i)));
}

/** Highlights whichever player's turn it is and resets the roll button label. */
export function updateTurnUI(state) {
  ui.cardLeft.classList.toggle("active", state.current === "left" && !state.over);
  ui.cardRight.classList.toggle("active", state.current === "right" && !state.over);
  if (!state.rolling) {
    ui.rollBtn.textContent = `🎲 Start rolling for ${NAMES[state.current]}`;
    ui.rollBtn.classList.remove("holding");
  }
}

export function setRollingVisual(isRolling) {
  ui.die.classList.toggle("rolling", isRolling);
}

export function setRollButtonState({ holding, disabled }) {
  ui.rollBtn.classList.toggle("holding", !!holding);
  if (typeof disabled === "boolean") ui.rollBtn.disabled = disabled;
  ui.rollBtn.textContent = holding ? "✋ Stop the die!" : ui.rollBtn.textContent;
}

export function setMuteIcon(muted) {
  ui.muteBtn.textContent = muted ? "🔇" : "🔈";
}

/** Visually cuts a rope + badge for the given string number, with a snap animation. */
export function cutString(num) {
  document.getElementById("rope-" + num).classList.add("cut");
  const badge = document.getElementById("badge-" + num);
  badge.classList.add("cut");
  badge.style.animation = "ropeSnap .5s ease";
}

export function tiltRig(side, tiltDegrees) {
  rigFor(side).style.transform = `rotate(${tiltDegrees}deg)`;
}

export function updateHearts(side, lostCount) {
  const hearts = document.querySelectorAll(`#hearts-${side} .heart`);
  hearts.forEach((h, i) => h.classList.toggle("lost", i < lostCount));
}

/** Plays the falling/splash sequence for the losing side and reveals the modal. */
export function showDrop(side, { onSplash, onModal } = {}) {
  ui.cardLeft.classList.remove("active");
  ui.cardRight.classList.remove("active");

  const rig = rigFor(side);
  rig.style.transform = "";
  rig.classList.add("falling");

  setTimeout(() => {
    splashFor(side).classList.add("show");
    sharkFor(side).classList.add("lunge");
    if (onSplash) onSplash();
  }, 650);

  setTimeout(() => {
    if (onModal) onModal();
  }, 1500);
}

export function showModal(title, text) {
  ui.modalTitle.textContent = title;
  ui.modalText.textContent = text;
  ui.modal.hidden = false;
  ui.restartBtn.hidden = false;
}

export function resetBoard() {
  document.querySelectorAll(".rope").forEach(r => r.classList.remove("cut"));
  document.querySelectorAll(".badge").forEach(b => {
    b.classList.remove("cut");
    b.style.animation = "";
  });
  document.querySelectorAll(".heart").forEach(h => h.classList.remove("lost"));
  document.querySelectorAll(".shark").forEach(s => s.classList.remove("lunge"));
  document.querySelectorAll(".splash").forEach(s => s.classList.remove("show"));

  [ui.rigLeft, ui.rigRight].forEach(rig => {
    rig.classList.remove("falling");
    rig.style.transform = "";
  });

  setRollingVisual(false);
  ui.modal.hidden = true;
  ui.restartBtn.hidden = true;
  ui.rollBtn.disabled = false;
  ui.rollBtn.classList.remove("holding");
  setDieFace(1);
}
