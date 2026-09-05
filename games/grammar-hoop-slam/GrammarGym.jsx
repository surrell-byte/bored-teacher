'use client';

import { useState } from 'react';

const LEVELS = [
  {
    name: 'Warm-Up Zone', cefr: 'A1',
    questions: [
      ['She ___ a teacher.', ['is', 'are', 'am', 'be'], '"Is" pairs with she, he, and it.'],
      ['They ___ two dogs.', ['have', 'has', 'haves', 'having'], 'They is plural, so it takes have.'],
      ['I ___ from Zimbabwe.', ['am', 'is', 'are', 'be'], 'I always pairs with am.'],
      ['There is ___ apple on the table.', ['an', 'a', 'the', 'no article'], 'Apple starts with a vowel sound, so use an.'],
      ['He ___ to school every day.', ['goes', 'go', 'going', 'gone'], 'He takes the third-person form goes.'],
      ['My sister ___ TV every night.', ['watches', 'watch', 'watching', 'watched'], 'Watch becomes watches with she or he.'],
      ['The book is ___ the table.', ['on', 'in', 'at', 'of'], 'On describes something resting on a surface.'],
      ['This is my dog. ___ name is Max.', ['His', 'He', 'Him', "He's"], 'His is the possessive adjective before name.'],
      ['We ___ students.', ['are', 'is', 'am', 'be'], 'We is plural, so it takes are.'],
      ['___ you like coffee?', ['Do', 'Does', 'Is', 'Are'], 'Use do to form a present-simple question with you.'],
    ],
  },
  {
    name: 'Cardio Blast', cefr: 'A2-B1',
    questions: [
      ['Yesterday, I ___ to the market.', ['went', 'go', 'gone', 'goes'], 'Yesterday signals the past simple: went.'],
      ['This car is ___ than that one.', ['faster', 'fast', 'fastest', 'more fast'], 'Short adjectives use -er for comparisons.'],
      ['Look! It ___ outside.', ['is raining', 'rain', 'rains', 'rained'], 'Look points to something happening now.'],
      ["I don't have ___ money.", ['much', 'many', 'a lot', 'few'], 'Money is uncountable, so use much.'],
      ['You ___ wear a seatbelt. It is the law.', ['must', 'can', 'might', 'could'], 'Must expresses legal obligation.'],
      ['She ___ visit her grandma next week.', ['is going to', 'go to', 'goes to', 'going'], 'Going to expresses a decided plan.'],
      ['How ___ apples do you want?', ['many', 'much', 'a lot', 'little'], 'Apples are countable, so use many.'],
      ['We ___ dinner when you called.', ['were having', 'have', 'had', 'has'], 'Past continuous describes an action in progress.'],
      ["This is the ___ movie I've seen this year.", ['best', 'good', 'better', 'well'], 'Best is the superlative form of good.'],
      ["He ___ finished his homework yet.", ["hasn't", "isn't", "doesn't", "didn't"], 'Yet signals the present perfect negative.'],
    ],
  },
  {
    name: 'Strength Training', cefr: 'B1-B2',
    questions: [
      ['I ___ sushi before.', ['have never eaten', 'never eat', 'never ate', 'eating never'], 'Present perfect describes life experience up to now.'],
      ['If it rains, we ___ the picnic.', ['will cancel', 'cancel', 'would cancel', 'cancelled'], 'The first conditional uses will for the result.'],
      ['If I ___ rich, I would travel the world.', ['were', 'am', 'was', 'be'], 'The second conditional traditionally uses were.'],
      ['The window ___ by the storm last night.', ['was broken', 'broke', 'is broken', 'breaks'], 'The window receives the action, so use the passive.'],
      ['The man ___ lives next door is a doctor.', ['who', 'which', 'whose', 'whom'], 'Who refers to a person in a relative clause.'],
      ["She ___ be at work - her car isn't here.", ["can't", 'must', 'should', 'might'], "Can't expresses strong logical impossibility."],
      ["He's been working here ___ 2019.", ['since', 'for', 'from', 'during'], 'Since is used with a starting point in time.'],
      ['This report needs ___ before Friday.', ['finishing', 'to finish', 'finished', 'complete'], 'Need plus -ing carries a passive meaning here.'],
      ['By the time we arrived, the film ___.', ['had already started', 'already started', 'has already started', 'already starts'], 'Past perfect marks the earlier past action.'],
      ['I wish I ___ more time to study.', ['had', 'have', 'has', 'having'], 'Wish plus past simple expresses present regret.'],
    ],
  },
  {
    name: 'HIIT Circuit', cefr: 'B2-C1',
    questions: [
      ['If I had studied harder, I ___ better grades now.', ['would have', "would've had", 'will have', 'had'], 'This mixed conditional has a present result.'],
      ['She said she ___ tired.', ['was', 'is', 'has been', 'were'], 'Reported speech backshifts is to was.'],
      ['Rarely ___ such dedication in a new employee.', ['do we see', 'we see', 'we do see', 'see we'], 'Rarely at the start triggers inversion.'],
      ['The bridge ___ over the past two years.', ['has been built', 'was being built', 'is being built', 'has being built'], 'This requires the present perfect passive.'],
      ['___ from the mountain, the view was breathtaking.', ['Seen', 'Seeing', 'Having seen', 'To see'], 'Seen is a reduced passive participle clause.'],
      ['Not only ___ late, but he also forgot the documents.', ['was he', 'he was', 'he is', 'is he'], 'Not only at the start forces inversion.'],
      ['He denied ___ the money.', ['stealing', 'to steal', 'steal', 'stolen'], 'Deny is followed by a gerund.'],
      ['Had I known about the meeting, I ___ attended.', ['would have', 'would', 'will have', 'had'], 'This inverted third conditional needs would have.'],
      ["It's high time you ___ this mess.", ['cleaned', 'clean', 'have cleaned', 'cleaning'], 'High time is followed by past simple.'],
      ['The manager insisted that the report ___ submitted by Monday.', ['be', 'is', 'was', 'will be'], 'Insist can take the subjunctive base form be.'],
    ],
  },
  {
    name: 'Championship Match', cefr: 'C1-C2',
    questions: [
      ['___ that concerns me is his lack of experience.', ['What', 'That', 'It', 'Which'], 'A cleft subject clause begins with What.'],
      ['Little ___ that the deal was about to collapse.', ['did he know', 'he knew', 'he did know', 'knew he'], 'Little at the start triggers inversion.'],
      ['She would rather I ___ tomorrow instead.', ['came', 'come', 'will come', 'coming'], 'Would rather plus another subject takes past simple.'],
      ['No sooner ___ the building than the alarm went off.', ['had he entered', 'he had entered', 'did he enter', 'he entered'], 'No sooner requires inversion and past perfect.'],
      ['___ the circumstances, the committee decided to proceed.', ['Notwithstanding', 'Despite', 'Although', 'Even though'], 'Notwithstanding is a formal preposition before a noun phrase.'],
      ['His arrogance was such ___ nobody wanted to work with him.', ['that', 'as', 'which', 'so'], 'Such that introduces a result.'],
      ['The proposal, ___ merits are debatable, was approved.', ['whose', 'which', 'that', 'who'], 'Whose shows possession.'],
      ['Were it not ___ your help, the project would have failed.', ['for', 'of', 'with', 'by'], 'Were it not for means if it were not for.'],
      ["She's ___ to have won three awards this year.", ['said', 'saying', 'say', 'says'], 'Is said to have won is an impersonal passive.'],
      ["The decision, ___ controversial, was upheld.", ['though', 'despite', 'notwithstanding', 'albeit being'], 'Though can introduce a reduced clause.'],
    ],
  },
];

