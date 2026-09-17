'use client';

import React, { useState, useCallback, useRef } from 'react';

const SHAPES = ['triangle', 'circle', 'square', 'diamond'];
const WEIGHTS = { triangle: 5, circle: 2, square: 2, diamond: 3 };

const COLORS = {
  lane: '#2b1c14',
  gutter: '#1a110c',
  ivory: '#f2e9d8',
  gold: '#d9a441',
  goldDim: '#8a6a2d',
  pinRed: '#c94f4f',
  glass: 'rgba(242,233,216,0.06)',
  glassBorder: 'rgba(217,164,65,0.35)',
  p1: '#e0a03a',
  p2: '#5aa9b8',
};

function weightedShape() {
  const pool = [];
  for (const s of SHAPES) {
    for (let i = 0; i < WEIGHTS[s]; i += 1) pool.push(s);
  }
  return pool[Math.floor(Math.random() * pool.length)];
}

function drawTiles() {
  return Array.from({ length: 5 }, () => weightedShape());
}

function makePlayer(name) {
  return {
    name,
    frames: Array.from({ length: 10 }, () => ({
      rolls: [],
      bonusPts: 0,
      done: false,
      pinsStanding: 10,
    })),
    currentFrame: 0,
  };
}

function frameIsTenth(idx) {
  return idx === 9;
}

function frameScore(frame) {
  const pinPts = frame.rolls.reduce((sum, roll) => sum + (roll.shape === 'square' ? 0 : roll.points), 0);
  return pinPts + frame.bonusPts;
}

function playerTotal(player) {
  return player.frames.reduce((sum, frame) => sum + frameScore(frame), 0);
}

function newGameState() {
  return {
    players: [makePlayer('Player 1'), makePlayer('Player 2')],
    turn: 0,
    tileRow: drawTiles(),
    gameOver: false,
    statusMsg: '',
    lastRoll: null,
  };
}

