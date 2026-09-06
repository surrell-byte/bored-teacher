import { useState, useCallback, useEffect } from "react";
import { useGame } from "@/lib/gameState";

const DATA = {
  easy: [
    { word: "CAT", emoji: "🐱" }, { word: "DOG", emoji: "🐶" },
    { word: "BUS", emoji: "🚌" }, { word: "SUN", emoji: "☀️" },
    { word: "TREE", emoji: "🌳" }, { word: "BIRD", emoji: "🐦" },
    { word: "RAIN", emoji: "🌧️" },
  ],
  medium: [
    { word: "RABBIT", emoji: "🐰" }, { word: "POLICE", emoji: "👮" },
    { word: "ROCKET", emoji: "🚀" }, { word: "FLOWER", emoji: "🌻" },
    { word: "DOCTOR", emoji: "🧑‍⚕️" }, { word: "TIGER", emoji: "🐯" },
  ],
  hard: [
    { word: "SNOWMAN", emoji: "☃️" }, { word: "AIRPLANE", emoji: "✈️" },
    { word: "FOOTBALL", emoji: "⚽" }, { word: "RAINBOW", emoji: "🌈" },
    { word: "SUNFLOWER", emoji: "🌻" },
  ],
};

const LEVEL_COLORS = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function getLetterPool(word) {
  const needed = word.split("");
  const extra = shuffle(ALPHABET.filter(l => !needed.includes(l))).slice(0, Math.max(4, 8 - needed.length));
  return shuffle([...needed, ...extra]);
}

