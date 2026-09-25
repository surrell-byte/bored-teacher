import { useCallback, useEffect, useRef, useState } from "react";

const WIDTH = 500;
const HEIGHT = 700;
const CENTER_X = 250;
const PIN_SPACING = 100;
const PIN_START_Y = 440;
const BALL_START_Y = 620;
const BALL_END_Y = 140;
const BALL_RADIUS = 32;
const LANE_LEFT = 70;
const LANE_RIGHT = 430;
const PLAYER_MODES = [
  { id: "aim", name: "Aim Mode", detail: "Aim with ← →, then time your power." },
  { id: "card", name: "Card Move", detail: "Pick a hidden card to reveal your pinfall." },
];
const PIN_LAYOUT = [
  [0, 0], [-0.5, -0.866], [0.5, -0.866], [-1, -1.732], [0, -1.732], [1, -1.732],
  [-1.5, -2.598], [-0.5, -2.598], [0.5, -2.598], [1.5, -2.598],
];
const FRAME_LABELS = Array.from({ length: 10 }, (_, index) => index + 1);

function createPlayer(name) {
  return { name, rolls: [], frame: 1, rollInFrame: 1, finished: false, strikes: 0, spares: 0, finalScore: 0 };
}

function createGame(names, mode) {
  const game = {
    players: [createPlayer(names[0]), createPlayer(names[1])],
    mode,
    currentPlayerIdx: 0,
    phase: mode === "card" ? "cardPick" : "aim",
    aim: 0,
    power: 0,
    powerDir: 1,
    ballY: BALL_START_Y,
    ballX: CENTER_X,
    pins: [],
    message: "",
    messageTimer: 0,
    messageColor: "#fff",
    rollStartTime: 0,
    pinsSettled: false,
    knockedThisRoll: [],
    gutter: false,
    rollCompleteTime: null,
    resultData: null,
    cards: [],
    chosenCard: null,
    cardRevealTimer: 0,
  };
  game.pins = PIN_LAYOUT.map(([x, y], index) => ({
    id: index + 1, x, y,
    px: CENTER_X + x * PIN_SPACING,
    py: PIN_START_Y + y * PIN_SPACING,
    standing: true,
    fallProgress: 0,
    fallDir: 1,
    rotation: (Math.random() - 0.5) * 0.1,
  }));
  if (mode === "card") dealCards(game);
  return game;
}

function dealCards(game) {
  const pinCount = game.pins.filter((pin) => pin.standing).length;
  game.cards = Array.from({ length: 4 }, (_, index) => ({
    id: index + 1,
    knocked: Math.floor(Math.random() * (pinCount + 1)),
  }));
  game.chosenCard = null;
}

function prepareNextRoll(game) {
  game.aim = 0;
  game.power = 0;
  game.powerDir = 1;
  game.ballY = BALL_START_Y;
  game.cardRevealTimer = 0;
  game.chosenCard = null;
  if (game.mode === "card") {
    dealCards(game);
    game.phase = "cardPick";
  } else {
    game.phase = "aim";
  }
}

function resetPins(game) {
  game.pins.forEach((pin) => {
    pin.standing = true;
    pin.fallProgress = 0;
  });
}

function scoreFrames(rolls) {
  const frames = [];
  let rollIndex = 0;
  for (let frameIndex = 0; frameIndex < 10; frameIndex += 1) {
    const frame = { rolls: [], display: "", score: null, cumulative: null };
    if (frameIndex < 9) {
      if (rollIndex >= rolls.length) { frames.push(frame); continue; }
      const first = rolls[rollIndex];
      if (first === 10) {
        frame.rolls = [10];
        frame.display = "X";
        if (rollIndex + 2 < rolls.length) frame.score = 10 + rolls[rollIndex + 1] + rolls[rollIndex + 2];
        rollIndex += 1;
      } else if (rollIndex + 1 >= rolls.length) {
        frame.rolls = [first];
        frame.display = String(first);
        rollIndex += 1;
      } else {
        const second = rolls[rollIndex + 1];
        frame.rolls = [first, second];
        if (first + second === 10) {
          frame.display = `${first} /`;
          if (rollIndex + 2 < rolls.length) frame.score = 10 + rolls[rollIndex + 2];
        } else {
          frame.display = `${first} ${second}`;
          frame.score = first + second;
        }
        rollIndex += 2;
      }
    } else {
      if (rollIndex >= rolls.length) { frames.push(frame); continue; }
      const first = rolls[rollIndex];
      frame.rolls.push(first);
      if (first === 10) {
        if (rollIndex + 1 < rolls.length) frame.rolls.push(rolls[rollIndex + 1]);
        if (rollIndex + 2 < rolls.length) frame.rolls.push(rolls[rollIndex + 2]);
        if (frame.rolls.length === 3) frame.score = frame.rolls.reduce((total, pins) => total + pins, 0);
        rollIndex += 3;
      } else if (rollIndex + 1 < rolls.length) {
        const second = rolls[rollIndex + 1];
        frame.rolls.push(second);
        if (first + second === 10) {
          if (rollIndex + 2 < rolls.length) frame.rolls.push(rolls[rollIndex + 2]);
          if (frame.rolls.length === 3) frame.score = frame.rolls.reduce((total, pins) => total + pins, 0);
          rollIndex += 3;
        } else {
          frame.score = first + second;
          rollIndex += 2;
        }
      } else {
        rollIndex += 1;
      }
      frame.display = frame.rolls.map((pins, index) => {
        if (pins === 10) return "X";
        if (index === 1 && frame.rolls[0] !== 10 && frame.rolls[0] + pins === 10) return "/";
        return String(pins);
      }).join(" ");
    }
    frames.push(frame);
  }

  let cumulative = 0;
  for (let index = 0; index < 10; index += 1) {
    if (frames[index].score !== null) {
      cumulative += frames[index].score;
      frames[index].cumulative = cumulative;
    } else {
      break;
    }
  }
  return frames;
}

function scoreTotal(rolls) {
  const frames = scoreFrames(rolls);
  return frames.reduce((last, frame) => frame.cumulative ?? last, 0);
}

function simulateRoll(game) {
  const ballX = CENTER_X + game.aim * PIN_SPACING;
  if (Math.abs(game.aim) >= 1.4) return { gutter: true, knocked: [] };
  const standing = game.pins.filter((pin) => pin.standing);
  const knocked = new Set();
  const hitRadius = 40 + 20 * game.power;
  standing.forEach((pin) => {
    if (Math.abs(pin.px - ballX) < hitRadius) knocked.add(pin.id);
  });
  const chainChance = 0.3 + 0.6 * game.power;
  let changed = true;
  while (changed) {
    changed = false;
    standing.forEach((pin) => {
      if (knocked.has(pin.id)) return;
      const nearKnockedPin = [...knocked].some((id) => {
        const other = standing.find((candidate) => candidate.id === id);
        return other && Math.hypot(pin.px - other.px, pin.py - other.py) < 120;
      });
      if (nearKnockedPin && Math.random() < chainChance) {
        knocked.add(pin.id);
        changed = true;
      }
    });
  }
  return { gutter: false, knocked: [...knocked] };
}

function beginRoll(game, forcedResult = null) {
  game.phase = "rolling";
  game.message = "";
  game.messageTimer = 0;
  game.ballY = BALL_START_Y;
  game.ballX = CENTER_X + game.aim * PIN_SPACING;
  game.rollStartTime = performance.now();
  game.pinsSettled = false;
  game.rollCompleteTime = null;
  const result = forcedResult || simulateRoll(game);
  game.knockedThisRoll = result.knocked;
  game.gutter = result.gutter;
}

