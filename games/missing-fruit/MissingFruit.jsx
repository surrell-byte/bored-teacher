import { useCallback, useEffect, useRef, useState } from "react";

const FRUITS = ["🍎", "🍌", "🍇", "🍊", "🍓", "🍉", "🍍", "🥝", "🍑"];
const MAX_ROUNDS = 5;
const MODES = [
  { id: "easy", label: "Easy", cards: 4, missing: 1 },
  { id: "medium", label: "Medium", cards: 5, missing: 2 },
  { id: "hard", label: "Hard", cards: 6, missing: 3 },
  { id: "mastery", label: "Mastery", cards: 8, missing: 4 },
];

const shuffle = (values) => [...values].sort(() => Math.random() - 0.5);

const styles = `
  .missing-fruit-root { box-sizing:border-box; min-height:100%; width:100%; padding:18px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:14px; background:linear-gradient(135deg,#fef3c7,#fed7aa,#fde68a); color:#78350f; font-family:'Segoe UI',sans-serif; text-align:center; }
  .missing-fruit-root * { box-sizing:border-box; }
  .missing-fruit-card { width:min(100%,680px); padding:clamp(16px,3vw,28px); border:1px solid #fff7; border-radius:24px; background:#fff9e8ed; box-shadow:0 12px 34px #78350f20; }
  .missing-fruit-root h1 { margin:0 0 4px; color:#92400e; font-size:clamp(1.5rem,5vw,2.2rem); }
  .missing-fruit-subtitle { margin:0 0 12px; color:#b45309; font-weight:650; }
  .missing-fruit-modes { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; margin:18px 0; }
  .missing-fruit-mode { min-height:100px; padding:14px; border:2px solid #fcd34d; border-radius:18px; background:#fff; color:#78350f; font:inherit; cursor:pointer; }
  .missing-fruit-mode strong,.missing-fruit-mode span { display:block; }
  .missing-fruit-mode strong { margin-bottom:6px; font-size:1.15rem; }
  .missing-fruit-mode span { color:#92400e; font-size:.88rem; }
  .missing-fruit-board { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:10px; width:min(100%,520px); margin:0 auto 12px; }
  .missing-fruit-tile { display:grid; aspect-ratio:1; place-items:center; border:2px solid #fde68a; border-radius:16px; background:#fff; box-shadow:0 4px 8px #0001; font-size:clamp(2rem,9vw,3.6rem); }
  .missing-fruit-tile.is-hidden { border-color:#f59e0b; background:linear-gradient(135deg,#ffedd5,#fed7aa); }
  .missing-fruit-answers { display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:8px; width:min(100%,520px); margin:0 auto 14px; }
  .missing-fruit-answer { min-height:54px; border:2px solid #fde68a; border-radius:14px; background:#fff; font-size:1.7rem; cursor:pointer; }
  .missing-fruit-answer[aria-pressed="true"] { border-color:#16a34a; background:#dcfce7; box-shadow:0 0 0 2px #16a34a33; }
  .missing-fruit-button { min-height:48px; padding:10px 24px; border:0; border-radius:999px; background:linear-gradient(135deg,#22c55e,#16a34a); color:white; font:800 1rem 'Segoe UI',sans-serif; cursor:pointer; box-shadow:0 4px 14px #22c55e44; }
  .missing-fruit-button:disabled { opacity:.45; cursor:not-allowed; }
  .missing-fruit-secondary { background:#fff; color:#92400e; border:2px solid #fcd34d; box-shadow:none; }
  .missing-fruit-feedback { min-height:24px; margin:8px 0; font-weight:800; }
  .missing-fruit-progress { color:#92400e; font-weight:700; }
  .missing-fruit-timer { width:100%; max-width:520px; height:6px; overflow:hidden; border-radius:99px; background:#fde68a; }
  .missing-fruit-timer i { display:block; height:100%; background:#f59e0b; animation:missing-fruit-shrink 3s linear forwards; }
  @keyframes missing-fruit-shrink { to { width:0; } }
  @media(max-width:420px) {
    .missing-fruit-root { padding:10px; gap:10px; }
    .missing-fruit-card { padding:14px; }
    .missing-fruit-board { gap:7px; }
    .missing-fruit-tile { border-radius:12px; }
    .missing-fruit-answers { gap:6px; }
    .missing-fruit-answer { min-height:46px; }
  }
`;

function createChallenge(mode) {
  const cards = shuffle(FRUITS).slice(0, mode.cards);
  const missing = shuffle(cards).slice(0, mode.missing);
  return { cards, missing };
}

