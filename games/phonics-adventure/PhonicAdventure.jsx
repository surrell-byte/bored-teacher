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

export default function PhonicAdventure() {
  const [screen, setScreen] = useState("menu"); // menu | learn | quiz | result
  const [letterIdx, setLetterIdx] = useState(0);
  const [quizMode, setQuizMode] = useState("identify"); // identify | match
  const [quizLetters, setQuizLetters] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
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
    }
  };

  const quizNext = () => {
    if (qIdx + 1 >= quizLetters.length) { setScreen("result"); return; }
    setQIdx(i => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  if (screen === "menu") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#1e3a5f,#1e4976,#1b3f6e)",
      fontFamily:"'Segoe UI', sans-serif", color:"#e0f2fe", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3rem", marginBottom:8 }}>🔤</div>
      <h1 style={{ fontSize:"2.2rem", color:"#7dd3fc", margin:"0 0 4px" }}>Phonics Adventure</h1>
      <p style={{ color:"#93c5fd", marginBottom:32 }}>Learn the alphabet sounds!</p>
      <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:320 }}>
        <button onClick={() => setScreen("learn")} style={{
          padding:"16px 24px", borderRadius:16, border:"none",
          background:"linear-gradient(135deg,#0ea5e9,#0284c7)",
          color:"#fff", fontWeight:800, fontSize:"1rem", cursor:"pointer",
        }}>📖 Learn the Alphabet</button>
        <button onClick={() => startQuiz("identify")} style={{
          padding:"16px 24px", borderRadius:16, border:"none",
          background:"linear-gradient(135deg,#22c55e,#16a34a)",
          color:"#fff", fontWeight:800, fontSize:"1rem", cursor:"pointer",
        }}>🧠 Quiz: Which word starts with?</button>
      </div>
    </div>
  );

  if (screen === "result") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#1e3a5f,#1e4976)",
      fontFamily:"'Segoe UI', sans-serif", color:"#e0f2fe", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>🎉</div>
      <h2 style={{ fontSize:"2rem", color:"#7dd3fc", marginBottom:8 }}>Quiz Complete!</h2>
      <p style={{ color:"#93c5fd", fontSize:"1.3rem", marginBottom:24 }}>Score: {score} / {quizLetters.length * 10}</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startQuiz(quizMode)} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"#0ea5e9", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🔄 Try Again</button>
        <button onClick={() => setScreen("menu")} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"#374151", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  // Learn mode — flip through alphabet
  if (screen === "learn") {
    const bg = BG_COLORS[letterIdx % BG_COLORS.length];
    return (
      <div style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:`linear-gradient(135deg,${bg},${bg}cc)`,
        fontFamily:"'Segoe UI', sans-serif", padding:24,
      }}>
        {/* Letter card */}
        <div style={{
          background:"#fff", borderRadius:32, padding:"32px 40px", textAlign:"center",
          boxShadow:"0 12px 40px #0002", marginBottom:20, minWidth:300,
        }}>
          <div style={{
            fontSize:"5rem", fontWeight:900, color:"#1e3a5f",
            lineHeight:1, marginBottom:8, fontFamily:"monospace",
          }}>{currentLetter}</div>
          <div style={{ fontSize:"4rem", marginBottom:10 }}>{currentData.emoji}</div>
          <div style={{ fontSize:"1.4rem", fontWeight:700, color:"#1e3a5f", marginBottom:4 }}>
            {currentLetter} is for <span style={{ color:"#0284c7" }}>{currentData.word}</span>
          </div>
          <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:16 }}>
            {currentData.extras.map(([w, e]) => (
              <div key={w} style={{
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                background:"#f0f9ff", borderRadius:12, padding:"10px 14px",
              }}>
                <span style={{ fontSize:"2rem" }}>{e}</span>
                <span style={{ fontSize:"0.75rem", color:"#0284c7", fontWeight:600 }}>{w}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <button onClick={() => setLetterIdx(i => Math.max(0, i - 1))} disabled={letterIdx === 0}
            style={{
              padding:"12px 20px", borderRadius:999, border:"none",
              background: letterIdx===0?"#e5e7eb":"#0284c7", color: letterIdx===0?"#9ca3af":"#fff",
              fontWeight:700, cursor:letterIdx===0?"not-allowed":"pointer",
            }}>← Prev</button>
          <span style={{ color:"#374151", fontWeight:700 }}>{letterIdx+1} / 26</span>
          <button onClick={() => setLetterIdx(i => Math.min(25, i + 1))} disabled={letterIdx === 25}
            style={{
              padding:"12px 20px", borderRadius:999, border:"none",
              background: letterIdx===25?"#e5e7eb":"#0284c7", color: letterIdx===25?"#9ca3af":"#fff",
              fontWeight:700, cursor:letterIdx===25?"not-allowed":"pointer",
            }}>Next →</button>
        </div>

        {/* Alphabet quick-nav */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, justifyContent:"center", marginTop:16, maxWidth:480 }}>
          {ALPHABET.map((l, i) => (
            <button key={l} onClick={() => setLetterIdx(i)} style={{
              width:32, height:32, borderRadius:8, border:"none",
              background: i===letterIdx?"#0284c7": completedLetters.has(l)?"#dcfce7":"#f1f5f9",
              color: i===letterIdx?"#fff": completedLetters.has(l)?"#16a34a":"#374151",
              fontWeight:700, fontSize:"0.85rem", cursor:"pointer",
            }}>{l}</button>
          ))}
        </div>

        <button onClick={() => setScreen("menu")} style={{
          marginTop:16, padding:"10px 24px", borderRadius:999, border:"none",
          background:"#94a3b8", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🏠 Menu</button>
      </div>
    );
  }

  // Quiz mode
  if (screen === "quiz" && currentQ) return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#1e3a5f,#1e4976,#1b3f6e)",
      fontFamily:"'Segoe UI', sans-serif", color:"#e0f2fe", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ background:"#0284c7", padding:"4px 14px", borderRadius:999, fontWeight:700 }}>Quiz</span>
          <span style={{ color:"#7dd3fc", fontWeight:700 }}>⭐ {score}</span>
          <span style={{ color:"#93c5fd" }}>{qIdx+1}/{quizLetters.length}</span>
        </div>

        <div style={{ height:6, background:"rgba(255,255,255,0.1)", borderRadius:999, marginBottom:20, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${(qIdx/quizLetters.length)*100}%`, background:"#0ea5e9", borderRadius:999 }} />
        </div>

        <div style={{
          background:"rgba(255,255,255,0.07)", borderRadius:24, padding:"32px 24px", textAlign:"center",
          marginBottom:20, border:"1px solid rgba(255,255,255,0.1)",
        }}>
          <div style={{
            fontSize:"6rem", fontWeight:900, color:"#7dd3fc",
            fontFamily:"monospace", marginBottom:8, lineHeight:1,
          }}>{currentQ.letter}</div>
          <p style={{ color:"#93c5fd", fontSize:"1rem", margin:0 }}>
            Which word starts with the letter <strong style={{color:"#38bdf8"}}>{currentQ.letter}</strong>?
          </p>
          {answered && (
            <p style={{ marginTop:10, fontWeight:700, color:selected===currentQ.letter?"#4ade80":"#f87171" }}>
              {selected===currentQ.letter
                ? `✅ Yes! ${currentQ.correct.emoji} ${currentQ.correct.word}`
                : `❌ It's ${currentQ.correct.emoji} ${currentQ.correct.word}`}
            </p>
          )}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {currentQ.opts.map(opt => {
            const isCorrect = answered && opt.letter === currentQ.letter;
            const isWrong   = answered && opt.letter === selected && opt.letter !== currentQ.letter;
            return (
              <button key={opt.letter} onClick={() => quizAnswer(opt)} style={{
                padding:"16px 12px", borderRadius:14, border:"none",
                cursor:answered?"default":"pointer",
                background: isCorrect?"#166534":isWrong?"#7f1d1d":"rgba(255,255,255,0.08)",
                color: isCorrect?"#4ade80":isWrong?"#fca5a5":"#e0f2fe",
                border:`2px solid ${isCorrect?"#22c55e":isWrong?"#ef4444":"transparent"}`,
                display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                fontWeight:700,
              }}>
                <span style={{ fontSize:"2rem" }}>{opt.emoji}</span>
                <span style={{ fontSize:"0.85rem" }}>{opt.word}</span>
              </button>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign:"center", marginTop:16 }}>
            <button onClick={quizNext} style={{
              padding:"13px 32px", borderRadius:999, border:"none",
              background:"linear-gradient(135deg,#0ea5e9,#0284c7)",
              color:"#fff", fontWeight:800, cursor:"pointer",
            }}>➡️ Next</button>
          </div>
        )}
      </div>
    </div>
  );

  return null;
}
