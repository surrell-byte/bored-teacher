'use client';

import { useMemo, useRef, useState } from 'react';

const MULTIPLE_CHOICE = [
  { question: 'What does “enormous” mean?', options: ['Very small', 'Very large', 'Very quiet', 'Very fast'], answer: 1 },
  { question: 'Which word means the same as “begin”?', options: ['Finish', 'Start', 'Pause', 'Hide'], answer: 1 },
  { question: 'What is the opposite of “ancient”?', options: ['Modern', 'Old', 'Broken', 'Heavy'], answer: 0 },
  { question: 'After the long race, she felt ___.', options: ['exhausted', 'delicious', 'invisible', 'narrow'], answer: 0 },
  { question: 'A person who writes books is called an ___.', options: ['actor', 'author', 'artist', 'athlete'], answer: 1 },
];

const UNSCRAMBLE = [
  { word: 'planet', hint: 'Earth is one of these.' },
  { word: 'garden', hint: 'A place where flowers and vegetables grow.' },
  { word: 'bridge', hint: 'It helps you cross a river.' },
  { word: 'window', hint: 'You look through it; it lets in light.' },
  { word: 'thunder', hint: 'The loud sound after lightning.' },
];

const STORY = {
  parts: [
    'Mia woke up early and walked to the ', 0,
    ' behind her house. She felt ', 1,
    ' about the strange map she had found. It showed a hidden ', 2,
    '. Even though the path looked scary, she was ', 3,
    ' and kept going. At sunset she ', 4,
    ' home with a big smile.',
  ],
  answers: ['forest', 'curious', 'treasure', 'brave', 'returned'],
  wordBank: ['brave', 'forest', 'returned', 'treasure', 'curious', 'narrow'],
};

function shuffle(values) {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }
  return shuffled;
}

function scramble(word) {
  const letters = word.split('');
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const result = shuffle(letters).join('');
    if (result !== word) return result;
  }
  return [...letters].reverse().join('');
}

function Progress({ label, percentage }) {
  return (
    <>
      <div className="mut">{label}</div>
      <div className="bar" role="progressbar" aria-label={label} aria-valuemin="0" aria-valuemax="100" aria-valuenow={percentage}>
        <i style={{ width: `${percentage}%` }} />
      </div>
    </>
  );
}

function Intro({ onStart }) {
  return (
    <>
      <h1>🧠 Word Quest</h1>
      <p className="mut">Three rounds: multiple choice, word unscrambles, and a story to complete.</p>
      <div className="card">
        <h2>15 points to win</h2>
        <p className="mut">
          Round 1 · 5 multiple-choice questions<br />
          Round 2 · 5 word unscrambles<br />
          Round 3 · 5 story blanks
        </p>
        <button className="pri full" type="button" onClick={onStart}>Start</button>
      </div>
    </>
  );
}

