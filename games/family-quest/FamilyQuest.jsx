import { useState, useCallback } from "react";
import { useGame } from "@/lib/gameState";

const FAMILY = [
  { word:"grandfather", emoji:"👴", q:"Who is he?",      desc:"I am your mother's father." },
  { word:"grandmother", emoji:"👵", q:"Who is she?",     desc:"I am your father's mother." },
  { word:"father",      emoji:"👨", q:"Who is he?",      desc:"I am your male parent." },
  { word:"mother",      emoji:"👩", q:"Who is she?",     desc:"I am your female parent." },
  { word:"sister",      emoji:"👧", q:"Who is she?",     desc:"I am your female sibling." },
  { word:"brother",     emoji:"👦", q:"Who is he?",      desc:"I am your male sibling." },
  { word:"uncle",       emoji:"🧔", q:"Who is he?",      desc:"I am your dad's brother." },
  { word:"aunt",        emoji:"👩‍🦰", q:"Who is she?",    desc:"I am your mom's sister." },
  { word:"cousins",     emoji:"👫", q:"Who are they?",   desc:"We are your uncle's children." },
];

const TREE_LAYOUT = [
  // [word, col, row] — grid positioning for the family tree visual
  ["grandfather", 1, 0], ["grandmother", 2, 0],
  ["uncle", 0, 1], ["father", 1, 1], ["mother", 2, 1], ["aunt", 3, 1],
  ["brother", 0, 2], ["cousins", 1, 2], ["sister", 2, 2],
];

const MODES = [
  { id:"mcq",    label:"🏆 Quiz Mode",    desc:"Multiple choice questions" },
  { id:"spell",  label:"✏️ Spell It",     desc:"Type the family word" },
  { id:"tree",   label:"🌳 Family Tree",  desc:"Match emoji to the tree" },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function getOptions(correct) {
  const others = shuffle(FAMILY.filter(f => f.word !== correct)).slice(0, 3);
  return shuffle([FAMILY.find(f => f.word === correct), ...others]);
}

function Tile({ member, onClick, revealed, correct, wrong, dimmed }) {
  return (
    <div onClick={onClick} style={{
      width:72, height:72, borderRadius:16, cursor:onClick?"pointer":"default",
      display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
      background: correct?"rgba(34,197,94,0.2)": wrong?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.06)",
      border:`2px solid ${correct?"#22c55e":wrong?"#ef4444":"rgba(255,255,255,0.1)"}`,
      opacity: dimmed ? 0.35 : 1,
      transition:"all 0.2s",
      boxShadow: correct?"0 0 14px #22c55e44":"none",
    }}>
      <span style={{ fontSize:"1.8rem" }}>{member.emoji}</span>
      {revealed && <span style={{ fontSize:"0.55rem", color:"#94a3b8", marginTop:2 }}>{member.word}</span>}
    </div>
  );
}

