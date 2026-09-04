'use client';

import { useState } from 'react';

const CATEGORIES = {
  Animals: [
    { word: 'elephant', emoji: '🐘', sentence: 'The ______ has a long trunk.', options: ['elephant', 'penguin', 'rabbit'] },
    { word: 'penguin', emoji: '🐧', sentence: 'A ______ can swim, but it cannot fly.', options: ['penguin', 'tiger', 'horse'] },
    { word: 'rabbit', emoji: '🐰', sentence: 'Yesterday, the ______ hopped across the garden.', options: ['rabbit', 'whale', 'eagle'] },
    { word: 'giraffe', emoji: '🦒', sentence: 'Have you ever seen a ______ up close?', options: ['giraffe', 'mouse', 'shark'] },
    { word: 'dolphin', emoji: '🐬', sentence: 'Tomorrow, we will look for a ______ in the sea.', options: ['dolphin', 'camel', 'chicken'] },
  ],
  Food: [
    { word: 'banana', emoji: '🍌', sentence: 'I ate a ______ for breakfast.', options: ['banana', 'carrot', 'bread'] },
    { word: 'sandwich', emoji: '🥪', sentence: 'She has already made a ______ for lunch.', options: ['sandwich', 'soup', 'cookie'] },
    { word: 'carrot', emoji: '🥕', sentence: 'The rabbit likes to eat a ______.', options: ['carrot', 'pizza', 'cheese'] },
    { word: 'pancakes', emoji: '🥞', sentence: 'Would you like some ______ with your breakfast?', options: ['pancakes', 'apples', 'rice'] },
    { word: 'watermelon', emoji: '🍉', sentence: 'This ______ is juicy and pink inside.', options: ['watermelon', 'potato', 'onion'] },
  ],
  Nature: [
    { word: 'rainbow', emoji: '🌈', sentence: 'A ______ may appear after the rain.', options: ['rainbow', 'snowflake', 'shadow'] },
    { word: 'mountain', emoji: '⛰️', sentence: 'The climber was walking up the ______.', options: ['mountain', 'puddle', 'cloud'] },
    { word: 'butterfly', emoji: '🦋', sentence: 'A ______ landed on the flower.', options: ['butterfly', 'stone', 'river'] },
    { word: 'sunshine', emoji: '☀️', sentence: 'Warm ______ filled the garden.', options: ['sunshine', 'thunder', 'fog'] },
    { word: 'waterfall', emoji: '🌊', sentence: 'The ______ crashed over the rocks.', options: ['waterfall', 'desert', 'island'] },
  ],
  School: [
    { word: 'backpack', emoji: '🎒', sentence: 'Please put your books in your ______.', options: ['backpack', 'window', 'pillow'] },
    { word: 'scissors', emoji: '✂️', sentence: 'Please cut the paper with ______.', options: ['scissors', 'glue', 'chalk'] },
    { word: 'notebook', emoji: '📓', sentence: 'She wrote the answer in her ______.', options: ['notebook', 'ruler', 'desk'] },
    { word: 'library', emoji: '📚', sentence: 'We can borrow books from the ______.', options: ['library', 'playground', 'cafeteria'] },
    { word: 'dictionary', emoji: '📖', sentence: 'Use a ______ to find a word meaning.', options: ['dictionary', 'calendar', 'map'] },
  ],
  Travel: [
    { word: 'airport', emoji: '✈️', sentence: 'Our plane will leave from the ______.', options: ['airport', 'station', 'harbor'] },
    { word: 'suitcase', emoji: '🧳', sentence: 'I packed my clothes in a ______.', options: ['suitcase', 'helmet', 'wallet'] },
    { word: 'passport', emoji: '🛂', sentence: 'You need a ______ to visit another country.', options: ['passport', 'ticket', 'menu'] },
    { word: 'lighthouse', emoji: '🗼', sentence: 'The ______ guides ships near the coast.', options: ['lighthouse', 'castle', 'bridge'] },
    { word: 'journey', emoji: '🗺️', sentence: 'The long ______ took three days.', options: ['journey', 'breakfast', 'lesson'] },
  ],
  Feelings: [
    { word: 'excited', emoji: '🤩', sentence: 'Mia felt ______ before the big show.', options: ['excited', 'sleepy', 'empty'] },
    { word: 'nervous', emoji: '😬', sentence: 'He felt ______ before his first speech.', options: ['nervous', 'delicious', 'wooden'] },
    { word: 'proud', emoji: '😊', sentence: 'I felt ______ when I finished my project.', options: ['proud', 'cloudy', 'narrow'] },
    { word: 'curious', emoji: '🧐', sentence: 'The ______ child asked many questions.', options: ['curious', 'broken', 'silent'] },
    { word: 'grateful', emoji: '🙏', sentence: 'We are ______ for your kind help.', options: ['grateful', 'ancient', 'round'] },
  ],
};