const LETTERS = ['A', 'B', 'C', 'D'];
const MAX_ENERGY = 5;

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function getRank(score) {
  if (score >= 1500) return 'GRAMMAR CHAMPION';
  if (score >= 1000) return 'GRAMMAR BEAST';
  if (score >= 600) return 'ELITE';
  if (score >= 300) return 'GRAMMAR LIFTER';
  if (score >= 100) return 'ATHLETE';
  return 'ROOKIE';
}

export default function GrammarGym({ onComplete }) {
  const [screen, setScreen] = useState('title');
  const [level, setLevel] = useState(0);
  const [unlocked, setUnlocked] = useState([true, false, false, false, false]);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [energy, setEnergy] = useState(MAX_ENERGY);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const currentLevel = LEVELS[level];
  const current = questions[questionIndex];

  function startLevel(nextLevel) {
    setLevel(nextLevel);
    setQuestions(shuffle(LEVELS[nextLevel].questions));
    setQuestionIndex(0);
    setEnergy(MAX_ENERGY);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setAnswered(0);
    setCorrect(0);
    setWrongCount(0);
    setSelected(null);
    setFeedback(null);
    setScreen('question');
  }

  function chooseAnswer(index) {
    if (selected !== null || !current) return;
    setAnswered(value => value + 1);
    if (index === 0) {
      const nextStreak = streak + 1;
      const points = (wrongCount === 0 ? 10 : wrongCount === 1 ? 6 : 3) + Math.min(nextStreak, 5) * 2;
      setSelected(index);
      setCorrect(value => value + 1);
      setStreak(nextStreak);
      setBestStreak(value => Math.max(value, nextStreak));
      setScore(value => value + points);
      setFeedback({ type: 'good', text: `SOLID REP! +${points} GAINS`, why: current[2] });
    } else {
      const nextEnergy = energy - 1;
      const nextWrong = wrongCount + 1;
      setEnergy(nextEnergy);
      setWrongCount(nextWrong);
      setStreak(0);
      setFeedback({ type: nextEnergy <= 0 || nextWrong >= 3 ? 'bad' : 'warn', text: nextEnergy <= 0 ? 'OUT OF ENERGY - correct answer revealed.' : nextWrong >= 3 ? `Correct answer: ${current[1][0]}` : 'Not quite - keep lifting.', why: current[2] });
      if (nextEnergy <= 0 || nextWrong >= 3) setSelected(0);
    }
  }

  function nextQuestion() {
    if (questionIndex + 1 >= questions.length) {
      setUnlocked(value => value.map((item, index) => index === level + 1 ? true : item));
      onComplete?.(score, Math.round((correct / Math.max(answered, 1)) * 100));
      setScreen('complete');
      return;
    }
    setQuestionIndex(value => value + 1);
    setWrongCount(0);
    setSelected(null);
    setFeedback(null);
  }

  function resetProgress() {
    setUnlocked([true, false, false, false, false]);
    setScreen('title');
  }

  if (screen === 'title') return <div className="grammar-gym"><style>{STYLES}</style><main className="gg-app gg-center"><div className="gg-logo"><span>GRAMMAR</span><b>GYM</b></div><div className="gg-barbell">▰━━━▰━━━▰</div><p className="gg-subtitle">Train your grammar. Build your streak. Become the ultimate English champion.</p><div className="gg-stats"><div><b>{getRank(score)}</b><small>Rank</small></div><div><b>{score}</b><small>Gains</small></div><div><b>0/5</b><small>Stations</small></div></div><button className="gg-btn" onClick={() => setScreen('map')}>Enter the Gym →</button><button className="gg-link" onClick={resetProgress}>Reset all progress</button></main></div>;

  if (screen === 'map') return <div className="grammar-gym"><style>{STYLES}</style><main className="gg-app"><div className="gg-center"><span className="gg-tag">GYM FLOOR</span><h1>Choose Your Workout</h1><p className="gg-muted">Complete each station to unlock the next.</p></div><div className="gg-stations">{LEVELS.map((item, index) => <button key={item.name} className={`gg-station ${unlocked[index] ? '' : 'locked'}`} disabled={!unlocked[index]} onClick={() => startLevel(index)}><span className="gg-station-num">{unlocked[index] ? index + 1 : '🔒'}</span><span><b>{item.name}</b><small>{item.cefr} · {item.questions.length} reps</small></span><strong>{unlocked[index] ? '▶' : ''}</strong></button>)}</div><button className="gg-link" onClick={resetProgress}>Erase all progress and start fresh</button></main></div>;

  if (screen === 'complete') return <div className="grammar-gym"><style>{STYLES}</style><main className="gg-app gg-center"><div className="gg-medal">🏆</div><span className="gg-tag">WORKOUT COMPLETE</span><h1>{currentLevel.name} - Cleared!</h1><p className="gg-muted">{score} gains · {correct}/{Math.max(answered, 1)} correct · Best combo {bestStreak}</p><div className="gg-actions"><button className="gg-btn" onClick={() => startLevel(level)}>Retry</button>{level < LEVELS.length - 1 && unlocked[level + 1] && <button className="gg-btn gg-green" onClick={() => startLevel(level + 1)}>Continue →</button>}<button className="gg-ghost" onClick={() => setScreen('map')}>Back to Map</button></div></main></div>;

  if (!current) return null;
  const exhausted = selected !== null && feedback?.type === 'bad';
  return <div className="grammar-gym"><style>{STYLES}</style><main className="gg-app"><div className="gg-question-head"><button className="gg-ghost" onClick={() => setScreen('map')}>← Map</button><span className="gg-tag">{currentLevel.name}</span><div className="gg-energy">{Array.from({ length: MAX_ENERGY }, (_, index) => <span key={index}>{index < energy ? '♥' : '♡'}</span>)}</div></div><div className="gg-progress"><i style={{ width: `${(questionIndex / questions.length) * 100}%` }} /></div><div className="gg-question-card"><div className="gg-q-meta"><span>CEFR {currentLevel.cefr}</span><span>{questionIndex + 1}/{questions.length} · {3 - wrongCount} tries left</span></div><h2>{current[0]}</h2><div className="gg-options">{current[1].map((option, index) => <button key={option} className={selected === index ? index === 0 ? 'correct' : 'wrong' : ''} disabled={selected !== null || exhausted} onClick={() => chooseAnswer(index)}><b>{LETTERS[index]}</b>{option}</button>)}</div>{feedback && <div className={`gg-feedback ${feedback.type}`}><b>{feedback.text}</b><small>{feedback.why}</small></div>}</div><div className="gg-actions">{selected === 0 && <button className="gg-btn" onClick={nextQuestion}>{questionIndex + 1 === questions.length ? 'Finish Workout' : 'Next Rep →'}</button>}</div></main></div>;
}

