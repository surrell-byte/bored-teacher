import { useEffect, useMemo, useRef, useState } from 'react';

const ITEMS = ['🍎', '⚽', '🐶', '🚗', '🍕'];
const shuffle = values => [...values].sort(() => Math.random() - 0.5);
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

function buildChallenge(variant, round) {
  if (variant === 'count') {
    const first = randomNumber(1, 5);
    const second = randomNumber(1, 5);
    const answer = first + second;
    return { first, second, item: ITEMS[round % ITEMS.length], answer, options: shuffle([answer, Math.max(1, answer - 1), answer + 1, answer + 2]) };
  }
  if (variant === 'higher-lower') {
    const current = randomNumber(2, 12);
    const next = randomNumber(1, 13);
    return { current, next, answer: next >= current ? 'Higher' : 'Lower' };
  }
  if (variant === 'red-black') {
    const red = Math.random() > 0.5;
    return { suit: red ? '♥' : '♠', answer: red ? 'Red' : 'Black' };
  }
  const distance = randomNumber(1, 6);
  return { distance, answer: distance, message: `You rolled ${distance}!` };
}

export default function RoundChallenge({ title, icon, prompt, variant, onComplete }) {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [message, setMessage] = useState('');
  const [locked, setLocked] = useState(false);
  const [seed, setSeed] = useState(0);
  const [position, setPosition] = useState(0);
  const timerRef = useRef(null);
  const challenge = useMemo(() => buildChallenge(variant, seed), [variant, seed]);
  const isRace = variant === 'race';
  const finalRound = round >= 10;

  useEffect(() => () => clearTimeout(timerRef.current), []);

  function advance(isCorrect, detail = '') {
    if (locked) return;
    setLocked(true);
    const nextScore = score + (isCorrect ? 10 : 0);
    const nextCorrect = correct + Number(isCorrect);
    setScore(nextScore);
    setCorrect(nextCorrect);
    setMessage(isCorrect ? `Correct! +10${detail ? ` ${detail}` : ''}` : `Not quite.${detail ? ` ${detail}` : ''}`);
    timerRef.current = setTimeout(() => {
      if (finalRound) onComplete?.(nextScore, Math.round((nextCorrect / 10) * 100));
      else {
        setRound(value => value + 1);
        setSeed(value => value + 1);
        setMessage('');
        setLocked(false);
      }
    }, 700);
  }

  function roll() {
    if (locked) return;
    setLocked(true);
    const nextPosition = Math.min(100, position + challenge.distance * 5);
    setPosition(nextPosition);
    setMessage(`${challenge.message} ${nextPosition >= 100 ? 'Finish line!' : 'Keep going!'}`);
    timerRef.current = setTimeout(() => {
      if (finalRound || nextPosition >= 100) onComplete?.(score + challenge.distance, nextPosition >= 100 ? 100 : Math.round((round / 10) * 100));
      else {
        setRound(value => value + 1);
        setSeed(value => value + 1);
        setLocked(false);
      }
    }, 700);
  }

  function restart() {
    clearTimeout(timerRef.current);
    setRound(1); setScore(0); setCorrect(0); setPosition(0); setLocked(false); setMessage(''); setSeed(value => value + 1);
  }

  return (
    <main className="round-challenge" data-variant={variant}>
      <style>{STYLES}</style>
      <section className="round-challenge-card">
        <header><span className="round-challenge-icon">{icon}</span><div><h1>{title}</h1><p>{prompt}</p></div><strong>{score}<small>points</small></strong></header>
        <div className="round-challenge-progress"><span>Round {Math.min(round, 10)} / 10</span><div><i style={{ width: `${Math.min(round, 10) * 10}%` }} /></div></div>
        {variant === 'count' && <div className="round-challenge-body"><div className="count-display"><span>{Array.from({ length: challenge.first }, () => challenge.item).join(' ')}</span><b>+</b><span>{Array.from({ length: challenge.second }, () => challenge.item).join(' ')}</span></div><div className="challenge-options">{challenge.options.map(option => <button key={option} disabled={locked} onClick={() => advance(option === challenge.answer)}>{option}</button>)}</div></div>}
        {variant === 'higher-lower' && <div className="round-challenge-body"><div className="number-card">{challenge.current}</div><div className="challenge-options two"><button disabled={locked} onClick={() => advance(challenge.answer === 'Higher', `The card was ${challenge.next}.`)}>↑ Higher</button><button disabled={locked} onClick={() => advance(challenge.answer === 'Lower', `The card was ${challenge.next}.`)}>↓ Lower</button></div></div>}
        {variant === 'red-black' && <div className="round-challenge-body"><div className={`playing-card ${challenge.answer.toLowerCase()}`}><span>{challenge.suit}</span></div><div className="challenge-options two"><button disabled={locked} onClick={() => advance(challenge.answer === 'Red')}>🔴 Red</button><button disabled={locked} onClick={() => advance(challenge.answer === 'Black')}>⚫ Black</button></div></div>}
        {isRace && <div className="round-challenge-body"><div className="race-track"><span style={{ left: `calc(${position}% - 18px)` }}>{icon}</span><b>🏁</b></div><button className="primary-challenge" disabled={locked} onClick={roll}>🎲 Roll the dice</button></div>}
        {message && <div className="round-challenge-feedback">{message}</div>}
        <button className="round-challenge-restart" type="button" onClick={restart}>↺ Start over</button>
      </section>
    </main>
  );
}

