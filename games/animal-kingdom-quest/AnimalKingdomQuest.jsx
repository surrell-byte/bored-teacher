import { useState, useCallback } from "react";
import { useGame } from "@/lib/gameState";

const DB = {
  easy: [
    { n: "Frog", e: "🐸", c: "Amphibian", f: "Lives on land and water" },
    { n: "Cat", e: "🐱", c: "Mammal", f: "Has fur and feeds young with milk" },
    { n: "Parrot", e: "🦜", c: "Bird", f: "Can mimic human speech" },
    { n: "Goldfish", e: "🐠", c: "Fish", f: "Breathes through gills" },
    { n: "Snake", e: "🐍", c: "Reptile", f: "Cold-blooded with scales" },
    { n: "Dog", e: "🐶", c: "Mammal", f: "Loyal domestic companion" },
    { n: "Eagle", e: "🦅", c: "Bird", f: "A powerful bird of prey" },
    { n: "Clownfish", e: "🐟", c: "Fish", f: "Lives near sea anemones" },
    { n: "Lizard", e: "🦎", c: "Reptile", f: "Regulates heat using sunlight" },
    { n: "Toad", e: "🐸", c: "Amphibian", f: "Drier skin than a frog" },
  ],
  medium: [
    { n: "Bat", e: "🦇", c: "Mammal", f: "The only flying mammal" },
    { n: "Turtle", e: "🐢", c: "Reptile", f: "Can live over 100 years" },
    { n: "Salamander", e: "🦎", c: "Amphibian", f: "Can regenerate lost limbs" },
    { n: "Shark", e: "🦈", c: "Fish", f: "A cartilaginous fish" },
    { n: "Ostrich", e: "🐦", c: "Bird", f: "Largest bird, cannot fly" },
    { n: "Whale", e: "🐋", c: "Mammal", f: "The largest animal on Earth" },
    { n: "Crocodile", e: "🐊", c: "Reptile", f: "Ancient apex predator" },
    { n: "Tuna", e: "🐟", c: "Fish", f: "A fast, migratory ocean fish" },
    { n: "Penguin", e: "🐧", c: "Bird", f: "Swims but cannot fly" },
    { n: "Axolotl", e: "🦎", c: "Amphibian", f: "Keeps larval features as adult" },
  ],
  hard: [
    { n: "Platypus", e: "🦆", c: "Mammal", f: "Lays eggs but is a mammal" },
    { n: "Tuatara", e: "🦎", c: "Reptile", f: "Living fossil from New Zealand" },
    { n: "Cassowary", e: "🐦", c: "Bird", f: "Dangerous flightless bird" },
    { n: "Lungfish", e: "🐟", c: "Fish", f: "Can breathe air with lungs" },
    { n: "Echidna", e: "🦔", c: "Mammal", f: "Spiny egg-laying mammal" },
    { n: "Caecilian", e: "🐛", c: "Amphibian", f: "Legless amphibian" },
    { n: "Gharial", e: "🐊", c: "Reptile", f: "Narrow-snouted crocodilian" },
    { n: "Kakapo", e: "🦜", c: "Bird", f: "Nocturnal, flightless parrot" },
    { n: "Coelacanth", e: "🐟", c: "Fish", f: "Living fossil fish" },
    { n: "Mudskipper", e: "🐟", c: "Fish", f: "Can walk on land and climb trees" },
  ],
};

