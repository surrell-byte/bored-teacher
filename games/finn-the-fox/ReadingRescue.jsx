'use client';

/* eslint-disable react/no-unescaped-entities, @next/next/no-img-element */
import { Fragment, useEffect, useMemo, useState } from 'react';
import { READING_RESCUE_QUIZZES } from './readingRescueData';
import { readingRescueStories as READING_RESCUE_STORIES } from './readingRescueStories';
import FindTheLetter from '../shared/FindTheLetter';

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
      ['What is the name of the fox?', ['Max', 'Finn', 'Leo', 'Oliver'], 1, 1],
      ['Where did Finn live?', ['Sunny Desert', 'Rocky Mountains', 'Whispering Woods', 'Crystal Cave'], 2, 1],
      ['What did Finn find in the meadow?', ['A golden key', 'A lost firefly', 'A magic wand', 'A treasure chest'], 1, 3],
      ['How did Finn feel at the end?', ['Sad and lonely', 'Angry and tired', 'Warm and happy', 'Scared and lost'], 2, 5],
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
      ['A Community Cooking Club', <>Tanya started a community cooking club. Everyone learned to make delicious meals with different ingredients, add colourful vegetables and fresh salads, serve smaller portions, and enjoy treats in moderation.</>],
      ['The Happiest Community', <>Soon, people walked together and played outside again. Everyone still enjoyed Tanya's cooking, but in moderation. They learned that good food is wonderful, and balance makes it even better.</>],
    ],
    quiz: [
      ['What did Tanya love to do?', ['Cook', 'Paint', 'Run', 'Sing'], 0, 1],
      ['Why did neighbours visit Tanya?', ['To borrow books', 'To taste her cooking', 'To play football', 'To see her garden'], 1, 2],
      ["What happened to Mr. Dube's trousers?", ['They got wet', 'The button popped off', 'They disappeared', 'They became too long'], 1, 5],
      ["What was Tanya's solution?", ['Stop cooking', 'Serve bigger portions', 'Use smaller portions and add healthy foods', 'Move away'], 2, 6],
    ],
  },
};

const LEVELS = [
  { number: 1, name: LEGACY_STORIES[1].title, description: LEGACY_STORIES[1].description },
  ...READING_RESCUE_STORIES.map(({ level, title, description }) => ({ number: level, name: title, description })),
  { number: 6, name: LEGACY_STORIES[6].title, description: LEGACY_STORIES[6].description },
];

const QUIZ_LETTERS = ['A', 'B', 'C', 'D'];
const TANYA_SCENE_IMAGES = [
  'tanya-story-scene-1.webp',
  'tanya-story-scene-1.5.webp',
  'tanya-story-scene-2.webp',
  'tanya-story-scene-3.webp',
  'tanya-story-scene-3.5.webp',
  'tanya-story-scene-4.webp',
  'tanya-story-scene-5.webp',
  'tanya-story-scene-5.5.webp',
];
const RETELL_ACTIVITIES = {
  1: {
    segments: ['Deep in the ', ', Finn followed a ', ' and found ', ' in a starry ', '.'],
    answers: ['Whispering Woods', 'shimmering glow', 'Luna', 'meadow'],
    distractors: ['river', 'rabbit', 'family', 'sunny'],
  },
  2: {
    segments: ['Finn followed ', ' with Daisy. They crossed a ', ' and spotted ', ' before finding Daisy’s ', '.'],
    answers: ['wet footprints', 'wooden bridge', 'yellow feathers', 'family'],
    distractors: ['paw prints', 'mountain path', 'blue feather', 'rabbit'],
  },
  3: {
    segments: ['Finn found Ruby trapped beneath a ', '. He used a ', ' and a wooden ', ' like a ', ' to make a safe rescue.'],
    answers: ['fallen branch', 'strong vine', 'log', 'lever'],
    distractors: ['wooden bridge', 'yellow feather', 'pond', 'footprint'],
  },
  4: {
    segments: ['Finn and Toby followed ', ' past the ', ' and chose the path through the ', '. They found Toby’s ', ' by looking for clues.'],
    answers: ['large paw prints', 'stream', 'thick trees', 'family'],
    distractors: ['yellow feathers', 'meadow', 'mountains', 'duckling'],
  },
  5: {
    segments: ['Finn found Toby, Ruby, and Daisy beside a broken ', '. The river was moving ', '. They used a fallen ', ' and strong ', ' to help everyone cross.'],
    answers: ['bridge', 'quickly', 'tree trunk', 'vines'],
    distractors: ['pond', 'quietly', 'wooden log', 'feathers'],
  },
  6: {
    segments: ['Tanya served ', ' with fresh ', '. Her neighbours enjoyed treats ', ' and learned the importance of ', '.'],
    answers: ['smaller portions', 'salads', 'in moderation', 'balance'],
    distractors: ['bigger portions', 'cakes', 'every day', 'rushing'],
  },
};