export default function FamilyQuest({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("menu"); // menu | mode | mcq | spell | tree | result
  const [mode, setMode] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [spellInput, setSpellInput] = useState("");
  const [spellResult, setSpellResult] = useState(null);
  // Tree mode
  const [treeTarget, setTreeTarget] = useState(null);
  const [treeMatched, setTreeMatched] = useState(new Set());
  const [treeFeedback, setTreeFeedback] = useState(null);

  const startMode = useCallback((m) => {
    setMode(m);
    setScore(0);
    setCombo(0);
    setCorrectCount(0);
    setQIdx(0);
    setSelected(null);
    setAnswered(false);
    setSpellInput("");
    setSpellResult(null);
    if (m === "tree") {
      setTreeTarget(null);
      setTreeMatched(new Set());
      setTreeFeedback(null);
      setScreen("tree");
    } else {
      setQuestions(shuffle(FAMILY));
      setScreen(m);
    }
  }, []);

  const current = questions[qIdx];

  // MCQ
  const mcqAnswer = (word) => {
    if (answered) return;
    setSelected(word);
    setAnswered(true);
    if (word === current.word) {
      setScore(s => s + 10 + (combo >= 2 ? 5 : 0));
      setCombo(c => c + 1);
      setCorrectCount(c => c + 1);
    } else {
      setCombo(0);
    }
  };
  const mcqNext = () => {
    if (qIdx + 1 >= questions.length) {
      setCorrectCount(final => {
        const accuracy = Math.round((final / questions.length) * 100);
        completeGame('family-quest', accuracy, questions.length);
            onComplete?.(accuracy, questions.length);
        return final;
      });
      setScreen("result"); return; 
    }
    setQIdx(i => i + 1);
    setSelected(null);
    setAnswered(false);
  };

  // Spell
  const spellCheck = () => {
    const correct = spellInput.trim().toLowerCase() === current.word;
    setSpellResult(correct ? "correct" : "wrong");
    if (correct) { setScore(s => s + 15); setCombo(c => c + 1); setCorrectCount(c => c + 1); }
    else setCombo(0);
    setTimeout(() => {
      if (qIdx + 1 >= questions.length) {
        setCorrectCount(final => {
          const accuracy = Math.round((final / questions.length) * 100);
          completeGame('family-quest', accuracy, questions.length);
            onComplete?.(accuracy, questions.length);
          return final;
        });
        setScreen("result"); return;
      }
      setQIdx(i => i + 1);
      setSpellInput("");
      setSpellResult(null);
    }, 1000);
  };

  // Tree mode
  const treeClick = (member) => {
    if (treeMatched.has(member.word)) return;
    if (!treeTarget) {
      setTreeTarget(member);
    } else if (treeTarget.word === member.word) {
      // deselect
      setTreeTarget(null);
    } else {
      // try to match target description to this slot
      setTreeFeedback("wrong");
      setTimeout(() => {
        setTreeTarget(member);
        setTreeFeedback(null);
      }, 500);
    }
  };

  // In tree mode we show a desc and user clicks the matching emoji
  const [treeDescIdx, setTreeDescIdx] = useState(0);
  const treeQueue = questions.length ? questions : shuffle([...FAMILY]);

  const treeGuess = (member) => {
    const target = treeQueue[treeDescIdx];
    if (member.word === target.word) {
      const next = new Set([...treeMatched, member.word]);
      setTreeMatched(next);
      setTreeFeedback("correct");
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
      setTimeout(() => {
        setTreeFeedback(null);
        if (treeDescIdx + 1 >= FAMILY.length) { 
          setCorrectCount(final => {
            const accuracy = Math.round((final / FAMILY.length) * 100);
            completeGame('family-quest', accuracy, FAMILY.length);
            onComplete?.(accuracy, FAMILY.length);
            return final;
          });
          setScreen("result"); 
        }
        else setTreeDescIdx(i => i + 1);
      }, 700);
    } else {
      setTreeFeedback("wrong");
      setTimeout(() => setTreeFeedback(null), 700);
    }
  };

  if (screen === "menu") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#fef3c7,#fde68a,#fef9c3)",
      fontFamily:"'Segoe UI', sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"3.5rem", marginBottom:8 }}>👨‍👩‍👧‍👦</div>
      <h1 style={{ fontSize:"2.2rem", color:"#92400e", margin:"0 0 8px" }}>Family Quest</h1>
      <p style={{ color:"#b45309", marginBottom:32 }}>Learn family member words!</p>
      <div style={{ display:"flex", flexDirection:"column", gap:12, width:"100%", maxWidth:"min(640px, calc(100vw - 56px))" }}>
        {MODES.map(m => (
          <button key={m.id} onClick={() => startMode(m.id)} style={{
            padding:"16px 24px", borderRadius:18, border:"none",
            background:"linear-gradient(135deg,#f59e0b,#d97706)",
            color:"#fff", fontWeight:800, fontSize:"1rem", cursor:"pointer",
            boxShadow:"0 4px 12px #f59e0b44",
            display:"flex", flexDirection:"column", alignItems:"center",
          }}>
            <div>{m.label}</div>
            <div style={{ fontSize:"0.8rem", opacity:0.8, marginTop:2 }}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "result") return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#fef3c7,#fde68a)",
      fontFamily:"'Segoe UI', sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:8 }}>🏆</div>
      <h2 style={{ fontSize:"2rem", color:"#92400e", marginBottom:8 }}>Well done!</h2>
      <p style={{ color:"#b45309", fontSize:"1.3rem", marginBottom:24 }}>Score: {score}</p>
      <div style={{ display:"flex", gap:12, flexWrap:"wrap", justifyContent:"center" }}>
        <button onClick={() => startMode(mode)} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"#f59e0b", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🔄 Play Again</button>
        <button onClick={() => setScreen("menu")} style={{
          padding:"14px 28px", borderRadius:999, border:"none",
          background:"#9ca3af", color:"#fff", fontWeight:700, cursor:"pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  // MCQ Mode
  if (screen === "mcq" && current) {
    const opts = getOptions(current.word);
    return (
      <div style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:"linear-gradient(135deg,#fef3c7,#fde68a,#fef9c3)",
        fontFamily:"'Segoe UI', sans-serif", padding:24,
      }}>
        <div style={{ width:"100%", maxWidth:"min(760px, calc(100vw - 56px))" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ background:"#f59e0b", color:"#fff", padding:"4px 14px", borderRadius:999, fontWeight:700 }}>Quiz</span>
            <span style={{ color:"#92400e", fontWeight:700 }}>🏆 {score}</span>
            <span style={{ color:"#b45309" }}>{qIdx+1}/{questions.length}</span>
          </div>
          {combo >= 2 && <div style={{ textAlign:"center", color:"#f97316", fontWeight:700, marginBottom:8 }}>🔥 {combo} combo!</div>}

          <div style={{
            background:"#fff", borderRadius:24, padding:"32px 24px", textAlign:"center",
            marginBottom:20, boxShadow:"0 8px 24px #f59e0b22",
          }}>
            <div style={{ fontSize:"clamp(3.2rem, 8vw, 6.5rem)", marginBottom:10 }}>{current.emoji}</div>
            <p style={{ color:"#92400e", fontWeight:700, fontSize:"1.1rem", marginBottom:4 }}>{current.desc}</p>
            <p style={{ color:"#b45309" }}>{current.q}</p>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {opts.map(opt => {
              const isCorrect = answered && opt.word === current.word;
              const isWrong   = answered && opt.word === selected && opt.word !== current.word;
              return (
                <button key={opt.word} onClick={() => mcqAnswer(opt.word)} style={{
                  padding:"14px 20px", borderRadius:14,
                  cursor:answered?"default":"pointer",
                  fontWeight:700, fontSize:"1rem",
                  background: isCorrect?"#166534":isWrong?"#7f1d1d":"rgba(245,158,11,0.1)",
                  color: isCorrect?"#4ade80":isWrong?"#fca5a5":"#92400e",
                  border:`2px solid ${isCorrect?"#22c55e":isWrong?"#ef4444":"#fde68a"}`,
                  display:"flex", alignItems:"center", gap:10,
                }}>
                  <span style={{ fontSize:"1.4rem" }}>{opt.emoji}</span>
                  {opt.word}
                </button>
              );
            })}
          </div>

          {answered && (
            <div style={{ textAlign:"center", marginTop:16 }}>
              <p style={{ color:selected===current.word?"#16a34a":"#dc2626", fontWeight:700, marginBottom:10 }}>
                {selected===current.word ? "✅ Correct!" : `❌ It's "${current.word}"`}
              </p>
              <button onClick={mcqNext} style={{
                padding:"13px 32px", borderRadius:999, border:"none",
                background:"linear-gradient(135deg,#f59e0b,#d97706)",
                color:"#fff", fontWeight:800, cursor:"pointer",
              }}>➡️ Next</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Spell Mode
  if (screen === "spell" && current) return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#fef3c7,#fde68a,#fef9c3)",
      fontFamily:"'Segoe UI', sans-serif", padding:24,
    }}>
      <div style={{ width:"100%", maxWidth:"min(760px, calc(100vw - 56px))" }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
          <span style={{ background:"#f59e0b", color:"#fff", padding:"4px 14px", borderRadius:999, fontWeight:700 }}>Spell It</span>
          <span style={{ color:"#92400e", fontWeight:700 }}>🏆 {score}</span>
          <span style={{ color:"#b45309" }}>{qIdx+1}/{questions.length}</span>
        </div>

        <div style={{
          background:"#fff", borderRadius:24, padding:"32px 24px", textAlign:"center",
          marginBottom:20, boxShadow:"0 8px 24px #f59e0b22",
          border:`2px solid ${spellResult==="correct"?"#22c55e":spellResult==="wrong"?"#ef4444":"#fde68a"}`,
        }}>
          <div style={{ fontSize:"clamp(3.2rem, 8vw, 6.5rem)", marginBottom:10 }}>{current.emoji}</div>
          <p style={{ color:"#92400e", fontSize:"1.1rem", fontWeight:600 }}>{current.desc}</p>
          {spellResult && (
            <p style={{ color:spellResult==="correct"?"#16a34a":"#dc2626", fontWeight:700, marginTop:8 }}>
              {spellResult==="correct" ? "✅ Correct!" : `❌ "${current.word}"`}
            </p>
          )}
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <input
            value={spellInput}
            onChange={e => setSpellInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && spellCheck()}
            placeholder="Type the family word..."
            disabled={!!spellResult}
            style={{
              flex:1, padding:"14px 18px", borderRadius:14, border:"2px solid #fde68a",
              fontSize:"1rem", background:"#fff", color:"#92400e",
              outline:"none",
            }}
          />
          <button onClick={spellCheck} disabled={!!spellResult || !spellInput.trim()} style={{
            padding:"14px 20px", borderRadius:14, border:"none",
            background:"#f59e0b", color:"#fff", fontWeight:800, cursor:"pointer",
          }}>✓</button>
        </div>
      </div>
    </div>
  );

  // Tree Mode
  if (screen === "tree") {
    const target = treeQueue[treeDescIdx] || treeQueue[0];
    return (
      <div style={{
        minHeight:"100vh", display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        background:"linear-gradient(135deg,#fef3c7,#fde68a,#fef9c3)",
        fontFamily:"'Segoe UI', sans-serif", padding:24,
      }}>
        <div style={{ width:"100%", maxWidth:"min(760px, calc(100vw - 56px))" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
            <span style={{ background:"#f59e0b", color:"#fff", padding:"4px 14px", borderRadius:999, fontWeight:700 }}>Family Tree</span>
            <span style={{ color:"#92400e", fontWeight:700 }}>🏆 {score}</span>
            <span style={{ color:"#b45309" }}>{treeDescIdx+1}/{FAMILY.length}</span>
          </div>

          {/* Clue */}
          <div style={{
            background:"#fff", borderRadius:20, padding:"16px 24px", textAlign:"center",
            marginBottom:20, boxShadow:"0 4px 16px #f59e0b22",
            border:`2px solid ${treeFeedback==="correct"?"#22c55e":treeFeedback==="wrong"?"#ef4444":"#fde68a"}`,
          }}>
            <p style={{ color:"#92400e", fontWeight:700, fontSize:"1.1rem", margin:0 }}>
              "{target.desc}"
            </p>
            <p style={{ color:"#b45309", fontSize:"0.9rem", margin:"6px 0 0" }}>{target.q}</p>
          </div>

          {/* Family grid */}
          <div style={{
            display:"grid", gridTemplateColumns:"repeat(4, 1fr)",
            gap:10, justifyItems:"center",
          }}>
            {FAMILY.map(member => {
              const matched = treeMatched.has(member.word);
              return (
                <div key={member.word} onClick={() => !matched && treeGuess(member)}
                  style={{
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                    cursor:matched?"default":"pointer",
                  }}>
                  <div style={{
                    width:"clamp(56px, 12vw, 100px)", height:"clamp(56px, 12vw, 100px)", borderRadius:14,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:"clamp(1.8rem, 3.6vw, 2.8rem)",
                    background: matched?"rgba(34,197,94,0.15)":"rgba(255,255,255,0.8)",
                    border:`2px solid ${matched?"#22c55e":"#fde68a"}`,
                    opacity: matched ? 0.5 : 1,
                    boxShadow: matched?"0 0 10px #22c55e33":"none",
                  }}>{member.emoji}</div>
                  {matched && <span style={{ fontSize:"0.6rem", color:"#16a34a", fontWeight:700 }}>{member.word}</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
