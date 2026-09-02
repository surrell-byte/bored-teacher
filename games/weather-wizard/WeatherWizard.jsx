'use client';

import { useEffect, useState } from 'react';

const LEVELS = [
  { title: 'Weather Scout', icon: '☀️', questions: [['☀️', 'What is the weather like?', ['Sunny', 'Snowy', 'Rainy', 'Foggy'], 'Sunny'], ['🌧️', 'What is the weather like?', ['Windy', 'Rainy', 'Sunny', 'Snowy'], 'Rainy'], ['❄️', 'What is falling from the sky?', ['Rain', 'Leaves', 'Snow', 'Sand'], 'Snow']] },
  { title: 'Season Keeper', icon: '🌸', questions: [['🌸', 'Which season is famous for flowers?', ['Winter', 'Spring', 'Summer', 'Autumn'], 'Spring'], ['🏖️', 'Which season is usually the hottest?', ['Winter', 'Autumn', 'Summer', 'Spring'], 'Summer'], ['🍂', 'Leaves often fall from trees in...', ['Spring', 'Summer', 'Autumn', 'Winter'], 'Autumn']] },
  { title: 'Weather Master', icon: '🌪️', questions: [['🌡️', 'What instrument measures temperature?', ['Thermometer', 'Compass', 'Clock', 'Ruler'], 'Thermometer'], ['🌈', 'What can appear when sunlight shines through rain?', ['Rainbow', 'Snowman', 'Tornado', 'Fog'], 'Rainbow'], ['⚡', 'Which weather event produces a flash of light?', ['Lightning', 'Fog', 'Drizzle', 'Wind'], 'Lightning']] },
  { title: 'Spelling Storm', icon: '🔤', type: 'spelling', questions: [['☀️', 'sunny'], ['🌧️', 'rainy'], ['☁️', 'cloudy'], ['💨', 'windy']] },
  { title: 'Sentence Sky', icon: '✏️', questions: [['It is very _____ today.', ['sunny', 'snowy', 'foggy'], 'sunny'], ['Take an umbrella. It is _____ outside.', ['rainy', 'windy', 'hot'], 'rainy'], ['We build snowmen in _____.', ['summer', 'winter', 'spring'], 'winter']] },
  { title: 'Weather Wizard', icon: '🧙', questions: [['🌈', 'Which condition is often needed before a rainbow appears?', ['Rain', 'Snow', 'Fog', 'Heat'], 'Rain'], ['🌡️', 'If the temperature drops below 0°C, water can...', ['Freeze', 'Boil', 'Disappear', 'Become hotter'], 'Freeze'], ['🌪️', 'What is a powerful spinning column of air?', ['Tornado', 'Cloud', 'Breeze', 'Rainbow'], 'Tornado']] },
];
const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);