function drawLane(ctx, game) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#111725";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  // Dark gutters frame a polished, board-by-board maple lane.
  const gutter = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  gutter.addColorStop(0, "#39291e"); gutter.addColorStop(0.5, "#5a3b24"); gutter.addColorStop(1, "#2c2019");
  ctx.fillStyle = gutter;
  ctx.fillRect(LANE_LEFT - 24, 0, 24, HEIGHT);
  ctx.fillRect(LANE_RIGHT, 0, 24, HEIGHT);
  const gutterHighlight = ctx.createLinearGradient(0, 0, 24, 0);
  gutterHighlight.addColorStop(0, "rgba(0,0,0,.34)"); gutterHighlight.addColorStop(.72, "rgba(255,255,255,.1)"); gutterHighlight.addColorStop(1, "rgba(0,0,0,.26)");
  ctx.fillStyle = gutterHighlight;
  ctx.fillRect(LANE_LEFT - 24, 0, 24, HEIGHT);
  ctx.save(); ctx.translate(LANE_RIGHT + 24, 0); ctx.scale(-1, 1); ctx.fillRect(0, 0, 24, HEIGHT); ctx.restore();
  const laneGradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
  laneGradient.addColorStop(0, "#f9eac9");
  laneGradient.addColorStop(0.48, "#f2dfb6");
  laneGradient.addColorStop(1, "#e7ce9d");
  ctx.fillStyle = laneGradient;
  ctx.fillRect(LANE_LEFT, 0, LANE_RIGHT - LANE_LEFT, HEIGHT);
  for (let board = 0; board <= 9; board += 1) {
    const progress = board / 9;
    const topX = LANE_LEFT + 24 + progress * (LANE_RIGHT - LANE_LEFT - 48);
    const bottomX = LANE_LEFT + progress * (LANE_RIGHT - LANE_LEFT);
    ctx.strokeStyle = board % 2 ? "rgba(148,103,48,.13)" : "rgba(255,255,255,.17)";
    ctx.lineWidth = board % 3 === 0 ? 2 : 1;
    ctx.beginPath(); ctx.moveTo(topX, 0); ctx.lineTo(bottomX, HEIGHT); ctx.stroke();
  }
  for (let grain = 0; grain < 18; grain += 1) {
    const y = 24 + grain * 37;
    ctx.strokeStyle = "rgba(160,113,55,.09)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(LANE_LEFT + 4, y); ctx.bezierCurveTo(165, y - 5, 330, y + 6, LANE_RIGHT - 4, y - 2); ctx.stroke();
  }
  const sheen = ctx.createLinearGradient(LANE_LEFT, 0, LANE_RIGHT, 0);
  sheen.addColorStop(0, "rgba(255,255,255,0)"); sheen.addColorStop(.5, "rgba(255,255,255,.15)"); sheen.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = sheen; ctx.fillRect(LANE_LEFT, 0, LANE_RIGHT - LANE_LEFT, HEIGHT);
  ctx.strokeStyle = "rgba(255,255,255,.16)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(LANE_LEFT + 1, 0); ctx.lineTo(LANE_LEFT + 1, HEIGHT); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(LANE_RIGHT - 1, 0); ctx.lineTo(LANE_RIGHT - 1, HEIGHT); ctx.stroke();
  ctx.fillStyle = "rgba(100,70,30,.35)";
  for (let offset = -3; offset <= 3; offset += 1) {
    const x = CENTER_X + offset * 40;
    ctx.beginPath(); ctx.moveTo(x, 500); ctx.lineTo(x - 8, 520); ctx.lineTo(x + 8, 520); ctx.closePath(); ctx.fill();
  }
  // Foul line and short approach area.
  ctx.fillStyle = "#9e4d22"; ctx.fillRect(LANE_LEFT, 596, LANE_RIGHT - LANE_LEFT, 7);
  ctx.fillStyle = "rgba(255,235,196,.45)"; ctx.fillRect(LANE_LEFT, 603, LANE_RIGHT - LANE_LEFT, 3);
  ctx.fillStyle = "rgba(109,72,34,.12)"; ctx.fillRect(LANE_LEFT, 606, LANE_RIGHT - LANE_LEFT, HEIGHT - 606);

  game.pins.forEach((pin) => {
    if (!pin.standing && pin.fallProgress >= 1) return;
    ctx.save();
    ctx.translate(pin.px, pin.py);
    ctx.rotate(pin.rotation || 0);
    if (!pin.standing) {
      ctx.rotate(pin.fallDir * Math.PI / 2 * pin.fallProgress);
      ctx.translate(0, pin.fallProgress * 30);
      ctx.scale(1 - pin.fallProgress * 0.3, 1 - pin.fallProgress * 0.3);
      ctx.globalAlpha = 1 - pin.fallProgress * 0.85;
    }
    drawPin(ctx);
    ctx.restore();
  });

  if (["aim", "power", "cardPick", "cardReveal"].includes(game.phase)) drawBall(ctx, CENTER_X + game.aim * PIN_SPACING, BALL_START_Y);
  else if (game.phase === "rolling") drawBall(ctx, game.ballX, game.ballY);
  if (game.phase === "aim") drawAim(ctx, game);
  if (game.phase === "power") drawPowerMeter(ctx, game);
  if (game.message) drawMessage(ctx, game);
}

