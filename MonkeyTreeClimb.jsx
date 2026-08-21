import React, { useEffect, useRef } from 'react';

/**
 * MonkeyTreeClimb
 * Auto-converted from index.html + style.css + script.js into a
 * self-contained React component. Markup is injected via a ref, the
 * original CSS is scoped inside a <style> tag, and the original
 * script.js game logic runs unmodified inside a useEffect after mount.
 * Note: the <audio> elements reference assets/sounds/*.mp3 — if those
 * files aren't bundled alongside this component, playback fails silently
 * (the original script already wraps .play() in a .catch(() => {})).
 */
const MonkeyTreeClimb_HTML = `<div id="game">
    <!-- Sky decorations -->
    <div class="sun">☀️</div>
    <div class="cloud">☁️</div>
    <div class="cloud">☁️</div>

    <!-- Tree (pure CSS) -->
    <div class="trunk" id="trunk">
        <div class="progress-track">
            <div class="progress-fill" id="progressFill"></div>
        </div>
    </div>
    <div class="canopy"></div>

    <!-- Monkey & collectibles -->
    <div id="monkey">🐵</div>
    <div id="banana">🍌</div>
    <div id="topCrown">👑</div>

    <!-- UI -->
    <div class="ui">
        <h1>🐒 Tree Climb</h1>
        <div id="levelText">Level: 1</div>
        <div id="lives">❤️❤️❤️</div>
        <button id="climbButton" onclick="climb()">⬆️ Climb Up!</button>
        <div class="cooldown-indicator" id="cooldownText"></div>
        <div id="slipMessage"></div>
    </div>

    <!-- Win screen -->
    <div id="winScreen">
        <div id="crown">👑</div>
        <h2>YOU WIN!</h2>
        <p style="font-size:24px; margin-bottom:20px;">🐵 King of the tree!</p>
        <button onclick="restartGame()" style="background:#ff9800;">🔄 Play Again</button>
    </div>

    <!-- Sound effects (optional – add your own files in assets/sounds/) -->
    <audio id="climbSound" src="assets/sounds/climb.mp3" preload="auto"></audio>
    <audio id="slipSound" src="assets/sounds/slip.mp3" preload="auto"></audio>
    <audio id="winSound" src="assets/sounds/win.mp3" preload="auto"></audio>
</div>`;

