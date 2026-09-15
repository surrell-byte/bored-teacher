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
  { cards: 4, missing: 1, preview: 2200, label: 'Easy' },
  { cards: 4, missing: 2, preview: 1800, label: 'Medium' },
  { cards: 5, missing: 3, preview: 1400, label: 'Hard' },
];
const categories = Object.entries(WHATS_MISSING_CATEGORIES);
const shuffle = values => [...values].sort(() => Math.random() - 0.5);

export default function WhatsMissing({ onComplete, onHudUpdate, themeId: externalThemeId = 'green' }) {
  const [category, setCategory] = useState('Fruit');
  const themeId = externalThemeId;
  const [difficulty, setDifficulty] = useState(0);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [phase, setPhase] = useState('menu');
  const [gameStarted, setGameStarted] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [status, setStatus] = useState('👀 Remember the pictures!');
  const timerRef = useRef(null);
  const theme = THEMES[themeId] || THEMES.green;
  useEffect(() => {
    onHudUpdate?.(gameStarted ? { score, streak, round } : null);
  }, [gameStarted, onHudUpdate, round, score, streak]);
  const challenge = useMemo(() => {
    const pool = WHATS_MISSING_CATEGORIES[category] || WHATS_MISSING_CATEGORIES.Fruit;
    const count = Math.min(DIFFICULTIES[difficulty].cards, Math.max(4, pool.length - 3));
    const chosen = shuffle(pool).slice(0, count);
    const missingIndices = shuffle(chosen.map((_, index) => index)).slice(0, DIFFICULTIES[difficulty].missing);
    const missingItems = missingIndices.map(index => chosen[index]);
    const distractors = shuffle(pool.filter(item => !chosen.includes(item))).slice(0, Math.max(0, 4 - missingItems.length));
    return { chosen, missingIndices, missingItems, options: shuffle([...missingItems, ...distractors]) };
  }, [category, difficulty, round]);

  useEffect(() => {
    if (!gameStarted) return undefined;
    clearTimeout(timerRef.current);
    setPhase('preview');
    setAnswer(null);
    setStatus('👀 Remember the pictures!');
    timerRef.current = setTimeout(() => {
      setPhase('question');
      setStatus(`Which ${category.toLowerCase()} is missing?`);
    }, DIFFICULTIES[difficulty].preview);
    return () => clearTimeout(timerRef.current);
  }, [category, difficulty, gameStarted, round]);

  useEffect(() => {
    const openMenu = () => { setGameStarted(false); setPhase('menu'); };
    window.addEventListener('whats-missing:main-menu', openMenu);
    return () => window.removeEventListener('whats-missing:main-menu', openMenu);
  }, []);

  function choose(value) {
    if (phase !== 'question' || answer) return;
    const correct = challenge.missingItems.some(item => item[0] === value[0]);
    setAnswer(value[0]);
    setPhase('answered');
    setScore(current => current + (correct ? 1 : 0));
    setStreak(current => correct ? current + 1 : 0);
    setStatus(correct ? '🎉 Great memory!' : `The missing cards were ${challenge.missingItems.map(item => item[1]).join(' and ')}.`);
  }

  function nextRound() {
    if (!answer) return;
    if (round >= 10) {
      const finalScore = score + (answer && challenge.missingItems.some(item => item[0] === answer) ? 1 : 0);
      onComplete?.(finalScore, Math.round((finalScore / 10) * 100));
      setRound(1);
      setScore(0);
      setStreak(0);
    } else {
      setRound(current => current + 1);
    }
  }

  const progress = Math.min(100, (round / 10) * 100);
  if (phase === 'menu') return (
    <main className="wm-root" style={{ '--wm-bg1': theme.bg1, '--wm-bg2': theme.bg2, '--wm-status': theme.status }}>
      <section className="wm-menu" aria-labelledby="wm-menu-title">
        <h1 id="wm-menu-title">Choose your challenge</h1>
        <p>Pick a category and difficulty before the round begins.</p>
        <div className="wm-menu-section"><strong>Category</strong><div className="wm-category-bar" role="tablist" aria-label="Categories">{categories.map(([name]) => <button key={name} className={name === category ? 'active' : ''} onClick={() => setCategory(name)} type="button">{name}</button>)}</div></div>
        <div className="wm-menu-section"><strong>Difficulty</strong><div className="wm-category-bar" role="tablist" aria-label="Difficulty">{DIFFICULTIES.map((item, index) => <button key={item.label} className={index === difficulty ? 'active' : ''} onClick={() => setDifficulty(index)} type="button">{item.label}</button>)}</div></div>
        <button className="wm-next" type="button" onClick={() => { setRound(1); setScore(0); setStreak(0); setGameStarted(true); setPhase('preview'); }}>Start Game</button>
      </section>
    </main>
  );
  return (
    <main className="wm-root" style={{ '--wm-bg1': theme.bg1, '--wm-bg2': theme.bg2, '--wm-status': theme.status }}>
      <div className="wm-deco" aria-hidden="true">🌿</div><div className="wm-deco wm-deco-right" aria-hidden="true">🌸</div>
      <div className="wm-top-row"><span>⭐ Score: {score}</span><span>🔥 Streak: {streak}</span><span>Round {round} / 10</span></div>
      <div className="wm-progress"><i style={{ width: `${progress}%` }} /></div>
      <section className="wm-board" aria-live="polite">
        {challenge.chosen.map(([name, emoji], index) => <div className="wm-card" key={`${name}-${index}`}><span>{phase === 'answered' || !challenge.missingIndices.includes(index) ? emoji : '❓'}</span></div>)}
      </section>
      <p className="wm-status">{status}</p>
      {phase !== 'preview' && <div className="wm-options">{challenge.options.map(([name, emoji]) => <button type="button" key={name} className={answer && challenge.missingItems.some(item => item[0] === name) ? 'correct' : answer === name ? 'wrong' : ''} onClick={() => choose([name, emoji])} disabled={phase !== 'question'}><span>{emoji}</span><small>{name}</small></button>)}</div>}
      {phase === 'answered' && <button className="wm-next" type="button" onClick={nextRound}>{round >= 10 ? 'Finish Game' : 'Next Round ▶'}</button>}
    </main>
  );
}
