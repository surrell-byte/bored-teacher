'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const THEMES = [
  { name: '🚜 Farm World', items: ['🐮', '🐷', '🐔', '🐑', '🐴'] },
  { name: '🌊 Ocean World', items: ['🐙', '🐠', '🐬', '🦀', '🦑'] },
  { name: '🍓 Fruit World', items: ['🍎', '🍊', '🍇', '🍓', '🍌'] },
  { name: '🦕 Dino World', items: ['🦕', '🦖', '🥚', '🐊', '🦎'] },
  { name: '🚀 Space World', items: ['🪐', '🚀', '⭐', '🌙', '☄️'] },
];
const DIFFICULTIES = {
  easy: { label: '🐣 Easy', min: 1, max: 5 },
  medium: { label: '🐥 Medium', min: 1, max: 10 },
  hard: { label: '🦅 Hard', min: 5, max: 20 },
};
const PRAISE = ['You did it! ⭐', 'Amazing! 🌟', 'Brilliant! 🎉', 'Correct! 🥳', 'Yes! Keep going! 💪', 'Superstar! ✨'];
const ENCOURAGEMENT = ['Try counting again!', 'Oops! Try once more.', 'Almost! Try again.', 'Count carefully!', 'You can do it!'];
const MASCOTS_OK = ['🐻', '🦁', '🐯', '🐼', '🦊', '🐨'];
const MASCOTS_NO = ['🐰', '🐸', '🐧', '🐭', '🐱', '🐮'];
const TOTAL_QUESTIONS = 20;
const LEVEL_SIZE = 5;

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = values => values[random(0, values.length - 1)];
const shuffle = values => [...values].sort(() => Math.random() - 0.5);

function makeQuestion(difficulty, theme) {
  const { min, max } = DIFFICULTIES[difficulty];
  const first = random(min, max);
  const second = random(min, max);
  const answer = first + second;
  const choices = new Set([answer]);
  while (choices.size < 3) {
    const option = answer + random(-3, 3);
    if (option > 0) choices.add(option);
  }
  return { first, second, answer, item: pick(theme.items), choices: shuffle([...choices]) };
}