const MonkeyTreeClimb_CSS = `* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    overflow: hidden;
    font-family: 'Arial', sans-serif;
    background: #87ceeb;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* 
   To replace the dynamic sky with your own image, 
   change the background property of #game to:
   background: url('assets/images/background.jpg') no-repeat center/cover;
*/
#game {
    position: relative;
    width: 100vw;
    max-width: 800px;
    height: 100vh;
    background: linear-gradient(180deg, #87ceeb 0%, #d4f1ff 70%, #8bc34a 100%);
    overflow: hidden;
    box-shadow: 0 0 30px rgba(0,0,0,0.3);
}

/* Sky decorations */
.sun {
    position: absolute;
    top: 30px;
    right: 50px;
    font-size: 70px;
    opacity: 0.9;
    animation: sunPulse 3s infinite;
}

.cloud {
    position: absolute;
    font-size: 80px;
    opacity: 0.7;
    animation: cloudDrift 20s linear infinite;
}
.cloud:nth-child(2) { top: 80px; left: 10%; animation-duration: 25s; }
.cloud:nth-child(3) { top: 150px; left: 60%; animation-duration: 30s; animation-delay: 5s; }

@keyframes sunPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}
@keyframes cloudDrift {
    0% { transform: translateX(0); }
    100% { transform: translateX(120vw); }
}

/* Tree */
.trunk {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 85%;
    background: linear-gradient(180deg, #8B5A2B 0%, #5C3A1E 100%);
    border-radius: 30px 30px 0 0;
    box-shadow: inset -10px 0 15px rgba(0,0,0,0.3), inset 5px 0 10px rgba(255,255,255,0.2);
    z-index: 2;
    transition: box-shadow 0.3s;
}

.trunk.winGlow {
    box-shadow:
        0 0 20px gold,
        0 0 40px orange,
        inset -10px 0 15px rgba(0,0,0,0.3);
}

.canopy {
    position: absolute;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    width: 250px;
    height: 200px;
    background: radial-gradient(circle at 30% 40%, #4caf50, #2e7d32);
    border-radius: 50%;
    filter: blur(2px);
    box-shadow: 0 0 40px rgba(0,100,0,0.3);
    z-index: 3;
}

.progress-track {
    position: absolute;
    bottom: 5%;
    left: 50%;
    transform: translateX(-50%);
    width: 20px;
    height: 78%;
    background: rgba(255,255,255,0.15);
    border-radius: 10px;
    z-index: 4;
    overflow: hidden;
}

.progress-fill {
    position: absolute;
    bottom: 0;
    width: 100%;
    background: #ffeb3b;
    height: 0%;
    transition: height 0.4s ease;
    border-radius: 10px;
    box-shadow: 0 0 10px #ffc107;
}

/* Monkey */
#monkey {
    position: absolute;
    font-size: 70px;
    left: 50%;
    transform: translateX(-50%);
    bottom: 5%;
    z-index: 5;
    animation: monkeyBounce 1.2s infinite;
    filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.3));
    transition: bottom 0.5s cubic-bezier(0.25, 0.1, 0.25, 1.5);
    will-change: transform, bottom;
}

@keyframes monkeyBounce {
    0% { transform: translateX(-50%) rotate(-5deg); }
    50% { transform: translateX(-50%) translateY(-12px) rotate(5deg); }
    100% { transform: translateX(-50%) rotate(-5deg); }
}

/* Banana */
#banana {
    position: absolute;
    font-size: 40px;
    left: 55%;
    bottom: 30%;
    z-index: 6;
    animation: bananaFloat 1.5s infinite ease-in-out;
}

@keyframes bananaFloat {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
}

/* Crown at top */
#topCrown {
    position: absolute;
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 60px;
    z-index: 10;
    animation: pulseCrown 1.2s infinite;
}

@keyframes pulseCrown {
    0%, 100% { transform: translateX(-50%) scale(1); }
    50% { transform: translateX(-50%) scale(1.15); }
}

/* UI */
.ui {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 10;
    background: rgba(255,255,255,0.85);
    backdrop-filter: blur(10px);
    padding: 20px;
    border-radius: 20px;
    box-shadow: 0 8px 25px rgba(0,0,0,0.25);
    text-align: center;
    min-width: 180px;
}

h1 {
    margin-bottom: 10px;
    color: #4e342e;
    font-size: 1.5rem;
}

#levelText {
    font-size: 28px;
    margin: 5px 0;
    font-weight: bold;
    color: #2e7d32;
}

#lives {
    font-size: 28px;
    margin: 5px 0;
    letter-spacing: 5px;
}

#slipMessage {
    font-size: 16px;
    color: #d32f2f;
    margin: 5px 0;
    min-height: 24px;
    font-weight: bold;
    opacity: 0;
    transition: opacity 0.2s;
}

button {
    padding: 14px 28px;
    border: none;
    border-radius: 30px;
    font-size: 20px;
    cursor: pointer;
    background: #4caf50;
    color: white;
    font-weight: bold;
    box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    transition: transform 0.1s, background 0.2s, box-shadow 0.2s;
    margin-top: 10px;
    touch-action: manipulation;
}

button:hover:not(:disabled) {
    transform: scale(1.05);
    background: #43a047;
    box-shadow: 0 6px 15px rgba(0,0,0,0.3);
}

button:active {
    transform: scale(0.92);
}

button:disabled {
    background: #9e9e9e;
    cursor: not-allowed;
    box-shadow: none;
}

.cooldown-indicator {
    font-size: 14px;
    margin-top: 5px;
    color: #555;
}

/* Win screen */
#winScreen {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.75);
    display: none;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    z-index: 20;
    color: white;
    text-align: center;
    backdrop-filter: blur(5px);
}

#winScreen h2 {
    font-size: 60px;
    margin-bottom: 20px;
    text-shadow: 0 0 20px gold;
}

#crown {
    font-size: 120px;
    animation: bounce 1s infinite;
}

@keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-20px); }
}

/* Confetti animation */
@keyframes confettiFall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

/* Responsive */
@media (max-width: 600px) {
    .ui {
        left: 10px;
        top: 10px;
        padding: 12px;
    }
    h1 { font-size: 1.2rem; }
    #levelText, #lives { font-size: 22px; }
    button { padding: 12px 20px; font-size: 18px; }
}`;

