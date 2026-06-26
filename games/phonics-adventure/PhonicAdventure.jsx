import { useState, useCallback } from "react";

const LETTER_DATA = {
  A:{ word:"apple",     emoji:"🍎", extras:[["ant","🐜"],["alligator","🐊"]] },
  B:{ word:"ball",      emoji:"⚽", extras:[["bear","🐻"],["bird","🐦"]] },
  C:{ word:"cat",       emoji:"🐱", extras:[["cow","🐮"],["car","🚗"]] },
  D:{ word:"dog",       emoji:"🐶", extras:[["duck","🦆"],["deer","🦌"]] },
  E:{ word:"egg",       emoji:"🥚", extras:[["elephant","🐘"],["ear","👂"]] },
  F:{ word:"fish",      emoji:"🐟", extras:[["fox","🦊"],["flower","🌸"]] },
  G:{ word:"goat",      emoji:"🐐", extras:[["grapes","🍇"],["guitar","🎸"]] },
  H:{ word:"hat",       emoji:"🎩", extras:[["horse","🐴"],["house","🏠"]] },
  I:{ word:"igloo",     emoji:"🛖", extras:[["insect","🐛"],["ice","🧊"]] },
  J:{ word:"jam",       emoji:"🍯", extras:[["jet","✈️"],["juice","🧃"]] },
  K:{ word:"kite",      emoji:"🪁", extras:[["key","🔑"],["king","👑"]] },
  L:{ word:"lion",      emoji:"🦁", extras:[["leaf","🍃"],["lamp","💡"]] },
  M:{ word:"moon",      emoji:"🌙", extras:[["mouse","🐭"],["milk","🥛"]] },
  N:{ word:"nest",      emoji:"🪺", extras:[["nose","👃"],["net","🥅"]] },
  O:{ word:"orange",    emoji:"🍊", extras:[["owl","🦉"],["octopus","🐙"]] },
  P:{ word:"pig",       emoji:"🐷", extras:[["pear","🍐"],["pizza","🍕"]] },
  Q:{ word:"queen",     emoji:"👸", extras:[["quail","🐦"],["quilt","🟪"]] },
  R:{ word:"rabbit",    emoji:"🐰", extras:[["rain","🌧️"],["ring","💍"]] },
  S:{ word:"sun",       emoji:"☀️", extras:[["star","⭐"],["snake","🐍"]] },
  T:{ word:"tiger",     emoji:"🐯", extras:[["tree","🌳"],["train","🚂"]] },
  U:{ word:"umbrella",  emoji:"☂️", extras:[["unicorn","🦄"],["urchin","🦔"]] },
  V:{ word:"violin",    emoji:"🎻", extras:[["van","🚐"],["volcano","🌋"]] },
  W:{ word:"whale",     emoji:"🐳", extras:[["wolf","🐺"],["watch","⌚"]] },
  X:{ word:"xylophone", emoji:"🎵", extras:[["x-ray","🦴"],["fox","🦊"]] },
  Y:{ word:"yak",       emoji:"🐃", extras:[["yo-yo","🪀"],["yacht","⛵"]] },
  Z:{ word:"zebra",     emoji:"🦓", extras:[["zero","0️⃣"],["zipper","🤐"]] },
};

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const BG_COLORS = [
  "#fef3c7","#dbeafe","#dcfce7","#fce7f3","#f3e8ff",
  "#fff7ed","#ecfdf5","#eff6ff","#fdf4ff","#f0fdf4",
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function PhonicStyles() {
  return (
    <style jsx global>{`
      .phonic-root {
        --bg: #1e4c86;
        --bg-dark: #173b68;
        --card: #2d5b91;
        --primary: #24b7ff;
        --primary-light: #7ed3ff;
        --correct: #29c76f;
        --wrong: #f05454;
        --text: #f8fcff;
        --text-secondary: #bdd7f5;

        min-height: 100vh;
        color: var(--text);
        font-family: "Fredoka", "Nunito", "Segoe UI", sans-serif;
        background: linear-gradient(180deg, #173b68 0%, #214f86 100%);
        overflow-x: hidden;
        position: relative;
        isolation: isolate;
        padding: 24px;
      }

      .phonic-root::before {
        content: "ABC ★ ✏ ☁";
        position: fixed;
        inset: 0;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 120px;
        letter-spacing: 80px;
        opacity: .04;
        pointer-events: none;
        z-index: -1;
      }

      .phonic-screen {
        min-height: calc(100vh - 48px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }

      .phonic-panel {
        width: min(100%, 720px);
      }

      .quiz-card {
        background: rgba(255, 255, 255, .08);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, .08);
        border-radius: 28px;
        padding: 48px;
        display: flex;
        flex-direction: column;
        gap: 32px;
        box-shadow:
          0 20px 50px rgba(0, 0, 0, .25),
          inset 0 1px rgba(255, 255, 255, .08);
      }

      .game-mark {
        font-size: 56px;
        line-height: 1;
      }

      .game-title {
        color: var(--primary-light);
        font-size: 44px;
        line-height: 1;
        margin: 0;
        text-shadow: 0 0 30px rgba(126, 211, 255, .25);
      }

      .game-subtitle {
        color: var(--text-secondary);
        font-size: 22px;
        margin: 0;
      }

      .menu-actions,
      .result-actions {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .question-letter {
        font-size: 120px;
        font-weight: 900;
        line-height: 1;
        color: var(--primary-light);
        text-shadow: 0 0 30px rgba(126, 211, 255, .35);
        text-align: center;
      }

      .question {
        font-size: 28px;
        font-weight: 500;
        color: var(--text-secondary);
        text-align: center;
        margin: 0;
      }

      .question strong {
        color: var(--primary-light);
      }

      .feedback {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 10px;
        font-size: 28px;
        font-weight: 700;
        color: var(--correct);
        animation: pop .35s ease;
        margin: 0;
      }

      .feedback.wrong {
        color: var(--wrong);
      }

      .feedback small {
        display: block;
        font-size: 18px;
        color: var(--text-secondary);
        margin-top: 6px;
      }

      .answers {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 22px;
      }

      .answer {
        background: #355f91;
        border: 2px solid transparent;
        border-radius: 18px;
        padding: 28px;
        cursor: pointer;
        text-align: center;
        color: white;
        transition:
          transform .2s,
          background .2s,
          box-shadow .2s,
          border-color .2s;
      }

      .answer:hover:not(:disabled) {
        transform: translateY(-4px);
        background: #4272ab;
        box-shadow: 0 12px 25px rgba(0, 0, 0, .2);
      }

      .answer.correct {
        background: var(--correct);
        border-color: rgba(255, 255, 255, .34);
        box-shadow: 0 0 25px rgba(38, 200, 98, .35);
      }

      .answer.wrong {
        background: var(--wrong);
        border-color: rgba(255, 255, 255, .3);
      }

      .answer:disabled {
        cursor: default;
      }

      .answer .emoji {
        display: block;
        font-size: 52px;
        margin-bottom: 12px;
      }

      .answer .label {
        font-size: 24px;
        font-weight: 700;
        color: white;
      }

      .progress {
        height: 12px;
        background: #3d5b83;
        border-radius: 999px;
        overflow: hidden;
      }

      .progress-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, #25c5ff, #00f2fe);
        box-shadow: 0 0 12px #25c5ff;
        transition: width .25s ease;
      }

      .next-button,
      .primary-button,
      .secondary-button,
      .nav-button {
        border: none;
        border-radius: 999px;
        color: white;
        font-weight: 700;
        cursor: pointer;
        transition: transform .15s, box-shadow .2s, background .2s;
      }

      .next-button,
      .primary-button {
        background: linear-gradient(180deg, #31c5ff, #1497ff);
        box-shadow: 0 12px 30px rgba(0, 170, 255, .35);
      }

      .next-button {
        font-size: 22px;
        padding: 18px 42px;
      }

      .primary-button,
      .secondary-button {
        font-size: 18px;
        padding: 16px 30px;
      }

      .secondary-button {
        background: rgba(255, 255, 255, .12);
        border: 1px solid rgba(255, 255, 255, .12);
      }

      .next-button:hover,
      .primary-button:hover,
      .secondary-button:hover,
      .nav-button:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.03);
      }

      .next-button:active,
      .primary-button:active,
      .secondary-button:active,
      .nav-button:active:not(:disabled) {
        transform: translateY(2px);
      }

      .controls {
        display: flex;
        justify-content: center;
        gap: 16px;
        flex-wrap: wrap;
        margin-top: 30px;
      }

      .key {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 42px;
        height: 42px;
        padding: 0 14px;
        background: rgba(255, 255, 255, .12);
        border: 1px solid rgba(255, 255, 255, .08);
        border-radius: 10px;
        box-shadow:
          0 6px 14px rgba(0, 0, 0, .18),
          inset 0 1px rgba(255, 255, 255, .12);
        font-weight: 700;
        color: white;
      }

      .quiz-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 18px;
      }

      .status-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 36px;
        padding: 0 16px;
        border-radius: 999px;
        background: rgba(36, 183, 255, .22);
        color: var(--text);
        font-weight: 800;
      }

      .learn-card {
        gap: 24px;
      }

      .learn-letter {
        color: var(--primary-light);
        font-size: 112px;
        font-weight: 900;
        line-height: .9;
        text-shadow: 0 0 30px rgba(126, 211, 255, .35);
      }

      .learn-emoji {
        font-size: 76px;
      }

      .learn-word {
        color: var(--text);
        font-size: 28px;
        font-weight: 700;
        margin: 0;
      }

      .learn-word span {
        color: var(--primary-light);
      }

      .word-extras {
        display: flex;
        gap: 14px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .word-extra {
        min-width: 112px;
        background: rgba(255, 255, 255, .12);
        border: 1px solid rgba(255, 255, 255, .08);
        border-radius: 16px;
        padding: 14px;
        box-shadow: inset 0 1px rgba(255, 255, 255, .12);
      }

      .word-extra .emoji {
        display: block;
        font-size: 36px;
        margin-bottom: 6px;
      }

      .word-extra .label {
        color: var(--text-secondary);
        font-size: 16px;
        font-weight: 700;
      }

      .learn-nav {
        display: flex;
        gap: 12px;
        align-items: center;
        justify-content: center;
        margin-top: 18px;
      }

      .nav-button {
        background: #355f91;
        padding: 12px 20px;
        font-size: 16px;
      }

      .nav-button:disabled {
        opacity: .45;
        cursor: not-allowed;
      }

      .alphabet-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: center;
        margin: 18px auto 0;
        max-width: 560px;
      }

      .letter-key {
        width: 38px;
        height: 38px;
        border: 1px solid rgba(255, 255, 255, .08);
        border-radius: 10px;
        background: rgba(255, 255, 255, .12);
        color: white;
        cursor: pointer;
        font-weight: 800;
        box-shadow:
          0 6px 14px rgba(0, 0, 0, .16),
          inset 0 1px rgba(255, 255, 255, .1);
      }

      .letter-key.active {
        background: var(--primary);
      }

      .letter-key.done {
        color: #d8ffe8;
        border-color: rgba(41, 199, 111, .42);
      }

      @keyframes pop {
        0% { transform: scale(.8); opacity: 0; }
        70% { transform: scale(1.08); }
        100% { transform: scale(1); opacity: 1; }
      }

      @media (max-width: 768px) {
        .phonic-root {
          padding: 18px;
        }

        .phonic-root::before {
          font-size: 76px;
          letter-spacing: 34px;
        }

        .phonic-screen {
          min-height: calc(100vh - 36px);
        }

        .quiz-card {
          padding: 32px;
          gap: 24px;
          border-radius: 24px;
        }

        .game-title {
          font-size: 34px;
        }

        .question-letter,
        .learn-letter {
          font-size: 90px;
        }

        .answers {
          grid-template-columns: 1fr;
        }

        .answer {
          padding: 22px;
        }

        .answer .emoji {
          font-size: 46px;
        }

        .answer .label {
          font-size: 22px;
        }

        .question {
          font-size: 22px;
        }

        .menu-actions,
        .result-actions,
        .learn-nav {
          flex-direction: column;
        }
      }
    `}</style>
  );
}

export default function PhonicAdventure({ onComplete }) {
  const [screen, setScreen] = useState("menu"); // menu | learn | quiz | result
  const [letterIdx, setLetterIdx] = useState(0);
  const [quizMode, setQuizMode] = useState("identify"); // identify | match
  const [quizLetters, setQuizLetters] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [completedLetters, setCompletedLetters] = useState(new Set());

  const currentLetter = ALPHABET[letterIdx];
  const currentData = LETTER_DATA[currentLetter];

  const startQuiz = useCallback((mode) => {
    const letters = shuffle(ALPHABET).slice(0, 10);
    setQuizMode(mode);
    setQuizLetters(letters);
    setQIdx(0);
    setScore(0);
    setSelected(null);
    setMistakes(0);
    setAnswered(false);
    setScreen("quiz");
  }, []);

  // Quiz question: given letter, which emoji starts with it?
  const buildQuestion = (letter) => {
    const correct = LETTER_DATA[letter];
    // distractors from other letters
    const others = shuffle(ALPHABET.filter(l => l !== letter))
      .slice(0, 3)
      .map(l => ({ emoji: LETTER_DATA[l].emoji, word: LETTER_DATA[l].word, letter: l }));
    const opts = shuffle([
      { emoji: correct.emoji, word: correct.word, letter },
      ...others,
    ]);
    return { letter, correct, opts };
  };

  const currentQ = quizLetters[qIdx] ? buildQuestion(quizLetters[qIdx]) : null;

  const quizAnswer = (opt) => {
    if (answered) return;
    setSelected(opt.letter);
    setAnswered(true);
    if (opt.letter === currentQ.letter) {
      setScore(s => s + 10);
      setCompletedLetters(prev => new Set([...prev, currentQ.letter]));
    } else {
      setMistakes(m => m + 1);
    }
  };

  const quizNext = () => {
    if (qIdx + 1 >= quizLetters.length) {
      const accuracy = Math.round(((score / 10) / quizLetters.length) * 100);
      onComplete?.(score, accuracy);
      setScreen("result");
      return;
    }
    setQIdx(i => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  if (screen === "menu") return (
    <div className="phonic-root">
      <PhonicStyles />
      <div className="phonic-screen">
        <div className="phonic-panel quiz-card">
          <div className="game-mark">🔤</div>
          <h1 className="game-title">Phonics Adventure</h1>
          <p className="game-subtitle">Learn the alphabet sounds!</p>
          <div className="menu-actions">
            <button className="primary-button" onClick={() => setScreen("learn")}>📖 Learn the Alphabet</button>
            <button className="secondary-button" onClick={() => startQuiz("identify")}>🧠 Quiz: Which word starts with?</button>
          </div>
          <div className="controls" aria-label="Game controls">
            <span className="key">A-Z</span>
            <span className="key">Pick</span>
            <span className="key">Next</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (screen === "result") return (
    <div className="phonic-root">
      <PhonicStyles />
      <div className="phonic-screen">
        <div className="phonic-panel quiz-card">
          <div className="game-mark">🎉</div>
          <h2 className="game-title">Quiz Complete!</h2>
          <p className="game-subtitle">Score: {score} / {quizLetters.length * 10}</p>
          <div className="result-actions">
            <button className="primary-button" onClick={() => startQuiz(quizMode)}>🔄 Try Again</button>
            <button className="secondary-button" onClick={() => setScreen("menu")}>🏠 Menu</button>
          </div>
        </div>
      </div>
    </div>
  );

  // Learn mode — flip through alphabet
  if (screen === "learn") {
    const bg = BG_COLORS[letterIdx % BG_COLORS.length];
    return (
      <div className="phonic-root">
        <PhonicStyles />
        <div className="phonic-screen">
          <div className="phonic-panel quiz-card learn-card" style={{ "--learn-bg": bg }}>
            <div className="learn-letter">{currentLetter}</div>
            <div className="learn-emoji">{currentData.emoji}</div>
            <p className="learn-word">
              {currentLetter} is for <span>{currentData.word}</span>
            </p>
            <div className="word-extras">
              {currentData.extras.map(([w, e]) => (
                <div className="word-extra" key={w}>
                  <span className="emoji">{e}</span>
                  <span className="label">{w}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="learn-nav">
            <button className="nav-button" onClick={() => setLetterIdx(i => Math.max(0, i - 1))} disabled={letterIdx === 0}>
              ← Prev
            </button>
            <span className="key">{letterIdx+1} / 26</span>
            <button className="nav-button" onClick={() => setLetterIdx(i => Math.min(25, i + 1))} disabled={letterIdx === 25}>
              Next →
            </button>
          </div>

          <div className="alphabet-nav" aria-label="Alphabet quick navigation">
            {ALPHABET.map((l, i) => (
              <button
                className={`letter-key ${i===letterIdx ? "active" : ""} ${completedLetters.has(l) ? "done" : ""}`}
                key={l}
                onClick={() => setLetterIdx(i)}
              >
                {l}
              </button>
            ))}
          </div>

          <button className="secondary-button" onClick={() => setScreen("menu")} style={{ marginTop: 18 }}>🏠 Menu</button>
        </div>
      </div>
    );
  }

  // Quiz mode
  if (screen === "quiz" && currentQ) return (
    <div className="phonic-root">
      <PhonicStyles />
      <div className="phonic-screen">
        <div className="phonic-panel">
          <div className="quiz-meta">
            <span className="status-pill">Quiz</span>
            <span className="key">⭐ {score}</span>
            <span className="key">{qIdx+1}/{quizLetters.length}</span>
          </div>

          <div className="progress" aria-hidden="true">
            <div className="progress-fill" style={{ width:`${((qIdx + (answered ? 1 : 0))/quizLetters.length)*100}%` }} />
          </div>

          <div className="quiz-card" style={{ marginTop: 20, marginBottom: 22 }}>
            <div className="question-letter">{currentQ.letter}</div>
            <p className="question">
              Which word starts with the letter <strong>{currentQ.letter}</strong>?
            </p>
            {answered && (
              <p className={`feedback ${selected===currentQ.letter ? "" : "wrong"}`}>
                {selected===currentQ.letter ? "✅ Correct!" : "❌ Try this one next time."}
                <small>{currentQ.correct.emoji} {currentQ.correct.word}</small>
              </p>
            )}
          </div>

          <div className="answers">
            {currentQ.opts.map(opt => {
              const isCorrect = answered && opt.letter === currentQ.letter;
              const isWrong   = answered && opt.letter === selected && opt.letter !== currentQ.letter;
              return (
                <button
                  className={`answer ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                  disabled={answered}
                  key={opt.letter}
                  onClick={() => quizAnswer(opt)}
                >
                  <span className="emoji">{opt.emoji}</span>
                  <span className="label">{opt.word}</span>
                </button>
              );
            })}
          </div>

          {answered && (
            <div style={{ textAlign:"center", marginTop:18 }}>
              <button className="next-button" onClick={quizNext}>➡️ Next</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return null;
}
