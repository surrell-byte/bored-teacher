import React, { useCallback, useEffect, useRef, useState } from "react";

const CATEGORIES = {
  Fruit: [["mango", "🥭"], ["lemon", "🍋"], ["orange", "🍊"], ["banana", "🍌"], ["apple", "🍎"], ["grapes", "🍇"], ["strawberry", "🍓"], ["watermelon", "🍉"], ["pineapple", "🍍"], ["cherries", "🍒"], ["peach", "🍑"], ["kiwi", "🥝"]],
  Animals: [["lion", "🦁"], ["elephant", "🐘"], ["dog", "🐶"], ["cat", "🐱"], ["rabbit", "🐰"], ["bear", "🐻"], ["monkey", "🐵"], ["pig", "🐷"], ["cow", "🐮"], ["horse", "🐴"], ["tiger", "🐯"], ["penguin", "🐧"]],
  Professions: [["doctor", "🧑‍⚕️"], ["teacher", "🧑‍🏫"], ["firefighter", "🧑‍🚒"], ["police officer", "👮"], ["chef", "🧑‍🍳"], ["farmer", "🧑‍🌾"], ["pilot", "🧑‍✈️"], ["scientist", "🧑‍🔬"], ["artist", "🧑‍🎨"], ["mechanic", "🧑‍🔧"], ["astronaut", "🧑‍🚀"], ["judge", "🧑‍⚖️"]],
  Transport: [["car", "🚗"], ["bus", "🚌"], ["train", "🚆"], ["plane", "✈️"], ["boat", "🚤"], ["tractor", "🚜"], ["bike", "🚲"], ["rocket", "🚀"], ["ambulance", "🚑"], ["truck", "🚚"], ["taxi", "🚕"], ["helicopter", "🚁"]],
  Weather: [["sunny", "☀️"], ["cloudy", "☁️"], ["rainy", "🌧️"], ["stormy", "⛈️"], ["snowy", "❄️"], ["windy", "🌬️"], ["foggy", "🌫️"], ["rainbow", "🌈"], ["hot", "🥵"], ["cold", "🥶"], ["lightning", "⚡"], ["tornado", "🌪️"]],
  "Food & Drinks": [["pizza", "🍕"], ["burger", "🍔"], ["fries", "🍟"], ["ice cream", "🍦"], ["cake", "🍰"], ["cookie", "🍪"], ["bread", "🍞"], ["egg", "🥚"], ["cheese", "🧀"], ["juice", "🧃"], ["milk", "🥛"], ["coffee", "☕"]],
  "Family Members": [["mother", "👩"], ["father", "👨"], ["baby", "👶"], ["grandmother", "👵"], ["grandfather", "👴"], ["sister", "👧"], ["brother", "👦"], ["family", "👪"], ["aunt", "👩‍🦱"], ["uncle", "👨‍🦱"], ["twins", "👯"], ["toddler", "🧒"]],
  Sports: [["soccer", "⚽"], ["basketball", "🏀"], ["football", "🏈"], ["baseball", "⚾"], ["tennis", "🎾"], ["volleyball", "🏐"], ["rugby", "🏉"], ["swimming", "🏊"], ["cycling", "🚴"], ["golf", "⛳"], ["boxing", "🥊"], ["bowling", "🎳"]],
};

const DIFFICULTIES = [
  { name: "Easy", cards: 4, preview: 3000 },
  { name: "Medium", cards: 6, preview: 2500 },
  { name: "Hard", cards: 8, preview: 1800 },
  { name: "Expert", cards: 10, preview: 1200 },
];
const PRAISE = ["🌟 Amazing!", "🎉 Fantastic!", "👏 Brilliant!", "⭐ Great Memory!", "🥳 Excellent!", "🚀 Awesome!"];
const shuffle = values => {
  const result = [...values];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }
  return result;
};

function playTone(enabled, type) {
  if (!enabled || typeof window === "undefined") return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type === "wrong" ? "square" : "triangle";
  oscillator.frequency.value = type === "wrong" ? 220 : type === "levelup" ? 760 : 620;
  oscillator.connect(gain);
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.1, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.22);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.22);
}

function Confetti({ pieces }) {
  return pieces.map(piece => <span key={piece.id} className="wm-confetti" style={{ left: `${piece.left}%`, animationDelay: `${piece.delay}s`, color: piece.color }}>{piece.emoji}</span>);
}