const LEVELS = [
  { id: 1, title: 'Discover', subtitle: 'Click a card to reveal each word and picture.', icon: '🔎' },
  { id: 2, title: 'Build Sentences', subtitle: 'Choose the vocabulary word that completes each sentence.', icon: '🧩' },
  { id: 3, title: 'Spell It', subtitle: 'Type each vocabulary word from memory.', icon: '✏️' },
];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function normalise(value) {
  return value.trim().toLowerCase().replace(/[^a-z]/g, '');
}

export default function VocabValley({ onComplete }) {
  const [screen, setScreen] = useState('menu');
  const [category, setCategory] = useState('Animals');
  const [level, setLevel] = useState(1);
  const [unlocked, setUnlocked] = useState({ 1: true, 2: false, 3: false });
  const [items, setItems] = useState([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(0);

  const current = items[index];
  const activeLevel = LEVELS[level - 1];

  function startLevel(nextLevel) {
    setLevel(nextLevel);
    setItems(shuffle(CATEGORIES[category]));
    setIndex(0);
    setRevealed(false);
    setAnswer('');
    setFeedback(null);
    setScore(0);
    setScreen('game');
  }

  function chooseCategory(nextCategory) {
    setCategory(nextCategory);
    setUnlocked({ 1: true, 2: false, 3: false });
    setScreen('menu');
  }

  function finishLevel() {
    const nextLevel = level + 1;
    if (nextLevel <= 3) setUnlocked(previous => ({ ...previous, [nextLevel]: true }));
    onComplete?.(score, Math.round((score / items.length) * 100));
    setScreen('complete');
  }

  function nextCard() {
    if (index + 1 >= items.length) {
      finishLevel();
      return;
    }
    setIndex(value => value + 1);
    setRevealed(false);
    setAnswer('');
    setFeedback(null);
  }

  function revealCard() {
    setRevealed(true);
    setScore(value => value + 1);
  }

  function answerSentence(option) {
    if (feedback?.type === 'correct') return;
    if (option === current.word) {
      setScore(value => value + 1);
      setFeedback({ type: 'correct', text: 'Great sentence!' });
    } else {
      setFeedback({ type: 'wrong', text: 'Try again. Read the sentence carefully.' });
    }
  }

  function checkSpelling(event) {
    event.preventDefault();
    if (normalise(answer) === normalise(current.word)) {
      setScore(value => value + 1);
      setFeedback({ type: 'correct', text: 'Perfect spelling!' });
    } else {
      setFeedback({ type: 'wrong', text: 'Almost! Try spelling it again.' });
    }
  }

  if (screen === 'menu') return (
    <div className="vocab-valley"><style>{STYLES}</style><main className="vv-panel vv-menu">
      <div className="vv-hero-icon">🏞️</div><p className="vv-kicker">Welcome to</p><h1>Vocab Valley</h1><p className="vv-intro">Explore new words, build sentences, and become a confident speller.</p>
      <div className="vv-section"><h2>Choose a word valley</h2><div className="vv-category-grid">{Object.keys(CATEGORIES).map(item => <button key={item} className={`vv-category ${item === category ? 'selected' : ''}`} onClick={() => chooseCategory(item)}>{item}</button>)}</div></div>
      <div className="vv-section"><h2>Choose your learning trail</h2><div className="vv-level-grid">{LEVELS.map(item => <button key={item.id} className={`vv-level ${unlocked[item.id] ? '' : 'locked'}`} disabled={!unlocked[item.id]} onClick={() => startLevel(item.id)}><span>{item.icon}</span><strong>Level {item.id}: {item.title}</strong><small>{unlocked[item.id] ? item.subtitle : 'Complete the earlier level to unlock this trail.'}</small></button>)}</div></div>
    </main></div>
  );

  if (screen === 'complete') return (
    <div className="vocab-valley"><style>{STYLES}</style><main className="vv-panel vv-complete"><div className="vv-hero-icon">🏆</div><p className="vv-kicker">Trail complete</p><h1>{activeLevel.title}!</h1><p className="vv-score">{score} stars earned in {category}</p><div className="vv-actions"><button className="vv-primary" onClick={() => startLevel(level)}>🔁 Play again</button>{level < 3 && unlocked[level + 1] && <button className="vv-primary vv-next" onClick={() => startLevel(level + 1)}>➡️ Next level</button>}<button className="vv-secondary" onClick={() => setScreen('menu')}>🗺️ Choose another trail</button></div></main></div>
  );

  return (
    <div className="vocab-valley"><style>{STYLES}</style><main className="vv-panel vv-game">
      <div className="vv-game-top"><button className="vv-secondary vv-small" onClick={() => setScreen('menu')}>← Trail map</button><div><span className="vv-kicker">{category}</span><h1>{activeLevel.icon} {activeLevel.title}</h1></div><span className="vv-progress">{index + 1} / {items.length}</span></div>
      <div className="vv-progress-bar"><i style={{ width: `${((index + 1) / items.length) * 100}%` }} /></div>
      {level === 1 && <section className="vv-learning"><p className="vv-instruction">Click the card to reveal the picture and word.</p><button className={`vv-flashcard ${revealed ? 'revealed' : ''}`} onClick={revealCard}>{revealed ? <><span className="vv-picture">{current.emoji}</span><strong>{current.word}</strong><small>Say it aloud and remember the picture.</small></> : <><span className="vv-picture vv-hidden-picture">❔</span><strong>Tap to discover</strong><small>Picture and word hidden</small></>}</button>{revealed && <button className="vv-primary" onClick={nextCard}>{index + 1 === items.length ? 'Finish Level' : 'Next word →'}</button>}</section>}
      {level === 2 && <section className="vv-quiz"><p className="vv-instruction">{current.emoji} {current.sentence.replace('______', '_____')}</p><div className="vv-options">{current.options.map(option => <button key={option} className={feedback?.type === 'correct' && option === current.word ? 'correct' : feedback?.type === 'wrong' && option !== current.word ? '' : ''} onClick={() => answerSentence(option)} disabled={feedback?.type === 'correct'}>{option}</button>)}</div>{feedback && <p className={`vv-feedback ${feedback.type}`}>{feedback.text}</p>}{feedback?.type === 'correct' && <button className="vv-primary" onClick={nextCard}>{index + 1 === items.length ? 'Finish Level' : 'Next sentence →'}</button>}</section>}
      {level === 3 && <section className="vv-quiz"><div className="vv-word-prompt"><span>{current.emoji}</span><p>Spell the word for this picture.</p></div><form onSubmit={checkSpelling} className="vv-spell-form"><input value={answer} onChange={event => setAnswer(event.target.value)} autoFocus autoComplete="off" aria-label="Type the vocabulary word" placeholder="Type the word" disabled={feedback?.type === 'correct'} /><button className="vv-primary" type="submit" disabled={feedback?.type === 'correct'}>Check</button></form>{feedback && <p className={`vv-feedback ${feedback.type}`}>{feedback.text}</p>}{feedback?.type === 'correct' && <button className="vv-primary" onClick={nextCard}>{index + 1 === items.length ? 'Finish Level' : 'Next word →'}</button>}</section>}
      <div className="vv-scorebar">⭐ {score} stars <span>{activeLevel.subtitle}</span></div>
    </main></div>
  );
}

const STYLES = `
.vocab-valley { min-height:100%; padding:28px; color:#263b35; background:radial-gradient(circle at 15% 12%,#fff5c9 0 9%,transparent 25%),linear-gradient(145deg,#d9f2d0,#a8d9c4 55%,#f5e6b5); font-family:var(--font-body,sans-serif); }
.vv-panel { width:min(980px,100%); min-height:100%; margin:auto; }.vv-menu,.vv-complete { display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; padding:30px 14px 46px; }.vv-hero-icon { font-size:5rem; }.vv-kicker { margin:5px 0; color:#41766c; font-size:.75rem; font-weight:900; letter-spacing:.14em; text-transform:uppercase; }.vv-panel h1 { margin:4px 0 10px; color:#245b50; font-family:var(--font-display,sans-serif); font-size:clamp(2.4rem,7vw,4.5rem); }.vv-intro { max-width: fifty; max-width:54ch; color:#496d65; line-height:1.6; }.vv-section { width:100%; margin-top:24px; }.vv-section h2 { margin:0 0 12px; color:#315e55; font-size:1rem; }.vv-category-grid { display:flex; flex-wrap:wrap; justify-content:center; gap:9px; }.vv-category,.vv-level,.vv-primary,.vv-secondary,.vv-options button { font:inherit; cursor:pointer; }.vv-category { padding:10px 16px; border:1px solid #9ac9b3; border-radius:14px; background:rgba(255,255,255,.55); color:#315e55; font-weight:800; }.vv-category.selected { background:#317d6d; color:#fff; border-color:#317d6d; }.vv-level-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }.vv-level { display:grid; grid-template-columns:auto 1fr; gap:6px 10px; padding:16px; text-align:left; border:1px solid #9ac9b3; border-radius:16px; background:rgba(255,255,255,.62); color:#315e55; }.vv-level span { grid-row:span 2; font-size:1.7rem; }.vv-level strong { align-self:end; }.vv-level small { color:#64877d; line-height:1.35; }.vv-level.locked { opacity:.55; cursor:not-allowed; }.vv-primary { border:0; border-radius:12px; padding:12px 19px; background:#e39b38; color:#fff; font-weight:900; box-shadow:0 4px 0 #ba7623; }.vv-primary:disabled { opacity:.55; cursor:not-allowed; }.vv-next { background:#317d6d; box-shadow:0 4px 0 #245b50; }.vv-secondary { border:1px solid #a7c8bb; border-radius:12px; padding:11px 16px; background:rgba(255,255,255,.5); color:#315e55; font-weight:800; }.vv-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:12px; }.vv-score { color:#49746a; font-size:1.2rem; }.vv-game { padding:18px 0 35px; }.vv-game-top { display:flex; align-items:center; justify-content:space-between; gap:16px; }.vv-game-top h1 { font-size:clamp(1.7rem,4vw,2.7rem); }.vv-small { white-space:nowrap; }.vv-progress { color:#41766c; font-weight:900; }.vv-progress-bar { height:9px; margin:5px 0 28px; overflow:hidden; border-radius:99px; background:rgba(255,255,255,.62); }.vv-progress-bar i { display:block; height:100%; border-radius:inherit; background:#e39b38; transition:width .3s ease; }.vv-learning,.vv-quiz { display:flex; flex-direction:column; align-items:center; text-align:center; padding:24px; border:1px solid rgba(255,255,255,.7); border-radius:24px; background:rgba(255,255,255,.48); }.vv-instruction { color:#3d6e63; font-weight:800; }.vv-flashcard { display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; width:min(390px,100%); min-height:280px; margin:10px 0 22px; border:2px dashed #d7a53c; border-radius:22px; background:#fff9df; color:#315e55; cursor:pointer; box-shadow:0 12px 26px rgba(55,105,82,.15); }.vv-picture { font-size:6.5rem; }.vv-flashcard strong { font-size:1.7rem; }.vv-flashcard small { color:#66877d; }.vv-options { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; width:min(700px,100%); }.vv-options button { min-height:58px; border:1px solid #9ac9b3; border-radius:14px; background:#fffdf1; color:#315e55; font-weight:900; }.vv-options button:hover,.vv-options button.correct { background:#317d6d; color:#fff; }.vv-feedback { min-height:24px; font-weight:900; }.vv-feedback.correct { color:#24724f; }.vv-feedback.wrong { color:#b35b3e; }.vv-word-prompt span { font-size:5rem; }.vv-word-prompt p { color:#3d6e63; font-weight:800; }.vv-spell-form { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; }.vv-spell-form input { min-width:min(320px,70vw); padding:13px 15px; border:2px solid #9ac9b3; border-radius:12px; background:#fffdf1; color:#263b35; font:inherit; }.vv-scorebar { display:flex; justify-content:space-between; gap:16px; margin-top:18px; color:#315e55; font-weight:900; }.vv-scorebar span { color:#64877d; font-size:.85rem; font-weight:600; }
@media (max-width:700px) { .vocab-valley { padding:16px; }.vv-level-grid { grid-template-columns:1fr; }.vv-game-top { align-items:flex-start; flex-wrap:wrap; }.vv-game-top > div { order:-1; width:100%; }.vv-options { grid-template-columns:1fr; }.vv-scorebar { flex-direction:column; align-items:center; } }
`;
