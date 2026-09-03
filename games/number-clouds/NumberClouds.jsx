'use client';

import { useState } from 'react';

const TOTAL_ROUNDS = 10;

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildPuzzle() {
  const start = randomBetween(1, 10);
  const length = Math.random() < 0.5 ? 5 : 6;
  const sequence = Array.from({ length }, (_, index) => start + index);
  const missingIndex = randomBetween(1, Math.max(1, length - 2));
  const missingValue = sequence[missingIndex];
  const wrongA = missingValue + (Math.random() < 0.5 ? 1 : -1);
  const wrongB = missingValue + (Math.random() < 0.5 ? 2 : -2);
  const options = [...new Set([missingValue, wrongA, wrongB].filter(value => value > 0))];
  return { sequence, missingIndex, missingValue, options: options.sort(() => Math.random() - 0.5) };
}

export default function NumberClouds({ onComplete }) {
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [puzzle, setPuzzle] = useState(() => buildPuzzle());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');

  function handleAnswer(answer) {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    if (answer === puzzle.missingValue) {
      const nextScore = score + 1;
      setScore(nextScore);
      setFeedback("That's right!");
      onComplete?.(nextScore, 100);
    } else {
      setFeedback('Try again!');
    }
  }

  function nextRound() {
    setRound(current => Math.min(TOTAL_ROUNDS, current + 1));
    setPuzzle(buildPuzzle());
    setSelectedAnswer(null);
    setFeedback('');
  }

  return (
    <div className="number-clouds-page">
      <div className="sky-decoration cloud-one">☁️</div>
      <div className="sky-decoration cloud-two">☁️</div>
      <div className="sky-decoration cloud-three">☁️</div>
      <div className="bird bird-one">🕊️</div>
      <div className="bird bird-two">🦅</div>
      <div className="sun">☀️</div>
      <main className="number-clouds-game">
        <section className="game-heading">
          <div className="game-title"><span className="title-cloud">☁️</span><h1>Number Clouds</h1></div>
          <p className="game-subtitle">Hop across the clouds!</p>
          <div className="round-progress"><span className="progress-label">ROUND {round} OF {TOTAL_ROUNDS}</span><div className="progress-track"><div className="progress-fill" style={{ width: `${(round / TOTAL_ROUNDS) * 100}%` }} /></div></div>
        </section>
        <section className="sequence-area">
          <div className="sequence">
            {puzzle.sequence.map((number, index) => <span key={index} className="sequence-part">{index > 0 && <span className="sequence-arrow">→</span>}<span className={`number-cloud ${index === puzzle.missingIndex ? 'missing-cloud' : ''}`}>{index === puzzle.missingIndex ? '?' : number}</span></span>)}
          </div>
          <div className="answer-area">
            <p className="choose-label">Which number belongs on the cloud?</p>
            <div className="answer-buttons">{puzzle.options.map(answer => { const state = selectedAnswer === answer ? (answer === puzzle.missingValue ? 'correct' : 'wrong') : ''; return <button key={answer} className={`answer-button ${state}`} onClick={() => handleAnswer(answer)} disabled={selectedAnswer !== null}>{answer}</button>; })}</div>
            {feedback && <p className={`answer-feedback ${selectedAnswer === puzzle.missingValue ? 'correct-text' : 'wrong-text'}`}>{feedback}</p>}
            {selectedAnswer === puzzle.missingValue && round < TOTAL_ROUNDS && <button className="next-round-button" onClick={nextRound}>Next cloud →</button>}
            {selectedAnswer === puzzle.missingValue && round === TOTAL_ROUNDS && <p className="answer-feedback correct-text">You completed all the rounds!</p>}
          </div>
        </section>
        <section className="game-hud"><div className="hud-item"><span className="hud-icon">⭐</span><div><span className="hud-label">SCORE</span><strong>{score}</strong></div></div><div className="hud-divider" /><div className="hud-item"><span className="hud-icon">☁️</span><div><span className="hud-label">ROUND</span><strong>{round}</strong></div></div><div className="hud-divider" /><div className="hud-item"><span className="hud-icon">🏆</span><div><span className="hud-label">BEST</span><strong>{score}</strong></div></div></section>
      </main>
      <div className="bottom-cloud-layer" />
      <style>{STYLES}</style>
    </div>
  );
}