export default function MissingFruit({ onComplete }) {
  const [mode, setMode] = useState(null);
  const [cards, setCards] = useState([]);
  const [missing, setMissing] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [phase, setPhase] = useState("menu");
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [mistakes, setMistakes] = useState(0);
  const [finalAccuracy, setFinalAccuracy] = useState(0);
  const timerRef = useRef(null);

  const startRound = useCallback((selectedMode) => {
    const challenge = createChallenge(selectedMode);
    setCards(challenge.cards);
    setMissing(challenge.missing);
    setSelectedAnswers([]);
    setFeedback("");
    setPhase("memorise");
  }, []);

  const startGame = useCallback((selectedMode) => {
    setMode(selectedMode);
    setScore(0);
    setRound(1);
    setMistakes(0);
    startRound(selectedMode);
  }, [startRound]);

  useEffect(() => {
    if (phase !== "memorise") return undefined;
    timerRef.current = window.setTimeout(() => setPhase("guess"), 3000);
    return () => window.clearTimeout(timerRef.current);
  }, [phase, round]);

  useEffect(() => {
    const openMenu = () => {
      setPhase("menu");
      setMode(null);
      setFeedback("");
    };
    window.addEventListener("missing-fruit:main-menu", openMenu);
    return () => window.removeEventListener("missing-fruit:main-menu", openMenu);
  }, []);

  function toggleAnswer(fruit) {
    setFeedback("");
    setSelectedAnswers((selected) => (
      selected.includes(fruit)
        ? selected.filter((item) => item !== fruit)
        : selected.length < mode.missing ? [...selected, fruit] : selected
    ));
  }

  function checkAnswer() {
    if (selectedAnswers.length !== mode.missing) return;
    const correct = selectedAnswers.length === missing.length && missing.every((fruit) => selectedAnswers.includes(fruit));
    if (!correct) {
      setMistakes((count) => count + 1);
      setSelectedAnswers([]);
      setFeedback("Not quite. Try selecting the missing fruit again.");
      return;
    }
    setScore((value) => value + 10);
    setFeedback("🎉 Correct! You found every missing fruit.");
    setPhase("result");
  }

  function nextRound() {
    if (round >= MAX_ROUNDS) {
      const accuracy = Math.round((MAX_ROUNDS / (MAX_ROUNDS + mistakes)) * 100);
      setFinalAccuracy(accuracy);
      onComplete?.(score, accuracy);
      setPhase("complete");
      return;
    }
    setRound((value) => value + 1);
    startRound(mode);
  }

  return (
    <main className="missing-fruit-root">
      <style>{styles}</style>
      {phase === "menu" && (
        <section className="missing-fruit-card" aria-labelledby="missing-fruit-title">
          <h1 id="missing-fruit-title">🍎 What&apos;s Missing?</h1>
          <p className="missing-fruit-subtitle">Choose a difficulty. Remember the fruits, then select the ones that disappeared.</p>
          <div className="missing-fruit-modes">
            {MODES.map((item) => (
              <button className="missing-fruit-mode" key={item.id} type="button" onClick={() => startGame(item)}>
                <strong>{item.label}</strong>
                <span>{item.cards} flashcards · hide {item.missing}</span>
              </button>
            ))}
          </div>
          <p className="missing-fruit-progress">Each mode is a five-round challenge.</p>
        </section>
      )}

      {(phase === "memorise" || phase === "guess" || phase === "result") && mode && (
        <>
          <h1>🍎 What&apos;s Missing?</h1>
          <p className="missing-fruit-progress">{mode.label} · Score: {score} · Round {round}/{MAX_ROUNDS}</p>
          <section className="missing-fruit-card">
            <p className="missing-fruit-subtitle">
              {phase === "memorise" ? "⏳ Memorise the fruits!" : `🔍 Choose ${mode.missing} fruit${mode.missing === 1 ? "" : "s"} that disappeared`}
            </p>
            <div className="missing-fruit-board" aria-label={`${mode.cards} fruit flashcards`}>
              {cards.map((fruit, index) => {
                const hidden = phase !== "memorise" && missing.includes(fruit);
                return <div className={`missing-fruit-tile${hidden ? " is-hidden" : ""}`} key={`${fruit}-${index}`}>{hidden ? "❓" : fruit}</div>;
              })}
            </div>
            {phase === "memorise" && <div className="missing-fruit-timer" aria-label="Memory time remaining"><i /></div>}
            {phase !== "memorise" && phase !== "result" && (
              <>
                <div className="missing-fruit-answers" aria-label="Fruit answer choices">
                  {FRUITS.map((fruit) => (
                    <button
                      aria-label={fruit}
                      aria-pressed={selectedAnswers.includes(fruit)}
                      className="missing-fruit-answer"
                      key={fruit}
                      type="button"
                      onClick={() => toggleAnswer(fruit)}
                    >{fruit}</button>
                  ))}
                </div>
                <button className="missing-fruit-button" type="button" disabled={selectedAnswers.length !== mode.missing} onClick={checkAnswer}>
                  Check Answers ({selectedAnswers.length}/{mode.missing})
                </button>
              </>
            )}
            {feedback && <p className="missing-fruit-feedback" role="status">{feedback}</p>}
          </section>
          <button className="missing-fruit-button missing-fruit-secondary" type="button" onClick={() => { setPhase("menu"); setMode(null); }}>
            Back to Modes
          </button>
          {phase === "result" && <button className="missing-fruit-button" type="button" onClick={nextRound}>{round === MAX_ROUNDS ? "Finish Game" : "Next Round"}</button>}
        </>
      )}

      {phase === "complete" && (
        <section className="missing-fruit-card" aria-labelledby="missing-fruit-complete-title">
          <h1 id="missing-fruit-complete-title">🏆 Challenge Complete!</h1>
          <p className="missing-fruit-subtitle">Final score: {score} · Accuracy: {finalAccuracy}%</p>
          <button className="missing-fruit-button" type="button" onClick={() => { setPhase("menu"); setMode(null); }}>Choose Another Mode</button>
        </section>
      )}
    </main>
  );
}