export default function MonkeyTreeClimb() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.text = `(function() {
// ---- Game state ----
let level = 1;
const maxLevel = 20;
let lives = 3;
let bananas = 0;
let isCooldown = false;
let cooldownTimer = null;

// ---- DOM elements ----
const monkey = document.getElementById("monkey");
const banana = document.getElementById("banana");
const trunk = document.getElementById("trunk");
const levelText = document.getElementById("levelText");
const livesDisplay = document.getElementById("lives");
const winScreen = document.getElementById("winScreen");
const climbButton = document.getElementById("climbButton");
const cooldownText = document.getElementById("cooldownText");
const slipMessage = document.getElementById("slipMessage");
const progressFill = document.getElementById("progressFill");

// Slip configuration
const baseSlipChance = 0.2;
const levelRiskFactor = 0.015;

// ---- Initial setup ----
updateAllVisuals();
moveBanana();

// ---- Climb function ----
function climb() {
    if (isCooldown || level >= maxLevel) return;

    // Cooldown
    isCooldown = true;
    climbButton.disabled = true;
    cooldownText.textContent = '⏳ Wait...';
    clearTimeout(cooldownTimer);
    cooldownTimer = setTimeout(() => {
        isCooldown = false;
        climbButton.disabled = false;
        cooldownText.textContent = '';
    }, 500);

    // Slip check
    let slipChance = baseSlipChance + (level - 1) * levelRiskFactor;
    if (Math.random() < slipChance) {
        const fallAmount = Math.floor(Math.random() * 3) + 1;
        level = Math.max(1, level - fallAmount);
        lives--;
        updateLives();

        showSlipMessage(\`😱 Slip! Fell \${fallAmount} level\${fallAmount>1?'s':''}!\`);
        playSound('slipSound');

        // Screen shake
        document.getElementById("game").animate([
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(0px)' }
        ], { duration: 400 });

        updateAllVisuals();

        if (lives <= 0) {
            gameOver();
            return;
        }

        moveBanana();
        return;
    }

    // Successful climb
    level++;
    playSound('climbSound');
    updateAllVisuals();
    slipMessage.style.opacity = '0';
    checkBananaCatch();

    if (level >= maxLevel) {
        setTimeout(() => {
            winScreen.style.display = 'flex';
            playSound('winSound');
            for (let i = 0; i < 50; i++) createConfetti();
        }, 700);
    }
}

// ---- Banana collectible ----
function moveBanana() {
    const randomHeight = Math.random() * 70 + 10;
    banana.style.bottom = randomHeight + "%";
}

function checkBananaCatch() {
    const monkeyBottom = parseFloat(monkey.style.bottom);
    const bananaBottom = parseFloat(banana.style.bottom);

    if (Math.abs(monkeyBottom - bananaBottom) < 6) {
        bananas++;
        banana.innerHTML = "✨";
        setTimeout(() => { banana.innerHTML = "🍌"; }, 300);
        moveBanana();

        // Extra life every 3 bananas (max lives 5)
        if (bananas % 3 === 0 && lives < 5) {
            lives++;
            updateLives();
            showSlipMessage('🍌 Extra life!');
        }
    }
}

// ---- Lives & game over ----
function updateLives() {
    let hearts = "";
    for (let i = 0; i < lives; i++) hearts += "❤️";
    livesDisplay.textContent = hearts || "💔";
}

function gameOver() {
    alert("GAME OVER! No more lives...");
    restartGame();
}

// ---- UI updates ----
function updateAllVisuals() {
    const bottomPercent = 5 + ((level - 1) / (maxLevel - 1)) * 80;
    monkey.style.bottom = bottomPercent + '%';
    levelText.textContent = \`Level: \${level} / \${maxLevel}\`;

    const progressHeight = ((level - 1) / (maxLevel - 1)) * 100;
    progressFill.style.height = progressHeight + '%';

    if (level >= 16) {
        trunk.classList.add("winGlow");
    } else {
        trunk.classList.remove("winGlow");
    }

    updateSky();
}

function showSlipMessage(msg) {
    slipMessage.textContent = msg;
    slipMessage.style.opacity = '1';
    setTimeout(() => { slipMessage.style.opacity = '0'; }, 1500);
}

// ---- Dynamic sky ----
function updateSky() {
    const game = document.getElementById("game");
    if (level < 7) {
        game.style.background = "linear-gradient(180deg, #87ceeb 0%, #d4f1ff 70%, #8bc34a 100%)";
    } else if (level < 14) {
        game.style.background = "linear-gradient(180deg, #5ec8ff 0%, #a8e6ff 70%, #8bc34a 100%)";
    } else {
        game.style.background = "linear-gradient(180deg, #ffb347 0%, #ffd27f 70%, #8bc34a 100%)";
    }
}

// ---- Sound helper ----
function playSound(id) {
    const sound = document.getElementById(id);
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(() => {}); // fail silently if file missing
    }
}

// ---- Confetti ----
function createConfetti() {
    const emojis = ['🎉', '🍌', '🌟', '🐒', '🎊'];
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    confetti.style.cssText = \`
        position: absolute;
        font-size: \${Math.random() * 30 + 20}px;
        left: \${Math.random() * 100}%;
        top: \${Math.random() * 100}%;
        z-index: 25;
        animation: confettiFall 2s ease-out forwards;
    \`;
    document.getElementById('game').appendChild(confetti);
    setTimeout(() => confetti.remove(), 2000);
}

// ---- Restart ----
function restartGame() {
    level = 1;
    lives = 3;
    bananas = 0;
    winScreen.style.display = 'none';
    document.querySelectorAll('.confetti').forEach(el => el.remove());
    slipMessage.textContent = '';
    slipMessage.style.opacity = '0';
    updateAllVisuals();
    updateLives();
    moveBanana();
    banana.innerHTML = "🍌";
    isCooldown = false;
    climbButton.disabled = false;
    cooldownText.textContent = '';
    clearTimeout(cooldownTimer);
}
})();`;
    container.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <>
      <style>{MonkeyTreeClimb_CSS}</style>
      <div
        ref={containerRef}
        className="monkeytreeclimb-root"
        dangerouslySetInnerHTML={{ __html: MonkeyTreeClimb_HTML }}
      />
    </>
  );
}
