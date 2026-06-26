(function() {
    // ============ GAME STATE ============
    const STARTING_MONEY = 10000;
    const GOAL_AMOUNT = 25000;
    const MIN_MONEY = 0;

    const gameState = {
        currentPlayer: 1,
        player1Money: STARTING_MONEY,
        player2Money: STARTING_MONEY,
        goalAmount: GOAL_AMOUNT,
        startingAmount: STARTING_MONEY,
        isGameOver: false,
        winner: null,
        round: 1,
        isAnimating: false,
        turnsInRound: 0,
    };

    // ============ SOUND MANAGER ============
    let audioCtx = null;
    let masterGain = null;
    let isSoundOn = true;
    const soundToggleBtn = document.getElementById('soundToggle');

    function initAudio() {
        if (audioCtx) return;
        try {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = audioCtx.createGain();
            masterGain.gain.value = 0.35;
            masterGain.connect(audioCtx.destination);
        } catch (e) {
            console.warn('Web Audio API not supported');
            isSoundOn = false;
            updateSoundButtonUI();
        }
    }

    function ensureAudio() {
        if (!audioCtx) initAudio();
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playSound(type) {
        if (!isSoundOn || !audioCtx || !masterGain) return;
        ensureAudio();
        const now = audioCtx.currentTime;
        switch (type) {
            case 'shake': playShake(now); break;
            case 'open': playOpen(now); break;
            case 'treasure': playTreasure(now); break;
            case 'lose': playLose(now); break;
            case 'empty': playEmpty(now); break;
            case 'win': playWinFanfare(now); break;
            case 'turn': playTurnClick(now); break;
        }
    }

    function playTone(freq, startTime, duration, type = 'sine', gainValue = 0.3, detune = 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        if (detune) osc.detune.value = detune;
        gain.gain.setValueAtTime(gainValue, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    function playShake(now) {
        for (let i = 0; i < 8; i++) {
            const t = now + i * 0.05;
            playTone(80 + Math.random() * 40, t, 0.03, 'square', 0.15);
        }
    }

    function playOpen(now) {
        playTone(200, now, 0.15, 'sine', 0.2);
        playTone(350, now + 0.05, 0.15, 'sine', 0.2);
        playTone(500, now + 0.1, 0.2, 'sine', 0.25);
    }

    function playTreasure(now) {
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
            playTone(freq, now + i * 0.12, 0.2, 'triangle', 0.25);
        });
    }

    function playLose(now) {
        const notes = [400, 350, 300, 220];
        notes.forEach((freq, i) => {
            playTone(freq, now + i * 0.15, 0.2, 'sawtooth', 0.15);
        });
    }

    function playEmpty(now) {
        playTone(150, now, 0.25, 'triangle', 0.15);
        playTone(120, now + 0.1, 0.3, 'triangle', 0.1);
    }

    function playTurnClick(now) {
        playTone(800, now, 0.05, 'sine', 0.2);
        playTone(1000, now + 0.05, 0.05, 'sine', 0.2);
    }

    function playWinFanfare(now) {
        const melody = [
            [523.25, 0.15], [659.25, 0.15], [783.99, 0.15], [1046.5, 0.3],
            [783.99, 0.15], [1046.5, 0.6]
        ];
        let timeOffset = 0;
        melody.forEach(([freq, dur]) => {
            playTone(freq, now + timeOffset, dur, 'triangle', 0.3);
            timeOffset += dur;
        });
        [523.25, 659.25, 783.99].forEach(freq => {
            playTone(freq, now + 0.9, 0.5, 'triangle', 0.2);
        });
    }

    function updateSoundButtonUI() {
        if (isSoundOn) {
            soundToggleBtn.textContent = '🔊';
            soundToggleBtn.classList.remove('muted');
        } else {
            soundToggleBtn.textContent = '🔇';
            soundToggleBtn.classList.add('muted');
        }
    }

    soundToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        ensureAudio();
        isSoundOn = !isSoundOn;
        updateSoundButtonUI();
        if (isSoundOn) playSound('turn');
    });

    // ============ DOM REFERENCES ============
    const player1Panel = document.getElementById('player1Panel');
    const player2Panel = document.getElementById('player2Panel');
    const player1MoneyEl = document.getElementById('player1Money');
    const player2MoneyEl = document.getElementById('player2Money');
    const player1Progress = document.getElementById('player1Progress');
    const player2Progress = document.getElementById('player2Progress');
    const roundIndicator = document.getElementById('roundIndicator');
    const gameLog = document.getElementById('gameLog');
    const resultNotification = document.getElementById('resultNotification');
    const resultIcon = document.getElementById('resultIcon');
    const resultText = document.getElementById('resultText');
    const resultAmount = document.getElementById('resultAmount');
    const allChestWrappers = document.querySelectorAll('.chest-wrapper');
    let notificationTimeout = null;

    // ============ INITIALIZATION ============
    function init() {
        updateAllDisplays();
        updateTurnIndicators();
        createDustParticles();
        updateSoundButtonUI();
        document.addEventListener('click', function audioInit() {
            ensureAudio();
        }, { once: true });
    }

    function createDustParticles() {
        const container = document.getElementById('particlesContainer');
        container.innerHTML = '';
        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.classList.add('dust-particle');
            const size = Math.random() * 3 + 1.5;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = Math.random() * 8 + 8 + 's';
            particle.style.animationDelay = Math.random() * 10 + 's';
            container.appendChild(particle);
        }
    }

    // ============ CHEST OPENING LOGIC ============
    window.openChest = function(chestIndex, wrapperElement) {
        if (gameState.isGameOver || gameState.isAnimating || wrapperElement.classList.contains('disabled')) return;

        ensureAudio();
        gameState.isAnimating = true;
        disableAllChests();

        const chestContainer = document.getElementById('chestContainer' + chestIndex);
        const chestLid = document.getElementById('chestLid' + chestIndex);

        chestContainer.classList.add('shaking');
        playSound('shake');

        setTimeout(() => {
            chestContainer.classList.remove('shaking');
            chestContainer.classList.add('revealing');
            chestLid.classList.add('open');
            playSound('open');
        }, 400);

        setTimeout(() => {
            const outcome = getRandomOutcome();
            revealResult(outcome, chestIndex, chestContainer, chestLid);
        }, 900);
    };

    function getRandomOutcome() {
        const roll = Math.random() * 100;
        if (roll < 40) {
            let amount = Math.floor(Math.random() * 3500) + 800;
            if (Math.random() < 0.05) {
                amount = Math.floor(Math.random() * 5000) + 5000;
                return {
                    type: 'treasure', subType: 'jackpot', amount,
                    messages: ['💎 JACKPOT! A legendary hoard!', '🌟 INCREDIBLE! Mountains of gold!', '👑 ROYAL TREASURE! Unbelievable riches!']
                };
            }
            return {
                type: 'treasure', subType: 'normal', amount,
                messages: ['💰 You found a stash of gold coins!', '✨ Sparkling gems fill the chest!', '🏆 A worthy treasure indeed!', '💎 Precious jewels glimmer inside!', '🪙 The chest is brimming with coins!']
            };
        } else if (roll < 70) {
            const loss = Math.floor(Math.random() * 2000) + 400;
            return {
                type: 'lose', amount: loss,
                messages: ['💨 A trap! Poison gas erupts!', '🐍 Snakes! You drop gold fleeing!', '💀 The chest was cursed! Gold turns to dust!', '😱 Bandits stole from the chest!', '🕳️ A false bottom! Gold falls through!', '⚡ A magical ward zaps your coins!']
            };
        } else {
            return {
                type: 'empty', amount: 0,
                messages: ['🫗 The chest is empty... just dust.', '🕸️ Nothing but cobwebs inside.', '🤷‍♂️ No treasure here. Better luck next time!', '📭 Completely barren. How disappointing.', '💨 A faint breeze... and nothing else.']
            };
        }
    }

    function revealResult(outcome, chestIndex, chestContainer, chestLid) {
        const message = outcome.messages[Math.floor(Math.random() * outcome.messages.length)];
        const playerKey = gameState.currentPlayer === 1 ? 'player1Money' : 'player2Money';
        const moneyEl = gameState.currentPlayer === 1 ? player1MoneyEl : player2MoneyEl;
        const oldMoney = gameState[playerKey];
        let newMoney = oldMoney;

        if (outcome.type === 'treasure') {
            newMoney = oldMoney + outcome.amount;
            playSound('treasure');
        } else if (outcome.type === 'lose') {
            newMoney = Math.max(MIN_MONEY, oldMoney - outcome.amount);
            playSound('lose');
        } else {
            playSound('empty');
        }

        gameState[playerKey] = newMoney;
        showResultNotification(outcome, message);

        if (outcome.type === 'treasure' && outcome.amount > 0) {
            moneyEl.classList.add('flash-positive');
            setTimeout(() => moneyEl.classList.remove('flash-positive'), 600);
        } else if (outcome.type === 'lose' && (oldMoney - newMoney) > 0) {
            moneyEl.classList.add('flash-negative');
            setTimeout(() => moneyEl.classList.remove('flash-negative'), 600);
        }

        animateMoneyValue(moneyEl, oldMoney, newMoney);
        updateAllDisplays();
        addLogEntry(outcome, message, gameState.currentPlayer);

        setTimeout(() => {
            chestContainer.classList.remove('revealing');
            chestLid.classList.remove('open');
        }, 600);

        if (newMoney >= GOAL_AMOUNT) {
            gameState.isGameOver = true;
            gameState.winner = gameState.currentPlayer;
            setTimeout(() => celebrateWin(gameState.currentPlayer), 800);
        } else {
            setTimeout(() => {
                switchTurn();
                gameState.isAnimating = false;
                updateChestAccessibility();
            }, 700);
        }
    }

    function showResultNotification(outcome, message) {
        if (notificationTimeout) clearTimeout(notificationTimeout);
        const notification = resultNotification;
        notification.className = 'result-notification';
        if (outcome.type === 'treasure') {
            notification.classList.add('result-positive');
            resultIcon.textContent = outcome.subType === 'jackpot' ? '💎' : '💰';
            resultText.textContent = message;
            resultAmount.textContent = '+' + outcome.amount.toLocaleString();
            resultAmount.style.color = '#2ecc71';
        } else if (outcome.type === 'lose') {
            notification.classList.add('result-negative');
            resultIcon.textContent = '💀';
            resultText.textContent = message;
            resultAmount.textContent = '-' + outcome.amount.toLocaleString();
            resultAmount.style.color = '#e74c3c';
        } else {
            notification.classList.add('result-neutral');
            resultIcon.textContent = '🫗';
            resultText.textContent = message;
            resultAmount.textContent = '$0';
            resultAmount.style.color = '#a09080';
        }
        setTimeout(() => notification.classList.add('show'), 50);
        notificationTimeout = setTimeout(() => notification.classList.remove('show'), 2000);
    }

    function animateMoneyValue(element, startValue, endValue) {
        const duration = 500;
        const startTime = performance.now();
        function update(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = Math.round(startValue + (endValue - startValue) * eased);
            element.textContent = '$' + val.toLocaleString();
            if (progress < 1) requestAnimationFrame(update);
            else element.textContent = '$' + endValue.toLocaleString();
        }
        requestAnimationFrame(update);
    }

    function addLogEntry(outcome, message, playerNum) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        let amountHtml = '';
        if (outcome.type === 'treasure') amountHtml = `<span class="highlight-gold">+$${outcome.amount.toLocaleString()}</span>`;
        else if (outcome.type === 'lose') amountHtml = `<span class="highlight-danger">-$${outcome.amount.toLocaleString()}</span>`;
        else amountHtml = '<span class="highlight-neutral">$0</span>';
        entry.innerHTML = `<strong>P${playerNum}</strong> ${message} ${amountHtml}`;
        gameLog.appendChild(entry);
        gameLog.scrollTop = gameLog.scrollHeight;
        while (gameLog.children.length > 30) gameLog.removeChild(gameLog.firstChild);
    }

    function switchTurn() {
        gameState.turnsInRound++;
        if (gameState.turnsInRound >= 2) {
            gameState.round++;
            gameState.turnsInRound = 0;
        }
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateTurnIndicators();
        updateRoundIndicator();
        playSound('turn');
        const turnLog = document.createElement('div');
        turnLog.className = 'log-entry';
        turnLog.innerHTML = `<span style="color:#f7d774;">⚔️ <strong>Player ${gameState.currentPlayer}</strong> — it's your turn! Choose a treasure chest.</span>`;
        gameLog.appendChild(turnLog);
        gameLog.scrollTop = gameLog.scrollHeight;
    }

    function updateTurnIndicators() {
        if (gameState.isGameOver) {
            player1Panel.classList.remove('active-player');
            player2Panel.classList.remove('active-player');
            return;
        }
        player1Panel.classList.toggle('active-player', gameState.currentPlayer === 1);
        player2Panel.classList.toggle('active-player', gameState.currentPlayer === 2);
    }

    function updateRoundIndicator() {
        if (gameState.isGameOver && gameState.winner) {
            roundIndicator.textContent = `🏆 Player ${gameState.winner} Wins! 🏆`;
            roundIndicator.style.color = '#ffd700';
            roundIndicator.style.borderColor = 'rgba(255,215,0,0.7)';
            roundIndicator.style.background = 'rgba(255,215,0,0.1)';
        } else {
            roundIndicator.textContent = `⚔️ Round ${gameState.round} — Player ${gameState.currentPlayer}'s Turn`;
            roundIndicator.style.color = '#c8a860';
            roundIndicator.style.borderColor = 'rgba(200,160,80,0.3)';
            roundIndicator.style.background = 'rgba(255,255,255,0.05)';
        }
    }

    function updateChestAccessibility() {
        if (gameState.isGameOver) disableAllChests();
        else enableAllChests();
    }

    function disableAllChests() {
        allChestWrappers.forEach(w => w.classList.add('disabled'));
    }

    function enableAllChests() {
        if (!gameState.isGameOver) {
            allChestWrappers.forEach(w => w.classList.remove('disabled'));
        }
    }

    function updateAllDisplays() {
        player1MoneyEl.textContent = '$' + gameState.player1Money.toLocaleString();
        player2MoneyEl.textContent = '$' + gameState.player2Money.toLocaleString();
        const p1 = Math.min(100, (gameState.player1Money / GOAL_AMOUNT) * 100);
        const p2 = Math.min(100, (gameState.player2Money / GOAL_AMOUNT) * 100);
        player1Progress.style.width = p1 + '%';
        player2Progress.style.width = p2 + '%';
        if (p1 >= 85) {
            player1Progress.style.background = 'linear-gradient(90deg, #e74c3c, #f39c12, #ffd700)';
            player1Progress.style.boxShadow = '0 0 20px rgba(255,200,40,0.8)';
        }
        if (p2 >= 85) {
            player2Progress.style.background = 'linear-gradient(90deg, #e74c3c, #f39c12, #ffd700)';
            player2Progress.style.boxShadow = '0 0 20px rgba(255,200,40,0.8)';
        }
        updateRoundIndicator();
    }

    function celebrateWin(playerNum) {
        updateAllDisplays();
        updateTurnIndicators();
        updateRoundIndicator();
        disableAllChests();
        playSound('win');
        const winnerPanel = playerNum === 1 ? player1Panel : player2Panel;
        winnerPanel.classList.add('winner-panel');
        spawnConfetti();
        const winLog = document.createElement('div');
        winLog.className = 'log-entry';
        winLog.innerHTML = `<span style="color:#ffd700;font-size:1.1em;">🏆🎉 <strong>PLAYER ${playerNum} WINS!</strong> Reached $25,000! Incredible fortune! 🎉🏆</span>`;
        gameLog.appendChild(winLog);
        gameLog.scrollTop = gameLog.scrollHeight;
        setTimeout(() => winnerPanel.classList.remove('winner-panel'), 8000);
    }

    function spawnConfetti() {
        const colors = [
            '#ffd700', '#ff6b6b', '#4ecdc4', '#f39c12', '#2ecc71',
            '#e74c3c', '#9b59b6', '#3498db', '#f7d774', '#ff9ff3',
            '#54a0ff', '#5f27cd', '#01a3a4', '#feca57', '#ff6348'
        ];
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < 150; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = Math.random() * 100 + '%';
            piece.style.top = -(Math.random() * 30 + 5) + 'px';
            piece.style.width = (Math.random() * 10 + 5) + 'px';
            piece.style.height = (Math.random() * 10 + 5) + 'px';
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
            piece.style.animationDuration = (Math.random() * 2 + 2.5) + 's';
            piece.style.animationDelay = Math.random() * 1.5 + 's';
            fragment.appendChild(piece);
        }
        document.body.appendChild(fragment);
        setTimeout(() => {
            document.querySelectorAll('.confetti-piece').forEach(c => c.remove());
        }, 4500);
    }

    window.resetGame = function() {
        if (notificationTimeout) clearTimeout(notificationTimeout);
        resultNotification.classList.remove('show');
        gameState.currentPlayer = 1;
        gameState.player1Money = STARTING_MONEY;
        gameState.player2Money = STARTING_MONEY;
        gameState.isGameOver = false;
        gameState.winner = null;
        gameState.round = 1;
        gameState.isAnimating = false;
        gameState.turnsInRound = 0;

        player1Panel.classList.remove('active-player', 'winner-panel');
        player2Panel.classList.remove('active-player', 'winner-panel');
        player1Panel.classList.add('active-player');

        player1Progress.style.background = '';
        player1Progress.style.boxShadow = '';
        player2Progress.style.background = '';
        player2Progress.style.boxShadow = '';

        for (let i = 0; i < 3; i++) {
            const lid = document.getElementById('chestLid' + i);
            const cont = document.getElementById('chestContainer' + i);
            if (lid) lid.classList.remove('open');
            if (cont) cont.classList.remove('revealing', 'shaking');
        }

        gameLog.innerHTML = '';
        const initLog = document.createElement('div');
        initLog.className = 'log-entry';
        initLog.style.color = '#8a7a60';
        initLog.innerHTML = '📜 The adventure begins... Both players start with <span class="highlight-gold">$10,000</span>. First to <span class="highlight-gold">$25,000</span> wins!';
        gameLog.appendChild(initLog);
        const turnLog = document.createElement('div');
        turnLog.className = 'log-entry';
        turnLog.style.color = '#f7d774';
        turnLog.innerHTML = '⚔️ <strong>Player 1</strong> — it\'s your turn! Choose a treasure chest.';
        gameLog.appendChild(turnLog);

        updateAllDisplays();
        updateTurnIndicators();
        updateRoundIndicator();
        enableAllChests();
        document.querySelectorAll('.confetti-piece').forEach(c => c.remove());
        roundIndicator.style.color = '#c8a860';
        roundIndicator.style.borderColor = 'rgba(200,160,80,0.3)';
        roundIndicator.style.background = 'rgba(255,255,255,0.05)';
    };

    init();
    enableAllChests();
})();