function drawBall(ctx, x, y) {
  ctx.save(); ctx.translate(x, y);
  ctx.fillStyle = "rgba(0,0,0,.3)";
  ctx.beginPath(); ctx.ellipse(7, 13, BALL_RADIUS * 1.05, BALL_RADIUS * 0.42, 0, 0, Math.PI * 2); ctx.fill();
  const ballGradient = ctx.createRadialGradient(-10, -15, 5, 0, 0, BALL_RADIUS);
  ballGradient.addColorStop(0, "#4a90d9"); ballGradient.addColorStop(0.5, "#1a5a9a"); ballGradient.addColorStop(1, "#0a2a4a");
  ctx.fillStyle = ballGradient; ctx.beginPath(); ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2); ctx.fill();
  const highlight = ctx.createRadialGradient(-12, -15, 2, -8, -10, 20);
  highlight.addColorStop(0, "rgba(255,255,255,.65)"); highlight.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = highlight; ctx.beginPath(); ctx.arc(0, 0, BALL_RADIUS, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "#0a0a0a";
  [[-8, -10, 5], [9, -10, 5], [0, 3, 4]].forEach(([holeX, holeY, radius]) => {
    ctx.fillStyle = "rgba(120,190,255,.65)"; ctx.beginPath(); ctx.arc(holeX - 1, holeY - 1, radius + 1, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#06192b"; ctx.beginPath(); ctx.arc(holeX, holeY, radius, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();
}

function drawAim(ctx, game) {
  const ballX = CENTER_X + game.aim * PIN_SPACING;
  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = "rgba(255,255,255,.34)";
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ballX, BALL_START_Y - 38); ctx.lineTo(ballX, 180); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = "rgba(97,234,255,.48)"; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ballX - 42, 330); ctx.lineTo(ballX, 272); ctx.lineTo(ballX + 42, 330); ctx.stroke();
  ctx.fillStyle = "rgba(97,234,255,.82)";
  ctx.beginPath(); ctx.arc(ballX, 260, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = "rgba(97,234,255,.9)";
  ctx.beginPath(); ctx.moveTo(ballX, BALL_START_Y + 32); ctx.lineTo(ballX - 12, BALL_START_Y + 51); ctx.lineTo(ballX + 12, BALL_START_Y + 51); ctx.closePath(); ctx.fill();
}

function drawPin(ctx) {
  // One connected hourglass silhouette: head, narrow neck, shoulders, body, rounded base.
  ctx.save();
  ctx.fillStyle = "rgba(48,34,19,.26)";
  ctx.shadowColor = "rgba(39,27,13,.24)";
  ctx.shadowBlur = 5;
  ctx.beginPath(); ctx.ellipse(3, 24, 17, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.shadowBlur = 0;
  const gradient = ctx.createLinearGradient(-17, 0, 17, 0);
  gradient.addColorStop(0, "#c8ced5"); gradient.addColorStop(.22, "#fff"); gradient.addColorStop(.58, "#f7f8fa"); gradient.addColorStop(1, "#c4cbd3");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(-7, -32); ctx.quadraticCurveTo(-13, -29, -12, -21);
  ctx.quadraticCurveTo(-10, -16, -15, -7); ctx.quadraticCurveTo(-20, 5, -16, 16);
  ctx.quadraticCurveTo(-14, 24, -7, 25); ctx.quadraticCurveTo(0, 28, 7, 25);
  ctx.quadraticCurveTo(14, 24, 16, 16); ctx.quadraticCurveTo(20, 5, 15, -7);
  ctx.quadraticCurveTo(10, -16, 12, -21); ctx.quadraticCurveTo(13, -29, 7, -32);
  ctx.quadraticCurveTo(0, -36, -7, -32); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.beginPath(); ctx.rect(-11, -23, 22, 10); ctx.clip();
  ctx.fillStyle = "#d92e36"; ctx.fillRect(-14, -21, 28, 3.5); ctx.fillRect(-14, -15, 28, 3.5); ctx.restore();
  ctx.fillStyle = "rgba(255,255,255,.58)";
  ctx.beginPath(); ctx.ellipse(-7, 1, 3, 12, -.12, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

function drawPowerMeter(ctx, game) {
  const x = 460; const y = 200; const width = 28; const height = 300;
  ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.fillRect(x, y, width, height);
  const gradient = ctx.createLinearGradient(0, y + height, 0, y);
  gradient.addColorStop(0, "#00ff00"); gradient.addColorStop(0.5, "#ffff00"); gradient.addColorStop(1, "#ff0000");
  ctx.fillStyle = gradient; ctx.fillRect(x, y + height - height * game.power, width, height * game.power);
  ctx.strokeStyle = "#fff"; ctx.lineWidth = 2; ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = "#fff"; ctx.font = "bold 13px monospace"; ctx.textAlign = "center";
  ctx.fillText("POWER", x + width / 2, y - 10);
  ctx.font = "bold 12px monospace"; ctx.fillText(`${Math.round(game.power * 100)}%`, x + width / 2, y + height + 18);
}

function drawMessage(ctx, game) {
  ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.globalAlpha = Math.min(1, game.messageTimer / 300);
  ctx.fillStyle = "rgba(0,0,0,.5)"; ctx.font = "bold 46px monospace"; ctx.fillText(game.message, CENTER_X + 3, 303);
  ctx.fillStyle = game.messageColor; ctx.shadowColor = game.messageColor; ctx.shadowBlur = 20;
  ctx.fillText(game.message, CENTER_X, 300);
  ctx.restore();
}

export default function BowlingBattle({ onComplete }) {
  const canvasRef = useRef(null);
  const gameRef = useRef(null);
  const keysRef = useRef({ left: false, right: false });
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const [screen, setScreen] = useState("welcome");
  const [names, setNames] = useState(["", ""]);
  const [savedNames, setSavedNames] = useState(["Player 1", "Player 2"]);
  const [selectedMode, setSelectedMode] = useState("aim");
  const [, setHudTick] = useState(0);

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  const refresh = useCallback(() => setHudTick((tick) => tick + 1), []);
  const startMatch = useCallback((playerNames = savedNames) => {
    gameRef.current = createGame(playerNames, selectedMode);
    completedRef.current = false;
    refresh();
    setScreen("game");
  }, [refresh, savedNames, selectedMode]);

  useEffect(() => {
    if (screen !== "results" || completedRef.current || !gameRef.current) return;
    completedRef.current = true;
    const match = gameRef.current;
    const highScore = Math.max(...match.players.map((player) => player.finalScore));
    const totalPins = match.players.reduce((sum, player) => sum + player.rolls.reduce((playerTotal, pins) => playerTotal + pins, 0), 0);
    onCompleteRef.current?.(highScore, Math.round(totalPins / 2));
  }, [screen]);

  useEffect(() => {
    if (screen !== "game") return undefined;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const game = gameRef.current;
    if (!canvas || !ctx || !game) return undefined;
    let frameId = 0;
    let previousTime = 0;
    let active = true;

    const say = (text, color, duration) => {
      game.message = text;
      game.messageColor = color;
      game.messageTimer = duration;
    };
    const updateHUD = () => refresh();
    const finishRoll = () => {
      const player = game.players[game.currentPlayerIdx];
      const knockedCount = game.knockedThisRoll.length;
      player.rolls.push(knockedCount);
      const lastRoll = player.rolls[player.rolls.length - 2];
      const isStrike = player.rollInFrame === 1 && knockedCount === 10;
      const isSpare = player.frame < 10
        ? player.rollInFrame === 2 && lastRoll !== undefined && lastRoll + knockedCount === 10
        : player.rollInFrame === 2 && lastRoll !== undefined && lastRoll !== 10 && lastRoll + knockedCount === 10;
      if (game.gutter) say("GUTTER!", "#ff6b6b", 1400);
      else if (isStrike) { say("STRIKE!", "#f7e05e", 1700); player.strikes += 1; }
      else if (isSpare) { say("SPARE!", "#6bb5ff", 1400); player.spares += 1; }
      else if (knockedCount === 0) say("MISS!", "#aaa", 900);
      else say(`${knockedCount} PIN${knockedCount > 1 ? "S" : ""}`, "#fff", 800);
      game.phase = "result";
      game.messageTimer = 1400;
      game.resultData = { knockedCount };
      updateHUD();
    };

    const advanceAfterResult = () => {
      const player = game.players[game.currentPlayerIdx];
      const knocked = game.resultData.knockedCount;
      const roll = player.rollInFrame;
      let action = "nextRoll";
      if (player.frame < 10) {
        if (roll === 1) {
          if (knocked === 10) action = "nextFrame";
          else player.rollInFrame = 2;
        } else action = "nextFrame";
      } else if (roll === 1) {
        if (knocked === 10) resetPins(game);
        player.rollInFrame = 2;
      } else if (roll === 2) {
        const first = player.rolls[player.rolls.length - 2];
        if (first === 10 || first + knocked === 10) { resetPins(game); player.rollInFrame = 3; }
        else action = "finishPlayer";
      } else action = "finishPlayer";

      game.message = "";
      if (action === "nextFrame") {
        player.frame += 1;
        if (player.frame > 10) action = "finishPlayer";
        else { player.rollInFrame = 1; resetPins(game); }
      }
      if (action === "finishPlayer") {
        player.finished = true;
        player.finalScore = scoreTotal(player.rolls);
      }
      if (action === "nextRoll") {
        prepareNextRoll(game);
      } else {
        const nextPlayer = game.currentPlayerIdx === 0 ? 1 : 0;
        if (player.finished && game.players[nextPlayer].finished) {
          updateHUD();
          setScreen("results");
          return;
        }
        if (!game.players[nextPlayer].finished) game.currentPlayerIdx = nextPlayer;
        resetPins(game);
        prepareNextRoll(game);
      }
      updateHUD();
    };

    const update = (delta, now) => {
      if (game.phase === "cardReveal") {
        game.cardRevealTimer -= delta;
        if (game.cardRevealTimer <= 0 && game.chosenCard) {
          const standingPins = game.pins.filter((pin) => pin.standing);
          const knocked = standingPins.slice(0, game.chosenCard.knocked).map((pin) => pin.id);
          beginRoll(game, { gutter: false, knocked });
          updateHUD();
        }
      } else if (game.phase === "aim") {
        if (keysRef.current.left) game.aim = Math.max(-1.4, game.aim - 0.05);
        if (keysRef.current.right) game.aim = Math.min(1.4, game.aim + 0.05);
      } else if (game.phase === "power") {
        game.power += game.powerDir * delta * 0.0015;
        if (game.power > 1) { game.power = 1; game.powerDir = -1; }
        if (game.power < 0) { game.power = 0; game.powerDir = 1; }
      } else if (game.phase === "rolling") {
        const progress = Math.min(1, (now - game.rollStartTime) / 900);
        const eased = 1 - (1 - progress) ** 3;
        game.ballY = BALL_START_Y - (BALL_START_Y - BALL_END_Y) * eased;
        if (game.ballY <= PIN_START_Y && !game.pinsSettled) {
          game.knockedThisRoll.forEach((id) => {
            const pin = game.pins.find((candidate) => candidate.id === id);
            if (pin?.standing) { pin.standing = false; pin.fallDir = Math.random() < 0.5 ? -1 : 1; }
          });
          game.pinsSettled = true;
        }
        game.pins.forEach((pin) => {
          if (!pin.standing && pin.fallProgress < 1) pin.fallProgress = Math.min(1, pin.fallProgress + delta * 0.003);
        });
        if (progress >= 1) {
          if (!game.rollCompleteTime) game.rollCompleteTime = now;
          else if (now - game.rollCompleteTime > 600) { finishRoll(); game.rollCompleteTime = null; }
        }
      } else if (game.phase === "result") {
        game.messageTimer -= delta;
        if (game.messageTimer <= 0) advanceAfterResult();
      }
    };

    const loop = (now) => {
      if (!active) return;
      const delta = previousTime ? now - previousTime : 16;
      previousTime = now;
      update(delta, now);
      drawLane(ctx, game);
      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => { active = false; cancelAnimationFrame(frameId); };
  }, [screen, refresh]);

  useEffect(() => {
    if (screen !== "game") return undefined;
    const keys = keysRef.current;
    const onKeyDown = (event) => {
      if (!["ArrowLeft", "ArrowRight", " ", "r", "R"].includes(event.key)) return;
      if (event.target?.matches?.("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      if (event.key === "r" || event.key === "R") { setScreen("menu"); return; }
      if (event.key === "ArrowLeft") keys.left = true;
      if (event.key === "ArrowRight") keys.right = true;
      if (event.key === " ") {
        const game = gameRef.current;
        if (game?.phase === "aim") game.phase = "power";
        else if (game?.phase === "power") beginRoll(game);
      }
    };
    const onKeyUp = (event) => {
      if (event.key === "ArrowLeft") keys.left = false;
      if (event.key === "ArrowRight") keys.right = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      keys.left = false;
      keys.right = false;
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [screen]);

  const game = gameRef.current;
  const toggleAction = () => {
    if (!game) return;
    if (game.phase === "aim") game.phase = "power";
    else if (game.phase === "power") beginRoll(game);
    refresh();
  };
  const chooseCard = (card) => {
    if (!game || game.phase !== "cardPick") return;
    game.chosenCard = card;
    game.phase = "cardReveal";
    game.cardRevealTimer = 850;
    game.message = `${card.knocked} PIN${card.knocked === 1 ? "" : "S"}`;
    game.messageColor = "#f7e05e";
    game.messageTimer = 850;
    refresh();
  };

  const finishPlayerNames = (event) => {
    event.preventDefault();
    const safeNames = names.map((name, index) => name.trim().slice(0, 14) || `Player ${index + 1}`);
    setSavedNames(safeNames);
    setScreen("menu");
  };
  const showMenu = () => setScreen("menu");
  const currentPlayer = game?.players[game.currentPlayerIdx];
  const currentFrames = currentPlayer ? scoreFrames(currentPlayer.rolls) : [];
  const currentScore = currentPlayer ? scoreTotal(currentPlayer.rolls) : 0;
  const bestScore = game ? Math.max(...game.players.map((player) => player.finalScore)) : 0;

  return (
    <main className={`bowling-battle-game is-${screen}${screen === "game" ? " is-wide" : ""}`}>
      <style>{STYLES}</style>
      {screen === "welcome" && <section className="bb-screen active bb-welcome">
        <span className="bb-eyebrow">TWO PLAYER ARCADE</span>
        <h1 className="bb-logo"><span>Bowling</span><span>Battle</span></h1>
        <p className="bb-tag">Pick your line. Knock down every pin.</p>
        <button className="bb-btn bb-primary" onClick={() => setScreen("input")}>Play</button>
      </section>}

      {screen === "input" && <section className="bb-screen active bb-input-screen">
        <div className="bb-player-panel">
          <h2 className="bb-heading">WHO&apos;S PLAYING?</h2>
          <p className="bb-player-subtitle">Choose your players</p>
          <form className="bb-name-form" onSubmit={finishPlayerNames}>
            <div className="bb-player-matchup">
              {names.map((name, index) => <label className={`bb-field bb-player-card bb-p${index + 1}`} key={index}>
                <span className="bb-player-label">PLAYER {index + 1}</span>
                <span className="bb-player-icon" aria-hidden="true">🎳</span>
                <span className="bb-player-prompt">Enter your name</span>
                <input value={name} maxLength={14} placeholder={`Player ${index + 1}`} onChange={(event) => setNames((previous) => previous.map((value, item) => item === index ? event.target.value : value))} />
              </label>)}
              <span className="bb-versus" aria-label="versus">VS</span>
            </div>
            <div className="bb-button-row">
              <button type="button" className="bb-btn bb-back-btn" onClick={() => setScreen("welcome")}>← BACK</button>
              <button className="bb-btn bb-primary bb-continue-btn" type="submit">CONTINUE →</button>
            </div>
          </form>
        </div>
      </section>}

      {screen === "menu" && <section className="bb-screen active bb-menu-screen">
        <h2 className="bb-heading">Main Menu</h2>
        <div className="bb-mode-picker" role="group" aria-label="Choose a game mode">{PLAYER_MODES.map((mode) => <button type="button" key={mode.id} className={`bb-mode-card${selectedMode === mode.id ? " selected" : ""}`} aria-pressed={selectedMode === mode.id} onClick={() => setSelectedMode(mode.id)}><strong>{mode.name}</strong><span>{mode.detail}</span></button>)}</div>
        <div className="bb-menu-names">{savedNames.map((name, index) => <div className={`bb-menu-card bb-p${index + 1}`} key={name + index}><span>Player {index + 1}</span><strong>{name}</strong></div>)}</div>
        <div className="bb-button-row">
          <button className="bb-btn bb-small" onClick={() => setScreen("input")}>✎ Edit names</button>
          <button className="bb-btn bb-primary" onClick={() => startMatch()}>Start Game</button>
        </div>
      </section>}

      {screen === "game" && game && <section className="bb-screen active bb-game-screen">
        <div className="bb-lane-column">
          <canvas ref={canvasRef} className="bb-canvas" width={WIDTH} height={HEIGHT} aria-label="Bowling lane. Use the left and right arrow keys to aim and Space to set power and roll." />
          <div className="bb-mobile-controls">
            <button className="bb-btn bb-steer" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); keysRef.current.left = true; }} onPointerUp={() => { keysRef.current.left = false; }} onPointerCancel={() => { keysRef.current.left = false; }} aria-label="Aim left">←</button>
            <button className="bb-btn bb-primary bb-roll" disabled={!(["aim", "power"].includes(game.phase))} onClick={toggleAction}>{game.phase === "aim" ? "Set Power" : game.phase === "power" ? "Roll!" : game.phase === "rolling" ? "Rolling…" : game.mode === "card" && game.phase === "cardPick" ? "Choose a card" : game.phase === "cardReveal" ? "Revealing…" : "Next"}</button>
            <button className="bb-btn bb-steer" onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); keysRef.current.right = true; }} onPointerUp={() => { keysRef.current.right = false; }} onPointerCancel={() => { keysRef.current.right = false; }} aria-label="Aim right">→</button>
          </div>
          <div className="bb-controls-hint">{game.mode === "card" ? <span>Choose a card to roll</span> : <><span><kbd>←</kbd> <kbd>→</kbd> Aim</span><span><kbd>Space</kbd> Set power / roll</span></>}<span><kbd>R</kbd> Menu</span></div>
        </div>
        <aside className="bb-side-column">
          <div className="bb-top-info">
            <div className="bb-info-row">
              <div className="bb-frame-status"><span><small>FRAME</small><strong>{Math.min(currentPlayer?.frame || 1, 10)}</strong></span><i aria-hidden="true" /><span><small>ROLL</small><strong>{currentPlayer?.rollInFrame || 1}</strong></span></div>
              <button className="bb-btn bb-small" onClick={showMenu}>↻ Menu</button>
            </div>
            <div className="bb-score-display"><span>SCORE</span><strong>{currentScore}</strong></div>
          </div>
          <div className="bb-scorecards">
            {game.players.map((player, playerIndex) => <div className={`bb-scorecard${game.currentPlayerIdx === playerIndex ? " active" : ""}`} key={player.name + playerIndex}>
              <div className="bb-scorecard-label"><strong>{player.name}</strong><span>PLAYER {playerIndex + 1}</span></div>
              <div className="bb-score-grid">
                <div className="bb-frame-row">{FRAME_LABELS.map((frame) => <span key={frame}>{frame}</span>)}</div>
                <div className="bb-roll-row">{currentFrames.length && playerIndex === game.currentPlayerIdx ? currentFrames.map((frame, index) => <span key={index}>{frame.display}</span>) : scoreFrames(player.rolls).map((frame, index) => <span key={index}>{frame.display}</span>)}</div>
                <div className="bb-frame-score-row">{scoreFrames(player.rolls).map((frame, index) => <span key={index}>{frame.cumulative ?? ""}</span>)}</div>
              </div>
            </div>)}
          </div>
          {game.mode === "card" && <div className="bb-card-move"><div className="bb-card-heading"><div><strong>CHOOSE YOUR ROLL</strong><span>Pick a card to reveal your pin challenge.</span></div>{game.chosenCard && <b className="bb-card-result">{game.chosenCard.knocked} PINS</b>}</div><div className="bb-card-grid">{game.cards.map((card) => <button type="button" key={card.id} className={`bb-pick-card${game.chosenCard?.id === card.id ? " flipped" : ""}`} onClick={() => chooseCard(card)} disabled={game.phase !== "cardPick"} aria-label={game.chosenCard?.id === card.id ? `Card ${card.id}, ${card.knocked} pins` : `Choose hidden card ${card.id}`}><span className="bb-card-number">{card.id}</span>{game.chosenCard?.id === card.id ? <><strong>{card.knocked}</strong><small>{card.knocked === 1 ? "PIN" : "PINS"}</small></> : <span className="bb-card-back-mark" aria-hidden="true" />}</button>)}</div></div>}
        </aside>
      </section>}

      {screen === "results" && game && <section className="bb-screen active">
        <h2 className="bb-results-title">🏆 Final Results</h2>
        <div className="bb-results-row">{game.players.map((player, index) => {
          const other = game.players[1 - index];
          const winner = player.finalScore > other.finalScore;
          return <article className={`bb-result-card${winner ? " winner" : ""}`} key={player.name + index}>
            <span>{winner ? "👑 Winner" : game.players[0].finalScore === game.players[1].finalScore ? "Tie game" : `Player ${index + 1}`}</span>
            <strong>{player.name}</strong><b>{player.finalScore}</b>
            <small>🔥 {player.strikes} strikes · 🎯 {player.spares} spares</small>
          </article>;
        })}</div>
        <div className="bb-button-row">
          <button className="bb-btn bb-small" onClick={showMenu}>Main Menu</button>
          <button className="bb-btn bb-primary" onClick={() => startMatch()}>Rematch</button>
        </div>
        <span className="bb-sr-only">Winning score {bestScore}</span>
      </section>}
    </main>
  );
}

const STYLES = `
.bowling-battle-game{--bb-bg:#071633;--bb-panel:#0b1b3b;--bb-panel2:#102851;--bb-border:#123d78;--bb-border2:#2460a4;--bb-text:#f0f7ff;--bb-muted:#a6bddc;--bb-accent:#61eaff;--bb-blue:#4aa8ff;--bb-coral:#ff966e;box-sizing:border-box;display:flex;justify-content:center;align-items:center;flex:0 1 auto;width:min(94%,560px);max-height:calc(100dvh - 96px);overflow:auto;margin:auto;padding:clamp(14px,2vw,24px);border:1px solid var(--bb-border);border-radius:28px;background:radial-gradient(circle at 30% 20%,#122c59,var(--bb-bg) 72%),var(--bb-panel);color:var(--bb-text);font-family:'Segoe UI',system-ui,sans-serif;box-shadow:0 25px 40px rgba(0,0,0,.45),inset 0 1px 4px rgba(255,255,255,.06)}
@media(max-width:760px){.bowling-battle-game.is-wide{flex:1 1 auto;width:100%;max-width:680px;max-height:calc(100dvh - 90px);padding:12px}.bb-game-screen{flex-direction:column;align-items:center;overflow:auto}.bb-lane-column,.bb-side-column{width:100%;max-width:100%;flex:none}.bb-canvas{width:auto;height:min(46dvh,420px);max-width:100%}.bb-side-column{gap:7px}.bb-scorecards{display:grid;grid-template-columns:1fr 1fr;gap:7px}.bb-scorecard{padding:6px}.bb-roll-row span,.bb-frame-score-row span,.bb-frame-row span{font-size:.5rem}.bb-pick-card{min-height:58px}.bb-mobile-controls{display:flex;width:min(100%,420px);justify-content:space-between;gap:8px}.bb-steer{width:56px;padding:8px;font-size:1.2rem}.bb-roll{flex:1}.bb-controls-hint{font-size:.56rem}}
@media(max-width:420px){.bowling-battle-game:not(.is-wide){width:100%;padding:16px;border:0;border-radius:0}.bb-mode-picker{grid-template-columns:1fr}.bb-mode-card{min-height:74px}.bb-menu-names{gap:8px}.bb-menu-card{padding:11px 8px}.bb-results-row{gap:8px}.bb-result-card{padding:12px 6px}.bb-result-card small{font-size:.58rem}.bb-card-heading{align-items:flex-start;flex-direction:column;gap:2px}}
@media(max-height:760px) and (min-width:761px){.bowling-battle-game.is-wide{padding:8px}.bb-canvas{height:min(64dvh,560px)}.bb-side-column{gap:6px}.bb-scorecard{padding:5px}.bb-card-grid{gap:5px}.bb-pick-card{min-height:58px}.bb-controls-hint span{padding:3px 6px}}
.bb-welcome,.bb-input-screen,.bb-menu-screen{min-height:clamp(390px,52dvh,570px);padding:clamp(22px,4vw,40px);border:1px solid rgb(116 198 255 / .3);border-radius:22px;background-position:center;background-size:cover;box-shadow:inset 0 0 0 1px rgb(255 255 255 / .08),0 14px 34px rgb(0 0 0 / .24)}
.bb-welcome{background-image:linear-gradient(115deg,rgb(4 18 49 / .72),rgb(4 19 47 / .25)),url('/assets/games/bowling-battle/bowling-battle-welcome-bg.webp')}
.bb-input-screen{background-image:linear-gradient(115deg,rgb(4 18 49 / .7),rgb(4 19 47 / .35)),url('/assets/games/bowling-battle/bowling-battle-user-input-bg.webp')}
.bb-menu-screen{background-image:linear-gradient(115deg,rgb(4 18 49 / .75),rgb(4 19 47 / .35)),url('/assets/games/bowling-battle/bowling-battle-main-menu-bg.webp')}
.bb-game-screen{position:relative;isolation:isolate;overflow:hidden;border:1px solid rgb(94 176 255 / .25);border-radius:22px;background:linear-gradient(110deg,rgb(4 16 41 / .75),rgb(5 20 48 / .88)),url('/assets/games/bowling-battle/bowling-battle-game-screen-bg.webp') center / cover no-repeat;box-shadow:0 16px 40px rgb(0 0 0 / .32)}
.bb-side-column{padding:clamp(10px,1.5vw,16px);border:1px solid rgb(102 173 255 / .2);border-radius:18px;background:rgb(5 19 45 / .78);backdrop-filter:blur(7px)}
.bb-mode-card{background:linear-gradient(145deg,rgb(11 38 79 / .91),rgb(6 24 56 / .92))}.bb-mode-card.selected{background:linear-gradient(145deg,rgb(14 63 120 / .95),rgb(7 37 78 / .95))}
.bb-pick-card{border-color:#2474b8;background:repeating-linear-gradient(135deg,#123c70,#123c70 8px,#0d2c57 8px,#0d2c57 16px)}
.bowling-battle-game .bb-primary{border-color:#69efff;background:linear-gradient(180deg,#74f0ff,#24bde9);color:#031831;box-shadow:0 5px 18px rgb(36 189 233 / .26)}
.bb-mode-card.selected{box-shadow:0 0 0 2px rgb(97 234 255 / .2),inset 0 0 24px rgb(97 234 255 / .12)}
.bb-scorecard{border-color:#174777;background:#0a2144;box-shadow:inset 0 2px 8px rgb(0 7 23 / .5)}.bb-frame-row span{background:#163660}.bb-roll-row span{background:#102b50}.bb-frame-score-row span{background:#0b1f3d}
.bb-roll-indicators span{border-color:#17395f;background:#091b36;color:#91aac9}.bb-roll-indicators span.active{border-color:var(--bb-accent);background:rgb(97 234 255 / .12);color:var(--bb-accent)}
.bowling-battle-game.is-welcome,.bowling-battle-game.is-menu,.bowling-battle-game.is-results{width:min(94%,1060px);max-width:1060px;min-height:min(70dvh,760px);padding:clamp(28px,5vw,64px);border-color:rgb(111 197 255 / .38);border-radius:32px;background:linear-gradient(145deg,rgb(8 28 68 / .42),rgb(5 17 45 / .66)),var(--bb-bg);box-shadow:0 28px 75px rgb(0 0 0 / .42),inset 0 1px 0 rgb(255 255 255 / .12)}
.bowling-battle-game.is-input{width:min(94%,850px);max-width:850px;min-height:min(64dvh,700px);padding:clamp(28px,5vw,62px);border-color:rgb(111 197 255 / .38);border-radius:32px;background:linear-gradient(145deg,rgb(8 28 68 / .38),rgb(5 17 45 / .7)),var(--bb-bg);box-shadow:0 28px 75px rgb(0 0 0 / .42),inset 0 1px 0 rgb(255 255 255 / .12)}
.bb-welcome{gap:22px}.bb-eyebrow{border:1px solid rgb(97 234 255 / .48);border-radius:999px;padding:9px 17px;background:rgb(4 25 54 / .72);color:var(--bb-accent);font-size:.78rem;font-weight:900;letter-spacing:.2em}.bb-logo{max-width:900px;font-size:clamp(3rem,7vw,5.6rem);letter-spacing:-.045em;line-height:.98;text-shadow:0 5px 28px rgb(0 0 0 / .5),0 0 24px rgb(97 234 255 / .25)}.bb-tag{max-width:650px;font-size:clamp(1.05rem,2vw,1.35rem);line-height:1.55;color:#e0edff;text-shadow:0 2px 10px #00112b}.bb-welcome-pins{padding:10px 18px;border:1px solid rgb(255 255 255 / .2);border-radius:18px;background:rgb(7 27 60 / .64);font-size:clamp(2.7rem,5vw,4rem);letter-spacing:.2em}.bb-welcome>.bb-primary{min-width:240px;min-height:60px;padding:16px 36px;font-size:1.15rem}
.bb-heading{font-size:clamp(2rem,4.5vw,3rem);letter-spacing:-.025em;text-shadow:0 4px 20px rgb(0 0 0 / .48)}.bb-name-form{max-width:660px;gap:22px}.bb-field{font-size:.85rem;letter-spacing:.12em}.bb-field span{margin-bottom:9px}.bb-field input{min-height:62px;border-color:rgb(136 192 255 / .42);border-radius:16px;padding:16px 20px;background:rgb(6 25 57 / .88);font-size:1.18rem;box-shadow:inset 0 2px 8px rgb(0 0 0 / .2)}.bb-input-screen>.bb-heading{margin-bottom:16px}.bb-name-form .bb-button-row{margin-top:10px}.bb-name-form .bb-btn{min-height:54px;font-size:1rem}
.bb-menu-screen{gap:22px}.bb-menu-screen .bb-heading{margin-bottom:4px}.bb-mode-picker{gap:16px}.bb-mode-card{min-height:142px;gap:11px;border-radius:20px;padding:22px;background:linear-gradient(145deg,rgb(8 35 75 / .94),rgb(6 24 55 / .95));box-shadow:0 12px 24px rgb(0 8 28 / .25);transition:transform .18s,border-color .18s,box-shadow .18s}.bb-mode-card:hover{transform:translateY(-3px);border-color:var(--bb-accent)}.bb-mode-card strong{font-size:1.32rem}.bb-mode-card span{max-width:34ch;font-size:.94rem;line-height:1.5}.bb-mode-card.selected{border-width:2px;background:linear-gradient(145deg,rgb(13 58 112 / .97),rgb(6 31 70 / .97));box-shadow:0 0 0 3px rgb(97 234 255 / .12),0 14px 30px rgb(0 8 28 / .3)}.bb-menu-names{gap:16px}.bb-menu-card{border-radius:18px;padding:18px;background:rgb(7 28 61 / .9);box-shadow:0 10px 22px rgb(0 8 28 / .25)}.bb-menu-card span{font-size:.78rem}.bb-menu-card strong{margin-top:8px;font-size:1.2rem}.bb-menu-screen .bb-button-row{max-width:650px;margin-top:4px;gap:16px}.bb-menu-screen .bb-button-row .bb-btn{min-height:54px;font-size:.98rem}
.bb-screen.active.bb-game-screen{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(320px,.9fr);grid-template-rows:auto auto auto;align-items:start;gap:clamp(14px,2vw,24px);padding:clamp(16px,2vw,28px)}.bb-lane-column{display:contents}.bb-canvas{grid-column:1;grid-row:1 / 4;align-self:start}.bb-side-column{grid-column:2;grid-row:1 / 3;align-self:start;width:100%;min-width:0;max-width:none;gap:12px}.bb-mobile-controls{grid-column:2;grid-row:2;display:none;width:100%;align-items:center;justify-content:stretch;gap:10px;padding:10px;border:1px solid #303c52;border-radius:15px;background:linear-gradient(145deg,#171f2e,#101722)}.bb-controls-hint{grid-column:2;grid-row:3;justify-content:flex-start;gap:8px;padding:13px;border:1px solid #2b3547;border-radius:15px;background:linear-gradient(145deg,#151d2b,#0f1520);font-size:.68rem}.bb-controls-hint span{border-color:#35445e;border-radius:10px;padding:8px 10px;background:#1c2738}.bb-controls-hint kbd{padding:3px 6px;font-size:.68rem}.bb-steer{min-width:54px;min-height:50px;border-radius:13px;padding:10px;font-size:1.25rem}.bb-roll{min-height:50px;border-radius:13px;font-size:.92rem}.bb-game-screen .bb-card-move{padding:12px;border:1px solid #34445d;border-radius:15px;background:linear-gradient(145deg,#151e2e,#0d1522)}.bb-game-screen .bb-card-heading strong{font-size:.92rem}.bb-game-screen .bb-card-heading span{font-size:.72rem}.bb-game-screen .bb-pick-card{min-height:84px;border-radius:14px}
.bb-screen.active.bb-game-screen{padding-top:clamp(28px,4vh,44px)}
.bowling-battle-game.is-wide{width:min(96%,1320px);max-width:1320px;max-height:calc(100dvh - 90px);padding:clamp(14px,2vw,26px);overflow:auto;border-color:#2b3243;border-radius:30px;background:linear-gradient(145deg,#111726,#0b0f18 68%,#101726);box-shadow:0 24px 70px rgb(0 0 0 / .5),inset 0 1px 4px rgb(255 255 255 / .05)}
.bb-game-screen{align-items:stretch;gap:clamp(16px,2vw,28px);padding:clamp(12px,2vw,24px);border-color:#292f3e;border-radius:24px;background:radial-gradient(ellipse at 30% 25%,#182131 0,#0b0e17 66%);box-shadow:none}
.bb-lane-column{flex:1 1 62%}.bb-side-column{width:35%;min-width:320px;max-width:440px;flex:1 1 35%;align-self:flex-start;border-color:#2b3344;background:linear-gradient(160deg,#141a27,#0c1019);backdrop-filter:none}
.bb-canvas{height:min(84dvh,980px);border-radius:20px;background:#090d16;box-shadow:0 0 0 2px #2b3242,0 18px 30px rgb(0 0 0 / .38)}
@media(max-width:640px){.bowling-battle-game.is-wide{width:100%;max-width:680px;padding:12px}.bb-screen.active.bb-game-screen{display:flex;flex-direction:column;align-items:center;overflow:auto}.bb-lane-column{display:flex;width:100%;max-width:100%;flex:none}.bb-side-column{width:100%;max-width:100%;min-width:0;flex:none;align-self:stretch}.bb-canvas{height:min(46dvh,420px);max-width:100%}.bb-mobile-controls{display:flex}.bb-controls-hint{grid-column:auto;grid-row:auto;width:100%;flex-wrap:wrap;justify-content:center}.bb-welcome,.bb-input-screen,.bb-menu-screen{min-height:min(66dvh,650px)}.bowling-battle-game.is-welcome,.bowling-battle-game.is-menu,.bowling-battle-game.is-results{width:min(96%,860px);padding:clamp(20px,5vw,44px)}.bowling-battle-game.is-input{width:min(96%,760px);padding:clamp(20px,5vw,42px)}}
@media(max-width:480px){.bb-mode-picker{grid-template-columns:1fr}.bb-mode-card{min-height:100px}.bb-menu-screen{gap:15px}.bb-menu-names{gap:10px}.bb-menu-card{padding:13px 9px}.bb-menu-card strong{font-size:1rem}.bb-welcome{gap:16px}.bb-welcome>.bb-primary{min-width:210px}.bb-controls-hint{gap:6px;padding:9px}.bb-controls-hint span{padding:6px}.bb-scorecards{grid-template-columns:1fr}}
@media(max-height:760px) and (min-width:761px){.bb-canvas{height:min(64dvh,560px)}}
.bb-side-column{min-height:100%;gap:14px;padding:clamp(14px,1.6vw,22px);border:1px solid #313a4c;border-radius:22px;background:linear-gradient(155deg,#151c29,#0c111b 78%);box-shadow:0 16px 36px rgb(0 0 0 / .2),inset 0 1px 0 rgb(255 255 255 / .04)}
.bb-top-info{gap:12px}.bb-info-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px}.bb-frame-status{display:flex;min-height:74px;align-items:center;justify-content:center;gap:20px;border:1px solid #344158;border-radius:16px;background:linear-gradient(145deg,#202a3a,#151d2a);box-shadow:inset 0 1px 0 rgb(255 255 255 / .04)}.bb-frame-status>span{display:grid;justify-items:center;gap:3px}.bb-frame-status small{color:#a5b6cf;font-size:.64rem;font-weight:900;letter-spacing:.15em}.bb-frame-status strong{color:#fff;font-size:1.25rem;line-height:1}.bb-frame-status i{width:1px;height:34px;background:#3b4960}.bb-info-row>.bb-btn{min-width:74px;min-height:48px;border-radius:14px}
.bb-score-display{display:flex;min-height:116px;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:1px solid #554b2d;border-radius:18px;background:linear-gradient(145deg,#202334,#171b27);box-shadow:inset 0 1px 0 rgb(255 255 255 / .05)}.bb-score-display>span{color:#d5c784;font-size:.68rem;font-weight:900;letter-spacing:.2em}.bb-score-display>strong{color:#ffe27a;font-size:clamp(2.5rem,4vw,3.25rem);font-weight:950;line-height:.95;text-shadow:0 4px 18px rgb(255 202 69 / .16)}
.bb-turn-banner{display:flex;min-height:70px;align-items:center;justify-content:flex-start;gap:14px;padding:12px 18px;border-radius:16px;text-align:left;letter-spacing:.02em;text-transform:none}.bb-turn-banner.bb-p1{border-color:#4aa8ff77;background:linear-gradient(110deg,rgb(49 139 234 / .2),rgb(49 139 234 / .07));color:#d7edff}.bb-turn-banner.bb-p2{border-color:#ff966e77;background:linear-gradient(110deg,rgb(255 150 110 / .2),rgb(255 150 110 / .07));color:#ffe2d6}.bb-turn-dot{width:16px;height:16px;flex:0 0 16px;border:3px solid currentColor;border-radius:50%;background:currentColor;box-shadow:0 0 14px currentColor}.bb-turn-banner>div{display:grid;gap:2px}.bb-turn-banner small{font-size:.62rem;font-weight:900;letter-spacing:.16em;opacity:.8}.bb-turn-banner strong{font-size:1.05rem;font-weight:900}.bb-turn-banner b{font-size:.67rem;letter-spacing:.14em}
.bb-roll-indicators{gap:8px}.bb-roll-indicators span{min-height:34px;display:grid;place-items:center;border-radius:10px;font-size:.68rem;letter-spacing:.08em}.bb-scorecards{gap:10px}.bb-scorecard{width:100%;min-width:0;padding:10px;border:1px solid #303b50;border-radius:15px;background:linear-gradient(145deg,#141d2b,#0d1420);box-shadow:inset 0 1px 0 rgb(255 255 255 / .035)}.bb-scorecard.active{border-color:#55c9fa;box-shadow:0 0 0 1px rgb(85 201 250 / .15),inset 0 1px 0 rgb(255 255 255 / .04)}.bb-scorecard-label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;color:#fff;font-size:.78rem;letter-spacing:.02em}.bb-scorecard-label strong{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:.9rem}.bb-scorecard-label span{flex:0 0 auto;border:1px solid #394b66;border-radius:999px;padding:4px 7px;color:#9fb4d2;font-size:.55rem;letter-spacing:.12em}
.bb-score-grid{display:grid;width:100%;min-width:0;gap:4px}.bb-frame-row,.bb-roll-row,.bb-frame-score-row{display:grid!important;width:100%!important;min-width:0;grid-template-columns:repeat(10,minmax(0,1fr))!important;gap:4px!important}.bb-frame-row span,.bb-roll-row span,.bb-frame-score-row span{display:grid;min-width:0;min-height:27px;place-items:center;overflow:hidden;border:1px solid #27354a;border-radius:6px;padding:3px 1px;text-align:center;white-space:nowrap;font-size:.66rem;font-weight:800;line-height:1}.bb-frame-row span{border-color:#33435c;background:#1c2a3d;color:#b4c5dd;font-size:.61rem}.bb-roll-row span{background:#111c2b;color:#f4f7fd}.bb-frame-score-row span{min-height:23px;border-color:#25384f;background:#0e1825;color:#f2d879;font-size:.62rem}.bb-score-grid>*{min-width:0}
.bb-card-move{width:100%;min-width:0;gap:12px;padding:16px;border:1px solid #35445c;border-radius:18px;background:linear-gradient(150deg,#182334,#0e1725);box-shadow:inset 0 1px 0 rgb(255 255 255 / .045)}.bb-card-heading{align-items:center;gap:10px}.bb-card-heading>div{display:grid;gap:5px}.bb-card-heading strong{font-size:.82rem;letter-spacing:.15em;color:#d7eaff}.bb-card-heading span{max-width:32ch;font-size:.76rem;line-height:1.4;color:#aebed3;text-align:left}.bb-card-result{flex:0 0 auto;border:1px solid #e6c96355;border-radius:999px;padding:7px 10px;background:#d4a93519;color:#ffe27a;font-size:.7rem;letter-spacing:.08em}.bb-card-grid{display:grid!important;width:100%!important;min-width:0;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;perspective:700px}.bb-pick-card{display:flex!important;width:100%!important;min-width:0!important;height:100px;min-height:100px!important;align-items:center;justify-content:center;position:relative;border:1px solid #46658a;border-radius:16px;background:linear-gradient(145deg,#1e4e83,#102b51 72%);box-shadow:inset 0 1px 0 rgb(255 255 255 / .13),0 8px 17px rgb(0 0 0 / .25);transition:transform .2s ease,border-color .2s ease,box-shadow .2s ease}.bb-pick-card::after{position:absolute;inset:8px;content:"";border:1px solid rgb(150 204 255 / .14);border-radius:11px;pointer-events:none}.bb-pick-card:hover:not(:disabled){transform:translateY(-3px) rotate(-1deg);border-color:#79dfff;box-shadow:0 12px 22px rgb(0 0 0 / .32),0 0 18px rgb(80 194 255 / .13)}.bb-card-number{top:10px;left:12px;color:#d1e7ff;font-size:.74rem}.bb-card-back-mark{font-size:2.1rem;font-weight:900;color:#f2f8ff;text-shadow:0 2px 8px #06162c}.bb-pick-card.flipped{animation:bb-card-reveal .42s cubic-bezier(.2,.8,.2,1);border-color:#ffe27a;background:linear-gradient(145deg,#fff0a8,#d9ad43 82%);color:#332400;box-shadow:inset 0 1px 0 #fff9d5,0 9px 20px rgb(0 0 0 / .28)}.bb-pick-card.flipped::after{border-color:rgb(104 77 17 / .22)}.bb-pick-card.flipped .bb-card-number{color:#594510}.bb-pick-card>strong{font-size:2rem}.bb-pick-card>small{margin-top:3px;font-size:.66rem;letter-spacing:.14em}.bb-pick-card:disabled:not(.flipped){opacity:.55}.bb-pick-card.flipped:disabled{opacity:1}
.bb-controls-hint{display:flex;flex-wrap:wrap;align-items:center;gap:7px;padding:9px 0;border:0;border-top:1px solid #263246;border-radius:0;background:transparent;color:#9eafc6;font-size:.61rem}.bb-controls-hint span{border:0;border-radius:7px;padding:5px 7px;background:#161f2d}.bb-controls-hint kbd{border-color:#465a77;background:#243146;color:#d8e5f6}.bb-turn-banner,.bb-scorecard,.bb-card-move,.bb-pick-card{box-sizing:border-box}
@media(min-width:641px){.bb-canvas{height:min(74dvh,840px)}.bb-side-column{gap:9px;padding:14px}.bb-frame-status{min-height:60px}.bb-score-display{min-height:82px}.bb-turn-banner{min-height:54px;padding:9px 14px}.bb-roll-indicators{gap:6px}.bb-roll-indicators span{min-height:28px}.bb-scorecards{gap:7px}.bb-scorecard{padding:7px}.bb-scorecard-label{margin-bottom:5px}.bb-frame-row span,.bb-roll-row span,.bb-frame-score-row span{min-height:22px}.bb-frame-score-row span{min-height:19px}.bb-card-move{gap:8px;padding:11px}.bb-card-grid{gap:8px!important}.bb-pick-card{height:76px;min-height:76px!important}.bb-controls-hint{padding:7px 0}}
@media(max-height:760px) and (min-width:641px){.bb-canvas{height:min(64dvh,560px)}}
@keyframes bb-card-reveal{0%{transform:rotateY(0) scale(.96)}60%{transform:rotateY(188deg) scale(1.04)}100%{transform:rotateY(180deg) scale(1)}}
@media(max-width:760px){.bb-side-column{min-height:0;padding:12px}.bb-score-display{min-height:90px}.bb-frame-status{min-height:62px}.bb-scorecard{padding:8px}.bb-frame-row,.bb-roll-row,.bb-frame-score-row{gap:2px!important}.bb-frame-row span,.bb-roll-row span,.bb-frame-score-row span{min-height:24px;font-size:.58rem}.bb-pick-card{height:86px;min-height:86px!important}.bb-card-grid{gap:9px!important}}
@media(max-width:420px){.bb-card-move{padding:12px}.bb-pick-card{height:76px;min-height:76px!important}.bb-scorecards{grid-template-columns:1fr}.bb-scorecard-label span{font-size:.5rem}}
@media(prefers-reduced-motion:reduce){.bb-btn,.bb-pick-card{transition:none;animation:none!important;scroll-behavior:auto}}
.bowling-battle-game.is-welcome,.bowling-battle-game.is-input{width:min(98%,1680px);max-width:1680px;min-height:calc(100dvh - 112px);padding:clamp(18px,3vw,42px);border-color:rgb(80 180 255 / .16);background:rgb(8 22 52 / .24);box-shadow:0 20px 60px rgb(0 0 0 / .32),inset 0 1px 0 rgb(255 255 255 / .04)}
.bb-welcome{width:min(100%,1420px);min-height:min(80dvh,900px);justify-content:center;gap:clamp(20px,3vh,34px);padding:clamp(36px,6vw,90px);border-radius:30px;background-image:linear-gradient(90deg,rgb(4 14 34 / .74),rgb(4 14 34 / .34) 55%,rgb(4 14 34 / .08)),linear-gradient(0deg,rgb(4 14 34 / .4),transparent 55%),url('/assets/games/bowling-battle/bowling-battle-welcome-bg.webp');box-shadow:inset 0 0 0 1px rgb(255 255 255 / .12),0 28px 70px rgb(0 0 0 / .34)}
.bb-logo{display:grid;gap:0;font-size:clamp(4.6rem,10vw,9rem);line-height:.83;letter-spacing:-.065em;text-transform:uppercase;text-shadow:0 8px 34px rgb(0 0 0 / .65),0 0 34px rgb(97 234 255 / .2)}
.bb-logo span:last-child{color:#73eaff}
.bb-tag{max-width:600px;margin:0;color:#edf6ff;font-size:clamp(1.15rem,2.2vw,1.6rem);text-shadow:0 3px 16px rgb(0 0 0 / .8)}
.bb-welcome>.bb-primary{min-width:270px;min-height:68px;border-radius:18px;padding:18px 42px;font-size:1.2rem;font-weight:900;letter-spacing:.08em;text-transform:uppercase;box-shadow:0 8px 28px rgb(36 189 233 / .4),0 0 34px rgb(36 189 233 / .2)}
.bb-input-screen{width:min(100%,1420px);min-height:min(78dvh,860px);justify-content:center;gap:0;padding:clamp(20px,4vw,56px);border-radius:30px;background-image:radial-gradient(ellipse at center,rgb(4 14 34 / .83) 0%,rgb(4 14 34 / .72) 56%,rgb(4 14 34 / .16) 100%),url('/assets/games/bowling-battle/bowling-battle-user-input-bg.webp');box-shadow:inset 0 0 0 1px rgb(255 255 255 / .1),0 24px 60px rgb(0 0 0 / .3)}
.bb-player-panel{width:min(100%,1020px);padding:clamp(22px,4vw,48px);border:1px solid rgb(143 202 255 / .24);border-radius:28px;background:linear-gradient(145deg,rgb(8 22 45 / .84),rgb(5 14 31 / .82));box-shadow:0 24px 70px rgb(0 0 0 / .38),inset 0 1px 0 rgb(255 255 255 / .09);backdrop-filter:blur(14px)}
.bb-player-panel>.bb-heading{margin:0;text-align:center;color:#f4f9ff;font-size:clamp(1.8rem,3.5vw,2.7rem);font-weight:950;letter-spacing:.16em;text-shadow:0 3px 18px rgb(0 0 0 / .5)}
.bb-player-subtitle{margin:9px 0 clamp(24px,4vw,42px);color:#a9bdd6;text-align:center;font-size:1.02rem;letter-spacing:.04em}
.bb-name-form{width:100%;max-width:none;gap:clamp(24px,4vw,44px)}
.bb-player-matchup{display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);align-items:center;gap:clamp(14px,2.6vw,34px)}
.bb-player-card{display:flex;min-width:0;min-height:320px;align-items:center;justify-content:center;gap:13px;padding:24px;border:1px solid rgb(132 190 255 / .28);border-radius:24px;background:linear-gradient(155deg,rgb(19 45 78 / .82),rgb(8 21 43 / .91));box-shadow:inset 0 1px 0 rgb(255 255 255 / .09),0 18px 34px rgb(0 0 0 / .24);letter-spacing:normal}
.bb-player-card.bb-p2{border-color:rgb(255 160 125 / .34);background:linear-gradient(155deg,rgb(68 38 44 / .68),rgb(23 20 34 / .91))}
.bb-player-label{margin:0!important;color:#c8d9ec;font-size:.88rem;font-weight:900;letter-spacing:.2em}
.bb-player-icon{font-size:clamp(3.1rem,5vw,4.4rem);filter:drop-shadow(0 8px 12px rgb(0 0 0 / .4))}
.bb-player-prompt{color:#a8bbd2;font-size:.9rem;letter-spacing:.03em}
.bb-player-card input{width:100%;min-height:58px;border:1px solid rgb(142 190 239 / .35);border-radius:14px;padding:14px 16px;background:rgb(4 13 29 / .8);color:#fff;text-align:center;font-size:1.05rem;letter-spacing:normal;box-shadow:inset 0 2px 8px rgb(0 0 0 / .24)}
.bb-player-card input::placeholder{color:#91a6c0}
.bb-versus{display:grid;width:74px;height:74px;place-items:center;border:1px solid rgb(97 234 255 / .42);border-radius:50%;background:radial-gradient(circle,rgb(30 95 133 / .42),rgb(7 22 45 / .82));color:#79eaff;font-size:2rem;font-weight:1000;font-style:italic;letter-spacing:-.06em;text-shadow:0 0 18px rgb(97 234 255 / .42);box-shadow:0 0 28px rgb(97 234 255 / .12),inset 0 1px 0 rgb(255 255 255 / .12)}
.bb-name-form .bb-button-row{width:100%;max-width:none;justify-content:space-between;gap:16px;margin-top:0}
.bb-name-form .bb-button-row .bb-btn{min-height:56px;border-radius:14px;padding:14px 24px;font-size:.9rem;font-weight:900;letter-spacing:.08em}
.bb-name-form .bb-back-btn{border:1px solid rgb(190 207 230 / .32);background:rgb(255 255 255 / .045);color:#d4deeb;box-shadow:inset 0 1px 0 rgb(255 255 255 / .06)}
.bb-name-form .bb-continue-btn{min-width:220px;border-radius:14px;box-shadow:0 6px 22px rgb(36 189 233 / .3),0 0 20px rgb(36 189 233 / .12)}
.bowling-battle-game.is-wide{width:min(99%,1760px);max-width:1760px;max-height:calc(100dvh - 104px);padding:6px;border:1px solid rgb(80 180 255 / .12);border-radius:24px;background:rgb(8 22 52 / .16);box-shadow:0 18px 55px rgb(0 0 0 / .3)}
.bb-screen.active.bb-game-screen{padding-top:clamp(24px,3vh,36px);gap:clamp(14px,1.7vw,24px)}
.bb-canvas{height:min(82dvh,940px)}
@media(max-width:760px){.bowling-battle-game.is-welcome,.bowling-battle-game.is-input{width:100%;min-height:calc(100dvh - 90px);padding:12px;border:0;border-radius:0}.bb-welcome,.bb-input-screen{min-height:calc(100dvh - 114px);padding:24px 16px;border-radius:20px}.bb-logo{font-size:clamp(3.8rem,16vw,6rem)}.bb-player-panel{padding:24px 18px}.bb-player-matchup{grid-template-columns:1fr;gap:12px}.bb-player-card{min-height:240px;padding:18px}.bb-versus{width:52px;height:52px;margin:-2px auto;font-size:1.45rem}.bb-name-form .bb-button-row .bb-btn{min-height:52px;padding:12px 16px}.bb-name-form .bb-continue-btn{min-width:0;flex:1}.bowling-battle-game.is-wide{width:100%;padding:4px;border:0;border-radius:0}.bb-canvas{height:min(46dvh,420px)}}
@media(max-width:420px){.bb-player-panel{padding:20px 14px}.bb-player-card{min-height:215px}.bb-name-form .bb-button-row{gap:10px}.bb-name-form .bb-button-row .bb-btn{font-size:.78rem}.bb-name-form .bb-continue-btn{min-width:0}}
`;