function getStoryImage(level, pageIndex) {
  if (level === 6) return `/assets/games/finn-the-fox/${TANYA_SCENE_IMAGES[Math.min(pageIndex, TANYA_SCENE_IMAGES.length - 1)]}`;
  return `/assets/games/finn-the-fox/finn-${Math.min(pageIndex + 1, 5)}.png`;
}

function normalizeQuiz(level) {
  if (READING_RESCUE_QUIZZES[level]) {
    return READING_RESCUE_QUIZZES[level].map((item) => [item.question, item.options, QUIZ_LETTERS.indexOf(item.answer), item.page]);
  }
  return LEGACY_STORIES[level].quiz;
}

function normalizePage(page) {
  return Array.isArray(page) ? { title: page[0], text: page[1] } : page;
}

export default function ReadingRescue({ onComplete, onHudUpdate }) {
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
  const activity = RETELL_ACTIVITIES[level];
  const blanks = activity.answers;
  const quizScore = quizAnswers.filter((answer, index) => answer === quiz[index]?.[2]).length;
  const completionScore = Math.round(((quizScore + Object.keys(filled).length) / (quiz.length + blanks.length)) * 100);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- reshuffle whenever the game phase changes.
  const words = useMemo(() => [...activity.answers, ...activity.distractors].sort(() => Math.random() - 0.5), [activity, phase]);

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
    if (word.toLowerCase() === blanks[selectedBlank].toLowerCase()) {
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
    return `finn-fox finn-fox--${phase}${level === 6 ? ' finn-fox--tanya' : ''}${level === 3 ? ' finn-fox--rabbit' : ''}`;
  }

  if (phase === 'story') {
    const currentPage = normalizePage(pages[page]);
    return <div className={backgroundClass()}><style>{CSS}</style><div className="ff-progress"><i style={{ width: `${((page + 1) / pages.length) * 33}%` }} /></div><main><section className="ff-story-layout"><img className="ff-story-illustration" src={getStoryImage(level, page)} alt={`${story.title}, page ${page + 1}`} /><div><article className="ff-story"><small>Page {page + 1} - {currentPage.title}</small>{storyText(currentPage.text)}</article><div className="ff-actions"><button className="ff-secondary" disabled={!page} onClick={() => setPage((value) => value - 1)}>Previous</button><button className="ff-primary" onClick={() => page < pages.length - 1 ? setPage((value) => value + 1) : setPhase('quiz')}>{page < pages.length - 1 ? 'Next' : 'Take the Quiz'}</button></div></div></section></main></div>;
  }

  if (phase === 'quiz') {
    const currentQuestion = quiz[quizIndex];
    const questionPage = currentQuestion[3] || quizIndex + 1;
    return <div className={backgroundClass()}><style>{CSS}</style><div className="ff-progress"><i style={{ width: '50%' }} /></div><main><section className="ff-card"><div className="ff-quiz-layout"><img className="ff-quiz-image" src={getStoryImage(level, questionPage - 1)} alt={`${story.title}, page ${questionPage}`} /><div className="ff-quiz-copy"><h2>{currentQuestion[0]}</h2><div className="ff-options">{currentQuestion[1].map((option, index) => <button key={option} disabled={quizAnswers[quizIndex] !== undefined} className={quizAnswers[quizIndex] === index ? index === currentQuestion[2] ? 'correct' : 'wrong' : ''} onClick={() => answerQuiz(index)}>{option}</button>)}</div>{quizAnswers[quizIndex] !== undefined && <button className="ff-primary" onClick={() => quizIndex < quiz.length - 1 ? setQuizIndex((value) => value + 1) : setPhase('retell')}>{quizIndex < quiz.length - 1 ? 'Next Question' : 'Continue to Sentence Match'}</button>}</div></div></section></main></div>;
  }

  if (phase === 'retell') {
    return <div className={backgroundClass()}><style>{CSS}</style><div className="ff-progress"><i style={{ width: '75%' }} /></div><main><section className="ff-retell-layout"><img className="ff-retell-illustration" src={getStoryImage(level, pages.length - 1)} alt={`${story.title} illustration`} /><div className="ff-retell-copy"><div className="ff-icon">✍️</div><h2>Complete the Sentence</h2><p>Click a blank, then click its matching word.</p><p className="ff-retell">{activity.segments.map((segment, index) => <Fragment key={index}>{segment}{index < blanks.length && <button aria-label={`Choose word for blank ${index + 1}`} onClick={() => !revealed && setSelectedBlank(index)}>{filled[index] || (revealed ? blanks[index] : '_____')}</button>}</Fragment>)}</p>{!revealed && <div className="ff-word-bank">{words.filter((word) => !Object.values(filled).includes(word)).map((word) => <button key={word} onClick={() => placeWord(word)}>{word}</button>)}</div>}{revealed ? <><strong>Answers revealed. Game over.</strong><button className="ff-primary" onClick={() => start(level)}>Restart</button></> : <button className="ff-primary" disabled={Object.keys(filled).length < blanks.length} onClick={finish}>Check My Story</button>}<small>{mistakes ? `${mistakes}/3 mistakes` : 'Keep going!'}</small></div></section></main></div>;
  }

  if (phase === 'results') {
    return <div className={backgroundClass()}><style>{CSS}</style><main><section className="ff-welcome"><div>🦊</div><h1>Adventure Complete!</h1><p>{userName}, you scored {completionScore}% overall comprehension.</p><button className="ff-primary" onClick={() => start(level)}>Play Again</button></section></main></div>;
  }

  if (phase === 'letter-game') {
    return <div className={backgroundClass()}><style>{CSS}</style><FindTheLetter onComplete={onComplete} onHudUpdate={onHudUpdate} /></div>;
  }

  return <div className={backgroundClass()}><style>{CSS}</style><main className="game-container"><div className="ff-progress"><i style={{ width: phase === 'user-info' ? '0%' : '100%' }} /></div>{phase === 'user-info' && <section className="ff-user-info"><div className="ff-icon">🦊</div><h1>Meet Finn</h1><p>Tell Finn a little about yourself before your adventure begins.</p><form onSubmit={submitUserInfo}><label htmlFor="reading-rescue-name">Your name</label><input id="reading-rescue-name" value={userName} onChange={(event) => setUserName(event.target.value)} placeholder="Enter your name" maxLength={30} required /><label htmlFor="reading-rescue-grade">Reading level or grade <span>(optional)</span></label><input id="reading-rescue-grade" value={userGrade} onChange={(event) => setUserGrade(event.target.value)} placeholder="For example, Grade 3" maxLength={30} /><button className="ff-primary" type="submit">Start Reading Rescue</button></form></section>}{phase === 'menu' && <section className="intro"><div className="ff-icon">🦊</div><h1>Choose Your Adventure</h1><p className="subtitle">Welcome, {userName}!</p><p>Choose a rescue story, read carefully, and rebuild what happened.</p><div className="ff-level-menu">{LEVELS.map((item) => <button className="ff-level" key={item.number} onClick={() => start(item.number)}><strong>Level {item.number}</strong><span>{item.name}</span><small>{item.description}</small></button>)}</div><button className="ff-primary ff-find-letter-launch" onClick={() => setPhase('letter-game')}>🔍 Find the Letter A–Z <small>Find the hidden letter across 26 levels.</small></button></section>}</main></div>;
}

