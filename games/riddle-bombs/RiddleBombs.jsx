'use client';

import { useEffect, useState } from 'react';

const RIDDLES = [
  ['What has four legs but cannot walk?', 'A table', ['A horse', 'A dog', 'A spider']],
  ['What has hands but cannot clap?', 'A clock', ['A robot', 'A monkey', 'A statue']],
  ['What gets wetter the more it dries?', 'A towel', ['A sponge', 'A bucket', 'A soap bar']],
  ['What has one eye but cannot see?', 'A needle', ['A camera', 'A potato', 'A cyclops']],
  ['What has teeth but cannot bite?', 'A comb', ['A lion', 'A shark', 'A crocodile']],
  ['What has a neck but no head?', 'A bottle', ['A snake', 'A guitar', 'A shirt']],
  ['What can you catch but not throw?', 'A cold', ['A ball', 'A fish', 'A frisbee']],
  ['What goes up when rain comes down?', 'An umbrella', ['A river', 'A cloud', 'A tree']],
  ['What belongs to you but other people use more than you do?', 'Your name', ['Your phone', 'Your shoes', 'Your backpack']],
  ['What comes down but never goes up?', 'Rain', ['Smoke', 'A balloon', 'An elevator']],
  ['The more you take away, the bigger I become. What am I?', 'A hole', ['A balloon', 'A shadow', 'A mountain']],
  ['What has many keys but opens no locks?', 'A piano', ['A hotel', 'A keyboard', 'A treasure chest']],
  ['What can travel around the world while staying in one corner?', 'A stamp', ['A cloud', 'A plane', 'A satellite']],
  ['What has words but never speaks?', 'A book', ['A teacher', 'A TV', 'A radio']],
  ['What runs but never walks?', 'A river', ['A dog', 'An athlete', 'A clock']],
  ["What has a thumb and four fingers but isn't alive?", 'A glove', ['A robot', 'A puppet', 'A statue']],
  ['What can fill a room but takes up no space?', 'Light', ['Air', 'Smoke', 'Water']],
  ['What gets sharper the more you use it?', 'Your brain', ['A spoon', 'A pencil', 'A shoe']],
  ['What has an end but no beginning?', 'A stick', ['A circle', 'A road', 'A rope']],
  ['What kind of tree can you carry in your hand?', 'A palm', ['An oak', 'A pine', 'A maple']],
  ['I speak without a mouth and hear without ears. What am I?', 'An echo', ['A ghost', 'A radio', 'A phone']],
  ['What breaks when you say its name?', 'Silence', ['Glass', 'A secret', 'A promise']],
  ['What can you hold in your left hand but not your right?', 'Your right hand', ['A coin', 'A pencil', 'An apple']],
  ['The more of me there is, the less you see. What am I?', 'Darkness', ['Fog', 'Snow', 'Rain']],
  ['What can be cracked, made, told and played?', 'A joke', ['A card', 'A puzzle', 'A song']],
  ['I have cities but no houses, forests but no trees and rivers but no water. What am I?', 'A map', ['A dream', 'A painting', 'A globe']],
  ['What goes through towns and over hills but never moves?', 'A road', ['Wind', 'A train', 'A river']],
  ['What can fly without wings and cry without eyes?', 'A cloud', ['A kite', 'A bat', 'An airplane']],
  ['What has many rings but no fingers?', 'A tree', ['A bell', 'A chain', 'A planet']],
  ['What is full of holes but still holds water?', 'A sponge', ['A bucket', 'A net', 'A bowl']],
  ['Forward I am heavy. Backward I am not. What am I?', 'Ton', ['Metal', 'Truck', 'Weight']],
  ['What five-letter word becomes shorter when you add two letters?', 'Short', ['Brief', 'Tiny', 'Small']],
  ['A man shaves many times a day but still has a beard. Why?', 'He is a barber', ['He is old', 'He is rich', 'He is lazy']],
  ['What can you keep after giving it away?', 'Your word', ['Money', 'A gift', 'A book']],
  ['What has a head, a tail, but no body?', 'A coin', ['A snake', 'A fish', 'A lizard']],
  ['What is always in front of you but cannot be seen?', 'The future', ['Air', 'Wind', 'Your shadow']],
  ['What can be seen once in a minute, twice in a moment and never in a thousand years?', 'The letter M', ['The letter A', 'The letter O', 'The letter T']],
  ['What begins with T, ends with T and has T in it?', 'A teapot', ['A tablet', 'A tent', 'A ticket']],
  ['What invention lets you look right through a wall?', 'A window', ['A mirror', 'A telescope', 'A camera']],
  ["What has legs but doesn't walk?", 'A chair', ['A cat', 'A bird', 'A horse']],
  ['I am taken from a mine and shut inside a wooden case. What am I?', 'Graphite', ['Gold', 'Coal', 'Diamond']],
  ["The person who makes it doesn't need it. The person who buys it doesn't use it. What is it?", 'A coffin', ['A ring', 'A house', 'A gift']],
  ['The more you share me, the less you have. What am I?', 'A secret', ['Food', 'Time', 'Money']],
  ['Two fathers and two sons catch three fish and each gets one. How?', 'Grandfather, father and son', ['They shared', 'They caught four', 'One lied']],
  ['A house has four walls facing south. A bear walks past. What color is the bear?', 'White', ['Brown', 'Black', 'Gray']],
  ['What disappears the moment you say its name?', 'Silence', ['An echo', 'A secret', 'A sound']],
  ['What has lakes with no water, mountains with no stone and cities with no buildings?', 'A map', ['A dream', 'A globe', 'A painting']],
  ['A woman shoots her husband, holds him underwater for five minutes and hangs him. Later they have dinner together. How?', 'She developed a photograph', ['It was a dream', 'He survived', 'It was a movie']],
  ['What question can you never answer yes to truthfully?', 'Are you asleep?', ['Are you hungry?', 'Are you happy?', 'Are you awake?']],
  ['The more you remove from me, the larger I become. What am I?', 'A hole', ['A balloon', 'A cave', 'A tunnel']],
].map(([question, correct, wrong]) => ({ question, answers: [correct, ...wrong], correct: 0 }));