const STYLES = `
.grammar-gym { min-height:100%; color:#f5f5f1; background:radial-gradient(circle at 50% -10%,#30313a 0%,#17191e 30%,#090a0d 72%); font-family:Arial Black,Arial,sans-serif; }
.grammar-gym * { box-sizing:border-box; }.gg-app { width:min(900px,100%); min-height:100%; margin:auto; padding:clamp(18px,3vw,32px); display:flex; flex-direction:column; gap:18px; }.gg-center { align-items:center; justify-content:center; text-align:center; }.gg-logo { font-size:clamp(3rem,9vw,6rem); font-style:italic; line-height:.88; text-shadow:4px 4px 0 #e8352c,8px 8px 0 rgba(0,0,0,.55); }.gg-logo span { display:block; }.gg-logo b { color:#ffc72c; text-shadow:4px 4px 0 #a51f19,8px 8px 0 rgba(0,0,0,.55); }.gg-barbell { color:#ffc72c; font-size:clamp(1.5rem,4vw,2.7rem); }.gg-subtitle,.gg-muted { color:#b7bbc4; font-family:Arial,sans-serif; line-height:1.55; max-width:36em; }.gg-stats { width:min(650px,100%); display:grid; grid-template-columns:repeat(3,1fr); gap:10px; }.gg-stats div { padding:14px 8px; border:1px solid #3a404b; border-radius:13px; background:rgba(255,255,255,.035); }.gg-stats b { display:block; color:#ffc72c; font-size:1.1rem; }.gg-stats small { color:#8f949e; font:700 .75rem Arial,sans-serif; text-transform:uppercase; }.gg-btn,.gg-ghost,.gg-link,.gg-station { font:inherit; cursor:pointer; }.gg-btn { border:0; border-bottom:5px solid #c48e00; border-radius:13px; padding:14px 22px; background:linear-gradient(180deg,#ffd94d,#ffc72c); color:#090a0d; font-weight:900; text-transform:uppercase; }.gg-green { background:linear-gradient(180deg,#42d77d,#249b55); border-color:#176b3a; color:#07120b; }.gg-ghost { border:2px solid #3a404b; border-radius:12px; padding:10px 14px; background:rgba(255,255,255,.025); color:#f5f5f1; }.gg-link { border:0; padding:8px; background:none; color:#777d88; text-decoration:underline; }.gg-tag { display:inline-flex; padding:5px 12px; border-radius:999px; background:#ffc72c; color:#090a0d; font-size:.75rem; font-weight:900; letter-spacing:.06em; text-transform:uppercase; }.gg-stations { display:flex; flex-direction:column; gap:10px; }.gg-station { display:flex; align-items:center; gap:14px; min-height:84px; padding:14px; text-align:left; border:2px solid #3a404b; border-radius:17px; background:#171a20; color:#f5f5f1; }.gg-station:not(:disabled):hover { border-color:#ffc72c; transform:translateX(5px); }.gg-station.locked { opacity:.42; cursor:not-allowed; }.gg-station-num { display:flex; align-items:center; justify-content:center; width:44px; height:44px; border-radius:12px; background:#292e38; color:#ffc72c; font-size:1.2rem; }.gg-station span:nth-child(2) { flex:1; }.gg-station b,.gg-station small { display:block; }.gg-station small { margin-top:5px; color:#969ca6; font:700 .8rem Arial,sans-serif; }.gg-station strong { color:#ffc72c; }.gg-medal { font-size:6rem; }.gg-actions { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; }.gg-question-head { display:flex; align-items:center; justify-content:space-between; gap:12px; }.gg-energy { color:#e8352c; font-size:1.5rem; letter-spacing:3px; }.gg-progress { height:11px; overflow:hidden; border:1px solid #3a404b; border-radius:999px; background:#0e1014; }.gg-progress i { display:block; height:100%; background:linear-gradient(90deg,#e8352c,#ffc72c); }.gg-question-card { padding:clamp(18px,4vw,32px); border:1px solid #3a404b; border-radius:18px; background:#171a20; }.gg-q-meta { display:flex; justify-content:space-between; gap:10px; color:#aeb3bd; font:700 .8rem Arial,sans-serif; }.gg-question-card h2 { margin:18px 0; font-size:clamp(1.2rem,3vw,1.65rem); line-height:1.4; }.gg-options { display:grid; grid-template-columns:1fr 1fr; gap:10px; }.gg-options button { display:flex; align-items:center; gap:10px; min-height:64px; padding:12px; border:2px solid #3a404b; border-radius:13px; background:#20242c; color:#f5f5f1; font:bold 1rem Arial,sans-serif; text-align:left; cursor:pointer; }.gg-options button b { display:grid; place-items:center; width:30px; height:30px; border-radius:7px; background:#3a404b; }.gg-options button:hover:not(:disabled) { border-color:#ffc72c; }.gg-options button.correct { border-color:#42d77d; background:rgba(66,215,125,.15); color:#42d77d; }.gg-options button.wrong { border-color:#e8352c; background:rgba(232,53,44,.15); color:#e8352c; }.gg-options button:disabled { cursor:default; }.gg-feedback { display:flex; flex-direction:column; gap:8px; margin-top:15px; font:700 .9rem Arial,sans-serif; }.gg-feedback small { color:#c9cdd5; line-height:1.5; }.gg-feedback.good { color:#42d77d; }.gg-feedback.warn { color:#ffc72c; }.gg-feedback.bad { color:#e8352c; }
@media(max-width:600px){ .gg-options{grid-template-columns:1fr}.gg-question-head{flex-wrap:wrap}.gg-question-head .gg-tag{order:-1}.gg-stats{gap:6px}.gg-stats b{font-size:.85rem} }
`;