export default function EmojiSpellingMaster({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("start"); // start | game | over
  const [mode, setMode] = useState("spell");
  const [level, setLevel] = useState("easy");
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [typed, setTyped] = useState([]);
  const [letterPool, setLetterPool] = useState([]);
  const [usedPoolIdx, setUsedPoolIdx] = useState(new Set());
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [lives, setLives] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [won, setWon] = useState(false);
  const [missing, setMissing] = useState(null);

  const startGame = useCallback((lvl) => {
    const qs = shuffle(DATA[lvl]);
    setMode("spell");
    setLevel(lvl);
    setQuestions(qs);
    setQIdx(0);
    setScore(0);
    setCorrectCount(0);
    setLives(5);
    setFeedback("");
    setWon(false);
    const pool = getLetterPool(qs[0].word);
    setLetterPool(pool);
    setTyped([]);
    setUsedPoolIdx(new Set());
    setScreen("game");
  }, []);

  const startMissing = useCallback((lvl) => {
    const qs = shuffle(DATA[lvl]);
    setMode("missing");
    setLevel(lvl);
    setQuestions(qs);
    setQIdx(0);
    setScore(0);
    setCorrectCount(0);
    setLives(5);
    setFeedback("");
    setWon(false);
    setMissing({ index: Math.floor(Math.random() * qs[0].word.length), choice: null });
    setScreen("game");
  }, []);

  const current = questions[qIdx] || null;

  const chooseMissing = (letter) => {
    if (!current || !missing || feedback) return;
    const isCorrect = letter === current.word[missing.index];
    setMissing(prev => prev ? { ...prev, choice: letter } : prev);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) setScore(s => s + 10);
    else setLives(value => value - 1);
    setTimeout(() => {
      const nextIdx = qIdx + 1;
      if (nextIdx >= questions.length || (!isCorrect && lives <= 1)) {
        setWon(isCorrect && nextIdx >= questions.length);
        setScreen("over");
        return;
      }
      setQIdx(nextIdx);
      setMissing({ index: Math.floor(Math.random() * questions[nextIdx].word.length), choice: null });
      setFeedback("");
    }, 700);
  };

  const tapLetter = (poolIdx, letter) => {
    if (!current || usedPoolIdx.has(poolIdx) || typed.length >= current.word.length) return;
    const next = [...typed, { letter, poolIdx }];
    setTyped(next);
    setUsedPoolIdx(prev => new Set([...prev, poolIdx]));

    if (next.length === current.word.length) {
      const guessed = next.map(x => x.letter).join("");
      if (guessed === current.word) {
        setFeedback("correct");
        setScore(s => s + 10);
        setCorrectCount(c => c + 1);
        setTimeout(() => {
          setFeedback("");
          const nextIdx = qIdx + 1;
          if (nextIdx >= questions.length) {
            setCorrectCount(final => {
              const accuracy = Math.round((final / questions.length) * 100);
              completeGame('emoji-spelling', accuracy, questions.length);
            onComplete?.(accuracy, questions.length);
              return final;
            });
            setWon(true); setScreen("over");
          } else {
            setQIdx(nextIdx);
            const pool = getLetterPool(questions[nextIdx].word);
            setLetterPool(pool);
            setTyped([]);
            setUsedPoolIdx(new Set());
          }
        }, 900);
      } else {
        setFeedback("wrong");
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setTimeout(() => {
            setCorrectCount(final => {
              const accuracy = Math.round((final / questions.length) * 100);
              completeGame('emoji-spelling', accuracy, questions.length);
            onComplete?.(accuracy, questions.length);
              return final;
            });
            setWon(false); setScreen("over");
          }, 800);
          return;
        }
        setTimeout(() => {
          setFeedback("");
          setTyped([]);
          setUsedPoolIdx(new Set());
        }, 800);
      }
    }
  };

  const removeLast = () => {
    if (!typed.length || feedback) return;
    const last = typed[typed.length - 1];
    setUsedPoolIdx(prev => { const s = new Set(prev); s.delete(last.poolIdx); return s; });
    setTyped(prev => prev.slice(0, -1));
  };

  if (screen === "start") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)",
      fontFamily: "'Segoe UI', sans-serif", color: "#e0e7ff", padding: 24,
    }}>
      <div style={{ fontSize: "3rem", marginBottom: 8 }}>✏️</div>
      <h1 style={{ fontSize: "2.2rem", margin: "0 0 8px", color: "#a5b4fc" }}>Emoji Spelling Master</h1>
      <p style={{ color: "#818cf8", marginBottom: 32 }}>Choose your level!</p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        {["easy","medium","hard"].map(lvl => (
          <button key={lvl} onClick={() => startGame(lvl)} style={{
            padding: "16px 36px", borderRadius: 16, border: "none",
            background: LEVEL_COLORS[lvl], color: "#fff",
            fontWeight: 800, fontSize: "1.2rem", cursor: "pointer",
            boxShadow: `0 4px 20px ${LEVEL_COLORS[lvl]}55`,
            textTransform: "capitalize",
          }}>{lvl}</button>
        ))}
      </div>
      <p style={{ color: "#c4b5fd", margin: "28px 0 12px" }}>Choose the missing letter</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {["easy","medium","hard"].map(lvl => <button key={`missing-${lvl}`} onClick={() => startMissing(lvl)} style={{ padding: "10px 22px", borderRadius: 999, border: "1px solid #818cf8", background: "transparent", color: "#e0e7ff", fontWeight: 700, cursor: "pointer", textTransform: "capitalize" }}>{lvl}</button>)}
      </div>
    </div>
  );

  if (screen === "over") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#1e1b4b,#312e81)",
      fontFamily: "'Segoe UI', sans-serif", color: "#e0e7ff", padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: 12 }}>{won ? "🏆" : "💔"}</div>
      <h2 style={{ fontSize: "2rem", color: won ? "#fbbf24" : "#f87171", marginBottom: 8 }}>
        {won ? "You Won!" : "Game Over!"}
      </h2>
      <p style={{ color: "#a5b4fc", fontSize: "1.2rem", marginBottom: 24 }}>Final Score: {score}</p>
      <div style={{ display: "flex", gap: 12 }}>
        <button onClick={() => (mode === "missing" ? startMissing(level) : startGame(level))} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#6366f1", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🔄 Play Again</button>
        <button onClick={() => setScreen("start")} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#374151", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!current) return null;

  if (mode === "missing") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)", fontFamily: "'Segoe UI', sans-serif", color: "#e0e7ff", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 760, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}><span>{level.toUpperCase()}</span><span style={{ color: "#fbbf24" }}>Score: {score}</span><span>{Array.from({ length: 5 }, (_, i) => i < lives ? "❤️" : "🖤").join("")}</span></div>
        <div style={{ background: "rgba(255,255,255,.08)", borderRadius: 24, padding: 32, border: feedback === "correct" ? "2px solid #22c55e" : feedback === "wrong" ? "2px solid #ef4444" : "2px solid rgba(255,255,255,.1)" }}>
          <div style={{ fontSize: "clamp(4rem, 12vw, 8rem)" }}>{current.emoji}</div>
          <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", letterSpacing: 8 }}>{current.word.split("").map((letter, index) => index === missing.index ? (missing.choice || "_") : letter).join("")}</h2>
          <p>Which letter completes the word?</p>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginTop: 24 }}>{shuffle([current.word[missing.index], ...ALPHABET.filter(letter => letter !== current.word[missing.index])]).slice(0, 5).map((letter, index) => <button key={`${letter}-${index}`} disabled={!!feedback} onClick={() => chooseMissing(letter)} style={{ width: 58, height: 58, borderRadius: 12, border: "none", background: "#4f46e5", color: "white", fontSize: "1.5rem", fontWeight: 800, cursor: "pointer" }}>{letter}</button>)}</div>
          {feedback && <p style={{ color: feedback === "correct" ? "#4ade80" : "#f87171", fontWeight: 700 }}>{feedback === "correct" ? "✅ Correct!" : `❌ The answer is ${current.word[missing.index]}`}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#1e1b4b,#312e81,#1e1b4b)",
      fontFamily: "'Segoe UI', sans-serif", color: "#e0e7ff", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: "min(760px, calc(100vw - 56px))" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ background: LEVEL_COLORS[level], padding: "4px 14px", borderRadius: 999, fontWeight: 700, fontSize: "0.85rem" }}>{level.toUpperCase()}</span>
          <span style={{ color: "#fbbf24", fontWeight: 700 }}>Score: {score}</span>
          <span>{Array.from({ length: 5 }, (_, i) => i < lives ? "❤️" : "🖤").join("")}</span>
        </div>

        <div style={{
          background: "rgba(255,255,255,0.07)", borderRadius: 24, padding: 32,
          textAlign: "center", marginBottom: 20,
          border: feedback === "correct" ? "2px solid #22c55e" : feedback === "wrong" ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{ fontSize: "clamp(3rem, 8vw, 6.5rem)", marginBottom: 16 }}>{current.emoji}</div>
          {/* Slots */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {current.word.split("").map((_, i) => (
              <div key={i} style={{
                width: "clamp(38px, 7vw, 60px)", height: "clamp(44px, 8vw, 68px)", borderRadius: 10, border: "2px solid",
                borderColor: feedback === "correct" ? "#22c55e" : feedback === "wrong" ? "#ef4444" : "#818cf8",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "clamp(1.2rem, 2.4vw, 1.8rem)", fontWeight: 800, color: "#e0e7ff",
                background: "rgba(255,255,255,0.05)",
              }}>
                {typed[i]?.letter || ""}
              </div>
            ))}
          </div>
          {feedback && (
            <p style={{ marginTop: 12, fontWeight: 700, color: feedback === "correct" ? "#4ade80" : "#f87171" }}>
              {feedback === "correct" ? "✅ Correct! +10" : `❌ Wrong! It's ${current.word}`}
            </p>
          )}
        </div>

        {/* Letter pool */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {letterPool.map((letter, i) => (
            <button key={i} onClick={() => tapLetter(i, letter)}
              disabled={usedPoolIdx.has(i) || !!feedback}
              style={{
                width: "clamp(38px, 7vw, 60px)", height: "clamp(38px, 7vw, 60px)", borderRadius: 10, border: "none",
                background: usedPoolIdx.has(i) ? "rgba(255,255,255,0.05)" : "#4f46e5",
                color: usedPoolIdx.has(i) ? "transparent" : "#fff",
                fontWeight: 800, fontSize: "clamp(1.1rem, 2vw, 1.5rem)", cursor: usedPoolIdx.has(i) ? "default" : "pointer",
                transition: "all 0.15s",
              }}>
              {letter}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={removeLast} style={{
            padding: "10px 24px", borderRadius: 12, border: "none",
            background: "#374151", color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>⌫ Back</button>
          <button onClick={() => { setTyped([]); setUsedPoolIdx(new Set()); }} style={{
            padding: "10px 24px", borderRadius: 12, border: "none",
            background: "#374151", color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>🔄 Clear</button>
        </div>
      </div>
    </div>
  );
}
