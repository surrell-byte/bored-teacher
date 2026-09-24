'use client';

/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
import { useEffect, useMemo, useState } from 'react';
import { READING_RESCUE_QUIZZES } from './readingRescueData';
import { readingRescueStories as READING_RESCUE_STORIES } from './readingRescueStories';

const LEGACY_STORIES = {
  1: {
    title: 'The Starry Meadow',
    description: 'Read the first rescue story and find Luna.',
    pages: [
      ["Finn's Cozy Home", <>Deep in the <b>Whispering Woods</b> lived a young fox named <b>Finn</b>. He loved his cozy den under the old oak tree.</>],
      ['The Mysterious Glow', <>One evening Finn saw a strange <b>shimmering glow</b> beyond the hills and followed it through tall grass and over a babbling brook.</>],
      ['The Starry Meadow', <>Finn discovered a breathtaking <b>meadow</b> filled with twinkling lights. In the center he spotted a tiny, sad <b>firefly</b> named Luna.</>],
      ['A Friend in Need', <>Luna had lost her <b>family</b>. "Do not worry," said Finn. Together they searched near a sparkling pond.</>],
      ['Home at Last', <>They found Luna's family. Finn returned home with a <b>warm</b> heart, knowing he had made a wonderful new friend. 🧡</>],
    ],
    quiz: [
      ['What is the name of the fox?', ['Max', 'Finn', 'Leo', 'Oliver'], 1],
      ['Where did Finn live?', ['Sunny Desert', 'Rocky Mountains', 'Whispering Woods', 'Crystal Cave'], 2],
      ['What did Finn find in the meadow?', ['A golden key', 'A lost firefly', 'A magic wand', 'A treasure chest'], 1],
      ['How did Finn feel at the end?', ['Sad and lonely', 'Angry and tired', 'Warm and happy', 'Scared and lost'], 2],
    ],
  },
  6: {
    title: "Tanya's Tasteful Trouble",
    description: "Read Tanya's story and discover why balance matters.",
    pages: [
      ["Tanya's Amazing Cooking", <>Tanya loved to cook. Her grandmother had taught her family recipes, and Tanya had become an incredible cook. Her chicken pies were crispy, her pasta was creamy, and her cakes were soft and sweet.</>],
      ['A Favourite in the Community', <>Soon, Tanya's neighbours came over just to taste her cooking. “Just one bite!” they would say. But one bite quickly became a whole plate. Tanya loved making people happy and did not notice a problem beginning.</>],
      ['Everyone Wants More', <>Tanya cooked something special almost every day: chicken pasta, golden pies, cheesy potatoes, and chocolate cake. People kept asking for bigger portions. Nobody wanted to stop eating.</>],
      ['The Community Changes', <>After several weeks, the community began to change. People were eating fewer healthy meals and moving around less. The delicious food was becoming a little too much.</>],
      ['A Community Problem', <>Mrs. Moyo struggled to climb the hill, and the school football team needed extra breaks. Everyone gathered for a meeting. “We have a problem,” said Mr. Dube. Then someone called out, “Tanya's cooking!”</>],
      ['Tanya Finds Balance', <>Tanya felt terrible, but the neighbours explained that they loved her food too much. She created a plan: smaller portions, colourful vegetables, fresh salads, and tasty meals made with different ingredients.</>],
      ['The Happiest Community', <>Soon, people walked together and played outside again. Everyone still enjoyed Tanya's cooking, but in moderation. They learned that good food is wonderful, and balance makes it even better.</>],
    ],
    quiz: [
      ['What did Tanya love to do?', ['Cook', 'Paint', 'Run', 'Sing'], 0],
      ['Why did neighbours visit Tanya?', ['To borrow books', 'To taste her cooking', 'To play football', 'To see her garden'], 1],
      ["What happened to Mr. Dube's trousers?", ['They got wet', 'The button popped off', 'They disappeared', 'They became too long'], 1],
      ["What was Tanya's solution?", ['Stop cooking', 'Serve bigger portions', 'Use smaller portions and add healthy foods', 'Move away'], 2],
    ],
  },
};

const LEVELS = [
  { number: 1, name: LEGACY_STORIES[1].title, description: LEGACY_STORIES[1].description },
  ...READING_RESCUE_STORIES.map(({ level, title, description }) => ({ number: level, name: title, description })),
  { number: 6, name: LEGACY_STORIES[6].title, description: LEGACY_STORIES[6].description },
];

const QUIZ_LETTERS = ['A', 'B', 'C', 'D'];
const FINN_BLANKS = [['Whispering', 'woods'], ['Finn', 'fox'], ['shimmering', 'glow'], ['meadow', 'field']];
const TANYA_BLANKS = [['smaller', 'portions'], ['fresh', 'salads'], ['in', 'moderation'], ['balance', 'balance']];

function normalizeQuiz(level) {
  if (READING_RESCUE_QUIZZES[level]) {
    return READING_RESCUE_QUIZZES[level].map((item) => [item.question, item.options, QUIZ_LETTERS.indexOf(item.answer)]);
  }
  return LEGACY_STORIES[level].quiz;
}

function normalizePage(page) {
  return Array.isArray(page) ? { title: page[0], text: page[1] } : page;
}

export default function ReadingRescue({ onComplete }) {
  const [phase, setPhase] = useState('user-info');
  const [level, setLevel] = useState(1);
  const [userName, setUserName] = useState('');
  const [userGrade, setUserGrade] = useState('');
  const [page, setPage] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState([]);
  const [selectedBlank, setSelectedBlank] = useState(null);
  const [filled, setFilled] = useState({});
  const [mistakes, setMistakes] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const story = READING_RESCUE_STORIES.find((item) => item.level === level) || LEGACY_STORIES[level];
  const pages = story.pages;
  const quiz = normalizeQuiz(level);
  const blanks = level === 6 ? TANYA_BLANKS : FINN_BLANKS;
  const quizScore = quizAnswers.filter((answer, index) => answer === quiz[index]?.[2]).length;
  const completionScore = Math.round(((quizScore + Object.keys(filled).length) / (quiz.length + blanks.length)) * 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle whenever the game phase changes.
  const words = useMemo(() => [...blanks.map(([word]) => word), 'healthy', 'community', 'tasty', 'carefully'].sort(() => Math.random() - 0.5), [blanks, phase]);

  useEffect(() => {
    const handleMainMenu = () => setPhase('menu');
    window.addEventListener('reading-rescue:main-menu', handleMainMenu);
    return () => window.removeEventListener('reading-rescue:main-menu', handleMainMenu);
  }, []);

  function start(nextLevel) {
    setLevel(nextLevel);
    setPhase('story');
    setPage(0);
    setQuizIndex(0);
    setQuizAnswers([]);
    setSelectedBlank(null);
    setFilled({});
    setMistakes(0);
    setRevealed(false);
  }

  function answerQuiz(index) {
    if (quizAnswers[quizIndex] !== undefined) return;
    setQuizAnswers((answers) => [...answers, index]);
  }

  function placeWord(word) {
    if (selectedBlank === null || filled[selectedBlank]) return;
    if (word.toLowerCase() === blanks[selectedBlank][0].toLowerCase()) {
      setFilled((value) => ({ ...value, [selectedBlank]: word }));
    } else {
      setMistakes((value) => value + 1);
      if (mistakes + 1 >= 3) setRevealed(true);
    }
    setSelectedBlank(null);
  }

  function submitUserInfo(event) {
    event.preventDefault();
    if (userName.trim()) setPhase('menu');
  }

  function finish() {
    if (revealed) return;
    setPhase('results');
    onComplete?.(completionScore, completionScore);
  }

  function storyText(text) {
    if (typeof text !== 'string') return text;
    return text.split('\n\n').map((paragraph) => <p key={paragraph}>{paragraph}</p>);
  }

  function backgroundClass() {
    return `finn-fox finn-fox--${phase}${level === 6 ? ' finn-fox--tanya' : ''}`;
  }

  if (phase === 'story') {
    const currentPage = normalizePage(pages[page]);
    return <div className={backgroundClass()}><style>{CSS}</style><div className="ff-progress"><i style={{ width: `${((page + 1) / pages.length) * 33}%` }} /></div><main><section className="ff-story-layout"><img className="ff-story-illustration" src={`/assets/games/finn-the-fox/${level === 6 ? `tanya-story-scene-${Math.min(page + 1, 5)}.png` : `finn-${Math.min(page + 1, 5)}.png`}`} alt={`${story.title} page ${page + 1}`} /><div><article className="ff-story"><small>Page {page + 1} - {currentPage.title}</small>{storyText(currentPage.text)}</article><div className="ff-actions"><button className="ff-secondary" disabled={!page} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="ff-primary" onClick={() => page < pages.length - 1 ? setPage((value) => value + 1) : setPhase('quiz')}>{page < pages.length - 1 ? 'Next' : 'Take the Quiz'}</button></div></div></section></main></div>;
  }

  if (phase === 'quiz') {
    const currentQuestion = quiz[quizIndex];
    return <div className={backgroundClass()}><style>{CSS}</style><div className="ff-progress"><i style={{ width: '50%' }} /></div><main><section className="ff-card"><img className="ff-quiz-image" src={`/assets/games/finn-the-fox/${level === 6 ? `tanya-story-scene-${Math.min(quizIndex + 1, 5)}.png` : `finn-${Math.min(quizIndex + 1, 5)}.png`}`} alt={`${story.title} quiz`} /><h2>{currentQuestion[0]}</h2><div className="ff-options">{currentQuestion[1].map((option, index) => <button key={option} disabled={quizAnswers[quizIndex] !== undefined} className={quizAnswers[quizIndex] === index ? index === currentQuestion[2] ? 'correct' : 'wrong' : ''} onClick={() => answerQuiz(index)}>{option}</button>)}</div>{quizAnswers[quizIndex] !== undefined && <button className="ff-primary" onClick={() => quizIndex < quiz.length - 1 ? setQuizIndex((value) => value + 1) : setPhase('retell')}>{quizIndex < quiz.length - 1 ? 'Next Question' : 'Continue to Sentence Match'}</button>}</section></main></div>;
  }

  if (phase === 'retell') {
    return <div className={backgroundClass()}><style>{CSS}</style><div className="ff-progress"><i style={{ width: '75%' }} /></div><main><section className="ff-retell-layout"><div className="ff-retell-copy"><div className="ff-icon">✍️</div><p>Click a blank, then click its matching word.</p><p className="ff-retell">Finn followed a <button onClick={() => !revealed && setSelectedBlank(0)}>{filled[0] || (revealed ? blanks[0][0] : '_____')}</button> and found <button onClick={() => !revealed && setSelectedBlank(1)}>{filled[1] || (revealed ? blanks[1][0] : '_____')}</button>. He stayed <button onClick={() => !revealed && setSelectedBlank(2)}>{filled[2] || (revealed ? blanks[2][0] : '_____')}</button> and remembered the importance of <button onClick={() => !revealed && setSelectedBlank(3)}>{filled[3] || (revealed ? blanks[3][0] : '_____')}</button>.</p>{!revealed && <div className="ff-word-bank">{words.filter((word) => !Object.values(filled).includes(word)).map((word) => <button key={word} onClick={() => placeWord(word)}>{word}</button>)}</div>}{revealed ? <><strong>Answers revealed. Game over.</strong><button className="ff-primary" onClick={() => start(level)}>Restart</button></> : <button className="ff-primary" disabled={Object.keys(filled).length < blanks.length} onClick={finish}>Check My Story</button>}<small>{mistakes ? `${mistakes}/3 mistakes` : 'Keep going!'}</small></div></section></main></div>;
  }

  if (phase === 'results') {
    return <div className={backgroundClass()}><style>{CSS}</style><main><section className="ff-welcome"><div>🦊</div><h1>Adventure Complete!</h1><p>{userName}, you scored {completionScore}% overall comprehension.</p><button className="ff-primary" onClick={() => start(level)}>Play Again</button></section></main></div>;
  }

  return <div className={backgroundClass()}><style>{CSS}</style><main className="game-container"><header><b>Reading Rescue</b><span>Finn the Fox</span></header><div className="ff-progress"><i style={{ width: phase === 'user-info' ? '0%' : '100%' }} /></div>{phase === 'user-info' && <section className="ff-user-info"><div className="ff-icon">🦊</div><h1>Welcome to Reading Rescue</h1><p>Tell Finn a little about yourself before your adventure begins.</p><form onSubmit={submitUserInfo}><label htmlFor="reading-rescue-name">Your name</label><input id="reading-rescue-name" value={userName} onChange={(event) => setUserName(event.target.value)} placeholder="Enter your name" maxLength={30} required /><label htmlFor="reading-rescue-grade">Reading level or grade <span>(optional)</span></label><input id="reading-rescue-grade" value={userGrade} onChange={(event) => setUserGrade(event.target.value)} placeholder="For example, Grade 3" maxLength={30} /><button className="ff-primary" type="submit">Start Reading Rescue</button></form></section>}{phase === 'menu' && <section className="intro"><div className="ff-icon">🦊</div><h1>Reading Rescue</h1><p className="subtitle">Welcome, {userName}!</p><p>Choose a rescue story, read carefully, and rebuild what happened.</p><div className="ff-level-menu">{LEVELS.map((item) => <button className="ff-level" key={item.number} onClick={() => start(item.number)}><strong>Level {item.number}</strong><span>{item.name}</span><small>{item.description}</small></button>)}</div></section>}</main></div>;
}

const CSS = `
.finn-fox{min-height:100vh;padding:18px;color:#2e2013;font-family:Georgia,serif;background-size:cover;background-position:center;background-attachment:fixed;background-image:linear-gradient(rgba(24,13,48,.72),rgba(42,22,73,.84)),url('/assets/games/finn-the-fox/reading-rescue-main-menu-bg.webp')}.finn-fox--user-info{background-image:linear-gradient(rgba(24,13,48,.55),rgba(42,22,73,.72)),url('/assets/games/finn-the-fox/reading-rescue-user-input-bg.webp')}.finn-fox--menu{background-image:linear-gradient(rgba(24,13,48,.55),rgba(42,22,73,.72)),url('/assets/games/finn-the-fox/reading-rescue-main-menu-bg.webp')}.finn-fox--story,.finn-fox--quiz,.finn-fox--retell{background-image:linear-gradient(rgba(38,22,13,.58),rgba(70,34,19,.78)),url('/assets/games/finn-the-fox/reading-rescue-story-pages-bg.webp')}.finn-fox--results{background-image:linear-gradient(rgba(24,13,48,.55),rgba(42,22,73,.72)),url('/assets/games/finn-the-fox/reading-rescue-welcome-bg.webp')}.finn-fox main{max-width:1100px;min-height:560px;margin:18px auto;padding:36px 42px;background:#fffdf7;border-radius:24px;box-shadow:0 25px 70px #0c082344}.finn-fox header{display:flex;justify-content:space-between;max-width:1100px;margin:auto;padding:14px 20px;color:#fff;background:#241540;border-radius:18px 18px 0 0}.ff-progress{max-width:1100px;height:7px;margin:auto;background:#4a2560}.ff-progress i{display:block;height:100%;background:linear-gradient(90deg,#ff7e3d,#ffc857);transition:width .4s}.intro,.ff-welcome{text-align:center}.intro h1,.ff-welcome h1,.ff-user-info h1{margin:10px 0;color:#1d2235;font-size:clamp(32px,4vw,48px)}.intro .subtitle{color:#d4531c;font-weight:700}.ff-icon{font-size:4rem}.ff-level-menu{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:28px}.ff-level{display:flex;min-height:160px;flex-direction:column;gap:8px;padding:22px;text-align:left;border:2px solid #ff8b4a55;border-radius:20px;background:linear-gradient(145deg,#fff,#fff9f1);color:#29263a;cursor:pointer;box-shadow:0 10px 25px #28191412}.ff-level strong{color:#e86d32}.ff-level span{font-size:20px;font-weight:850}.ff-level small{color:#766d66;line-height:1.45}.ff-story-layout,.ff-retell-layout{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}.ff-story-illustration,.ff-quiz-image{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:22px;box-shadow:0 14px 32px #462d251f}.ff-story{padding:28px 32px;background:#fffaf1;border:1px solid #eadcc5;border-radius:22px}.ff-story small{display:block;margin-bottom:14px;color:#d4531c;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.ff-story p{font-size:1.2rem;line-height:1.75}.ff-actions{display:flex;justify-content:space-between;gap:12px;margin-top:18px}.ff-primary,.ff-secondary,.ff-options button,.ff-word-bank button,.ff-retell button{border-radius:14px;padding:12px 18px;border:0;font:inherit;cursor:pointer}.ff-primary{background:linear-gradient(135deg,#ff7e3d,#d4531c);color:#fff;font-weight:800}.ff-secondary{background:#fff;color:#d4531c;border:2px solid #ff7e3d}.ff-card{max-width:900px;margin:auto}.ff-card h2{color:#35291f}.ff-options{display:grid;gap:12px;margin:18px 0}.ff-options button,.ff-word-bank button{background:#fff;border:2px solid #eadcc5;text-align:left}.ff-options button.correct{background:#d9f4df;border-color:#43a85b}.ff-options button.wrong{background:#ffe1df;border-color:#dc5d53}.ff-retell-layout{align-items:center}.ff-retell-copy{padding:28px;background:#fffaf1;border:1px solid #eadcc5;border-radius:22px}.ff-retell{font-size:1.3rem;line-height:2}.ff-retell button{padding:2px 8px;color:#d4531c;border-bottom:3px solid #ff8b4a;background:#fff0e7}.ff-word-bank{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}.ff-user-info{max-width:560px;margin:auto;text-align:center}.ff-user-info form{display:grid;gap:10px;text-align:left}.ff-user-info label{font-weight:800;color:#35291f}.ff-user-info label span{font-weight:400;color:#8d7e70}.ff-user-info input{padding:14px;border:1px solid #eadcc5;border-radius:12px;background:#fff;color:#35291f}.ff-user-info .ff-primary{margin-top:8px;text-align:center}@media(max-width:800px){.ff-level-menu,.ff-story-layout,.ff-retell-layout{grid-template-columns:1fr}.ff-level-menu{gap:12px}.finn-fox main{padding:26px 20px}.ff-actions{flex-direction:column}.ff-actions button{width:100%}}
`;
