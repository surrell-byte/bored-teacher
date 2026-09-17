import React, { useMemo, useState } from 'react';

const rounds = [
  {
    title: 'QUESTION',
    prompt: 'Which door is the answer?',
    options: ['1 floor', '2 floor', '3 floor'],
    answer: '3 floor',
    accent: '#8ade62',
    rightBadge: '✔',
  },
  {
    title: 'QUESTION',
    prompt: 'Which number is hidden?',
    options: ['4', '5', '6'],
    answer: '6',
    accent: '#7aeef5',
    rightBadge: '★',
  },
  {
    title: 'QUESTION',
    prompt: 'Which chest has the treasure?',
    options: ['Left chest', 'Middle chest', 'Right chest'],
    answer: 'Middle chest',
    accent: '#f6d65a',
    rightBadge: '💎',
  },
];

const assetStyles = `
  .powerpoint-slide-game {
    --navy-1: #0a1f44;
    --navy-2: #102d5d;
    --panel: rgba(12, 24, 52, 0.9);
    --panel-border: rgba(129, 156, 255, 0.45);
    --card-bg: rgba(255,255,255,0.12);
    --stone-1: #d8b785;
    --stone-2: #b38759;
    --stone-3: #7b4d31;
    --door-red: #af1d32;
    --gold: #f6d973;
    --purple: #b05af1;
    --green: #52d067;
    --cyan: #57d9ff;
    --torch: #ffcc73;
    --floor: #4f3658;
  }

  .powerpoint-slide-shell {
    position: relative;
    width: min(100%, 1420px);
    min-height: 820px;
    margin: 0 auto;
    border-radius: 14px;
    overflow: hidden;
    background: linear-gradient(180deg, #120b2c 0%, #201534 100%);
    border: 1px solid rgba(255,255,255,0.08);
    box-shadow: inset 0 0 0 1px rgba(255,255,255,0.08), 0 14px 40px rgba(0,0,0,0.35);
    font-family: Arial, Helvetica, sans-serif;
    color: #fff;
  }

  .powerpoint-slide-titlebar {
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 18px 0 14px;
    background: linear-gradient(180deg, rgba(8,20,50,1), rgba(12,22,40,1));
    border-bottom: 1px solid rgba(255,255,255,0.14);
    font-weight: 700;
    letter-spacing: 0.04em;
  }

  .powerpoint-slide-dots {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .powerpoint-slide-dot {
    width: 13px;
    height: 13px;
    border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.28);
  }

  .powerpoint-slide-dot.red { background: #ff5f57; }
  .powerpoint-slide-dot.yellow { background: #ffbd2e; }
  .powerpoint-slide-dot.green { background: #28c840; }

  .powerpoint-slide-header {
    font-size: 1.08rem;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #f3f7ff;
  }

  .powerpoint-slide-header .title {
    font-weight: 700;
    color: #dfe9ff;
  }

  .powerpoint-slide-body {
    position: relative;
    min-height: 775px;
    background: linear-gradient(180deg, #3a3d87 0%, #4a2f6d 100%);
    overflow: hidden;
  }

  .powerpoint-slide-scene {
    position: relative;
    height: 100%;
    min-height: 775px;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04)),
      linear-gradient(180deg, rgba(80, 82, 150, 0.82), rgba(62, 49, 101, 0.9));
  }

  .powerpoint-slide-castle {
    position: absolute;
    inset: 0;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.15)),
      radial-gradient(circle at 50% 0%, rgba(255,215,104,0.14), transparent 35%);
  }

  .powerpoint-slide-wall {
    position: absolute;
    inset: 96px 0 120px 0;
    background: linear-gradient(180deg, rgba(199, 202, 220, 0.18), rgba(82, 71, 98, 0.26));
    border-top: 8px solid rgba(102,92,128,0.9);
    border-bottom: 8px solid rgba(102,92,128,0.9);
  }

  .powerpoint-slide-wall::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        90deg,
        rgba(255,255,255,0.12) 0,
        rgba(255,255,255,0.12) 2px,
        rgba(255,255,255,0) 2px,
        rgba(255,255,255,0) 34px
      );
    opacity: 0.42;
  }

  .powerpoint-slide-row {
    position: absolute;
    left: 0;
    right: 0;
    height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 0 20px;
  }

  .powerpoint-slide-row.top { top: 26px; }
  .powerpoint-slide-row.mid { top: 210px; }
  .powerpoint-slide-row.bottom { top: 430px; }

  .powerpoint-slide-door {
    position: relative;
    width: 170px;
    height: 180px;
    background: linear-gradient(180deg, rgba(215, 120, 62, 0.95), rgba(97, 49, 26, 0.96));
    border: 8px solid rgba(143, 89, 55, 0.95);
    border-radius: 12px 12px 0 0;
    box-shadow: inset 0 0 0 3px rgba(35, 20, 12, 0.4), 0 12px 18px rgba(0,0,0,0.15);
    overflow: hidden;
  }

  .powerpoint-slide-door::before {
    content: '';
    position: absolute;
    inset: 16px 20px 12px 20px;
    border-radius: 10px 10px 6px 6px;
    background: radial-gradient(circle at 50% 12%, rgba(255, 189, 96, 0.45), rgba(130, 44, 10, 0.16) 24%, rgba(18, 9, 10, 0.7) 100%);
    box-shadow: inset 0 0 18px rgba(0,0,0,0.74);
  }

  .powerpoint-slide-door::after {
    content: '';
    position: absolute;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #f0d98d;
    box-shadow: 0 0 0 3px rgba(130, 80, 30, 0.8);
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }

  .powerpoint-slide-door[data-open='true'] {
    background: linear-gradient(180deg, rgba(63, 55, 77, 0.8), rgba(13, 16, 25, 0.98));
  }

  .powerpoint-slide-door[data-open='true']::before {
    background: rgba(0,0,0,0.94);
  }

  .powerpoint-slide-door[data-open='true']::after {
    opacity: 0;
  }

  .powerpoint-slide-floor-label {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: rgba(255,255,255,0.82);
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    text-shadow: 0 3px 10px rgba(0,0,0,0.5);
  }

  .powerpoint-slide-score {
    position: absolute;
    top: 16px;
    right: 22px;
    font-size: 2.25rem;
    font-weight: 900;
    color: #fff;
    background: rgba(42, 195, 255, 0.82);
    border-radius: 16px;
    padding: 10px 18px;
    border: 4px solid rgba(255,255,255,0.2);
    box-shadow: 0 8px 18px rgba(0,0,0,0.18);
  }

  .powerpoint-slide-menu {
    position: absolute;
    left: 50%;
    bottom: 50px;
    transform: translateX(-50%);
    background: rgba(68, 208, 95, 0.84);
    color: #101815;
    border: 3px solid rgba(0, 0, 0, 0.18);
    padding: 10px 30px;
    border-radius: 12px;
    font-size: 2rem;
    font-weight: 900;
    letter-spacing: 0.04em;
    box-shadow: 0 8px 16px rgba(0,0,0,0.18);
  }

  .powerpoint-slide-option {
    position: relative;
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 170px;
    min-height: 110px;
    padding: 16px 24px;
    border-radius: 18px;
    border: 4px solid rgba(31, 25, 44, 0.24);
    background: rgba(255,255,255,0.85);
    color: #1d1d1d;
    font-size: clamp(1.2rem, 2vw, 2rem);
    font-weight: 900;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    box-shadow: 0 10px 22px rgba(0,0,0,0.18);
  }

  .powerpoint-slide-option:hover {
    transform: translateY(-2px);
  }

  .powerpoint-slide-option.correct {
    background: linear-gradient(180deg, #7fe39b, #4fd06d);
  }

  .powerpoint-slide-option.wrong {
    background: linear-gradient(180deg, #ff8a8a, #ef4b4b);
    color: #fff;
  }

  .powerpoint-slide-question {
    position: absolute;
    left: 50%;
    top: 114px;
    transform: translateX(-50%);
    width: min(62%, 740px);
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255,255,255,0.85);
    border: 4px solid rgba(74, 90, 138, 0.4);
    border-radius: 12px;
    color: #0f0f12;
    font-size: clamp(2rem, 3vw, 4rem);
    font-weight: 900;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    box-shadow: 0 8px 20px rgba(0,0,0,0.12);
  }

  .powerpoint-slide-choices {
    position: absolute;
    left: 50%;
    bottom: 110px;
    transform: translateX(-50%);
    width: min(80%, 1000px);
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .powerpoint-slide-wizard {
    position: absolute;
    left: 50%;
    bottom: 150px;
    transform: translateX(-50%);
    width: 240px;
    height: 260px;
    pointer-events: none;
  }

  .powerpoint-slide-wizard .hat {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    top: 0;
    width: 150px;
    height: 70px;
    background: linear-gradient(180deg, #1d8d4e, #126a3c);
    border-radius: 100px 100px 18px 18px;
    border: 6px solid rgba(18, 35, 18, 0.6);
  }

  .powerpoint-slide-wizard .hat::before {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -18px;
    width: 100px;
    height: 30px;
    background: rgba(26, 39, 23, 0.8);
    border-radius: 10px;
  }

  .powerpoint-slide-wizard .face {
    position: absolute;
    left: 50%;
    top: 70px;
    transform: translateX(-50%);
    width: 130px;
    height: 105px;
    background: linear-gradient(180deg, #ffcb7c, #ffae5a);
    border-radius: 48% 48% 42% 42%;
    border: 6px solid rgba(94, 44, 24, 0.5);
  }

  .powerpoint-slide-wizard .eye {
    position: absolute;
    top: 105px;
    width: 16px;
    height: 16px;
    background: #23110d;
    border-radius: 50%;
  }

  .powerpoint-slide-wizard .eye.left { left: 70px; }
  .powerpoint-slide-wizard .eye.right { right: 70px; }

  .powerpoint-slide-wizard .body {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 180px;
    height: 140px;
    background: linear-gradient(180deg, #2b9b58, #145336);
    border-radius: 44px 44px 20px 20px;
  }

  .powerpoint-slide-wizard .cauldron {
    position: absolute;
    left: 50%;
    bottom: 40px;
    transform: translateX(-50%);
    width: 170px;
    height: 90px;
    background: linear-gradient(180deg, #7dbf75, #3c7f39);
    border-radius: 35% 35% 50% 50%;
    box-shadow: inset 0 0 0 8px rgba(26, 29, 23, 0.3);
  }

  .powerpoint-slide-chest-row {
    position: absolute;
    left: 50%;
    bottom: 120px;
    transform: translateX(-50%);
    width: min(80%, 980px);
    display: flex;
    justify-content: center;
    gap: 36px;
    flex-wrap: wrap;
  }

  .powerpoint-slide-chest {
    position: relative;
    width: 180px;
    height: 150px;
    border-radius: 16px 16px 24px 24px;
    background: linear-gradient(180deg, #9b5c1a, #5d3305);
    border: 8px solid rgba(70, 42, 12, 0.8);
    box-shadow: inset 0 0 0 5px rgba(240, 186, 79, 0.8), 0 12px 18px rgba(0,0,0,0.15);
  }

  .powerpoint-slide-chest::before {
    content: '';
    position: absolute;
    left: 18px;
    right: 18px;
    top: 18px;
    height: 42px;
    border-radius: 10px;
    background: linear-gradient(180deg, rgba(255,210,104,0.9), rgba(182, 112, 23, 0.9));
    box-shadow: 0 0 0 3px rgba(106, 72, 10, 0.7);
  }

  .powerpoint-slide-chest::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 18px;
    transform: translateX(-50%);
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #f2d366;
    box-shadow: 0 0 0 3px rgba(112, 72, 16, 0.7);
  }

  .powerpoint-slide-chest--glow {
    box-shadow: 0 0 0 6px rgba(130, 220, 120, 0.8), inset 0 0 0 5px rgba(240, 186, 79, 0.8), 0 12px 18px rgba(0,0,0,0.15);
  }

  .powerpoint-slide-back {
    position: absolute;
    right: 48px;
    bottom: 50px;
    border: none;
    border-radius: 14px;
    background: linear-gradient(180deg, #9a5ae5, #7d33d8);
    color: #fff;
    font-size: clamp(1.5rem, 2vw, 2.5rem);
    font-weight: 900;
    padding: 16px 32px;
    letter-spacing: 0.08em;
    box-shadow: 0 12px 20px rgba(41, 15, 73, 0.32);
    cursor: pointer;
  }

  @media (max-width: 980px) {
    .powerpoint-slide-shell { min-height: 700px; }
    .powerpoint-slide-door { width: 120px; height: 150px; }
    .powerpoint-slide-question { width: 82%; }
    .powerpoint-slide-option { min-width: 120px; }
    .powerpoint-slide-back { right: 16px; bottom: 18px; }
  }
`;

