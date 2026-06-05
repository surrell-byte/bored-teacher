import { useState, useCallback } from "react";

const ALL_FRUITS = [
  { emoji: "🍎", name: "apple" }, { emoji: "🍐", name: "pear" },
  { emoji: "🍌", name: "banana" }, { emoji: "🍊", name: "orange" },
  { emoji: "🍒", name: "cherries" }, { emoji: "🍇", name: "grapes" },
  { emoji: "🥝", name: "kiwi" }, { emoji: "🥭", name: "mango" },
  { emoji: "🍓", name: "strawberry" }, { emoji: "🫐", name: "blueberries" },
  { emoji: "🍍", name: "pineapple" }, { emoji: "🍉", name: "watermelon" },
  { emoji: "🍑", name: "peach" }, { emoji: "🍋", name: "lemon" },
  { emoji: "🍈", name: "melon" }, { emoji: "🥑", name: "avocado" },
];

const LEVELS = [
  { name: "Easy", fruits: ["apple","pear","kiwi","lemon","peach","melon"], extra: 2, required: 5 },
  { name: "Medium", fruits: ["banana","orange","cherries","grapes","avocado"], extra: 3, required: 4 },
  { name: "Hard", fruits: ["strawberry","blueberries","pineapple","watermelon"], extra: 4, required: 4 },
];