export default function CountAndAdd({ onComplete }) {
  const [difficulty, setDifficulty] = useState('easy');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [locked, setLocked] = useState(false);
  const [answerState, setAnswerState] = useState('');
  const [selectedAnswer, setSelectedAnswer] = useState('?');
  const [feedback, setFeedback] = useState("What's the answer?");
  const [mascot, setMascot] = useState('🐻');
  const [mascotBouncing, setMascotBouncing] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);
  const timers = useRef([]);

  const level = Math.ceil(round / LEVEL_SIZE);
  const levelStars = (round - 1) % LEVEL_SIZE;
  const theme = THEMES[Math.min(level - 1, THEMES.length - 1)];
  const question = useMemo(() => makeQuestion(difficulty, theme), [difficulty, theme, questionKey]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('count-add:hud', { detail: { difficulty, level, levelStars, score, streak } }));
  }, [difficulty, level, levelStars, score, streak]);
  useEffect(() => {
    const changeDifficulty = event => restart(event.detail);
    window.addEventListener('count-add:set-difficulty', changeDifficulty);
    return () => window.removeEventListener('count-add:set-difficulty', changeDifficulty);
  }, [difficulty]);
  const later = (callback, delay) => {
    const id = window.setTimeout(callback, delay);
    timers.current.push(id);
  };
  const nextQuestion = () => {
    setAnswerState('');
    setSelectedAnswer('?');
    setFeedback("What's the answer?");
    setMascot(pick(MASCOTS_OK));
    setMascotBouncing(false);
    setLocked(false);
    setQuestionKey(value => value + 1);
  };
  const restart = (nextDifficulty = difficulty) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setDifficulty(nextDifficulty);
    setRound(1);
    setScore(0);
    setStreak(0);
    setShowLevelUp(false);
    nextQuestion();
  };
  const answer = value => {
    if (locked) return;
    setLocked(true);
    if (value !== question.answer) {
      setAnswerState('wrong');
      setSelectedAnswer('?');
      setStreak(0);
      setFeedback(pick(ENCOURAGEMENT));
      setMascot(pick(MASCOTS_NO));
      later(() => nextQuestion(), 950);
      return;
    }

    const nextScore = score + 1;
    setScore(nextScore);
    setStreak(value => value + 1);
    setAnswerState('correct');
    setSelectedAnswer(value);
    setFeedback(pick(PRAISE));
    setMascot(pick(MASCOTS_OK));
    setMascotBouncing(true);

    if (round === TOTAL_QUESTIONS) {
      later(() => onComplete?.(nextScore, Math.round((nextScore / TOTAL_QUESTIONS) * 100)), 1050);
    } else if (round % LEVEL_SIZE === 0) {
      later(() => setShowLevelUp(true), 600);
      later(() => {
        setShowLevelUp(false);
        setRound(value => value + 1);
        nextQuestion();
      }, 2450);
    } else {
      later(() => {
        setRound(value => value + 1);
        nextQuestion();
      }, 1150);
    }
  };

  return <main className="count-add-game">
    <style>{COUNT_ADD_STYLES}</style>
    <div className="count-add-game__frame">
      <section className="count-add-game__card-wrap">
        {showLevelUp && <div className="count-add-game__level-up" role="status"><div>{theme.items[0]}{theme.items[1]}</div><strong>Level {level + 1} Unlocked!</strong><span>{THEMES[Math.min(level, THEMES.length - 1)].name} — let&apos;s go!</span></div>}
        <div className="count-add-game__card">
          <p className="count-add-game__theme">{theme.name}</p>
          <div className="count-add-game__equation" aria-label={`${question.first} plus ${question.second}`}>
            <EmojiGroup item={question.item} count={question.first} shaking={answerState === 'wrong'} />
            <b>+</b>
            <EmojiGroup item={question.item} count={question.second} shaking={answerState === 'wrong'} />
            <b>=</b>
            <span className={`count-add-game__answer ${answerState}`}>{selectedAnswer}</span>
          </div>
          <div className="count-add-game__choices">
            {question.choices.map(choice => <button key={choice} type="button" disabled={locked} className={answerState && choice === selectedAnswer ? answerState : ''} onClick={() => answer(choice)}>{choice}</button>)}
          </div>
          <div className="count-add-game__feedback"><span className={mascotBouncing ? 'is-bouncing' : ''}>{mascot}</span><strong>{feedback}</strong></div>
        </div>
      </section>
      <p className="count-add-game__round">Question {round} of {TOTAL_QUESTIONS}</p>
    </div>
  </main>;
}

function EmojiGroup({ item, count, shaking }) {
  return <div className={`count-add-game__group${shaking ? ' is-shaking' : ''}`}>{Array.from({ length: count }, (_, index) => <span key={index} style={{ animationDelay: `${index * 45}ms` }}>{item}</span>)}</div>;
}

