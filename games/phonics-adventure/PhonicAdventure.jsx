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
        background:
          radial-gradient(circle at 20% 10%, rgba(36, 183, 255, .18), transparent 30%),
          radial-gradient(circle at 85% 80%, rgba(126, 211, 255, .1), transparent 30%),
          linear-gradient(180deg, #122f55 0%, #1e4c86 55%, #173b68 100%);
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

      .learn-screen {
        flex-direction: row;
        align-items: center;
        gap: 24px;
        text-align: left;
      }

      .learn-main-column {
        flex: 1 1 auto;
        min-width: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .learn-screen .alphabet-nav {
        flex: 0 0 210px;
        margin: 0;
        padding: 18px;
        background: rgba(255, 255, 255, .08);
        border: 1px solid rgba(255, 255, 255, .1);
        border-radius: 22px;
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

      .quiz-meta .key {
        transition: transform .2s ease;
      }

      .score-key { color: #ffe27a; }

      .streak-key {
        color: #ff9f43;
        animation: streakPulse .8s ease infinite alternate;
      }

      .question-counter { color: var(--text-secondary); }

      @keyframes streakPulse {
        from { transform: scale(1); }
        to { transform: scale(1.06); }
      }

      .menu-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        width: 100%;
        margin: 8px 0;
      }

      .menu-stat {
        background: rgba(255, 255, 255, .08);
        border: 1px solid rgba(255, 255, 255, .1);
        border-radius: 18px;
        padding: 14px 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 3px;
      }

      .menu-stat .stat-icon { font-size: 28px; }
      .menu-stat strong { font-size: 22px; }
      .menu-stat small,
      .result-stat span {
        color: var(--text-secondary);
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
      }

      .adventure-button { min-width: 230px; }
      .menu-tip { color: var(--text-secondary); font-size: 14px; opacity: .9; }

      .question-card {
        position: relative;
        overflow: hidden;
        padding: 42px 32px;
      }

      .question-card::before {
        content: "";
        position: absolute;
        width: 180px;
        height: 180px;
        border-radius: 50%;
        background: rgba(36, 183, 255, .08);
        top: -80px;
        right: -50px;
      }

      .question-badge,
      .learn-badge {
        display: inline-flex;
        align-self: center;
        background: rgba(36, 183, 255, .15);
        border: 1px solid rgba(126, 211, 255, .2);
        color: var(--primary-light);
        padding: 7px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 900;
        letter-spacing: 1px;
      }

      .question-letter {
        transform-origin: center;
        animation: letterFloat 2.5s ease-in-out infinite;
      }

      @keyframes letterFloat {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-6px); }
      }

      .answer {
        position: relative;
        min-height: 190px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .answer-number {
        position: absolute;
        top: 10px;
        left: 12px;
        width: 28px;
        height: 28px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, .1);
        color: var(--text-secondary);
        font-size: 13px;
        font-weight: 900;
      }

      .answer .emoji { transition: transform .2s ease; }
      .answer:hover:not(:disabled) .emoji { transform: scale(1.12) rotate(-3deg); }

      .answer-result {
        position: absolute;
        top: 12px;
        right: 14px;
        width: 34px;
        height: 34px;
        display: grid;
        place-items: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, .2);
        font-size: 20px;
        font-weight: 900;
      }

      .feedback {
        flex-direction: column;
        gap: 4px;
        padding: 16px 22px;
        border-radius: 18px;
        background: rgba(41, 199, 111, .1);
        border: 1px solid rgba(41, 199, 111, .2);
      }

      .feedback.wrong {
        background: rgba(240, 84, 84, .1);
        border-color: rgba(240, 84, 84, .2);
      }

      .feedback-main { font-size: 28px; font-weight: 900; }
      .feedback-answer { font-size: 18px; color: var(--text-secondary); }
      .feedback-xp { color: #ffe27a; font-size: 15px; font-weight: 900; margin-top: 4px; }

      .result-card { max-width: 650px; text-align: center; }
      .result-card .game-mark { animation: trophyBounce .8s ease; }

      @keyframes trophyBounce {
        0% { transform: scale(.5); opacity: 0; }
        70% { transform: scale(1.15); }
        100% { transform: scale(1); opacity: 1; }
      }

      .result-message { color: var(--text-secondary); font-size: 20px; margin: -12px 0 0; }

      .result-score {
        display: flex;
        justify-content: center;
        align-items: baseline;
        gap: 8px;
        margin: 12px 0;
      }

      .result-score span { font-size: 64px; font-weight: 900; color: #ffe27a; }
      .result-score small { font-size: 18px; font-weight: 900; color: var(--text-secondary); }

      .result-stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin: 10px 0;
      }

      .result-stat { background: rgba(255, 255, 255, .07); border-radius: 16px; padding: 14px 8px; }
      .result-stat strong { display: block; font-size: 24px; }
      .result-stat span { display: block; margin-top: 4px; }

      .result-progress {
        height: 14px;
        background: rgba(255, 255, 255, .1);
        border-radius: 999px;
        overflow: hidden;
        margin: 18px 0;
      }

      .result-progress-fill {
        height: 100%;
        border-radius: inherit;
        background: linear-gradient(90deg, #29c76f, #7ee787);
        transition: width .8s ease;
      }

      .learn-main-word {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 22px;
      }

      .learn-main-word .learn-emoji { font-size: 82px; }
      .learn-word { margin: 0; color: var(--text-secondary); font-size: 20px; }
      .learn-word-big { margin: 2px 0 0; font-size: 34px; color: white; text-transform: capitalize; }
      .learn-prompt { color: var(--primary-light); font-weight: 800; font-size: 16px; margin-top: 4px; }

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

        .learn-screen {
          flex-direction: column;
          gap: 18px;
        }

        .learn-screen .alphabet-nav {
          flex: none;
          width: min(100%, 560px);
          margin: 0 auto;
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

        .menu-stats { gap: 8px; }
        .menu-stat { padding: 11px 6px; }
        .menu-stat .stat-icon { font-size: 23px; }
        .menu-stat strong { font-size: 18px; }
        .adventure-button { width: 100%; min-width: 0; }
        .question-card { padding: 30px 20px; }
        .answer { min-height: 150px; }
        .result-stats { grid-template-columns: repeat(2, 1fr); }
        .learn-main-word { flex-direction: column; gap: 8px; }
        .learn-main-word .learn-emoji { font-size: 64px; }
        .learn-word-big { font-size: 28px; }
        .result-actions { width: 100%; }
        .result-actions button { width: 100%; }
      }
    `}</style>
  );
}

export default function PhonicAdventure({ onComplete }) {
  const [screen, setScreen] = useState("menu"); // menu | learn | quiz | result
  const [letterIdx, setLetterIdx] = useState(0);
  const [quizMode, setQuizMode] = useState("identify"); // identify | match
  const [quizLetters, setQuizLetters] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [completedLetters, setCompletedLetters] = useState(new Set());

  const currentLetter = ALPHABET[letterIdx];
  const currentData = LETTER_DATA[currentLetter];

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

  const startQuiz = useCallback((mode) => {
    const letters = shuffle(ALPHABET).slice(0, 10);
    const generatedQuestions = letters.map(letter => buildQuestion(letter));
    setQuizMode(mode);
    setQuizLetters(letters);
    setQuestions(generatedQuestions);
    setQIdx(0);
    setScore(0);
    setCorrectAnswers(0);
    setMistakes(0);
    setStreak(0);
    setBestStreak(0);
    setSelected(null);
    setAnswered(false);
    setScreen("quiz");
  }, []);

  const currentQ = questions[qIdx] || null;

  const quizAnswer = (opt) => {
    if (answered) return;
    const isCorrect = opt.letter === currentQ.letter;
    setSelected(opt.letter);
    setAnswered(true);
    if (isCorrect) {
      setScore(s => s + 10);
      setCorrectAnswers(c => c + 1);
      setStreak(prev => {
        const next = prev + 1;
        setBestStreak(best => Math.max(best, next));
        return next;
      });
      setCompletedLetters(prev => new Set([...prev, currentQ.letter]));
    } else {
      setMistakes(m => m + 1);
      setStreak(0);
    }
  };

  const quizNext = () => {
    if (qIdx + 1 >= quizLetters.length) {
      const accuracy = Math.round((correctAnswers / quizLetters.length) * 100);
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
          <div className="game-mark">🌟</div>
          <h1 className="game-title">Phonics Adventure</h1>
          <p className="game-subtitle">Explore letters, discover words & earn stars!</p>
          <div className="menu-stats">
            <div className="menu-stat"><span className="stat-icon">🔤</span><strong>26</strong><small>Letters</small></div>
            <div className="menu-stat"><span className="stat-icon">⭐</span><strong>{completedLetters.size}</strong><small>Learned</small></div>
            <div className="menu-stat"><span className="stat-icon">🏆</span><strong>{score}</strong><small>XP</small></div>
          </div>
          <div className="menu-actions">
            <button className="primary-button adventure-button" onClick={() => setScreen("learn")}>🌱 Start Learning</button>
            <button className="secondary-button adventure-button" onClick={() => startQuiz("identify")}>🎯 Play Quiz</button>
          </div>
          <div className="menu-tip">💡 Learn the letters, then test what you know!</div>
        </div>
      </div>
    </div>
  );

  if (screen === "result") return (
    <div className="phonic-root">
      <PhonicStyles />
      <div className="phonic-screen">
        <div className="phonic-panel quiz-card result-card">
          <div className="game-mark">🎉</div>
          <h2 className="game-title">Quiz Complete!</h2>
          <p className="result-message">Great work on your phonics adventure!</p>
          <div className="result-score"><span>{score}</span><small>XP</small></div>
          <div className="result-stats">
            <div className="result-stat"><strong>{correctAnswers}</strong><span>Correct</span></div>
            <div className="result-stat"><strong>{mistakes}</strong><span>Mistakes</span></div>
            <div className="result-stat"><strong>{Math.round((correctAnswers / quizLetters.length) * 100)}%</strong><span>Accuracy</span></div>
            <div className="result-stat"><strong>{bestStreak}</strong><span>Best Streak</span></div>
          </div>
          <div className="result-progress">
            <div className="result-progress-fill" style={{ width: `${Math.round((correctAnswers / quizLetters.length) * 100)}%` }} />
          </div>
          <div className="result-actions">
            <button className="primary-button" onClick={() => startQuiz(quizMode)}>🔄 Play Again</button>
            <button className="secondary-button" onClick={() => setScreen("learn")}>📚 Keep Learning</button>
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
        <div className="phonic-screen learn-screen">
          <div className="learn-main-column">
            <div className="phonic-panel quiz-card learn-card" style={{ "--learn-bg": bg }}>
            <div className="learn-badge">LETTER {letterIdx + 1}</div>
            <div className="learn-letter">{currentLetter}</div>
            <div className="learn-main-word">
              <div className="learn-emoji">{currentData.emoji}</div>
              <div>
                <p className="learn-word">{currentLetter} is for</p>
                <h2 className="learn-word-big">{currentData.word}</h2>
              </div>
            </div>
            <div className="learn-prompt">✨ Words that begin with {currentLetter}</div>
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
            <span className="status-pill">🎯 CHALLENGE</span>
            <span className="key score-key">⭐ {score}</span>
            {streak > 0 && <span className="key streak-key">🔥 {streak}</span>}
            <span className="key question-counter">{qIdx+1} / {quizLetters.length}</span>
          </div>

          <div className="progress" aria-hidden="true">
            <div className="progress-fill" style={{ width:`${((qIdx + (answered ? 1 : 0))/quizLetters.length)*100}%` }} />
          </div>

          <div className="quiz-card question-card" style={{ marginTop: 20, marginBottom: 22 }}>
            <div className="question-badge">FIND THE WORD</div>
            <div className="question-letter">{currentQ.letter}</div>
            <p className="question">
              Which word starts with <strong>{currentQ.letter}</strong>?
            </p>
            {answered && (
              <div className={`feedback ${selected === currentQ.letter ? "" : "wrong"}`}>
                <span className="feedback-main">{selected === currentQ.letter ? "🎉 Amazing!" : "💪 Nice try!"}</span>
                <span className="feedback-answer">{currentQ.correct.emoji} {currentQ.correct.word}</span>
                {selected === currentQ.letter && <span className="feedback-xp">⭐ +10 XP</span>}
              </div>
            )}
          </div>

          <div className="answers">
            {currentQ.opts.map((opt, index) => {
              const isCorrect = answered && opt.letter === currentQ.letter;
              const isWrong   = answered && opt.letter === selected && opt.letter !== currentQ.letter;
              return (
                <button
                  className={`answer ${isCorrect ? "correct" : ""} ${isWrong ? "wrong" : ""}`}
                  disabled={answered}
                  key={opt.letter}
                  onClick={() => quizAnswer(opt)}
                >
                  <span className="answer-number">{index + 1}</span>
                  <span className="emoji">{opt.emoji}</span>
                  <span className="label">{opt.word}</span>
                  {isCorrect && <span className="answer-result">✓</span>}
                  {isWrong && <span className="answer-result">✕</span>}
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