const STYLES = `
.number-clouds-page { min-height:100%; position:relative; overflow:hidden; background:radial-gradient(circle at 50% 25%,rgba(255,255,255,.45),transparent 35%),linear-gradient(180deg,#72c7ea 0%,#a9ddf5 48%,#dff3fc 100%); color:#174d75; display:flex; justify-content:center; }
.number-clouds-game { width:min(1100px,94vw); padding:38px 30px 45px; position:relative; z-index:5; display:flex; flex-direction:column; align-items:center; }
.game-heading { text-align:center; margin-bottom:26px; }.game-title { display:flex; align-items:center; justify-content:center; gap:12px; }.title-cloud { font-size:42px; }.game-title h1 { margin:0; font-size:clamp(42px,5vw,64px); font-weight:900; color:#174f78; text-shadow:0 3px 0 rgba(255,255,255,.65),0 8px 20px rgba(29,94,131,.12); }.game-subtitle { display:inline-block; margin:12px 0 18px; padding:11px 24px; border-radius:999px; background:rgba(255,255,255,.78); color:#28618b; font-size:18px; font-weight:800; }
.round-progress { width:min(420px,80vw); margin:0 auto; }.progress-label { display:block; margin-bottom:7px; color:#397296; font-size:11px; font-weight:900; letter-spacing:1.5px; }.progress-track { height:9px; overflow:hidden; border-radius:999px; background:rgba(255,255,255,.55); }.progress-fill { height:100%; border-radius:inherit; background:linear-gradient(90deg,#269ed8,#58c6ed); transition:width .4s ease; }
.sequence-area { width:100%; padding:34px 25px 32px; border-radius:36px; background:rgba(255,255,255,.24); border:1px solid rgba(255,255,255,.45); box-shadow:0 25px 70px rgba(38,102,137,.13),inset 0 1px 0 rgba(255,255,255,.5); backdrop-filter:blur(8px); }.sequence { display:flex; align-items:center; justify-content:center; gap:10px; flex-wrap:wrap; }.sequence-part { display:inline-flex; align-items:center; gap:10px; }.number-cloud { width:112px; height:82px; position:relative; display:flex; align-items:center; justify-content:center; border-radius:48% 52% 50% 46%; background:radial-gradient(circle at 35% 25%,#fff 0%,#fff 25%,#f3f8fb 60%,#dfeaf0 100%); color:#205c83; font-size:38px; font-weight:900; box-shadow:0 12px 20px rgba(43,101,132,.15),inset 0 -5px 0 rgba(185,211,223,.35); animation:cloudBob 3.6s ease-in-out infinite; }.number-cloud::before,.number-cloud::after { content:''; position:absolute; border-radius:50%; background:inherit; z-index:-1; }.number-cloud::before { width:46px; height:46px; left:13px; top:-14px; }.number-cloud::after { width:58px; height:58px; right:12px; top:-20px; }.missing-cloud { width:125px; height:92px; background:radial-gradient(circle at 35% 25%,#fff8bd,#ffe87d 65%,#ffd85c 100%); color:#e99a13; border:4px dashed #f4ae20; box-shadow:0 14px 28px rgba(228,155,27,.22); animation:cloudFloat 2.2s ease-in-out infinite; }.sequence-arrow { color:#4c9bd0; font-size:38px; font-weight:700; }.answer-area { text-align:center; margin-top:28px; }.choose-label { margin:0 0 15px; color:#397296; font-size:14px; font-weight:800; }.answer-buttons { display:flex; justify-content:center; gap:14px; flex-wrap:wrap; }.answer-button { min-width:92px; height:62px; border:0; border-radius:20px; cursor:pointer; background:linear-gradient(180deg,#35afe7,#168fcf); color:#fff; font-size:27px; font-weight:900; box-shadow:0 7px 0 #0875ad; }.answer-button:disabled { cursor:default; }.answer-button.correct { background:linear-gradient(180deg,#48d88b,#22b96b); box-shadow:0 7px 0 #159456; animation:correctAnswer .45s ease; }.answer-button.wrong { background:linear-gradient(180deg,#ff7777,#e94b4b); box-shadow:0 7px 0 #bd3434; animation:wrongAnswer .35s ease; }.answer-feedback { min-height:24px; margin:18px 0 0; font-size:18px; font-weight:900; }.correct-text { color:#159456; }.wrong-text { color:#bd3434; }.next-round-button { margin-top:12px; padding:11px 22px; border:0; border-radius:999px; color:#fff; background:#249ed3; font-weight:900; cursor:pointer; box-shadow:0 4px 0 #0875ad; }
.game-hud { display:flex; align-items:center; justify-content:center; margin-top:25px; padding:13px 28px; border-radius:22px; background:rgba(255,255,255,.72); border:1px solid rgba(255,255,255,.85); box-shadow:0 12px 30px rgba(38,102,137,.12); }.hud-item { min-width:105px; display:flex; align-items:center; gap:9px; text-align:left; }.hud-icon { font-size:22px; }.hud-label { display:block; color:#6b96ae; font-size:9px; font-weight:900; letter-spacing:1px; }.hud-item strong { color:#205c83; font-size:20px; }.hud-divider { width:1px; height:34px; margin:0 16px; background:#c9e2ed; }
.sky-decoration,.bird,.sun,.bottom-cloud-layer { position:absolute; pointer-events:none; }.sky-decoration { opacity:.7; }.cloud-one { left:-30px; top:17%; font-size:110px; opacity:.28; }.cloud-two { right:-35px; top:44%; font-size:150px; opacity:.2; }.cloud-three { left:10%; bottom:3%; font-size:100px; opacity:.2; }.sun { top:35px; right:65px; font-size:65px; }.bird { color:#355b70; opacity:.65; }.bird-one { top:110px; left:25%; font-size:24px; }.bird-two { top:170px; right:25%; font-size:22px; }.bottom-cloud-layer { left:-10%; bottom:-100px; width:120%; height:220px; background:radial-gradient(ellipse at center,rgba(255,255,255,.85),rgba(255,255,255,.25) 55%,transparent 70%); }
@keyframes cloudBob { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-4px); } } @keyframes cloudFloat { 0%,100% { transform:translateY(0) rotate(-1deg); } 50% { transform:translateY(-8px) rotate(1deg); } } @keyframes correctAnswer { 0% { transform:scale(1); } 45% { transform:scale(1.12) rotate(-2deg); } 100% { transform:scale(1); } } @keyframes wrongAnswer { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-8px); } 75% { transform:translateX(8px); } }
@media (max-width:800px) { .number-clouds-game { padding:25px 15px 35px; }.sequence-area { padding:25px 12px; border-radius:25px; }.number-cloud { width:82px; height:64px; font-size:28px; }.missing-cloud { width:92px; height:70px; }.sequence-arrow { font-size:25px; }.game-title h1 { font-size:40px; }.game-hud { padding:11px 15px; }.hud-item { min-width:auto; }.hud-divider { margin:0 10px; }.sun { right:20px; font-size:45px; } }
@media (max-width:560px) { .sequence { gap:6px; }.sequence-part { gap:6px; }.number-cloud { width:65px; height:52px; font-size:23px; }.missing-cloud { width:72px; height:58px; }.sequence-arrow { font-size:20px; }.answer-button { min-width:75px; height:54px; font-size:23px; }.hud-label { display:none; }.hud-item strong { font-size:17px; }.game-hud { border-radius:17px; } }
`;
