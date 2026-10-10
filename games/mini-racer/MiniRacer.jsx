"use client";

import { useEffect, useRef, useState } from "react";

export default function MiniRacer() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const keysRef = useRef({
    up: false,
    left: false,
    right: false,
  });

  const [started, setStarted] = useState(false);
  const [health, setHealth] = useState(3);
  const [lap, setLap] = useState(1);
  const [speed, setSpeed] = useState(0);
  const [position] = useState("1st");
  const [message, setMessage] = useState("");

  const gameRef = useRef({
    running: false,
    frame: 0,
    lastTime: 0,
    distance: 0,
    trackLength: 1800,
    damageCooldown: 0,
    car: {
      speed: 0,
      lane: 0,
      health: 3,
      lap: 1,
    },
  });

  const setControl = (control, pressed) => {
    keysRef.current[control] = pressed;
  };

  const drawGame = (ctx, width, height) => {
    const game = gameRef.current;
    const car = game.car;

    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#76a957";
    ctx.fillRect(0, 0, width, height);

    const horizon = height * 0.31;
    const roadWidth = Math.min(width * 0.62, 610);
    const roadCenter = width / 2 + Math.sin(game.frame * 0.006) * width * 0.06;

    ctx.fillStyle = "#8ec56a";
    ctx.fillRect(0, horizon, width, height - horizon);

    ctx.fillStyle = "#777b80";
    ctx.beginPath();
    ctx.moveTo(roadCenter - roadWidth * 0.16, horizon);
    ctx.lineTo(roadCenter + roadWidth * 0.16, horizon);
    ctx.lineTo(roadCenter + roadWidth / 2, height);
    ctx.lineTo(roadCenter - roadWidth / 2, height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#555a60";
    ctx.beginPath();
    ctx.moveTo(roadCenter - roadWidth * 0.11, horizon);
    ctx.lineTo(roadCenter + roadWidth * 0.11, horizon);
    ctx.lineTo(roadCenter + roadWidth * 0.42, height);
    ctx.lineTo(roadCenter - roadWidth * 0.42, height);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.75)";
    ctx.lineWidth = 4;
    ctx.setLineDash([22, 28]);

    for (let lane = -1; lane <= 1; lane += 2) {
      ctx.beginPath();
      ctx.moveTo(roadCenter + lane * roadWidth * 0.055, horizon);
      ctx.lineTo(roadCenter + lane * roadWidth * 0.21, height);
      ctx.stroke();
    }

    ctx.setLineDash([]);

    for (let i = 0; i < 11; i += 1) {
      const p = (i / 11 + game.frame * 0.0018) % 1;
      const y = horizon + (height - horizon) * p * p;
      const scale = 0.2 + p * 1.2;
      const side = roadWidth * (0.44 + scale * 0.03);

      [-1, 1].forEach((direction) => {
        const x = roadCenter + direction * side;
        ctx.fillStyle = i % 2 ? "#ffffff" : "#e33";
        ctx.fillRect(x - 5 * scale, y - 12 * scale, 10 * scale, 12 * scale);
      });
    }

    const carX = roadCenter + car.lane * roadWidth * 0.28;
    const carY = height * 0.72;
    const carWidth = Math.max(26, width * 0.045);
    const carHeight = carWidth * 1.65;

    ctx.save();
    ctx.translate(carX, carY);
    ctx.rotate(car.lane * 0.06);

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.ellipse(0, carHeight * 0.43, carWidth * 0.7, carWidth * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#e33";
    ctx.beginPath();
    ctx.roundRect(-carWidth / 2, -carHeight / 2, carWidth, carHeight, 8);
    ctx.fill();

    ctx.fillStyle = "#b9e8ff";
    ctx.beginPath();
    ctx.roundRect(-carWidth * 0.33, -carHeight * 0.23, carWidth * 0.66, carHeight * 0.3, 5);
    ctx.fill();

    ctx.fillStyle = "#f7f7f7";
    ctx.fillRect(-carWidth * 0.42, carHeight * 0.2, carWidth * 0.84, carHeight * 0.1);

    ctx.fillStyle = "#ffd34d";
    ctx.fillRect(-carWidth * 0.38, -carHeight * 0.43, carWidth * 0.18, carHeight * 0.1);
    ctx.fillRect(carWidth * 0.2, -carHeight * 0.43, carWidth * 0.18, carHeight * 0.1);

    ctx.restore();
  };

  const startGame = () => {
    const game = gameRef.current;

    game.running = true;
    game.frame = 0;
    game.distance = 0;
    game.damageCooldown = 0;

    game.car = {
      speed: 0,
      lane: 0,
      health: 3,
      lap: 1,
    };

    setHealth(3);
    setLap(1);
    setSpeed(0);
    setMessage("");
    setStarted(true);

    game.lastTime = performance.now();
    cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  const gameLoop = (time) => {
    const game = gameRef.current;
    if (!game.running) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const delta = Math.min((time - game.lastTime) / 1000, 0.04);
    game.lastTime = time;
    game.frame += delta * 60;

    const car = game.car;

    const acceleration = keysRef.current.up ? 1 : 0.18;
    car.speed += (acceleration - car.speed * 0.9) * delta * 2.4;

    if (!keysRef.current.up) {
      car.speed *= Math.pow(0.985, delta * 60);
    }

    car.speed = Math.max(0, Math.min(1, car.speed));

    if (keysRef.current.left) {
      car.lane -= delta * 1.25 * (0.5 + car.speed);
    }

    if (keysRef.current.right) {
      car.lane += delta * 1.25 * (0.5 + car.speed);
    }

    car.lane = Math.max(-1, Math.min(1, car.lane));

    game.distance += car.speed * delta * 240;
    game.damageCooldown = Math.max(0, game.damageCooldown - delta);

    if (Math.abs(car.lane) > 0.9 && car.speed > 0.55 && game.damageCooldown === 0) {
      car.health -= 1;
      game.damageCooldown = 1;
      setHealth(car.health);
      setMessage("OUCH!");

      setTimeout(() => setMessage(""), 500);

      if (car.health <= 0) {
        game.running = false;
        setMessage("CRASH!");
        return;
      }
    }

    if (game.distance >= game.trackLength) {
      game.distance -= game.trackLength;
      car.lap += 1;

      if (car.lap <= 3) {
        setLap(car.lap);
        setMessage("LAP!");
        setTimeout(() => setMessage(""), 500);
      }

      if (car.lap > 3) {
        game.running = false;
        setMessage("YOU WIN!");
        return;
      }
    }

    setSpeed(Math.round(car.speed * 155));
    drawGame(ctx, canvas.clientWidth, canvas.clientHeight);
    animationRef.current = requestAnimationFrame(gameLoop);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (["ArrowUp", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
      }

      if (event.key === "ArrowUp") keysRef.current.up = true;
      if (event.key === "ArrowLeft") keysRef.current.left = true;
      if (event.key === "ArrowRight") keysRef.current.right = true;
    };

    const handleKeyUp = (event) => {
      if (event.key === "ArrowUp") keysRef.current.up = false;
      if (event.key === "ArrowLeft") keysRef.current.left = false;
      if (event.key === "ArrowRight") keysRef.current.right = false;
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      const ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!gameRef.current.running) {
        drawGame(ctx, rect.width, rect.height);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  return (
    <div className="racing-game">
      <div className="game">
        <canvas ref={canvasRef} aria-label="Mini racing game" />

        <div className="hud">
          <div className="hud-box">
            <div className="hud-label">Health</div>
            <div className="hud-value health">{health > 0 ? "♥ ".repeat(health) : "0"}</div>
          </div>

          <div className="hud-box center">
            <div className="hud-label">Lap</div>
            <div className="hud-value">{lap} / 3</div>
          </div>

          <div className="hud-box right">
            <div className="hud-label">Position</div>
            <div className="hud-value">{position}</div>
          </div>
        </div>

        <div className="speed">
          <strong>{speed}</strong>
          <span>km/h</span>
        </div>

        <div className="controls">
          <button className="key" type="button" aria-label="Steer left"
            onPointerDown={(event) => { event.preventDefault(); setControl("left", true); }}
            onPointerUp={() => setControl("left", false)}
            onPointerCancel={() => setControl("left", false)}
            onLostPointerCapture={() => setControl("left", false)}>←</button>
          <button className="key" type="button" aria-label="Steer right"
            onPointerDown={(event) => { event.preventDefault(); setControl("right", true); }}
            onPointerUp={() => setControl("right", false)}
            onPointerCancel={() => setControl("right", false)}
            onLostPointerCapture={() => setControl("right", false)}>→</button>
          <button className="key" type="button" aria-label="Accelerate"
            onPointerDown={(event) => { event.preventDefault(); setControl("up", true); }}
            onPointerUp={() => setControl("up", false)}
            onPointerCancel={() => setControl("up", false)}
            onLostPointerCapture={() => setControl("up", false)}>↑</button>
        </div>

        {message && <div className="message">{message}</div>}

        {!started && (
          <div className="start-screen">
            <div className="start-card">
              <h2>Mini Racer</h2>
              <p>Use ↑ to accelerate and ← → to steer.</p>
              <button type="button" onClick={startGame}>START RACE</button>
            </div>
          </div>
        )}

        {started && !gameRef.current.running && message && (
          <div className="start-screen">
            <div className="start-card">
              <h2>{message === "YOU WIN!" ? "Race Complete!" : "Race Over"}</h2>
              <p>{message === "YOU WIN!" ? "You finished all 3 laps!" : "Your car has crashed."}</p>
              <button type="button" onClick={startGame}>RACE AGAIN</button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .racing-game {
          width: 100%;
          max-width: 1000px;
          margin: 0 auto;
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .game {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 22px;
          background: #78a95a;
          border: 1px solid rgba(255,255,255,.14);
          user-select: none;
        }

        canvas {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
        }

        .hud {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
          padding: 16px;
          pointer-events: none;
        }

        .hud-box {
          min-width: 0;
          padding: 9px 13px;
          background: rgba(10,14,20,.78);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 14px;
          box-shadow: 0 8px 25px rgba(0,0,0,.18);
        }

        .hud-box.center { text-align: center; }
        .hud-box.right { text-align: right; }

        .hud-label {
          font-size: 11px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: #b9c0c9;
          font-weight: 700;
        }

        .hud-value {
          font-size: 22px;
          font-weight: 900;
          line-height: 1.1;
          margin-top: 2px;
        }

        .health { letter-spacing: 2px; }

        .speed {
          position: absolute;
          right: 16px;
          bottom: 16px;
          text-align: center;
          background: rgba(10,14,20,.82);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 16px;
          padding: 10px 17px;
          min-width: 105px;
          box-shadow: 0 8px 25px rgba(0,0,0,.2);
        }

        .speed strong {
          display: block;
          font-size: 27px;
          line-height: 1;
        }

        .speed span {
          font-size: 10px;
          color: #b9c0c9;
          text-transform: uppercase;
          letter-spacing: .1em;
        }

        .controls {
          position: absolute;
          left: 16px;
          bottom: 16px;
          display: flex;
          gap: 8px;
          pointer-events: auto;
          z-index: 2;
        }

        .key {
          padding: 0;
          color: white;
          touch-action: none;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(10,14,20,.7);
          border: 1px solid rgba(255,255,255,.15);
          display: grid;
          place-items: center;
          font-weight: 900;
          font-size: 16px;
        }

        .start-screen {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(5,8,12,.45);
          backdrop-filter: blur(3px);
        }

        .start-card {
          text-align: center;
          background: rgba(10,14,20,.9);
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 20px;
          padding: 26px 30px;
          box-shadow: 0 15px 45px rgba(0,0,0,.3);
        }

        .start-card h2 {
          margin: 0 0 5px;
          font-size: 32px;
          font-weight: 900;
        }

        .start-card p {
          margin: 0 0 18px;
          color: #b9c0c9;
        }

        .start-card button {
          border: 0;
          border-radius: 12px;
          padding: 13px 25px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          background: white;
          color: #101318;
          min-height: 44px;
        }

        .start-card button:hover { transform: translateY(-1px); }

        .message {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          font-size: 48px;
          font-weight: 1000;
          text-shadow: 0 5px 20px rgba(0,0,0,.5);
          pointer-events: none;
          z-index: 5;
        }

        @media (max-width: 560px) {
          .game { border-radius: 14px; }
          .hud { padding: 9px; gap: 6px; }
          .hud-box { padding: 7px 8px; }
          .hud-label { font-size: 9px; }
          .hud-value { font-size: 17px; }
          .speed { right: 9px; bottom: 9px; }
          .speed strong { font-size: 21px; }
          .controls { left: 9px; bottom: 9px; }
          .message { font-size: 36px; }
        }
      `}</style>
    </div>
  );
}
