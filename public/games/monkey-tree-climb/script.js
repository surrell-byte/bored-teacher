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

        showSlipMessage(`😱 Slip! Fell ${fallAmount} level${fallAmount>1?'s':''}!`);
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
    levelText.textContent = `Level: ${level} / ${maxLevel}`;

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
    confetti.style.cssText = `
        position: absolute;
        font-size: ${Math.random() * 30 + 20}px;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        z-index: 25;
        animation: confettiFall 2s ease-out forwards;
    `;
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