export default function WeatherWizard({ onComplete }) {
  const [screen, setScreen] = useState('welcome');
  const [level, setLevel] = useState(0);
  const [question, setQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState([]);
  const [selected, setSelected] = useState(null);
  const [spelling, setSpelling] = useState([]);
  const [feedback, setFeedback] = useState('');
  const current = LEVELS[level];
  const item = current?.questions[question];

  useEffect(() => {
    const showWelcome = () => setScreen('welcome');
    window.addEventListener('weather-wizard:main-menu', showWelcome);
    return () => window.removeEventListener('weather-wizard:main-menu', showWelcome);
  }, []);

  function startLevel(nextLevel) {
    if (nextLevel > 0 && !completed.includes(nextLevel - 1)) return;
    setLevel(nextLevel); setQuestion(0); setScore(0); setSelected(null); setSpelling([]); setFeedback(''); setScreen('game');
  }
  function advance(nextScore) {
    if (question + 1 >= current.questions.length) {
      setCompleted((items) => items.includes(level) ? items : [...items, level]);
      setScore(nextScore); setScreen('result');
      onComplete?.(nextScore, Math.round((nextScore / current.questions.length) * 100));
      return;
    }
    setQuestion((value) => value + 1); setSelected(null); setSpelling([]); setFeedback('');
  }
  function answer(value) {
    if (selected !== null) return;
    setSelected(value);
    const correct = current.type === 'spelling' ? value === item[1].toUpperCase() : value === (current.questions[question][current.type === 'sentence' ? 2 : 3]);
    if (correct) { const nextScore = score + 1; setScore(nextScore); setFeedback('✨ Correct!'); setTimeout(() => advance(nextScore), 550); }
    else { setFeedback(`💡 Try again. Answer: ${current.type === 'sentence' ? item[2] : item[3]}`); setTimeout(() => { setSelected(null); setFeedback(''); }, 900); }
  }
  if (screen === 'welcome') return <main className="weather-wizard ww"><section className="ww-hero"><div><span className="ww-badge">WEATHER ACADEMY</span><h1>Become a <em>Weather Wizard</em></h1><p>Explore weather, seasons, spelling, and sentence challenges across six magical levels.</p><button onClick={() => setScreen('levels')}>Begin Adventure ✨</button></div><div className="ww-wizard">☀️🌧️🌈⚡</div></section></main>;
  if (screen === 'levels') return <main className="weather-wizard ww"><section className="ww-panel"><span className="ww-badge">WIZARD ACADEMY</span><h1>Your Adventure</h1><div className="ww-levels">{LEVELS.map((entry, index) => <button key={entry.title} disabled={index > 0 && !completed.includes(index - 1)} onClick={() => startLevel(index)}>{index > 0 && !completed.includes(index - 1) ? '🔒' : entry.icon}<strong>{index + 1}. {entry.title}</strong><small>{completed.includes(index) ? '✓ Completed' : entry.description || 'Start level'}</small></button>)}</div></section></main>;
  if (screen === 'result') return <main className="weather-wizard ww"><section className="ww-panel ww-result"><div className="ww-wizard">🏆</div><span className="ww-badge">LEVEL COMPLETE</span><h1>{current.title} Complete!</h1><p>You scored <strong>{score} / {current.questions.length}</strong></p><div className="ww-stars">{'⭐'.repeat(score >= current.questions.length * .8 ? 3 : score >= current.questions.length * .6 ? 2 : 1)}</div><button onClick={() => level < LEVELS.length - 1 ? startLevel(level + 1) : setScreen('levels')}>{level < LEVELS.length - 1 ? 'Continue Adventure →' : 'View Academy Map'}</button></section></main>;
  const isSpelling = current.type === 'spelling';
  const options = isSpelling ? shuffle(item[1].toUpperCase().split('')) : current.type === 'sentence' ? shuffle(item[1]) : shuffle(item[2]);
  return <main className="weather-wizard ww"><section className="ww-panel ww-game"><header><strong>{current.icon} {current.title}</strong><span>{question + 1}/{current.questions.length}</span></header><div className="ww-progress"><i style={{ width: `${((question + 1) / current.questions.length) * 100}%` }} /></div><div className="ww-question"><div className="ww-visual">{isSpelling ? item[0] : current.type === 'sentence' ? '✏️' : item[0]}</div><h2>{isSpelling ? 'Spell the weather word' : current.type === 'sentence' ? item[0] : item[1]}</h2>{isSpelling && <div className="ww-word">{item[1].toUpperCase().split('').map((_, index) => <span key={index}>{spelling[index] || '_'}</span>)}</div>}<div className="ww-answers">{options.map((option, index) => <button key={`${option}-${index}`} disabled={selected !== null} className={selected === option ? 'selected' : ''} onClick={() => isSpelling ? setSpelling((letters) => [...letters, option]) : answer(option)}>{option}</button>)}</div>{isSpelling && <><button className="ww-secondary" onClick={() => { setSpelling([]); setSelected(null); }}>Clear</button><button onClick={() => answer(spelling.join(''))}>Check</button></>}<div className="ww-feedback">{feedback}</div></div></section></main>;
}

const STYLES = `
.weather-wizard.ww{min-height:100%;padding:clamp(16px,4vw,40px);background:radial-gradient(circle at 20% 0%,#424a91,#181b42 48%,#0d1028);color:#fff;font-family:var(--font-body,system-ui)}
.ww-hero,.ww-panel{width:min(1100px,100%);margin:auto;border-radius:30px}.ww-hero{min-height:600px;padding:clamp(30px,6vw,70px);display:grid;grid-template-columns:1.1fr .9fr;align-items:center;background:#ffffff12;box-shadow:0 25px 80px #0005}.ww-hero h1{font-size:clamp(2.8rem,7vw,6rem);line-height:.95}.ww-hero em{display:block;color:#49e1c2;font-style:normal}.ww-hero p{max-width:560px;color:#c7c8df;font-size:1.1rem;line-height:1.7}.ww-badge{display:inline-block;padding:8px 14px;border-radius:999px;background:#ffffff14;color:#d5ccff;font-size:.72rem;font-weight:900;letter-spacing:.12em}.ww-wizard{text-align:center;font-size:clamp(4rem,12vw,10rem)}.ww button{border:0;border-radius:14px;padding:13px 20px;background:#f5b942;color:#241b36;font-weight:900;cursor:pointer}.ww button:disabled{opacity:.45;cursor:not-allowed}.ww-panel{background:#faf7ee;color:#201b3c;padding:clamp(22px,4vw,40px);box-shadow:0 25px 80px #0005}.ww-levels{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:28px 0}.ww-levels button{min-height:150px;display:flex;flex-direction:column;align-items:flex-start;gap:10px;text-align:left;background:#fffdf8;color:#27213f}.ww-levels small{color:#77728d}.ww-secondary{background:#211c3c12!important;color:#292341!important}.ww-game header{display:flex;justify-content:space-between;align-items:center;gap:12px}.ww-progress{height:8px;margin:22px 0;background:#e8e1d4;border-radius:99px;overflow:hidden}.ww-progress i{display:block;height:100%;background:linear-gradient(90deg,#9174ff,#44d3b0)}.ww-question{text-align:center;max-width:800px;margin:auto}.ww-visual{width:140px;height:140px;display:grid;place-items:center;margin:20px auto;border-radius:28px;background:#fff;font-size:70px}.ww-question h2{font-size:clamp(1.6rem,4vw,2.5rem)}.ww-answers{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin:24px 0}.ww-answers button{background:#fff;color:#27213f;border:2px solid #e8e2d6;font-size:1.1rem}.ww-answers button.selected{border-color:#e65d73;background:#ffe5e9}.ww-word{display:flex;justify-content:center;gap:8px;margin:20px}.ww-word span{width:42px;height:50px;border-bottom:4px solid #9076f6;font-size:1.6rem}.ww-feedback{min-height:42px;font-weight:900;color:#c33e57}.ww-stars{font-size:2.5rem;margin:22px}@media(max-width:700px){.ww-hero{grid-template-columns:1fr;text-align:center}.ww-hero p{margin-left:auto;margin-right:auto}.ww-levels{grid-template-columns:1fr 1fr}.ww-answers{grid-template-columns:1fr}}@media(max-width:480px){.ww{padding:12px}.ww-levels{grid-template-columns:1fr}.ww-panel{padding:20px}}
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);
}
