'use client';

import { useMemo, useState } from 'react';

const PAGES = [
  ["Finn's Cozy Home", <>Deep in the <b>Whispering Woods</b> lived a young fox named <b>Finn</b>. He loved his cozy den under the old oak tree.</>],
  ['The Mysterious Glow', <>One evening Finn saw a strange <b>shimmering glow</b> beyond the hills and followed it through tall grass and over a babbling brook.</>],
  ['The Starry Meadow', <>Finn discovered a breathtaking <b>meadow</b> filled with twinkling lights. In the center he spotted a tiny, sad <b>firefly</b> named Luna.</>],
  ['A Friend in Need', <>Luna had lost her <b>family</b>. "Do not worry," said Finn. Together they searched near a sparkling pond.</>],
  ['Home at Last', <>They found Luna's family. Finn returned home with a <b>warm</b> heart, knowing he had made a wonderful new friend. 🧡</>],
];
const TANYA_PAGES = [
  ['Tanya\'s Amazing Cooking', <>Tanya loved to cook. She didn't just make food. She made <b>amazing</b> food. Her grandmother had taught her all the family recipes, and Tanya had become an incredible cook. Her chicken pies were crispy and golden. Her pasta was creamy and delicious. Her cakes were soft, sweet, and impossible to resist. Soon, Tanya's neighbours began coming over just to taste her cooking. “Just one bite!” they would say. But one bite quickly became a whole plate. Everyone loved Tanya's food. And Tanya loved making people happy. She had no idea that her delicious cooking was about to cause a very unusual problem.</>],
  ['Everyone Wants More!', <>Tanya's cooking became famous throughout the community. On Monday, she made creamy chicken pasta. On Tuesday, she made crispy chicken pies. On Wednesday, she made cheesy potatoes. And on Friday, she made her legendary chocolate cake. People couldn't get enough. “Can I have another piece?” “Me too!” “Is there any more pasta?” “Please save me a chicken pie!” Soon, people were eating Tanya's delicious food almost every day. They were having bigger portions and fewer healthy meals. Nobody noticed the problem at first. But after several weeks, the community began to change.</>],
  ['The Community Has a Problem', <>One morning, Mr. Dube tried to put on his favourite trousers. “Hmm...” he grunted. He pulled. He pushed. He jumped. <b>POP!</b> The button flew across the room! Meanwhile, Mrs. Moyo tried to climb the hill near her house. She stopped halfway. “Why is this hill suddenly so long?” Even the school football team was struggling during practice. “I need a rest!” one player groaned. Finally, everyone gathered for a community meeting. “We have a problem,” said Mr. Dube. Everyone nodded. Then someone shouted: “I know what caused it!” Everyone turned around. “Tanya's cooking!” Tanya nearly dropped her spoon. “<b>My cooking?!</b>”</>],
  ['Tanya Finds a Solution', <>Tanya felt terrible. “I only wanted everyone to enjoy good food,” she said. Mr. Dube shook his head. “We love your food, Tanya. That's the problem!” Everyone laughed. Tanya thought carefully. She didn't want people to stop enjoying delicious food. But she realized that eating rich foods too often and in very large portions wasn't a good idea. So Tanya created a new plan. She started serving smaller portions. She added colourful vegetables and fresh salads to her meals. She taught everyone how to make tasty food using different ingredients. And she started a community cooking club where everyone learned about enjoying treats <b>in moderation</b>. “Food should be delicious,” Tanya said, “but we also need balance!” Everyone agreed.</>],
  ['The Happiest Community', <>Soon, things changed. People started walking together in the evenings. The children played outside more often. The football team started running again. And everyone still enjoyed Tanya's amazing cooking. One Saturday, Tanya brought out her famous chocolate cake. Everyone stared at it. Mr. Dube slowly reached for a huge slice. Mrs. Moyo grabbed his arm. “Remember the plan!” Mr. Dube sighed. “Fine. I'll have a small piece.” He took one bite. His eyes grew wide. “Tanya...” “Yes?” “This cake is still unbelievably good!” Everyone laughed. Tanya smiled. “That's because you don't need a giant slice to enjoy something delicious.” From then on, the community remembered an important lesson: <b>Good food is wonderful. But enjoying it in balance is even better.</b> And Tanya? She kept cooking. Nobody had solved the problem of Tanya's chocolate cake being <b>far too delicious</b>!</>],
];
const QUIZ = [
  ['What is the name of the fox?', ['Max', 'Finn', 'Leo', 'Oliver'], 1],
  ['Where did Finn live?', ['Sunny Desert', 'Rocky Mountains', 'Whispering Woods', 'Crystal Cave'], 2],
  ['What did Finn find in the meadow?', ['A golden key', 'A lost firefly', 'A magic wand', 'A treasure chest'], 1],
  ['How did Finn feel at the end?', ['Sad and lonely', 'Angry and tired', 'Warm and happy', 'Scared and lost'], 2],
];
const BLANKS = [['Whispering', 'woods'], ['Finn', 'fox'], ['shimmering', 'glow'], ['meadow', 'field']];
const LEVELS = [
  { number: 1, name: 'The Starry Meadow', description: 'Read the first rescue story and find Luna.' },
  { number: 2, name: 'The Lost Duckling', description: 'Follow clues and answer what happened next.' },
  { number: 3, name: 'The Trapped Rabbit', description: 'Use details from the story to plan a rescue.' },
  { number: 4, name: 'The Forest Family', description: 'Connect characters, places, and key events.' },
  { number: 5, name: 'Rescue Leader', description: 'Master the final comprehension challenge.' },
  { number: 6, name: "Tanya's Tasteful Trouble", description: 'Read Tanya\'s story and discover why balance matters.' },
];

export default function ReadingRescue({ onComplete }) {
  const [phase, setPhase] = useState('menu');
  const [level, setLevel] = useState(1);
  const [page, setPage] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [selectedBlank, setSelectedBlank] = useState(null);
  const [filled, setFilled] = useState({});
  const [mistakes, setMistakes] = useState(0);
  const [retellError, setRetellError] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const storyPages = level === 6 ? TANYA_PAGES : PAGES;
  const quizScore = quizAnswers.filter((answer, index) => answer === QUIZ[index]?.[2]).length;
  const retellScore = Object.keys(filled).length;

  const words = useMemo(() => [...BLANKS.map(([word]) => word), 'lonely', 'dark', 'ocean', 'rabbit'].sort(() => Math.random() - .5), [phase]);
  const completionScore = Math.round(((quizScore + retellScore) / (QUIZ.length + BLANKS.length)) * 100);

  function start(nextLevel = level) { setLevel(nextLevel); setPhase('story'); setPage(0); setQuizIndex(0); setQuizAnswers([]); setSelectedBlank(null); setFilled({}); setMistakes(0); setRetellError(false); setRevealed(false); }
  function answerQuiz(index) {
    if (quizAnswers[quizIndex] !== undefined) return;
    setQuizAnswers(answers => [...answers, index]);
  }
  function placeWord(word) {
    if (selectedBlank === null || filled[selectedBlank]) return;
    if (word.toLowerCase() === BLANKS[selectedBlank][0].toLowerCase()) setFilled(value => ({ ...value, [selectedBlank]: word }));
    else {
      setMistakes(value => value + 1);
      setRetellError(true);
      window.setTimeout(() => setRetellError(false), 700);
      if (mistakes + 1 >= 3) setRevealed(true);
    }
    setSelectedBlank(null);
  }
  function finish() { if (revealed) return; setPhase('results'); onComplete?.(completionScore, completionScore); }
  function restart() { start(level); }

  return <div className="finn-fox"><style>{CSS}</style><style>{`.finn-fox main{max-width:1100px;padding:clamp(28px,5vw,64px)}.ff-progress{max-width:1100px}.ff-story-layout{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr);align-items:center;gap:clamp(24px,4vw,52px);min-height:520px}.ff-story-layout .ff-story-illustration{width:100%;height:auto;min-height:360px;object-fit:cover}.ff-story-layout .ff-story{margin-top:0;padding:clamp(26px,4vw,42px)}.ff-story-layout .ff-story p{font-size:clamp(1.15rem,2vw,1.55rem);line-height:1.75}.ff-level-menu{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;margin-top:24px}.ff-level{display:flex;min-height:132px;flex-direction:column;justify-content:center;gap:7px;padding:18px;text-align:left;border:2px solid #ffb27e;border-radius:16px;background:#fff;color:#2e2013;cursor:pointer}.ff-level:hover{border-color:#d4531c;transform:translateY(-2px)}.ff-level strong{display:block;color:#d4531c;font-size:1.05rem}.ff-level span{display:block;font-size:1.05rem;font-weight:700;line-height:1.2}.ff-level small{display:block;color:#7a6a58;font-size:.78rem;line-height:1.45}@media(max-width:700px){.finn-fox main{padding:24px 18px}.ff-story-layout{grid-template-columns:1fr;gap:20px;min-height:0}.ff-story-layout .ff-story-illustration{min-height:0}.ff-story-layout .ff-story{padding:22px}.ff-story-layout .ff-story p{font-size:1.15rem}}`}</style><div className="ff-progress"><i style={{ width: `${phase === 'menu' ? 0 : phase === 'story' ? ((page + 1) / PAGES.length) * 33 : phase === 'quiz' ? 50 : phase === 'retell' ? 75 : 100}%` }} /></div><main>
    {phase === 'menu' && <section className="ff-welcome"><div>🦊</div><h1>Reading Rescue</h1><h2>Finn's comprehension adventure</h2><p>Rescue captured animals by reading carefully, answering comprehension questions, and rebuilding their story.</p><div className="ff-level-menu">{LEVELS.map(item => <button className="ff-level" key={item.number} onClick={() => start(item.number)}><strong>Level {item.number}</strong><span>{item.name}</span><small>{item.description}</small></button>)}</div></section>}
    {phase === 'story' && <section className="ff-story-layout"><img className="ff-scene ff-story-illustration" src={level === 6 ? `/assets/.optimized/games/finn-the-fox/tanya-story-scene-${page + 1}.webp` : `/assets/games/finn-the-fox/finn-${page + 1}.png`} alt={`${level === 6 ? 'Tanya' : 'Finn'} story page ${page + 1}`} /><div><article className="ff-story"><small>Page {page + 1} - {storyPages[page][0]}</small><p>{storyPages[page][1]}</p></article><div className="ff-actions"><button className="ff-secondary" disabled={!page} onClick={() => setPage(value => value - 1)}>⬅ Previous</button><button className="ff-primary" onClick={() => page < storyPages.length - 1 ? setPage(value => value + 1) : setPhase('quiz')}>{page < storyPages.length - 1 ? 'Next ➡' : '✅ Take the Quiz'}</button></div></div></section>}
    {phase === 'quiz' && <section className="ff-card"><img className="ff-quiz-image" src={`/finn-${quizIndex + 1}.webp`} alt="Finn story scene" /><h2>{QUIZ[quizIndex][0]}</h2><div className="ff-options">{QUIZ[quizIndex][1].map((option, index) => <button key={option} disabled={quizAnswers[quizIndex] !== undefined} className={quizAnswers[quizIndex] === index ? index === QUIZ[quizIndex][2] ? 'correct' : 'wrong' : ''} onClick={() => answerQuiz(index)}>{option}</button>)}</div>{quizAnswers[quizIndex] !== undefined && <button className="ff-primary" onClick={() => quizIndex < QUIZ.length - 1 ? setQuizIndex(value => value + 1) : setPhase('retell')}>{quizIndex < QUIZ.length - 1 ? 'Next Question ➡' : 'Continue to Retelling ✍️'}</button>}</section>}
    {phase === 'retell' && <section className={`ff-retell-layout${retellError ? ' ff-retell-error' : ''}`}><div className="ff-retell-copy"><div className="ff-icon">✍️</div><p>Click a blank, then click its matching word.</p><p className="ff-retell">Deep in the <button onClick={() => !revealed && setSelectedBlank(0)}>{filled[0] || (revealed ? BLANKS[0][0] : '_____')} </button> Woods lived <button onClick={() => !revealed && setSelectedBlank(1)}>{filled[1] || (revealed ? BLANKS[1][0] : '_____')} </button>. He followed a <button onClick={() => !revealed && setSelectedBlank(2)}>{filled[2] || (revealed ? BLANKS[2][0] : '_____')} </button> glow to a beautiful <button onClick={() => !revealed && setSelectedBlank(3)}>{filled[3] || (revealed ? BLANKS[3][0] : '_____')} </button>.</p>{!revealed && <div className="ff-word-bank">{words.filter(word => !Object.values(filled).includes(word)).map(word => <button key={word} onClick={() => placeWord(word)}>{word}</button>)}</div>}{revealed ? <><strong className="ff-game-over">The answers are revealed. Game over.</strong><button className="ff-primary" onClick={restart}>↩ Restart from checkpoint</button></> : <button className="ff-primary" disabled={Object.keys(filled).length < 4} onClick={finish}>✅ Check My Story</button>}<small>{mistakes ? `${mistakes}/3 mistakes — ${3 - mistakes} ${3 - mistakes === 1 ? 'try' : 'tries'} left` : 'Keep going!'}</small></div><img className="ff-retell-image" src="/finn-3.webp" alt="Finn in the starry meadow" /></section>}
    {phase === 'results' && <section className="ff-welcome"><div>🦊</div><h1>Adventure Complete!</h1><div className="ff-stars">{'⭐'.repeat(Math.max(1, Math.ceil(completionScore / 20)))}</div><p>You scored {completionScore}% overall comprehension.</p><button className="ff-primary" onClick={restart}>🔄 Play Again</button></section>}
  </main></div>;
}

const CSS = `
.finn-fox{min-height:100%;padding:18px;color:#2e2013;background:radial-gradient(circle at 20% 20%,#3d2a6b,transparent 55%),radial-gradient(circle at 85% 15%,#5a2a6b,transparent 50%),linear-gradient(160deg,#1a1035,#2d1b4e 55%,#3d1a52);font-family:Georgia,serif}.finn-fox header{max-width:760px;margin:auto;padding:16px 20px;display:flex;gap:14px;align-items:center;justify-content:space-between;color:#fff;background:#241540;border-radius:18px 18px 0 0}.finn-fox header button{border:1px solid #ffffff44;border-radius:50%;background:#ffffff1f;color:#fff;width:34px;height:34px;cursor:pointer}.ff-progress{max-width:760px;height:7px;margin:auto;background:#4a2560}.ff-progress i{display:block;height:100%;background:linear-gradient(90deg,#ff7e3d,#ffc857);transition:width .4s}.finn-fox main{max-width:760px;min-height:560px;margin:auto;padding:28px 30px;background:#fffdf7;border-radius:0 0 24px 24px}.ff-welcome{text-align:center;padding:55px 14px}.ff-welcome>div,.ff-icon{font-size:5rem}.ff-welcome h1{margin:10px 0 2px}.ff-welcome h2{margin:0 0 14px;color:#d4531c;font-weight:400;font-style:italic}.ff-welcome p{line-height:1.7;color:#7a6a58}.ff-primary,.ff-secondary,.ff-options button,.ff-word-bank button,.ff-retell button{border-radius:14px;padding:12px 18px;border:0;font:inherit;cursor:pointer}.ff-primary{background:linear-gradient(135deg,#ff7e3d,#d4531c);color:#fff;font-weight:800}.ff-secondary{background:#fff;color:#d4531c;border:2px solid #ff7e3d}.ff-actions{display:flex;justify-content:center;gap:12px;margin-top:16px;flex-wrap:wrap}.ff-scene{height:230px;position:relative;overflow:hidden;border-radius:18px;background:linear-gradient(#7ec9ec 0 52%,#6fb84a 52%);box-shadow:0 10px 25px #0003}.scene-1{background:linear-gradient(#33254f 0 45%,#e8752a 45% 57%,#2a1e12 57%)}.scene-2,.scene-3,.scene-4{background:linear-gradient(#0c0b30 0 52%,#163a1c 52%)}.ff-scene span{position:absolute;font-size:3rem;filter:drop-shadow(2px 3px 3px #0005)}.ff-story{margin-top:16px;padding:18px 22px;border:1px solid #f0e2c8;border-radius:16px;background:#fff6ea}.ff-story small{color:#d4531c;text-transform:uppercase;letter-spacing:.12em}.ff-story p{font-size:1.18rem;line-height:1.75}.ff-card{display:grid;gap:18px;text-align:center;padding:30px 10px}.ff-card h2{line-height:1.3}.ff-options{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ff-options button{background:#fff;border:2px solid #e6d8bd}.ff-options button.correct{background:#d4f0d4;border-color:#4ade80}.ff-options button.wrong{background:#fdd;border-color:#e05555}.ff-retell{font-size:1.2rem;line-height:2}.ff-retell button{border:2px dashed #c0a880;background:#fffef8;color:#a3907a}.ff-word-bank{display:flex;gap:9px;justify-content:center;flex-wrap:wrap}.ff-word-bank button{background:#fff;border:2px solid #c0a880}.ff-stars{font-size:2rem}@media(max-width:600px){.finn-fox{padding:8px}.finn-fox main{padding:20px 14px}.ff-options{grid-template-columns:1fr}.ff-story p{font-size:1rem}}
`;
