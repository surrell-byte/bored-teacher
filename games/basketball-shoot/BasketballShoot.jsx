"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "./BasketballShoot.css";

const WIDTH = 960;
const HEIGHT = 500;
const TOTAL_SHOTS = 10;
const RELEASE = { x: 174, y: 390 };
const HOOP = { x: 726, y: 196 };

function drawCourt(context, ball, power, angle) {
  const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, "#25304f");
  sky.addColorStop(0.58, "#49344f");
  sky.addColorStop(0.59, "#d69853");
  sky.addColorStop(1, "#935438");
  context.fillStyle = sky;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  context.fillStyle = "rgba(255,255,255,.07)";
  for (let index = 0; index < 9; index += 1) {
    context.beginPath();
    context.arc(55 + index * 110, 75 + (index % 2) * 13, 30, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = "#b87545";
  context.fillRect(0, 296, WIDTH, HEIGHT - 296);
  context.strokeStyle = "rgba(255,228,190,.48)";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(0, 307);
  context.lineTo(WIDTH, 307);
  context.stroke();
  context.beginPath();
  context.ellipse(510, 445, 178, 52, 0, Math.PI, Math.PI * 2);
  context.stroke();
  context.strokeStyle = "rgba(255,255,255,.13)";
  context.lineWidth = 1;
  for (let index = 0; index < 15; index += 1) {
    context.beginPath();
    context.moveTo(index * 78 - 100, 500);
    context.lineTo(460 + (index - 7) * 24, 307);
    context.stroke();
  }

  const playerY = RELEASE.y;
  context.fillStyle = "rgba(0,0,0,.24)";
  context.beginPath();
  context.ellipse(RELEASE.x, 452, 49, 12, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#f6bd8b";
  context.beginPath();
  context.arc(RELEASE.x, playerY - 94, 23, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#382535";
  context.beginPath();
  context.arc(RELEASE.x, playerY - 102, 24, Math.PI, Math.PI * 2);
  context.fill();
  context.fillStyle = "#21a5a1";
  context.beginPath();
  context.roundRect(RELEASE.x - 31, playerY - 69, 62, 71, 16);
  context.fill();
  context.fillStyle = "#f7e6c6";
  context.fillRect(RELEASE.x - 9, playerY - 64, 18, 53);
  context.fillStyle = "#202d48";
  context.beginPath();
  context.roundRect(RELEASE.x - 31, playerY - 5, 25, 55, 9);
  context.roundRect(RELEASE.x + 6, playerY - 5, 25, 55, 9);
  context.fill();
  context.strokeStyle = "#f6bd8b";
  context.lineWidth = 10;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(RELEASE.x - 25, playerY - 56);
  context.lineTo(RELEASE.x - 2, playerY - 23);
  context.moveTo(RELEASE.x + 25, playerY - 56);
  context.lineTo(RELEASE.x + 4, playerY - 23);
  context.stroke();

  context.fillStyle = "#d9e7f2";
  context.fillRect(783, 94, 11, 124);
  context.fillStyle = "#fbf3e8";
  context.fillRect(764, 86, 88, 8);
  context.fillRect(764, 86, 8, 76);
  context.fillStyle = "rgba(235,247,255,.55)";
  context.fillRect(773, 96, 65, 55);
  context.strokeStyle = "#ff7545";
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(703, HOOP.y);
  context.lineTo(769, HOOP.y);
  context.stroke();
  context.strokeStyle = "rgba(255,255,255,.8)";
  context.lineWidth = 2;
  for (let index = 0; index <= 5; index += 1) {
    const x = 706 + index * 12;
    context.beginPath();
    context.moveTo(x, HOOP.y + 3);
    context.lineTo(711 + index * 9, HOOP.y + 39);
    context.stroke();
  }
  context.beginPath();
  context.moveTo(706, HOOP.y + 3);
  context.lineTo(759, HOOP.y + 3);
  context.stroke();

  if (!ball && power > 0) {
    const speed = 790 + power * 5;
    const radians = (angle * Math.PI) / 180;
    context.setLineDash([7, 10]);
    context.strokeStyle = "rgba(255,255,255,.72)";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(RELEASE.x, RELEASE.y - 28);
    for (let frame = 1; frame <= 45; frame += 3) {
      const time = frame / 45;
      const x = RELEASE.x + speed * Math.cos(radians) * time * 0.56;
      const y = RELEASE.y - 28 - speed * Math.sin(radians) * time * 0.56 + 0.5 * 1100 * (time * 0.56) ** 2;
      if (frame === 1) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
    context.setLineDash([]);
  }

  if (ball) {
    context.save();
    context.translate(ball.x, ball.y);
    context.rotate(ball.rotation);
    context.fillStyle = "#f47725";
    context.beginPath();
    context.arc(0, 0, 15, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#632d24";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, 14, -Math.PI / 2, Math.PI / 2);
    context.moveTo(-14, 0);
    context.quadraticCurveTo(0, -6, 14, 0);
    context.moveTo(-14, 0);
    context.quadraticCurveTo(0, 6, 14, 0);
    context.stroke();
    context.restore();
  } else {
    context.fillStyle = "#f47725";
    context.beginPath();
    context.arc(RELEASE.x + 42, RELEASE.y - 35, 15, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#632d24";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(RELEASE.x + 42, RELEASE.y - 35, 14, -Math.PI / 2, Math.PI / 2);
    context.moveTo(RELEASE.x + 28, RELEASE.y - 35);
    context.quadraticCurveTo(RELEASE.x + 42, RELEASE.y - 41, RELEASE.x + 56, RELEASE.y - 35);
    context.moveTo(RELEASE.x + 28, RELEASE.y - 35);
    context.quadraticCurveTo(RELEASE.x + 42, RELEASE.y - 29, RELEASE.x + 56, RELEASE.y - 35);
    context.stroke();
  }
}

export default function BasketballShoot({ onComplete, onHudUpdate }) {
  const canvasRef = useRef(null);
  const animationRef = useRef(0);
  const ballRef = useRef(null);
  const gameRef = useRef({ shotsLeft: TOTAL_SHOTS, score: 0, completed: false });
  const onCompleteRef = useRef(onComplete);
  const [screen, setScreen] = useState("menu");
  const [score, setScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(TOTAL_SHOTS);
  const [power, setPower] = useState(70);
  const [angle, setAngle] = useState(30.5);
  const [message, setMessage] = useState("Set your shot, then let it fly!");

  onCompleteRef.current = onComplete;

  useEffect(() => {
    onHudUpdate?.(screen === "game" ? { score, shotsLeft, power, angle } : null);
  }, [screen, score, shotsLeft, power, angle, onHudUpdate]);

  const finishGame = useCallback(() => {
    if (gameRef.current.completed) return;
    gameRef.current.completed = true;
    const finalScore = gameRef.current.score;
    const accuracy = Math.round((finalScore / (TOTAL_SHOTS * 3)) * 100);
    setMessage(finalScore >= 18 ? "All-star shooting!" : "Round complete!");
    setScreen("end");
    onCompleteRef.current?.(finalScore, Math.min(100, accuracy));
  }, []);

  const finishShot = useCallback((points, resultMessage) => {
    ballRef.current = null;
    if (points > 0) {
      gameRef.current.score += points;
      setScore(gameRef.current.score);
    }
    setMessage(resultMessage);
    if (gameRef.current.shotsLeft <= 0) finishGame();
  }, [finishGame]);

  useEffect(() => {
    if (screen !== "game") return undefined;
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let previousTime = 0;
    const render = (time) => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = window.devicePixelRatio || 1;
      const pixelWidth = Math.max(1, Math.round(rect.width * pixelRatio));
      const pixelHeight = Math.max(1, Math.round(rect.height * pixelRatio));
      if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
        canvas.width = pixelWidth;
        canvas.height = pixelHeight;
      }
      context.setTransform(pixelWidth / WIDTH, 0, 0, pixelHeight / HEIGHT, 0, 0);

      const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.035) : 0;
      previousTime = time;
      const ball = ballRef.current;
      if (ball) {
        const oldX = ball.x;
        ball.x += ball.vx * delta;
        ball.y += ball.vy * delta;
        ball.vy += 1100 * delta;
        ball.rotation += delta * 7;

        if (oldX < HOOP.x && ball.x >= HOOP.x && ball.vy > 0) {
          if (ball.y >= HOOP.y - 18 && ball.y <= HOOP.y + 24) {
            const points = Math.abs(ball.y - HOOP.y) <= 7 ? 3 : 2;
            finishShot(points, points === 3 ? "Nothing but net! +3" : "Bucket! +2");
          } else if (ball.y > HOOP.y - 42 && ball.y < HOOP.y + 65) {
            ball.vx *= -0.5;
            ball.vy = -Math.abs(ball.vy) * 0.48;
            ball.x = HOOP.x - 2;
            setMessage("Rim rattles! It bounced out.");
          }
        }

        if (ball && ball.y >= 456) {
          if (!ball.bounced) {
            ball.y = 456;
            ball.vy = -Math.abs(ball.vy) * 0.34;
            ball.vx *= 0.64;
            ball.bounced = true;
          } else {
            finishShot(0, "Missed! Line up the next shot.");
          }
        } else if (ball && (ball.x > WIDTH + 35 || ball.x < -30 || ball.y > HEIGHT + 40)) {
          finishShot(0, "Missed! Line up the next shot.");
        }
      }

      drawCourt(context, ballRef.current, power, angle);
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationRef.current);
  }, [screen, power, angle, finishShot]);

  const startGame = () => {
    gameRef.current = { shotsLeft: TOTAL_SHOTS, score: 0, completed: false };
    ballRef.current = null;
    setScore(0);
    setShotsLeft(TOTAL_SHOTS);
    setPower(70);
    setAngle(30.5);
    setMessage("Set your shot, then let it fly!");
    setScreen("game");
  };

  const shoot = () => {
    if (screen !== "game" || ballRef.current || gameRef.current.shotsLeft <= 0) return;
    const speed = 790 + power * 5;
    const radians = (angle * Math.PI) / 180;
    ballRef.current = {
      x: RELEASE.x + 42,
      y: RELEASE.y - 35,
      vx: speed * Math.cos(radians),
      vy: -speed * Math.sin(radians),
      rotation: 0,
      bounced: false,
    };
    gameRef.current.shotsLeft -= 1;
    setShotsLeft(gameRef.current.shotsLeft);
    setMessage("Shot in the air…");
  };

  const accuracy = Math.min(100, Math.round((score / (TOTAL_SHOTS * 3)) * 100));

  return (
    <main className="basketball-game">
      <section className="basketball-shell">
        <header className="basketball-header">
          <div className="basketball-title">
            <div className="basketball-heading">
              <p>ARCADE FREE-THROW CONTEST</p>
              <h1>Hoop Hero</h1>
              <span>Find your angle. Feel the swish.</span>
            </div>
            <div className="basketball-artwork" role="img" aria-label="Basketball game artwork" />
          </div>
          {screen === "game" && (
            <div className="basketball-stats">
              <div><small>SCORE</small><strong>{score}</strong></div>
              <div><small>SHOTS</small><strong>{shotsLeft}/{TOTAL_SHOTS}</strong></div>
              <div><small>ACCURACY</small><strong>{accuracy}%</strong></div>
            </div>
          )}
        </header>

        {screen === "menu" && (
          <section className="basketball-intro">
            <div className="basketball-intro-ball" aria-hidden="true">🏀</div>
            <h2>Can you go on a scoring streak?</h2>
            <p>Use the power and angle controls to arc the ball through the hoop. You get ten shots, with three points for a perfect swish.</p>
            <button className="basketball-primary" onClick={startGame}>Start shooting</button>
          </section>
        )}

        {screen === "game" && (
          <>
            <div className="basketball-court">
              <canvas ref={canvasRef} aria-label="Basketball court with a hoop and live ball trajectory" />
            </div>
            <div className="basketball-controls">
              <label>
                <span>Power <b>{power}%</b></span>
                <input type="range" min="20" max="100" value={power} onChange={(event) => setPower(Number(event.target.value))} />
              </label>
              <label>
                <span>Angle <b>{angle}°</b></span>
                <input type="range" min="20" max="65" step="0.5" value={angle} onChange={(event) => setAngle(Number(event.target.value))} />
              </label>
              <button className="basketball-primary" onClick={shoot} disabled={Boolean(ballRef.current) || shotsLeft <= 0}>
                {ballRef.current ? "Ball in flight" : "Shoot"}
              </button>
            </div>
            <p className="basketball-message" role="status">{message}</p>
          </>
        )}

        {screen === "end" && (
          <section className="basketball-intro basketball-result">
            <div className="basketball-intro-ball" aria-hidden="true">🏆</div>
            <h2>Final score: {score}</h2>
            <p>{accuracy}% shooting accuracy. {score >= 18 ? "You’re an all-star!" : "Take another shot at your personal best."}</p>
            <button className="basketball-primary" onClick={startGame}>Play again</button>
          </section>
        )}
      </section>
    </main>
  );
}