function Icon({ shape, size = 38 }) {
  const stroke = COLORS.gold;
  switch (shape) {
    case 'triangle':
      return (
        <svg viewBox="0 0 40 40" width={size} height={size}>
          <polygon points="20,7 34,32 6,32" fill="none" stroke={stroke} strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    case 'circle':
      return (
        <svg viewBox="0 0 40 40" width={size} height={size}>
          <circle cx="20" cy="20" r="13" fill="none" stroke={COLORS.pinRed} strokeWidth="2.5" />
        </svg>
      );
    case 'square':
      return (
        <svg viewBox="0 0 40 40" width={size} height={size}>
          <rect x="8" y="8" width="24" height="24" fill="none" stroke={COLORS.p2} strokeWidth="2.5" />
        </svg>
      );
    case 'diamond':
      return (
        <svg viewBox="0 0 40 40" width={size} height={size}>
          <polygon points="20,6 34,20 20,34 6,20" fill="none" stroke="rgba(242,233,216,0.55)" strokeWidth="2.5" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}

function PinTriangle({ standingCount }) {
  const rows = [4, 3, 2, 1];
  let counter = 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, margin: '0 auto 18px', width: 'fit-content' }}>
      {rows.map((rowLen, rIdx) => (
        <div key={rIdx} style={{ display: 'flex', gap: 8 }}>
          {Array.from({ length: rowLen }).map((_, i) => {
            counter += 1;
            const isDown = counter > standingCount;
            return (
              <div
                key={i}
                style={{
                  width: 20,
                  height: 34,
                  background: 'linear-gradient(180deg, #f2e9d8 0%, #d8c9a8 60%, #b9a67e 100%)',
                  borderRadius: '50% 50% 40% 40% / 60% 60% 40% 40%',
                  position: 'relative',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.4)',
                  opacity: isDown ? 0.12 : 1,
                  transform: isDown ? 'scale(0.8) rotate(15deg) translateY(6px)' : 'none',
                  transition: 'opacity .35s, transform .35s',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: '32%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '60%',
                    height: 3,
                    background: COLORS.pinRed,
                    borderRadius: 2,
                  }}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function FloatingPoints({ items }) {
  return (
    <>
      {items.map((it) => (
        <div
          key={it.id}
          style={{
            position: 'absolute',
            fontSize: '1.3rem',
            fontWeight: 700,
            color: it.shape === 'diamond' ? 'rgba(242,233,216,0.6)' : it.shape === 'square' ? COLORS.p2 : COLORS.gold,
            pointerEvents: 'none',
            left: '50%',
            top: '40%',
            transform: 'translateX(-50%)',
            animation: 'floatUp 0.9s ease-out forwards',
          }}
        >
          {it.shape === 'diamond' ? 'MISS' : `+${it.pts}`}
        </div>
      ))}
    </>
  );
}

export default function TileLanes() {
  const [state, setState] = useState(() => newGameState());
  const [floats, setFloats] = useState([]);
  const floatId = useRef(0);

  const activePlayer = state.players[state.turn];
  const activeFrame = activePlayer.frames[activePlayer.currentFrame];
  const lastRoll = state.lastRoll;

  const addFloat = useCallback((pts, shape) => {
    const id = floatId.current += 1;
    setFloats((current) => [...current, { id, pts, shape }]);
    setTimeout(() => {
      setFloats((current) => current.filter((item) => item.id !== id));
    }, 950);
  }, []);

  const pickTile = (tileIndex) => {
    if (state.gameOver) return;

    setState((prev) => {
      const players = prev.players.map((player) => ({
        ...player,
        frames: player.frames.map((frame) => ({
          ...frame,
          rolls: [...frame.rolls],
        })),
      }));

      const turn = prev.turn;
      const currentPlayer = players[turn];
      const frameIndex = currentPlayer.currentFrame;
      const frame = currentPlayer.frames[frameIndex];
      const shape = prev.tileRow[tileIndex];

      let pointsThisRoll = 0;
      let frameEnds = false;
      let label = '';

      if (shape === 'triangle') {
        const maxKnock = Math.max(0, Math.min(frame.pinsStanding, 3));
        const knock = maxKnock > 0 ? 1 + Math.floor(Math.random() * maxKnock) : 0;
        frame.pinsStanding -= knock;
        pointsThisRoll = knock;
        label = knock > 0 ? `knocks down ${knock} pin${knock === 1 ? '' : 's'}` : 'grazes the pins — nothing falls';
      } else if (shape === 'circle') {
        const knock = frame.pinsStanding;
        frame.pinsStanding = 0;
        pointsThisRoll = knock;
        label = 'STRIKE! All pins down';
      } else if (shape === 'square') {
        const bonus = 2 + Math.floor(Math.random() * 4);
        frame.bonusPts += bonus;
        pointsThisRoll = bonus;
        label = `bonus pins! +${bonus} stacked on the frame`;
      } else if (shape === 'diamond') {
        pointsThisRoll = 0;
        label = 'MISS — the ball rolls the gutter';
      }

      frame.rolls.push({ shape, points: pointsThisRoll });

      const totalPicks = frame.rolls.length;
      const allowed = frameIsTenth(frameIndex) ? 3 : 2;

      if (!frameIsTenth(frameIndex)) {
        if (shape === 'circle') {
          frameEnds = true;
        } else if (frame.pinsStanding === 0 && totalPicks < allowed) {
          frameEnds = true;
        } else if (totalPicks >= allowed) {
          frameEnds = true;
        }
      } else {
        if (frame.pinsStanding === 0) {
          frame.pinsStanding = 10;
        }
        if (totalPicks >= allowed) {
          frameEnds = true;
        }
      }

      addFloat(pointsThisRoll, shape);

      let statusMsg = `${currentPlayer.name} ${label}`;
      let gameOver = false;
      let nextTurn = turn;
      let tileRow = prev.tileRow;

      if (frameEnds) {
        frame.done = true;
        if (frameIndex < 9) {
          currentPlayer.currentFrame += 1;
        } else {
          currentPlayer.currentFrame = 10;
        }

        const allDone = players.every((player) => player.frames[9].done);

        if (allDone) {
          gameOver = true;
          tileRow = drawTiles();
        } else {
          const otherPlayer = players[(turn + 1) % 2];
          if (otherPlayer.currentFrame < 10 && !(otherPlayer.currentFrame === 9 && otherPlayer.frames[9].done)) {
            nextTurn = (turn + 1) % 2;
          }
          tileRow = drawTiles();
        }
      } else {
        tileRow = drawTiles();
      }

      return {
        players,
        turn: nextTurn,
        tileRow,
        gameOver,
        statusMsg,
        lastRoll: shape,
      };
    });
  };

  const resetGame = () => {
    setState(newGameState());
    setFloats([]);
  };

  const legendItems = [
    ['triangle', 'Knocks a few pins'],
    ['circle', 'Strike — clears the frame'],
    ['square', 'Bonus pins (stacks past 10)'],
    ['diamond', 'Miss — nothing falls'],
  ];

  const [playerOneTotal, playerTwoTotal] = state.players.map(playerTotal);

  let winnerMsg = '';
  if (state.gameOver) {
    winnerMsg =
      playerOneTotal === playerTwoTotal
        ? `It's a tie! ${playerOneTotal} — ${playerTwoTotal}`
        : `${playerOneTotal > playerTwoTotal ? state.players[0].name : state.players[1].name} wins, ${Math.max(playerOneTotal, playerTwoTotal)} — ${Math.min(playerOneTotal, playerTwoTotal)}!`;
  }

  return (
    <div style={{ margin: 0, minHeight: '100vh', background: 'radial-gradient(ellipse at 50% -10%, rgba(120,76,43,0.75) 0%, transparent 62%), linear-gradient(180deg, #2d2018 0%, #190f0d 100%)', color: COLORS.ivory, fontFamily: "'Georgia', 'Iowan Old Style', serif" }}>
      <style>{`
        @keyframes floatUp {
          0% { opacity: 0; transform: translate(-50%,10px) scale(0.8); }
          30% { opacity: 1; transform: translate(-50%,-10px) scale(1.1); }
          100% { opacity: 0; transform: translate(-50%,-46px) scale(1); }
        }
        .tl-tile:hover { transform: translateY(-6px); border-color: ${COLORS.gold} !important; box-shadow: 0 10px 22px rgba(217,164,65,0.25); }
        .tl-tile:active { transform: translateY(-2px); }
        .tl-reset:hover { background: rgba(217,164,65,0.1) !important; border-color: ${COLORS.gold} !important; }
        .tl-shell { background: linear-gradient(180deg, rgba(41, 26, 20, 0.96), rgba(21, 14, 11, 0.98)); border: 1px solid rgba(217,164,65,0.32); border-radius: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.05); }
        .tl-topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px 10px; }
        .tl-pro { background: linear-gradient(180deg, #ffc35d, #d6891d); color: #2d1808; border-radius: 999px; padding: 7px 12px; font-size: 0.7rem; letter-spacing: 0.14em; text-transform: uppercase; font-weight: 900; box-shadow: 0 8px 18px rgba(214,137,29,0.35); }
        .tl-ball {
          position: absolute;
          left: 16%;
          top: 55%;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fff8d1 0%, #d9b15d 18%, #7a4e1d 52%, #331b0d 100%);
          border: 2px solid rgba(94,55,19,0.9);
          box-shadow: 0 0 18px rgba(217,164,65,0.35);
          transform: translateX(0) scale(1);
          animation: tl-roll 0.8s ease-in-out 1;
        }
        @keyframes tl-roll {
          0% { transform: translateX(0) scale(0.9); opacity: 0.2; }
          22% { opacity: 1; }
          60% { transform: translateX(290px) scale(1.09); }
          100% { transform: translateX(440px) scale(1); opacity: 0.95; }
        }
        .tl-result-card {
          position: relative;
          display: grid;
          place-items: center;
          gap: 14px;
          background: linear-gradient(180deg, rgba(255,255,255,0.12), rgba(0,0,0,0.12));
          border-radius: 22px;
          border: 1px solid rgba(217,164,65,0.35);
          padding: 28px 32px;
          text-align: center;
          min-width: min(90vw, 440px);
          box-shadow: 0 18px 35px rgba(0,0,0,0.24), inset 0 0 0 1px rgba(255,255,255,0.05);
        }
        .tl-result-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 78px;
          height: 78px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fff0ad 0%, #f4d362 30%, #d09426 100%);
          color: #3a2409;
          font-size: 2.3rem;
          box-shadow: 0 8px 20px rgba(217,164,65,0.35);
        }
      `}</style>

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '28px 18px 60px' }}>
        <div className="tl-shell" style={{ paddingBottom: 18 }}>
          <div className="tl-topbar">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57', boxShadow: '0 0 0 2px rgba(255,255,255,0.15)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', boxShadow: '0 0 0 2px rgba(255,255,255,0.15)' }} />
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840', boxShadow: '0 0 0 2px rgba(255,255,255,0.15)' }} />
            </div>
            <div className="tl-pro">Teacher Pro</div>
          </div>

          <div style={{ padding: '8px 28px 0' }}>
            <h1 style={{ textAlign: 'center', fontFamily: "'Palatino', 'Georgia', serif", fontWeight: 400, letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: '2rem', color: COLORS.gold, textShadow: '0 0 18px rgba(217,164,65,0.35)', margin: '0 0 4px' }}>
              Tile Lanes
            </h1>
            <div style={{ textAlign: 'center', color: 'rgba(242,233,216,0.55)', fontSize: '0.85rem', letterSpacing: '0.05em', marginBottom: 24, fontStyle: 'italic' }}>
              Pick a tile. The shape decides the roll.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 22, flexWrap: 'wrap', padding: '0 22px' }}>
            {state.players.map((player, index) => (
              <div
                key={index}
                style={{
                  flex: '1 1 260px',
                  background: 'linear-gradient(180deg, rgba(242,233,216,0.07), rgba(18,13,11,0.3))',
                  border: `1px solid ${state.turn === index && !state.gameOver ? COLORS.gold : COLORS.glassBorder}`,
                  borderRadius: 14,
                  padding: '14px 16px',
                  position: 'relative',
                  boxShadow: state.turn === index && !state.gameOver ? '0 0 24px rgba(217,164,65,0.25), inset 0 0 20px rgba(217,164,65,0.06)' : 'none',
                  transition: 'box-shadow .3s, border-color .3s',
                }}
              >
                <div style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: index === 0 ? COLORS.p1 : COLORS.p2, marginBottom: 2 }}>
                  {player.name}
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1 }}>
                  {playerTotal(player)}
                </div>
                <div style={{ display: 'flex', gap: 3, marginTop: 10, flexWrap: 'wrap' }}>
                  {player.frames.map((frame, idx) => {
                    const score = frameScore(frame);
                    const isCurrent = idx === player.currentFrame && !state.gameOver;
                    return (
                      <div
                        key={idx}
                        style={{
                          width: 30,
                          height: 36,
                          border: `1px solid ${isCurrent ? COLORS.gold : 'rgba(242,233,216,0.2)'}`,
                          borderRadius: 4,
                          fontSize: '0.62rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isCurrent ? COLORS.gold : 'rgba(242,233,216,0.75)',
                          background: frame.done ? 'rgba(217,164,65,0.08)' : 'rgba(0,0,0,0.15)',
                          position: 'relative',
                        }}
                      >
                        <span style={{ position: 'absolute', top: -9, left: 2, fontSize: '0.5rem', color: 'rgba(242,233,216,0.35)' }}>
                          {idx + 1}
                        </span>
                        {frame.rolls.length ? score : ''}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div style={{ background: 'linear-gradient(180deg, #4a3220 0%, #2e1e14 100%)', borderRadius: 18, border: '1px solid rgba(217,164,65,0.25)', padding: '26px 20px 18px', margin: '0 22px 24px', boxShadow: 'inset 0 2px 20px rgba(0,0,0,0.4), 0 18px 30px rgba(0,0,0,0.15)', position: 'relative' }}>
            <div style={{ position: 'relative', height: 18, marginBottom: 8 }}>
              <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', height: 5, background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.2), rgba(255,255,255,0.08))', borderRadius: 999 }} />
              {lastRoll && <div className="tl-ball" aria-hidden="true" />}
            </div>
            <FloatingPoints items={floats} />
            <div style={{ textAlign: 'center', fontSize: '1rem', marginBottom: 16, color: COLORS.ivory, minHeight: '1.4em', letterSpacing: '0.03em' }}>
              {state.gameOver ? 'Game over! Final scores locked in.' : state.statusMsg ? state.statusMsg : <><b style={{ color: COLORS.gold }}>{activePlayer.name}</b>{'\'s turn — Frame '}{Math.min(activePlayer.currentFrame + 1, 10)}</>}
            </div>

            <PinTriangle standingCount={state.gameOver ? 0 : activeFrame.pinsStanding} />

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginTop: 6 }}>
              {!state.gameOver && state.tileRow.map((shape, index) => (
                <div
                  key={index}
                  className="tl-tile"
                  onClick={() => pickTile(index)}
                  style={{
                    width: 76,
                    height: 92,
                    background: 'linear-gradient(160deg, #4a3320 0%, #2a1c12 100%)',
                    border: `1.5px solid ${COLORS.goldDim}`,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform .18s, box-shadow .18s, border-color .18s',
                    position: 'relative',
                    boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                  }}
                >
                  <Icon shape={shape} />
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 22, flexWrap: 'wrap', margin: '18px 0 8px', fontSize: '0.72rem', color: 'rgba(242,233,216,0.6)' }}>
              {legendItems.map(([shape, label]) => (
                <div key={shape} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon shape={shape} size={16} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {state.gameOver && (
            <div style={{ display: 'grid', placeItems: 'center', marginTop: 8 }}>
              <div className="tl-result-card" style={{ fontFamily: "'Georgia', 'Iowan Old Style', serif" }}>
                <div className="tl-result-badge">🏆</div>
                <div style={{ fontSize: '0.76rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: COLORS.gold, fontWeight: 700 }}>Final Scores</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: COLORS.ivory }}>{winnerMsg}</div>
                <button
                  className="tl-reset"
                  onClick={resetGame}
                  style={{
                    background: 'linear-gradient(180deg, #f8da77, #d89d2c)',
                    border: 'none',
                    color: '#2d1808',
                    padding: '10px 20px',
                    borderRadius: 12,
                    fontFamily: 'inherit',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(217,164,65,0.28)',
                  }}
                >
                  Play Again
                </button>
              </div>
            </div>
          )}

          {!state.gameOver && (
            <div style={{ textAlign: 'center', marginTop: 18 }}>
              <button
                className="tl-reset"
                onClick={resetGame}
                style={{
                  background: 'transparent',
                  border: `1px solid ${COLORS.goldDim}`,
                  color: COLORS.gold,
                  padding: '9px 22px',
                  borderRadius: 8,
                  fontFamily: 'inherit',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'background .2s, border-color .2s',
                }}
              >
                New Game
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