export default function MoneyBlocks() {
  const [category, setCategory] = useState("Fruit");
  const [difficulty, setDifficulty] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [status, setStatus] = useState("👀 Get ready to remember!");
  const [round, setRound] = useState({ cards: [], missingIndex: 0, preview: true, answered: false });
  const [options, setOptions] = useState([]);
  const [result, setResult] = useState(null);
  const [confetti, setConfetti] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const timer = useRef(null);

  const startRound = useCallback(() => {
    const settings = DIFFICULTIES[difficulty];
    const pool = CATEGORIES[category];
    const cards = shuffle(pool).slice(0, Math.min(settings.cards, pool.length - 3)).map(([name, emoji]) => ({ name, emoji }));
    const missingIndex = Math.floor(Math.random() * cards.length);
    setRound({ cards, missingIndex, preview: true, answered: false });
    setOptions([]);
    setResult(null);
    setStatus("👀 Remember the pictures!");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setRound(current => ({ ...current, preview: false }));
      const correct = cards[missingIndex];
      const distractors = shuffle(pool.filter(item => item[0] !== correct.name)).slice(0, 3).map(([name, emoji]) => ({ name, emoji }));
      setOptions(shuffle([correct, ...distractors]));
      setStatus(`🤔 Which item disappeared?`);
    }, settings.preview);
  }, [category, difficulty]);

  useEffect(() => {
    startRound();
    return () => clearTimeout(timer.current);
  }, [startRound]);

  function answer(choice) {
    if (round.answered || round.preview) return;
    const correct = round.cards[round.missingIndex];
    const isCorrect = choice.name === correct.name;
    const nextScore = isCorrect ? score + 1 : score;
    const nextStreak = isCorrect ? streak + 1 : 0;
    setRound(current => ({ ...current, answered: true }));
    setResult({ chosen: choice.name, correct: correct.name, isCorrect });
    setScore(nextScore);
    setStreak(nextStreak);
    setStatus(isCorrect ? PRAISE[Math.floor(Math.random() * PRAISE.length)] : `Oops! The answer was ${correct.name}.`);
    playTone(soundEnabled, isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      const unlocked = [];
      if (nextScore === 1) unlocked.push("🌟 First Success");
      if (nextStreak === 3) unlocked.push("🔥 Hot Streak");
      if (nextStreak === 5) unlocked.push("👑 Memory Master");
      if (nextScore === 25) unlocked.push("🥈 Silver Memory");
      if (nextScore === 50) unlocked.push("🥇 Gold Memory");
      if (unlocked.length) setAchievements(current => [...current, ...unlocked]);
      if (nextScore > 0 && nextScore % 5 === 0 && difficulty < DIFFICULTIES.length - 1) {
        setDifficulty(current => current + 1);
        playTone(soundEnabled, "levelup");
      }
      setConfetti(Array.from({ length: 20 }, (_, index) => ({ id: `${Date.now()}-${index}`, left: Math.random() * 100, delay: Math.random() * 0.4, emoji: ["🎉", "⭐", "✨", "🎊"][index % 4], color: ["#ff7a3d", "#ffd166", "#3cb878", "#fff"][index % 4] })));
      setTimeout(() => setConfetti([]), 2400);
    }
  }

  function changeCategory(nextCategory) {
    if (nextCategory === category) return;
    setCategory(nextCategory);
    setDifficulty(0);
    setScore(0);
    setStreak(0);
  }

  const progress = Math.min(score * 2, 100);
  return <div className="wm-root">
    <style>{`.wm-root{--green:#8fd14f;--lime:#a7e063;--orange:#ff7a3d;--gold:#ffc94d;box-sizing:border-box;min-height:100vh;width:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;padding:20px;overflow:hidden;background:radial-gradient(circle at 20% 20%,var(--lime),var(--green));font-family:'Trebuchet MS',sans-serif}.wm-root *{box-sizing:border-box}.wm-title{margin:0;padding:10px 34px;border-radius:18px;background:linear-gradient(#ffd166,#ffa733);box-shadow:0 6px 0 #d88925;color:#fff;font-size:clamp(2rem,6vw,4rem);text-align:center;text-shadow:0 2px #c9791c}.wm-categories{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;max-width:1000px}.wm-category{padding:10px 15px;border:4px solid #f5a623;border-radius:14px;background:#fff;color:#555;font-weight:800;cursor:pointer}.wm-category.active{background:var(--orange);border-color:#e85d20;color:#fff}.wm-score{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;color:#3a8a3a;font-weight:800}.wm-score span,.wm-difficulty{padding:9px 15px;border-radius:14px;background:rgba(255,255,255,.88);box-shadow:0 4px 0 rgba(0,0,0,.08)}.wm-board{display:flex;flex-wrap:wrap;justify-content:center;gap:clamp(8px,2vw,18px);max-width:1000px;min-height:150px}.wm-card{display:flex;align-items:center;justify-content:center;width:clamp(80px,18vw,145px);height:clamp(105px,24vw,190px);border:6px solid #f5a623;border-radius:18px;background:#fff;box-shadow:0 8px 18px rgba(0,0,0,.18);font-size:clamp(2rem,7vw,4rem);transition:.3s}.wm-card.missing{background:#ffc94d;color:var(--orange);font-size:clamp(3rem,9vw,5rem)}.wm-options{display:flex;flex-wrap:wrap;justify-content:center;gap:12px;min-height:110px}.wm-option{display:flex;flex-direction:column;align-items:center;justify-content:center;width:clamp(78px,18vw,112px);height:clamp(78px,18vw,112px);border:4px solid #f5a623;border-radius:16px;background:#fff;cursor:pointer;transition:transform .12s}.wm-option:hover{transform:scale(1.08)}.wm-option.right{border-color:#3cb878;background:#e7fbe9}.wm-option.wrong{border-color:#e8453c;background:#fdeceb}.wm-option-emoji{font-size:clamp(1.8rem,6vw,2.8rem)}.wm-option-name{color:#555;font-size:clamp(.65rem,2vw,.85rem);font-weight:800;text-transform:capitalize;text-align:center}.wm-status{min-height:30px;color:#fff;font-size:clamp(1rem,3vw,1.4rem);font-weight:800;text-align:center;text-shadow:0 2px rgba(0,0,0,.15)}.wm-actions{display:flex;gap:12px}.wm-button{padding:10px 20px;border:0;border-radius:14px;background:#3cb878;box-shadow:0 5px 0 #2a9760;color:#fff;font-weight:800;cursor:pointer}.wm-button:active{transform:translateY(3px);box-shadow:0 2px 0 #2a9760}.wm-progress{width:min(520px,90vw);height:18px;border:4px solid #f5a623;border-radius:999px;background:#fff;overflow:hidden}.wm-progress-bar{height:100%;background:linear-gradient(90deg,#3cb878,#8fd14f);transition:.4s}.wm-achievement{color:#fff;font-weight:800}.wm-confetti{position:fixed;top:-30px;z-index:5;font-size:clamp(1rem,3vw,2rem);pointer-events:none;animation:wm-fall 2.4s linear forwards}@keyframes wm-fall{to{top:105vh;transform:rotate(720deg)}}@media(max-width:600px){.wm-root{justify-content:flex-start;padding-top:28px}.wm-categories{gap:7px}.wm-category{padding:8px 10px;font-size:.75rem}}`}</style>
    <Confetti pieces={confetti} />
    <h1 className="wm-title">What's missing?</h1>
    <div className="wm-categories">{Object.keys(CATEGORIES).map(item => <button key={item} className={`wm-category${item === category ? " active" : ""}`} onClick={() => changeCategory(item)}>{item}</button>)}</div>
    <div className="wm-score"><span>⭐ Score: {score}</span><span>🔥 Streak: {streak}</span><span className="wm-difficulty">Level: {DIFFICULTIES[difficulty].name}</span></div>
    <button className="wm-button" onClick={() => setSoundEnabled(current => !current)}>{soundEnabled ? "🔊 Sound On" : "🔇 Sound Off"}</button>
    <div className="wm-progress"><div className="wm-progress-bar" style={{ width: `${progress}%` }} /></div>
    <div className="wm-board">{round.cards.map((card, index) => <div key={`${card.name}-${index}`} className={`wm-card${!round.preview && index === round.missingIndex ? " missing" : ""}`}>{round.preview || index !== round.missingIndex || result ? card.emoji : "?"}</div>)}</div>
    <div className="wm-options">{options.map(option => <button key={option.name} className={`wm-option${result?.correct === option.name ? " right" : ""}${result?.chosen === option.name && !result.isCorrect ? " wrong" : ""}`} onClick={() => answer(option)}><span className="wm-option-emoji">{option.emoji}</span><span className="wm-option-name">{option.name}</span></button>)}</div>
    <div className="wm-status">{status}</div>
    {achievements.length > 0 && <div className="wm-achievement">🏆 {achievements[achievements.length - 1]}</div>}
    <div className="wm-actions"><button className="wm-button" disabled={!round.answered} onClick={startRound}>Next Round ▶</button></div>
  </div>;
}