const LEVELS = [
  ['Fuse Lighter', 'Warm up with the basics. Perfect for first-timers.', 'Easy'],
  ['Spark Runner', 'The riddles get a little trickier and the fuse burns faster.', 'Easy+'],
  ['Wire Crosser', 'Wordplay and lateral thinking take center stage.', 'Medium'],
  ['Detonator', 'Classic brain-teasers that demand real focus.', 'Hard'],
  ['Final Countdown', 'The ultimate riddles for true bomb-defusal masters.', 'Expert'],
];
const PER_LEVEL = 10;
const ROUND_TIME_SECONDS = 30;
function arrangeAnswers(riddleAnswers, questionNumber) {
  const answers = riddleAnswers.map((answer, originalIndex) => ({ answer, originalIndex }));
  const correctAnswer = answers.shift();
  const targetPosition = questionNumber % answers.length;
  answers.splice(targetPosition, 0, correctAnswer);
  return answers;
}

export default function RiddleBombs({ onComplete }) {
  const [screen, setScreen] = useState('welcome');
  const [level, setLevel] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(ROUND_TIME_SECONDS);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [overlay, setOverlay] = useState(null);
  const [bestScores, setBestScores] = useState([0, 0, 0, 0, 0]);
  const [locked, setLocked] = useState(false);

  const riddle = RIDDLES[level * PER_LEVEL + questionIndex];
  const maxTime = ROUND_TIME_SECONDS;
  const timerPercent = Math.max(0, (timeLeft / maxTime) * 100);

  useEffect(() => {
    if (screen !== 'game' || locked || overlay || timeLeft <= 0) return undefined;
    const timer = setTimeout(() => setTimeLeft(value => Math.max(0, value - 0.1)), 100);
    return () => clearTimeout(timer);
  }, [screen, locked, overlay, timeLeft]);

  useEffect(() => {
    if (screen === 'game' && !locked && !overlay && timeLeft <= 0) resolveAnswer(null);
    // resolveAnswer intentionally runs when the countdown reaches zero.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, screen]);

  function startLevel(nextLevel) {
    setLevel(nextLevel);
    setQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setCorrectCount(0);
    setLives(3);
    setOverlay(null);
    setLocked(false);
    setSelected(null);
    setFeedback(null);
    setAnswers(arrangeAnswers(RIDDLES[nextLevel * PER_LEVEL].answers, 0));
    setTimeLeft(ROUND_TIME_SECONDS);
    setScreen('game');
  }

  function leaveGame() {
    setOverlay(null);
    setLocked(false);
    setScreen('menu');
  }

  function finishLevel(finalScore, finalLives, totalCorrect) {
    const won = finalLives > 0;
    setBestScores(previous => previous.map((best, index) => index === level ? Math.max(best, finalScore) : best));
    setOverlay({
      won,
      emoji: won ? '🏆' : '💥',
      title: won ? 'DEFUSED!' : 'BOOM!',
      scoreText: `Level ${level + 1} complete - Score: ${finalScore}`,
    });
    onComplete?.(finalScore, Math.round((totalCorrect / PER_LEVEL) * 100));
  }

  function advance(nextIndex, nextScore, nextLives, totalCorrect) {
    if (nextIndex >= PER_LEVEL || nextLives <= 0) {
      finishLevel(nextScore, nextLives, totalCorrect);
      return;
    }
    const nextRiddle = RIDDLES[level * PER_LEVEL + nextIndex];
    setQuestionIndex(nextIndex);
    setScore(nextScore);
    setLives(nextLives);
    setCorrectCount(totalCorrect);
    setSelected(null);
    setFeedback(null);
    setAnswers(arrangeAnswers(nextRiddle.answers, nextIndex));
    setTimeLeft(ROUND_TIME_SECONDS);
    setLocked(false);
  }

  function resolveAnswer(originalIndex) {
    if (locked || overlay) return;
    setLocked(true);
    const isCorrect = originalIndex === riddle.correct;
    const nextLives = isCorrect ? lives : lives - 1;
    const nextStreak = isCorrect ? streak + 1 : 0;
    const nextCorrect = isCorrect ? correctCount + 1 : correctCount;
    const bonus = isCorrect ? Math.ceil(Math.max(timeLeft, 0) * 10) : 0;
    const nextScore = isCorrect ? score + 100 + bonus + nextStreak * 25 : score;

    setSelected({ originalIndex: originalIndex === null ? riddle.correct : originalIndex, isCorrect: originalIndex === null ? true : isCorrect });
    setLives(nextLives);
    setStreak(nextStreak);
    setCorrectCount(nextCorrect);
    setScore(nextScore);
    setFeedback({ type: isCorrect ? 'correct' : originalIndex === null ? 'timeout' : 'wrong', text: isCorrect ? 'Correct! Keep the bomb ticking!' : originalIndex === null ? `Time is up! The answer was "${riddle.answers[riddle.correct]}".` : 'Wrong! The fuse just got shorter!' });
    if (isCorrect || originalIndex === null || nextLives <= 0) {
      setTimeout(() => advance(questionIndex + 1, nextScore, nextLives, nextCorrect), originalIndex === null ? 2800 : 850);
    } else {
      setTimeout(() => {
        setLocked(false);
        setSelected(null);
      }, 850);
    }
  }

  if (screen === 'welcome') {
    return <div className="riddle-bombs"><style>{styles}</style><div className="rb-welcome"><div className="rb-bomb">💣</div><h1>Riddle<span>Bombs</span></h1><p>Defuse the bomb before the fuse runs out. Answer riddles fast, keep your streak alive, and conquer five levels.</p><div className="rb-features"><span>⏱️ Beat the clock</span><span>🔥 Build streaks</span><span>🧠 5 levels</span></div><button className="rb-primary" onClick={() => setScreen('menu')}>Play Now</button></div></div>;
  }

  if (screen === 'menu') {
    return <div className="riddle-bombs"><style>{styles}</style><div className="rb-menu"><h1>Select a Level</h1><p>Each level has 10 riddles. Survive with 3 lives before the bomb goes off.</p><div className="rb-level-grid">{LEVELS.map(([name, description, difficulty], index) => <button className="rb-level-card" key={name} onClick={() => startLevel(index)}><strong>Level {index + 1}</strong><span className="rb-difficulty">{difficulty}</span><h2>{name}</h2><p>{description}</p><small>🧩 10 riddles &nbsp; Best: {bestScores[index]}</small></button>)}</div><button className="rb-secondary" onClick={() => setScreen('welcome')}>← Back</button></div></div>;
  }

  return <div className="riddle-bombs"><style>{styles}</style><div className="rb-game"><div className="rb-game-header"><button className="rb-secondary" onClick={leaveGame}>← Menu</button><strong>💣 Riddle<span>Bombs</span></strong><div className="rb-stats"><span>Score <b>{score}</b></span><span>Streak <b>{streak}</b></span><span>Riddle <b>{questionIndex + 1}/10</b></span></div></div><div className="rb-game-grid"><section className="rb-bomb-panel"><div className="rb-bomb-large">💣<b>{Math.max(0, Math.ceil(timeLeft))}</b><small>seconds</small></div><div className="rb-timer"><i style={{ width: `${timerPercent}%` }} /></div><div className="rb-lives">{[0, 1, 2].map(index => <span key={index}>{index < lives ? '❤️' : '🖤'}</span>)}</div></section><section className="rb-question-panel"><small>LEVEL {level + 1} - {LEVELS[level][0]} &nbsp; RIDDLE #{questionIndex + 1}</small><h2>{riddle.question}</h2><div className="rb-answers">{answers.map(item => <button key={item.answer} className={selected?.originalIndex === item.originalIndex ? selected.isCorrect ? 'correct' : 'wrong' : ''} disabled={locked} onClick={() => resolveAnswer(item.originalIndex)}>{item.answer}</button>)}</div>{feedback && <div className={`rb-feedback ${feedback.type}`}>{feedback.text}</div>}</section></div></div>{overlay && <div className="rb-overlay"><div className="rb-result"><div>{overlay.emoji}</div><h2>{overlay.title}</h2><p>{overlay.scoreText}</p><button className="rb-primary" onClick={() => startLevel(level)}>{overlay.won ? '🔄 Play Again' : '🔄 Retry Level'}</button><button className="rb-secondary" onClick={() => setScreen('menu')}>☰ Level Select</button></div></div>}</div>;
}

const styles = `
.riddle-bombs { min-height: 100%; min-width: 0; padding: 24px; color: #fff; background: radial-gradient(circle at 20% 15%, rgba(75,85,150,.28), transparent 42%), radial-gradient(circle at 80% 10%, rgba(255,204,51,.1), transparent 35%), linear-gradient(165deg,#14182a,#080a13 70%); font-family: var(--font-body, sans-serif); }
.rb-welcome,.rb-menu { width: min(900px, 100%); min-height: 100%; margin: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 36px 18px; }
.rb-welcome { max-width: 640px; }.rb-bomb { font-size: 6.5rem; animation: rb-float 3s ease-in-out infinite; }.rb-welcome h1,.rb-menu h1 { margin: 8px 0 12px; font-family: var(--font-display, sans-serif); font-size: clamp(2.2rem, 7vw, 4rem); }.riddle-bombs h1 span,.riddle-bombs strong span { color: #ffcc33; }.rb-welcome p,.rb-menu > p { max-width: 58ch; color: rgba(255,255,255,.68); line-height: 1.6; }.rb-features { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin: 24px 0 30px; }.rb-features span,.rb-stats span { padding: 10px 14px; border: 1px solid rgba(255,255,255,.13); border-radius: 12px; background: rgba(255,255,255,.06); }.rb-primary,.rb-secondary,.rb-level-card,.rb-answers button { font: inherit; cursor: pointer; color: #fff; }.rb-primary { border: 0; border-radius: 14px; padding: 14px 28px; background: linear-gradient(135deg,#ffcc33,#ff9f43); color: #171717; font-weight: 900; }.rb-secondary { border: 1px solid rgba(255,255,255,.16); border-radius: 12px; padding: 10px 15px; background: rgba(255,255,255,.06); }.rb-level-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(210px,1fr)); gap: 14px; width: 100%; margin: 26px 0; }.rb-level-card { position: relative; min-height: 175px; padding: 18px; text-align: left; border: 1px solid rgba(255,255,255,.13); border-radius: 18px; background: linear-gradient(145deg,rgba(39,43,70,.9),rgba(18,21,37,.95)); }.rb-level-card strong { color: #ffcc33; text-transform: uppercase; font-size: .75rem; letter-spacing: .1em; }.rb-level-card h2 { margin: 14px 0 6px; font-size: 1.2rem; }.rb-level-card p,.rb-level-card small { color: rgba(255,255,255,.62); font-size: .82rem; line-height: 1.45; }.rb-difficulty { float: right; color: #42e38a; font-size: .75rem; }.rb-game { width: min(1100px,100%); min-height: 100%; margin: auto; }.rb-game-header { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; margin-bottom: 22px; }.rb-game-header strong { font-family: var(--font-display,sans-serif); font-size: clamp(1.35rem,4vw,2rem); }.rb-stats { display: flex; gap: 8px; margin-left: auto; flex-wrap: wrap; }.rb-stats span { font-size: .76rem; color: rgba(255,255,255,.62); }.rb-stats b { display: block; color: #fff; font-size: 1.05rem; }.rb-game-grid { display: grid; grid-template-columns: minmax(230px,330px) minmax(0,1fr); gap: 20px; }.rb-bomb-panel,.rb-question-panel { min-height: 540px; padding: 28px; border: 1px solid rgba(255,255,255,.13); border-radius: 24px; background: rgba(255,255,255,.06); box-shadow: 0 22px 55px rgba(0,0,0,.3); }.rb-bomb-panel { display: flex; flex-direction: column; align-items: center; justify-content: center; }.rb-bomb-large { display: grid; place-items: center; width: 185px; height: 185px; border-radius: 50%; background: radial-gradient(circle at 35% 25%,#626983,#151827 72%); box-shadow: 0 0 70px rgba(255,204,51,.18), inset -20px -25px 35px rgba(0,0,0,.6); font-size: 4.5rem; }.rb-bomb-large b { margin-top: -38px; font-size: 2.5rem; }.rb-bomb-large small { margin-top: -40px; color: rgba(255,255,255,.55); font-size: .7rem; text-transform: uppercase; }.rb-timer { width: 100%; height: 12px; margin-top: 34px; overflow: hidden; border-radius: 20px; background: #080a12; }.rb-timer i { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg,#ffcc33,#ff9f43); transition: width .1s linear; }.rb-lives { margin-top: 28px; font-size: 1.7rem; letter-spacing: 5px; }.rb-question-panel > small { color: #ffcc33; letter-spacing: .12em; font-size: .7rem; }.rb-question-panel h2 { max-width: 700px; margin: 22px 0 32px; font-family: var(--font-display,sans-serif); font-size: clamp(1.7rem,4vw,3rem); line-height: 1.15; }.rb-answers { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }.rb-answers button { min-height: 64px; padding: 14px; text-align: left; border: 1px solid rgba(255,255,255,.15); border-radius: 14px; background: rgba(255,255,255,.06); }.rb-answers button:hover:not(:disabled) { border-color: #ffcc33; transform: translateY(-2px); }.rb-answers button.correct { border-color: #42e38a; background: rgba(66,227,138,.2); }.rb-answers button.wrong { border-color: #ff4d55; background: rgba(255,77,85,.2); }.rb-feedback { min-height: 30px; margin-top: 20px; font-weight: 800; }.rb-feedback.correct { color: #42e38a; }.rb-feedback.wrong { color: #ff6b75; }.rb-overlay { position: fixed; inset: 0; z-index: 10; display: grid; place-items: center; padding: 20px; background: rgba(4,6,12,.85); backdrop-filter: blur(8px); }.rb-result { width: min(480px,100%); padding: 40px 24px; text-align: center; border: 1px solid rgba(255,204,51,.35); border-radius: 24px; background: #171b2c; }.rb-result > div { font-size: 4.5rem; }.rb-result h2 { font-size: 2.3rem; margin: 12px 0 8px; }.rb-result p { color: rgba(255,255,255,.68); margin-bottom: 24px; }.rb-result .rb-secondary { margin-left: 8px; }@keyframes rb-float { 50% { transform: translateY(-12px) rotate(3deg); } }
@media (max-width: 760px) { .riddle-bombs { padding: 14px; }.rb-game-grid { grid-template-columns: 1fr; }.rb-bomb-panel,.rb-question-panel { min-height: auto; }.rb-bomb-panel { padding: 22px; }.rb-answers { grid-template-columns: 1fr; }.rb-stats { margin-left: 0; width: 100%; }.rb-stats span { flex: 1; text-align: center; } }
`;