const CLASSES = ["Mammal", "Bird", "Reptile", "Amphibian", "Fish"];
const LEVEL_COLORS = { easy: "#22c55e", medium: "#f59e0b", hard: "#ef4444" };

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function AnimalKingdomQuest() {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("menu"); // menu | game | levelUp
  const [level, setLevel] = useState("easy");
  const [unlocked, setUnlocked] = useState({ easy: true, medium: false, hard: false });
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState(null); // null | "correct" | "wrong"
  const [wrongClass, setWrongClass] = useState(null);

  const startLevel = useCallback((lvl) => {
    setLevel(lvl);
    setQuestions(shuffle(DB[lvl]));
    setIdx(0);
    setScore(0);
    setCorrectCount(0);
    setFeedback(null);
    setScreen("game");
  }, []);

  const answer = (cls) => {
    if (feedback) return;
    const current = questions[idx];
    if (cls === current.c) {
      setFeedback("correct");
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
      setTimeout(() => {
        setFeedback(null);
        if (idx + 1 >= questions.length) {
          // level complete
          setCorrectCount(final => {
            const accuracy = Math.round((final / questions.length) * 100);
            completeGame('animal-kingdom', accuracy, questions.length);
            return final;
          });

          const next = level === "easy" ? "medium" : level === "medium" ? "hard" : null;
          if (next) setUnlocked(u => ({ ...u, [next]: true }));
          setScreen("levelUp");
        } else {
          setIdx(i => i + 1);
        }
      }, 900);
    } else {
      setWrongClass(cls);
      setFeedback("wrong");
      setTimeout(() => { setFeedback(null); setWrongClass(null); }, 900);
    }
  };

  if (screen === "menu") {
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#064e3b,#065f46,#047857)",
        fontFamily: "'Segoe UI', sans-serif", padding: 24, color: "#ecfdf5",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: 8 }}>🐾</div>
        <h1 style={{ fontSize: "2.2rem", margin: "0 0 6px", color: "#6ee7b7" }}>Animal Kingdom Quest</h1>
        <p style={{ color: "#a7f3d0", marginBottom: 32 }}>Classify animals into their kingdoms!</p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          {["easy","medium","hard"].map(lvl => (
            <button key={lvl}
              onClick={() => unlocked[lvl] && startLevel(lvl)}
              style={{
                padding: "16px 32px", borderRadius: 16, border: "none",
                background: unlocked[lvl] ? LEVEL_COLORS[lvl] : "#374151",
                color: unlocked[lvl] ? "#fff" : "#9ca3af",
                fontWeight: 800, fontSize: "1.1rem", cursor: unlocked[lvl] ? "pointer" : "not-allowed",
                boxShadow: unlocked[lvl] ? `0 4px 16px ${LEVEL_COLORS[lvl]}66` : "none",
                textTransform: "capitalize",
              }}>
              {unlocked[lvl] ? lvl : "🔒 " + lvl}
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (screen === "levelUp") {
    const next = level === "easy" ? "medium" : level === "medium" ? "hard" : null;
    return (
      <div style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "linear-gradient(135deg,#064e3b,#065f46)",
        fontFamily: "'Segoe UI', sans-serif", padding: 24, color: "#ecfdf5",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "4rem", marginBottom: 12 }}>🏆</div>
        <h2 style={{ fontSize: "2rem", color: "#fbbf24", marginBottom: 8 }}>Level Complete!</h2>
        <p style={{ color: "#a7f3d0", fontSize: "1.2rem", marginBottom: 24 }}>Score: {score} / {questions.length * 10}</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => startLevel(level)} style={{
            padding: "14px 28px", borderRadius: 999, border: "none",
            background: "#6366f1", color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>🔄 Retry</button>
          {next && <button onClick={() => startLevel(next)} style={{
            padding: "14px 28px", borderRadius: 999, border: "none",
            background: LEVEL_COLORS[next], color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>➡️ Next Level</button>}
          <button onClick={() => setScreen("menu")} style={{
            padding: "14px 28px", borderRadius: 999, border: "none",
            background: "#374151", color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>🏠 Menu</button>
        </div>
      </div>
    );
  }

  const current = questions[idx];
  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#064e3b,#065f46,#047857)",
      fontFamily: "'Segoe UI', sans-serif", padding: 24, color: "#ecfdf5",
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ background: LEVEL_COLORS[level], padding: "4px 14px", borderRadius: 999, fontWeight: 700, fontSize: "0.85rem" }}>{level.toUpperCase()}</span>
          <span style={{ color: "#fbbf24", fontWeight: 700 }}>Score: {score}</span>
          <span style={{ color: "#a7f3d0" }}>{idx + 1} / {questions.length}</span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 6, background: "#064e3b", borderRadius: 999, marginBottom: 24, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((idx) / questions.length) * 100}%`, background: "#34d399", borderRadius: 999, transition: "width 0.3s" }} />
        </div>

        {/* Animal card */}
        <div style={{
          background: "rgba(255,255,255,0.08)", borderRadius: 24, padding: 32,
          textAlign: "center", marginBottom: 24, backdropFilter: "blur(4px)",
          border: feedback === "correct" ? "2px solid #22c55e" : feedback === "wrong" ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.1)",
          transition: "border 0.2s",
        }}>
          <div style={{ fontSize: "5rem", marginBottom: 12 }}>{current.e}</div>
          <h2 style={{ fontSize: "2rem", margin: "0 0 8px", color: "#6ee7b7" }}>{current.n}</h2>
          <p style={{ color: "#a7f3d0", margin: 0, fontSize: "0.95rem" }}>{current.f}</p>
        </div>

        {/* Answer buttons */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {CLASSES.map(cls => {
            const isWrong = feedback === "wrong" && wrongClass === cls;
            const isCorrect = feedback === "correct" && cls === current.c;
            return (
              <button key={cls} onClick={() => answer(cls)} style={{
                padding: "14px 20px", borderRadius: 14, border: "none", cursor: "pointer",
                fontWeight: 700, fontSize: "1rem",
                background: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "rgba(255,255,255,0.12)",
                color: "#fff",
                transform: isCorrect || isWrong ? "scale(0.96)" : "scale(1)",
                transition: "all 0.15s",
                gridColumn: CLASSES.length % 2 !== 0 && cls === CLASSES[CLASSES.length - 1] ? "1 / -1" : "auto",
              }}>{cls}</button>
            );
          })}
        </div>

        {feedback && (
          <p style={{
            textAlign: "center", marginTop: 16, fontWeight: 700, fontSize: "1.1rem",
            color: feedback === "correct" ? "#4ade80" : "#f87171",
          }}>
            {feedback === "correct" ? "✅ Correct! +10 pts" : `❌ Wrong! It's a ${current.c}`}
          </p>
        )}
      </div>
    </div>
  );
}