export default function PowerPointSlide() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const round = rounds[roundIndex];
  const sequence = useMemo(() => Array.from({ length: 4 }, (_, index) => index), []);

  const handleChoice = (choice) => {
    if (selected !== null) return;
    setSelected(choice);

    if (choice === round.answer) {
      setScore((prev) => prev + 1);
    }

    const delay = setTimeout(() => {
      if (roundIndex < rounds.length - 1) {
        setRoundIndex((prev) => prev + 1);
        setSelected(null);
      } else {
        setFinished(true);
      }
      clearTimeout(delay);
    }, 900);
  };

  const resetGame = () => {
    setRoundIndex(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  return (
    <>
      <style>{assetStyles}</style>
      <div className="powerpoint-slide-game">
        <div className="powerpoint-slide-shell">
          <div className="powerpoint-slide-titlebar">
            <div className="powerpoint-slide-dots">
              <span className="powerpoint-slide-dot red" />
              <span className="powerpoint-slide-dot yellow" />
              <span className="powerpoint-slide-dot green" />
            </div>
            <div className="powerpoint-slide-header">
              <span className="title">PowerPoint Slide Show</span>
            </div>
            <div style={{ width: 130 }} />
          </div>

          <div className="powerpoint-slide-body">
            {!finished ? (
              <div className="powerpoint-slide-scene">
                <div className="powerpoint-slide-castle">
                  <div className="powerpoint-slide-wall" />

                  <div className="powerpoint-slide-row top">
                    {sequence.map((item) => (
                      <div key={`top-${item}`} className="powerpoint-slide-door" data-open={item === 1 ? 'true' : 'false'} />
                    ))}
                    <div className="powerpoint-slide-floor-label">3 floor</div>
                    <div className="powerpoint-slide-score">{score}</div>
                  </div>

                  <div className="powerpoint-slide-row mid">
                    {sequence.map((item) => (
                      <div key={`mid-${item}`} className="powerpoint-slide-door" data-open={item === 0 ? 'true' : 'false'} />
                    ))}
                    <div className="powerpoint-slide-floor-label">2 floor</div>
                  </div>

                  <div className="powerpoint-slide-row bottom">
                    {sequence.map((item) => (
                      <div key={`bottom-${item}`} className="powerpoint-slide-door" data-open={item === 3 ? 'true' : 'false'} />
                    ))}
                    <div className="powerpoint-slide-floor-label">1 floor</div>
                  </div>

                  <div className="powerpoint-slide-question">{round.title}</div>

                  <div className="powerpoint-slide-wizard" aria-hidden="true">
                    <div className="hat" />
                    <div className="face" />
                    <div className="eye left" />
                    <div className="eye right" />
                    <div className="body" />
                    <div className="cauldron" />
                  </div>

                  <div className="powerpoint-slide-chest-row">
                    {round.options.map((option, index) => (
                      <button
                        key={option}
                        type="button"
                        className={[
                          'powerpoint-slide-option',
                          selected === option && option === round.answer ? 'correct' : '',
                          selected === option && option !== round.answer ? 'wrong' : '',
                        ].join(' ').trim()}
                        onClick={() => handleChoice(option)}
                        disabled={selected !== null}
                        aria-label={option}
                      >
                        {option}
                      </button>
                    ))}
                  </div>

                  <button type="button" className="powerpoint-slide-back" onClick={resetGame}>BACK</button>
                </div>
              </div>
            ) : (
              <div className="powerpoint-slide-scene" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  display: 'grid',
                  placeItems: 'center',
                  gap: 18,
                  background: 'rgba(255,255,255,0.9)',
                  color: '#0f1022',
                  borderRadius: 20,
                  padding: '42px 64px',
                  textAlign: 'center',
                  boxShadow: '0 18px 30px rgba(0,0,0,0.18)',
                }}>
                  <div style={{ fontSize: '4rem', fontWeight: 900 }}>🏆</div>
                  <div style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '0.08em' }}>RESULT</div>
                  <div style={{ fontSize: '2rem', fontWeight: 700 }}>You scored {score} / {rounds.length}</div>
                  <button type="button" className="powerpoint-slide-back" onClick={resetGame}>PLAY AGAIN</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
