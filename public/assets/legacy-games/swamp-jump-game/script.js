/* =========================================================
   FROGGY HOP — FIXED & IMPROVED
========================================================= */

(function () {

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    /* =========================================================
       DOM
    ========================================================= */

    const scoreEl      = document.getElementById("score");
    const bestScoreEl  = document.getElementById("bestScore");
    const scoreBox     = document.getElementById("scoreBox");
    const hintText     = document.getElementById("hintText");

    /* =========================================================
       GAME CONSTANTS
    ========================================================= */

    const WIDTH  = 480;
    const HEIGHT = 640;

    const GROUND_Y = 510;
    const FROG_X   = 130;

    const GRAVITY       = 0.55;
    const JUMP_FORCE    = -11;

    const LOG_SPEED_INITIAL = 4;
    const LOG_SPEED_MAX     = 11;

    /* =========================================================
       FIX: lazy AudioContext — browsers block audio created
       before a user gesture, so we init on first interaction.
    ========================================================= */

    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (
                window.AudioContext ||
                window.webkitAudioContext
            )();
        }
        return audioCtx;
    }

    function beep(freq, duration, type = "sine", volume = 0.03) {

        const ctx_ = getAudioCtx();

        const osc  = ctx_.createOscillator();
        const gain = ctx_.createGain();

        osc.connect(gain);
        gain.connect(ctx_.destination);

        osc.type           = type;
        osc.frequency.value = freq;
        gain.gain.value     = volume;

        osc.start();

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            ctx_.currentTime + duration
        );

        osc.stop(ctx_.currentTime + duration);
    }

    function playJumpSound()  { beep(400, 0.08, "square"); }
    function playScoreSound() { beep(700, 0.08); beep(900, 0.12); }
    function playDeathSound() { beep(120, 0.5, "sawtooth"); }

    /* =========================================================
       GAME STATE
    ========================================================= */

    let frogY        = GROUND_Y;
    let frogVelocity = 0;

    let score     = 0;
    let bestScore = 0;

    let combo = 0;

    let isGameOver    = false;
    let isGameStarted = false;
    let paused        = false;

    let logs        = [];
    let particles   = [];
    let ripples     = [];
    let leaves      = [];
    let fogLayers   = [];
    let scorePopups = [];

    let frameCount = 0;
    let logSpeed   = LOG_SPEED_INITIAL;
    let nextSpawn  = 60;

    /* =========================================================
       CAMERA
    ========================================================= */

    let cameraOffsetY = 0;
    let cameraDrift   = 0;
    let cameraZoom    = 1;
    let screenShake   = 0;

    /* =========================================================
       TIME SCALE
    ========================================================= */

    let timeScale = 1;

    /* =========================================================
       WEATHER
    ========================================================= */

    let rain         = false;
    let thunderFlash = 0;

    /* =========================================================
       NEAR MISS
    ========================================================= */

    let nearMissFlash = 0;

    /* =========================================================
       HELPERS
    ========================================================= */

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function randInt(min, max) {
        return Math.floor(rand(min, max + 1));
    }

    /* =========================================================
       PARTICLES
    ========================================================= */

    function spawnParticles(x, y, count, color, spread = 4) {

        for (let i = 0; i < count; i++) {
            particles.push({
                x, y,
                vx:    rand(-spread, spread),
                vy:    rand(-spread, spread),
                size:  rand(2, 6),
                life:  rand(20, 40),
                color
            });
        }
    }

    function updateParticles() {

        for (let i = particles.length - 1; i >= 0; i--) {

            const p = particles[i];

            p.x  += p.vx * timeScale;
            p.y  += p.vy * timeScale;
            p.vy += 0.15 * timeScale;
            p.life--;

            if (p.life <= 0) particles.splice(i, 1);
        }
    }

    function drawParticles() {

        for (const p of particles) {

            ctx.globalAlpha = p.life / 40;
            ctx.fillStyle   = p.color;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
    }

    /* =========================================================
       RIPPLE
    ========================================================= */

    function spawnRipple(x, y) {
        ripples.push({ x, y, radius: 5, alpha: 1 });
    }

    function updateRipples() {

        for (let i = ripples.length - 1; i >= 0; i--) {

            const r = ripples[i];

            r.radius += 1.4;
            r.alpha  -= 0.03;

            if (r.alpha <= 0) ripples.splice(i, 1);
        }
    }

    function drawRipples() {

        for (const r of ripples) {

            ctx.strokeStyle = `rgba(200,255,255,${r.alpha})`;
            ctx.lineWidth   = 2;

            ctx.beginPath();
            ctx.ellipse(r.x, r.y, r.radius, r.radius * 0.4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    /* =========================================================
       FOREGROUND LEAVES
    ========================================================= */

    function spawnLeaf() {

        leaves.push({
            x:        WIDTH + 20,
            y:        rand(100, HEIGHT - 80),
            speed:    rand(2, 5),
            rotation: rand(0, Math.PI * 2),
            size:     rand(8, 18)
        });
    }

    function updateLeaves() {

        if (Math.random() < 0.03) spawnLeaf();

        for (let i = leaves.length - 1; i >= 0; i--) {

            const l = leaves[i];

            l.x        -= l.speed + logSpeed * 0.2;
            l.rotation += 0.03;

            if (l.x < -50) leaves.splice(i, 1);
        }
    }

    function drawLeaves() {

        for (const l of leaves) {

            ctx.save();
            ctx.translate(l.x, l.y);
            ctx.rotate(l.rotation);
            ctx.fillStyle = "#78b04c";

            ctx.beginPath();
            ctx.ellipse(0, 0, l.size, l.size * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    /* =========================================================
       FOG
    ========================================================= */

    for (let i = 0; i < 3; i++) {
        fogLayers.push({
            x:     i * 200,
            speed: rand(0.2, 0.5)
        });
    }

    function updateFog() {

        for (const f of fogLayers) {

            f.x -= f.speed;

            if (f.x < -250) f.x = WIDTH;
        }
    }

    function drawFog() {

        for (const f of fogLayers) {

            ctx.fillStyle = "rgba(255,255,255,0.04)";
            ctx.fillRect(f.x, 0, 240, HEIGHT);
        }
    }

    /* =========================================================
       LOG CLASS
    ========================================================= */

    class Log {

        constructor() {

            this.type =
                Math.random() < 0.15
                    ? "giant"
                    : Math.random() < 0.2
                        ? "tiny"
                        : "normal";

            this.width =
                this.type === "giant" ? 100
                : this.type === "tiny" ? 40
                : 65;

            this.height = 28;
            this.x      = WIDTH + 40;
            this.y      = rand(260, GROUND_Y - 20);

            this.speed =
                this.type === "tiny"
                    ? logSpeed + 2
                    : logSpeed;

            this.bounce     = Math.random() < 0.15;
            this.phase      = rand(0, Math.PI * 2);
            this.passed     = false;
            this.nearMissed = false;
        }

        update() {

            this.x -= this.speed * timeScale;

            if (this.bounce) {
                this.y += Math.sin(frameCount * 0.08 + this.phase) * 0.8;
            }
        }

        draw() {

            ctx.fillStyle =
                this.type === "giant" ? "#7a4c22" : "#9b6234";

            ctx.beginPath();
            ctx.roundRect(this.x, this.y, this.width, this.height, 10);
            ctx.fill();
        }
    }

    /* =========================================================
       SPAWN LOG
    ========================================================= */

    function spawnLog() {

        logs.push(new Log());

        if (Math.random() < 0.2) {
            logs.push(new Log());
            logs[logs.length - 1].x += 120;
        }
    }

    /* =========================================================
       DAY / NIGHT CYCLE
       FIX: rain flag removed from here — moved to update()
       so we never mutate state inside a draw function.
    ========================================================= */

    function getSkyGradient() {

        const g = ctx.createLinearGradient(0, 0, 0, HEIGHT);

        if (score < 10) {
            g.addColorStop(0, "#ffb36b");
            g.addColorStop(1, "#355b5f");

        } else if (score < 20) {
            g.addColorStop(0, "#553377");
            g.addColorStop(1, "#1d3248");

        } else if (score < 30) {
            g.addColorStop(0, "#111827");
            g.addColorStop(1, "#06111f");

        } else {
            g.addColorStop(0, "#050505");
            g.addColorStop(1, "#0b0f15");
        }

        return g;
    }

    /* =========================================================
       COLLISION
    ========================================================= */

    function checkCollisions() {

        const frog = {
            x: FROG_X - 18,
            y: frogY  - 16,
            w: 36,
            h: 32
        };

        for (const log of logs) {

            const hit =
                frog.x < log.x + log.width  &&
                frog.x + frog.w > log.x      &&
                frog.y < log.y + log.height  &&
                frog.y + frog.h > log.y;

            if (hit) {
                triggerDeath();
                return;
            }

            /* =====================================
               NEAR MISS SYSTEM
            ===================================== */

            const distance = Math.abs((frog.y + frog.h) - log.y);

            if (
                distance < 12        &&
                !log.nearMissed      &&
                log.x < FROG_X + 30  &&
                log.x > FROG_X - 40
            ) {
                log.nearMissed = true;

                combo++;
                score += combo;

                /* FIX: update score display on near-miss (was missing) */
                scoreEl.textContent = score;
                scoreBox.classList.add("pop");
                setTimeout(() => scoreBox.classList.remove("pop"), 150);

                nearMissFlash = 1;

                playScoreSound();

                spawnParticles(FROG_X, frogY, 18, "#ffffff");

                scorePopups.push({
                    x:    FROG_X,
                    y:    frogY - 40,
                    text: `CLOSE CALL x${combo}`,
                    life: 60
                });
            }
        }
    }

    /* =========================================================
       DEATH
    ========================================================= */

    function triggerDeath() {

        if (isGameOver) return;

        isGameOver  = true;
        screenShake = 30;

        playDeathSound();

        /* Slow motion on death */
        timeScale = 0.2;
        setTimeout(() => { timeScale = 1; }, 450);

        spawnParticles(FROG_X, frogY, 60, "#ff8844", 8);

        if (score > bestScore) {

            bestScore = score;

            localStorage.setItem("froggyBest", bestScore);

            bestScoreEl.textContent = bestScore;
        }

        hintText.textContent = "💀 GAME OVER — CLICK TO RETRY";
    }

    /* =========================================================
       JUMP
    ========================================================= */

    function jump() {

        if (isGameOver) {
            resetGame();
            return;
        }

        if (paused) return;

        isGameStarted = true;

        frogVelocity = JUMP_FORCE;

        playJumpSound();

        spawnRipple(FROG_X, GROUND_Y + 15);
        spawnParticles(FROG_X, GROUND_Y, 10, "#8fd0ff");
    }

    /* =========================================================
       RESET
    ========================================================= */

    function resetGame() {

        frogY        = GROUND_Y;
        frogVelocity = 0;

        logs        = [];
        particles   = [];
        ripples     = [];
        scorePopups = []; /* FIX: clear lingering popups from last game */

        score = 0;
        combo = 0;

        /* FIX: reset score display immediately on restart */
        scoreEl.textContent = 0;

        isGameOver    = false;
        isGameStarted = false;

        logSpeed      = LOG_SPEED_INITIAL;
        nearMissFlash = 0;
        rain          = false;

        hintText.textContent = "🐸 TAP OR PRESS SPACE";
    }

    /* =========================================================
       UPDATE
    ========================================================= */

    function update() {

        frameCount++;

        /* =====================================
           CAMERA
        ===================================== */

        cameraOffsetY +=
            ((frogVelocity * -0.4) - cameraOffsetY) * 0.08;

        cameraDrift = Math.sin(frameCount * 0.01) * 5;

        cameraZoom += (1.02 - cameraZoom) * 0.02;

        /* =====================================
           SCREEN SHAKE
        ===================================== */

        screenShake *= 0.9;

        /* =====================================
           WEATHER
           FIX: rain state set here in update,
           not inside getSkyGradient (draw func).
        ===================================== */

        if (score >= 30 && !rain) rain = true;

        if (rain && Math.random() < 0.002) {
            thunderFlash = 1;
            beep(50, 1, "sawtooth", 0.04);
        }

        thunderFlash *= 0.95;

        /* =====================================
           FROG PHYSICS
        ===================================== */

        if (isGameStarted && !paused && !isGameOver) {

            frogVelocity += GRAVITY * timeScale;
            frogY        += frogVelocity * timeScale;

            if (frogY >= GROUND_Y) {

                /* FIX: raised threshold from 7 to 14.
                   Old value triggered death on almost every
                   full-height jump (landing velocity ~11). */
                if (frogVelocity > 14) {
                    triggerDeath();
                }

                /* FIX: reset combo when frog lands safely —
                   previously combo grew unbounded. */
                combo = 0;

                frogY        = GROUND_Y;
                frogVelocity = 0;
            }
        }

        /* =====================================
           LOG SPAWN
        ===================================== */

        if (frameCount >= nextSpawn && !isGameOver && isGameStarted) {

            spawnLog();

            nextSpawn = frameCount + randInt(80, 120);
        }

        /* =====================================
           UPDATE LOGS
        ===================================== */

        for (const log of logs) {

            log.update();

            if (!log.passed && log.x + log.width < FROG_X) {

                log.passed = true;

                combo++;
                score += combo;

                scoreEl.textContent = score;

                scoreBox.classList.add("pop");
                setTimeout(() => scoreBox.classList.remove("pop"), 150);

                playScoreSound();

                spawnParticles(FROG_X, frogY, 10, "#99ff99");

                logSpeed = Math.min(LOG_SPEED_MAX, logSpeed + 0.12);
            }
        }

        logs = logs.filter(l => l.x > -200);

        /* =====================================
           FIX: guard all secondary updates
           behind !paused so they freeze properly
           when the game is paused.
        ===================================== */

        if (!paused) {
            updateParticles();
            updateRipples();
            updateLeaves();
            updateFog();
        }

        checkCollisions();

        nearMissFlash *= 0.9;
    }

    /* =========================================================
       DRAW FROG
    ========================================================= */

    function drawFrog() {

        ctx.save();
        ctx.translate(FROG_X, frogY);

        /* Breathing */
        const breath = Math.sin(frameCount * 0.08) * 0.03;

        /* Squash & stretch */
        let sx = 1;
        let sy = 1;

        if (frogVelocity < -4) {
            sx = 0.8;
            sy = 1.3;
        } else if (frogVelocity > 4) {
            sx = 1.2;
            sy = 0.7;
        }

        ctx.scale(sx + breath, sy - breath);

        /* Glow at high combo */
        if (combo >= 5) {
            ctx.shadowBlur  = 20;
            ctx.shadowColor = "#9dff6a";
        }

        /* Body */
        ctx.fillStyle = "#4caf50";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        /* Eyes */
        const panic = logSpeed > 8 ? 1.3 : 1;

        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(-8, -10, 7 * panic, 0, Math.PI * 2);
        ctx.arc( 8, -10, 7 * panic, 0, Math.PI * 2);
        ctx.fill();

        /* Blink */
        const blink = Math.sin(frameCount * 0.03) > 0.98;

        ctx.fillStyle = "#111";

        if (!blink) {
            ctx.beginPath();
            ctx.arc(-8, -10, 3, 0, Math.PI * 2);
            ctx.arc( 8, -10, 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillRect(-11, -10, 6, 2);
            ctx.fillRect(  5, -10, 6, 2);
        }

        /* Tongue wiggle (idle) */
        if (!isGameStarted && frameCount % 120 < 50) {

            ctx.strokeStyle = "#ff7a8c";
            ctx.lineWidth   = 2;

            ctx.beginPath();
            ctx.moveTo(0, 6);
            ctx.quadraticCurveTo(
                15,
                12 + Math.sin(frameCount * 0.2) * 4,
                22,
                6
            );
            ctx.stroke();
        }

        ctx.restore();
    }

    /* =========================================================
       DRAW
    ========================================================= */

    function draw() {

        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        /* Camera transform */
        const shakeX = (Math.random() - 0.5) * screenShake;
        const shakeY = (Math.random() - 0.5) * screenShake;

        ctx.save();

        ctx.translate(
            shakeX,
            shakeY + cameraOffsetY + cameraDrift
        );

        ctx.scale(cameraZoom, cameraZoom);

        /* SKY */
        ctx.fillStyle = getSkyGradient();
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        /* THUNDER FLASH */
        if (thunderFlash > 0.05) {
            ctx.fillStyle = `rgba(255,255,255,${thunderFlash * 0.4})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }

        /* MOON */
        if (score >= 10) {
            ctx.shadowBlur  = 40;
            ctx.shadowColor = "rgba(255,255,220,0.7)";
            ctx.fillStyle   = "#f7f3cf";

            ctx.beginPath();
            ctx.arc(390, 100, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
        }

        /* GROUND */
        ctx.fillStyle = "#224a24";
        ctx.fillRect(0, GROUND_Y, WIDTH, HEIGHT - GROUND_Y);

        /* WATER */
        ctx.fillStyle = "rgba(20,50,60,0.7)";
        ctx.fillRect(0, GROUND_Y + 10, WIDTH, 120);

        /* FROG REFLECTION */
        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.translate(FROG_X, GROUND_Y + 40);
        ctx.scale(1, -0.3);
        ctx.fillStyle = "#7cff7c";
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        drawRipples();

        /* FOG */
        drawFog();

        /* LOGS */
        for (const log of logs) log.draw();

        /* FROG */
        drawFrog();

        /* PARTICLES */
        drawParticles();

        /* LEAVES */
        drawLeaves();

        /* RAIN */
        if (rain) {

            ctx.strokeStyle = "rgba(180,220,255,0.3)";

            for (let i = 0; i < 120; i++) {

                const x = (i * 41 + frameCount * 8)  % WIDTH;
                const y = (i * 57 + frameCount * 12) % HEIGHT;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x - 5, y + 14);
                ctx.stroke();
            }
        }

        /* NEAR MISS FLASH */
        if (nearMissFlash > 0.05) {
            ctx.fillStyle = `rgba(255,255,255,${nearMissFlash * 0.15})`;
            ctx.fillRect(0, 0, WIDTH, HEIGHT);
        }

        /* SCORE POPUPS */
        for (let i = scorePopups.length - 1; i >= 0; i--) {

            const p = scorePopups[i];

            p.y -= 1;
            p.life--;

            ctx.globalAlpha = p.life / 60;
            ctx.fillStyle   = "#fff";
            ctx.font        = "bold 20px Segoe UI";
            ctx.fillText(p.text, p.x - 40, p.y);
            ctx.globalAlpha = 1;

            if (p.life <= 0) scorePopups.splice(i, 1);
        }

        ctx.restore();

        /* GAME OVER OVERLAY */
        if (isGameOver) {

            ctx.fillStyle = "rgba(0,0,0,0.45)";
            ctx.fillRect(0, 0, WIDTH, HEIGHT);

            ctx.fillStyle = "#fff";
            ctx.font      = "bold 42px Segoe UI";
            ctx.textAlign = "center";
            ctx.fillText("GAME OVER", WIDTH / 2, HEIGHT / 2 - 20);

            ctx.font      = "20px Segoe UI";
            ctx.fillStyle = "#ffd700";
            ctx.fillText(`Final Score: ${score}`, WIDTH / 2, HEIGHT / 2 + 25);

            if (score >= bestScore) {
                ctx.fillStyle = "#8dff8d";
                ctx.fillText("🏆 NEW BEST!", WIDTH / 2, HEIGHT / 2 + 65);
            }
        }
    }

    /* =========================================================
       LOOP
    ========================================================= */

    function loop() {
        update();
        draw();
        requestAnimationFrame(loop);
    }

    /* =========================================================
       EVENTS
    ========================================================= */

    window.addEventListener("keydown", e => {

        if (
            e.code === "Space"   ||
            e.code === "ArrowUp" ||
            e.code === "KeyW"
        ) {
            e.preventDefault();
            jump();
        }

        if (e.code === "KeyP") {
            paused = !paused;
        }
    });

    canvas.addEventListener("click", () => jump());

    /* FIX: touchstart gives instant response on mobile;
       "click" fires ~300ms later, making taps feel sluggish. */
    canvas.addEventListener("touchstart", e => {
        e.preventDefault();
        jump();
    }, { passive: false });

    /* =========================================================
       RESIZE
    ========================================================= */

    function resize() {

        const scale =
            Math.min(
                window.innerWidth  / WIDTH,
                window.innerHeight / HEIGHT
            ) * 0.92;

        canvas.style.width  = WIDTH  * scale + "px";
        canvas.style.height = HEIGHT * scale + "px";
    }

    window.addEventListener("resize", resize);

    resize();

    /* =========================================================
       BEST SCORE
    ========================================================= */

    bestScore = Number(localStorage.getItem("froggyBest")) || 0;
    bestScoreEl.textContent = bestScore;

    /* =========================================================
       START
    ========================================================= */

    loop();

})();