const STYLES = `.round-challenge{min-height:100%;display:grid;place-items:center;padding:clamp(16px,4vw,32px);background:radial-gradient(circle at top,#253d65 0%,#101624 56%,#090c13 100%);font-family:var(--font-body,system-ui);color:#f8fbff}.round-challenge *{box-sizing:border-box}.round-challenge-card{width:min(100%,700px);padding:clamp(22px,4vw,40px);border:1px solid #ffffff29;border-radius:28px;background:#121c2feb;box-shadow:0 28px 70px #0006;text-align:center}.round-challenge header{display:flex;align-items:center;gap:13px;text-align:left}.round-challenge-icon{font-size:2.5rem}.round-challenge h1{margin:2px 0 0;font-size:clamp(1.45rem,4vw,2rem)}.round-challenge header p{margin:5px 0 0;color:#b9c3d5;font-size:.85rem}.round-challenge header>strong{margin-left:auto;color:#ffd961;font-size:1.7rem;text-align:right}.round-challenge header small{display:block;color:#b9c3d5;font-size:.6rem;text-transform:uppercase}.round-challenge-progress{display:flex;align-items:center;gap:12px;margin:26px 0 16px;color:#b9c3d5;font-size:.78rem;font-weight:700}.round-challenge-progress>div{height:7px;flex:1;border-radius:99px;background:#24344d;overflow:hidden}.round-challenge-progress i{display:block;height:100%;background:linear-gradient(90deg,#56d8c5,#78adff);border-radius:inherit;transition:width .35s}.round-challenge-body{min-height:230px;display:grid;align-content:center;gap:22px}.count-display{display:flex;justify-content:center;align-items:center;gap:14px;font-size:clamp(1.7rem,5vw,2.5rem);flex-wrap:wrap}.count-display b{color:#ffd961}.challenge-options{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.challenge-options.two{grid-template-columns:1fr 1fr}.challenge-options button,.primary-challenge{min-height:55px;border:1px solid #ffffff2e;border-radius:15px;background:#263b5b;color:#f8fbff;font:700 1rem inherit;cursor:pointer}.challenge-options button:hover,.primary-challenge:hover{background:#34557d}.challenge-options button:disabled,.primary-challenge:disabled{opacity:.55;cursor:not-allowed}.number-card{width:130px;height:150px;display:grid;place-items:center;margin:auto;border-radius:20px;background:#f8fbff;color:#182238;font-size:4rem;font-weight:900;box-shadow:0 12px 0 #8fa7c5}.playing-card{width:130px;height:170px;display:grid;place-items:center;margin:auto;border-radius:16px;background:#f8fbff;color:#1a253b;font-size:5rem;box-shadow:0 12px 0 #8fa7c5}.playing-card.red{color:#d94b58}.race-track{position:relative;height:72px;border-bottom:5px solid #56d8c5;background:repeating-linear-gradient(90deg,#1d2d49 0 32px,#243a5b 32px 64px);border-radius:14px}.race-track span{position:absolute;bottom:10px;font-size:2rem;transition:left .5s}.race-track b{position:absolute;right:8px;bottom:9px;font-size:2rem}.primary-challenge{padding:12px 24px;background:#56d8c5;color:#092326;border:0}.round-challenge-feedback{min-height:24px;color:#ffd961;font-weight:800}.round-challenge-restart{margin-top:18px;background:none;border:0;color:#9fb1c8;cursor:pointer;font:inherit}.round-challenge-restart:hover{color:#fff}@media(max-width:560px){.challenge-options{grid-template-columns:repeat(2,1fr)}.round-challenge{padding:12px}.round-challenge-card{border-radius:20px}}`;