const LEVEL_COLORS = ["#22c55e","#f59e0b","#ef4444"];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function randomLetter() { return "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)]; }

function buildTiles(word, extra) {
  const needed = word.split("");
  const extras = Array.from({ length: extra }, randomLetter);
  return shuffle([...needed, ...extras].map((l, i) => ({ letter: l, id: i, used: false })));
}

function getFruit(name) { return ALL_FRUITS.find(f => f.name === name); }

export default function FruitWordHunt() {
  const [screen, setScreen] = useState("menu");
  const [levelIdx, setLevelIdx] = useState(0);
  const [unlocked, setUnlocked] = useState([true, false, false]);
  const [fruitIdx, setFruitIdx] = useState(0);
  const [score, setScore] = useState([0, 0, 0]);
  const [tiles, setTiles] = useState([]);
  const [typed, setTyped] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [levelComplete, setLevelComplete] = useState(false);

  const loadFruit = useCallback((lvlIdx, fIdx, tiles0 = null) => {
    const lvl = LEVELS[lvlIdx];
    const fName = lvl.fruits[fIdx];
    setTiles(tiles0 || buildTiles(fName, lvl.extra));
    setTyped([]);
    setFeedback("");
  }, []);

  const startLevel = useCallback((lvlIdx) => {
    setLevelIdx(lvlIdx);
    setFruitIdx(0);
    setLevelComplete(false);
    loadFruit(lvlIdx, 0);
    setScreen("game");
  }, [loadFruit]);

  const currentLevel = LEVELS[levelIdx];
  const currentFruitName = currentLevel?.fruits[fruitIdx] || "";
  const currentFruit = getFruit(currentFruitName);

  const tapTile = (tileId) => {
    if (feedback === "correct" || feedback === "wrong") return;
    setTiles(prev => prev.map(t => t.id === tileId ? { ...t, used: true } : t));
    const tile = tiles.find(t => t.id === tileId);
    if (!tile || tile.used) return;
    const nextTyped = [...typed, { letter: tile.letter, tileId }];
    setTyped(nextTyped);

    if (nextTyped.length === currentFruitName.length) {
      const guess = nextTyped.map(x => x.letter).join("");
      if (guess === currentFruitName) {
        setFeedback("correct");
        const newScore = score.map((s, i) => i === levelIdx ? s + 10 : s);
        setScore(newScore);
        setTimeout(() => {
          const nextFruitIdx = fruitIdx + 1;
          if (nextFruitIdx >= currentLevel.fruits.length) {
            // Level done
            const nextLvlIdx = levelIdx + 1;
            if (nextLvlIdx < LEVELS.length) setUnlocked(u => u.map((v, i) => i === nextLvlIdx ? true : v));
            setLevelComplete(true);
          } else {
            setFruitIdx(nextFruitIdx);
            loadFruit(levelIdx, nextFruitIdx);
          }
        }, 1000);
      } else {
        setFeedback("wrong");
        setTimeout(() => {
          setTiles(prev => prev.map(t => ({ ...t, used: false })));
          setTyped([]);
          setFeedback("");
        }, 900);
      }
    }
  };

  const removeLast = () => {
    if (!typed.length || feedback) return;
    const last = typed[typed.length - 1];
    setTiles(prev => prev.map(t => t.id === last.tileId ? { ...t, used: false } : t));
    setTyped(prev => prev.slice(0, -1));
  };

  if (screen === "menu") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#fef2f2,#fff7ed,#fef9c3)",
      fontFamily: "'Segoe UI', sans-serif", padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: "3.5rem", marginBottom: 8 }}>🍎</div>
      <h1 style={{ fontSize: "2.2rem", color: "#b91c1c", margin: "0 0 8px" }}>Fruit Word Hunt</h1>
      <p style={{ color: "#dc2626", marginBottom: 32 }}>Spell the fruit from the letter tiles!</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {LEVELS.map((lvl, i) => (
          <button key={i} onClick={() => unlocked[i] && startLevel(i)} style={{
            padding: "16px 32px", borderRadius: 16, border: "none",
            background: unlocked[i] ? LEVEL_COLORS[i] : "#e5e7eb",
            color: unlocked[i] ? "#fff" : "#9ca3af",
            fontWeight: 800, fontSize: "1.1rem", cursor: unlocked[i] ? "pointer" : "not-allowed",
          }}>
            {unlocked[i] ? lvl.name : `🔒 ${lvl.name}`}
          </button>
        ))}
      </div>
    </div>
  );

  if (levelComplete) return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#fef2f2,#fff7ed)",
      fontFamily: "'Segoe UI', sans-serif", padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: 12 }}>🏆</div>
      <h2 style={{ fontSize: "2rem", color: "#b91c1c", marginBottom: 8 }}>{currentLevel.name} Complete!</h2>
      <p style={{ color: "#dc2626", fontSize: "1.2rem", marginBottom: 24 }}>
        Score: {score[levelIdx]} / {currentLevel.fruits.length * 10}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => startLevel(levelIdx)} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#6366f1", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🔄 Retry</button>
        {levelIdx + 1 < LEVELS.length && unlocked[levelIdx + 1] && (
          <button onClick={() => startLevel(levelIdx + 1)} style={{
            padding: "14px 28px", borderRadius: 999, border: "none",
            background: LEVEL_COLORS[levelIdx + 1], color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>➡️ {LEVELS[levelIdx + 1].name}</button>
        )}
        <button onClick={() => setScreen("menu")} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#9ca3af", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!currentFruit) return null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#fef2f2,#fff7ed,#fef9c3)",
      fontFamily: "'Segoe UI', sans-serif", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ background: LEVEL_COLORS[levelIdx], padding: "4px 14px", borderRadius: 999, color: "#fff", fontWeight: 700 }}>{currentLevel.name}</span>
          <span style={{ color: "#b91c1c", fontWeight: 700 }}>🏆 {score[levelIdx]}</span>
          <span style={{ color: "#64748b" }}>{fruitIdx + 1} / {currentLevel.fruits.length}</span>
        </div>

        {/* Fruit display */}
        <div style={{
          background: "#fff", borderRadius: 24, padding: 32, textAlign: "center",
          marginBottom: 20, boxShadow: "0 8px 24px #0001",
          border: feedback === "correct" ? "2px solid #22c55e" : feedback === "wrong" ? "2px solid #ef4444" : "2px solid #fde68a",
        }}>
          <div style={{ fontSize: "5rem", marginBottom: 16 }}>{currentFruit.emoji}</div>
          {/* Blank slots */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
            {currentFruitName.split("").map((_, i) => (
              <div key={i} style={{
                width: 40, height: 46, borderRadius: 8, border: "2px solid",
                borderColor: feedback === "correct" ? "#22c55e" : feedback === "wrong" ? "#ef4444" : "#fbbf24",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1.2rem", fontWeight: 800, color: "#1e293b",
                background: "#fef9c3",
              }}>
                {typed[i]?.letter || ""}
              </div>
            ))}
          </div>
          {feedback && (
            <p style={{ marginTop: 12, fontWeight: 700, color: feedback === "correct" ? "#16a34a" : "#dc2626" }}>
              {feedback === "correct" ? "🎉 Correct!" : `❌ Try again! It's "${currentFruitName}"`}
            </p>
          )}
        </div>

        {/* Tiles */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 16 }}>
          {tiles.map(tile => (
            <button key={tile.id} onClick={() => !tile.used && tapTile(tile.id)}
              disabled={tile.used || !!feedback}
              style={{
                width: 44, height: 44, borderRadius: 10, border: "none",
                background: tile.used ? "#f1f5f9" : "#dc2626",
                color: tile.used ? "transparent" : "#fff",
                fontWeight: 800, fontSize: "1.2rem", cursor: tile.used ? "default" : "pointer",
                boxShadow: tile.used ? "none" : "0 3px 0 #991b1b",
                transform: tile.used ? "translateY(2px)" : "translateY(0)",
                transition: "all 0.1s",
                textTransform: "uppercase",
              }}>
              {tile.letter}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={removeLast} style={{
            padding: "10px 24px", borderRadius: 12, border: "none",
            background: "#94a3b8", color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>⌫ Back</button>
          <button onClick={() => { setTiles(prev => prev.map(t => ({ ...t, used: false }))); setTyped([]); }} style={{
            padding: "10px 24px", borderRadius: 12, border: "none",
            background: "#94a3b8", color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>🔄 Clear</button>
        </div>
      </div>
    </div>
  );
}
