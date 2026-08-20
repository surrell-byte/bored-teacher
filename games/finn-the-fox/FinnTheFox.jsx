'use client';

import { useMemo, useState } from 'react';

const PAGES = [
  ["Finn's Cozy Home", <>Deep in the <b>Whispering Woods</b> lived a young fox named <b>Finn</b>. He loved his cozy den under the old oak tree.</>],
  ['The Mysterious Glow', <>One evening Finn saw a strange <b>shimmering glow</b> beyond the hills and followed it through tall grass and over a babbling brook.</>],
  ['The Starry Meadow', <>Finn discovered a breathtaking <b>meadow</b> filled with twinkling lights. In the center he spotted a tiny, sad <b>firefly</b> named Luna.</>],
  ['A Friend in Need', <>Luna had lost her <b>family</b>. "Do not worry," said Finn. Together they searched near a sparkling pond.</>],
  ['Home at Last', <>They found Luna's family. Finn returned home with a <b>warm</b> heart, knowing he had made a wonderful new friend. 🧡</>],
];
const QUIZ = [
  ['What is the name of the fox?', ['Max', 'Finn', 'Leo', 'Oliver'], 1],
  ['Where did Finn live?', ['Sunny Desert', 'Rocky Mountains', 'Whispering Woods', 'Crystal Cave'], 2],
  ['What did Finn find in the meadow?', ['A golden key', 'A lost firefly', 'A magic wand', 'A treasure chest'], 1],
  ['How did Finn feel at the end?', ['Sad and lonely', 'Angry and tired', 'Warm and happy', 'Scared and lost'], 2],
];
const BLANKS = [['Whispering', 'woods'], ['Finn', 'fox'], ['shimmering', 'glow'], ['meadow', 'field'], ['firefly', 'insect'], ['family', 'loved ones'], ['warm', 'feeling']];

export default function FinnTheFox({ onComplete }) {
  const [phase, setPhase] = useState('welcome');
  const [page, setPage] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [selectedBlank, setSelectedBlank] = useState(null);
  const [filled, setFilled] = useState({});
  const [mistakes, setMistakes] = useState(0);
  const [soundOn, setSoundOn] = useState(true);
  const quizScore = quizAnswers.filter((answer, index) => answer === QUIZ[index]?.[2]).length;
  const retellScore = Object.keys(filled).length;

  const words = useMemo(() => [...BLANKS.map(([word]) => word), 'lonely', 'dark', 'ocean', 'rabbit'].sort(() => Math.random() - .5), [phase]);
  const completionScore = Math.round(((quizScore + retellScore) / (QUIZ.length + BLANKS.length)) * 100);

  function start() { setPhase('story'); setPage(0); }
  function answerQuiz(index) {
    if (quizAnswers[quizIndex] !== undefined) return;
    setQuizAnswers(answers => [...answers, index]);
  }
  function placeWord(word) {
    if (selectedBlank === null || filled[selectedBlank]) return;
    if (word.toLowerCase() === BLANKS[selectedBlank][0].toLowerCase()) setFilled(value => ({ ...value, [selectedBlank]: word }));
    else setMistakes(value => value + 1);
    setSelectedBlank(null);
  }
  function finish() { setPhase('results'); onComplete?.(completionScore, completionScore); }
  function restart() { setPhase('welcome'); setPage(0); setQuizIndex(0); setQuizAnswers([]); setSelectedBlank(null); setFilled({}); setMistakes(0); }

  return <div className="finn-fox"><style>{CSS}</style><header><b>👑 Finn the Fox</b><span>{phase === 'story' ? `📖 Page ${page + 1} of ${PAGES.length}` : phase === 'quiz' ? '❓ Quiz Time' : phase === 'retell' ? '✍️ Retell' : phase === 'results' ? '🏆 Results' : '📚 Welcome'}</span><button onClick={() => setSoundOn(value => !value)}>{soundOn ? '🔊' : '🔇'}</button></header><div className="ff-progress"><i style={{ width: `${phase === 'welcome' ? 0 : phase === 'story' ? ((page + 1) / PAGES.length) * 33 : phase === 'quiz' ? 50 : phase === 'retell' ? 75 : 100}%` }} /></div><main>
    {phase === 'welcome' && <section className="ff-welcome"><div>🦊</div><h1>Finn the Fox</h1><h2>and the Starry Meadow</h2><p>Join Finn on a magical adventure. Read, answer, retell, and earn stars.</p><button className="ff-primary" onClick={start}>✨ Start the Adventure</button></section>}
    {phase === 'story' && <section><div className={`ff-scene scene-${page}`}>{['🌳','🌿','🦊','✨','🌸'].map((emoji, index) => <span key={index} style={{ left: `${12 + index * 19}%`, bottom: `${18 + (index % 2) * 20}px` }}>{emoji}</span>)}</div><article className="ff-story"><small>Page {page + 1} - {PAGES[page][0]}</small><p>{PAGES[page][1]}</p></article><div className="ff-actions"><button className="ff-secondary" disabled={!page} onClick={() => setPage(value => value - 1)}>⬅ Previous</button><button className="ff-primary" onClick={() => page < PAGES.length - 1 ? setPage(value => value + 1) : setPhase('quiz')}>{page < PAGES.length - 1 ? 'Next ➡' : '✅ Take the Quiz'}</button></div></section>}
    {phase === 'quiz' && <section className="ff-card"><div className="ff-icon">❓</div><h2>{QUIZ[quizIndex][0]}</h2><div className="ff-options">{QUIZ[quizIndex][1].map((option, index) => <button key={option} disabled={quizAnswers[quizIndex] !== undefined} className={quizAnswers[quizIndex] === index ? index === QUIZ[quizIndex][2] ? 'correct' : 'wrong' : ''} onClick={() => answerQuiz(index)}>{option}</button>)}</div>{quizAnswers[quizIndex] !== undefined && <button className="ff-primary" onClick={() => quizIndex < QUIZ.length - 1 ? setQuizIndex(value => value + 1) : setPhase('retell')}>{quizIndex < QUIZ.length - 1 ? 'Next Question ➡' : 'Continue to Retelling ✍️'}</button>}</section>}
    {phase === 'retell' && <section className="ff-card"><div className="ff-icon">✍️</div><p>Click a blank, then click its matching word.</p><p className="ff-retell">Deep in the <button onClick={() => setSelectedBlank(0)}>{filled[0] || '_____'} </button> Woods lived <button onClick={() => setSelectedBlank(1)}>{filled[1] || '_____'} </button>. He followed a <button onClick={() => setSelectedBlank(2)}>{filled[2] || '_____'} </button> glow to a beautiful <button onClick={() => setSelectedBlank(3)}>{filled[3] || '_____'} </button>.</p><div className="ff-word-bank">{words.filter(word => !Object.values(filled).includes(word)).map(word => <button key={word} onClick={() => placeWord(word)}>{word}</button>)}</div><button className="ff-primary" disabled={Object.keys(filled).length < 4} onClick={finish}>✅ Check My Story</button><small>{mistakes ? `${mistakes} mistake${mistakes > 1 ? 's' : ''}` : 'Keep going!'}</small></section>}
    {phase === 'results' && <section className="ff-welcome"><div>🦊</div><h1>Adventure Complete!</h1><div className="ff-stars">{'⭐'.repeat(Math.max(1, Math.ceil(completionScore / 20)))}</div><p>You scored {completionScore}% overall comprehension.</p><button className="ff-primary" onClick={restart}>🔄 Play Again</button></section>}
  </main></div>;
}

const CSS = `
.finn-fox{min-height:100%;padding:18px;color:#2e2013;background:radial-gradient(circle at 20% 20%,#3d2a6b,transparent 55%),radial-gradient(circle at 85% 15%,#5a2a6b,transparent 50%),linear-gradient(160deg,#1a1035,#2d1b4e 55%,#3d1a52);font-family:Georgia,serif}.finn-fox header{max-width:760px;margin:auto;padding:16px 20px;display:flex;gap:14px;align-items:center;justify-content:space-between;color:#fff;background:#241540;border-radius:18px 18px 0 0}.finn-fox header button{border:1px solid #ffffff44;border-radius:50%;background:#ffffff1f;color:#fff;width:34px;height:34px;cursor:pointer}.ff-progress{max-width:760px;height:7px;margin:auto;background:#4a2560}.ff-progress i{display:block;height:100%;background:linear-gradient(90deg,#ff7e3d,#ffc857);transition:width .4s}.finn-fox main{max-width:760px;min-height:560px;margin:auto;padding:28px 30px;background:#fffdf7;border-radius:0 0 24px 24px}.ff-welcome{text-align:center;padding:55px 14px}.ff-welcome>div,.ff-icon{font-size:5rem}.ff-welcome h1{margin:10px 0 2px}.ff-welcome h2{margin:0 0 14px;color:#d4531c;font-weight:400;font-style:italic}.ff-welcome p{line-height:1.7;color:#7a6a58}.ff-primary,.ff-secondary,.ff-options button,.ff-word-bank button,.ff-retell button{border-radius:14px;padding:12px 18px;border:0;font:inherit;cursor:pointer}.ff-primary{background:linear-gradient(135deg,#ff7e3d,#d4531c);color:#fff;font-weight:800}.ff-secondary{background:#fff;color:#d4531c;border:2px solid #ff7e3d}.ff-actions{display:flex;justify-content:center;gap:12px;margin-top:16px;flex-wrap:wrap}.ff-scene{height:230px;position:relative;overflow:hidden;border-radius:18px;background:linear-gradient(#7ec9ec 0 52%,#6fb84a 52%);box-shadow:0 10px 25px #0003}.scene-1{background:linear-gradient(#33254f 0 45%,#e8752a 45% 57%,#2a1e12 57%)}.scene-2,.scene-3,.scene-4{background:linear-gradient(#0c0b30 0 52%,#163a1c 52%)}.ff-scene span{position:absolute;font-size:3rem;filter:drop-shadow(2px 3px 3px #0005)}.ff-story{margin-top:16px;padding:18px 22px;border:1px solid #f0e2c8;border-radius:16px;background:#fff6ea}.ff-story small{color:#d4531c;text-transform:uppercase;letter-spacing:.12em}.ff-story p{font-size:1.18rem;line-height:1.75}.ff-card{display:grid;gap:18px;text-align:center;padding:30px 10px}.ff-card h2{line-height:1.3}.ff-options{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ff-options button{background:#fff;border:2px solid #e6d8bd}.ff-options button.correct{background:#d4f0d4;border-color:#4ade80}.ff-options button.wrong{background:#fdd;border-color:#e05555}.ff-retell{font-size:1.2rem;line-height:2}.ff-retell button{border:2px dashed #c0a880;background:#fffef8;color:#a3907a}.ff-word-bank{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}.ff-word-bank button{background:#fff;border:2px solid #c0a880}.ff-stars{font-size:2rem}@media(max-width:600px){.finn-fox{padding:8px}.finn-fox main{padding:20px 14px}.ff-options{grid-template-columns:1fr}.ff-story p{font-size:1rem}}
`;