const CSS = `
.finn-fox{min-height:100vh;padding:18px;color:#2e2013;font-family:Georgia,serif;background-size:cover;background-position:center;background-attachment:fixed;background-image:linear-gradient(rgba(24,13,48,.72),rgba(42,22,73,.84)),url('/assets/games/finn-the-fox/reading-rescue-main-menu-bg.webp')}.finn-fox--user-info{background-image:linear-gradient(rgba(24,13,48,.55),rgba(42,22,73,.72)),url('/assets/games/finn-the-fox/reading-rescue-user-input-bg.webp')}.finn-fox--menu{background-image:linear-gradient(rgba(24,13,48,.55),rgba(42,22,73,.72)),url('/assets/games/finn-the-fox/reading-rescue-main-menu-bg.webp')}.finn-fox--story,.finn-fox--quiz,.finn-fox--retell{background-image:linear-gradient(rgba(38,22,13,.58),rgba(70,34,19,.78)),url('/assets/games/finn-the-fox/reading-rescue-story-pages-bg.webp')}.finn-fox--results{background-image:linear-gradient(rgba(24,13,48,.55),rgba(42,22,73,.72)),url('/assets/games/finn-the-fox/reading-rescue-welcome-bg.webp')}.finn-fox main{max-width:1100px;min-height:560px;margin:18px auto;padding:36px 42px;background:#fffdf7;border-radius:24px;box-shadow:0 25px 70px #0c082344}.finn-fox header{display:flex;justify-content:space-between;max-width:1100px;margin:auto;padding:14px 20px;color:#fff;background:#241540;border-radius:18px 18px 0 0}.ff-progress{max-width:1100px;height:7px;margin:auto;background:#4a2560}.ff-progress i{display:block;height:100%;background:linear-gradient(90deg,#ff7e3d,#ffc857);transition:width .4s}.intro,.ff-welcome{text-align:center}.intro h1,.ff-welcome h1,.ff-user-info h1{margin:10px 0;color:#1d2235;font-size:clamp(32px,4vw,48px)}.intro .subtitle{color:#d4531c;font-weight:700}.ff-icon{font-size:4rem}.ff-level-menu{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:28px}.ff-level{display:flex;min-height:160px;flex-direction:column;gap:8px;padding:22px;text-align:left;border:2px solid #ff8b4a55;border-radius:20px;background:linear-gradient(145deg,#fff,#fff9f1);color:#29263a;cursor:pointer;box-shadow:0 10px 25px #28191412}.ff-level strong{color:#e86d32}.ff-level span{font-size:20px;font-weight:850}.ff-level small{color:#766d66;line-height:1.45}.ff-story-layout,.ff-retell-layout{display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start}.ff-story-illustration,.ff-quiz-image{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:22px;box-shadow:0 14px 32px #462d251f}.ff-story{padding:28px 32px;background:#fffaf1;border:1px solid #eadcc5;border-radius:22px}.ff-story small{display:block;margin-bottom:14px;color:#d4531c;font-weight:900;text-transform:uppercase;letter-spacing:.12em}.ff-story p{font-size:1.2rem;line-height:1.75}.ff-actions{display:flex;justify-content:space-between;gap:12px;margin-top:18px}.ff-primary,.ff-secondary,.ff-options button,.ff-word-bank button,.ff-retell button{border-radius:14px;padding:12px 18px;border:0;font:inherit;cursor:pointer}.ff-primary{background:linear-gradient(135deg,#ff7e3d,#d4531c);color:#fff;font-weight:800}.ff-secondary{background:#fff;color:#d4531c;border:2px solid #ff7e3d}.ff-card{max-width:900px;margin:auto}.ff-card h2{color:#35291f}.ff-options{display:grid;gap:12px;margin:18px 0}.ff-options button,.ff-word-bank button{background:#fff;border:2px solid #eadcc5;text-align:left}.ff-options button.correct{background:#d9f4df;border-color:#43a85b}.ff-options button.wrong{background:#ffe1df;border-color:#dc5d53}.ff-retell-layout{align-items:center}.ff-retell-copy{padding:28px;background:#fffaf1;border:1px solid #eadcc5;border-radius:22px}.ff-retell{font-size:1.3rem;line-height:2}.ff-retell button{padding:2px 8px;color:#d4531c;border-bottom:3px solid #ff8b4a;background:#fff0e7}.ff-word-bank{display:flex;flex-wrap:wrap;gap:8px;margin:18px 0}.ff-user-info{max-width:560px;margin:auto;text-align:center}.ff-user-info form{display:grid;gap:10px;text-align:left}.ff-user-info label{font-weight:800;color:#35291f}.ff-user-info label span{font-weight:400;color:#8d7e70}.ff-user-info input{padding:14px;border:1px solid #eadcc5;border-radius:12px;background:#fff;color:#35291f}.ff-user-info .ff-primary{margin-top:8px;text-align:center}@media(max-width:800px){.ff-level-menu,.ff-story-layout,.ff-retell-layout{grid-template-columns:1fr}.ff-level-menu{gap:12px}.finn-fox main{padding:26px 20px}.ff-actions{flex-direction:column}.ff-actions button{width:100%}}

/* Quiz keeps the story art beside its answer panel on desktop. */
.ff-quiz-layout{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);align-items:center;gap:30px}
.ff-quiz-copy{min-width:0}
.ff-quiz-copy h2{margin-top:0;line-height:1.35}
.ff-quiz-copy .ff-options{margin:16px 0}
.ff-quiz-copy>.ff-primary{width:100%}
@media(max-width:800px){.ff-quiz-layout{grid-template-columns:1fr;gap:20px}.ff-quiz-image{max-height:42vh}.ff-quiz-copy h2{margin-bottom:12px}}

/* Polished Reading Rescue game shell */
.finn-fox {
  --rr-purple: #291644;
  --rr-purple-dark: #1b102e;
  --rr-orange: #ff7135;
  --rr-orange-dark: #df4d1f;
  --rr-cream: #fffaf1;
  --rr-text: #202038;
  position: relative;
  isolation: isolate;
  padding: clamp(12px, 2.5vw, 28px);
  color: var(--rr-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}
.finn-fox::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(ellipse at 50% 35%, transparent 26%, rgba(11, 7, 23, .38) 100%);
}
.finn-fox main {
  position: relative;
  z-index: 1;
  min-height: 0;
  padding: 0 0 34px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(255, 253, 248, .96), rgba(255, 248, 238, .93));
  border: 1px solid rgba(255, 255, 255, .76);
  box-shadow: 0 30px 80px rgba(16, 7, 30, .36), 0 8px 25px rgba(25, 10, 40, .17), inset 0 1px 0 rgba(255, 255, 255, .9);
  backdrop-filter: blur(14px);
}
.finn-fox main.game-container { width: min(1000px, calc(100vw - 40px)); }
.finn-fox--user-info main.game-container { width: min(780px, calc(100vw - 40px)); }
.finn-fox header {
  max-width: none;
  margin: 0;
  min-height: 62px;
  padding: 0 26px;
  border-radius: 23px 23px 0 0;
  border-bottom: 4px solid #71418d;
  background: linear-gradient(135deg, #24123e, #332052);
  box-shadow: 0 8px 20px rgba(35, 15, 55, .16);
  font-family: inherit;
}
.finn-fox header b { font-size: 19px; letter-spacing: -.25px; }
.finn-fox header span { color: rgba(255, 255, 255, .88); font-size: 15px; font-weight: 650; }
.finn-fox .ff-progress { width: 100%; height: 6px; border-radius: 0; background: rgba(74, 37, 96, .2); }
.finn-fox .ff-progress i { background: linear-gradient(90deg, #ff7e3d, #ffc857); box-shadow: 0 0 12px rgba(255, 126, 61, .28); }
.finn-fox .ff-user-info,
.finn-fox .intro {
  max-width: 680px;
  margin: 0 auto;
  padding: 25px 34px 8px;
  text-align: center;
}
.finn-fox .ff-user-info { max-width: 510px; }
.finn-fox .ff-icon {
  display: block;
  width: fit-content;
  margin: 0 auto 4px;
  font-size: 5.1rem;
  line-height: 1;
  filter: drop-shadow(0 8px 12px rgba(46, 24, 66, .2)) drop-shadow(0 0 18px rgba(255, 126, 54, .13));
  animation: rr-fox-float 3.5s ease-in-out infinite;
}
@keyframes rr-fox-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.finn-fox h1,
.finn-fox h2 {
  color: var(--rr-text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 850;
  letter-spacing: -.045em;
}
.finn-fox .ff-user-info h1,
.finn-fox .intro h1 {
  margin: 4px auto 9px;
  font-size: clamp(32px, 4vw, 46px);
  line-height: 1.08;
  text-wrap: balance;
}
.finn-fox .ff-user-info > p,
.finn-fox .intro > p {
  max-width: 560px;
  margin: 0 auto 18px;
  color: #625853;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.55;
}
.finn-fox .ff-user-info form { width: min(100%, 470px); margin: 0 auto; gap: 7px; }
.finn-fox .ff-user-info label { margin-top: 5px; color: #332c29; font-size: 14px; font-weight: 750; }
.finn-fox .ff-user-info label span { color: #8b817b; font-weight: 500; }
.finn-fox .ff-user-info input {
  width: 100%;
  min-height: 54px;
  padding: 0 17px;
  border: 1px solid #eadbca;
  border-radius: 14px;
  background: rgba(255, 255, 255, .76);
  color: var(--rr-text);
  font: inherit;
  font-size: 16px;
  box-shadow: inset 0 1px 2px rgba(55, 30, 20, .03), 0 2px 5px rgba(60, 30, 20, .03);
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease, transform .2s ease;
}
.finn-fox .ff-user-info input:hover { border-color: #d9c4ae; background: #fff; }
.finn-fox .ff-user-info input:focus-visible { outline: 0; border-color: var(--rr-orange); background: #fff; box-shadow: 0 0 0 4px rgba(255, 113, 53, .12), 0 8px 20px rgba(48, 20, 10, .06); transform: translateY(-1px); }
.finn-fox .ff-primary {
  position: relative;
  overflow: hidden;
  min-height: 54px;
  border: 0;
  border-radius: 15px;
  background: linear-gradient(135deg, #ff783c, #e75320);
  box-shadow: 0 9px 19px rgba(224, 79, 29, .22), inset 0 1px 0 rgba(255, 255, 255, .25);
  font-family: inherit;
  font-weight: 800;
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
}
.finn-fox .ff-primary::after { content: ""; position: absolute; inset: 1px; border-radius: inherit; background: linear-gradient(180deg, rgba(255,255,255,.14), transparent 48%); pointer-events: none; }
.finn-fox .ff-primary:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.04); box-shadow: 0 14px 26px rgba(224, 79, 29, .3), inset 0 1px 0 rgba(255,255,255,.3); }
.finn-fox .ff-primary:active:not(:disabled) { transform: translateY(1px); box-shadow: 0 5px 12px rgba(224, 79, 29, .22); }
.finn-fox button:focus-visible { outline: 3px solid rgba(255, 126, 61, .6); outline-offset: 3px; }
.finn-fox .ff-level-menu { gap: 14px; margin-top: 22px; }
.finn-fox .ff-level { min-height: 145px; border-color: rgba(91, 59, 120, .16); box-shadow: 0 10px 24px rgba(40, 25, 20, .08); transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
.finn-fox .ff-level:hover { transform: translateY(-3px); border-color: rgba(255, 126, 61, .55); box-shadow: 0 15px 30px rgba(40, 25, 20, .13); }
.finn-fox main:not(.game-container) { background: linear-gradient(145deg, rgba(255, 253, 248, .96), rgba(255, 248, 238, .93)); }
.finn-fox .ff-story { font-family: Georgia, "Times New Roman", serif; }
@media (max-width: 800px) {
  .finn-fox main.game-container,
  .finn-fox--user-info main.game-container { width: calc(100vw - 24px); }
  .finn-fox .ff-user-info,
  .finn-fox .intro { padding: 22px 22px 6px; }
}
@media (max-width: 600px) {
  .finn-fox { padding: 10px; }
  .finn-fox main.game-container,
  .finn-fox--user-info main.game-container { width: 100%; border-radius: 20px; }
  .finn-fox header { min-height: 54px; padding: 0 17px; border-radius: 19px 19px 0 0; }
  .finn-fox header b { font-size: 16px; }
  .finn-fox header span { font-size: 13px; }
  .finn-fox .ff-icon { font-size: 4.4rem; }
  .finn-fox .ff-user-info,
  .finn-fox .intro { padding: 20px 17px 4px; }
  .finn-fox .ff-user-info h1,
  .finn-fox .intro h1 { font-size: 32px; }
  .finn-fox .ff-user-info > p,
  .finn-fox .intro > p { font-size: 15px; }
  .finn-fox .ff-user-info input { min-height: 52px; }
}


/* Storybook palette drawn from the Reading Rescue cover */
.finn-fox {
  --rr-midnight: #17132f;
  --rr-indigo: #211a43;
  --rr-plum: #3a205b;
  --rr-violet: #68418c;
  --rr-twilight: #5367c9;
  --rr-amber: #f4b85a;
  --rr-gold: #e9a94e;
  --rr-coral: #e87543;
  --rr-parchment: #fff8ea;
  --rr-ivory: #fffcf5;
  --rr-paper: #fffdf9;
  --rr-ink: #242039;
  --rr-brown: #463832;
  --rr-muted: #756c69;
  --rr-border: #e8d8c4;
  --rr-border-purple: rgba(104, 65, 140, .25);
  --rr-purple: var(--rr-plum);
  --rr-purple-dark: var(--rr-midnight);
  --rr-orange: var(--rr-violet);
  --rr-orange-dark: var(--rr-plum);
  --rr-cream: var(--rr-parchment);
  --rr-text: var(--rr-ink);
}
.finn-fox--user-info,
.finn-fox--menu {
  background-image: linear-gradient(rgba(23, 19, 47, .42), rgba(23, 19, 47, .58)), url('/assets/games/finn-the-fox/reading-rescue-main-menu-bg.webp');
}
.finn-fox--user-info { background-image: linear-gradient(rgba(23, 19, 47, .42), rgba(23, 19, 47, .58)), url('/assets/games/finn-the-fox/reading-rescue-user-input-bg.webp'); }
.finn-fox--story,
.finn-fox--quiz,
.finn-fox--retell {
  background-image: linear-gradient(rgba(23, 19, 47, .52), rgba(23, 19, 47, .68)), url('/assets/games/finn-the-fox/reading-rescue-story-pages-bg.webp');
}
.finn-fox--results { background-image: linear-gradient(rgba(23, 19, 47, .42), rgba(23, 19, 47, .58)), url('/assets/games/finn-the-fox/reading-rescue-welcome-bg.webp'); }
.finn-fox::before { background: radial-gradient(ellipse at 50% 35%, transparent 26%, rgba(11, 7, 23, .32) 100%); }
.finn-fox main { background: linear-gradient(145deg, rgba(255, 252, 245, .97), rgba(255, 248, 234, .95)); }
.finn-fox main:not(.game-container) { background: linear-gradient(145deg, rgba(255, 252, 245, .97), rgba(255, 248, 234, .95)); }
.finn-fox header {
  background: linear-gradient(135deg, #291640 0%, #3a205b 55%, #48266a 100%);
  border-bottom-color: var(--rr-violet);
  box-shadow: 0 8px 20px rgba(32, 15, 48, .18);
}
.finn-fox header span { color: var(--rr-amber); }
.finn-fox .ff-progress { background: rgba(58, 32, 91, .16); }
.finn-fox .ff-progress i { background: linear-gradient(90deg, var(--rr-twilight), var(--rr-amber)); box-shadow: 0 0 12px rgba(244, 184, 90, .25); }
.finn-fox .ff-user-info label { color: var(--rr-brown); }
.finn-fox .ff-user-info label span,
.finn-fox .ff-user-info > p,
.finn-fox .intro > p { color: var(--rr-muted); }
.finn-fox .ff-user-info input { background: var(--rr-ivory); border-color: var(--rr-border); color: var(--rr-ink); box-shadow: inset 0 2px 5px rgba(74, 46, 30, .025); }
.finn-fox .ff-user-info input:focus-visible { border-color: var(--rr-violet); box-shadow: 0 0 0 4px rgba(104, 65, 140, .1), 0 8px 20px rgba(50, 30, 60, .06); }
.finn-fox .ff-icon { filter: drop-shadow(0 8px 12px rgba(37, 18, 54, .2)) drop-shadow(0 0 18px rgba(244, 184, 90, .18)); }
.finn-fox .ff-primary {
  background: linear-gradient(135deg, var(--rr-amber) 0%, var(--rr-coral) 100%);
  color: #291a31;
  box-shadow: 0 8px 22px rgba(232, 117, 67, .25), inset 0 1px 0 rgba(255, 255, 255, .35);
}
.finn-fox .ff-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #ffd071 0%, #f08350 100%);
  box-shadow: 0 14px 28px rgba(232, 117, 67, .32), 0 0 20px rgba(244, 184, 90, .15);
}
.finn-fox button:focus-visible { outline-color: rgba(104, 65, 140, .65); }
.finn-fox .ff-level { background: linear-gradient(145deg, var(--rr-paper), var(--rr-parchment)); border-color: var(--rr-border-purple); }
.finn-fox .ff-level strong,
.finn-fox .ff-level span { color: var(--rr-plum); }
.finn-fox .ff-level:hover { border-color: rgba(104, 65, 140, .48); }
.finn-fox .intro .subtitle { color: var(--rr-violet); }
.finn-fox .ff-story { background: linear-gradient(145deg, var(--rr-ivory), var(--rr-parchment)); border-color: var(--rr-border); }
.finn-fox .ff-story small { color: var(--rr-violet); }
.finn-fox .ff-story b { color: var(--rr-plum); }
.finn-fox .ff-secondary { color: var(--rr-plum); border-color: var(--rr-violet); }
.finn-fox .ff-options button,
.finn-fox .ff-word-bank button { background: var(--rr-ivory); border-color: var(--rr-border); color: var(--rr-ink); }
.finn-fox .ff-options button:hover:not(:disabled),
.finn-fox .ff-word-bank button:hover { border-color: var(--rr-violet); box-shadow: 0 5px 14px rgba(58, 32, 91, .1); }
.finn-fox .ff-options button.correct { background: #e4f2e6; border-color: #72a77c; }
.finn-fox .ff-options button.wrong { background: #f9e6df; border-color: var(--rr-coral); }
.finn-fox .ff-retell-copy { background: linear-gradient(145deg, var(--rr-ivory), var(--rr-parchment)); border-color: var(--rr-border); }
.finn-fox .ff-retell button { color: var(--rr-plum); border-bottom-color: var(--rr-violet); background: #f1eaf7; }
.finn-fox .ff-card h2 { color: var(--rr-ink); }
.finn-fox .ff-user-info input::placeholder { color: #9b918a; }
@media (prefers-reduced-motion: reduce) {
  .finn-fox .ff-icon { animation: none; }
  .finn-fox .ff-primary,
  .finn-fox .ff-level,
  .finn-fox .ff-user-info input { transition: none; }
}


/* Story reader, quiz image, and sentence activity layouts */
.finn-fox--story main {
  width: min(1180px, calc(100vw - 48px));
  margin: clamp(12px, 2vw, 24px) auto;
  padding: clamp(22px, 3vw, 38px);
}
.finn-fox .ff-story-layout {
  width: min(1080px, 100%);
  margin: 0 auto;
  grid-template-columns: minmax(0, .92fr) minmax(0, 1.08fr);
  align-items: center;
  gap: clamp(22px, 3vw, 38px);
}
.finn-fox .ff-story-illustration {
  width: 100%;
  height: auto;
  max-height: 68vh;
  aspect-ratio: 4 / 3;
  object-fit: contain;
  background: rgba(58, 32, 91, .06);
}
.finn-fox .ff-story {
  padding: clamp(24px, 3vw, 36px);
  box-shadow: 0 14px 32px rgba(70, 45, 25, .07);
}
.finn-fox .ff-story p {
  font-size: clamp(1.25rem, 1.55vw, 1.55rem);
  line-height: 1.72;
}
.finn-fox--story .ff-actions { width: 100%; }
.finn-fox .ff-card { width: min(960px, 100%); padding-top: 6px; }
.finn-fox .ff-quiz-image {
  display: block;
  width: min(100%, 820px);
  height: auto;
  max-height: 52vh;
  aspect-ratio: auto;
  margin: 0 auto 20px;
  object-fit: contain;
  background: rgba(58, 32, 91, .06);
}
.finn-fox .ff-card h2 { margin: 8px auto 18px; text-align: center; font-size: clamp(1.4rem, 2.3vw, 1.9rem); }
.finn-fox .ff-retell-layout {
  width: min(1100px, 100%);
  margin: 0 auto;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-items: center;
  gap: clamp(22px, 3vw, 38px);
}
.finn-fox .ff-retell-illustration {
  display: block;
  width: 100%;
  height: auto;
  max-height: 62vh;
  aspect-ratio: auto;
  object-fit: contain;
  border-radius: 22px;
  box-shadow: 0 14px 32px rgba(70, 45, 25, .14);
}
.finn-fox .ff-retell-copy { min-width: 0; }
.finn-fox .ff-retell-copy h2 { margin: 8px 0 10px; color: var(--rr-ink); font-size: clamp(1.6rem, 2.5vw, 2rem); }
.finn-fox .ff-retell-copy > p:not(.ff-retell) { color: var(--rr-muted); }
.finn-fox .ff-retell { font-size: clamp(1.15rem, 1.5vw, 1.4rem); line-height: 2; }
@media (max-width: 800px) {
  .finn-fox--story main { width: calc(100vw - 24px); padding: 20px; }
  .finn-fox .ff-story-layout,
  .finn-fox .ff-retell-layout { grid-template-columns: minmax(0, 1fr); }
  .finn-fox .ff-story-illustration { width: min(100%, 620px); max-height: 42vh; margin-inline: auto; }
  .finn-fox .ff-retell-illustration { width: min(100%, 620px); max-height: 38vh; margin-inline: auto; }
  .finn-fox .ff-story p { font-size: clamp(1.15rem, 2.4vw, 1.35rem); }
  .finn-fox .ff-quiz-image { max-height: 42vh; }
}
@media (max-width: 600px) {
  .finn-fox--story main { width: 100%; padding: 15px; }
  .finn-fox .ff-story { padding: 21px 19px; }
  .finn-fox .ff-story p { font-size: 1.12rem; line-height: 1.65; }
  .finn-fox .ff-quiz-image { max-height: 36vh; }
}

/* Tanya's pages use a larger reading canvas and more generous type. */
.finn-fox--story.finn-fox--tanya main {
  width: min(1720px, calc(100vw - 48px));
  min-height: 0;
  height: auto;
  padding: clamp(30px, 3.2vw, 58px);
  margin: 0 auto 18px;
}
.finn-fox--story.finn-fox--tanya {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.finn-fox--story.finn-fox--tanya .ff-progress { width: min(1720px, calc(100vw - 48px)); margin: 12px auto 0; }
.finn-fox--story.finn-fox--tanya .ff-story-layout {
  width: 100%;
  grid-template-columns: minmax(0, .95fr) minmax(0, 1.25fr);
  gap: clamp(30px, 4vw, 68px);
}
.finn-fox--story.finn-fox--tanya .ff-story-illustration {
  width: 100%;
  max-height: 78vh;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}
.finn-fox--story.finn-fox--tanya .ff-story { padding: clamp(32px, 3.5vw, 58px); }
.finn-fox--story.finn-fox--tanya .ff-story small { font-size: 1rem; margin-bottom: 22px; }
.finn-fox--story.finn-fox--tanya .ff-story p { font-size: clamp(1.55rem, 2vw, 2rem); line-height: 1.8; }
.finn-fox--story.finn-fox--tanya .ff-actions button { min-height: 58px; padding: 15px 24px; font-size: 1.08rem; }

/* Give the long rabbit story a broad text column so fewer words wrap. */
.finn-fox--story.finn-fox--rabbit main {
  width: min(1760px, calc(100vw - 40px));
  padding: clamp(24px, 2.5vw, 42px);
}
.finn-fox--story.finn-fox--rabbit .ff-story-layout {
  width: 100%;
  grid-template-columns: minmax(0, .72fr) minmax(0, 1.48fr);
  gap: clamp(24px, 3vw, 48px);
}
.finn-fox--story.finn-fox--rabbit .ff-story-illustration { max-height: 76vh; }
.finn-fox--story.finn-fox--rabbit .ff-story { padding: clamp(24px, 2.6vw, 42px); }
.finn-fox--letter-game {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  align-items: stretch;
  justify-content: center;
  padding: clamp(8px, 1vw, 16px);
  background-image: url('/assets/games/finn-the-fox/reading-rescue-main-menu-bg.webp');
}
.finn-fox--letter-game::before { display: none; }
.finn-fox main { backdrop-filter: none; }
.finn-fox .ff-find-letter-launch { display: grid; gap: 5px; min-width: min(100%, 330px); margin: 26px auto 4px; padding: 16px 24px; font-size: 1.05rem; }
.finn-fox .ff-find-letter-launch small { font-size: .78rem; font-weight: 600; }
@media (max-width: 800px) {
  .finn-fox--story.finn-fox--tanya main,
  .finn-fox--story.finn-fox--rabbit main { width: calc(100vw - 24px); min-height: 0; padding: 20px; }
  .finn-fox--story.finn-fox--tanya .ff-story-layout,
  .finn-fox--story.finn-fox--rabbit .ff-story-layout { grid-template-columns: minmax(0, 1fr); }
  .finn-fox--story.finn-fox--tanya .ff-story-illustration,
  .finn-fox--story.finn-fox--rabbit .ff-story-illustration { width: min(100%, 720px); max-height: 48vh; margin-inline: auto; }
  .finn-fox--story.finn-fox--tanya .ff-story p { font-size: clamp(1.35rem, 4vw, 1.7rem); }
}

`;