const COUNT_ADD_STYLES = `
.count-add-game{min-height:100%;width:100%;display:flex;align-items:stretch;justify-content:center;padding:clamp(10px,1.8vw,26px);background:linear-gradient(180deg,#d9fff2,#f7fff5);font-family:Nunito,var(--font-body),sans-serif;color:#0f6e56;overflow:auto}.count-add-game *{box-sizing:border-box}.count-add-game__frame{width:min(100%,1120px);min-height:100%;display:flex;flex-direction:column;justify-content:center}.count-add-game__topbar{display:flex;align-items:center;justify-content:space-between;gap:16px;margin:0 auto clamp(8px,1.6vw,18px);width:min(100%,980px);padding:0 6px}.count-add-game__level-row,.count-add-game__score-row,.count-add-game__stars{display:flex;align-items:center;gap:clamp(4px,1vw,9px)}.count-add-game__stars{font-size:clamp(18px,2.1vw,29px)}.count-add-game__stars span{line-height:1;color:#9acabb}.count-add-game__stars .is-lit{animation:count-add-pop .3s cubic-bezier(.34,1.56,.64,1);color:#f5bb22}.count-add-game__level{padding:5px 13px;border-radius:999px;background:#e1f5ee;font-size:clamp(12px,1.4vw,17px);font-weight:900;white-space:nowrap}.count-add-game__score-row{justify-content:flex-end}.count-add-game__score,.count-add-game__streak{display:flex;align-items:center;gap:7px;padding:7px 16px;border-radius:999px;font-size:clamp(20px,2.4vw,31px);font-weight:900;line-height:1}.count-add-game__score{background:#faeeda;color:#ba7517}.count-add-game__score small{font-size:clamp(11px,1.1vw,14px);color:#854f0b;text-transform:uppercase}.count-add-game__streak{background:#faece7;color:#993c1d;font-size:clamp(13px,1.5vw,19px)}.count-add-game__difficulty{display:flex;justify-content:center;gap:8px;margin-bottom:clamp(10px,1.8vw,18px)}.count-add-game__difficulty button{padding:6px 16px;border:2px solid transparent;border-radius:999px;background:#e1f5ee;color:#0f6e56;font:800 clamp(12px,1.4vw,16px) Nunito,var(--font-body),sans-serif;cursor:pointer}.count-add-game__difficulty button.is-active{background:#0f6e56;color:#fff}.count-add-game__card-wrap{position:relative;width:min(100%,980px);margin:0 auto}.count-add-game__card{min-height:clamp(460px,66vh,660px);display:flex;flex-direction:column;justify-content:center;padding:clamp(22px,4vw,54px);border:2px solid #9fe1cb;border-radius:clamp(22px,3vw,34px);background:#fff;box-shadow:0 10px 36px rgba(15,110,86,.12)}.count-add-game__theme{margin:0 0 clamp(16px,3vh,30px);text-align:center;color:#1d9e75;font-size:clamp(14px,1.7vw,20px);font-weight:900;letter-spacing:.05em}.count-add-game__equation{display:flex;align-items:center;justify-content:center;gap:clamp(8px,1.8vw,22px);margin-bottom:clamp(22px,4vh,42px)}.count-add-game__equation>b{color:#0f6e56;font-size:clamp(42px,5.5vw,76px);line-height:1}.count-add-game__group{display:grid;grid-template-columns:repeat(5,minmax(28px,1fr));gap:clamp(3px,.65vw,8px);align-content:center;min-width:clamp(180px,28vw,330px);min-height:clamp(106px,16vw,168px);padding:clamp(12px,2vw,21px);border:3px solid #cdeee2;border-radius:clamp(15px,2.3vw,24px);background:#fff;box-shadow:0 4px 14px rgba(0,0,0,.05)}.count-add-game__group span{font-size:clamp(28px,4.1vw,54px);line-height:1;text-align:center;animation:count-add-pop .28s cubic-bezier(.34,1.56,.64,1) both}.count-add-game__answer{width:clamp(82px,11vw,128px);height:clamp(82px,11vw,128px);display:grid;place-items:center;flex:0 0 auto;border:3px dashed #1d9e75;border-radius:clamp(16px,2.8vw,26px);color:#1d9e75;font-size:clamp(38px,5.5vw,68px);font-weight:900;animation:count-add-pulse 1.6s ease-in-out infinite}.count-add-game__answer.correct{border-style:solid;border-color:#0f6e56;background:#e1f5ee;animation:none;transform:scale(1.08)}.count-add-game__answer.wrong{border-style:solid;border-color:#d85a30;background:#faece7;color:#d85a30;animation:none}.count-add-game__choices{display:flex;justify-content:center;gap:clamp(14px,3vw,32px)}.count-add-game__choices button{width:clamp(94px,13vw,150px);height:clamp(86px,12vw,136px);border:0;border-radius:clamp(18px,2.7vw,28px);background:#fff;color:#085041;box-shadow:0 5px 16px rgba(0,0,0,.1),0 1px 3px rgba(0,0,0,.06);font:900 clamp(30px,4.8vw,58px) Nunito,var(--font-body),sans-serif;cursor:pointer;transition:transform .15s,box-shadow .15s}.count-add-game__choices button:hover:not(:disabled){transform:translateY(-5px);box-shadow:0 12px 26px rgba(0,0,0,.13)}.count-add-game__choices button.correct{background:#e1f5ee;color:#0f6e56}.count-add-game__choices button.wrong{background:#faece7;color:#d85a30;animation:count-add-shake .35s}.count-add-game__feedback{display:flex;align-items:center;justify-content:center;gap:12px;min-height:52px;margin-top:clamp(18px,3vh,28px);font-size:clamp(16px,2vw,23px)}.count-add-game__feedback>span{font-size:clamp(31px,4vw,48px);line-height:1}.count-add-game__feedback>span.is-bouncing{animation:count-add-bounce .4s cubic-bezier(.34,1.56,.64,1)}.count-add-game__round{margin:clamp(9px,1.5vw,16px) 0 0;text-align:center;color:#398b74;font-size:clamp(12px,1.4vw,16px);font-weight:900}.count-add-game__level-up{position:absolute;inset:0;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border-radius:clamp(22px,3vw,34px);background:rgba(225,245,238,.94);text-align:center;animation:count-add-fade .25s}.count-add-game__level-up div{font-size:clamp(62px,9vw,108px)}.count-add-game__level-up strong{font-size:clamp(25px,4vw,46px)}.count-add-game__level-up span{font-size:clamp(15px,2vw,22px);font-weight:800;color:#1d9e75}@keyframes count-add-pop{0%{transform:scale(0) rotate(-12deg);opacity:0}70%{transform:scale(1.2) rotate(4deg)}100%{transform:scale(1) rotate(0);opacity:1}}@keyframes count-add-shake{20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}@keyframes count-add-bounce{40%{transform:scale(1.25) rotate(-8deg)}70%{transform:scale(.95) rotate(4deg)}}@keyframes count-add-pulse{50%{transform:scale(1.06)}}@keyframes count-add-fade{from{opacity:0}}.count-add-game__group.is-shaking{animation:count-add-shake .45s}@media(max-width:760px){.count-add-game{padding:10px}.count-add-game__card{min-height:0;padding:22px 12px 18px}.count-add-game__equation{gap:7px;flex-wrap:wrap}.count-add-game__group{grid-template-columns:repeat(3,1fr);min-width:min(42vw,180px);min-height:90px}.count-add-game__equation>b{font-size:38px}.count-add-game__answer{width:70px;height:70px}.count-add-game__choices button{width:82px;height:78px}.count-add-game__topbar{align-items:flex-start}.count-add-game__stars span:nth-child(n+4){display:none}}@media(max-width:430px){.count-add-game__topbar{gap:6px}.count-add-game__level{padding:4px 8px}.count-add-game__score,.count-add-game__streak{padding:6px 9px}.count-add-game__score small{display:none}.count-add-game__difficulty button{padding:5px 9px}.count-add-game__group{min-width:130px;padding:9px}.count-add-game__equation{gap:5px}.count-add-game__equation>b{font-size:29px}.count-add-game__answer{width:60px;height:60px}.count-add-game__choices{gap:9px}.count-add-game__choices button{width:70px;height:68px}.count-add-game__feedback{font-size:14px}}
/* Wide GameShell layout overrides */
.count-add-game__topbar,.count-add-game__card-wrap{width:min(100%,1120px)}
.count-add-game__group{min-width:clamp(150px,22vw,260px)}
.count-add-game__group span{font-size:clamp(28px,3.4vw,48px)}
`;