function MultipleChoiceRound({ score, onScore, onDone }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const question = MULTIPLE_CHOICE[index];

  function pick(optionIndex) {
    if (picked !== null) return;
    setPicked(optionIndex);
    if (optionIndex === question.answer) onScore();
  }

  function next() {
    if (index === MULTIPLE_CHOICE.length - 1) {
      onDone();
      return;
    }
    setIndex(current => current + 1);
    setPicked(null);
  }

  return (
    <>
      <h1>Round 1</h1>
      <Progress label={`Question ${index + 1} of 5 · Score ${score}`} percentage={index * 20} />
      <div className="card">
        <h2>{question.question}</h2>
        {question.options.map((option, optionIndex) => {
          let className = 'opt';
          if (picked !== null) {
            if (optionIndex === question.answer) className += ' ok';
            else if (optionIndex === picked) className += ' bad';
          }
          return (
            <button
              key={option}
              className={className}
              type="button"
              onClick={() => pick(optionIndex)}
              aria-pressed={picked === optionIndex}
            >
              {option}
            </button>
          );
        })}
        <div className="msg">
          {picked !== null && (
            <button className="pri" type="button" onClick={next}>
              {index === MULTIPLE_CHOICE.length - 1 ? 'Round 2 →' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </>
  );
}

function UnscrambleRound({ score, onScore, onDone }) {
  const scrambledWords = useMemo(() => UNSCRAMBLE.map(item => scramble(item.word)), []);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const item = UNSCRAMBLE[index];

  function check() {
    if (result || !answer.trim()) return;
    if (answer.trim().toLowerCase() === item.word) {
      setResult('correct');
      onScore();
    } else {
      setResult('wrong');
    }
  }

  function next() {
    if (index === UNSCRAMBLE.length - 1) {
      onDone();
      return;
    }
    setIndex(current => current + 1);
    setAnswer('');
    setResult(null);
  }

  return (
    <>
      <h1>Round 2</h1>
      <Progress label={`Word ${index + 1} of 5 · Score ${score}`} percentage={index * 20} />
      <div className="card">
        <h2>Unscramble the word</h2>
        <div className="tiles" aria-label="Scrambled letters">
          {scrambledWords[index].split('').map((letter, letterIndex) => (
            <div key={`${letter}-${letterIndex}`} className="tile">{letter.toUpperCase()}</div>
          ))}
        </div>
        <p className="mut center">Hint: {item.hint}</p>
        <input
          type="text"
          autoFocus
          autoComplete="off"
          autoCapitalize="off"
          placeholder="Your answer"
          aria-label="Unscrambled word"
          value={answer}
          disabled={Boolean(result)}
          onChange={event => setAnswer(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') check();
          }}
        />
        {!result && (
          <div className="word-quest-action">
            <button className="pri full" type="button" onClick={check}>Check</button>
          </div>
        )}
        <div className="msg" aria-live="polite">
          {result === 'correct' && <span className="ok-t">✓ Correct!</span>}
          {result === 'wrong' && <span className="bad-t">✗ The answer was “{item.word}”</span>}
          {result && (
            <div className="word-quest-next">
              <button className="pri" type="button" onClick={next}>
                {index === UNSCRAMBLE.length - 1 ? 'Round 3 →' : 'Next'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function StoryRound({ onFinish }) {
  const wordBank = useMemo(() => shuffle(STORY.wordBank), []);
  const [answers, setAnswers] = useState(Array(STORY.answers.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const correctCount = answers.filter((answer, index) => answer === STORY.answers[index]).length;

  function changeAnswer(answerIndex, value) {
    setAnswers(current => current.map((answer, index) => index === answerIndex ? value : answer));
  }

  function submit() {
    if (answers.some(answer => !answer)) {
      setHasError(true);
      return;
    }
    setHasError(false);
    setSubmitted(true);
  }

  return (
    <>
      <h1>Round 3</h1>
      <Progress label="Fill in the 5 missing words" percentage={submitted ? 100 : 0} />
      <div className="card">
        <p className="story">
          {STORY.parts.map((part, partIndex) => (
            typeof part === 'number' ? (
              <span key={partIndex}>
                <select
                  value={answers[part]}
                  disabled={submitted}
                  aria-label={`Missing word ${part + 1}`}
                  className={submitted ? (answers[part] === STORY.answers[part] ? 'ok' : 'bad') : ''}
                  onChange={event => changeAnswer(part, event.target.value)}
                >
                  <option value="">({part + 1})</option>
                  {wordBank.map(word => <option key={word} value={word}>{word}</option>)}
                </select>
                {submitted && answers[part] !== STORY.answers[part] && (
                  <b className="ok-t"> ({STORY.answers[part]})</b>
                )}
              </span>
            ) : (
              <span key={partIndex}>{part}</span>
            )
          ))}
        </p>
        <p className="mut">Word bank: {wordBank.join(' · ')}</p>
        {!submitted && (
          <div className="word-quest-action">
            <button className="pri full" type="button" onClick={submit}>Submit</button>
          </div>
        )}
        <div className="msg" aria-live="polite">
          {hasError && <span className="bad-t">Fill every blank first.</span>}
          {submitted && <button className="pri" type="button" onClick={() => onFinish(correctCount)}>See results</button>}
        </div>
      </div>
    </>
  );
}

function Results({ scores, onRestart }) {
  const total = scores.multipleChoice + scores.unscramble + scores.story;
  const emoji = total >= 13 ? '🏆' : total >= 9 ? '🎉' : total >= 5 ? '👍' : '💪';

  return (
    <>
      <h1>Results</h1>
      <div className="card">
        <div className="big" aria-hidden="true">{emoji}</div>
        <h2 className="center">{total} / 15</h2>
        <p className="mut center">
          Multiple choice {scores.multipleChoice}/5 · Unscramble {scores.unscramble}/5 · Story {scores.story}/5
        </p>
        <button className="pri full" type="button" onClick={onRestart}>Play again</button>
      </div>
    </>
  );
}

const STYLES = `
.word-quest{--wq-bg:#f6f4ff;--wq-card:#fff;--wq-text:#1d1b2e;--wq-muted:#6b6880;--wq-primary:#5b4bdb;--wq-ok:#1e9e5a;--wq-bad:#d83b4b;--wq-border:#ddd9f0;
background:var(--wq-bg);color:var(--wq-text);font-family:system-ui,-apple-system,"Segoe UI",sans-serif;min-height:100%;display:flex;justify-content:center;padding:16px}
@media(prefers-color-scheme:dark){.word-quest{--wq-bg:#15131f;--wq-card:#201d30;--wq-text:#f0eefc;--wq-muted:#a29fbb;--wq-primary:#8f82ff;--wq-border:#38344f}}
.word-quest *{box-sizing:border-box}
.word-quest .app{width:100%;max-width:560px;align-self:center}
.word-quest .card{background:var(--wq-card);border:1px solid var(--wq-border);border-radius:16px;padding:22px;margin-top:12px}
.word-quest h1{margin:8px 0 0;font-size:26px}.word-quest h2{margin:0 0 8px;font-size:20px}
.word-quest .mut{color:var(--wq-muted);font-size:14px}
.word-quest .bar{height:8px;background:var(--wq-border);border-radius:8px;overflow:hidden;margin-top:8px}
.word-quest .bar i{display:block;height:100%;background:var(--wq-primary);transition:width .3s}
.word-quest button{font:inherit;cursor:pointer;border-radius:10px;border:1px solid var(--wq-border);background:var(--wq-card);color:var(--wq-text);padding:12px 14px}
.word-quest button.pri{background:var(--wq-primary);color:#fff;border-color:var(--wq-primary);font-weight:600}
.word-quest button.full{width:100%}
.word-quest .opt{display:block;width:100%;text-align:left;margin-top:10px}
.word-quest .opt.ok{border-color:var(--wq-ok);background:color-mix(in srgb,var(--wq-ok) 18%,var(--wq-card))}
.word-quest .opt.bad{border-color:var(--wq-bad);background:color-mix(in srgb,var(--wq-bad) 18%,var(--wq-card))}
.word-quest input[type=text]{font:inherit;width:100%;padding:12px;border-radius:10px;border:1px solid var(--wq-border);background:var(--wq-bg);color:var(--wq-text);text-align:center;letter-spacing:2px;text-transform:uppercase}
.word-quest .tiles{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin:16px 0}
.word-quest .tile{width:42px;height:48px;display:grid;place-items:center;font-weight:700;font-size:20px;background:var(--wq-bg);border:2px solid var(--wq-primary);border-radius:10px}
.word-quest .msg{min-height:24px;margin-top:12px;font-weight:600}
.word-quest .ok-t{color:var(--wq-ok)}.word-quest .bad-t{color:var(--wq-bad)}
.word-quest .story{line-height:2.1;font-size:17px}
.word-quest select{font:inherit;padding:4px 6px;border-radius:8px;border:2px solid var(--wq-border);background:var(--wq-bg);color:var(--wq-text)}
.word-quest select.ok{border-color:var(--wq-ok)}.word-quest select.bad{border-color:var(--wq-bad)}
.word-quest .big{font-size:56px;text-align:center;margin:8px 0}
.word-quest .center{text-align:center}
.word-quest .word-quest-action{margin-top:14px}
.word-quest .word-quest-next{margin-top:8px}
@media(max-width:520px){.word-quest{padding:12px}.word-quest .card{padding:18px}.word-quest .story{font-size:15px;line-height:2}}
`;

export default function WordQuest({ onComplete }) {
  const [phase, setPhase] = useState('intro');
  const [scores, setScores] = useState({ multipleChoice: 0, unscramble: 0, story: 0 });
  const [run, setRun] = useState(0);
  const completedRef = useRef(false);

  function bumpScore(key) {
    setScores(current => ({ ...current, [key]: current[key] + 1 }));
  }

  function restart() {
    completedRef.current = false;
    setScores({ multipleChoice: 0, unscramble: 0, story: 0 });
    setRun(current => current + 1);
    setPhase('intro');
  }

  function finish(storyScore) {
    const finalScores = { ...scores, story: storyScore };
    const total = finalScores.multipleChoice + finalScores.unscramble + finalScores.story;
    setScores(finalScores);
    setPhase('end');
    if (!completedRef.current) {
      completedRef.current = true;
      onComplete?.(total, Math.round((total / 15) * 100));
    }
  }

  return (
    <div className="word-quest">
      <style>{STYLES}</style>
      <div className="app" key={run}>
        {phase === 'intro' && <Intro onStart={() => setPhase('multiple-choice')} />}
        {phase === 'multiple-choice' && (
          <MultipleChoiceRound
            score={scores.multipleChoice}
            onScore={() => bumpScore('multipleChoice')}
            onDone={() => setPhase('unscramble')}
          />
        )}
        {phase === 'unscramble' && (
          <UnscrambleRound
            score={scores.unscramble}
            onScore={() => bumpScore('unscramble')}
            onDone={() => setPhase('story')}
          />
        )}
        {phase === 'story' && <StoryRound onFinish={finish} />}
        {phase === 'end' && <Results scores={scores} onRestart={restart} />}
      </div>
    </div>
  );
}
