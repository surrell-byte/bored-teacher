import { useEffect, useMemo, useRef, useState } from 'react';
import './WhatsMissing.css';
import { WHATS_MISSING_CATEGORIES } from './whatsMissingData';

const THEMES = {
  green: { bg1: '#8fd14f', bg2: '#a7e063', status: '#ffffff' },
  blue: { bg1: '#4fc3f7', bg2: '#81d4fa', status: '#123844' },
  red: { bg1: '#ef5350', bg2: '#e57373', status: '#ffffff' },
  yellow: { bg1: '#ffd54f', bg2: '#fff176', status: '#5a4500' },
  white: { bg1: '#f0f0f0', bg2: '#ffffff', status: '#333333' },
  black: { bg1: '#3a3a3a', bg2: '#1a1a1a', status: '#ffffff' },
};
const DIFFICULTIES = [
  { cards: 4, preview: 2200 },
  { cards: 6, preview: 1800 },
  { cards: 8, preview: 1400 },
  { cards: 10, preview: 1000 },
];
const categories = Object.entries(WHATS_MISSING_CATEGORIES);
const shuffle = values => [...values].sort(() => Math.random() - 0.5);

export default function WhatsMissing({ onComplete }) {
  const [category, setCategory] = useState('Fruit');
  const [themeId, setThemeId] = useState('green');
  const [difficulty, setDifficulty] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState('preview');
  const [answer, setAnswer] = useState(null);
  const [status, setStatus] = useState('👀 Remember the pictures!');
  const timerRef = useRef(null);
  const theme = THEMES[themeId] || THEMES.green;
  const challenge = useMemo(() => {
    const pool = WHATS_MISSING_CATEGORIES[category] || WHATS_MISSING_CATEGORIES.Fruit;
    const count = Math.min(DIFFICULTIES[difficulty].cards, Math.max(4, pool.length - 3));
    const chosen = shuffle(pool).slice(0, count);
    const missingIndex = Math.floor(Math.random() * chosen.length);
    const distractors = shuffle(pool.filter(item => !chosen.includes(item))).slice(0, 3);
    return { chosen, missingIndex, options: shuffle([chosen[missingIndex], ...distractors]) };
  }, [category, difficulty, round]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    setPhase('preview');
    setAnswer(null);
    setStatus('👀 Remember the pictures!');
    timerRef.current = setTimeout(() => {
      setPhase('question');
      setStatus(`Which ${category.toLowerCase()} is missing?`);
    }, DIFFICULTIES[difficulty].preview);
    return () => clearTimeout(timerRef.current);
  }, [category, difficulty, round]);

  function choose(value) {
    if (phase !== 'question' || answer) return;
    const correct = value[0] === challenge.chosen[challenge.missingIndex][0];
    setAnswer(value[0]);
    setPhase('answered');
    setScore(current => current + (correct ? 1 : 0));
    setStreak(current => correct ? current + 1 : 0);
    setStatus(correct ? '🎉 Great memory!' : `The answer was ${challenge.chosen[challenge.missingIndex][1]}.`);
  }

  function nextRound() {
    if (!answer) return;
    if (round >= 10) {
      onComplete?.(score, Math.round((score / 10) * 100));
      setRound(1);
      setScore(0);
      setStreak(0);
    } else {
      setRound(current => current + 1);
    }
  }

  const progress = Math.min(100, (round / 10) * 100);
  return (
    <main className="wm-root" style={{ '--wm-bg1': theme.bg1, '--wm-bg2': theme.bg2, '--wm-status': theme.status }}>
      <div className="wm-deco" aria-hidden="true">🌿</div><div className="wm-deco wm-deco-right" aria-hidden="true">🌸</div>
      <h1 className="wm-banner">🧐 What&apos;s Missing?</h1>
      <div className="wm-category-bar" role="tablist" aria-label="Categories">
        {categories.map(([name]) => <button key={name} className={name === category ? 'active' : ''} onClick={() => { setCategory(name); setRound(1); setScore(0); }} type="button">{name}</button>)}
      </div>
      <div className="wm-theme-bar" aria-label="Themes">
        {Object.entries(THEMES).map(([id, value]) => <button key={id} type="button" className={id === themeId ? 'active' : ''} style={{ background: `linear-gradient(135deg, ${value.bg1}, ${value.bg2})` }} aria-label={`${id} theme`} onClick={() => setThemeId(id)} />)}
      </div>
      <div className="wm-top-row"><span>⭐ Score: {score}</span><span>🔥 Streak: {streak}</span><span>Round {round} / 10</span></div>
      <div className="wm-progress"><i style={{ width: `${progress}%` }} /></div>
      <section className="wm-board" aria-live="polite">
        {challenge.chosen.map(([name, emoji], index) => <div className="wm-card" key={`${name}-${index}`}><span>{phase === 'preview' && index !== challenge.missingIndex || phase === 'answered' ? emoji : '❓'}</span></div>)}
      </section>
      <p className="wm-status">{status}</p>
      {phase !== 'preview' && <div className="wm-options">{challenge.options.map(([name, emoji]) => <button type="button" key={name} className={answer && name === challenge.chosen[challenge.missingIndex][0] ? 'correct' : answer === name ? 'wrong' : ''} onClick={() => choose([name, emoji])} disabled={phase !== 'question'}><span>{emoji}</span><small>{name}</small></button>)}</div>}
      {phase === 'answered' && <button className="wm-next" type="button" onClick={nextRound}>{round >= 10 ? 'Finish Game' : 'Next Round ▶'}</button>}
    </main>
  );
}
