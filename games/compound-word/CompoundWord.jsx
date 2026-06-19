import { useState, useCallback } from "react";
import { useGame } from "@/lib/gameState";

const QUESTIONS = [
  { e1:"☀️", w1:"sun", e2:"🌸", w2:"flower", answer:"sunflower", options:["sunflower","sunlight","sunbeam","sunhat"], hint:"A tall plant that faces the sun" },
  { e1:"🦷", w1:"tooth", e2:"🪥", w2:"brush", answer:"toothbrush", options:["toothpaste","toothbrush","toothpick","toothache"], hint:"Keeps your teeth clean" },
  { e1:"💧", w1:"rain", e2:"🌈", w2:"bow", answer:"rainbow", options:["rainbow","raincoat","raindrop","rainfall"], hint:"Colorful arc in the sky after rain" },
  { e1:"👣", w1:"foot", e2:"⚽", w2:"ball", answer:"football", options:["football","baseball","handball","meatball"], hint:"The world's most popular sport" },
  { e1:"🧈", w1:"butter", e2:"🦋", w2:"fly", answer:"butterfly", options:["butterfly","buttercup","butterscotch","buttermilk"], hint:"Beautiful winged insect" },
  { e1:"🌊", w1:"sea", e2:"🐚", w2:"shell", answer:"seashell", options:["seahorse","seashell","seabird","seaweed"], hint:"Found on the beach" },
  { e1:"⭐", w1:"star", e2:"🐟", w2:"fish", answer:"starfish", options:["starfish","starlight","starbird","starfruit"], hint:"Five-armed sea creature" },
  { e1:"📚", w1:"book", e2:"🐛", w2:"worm", answer:"bookworm", options:["bookworm","bookcase","bookmark","bookshelf"], hint:"Someone who loves reading" },
  { e1:"🧁", w1:"cup", e2:"🍰", w2:"cake", answer:"cupcake", options:["cupcake","pancake","teacake","cheesecake"], hint:"Single-serving small cake" },
  { e1:"🔥", w1:"fire", e2:"🏠", w2:"place", answer:"fireplace", options:["fireplace","fireside","fireman","firework"], hint:"Burns wood indoors to keep warm" },
  { e1:"❄️", w1:"snow", e2:"✨", w2:"flake", answer:"snowflake", options:["snowflake","snowball","snowman","snowboard"], hint:"Each one is unique, like ice crystals" },
  { e1:"🌙", w1:"moon", e2:"💡", w2:"light", answer:"moonlight", options:["moonlight","moonrise","moonwalk","moonbeam"], hint:"The soft glow at night" },
  { e1:"🌧️", w1:"thunder", e2:"⛈️", w2:"storm", answer:"thunderstorm", options:["thunderstorm","thunderbolt","thunderclap","thunder"], hint:"Storm with lightning and sound" },
  { e1:"🤝", w1:"hand", e2:"🫱", w2:"shake", answer:"handshake", options:["handshake","handbook","handbag","handmade"], hint:"A formal greeting" },
  { e1:"🌅", w1:"day", e2:"💭", w2:"dream", answer:"daydream", options:["daydream","daybreak","daytime","daylight"], hint:"Pleasant thoughts while awake" },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function CompoundWord({ onComplete }) {
  const { completeGame } = useGame();
  const [questions] = useState(() => shuffle(QUESTIONS));
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [done, setDone] = useState(false);

  const current = questions[idx];

  const answer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.answer) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
    }
  };

  const next = useCallback(() => {
    if (idx + 1 >= questions.length) {
      const accuracy = Math.round((correctCount / questions.length) * 100);
      completeGame('compound-word', accuracy, questions.length);
            onComplete?.(accuracy, questions.length);
      setDone(true);
      return;
    }
    setIdx(i => i + 1);
    setSelected(null);
    setAnswered(false);
    setShowHint(false);
  }, [idx, questions.length, correctCount, completeGame]);

  const restart = () => {
    setIdx(0); setScore(0); setCorrectCount(0); setSelected(null);
    setAnswered(false); setShowHint(false); setDone(false);
  };

  if (done) return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#ecfdf5,#d1fae5,#a7f3d0)",
      fontFamily:"'Segoe UI', sans-serif", padding:24, textAlign:"center",
    }}>
      <div style={{ fontSize:"4rem", marginBottom:12 }}>🏆</div>
      <h2 style={{ fontSize:"2.2rem", color:"#065f46", marginBottom:8 }}>All Done!</h2>
      <p style={{ color:"#059669", fontSize:"1.3rem", marginBottom:24 }}>
        Score: {score} / {questions.length * 10}
      </p>
      <button onClick={restart} style={{
        padding:"14px 36px", borderRadius:999, border:"none",
        background:"linear-gradient(135deg,#059669,#047857)",
        color:"#fff", fontWeight:800, fontSize:"1.1rem", cursor:"pointer",
      }}>🔄 Play Again</button>
    </div>
  );

  return (
    <div style={{
      minHeight:"100vh", display:"flex", flexDirection:"column",
      alignItems:"center", justifyContent:"center",
      background:"linear-gradient(135deg,#ecfdf5,#d1fae5,#a7f3d0)",
      fontFamily:"'Segoe UI', sans-serif", padding:24,
    }}>
      <h1 style={{ fontSize:"2rem", color:"#065f46", margin:"0 0 4px" }}>🧩 Compound Words</h1>
      <div style={{ display:"flex", gap:20, marginBottom:20, color:"#059669" }}>
        <span>🏆 <strong>{score}</strong></span>
        <span>{idx + 1} / {questions.length}</span>
      </div>

      {/* Progress */}
      <div style={{ width:"100%", maxWidth:500, height:6, background:"#a7f3d0", borderRadius:999, marginBottom:24, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${(idx/questions.length)*100}%`, background:"#059669", borderRadius:999, transition:"width 0.3s" }} />
      </div>

      {/* Cards */}
      <div style={{
        display:"flex", gap:16, alignItems:"center", justifyContent:"center",
        background:"#fff", borderRadius:24, padding:"24px 32px",
        boxShadow:"0 8px 32px #06b48a22", marginBottom:20,
      }}>
        {[{ e: current.e1, w: current.w1 }, { e: current.e2, w: current.w2 }].map((part, i) => (
          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
            {i === 1 && <span style={{ fontSize:"1.5rem", color:"#94a3b8", margin:"0 8px" }}>+</span>}
            <div style={{
              width:80, height:80, borderRadius:20, background:"#f0fdf4",
              border:"2px solid #86efac", display:"flex", alignItems:"center",
              justifyContent:"center", fontSize:"2.8rem",
            }}>{part.e}</div>
            <span style={{ color:"#4b5563", fontWeight:600, fontSize:"0.9rem" }}>{part.w}</span>
          </div>
        ))}
      </div>

      {/* Hint */}
      {showHint && (
        <div style={{
          background:"#fef9c3", border:"1px solid #fde047", borderRadius:12,
          padding:"10px 20px", marginBottom:16, color:"#713f12", maxWidth:500, textAlign:"center",
        }}>💡 {current.hint}</div>
      )}

      {/* Options */}
      <div style={{ display:"flex", flexWrap:"wrap", gap:10, justifyContent:"center", marginBottom:16, maxWidth:500 }}>
        {current.options.map(opt => {
          const isCorrect = answered && opt === current.answer;
          const isWrong = answered && opt === selected && opt !== current.answer;
          return (
            <button key={opt} onClick={() => answer(opt)} style={{
              padding:"12px 22px", borderRadius:999, border:"2px solid",
              borderColor: isCorrect?"#22c55e": isWrong?"#ef4444":"#86efac",
              background: isCorrect?"#22c55e": isWrong?"#ef4444":"#fff",
              color: isCorrect||isWrong?"#fff":"#065f46",
              fontWeight:700, fontSize:"1rem", cursor: answered?"default":"pointer",
              transition:"all 0.15s",
            }}>{opt}</button>
          );
        })}
      </div>

      {answered ? (
        <div style={{ textAlign:"center" }}>
          <p style={{ fontWeight:700, marginBottom:12, color: selected===current.answer?"#059669":"#dc2626", fontSize:"1.1rem" }}>
            {selected===current.answer ? `🎉 "${current.answer}"!` : `The word was "${current.answer}"`}
          </p>
          <button onClick={next} style={{
            padding:"13px 32px", borderRadius:999, border:"none",
            background:"linear-gradient(135deg,#059669,#047857)",
            color:"#fff", fontWeight:800, cursor:"pointer",
          }}>➡️ Next</button>
        </div>
      ) : (
        <button onClick={() => setShowHint(true)} style={{
          padding:"10px 24px", borderRadius:999, border:"none",
          background:"#fef9c3", color:"#713f12", fontWeight:700, cursor:"pointer",
        }}>💡 Hint</button>
      )}
    </div>
  );
}
