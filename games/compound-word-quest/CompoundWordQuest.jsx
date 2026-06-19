import { useState, useCallback } from "react";
import { useGame } from "@/lib/gameState";

const LEVELS_DB = {
  1: [
    { p1:"sun",e1:"☀️",p2:"flower",e2:"🌸",a:"sunflower",o:["sunflower","sunlight","sunbeam","sunshine"],hint:"A tall yellow plant that faces the sun",celebration:"🌻" },
    { p1:"tooth",e1:"🦷",p2:"brush",e2:"🧹",a:"toothbrush",o:["toothpaste","toothbrush","toothpick","toothache"],hint:"Use this to clean your teeth",celebration:"🪥" },
    { p1:"rain",e1:"💧",p2:"coat",e2:"👔",a:"raincoat",o:["rainbow","raincoat","raindrop","rainfall"],hint:"Waterproof jacket for wet weather",celebration:"🧥" },
    { p1:"foot",e1:"🦶",p2:"ball",e2:"🔴",a:"football",o:["football","baseball","handball","meatball"],hint:"The most popular sport in the world",celebration:"⚽" },
    { p1:"butter",e1:"🧈",p2:"fly",e2:"🦟",a:"butterfly",o:["butterfly","buttercup","buttertoe","buttermilk"],hint:"A beautiful insect with colorful wings",celebration:"🦋" },
    { p1:"sea",e1:"🌊",p2:"horse",e2:"🐎",a:"seahorse",o:["seahorse","seashell","seabird","seaweed"],hint:"A tiny marine animal that swims upright",celebration:"🐠" },
    { p1:"star",e1:"⭐",p2:"fish",e2:"🐟",a:"starfish",o:["starfish","starlight","starbird","starfruit"],hint:"A five-armed creature found on beaches",celebration:"🌟" },
    { p1:"book",e1:"📚",p2:"worm",e2:"🐛",a:"bookworm",o:["bookworm","bookcase","bookmark","bookshelf"],hint:"Someone who loves to read",celebration:"📖" },
  ],
  2: [
    { p1:"cup",e1:"🥤",p2:"cake",e2:"🍰",a:"cupcake",o:["cupcake","cupboard","teacake","pancake"],hint:"A small single-serving cake",celebration:"🧁" },
    { p1:"fire",e1:"🔥",p2:"place",e2:"🏠",a:"fireplace",o:["fireplace","fireside","fireman","firework"],hint:"A structure for burning wood indoors",celebration:"🏡" },
    { p1:"eye",e1:"👁️",p2:"brow",e2:"🏹",a:"eyebrow",o:["eyebrow","eyelash","eyelid","eyeball"],hint:"Hair above your eye",celebration:"😮" },
    { p1:"sand",e1:"🏖️",p2:"storm",e2:"🌪️",a:"sandstorm",o:["sandstorm","sandcastle","sandbox","sandpaper"],hint:"A whirling mass of sand",celebration:"🌵" },
    { p1:"ear",e1:"👂",p2:"ring",e2:"💍",a:"earring",o:["earring","eardrum","earache","earwax"],hint:"Jewellery for the ear",celebration:"💎" },
    { p1:"snow",e1:"❄️",p2:"flake",e2:"✨",a:"snowflake",o:["snowflake","snowball","snowman","snowboard"],hint:"A single crystal of snow",celebration:"⛄" },
  ],
  3: [
    { p1:"arm",e1:"💪",p2:"chair",e2:"🪑",a:"armchair",o:["armchair","armband","armhole","armpit"],hint:"A comfortable chair with side supports",celebration:"🛋️" },
    { p1:"over",e1:"⬆️",p2:"board",e2:"📋",a:"overboard",o:["overboard","overhead","overture","overall"],hint:"To go too far; also over a ship's side",celebration:"🚢" },
    { p1:"hand",e1:"🖐️",p2:"shake",e2:"🤝",a:"handshake",o:["handshake","handbook","handbag","handmade"],hint:"A greeting with hands",celebration:"🤜" },
    { p1:"under",e1:"⬇️",p2:"cover",e2:"🕵️",a:"undercover",o:["undercover","underway","underline","understand"],hint:"Secret or hidden",celebration:"🎭" },
    { p1:"over",e1:"🌅",p2:"look",e2:"👀",a:"overlook",o:["overlook","overload","overlap","oversee"],hint:"To fail to notice, or a scenic viewpoint",celebration:"🏔️" },
  ],
  4: [
    { p1:"broken",e1:"💔",p2:"heart",e2:"❤️",a:"brokenhearted",o:["brokenhearted","wholehearted","fainthearted","goodhearted"],hint:"Deeply sad due to loss",celebration:"🥺" },
    { p1:"moon",e1:"🌙",p2:"light",e2:"💡",a:"moonlight",o:["moonlight","moonrise","moonwalk","moonbeam"],hint:"The soft glow of the moon",celebration:"✨" },
    { p1:"thunder",e1:"⚡",p2:"storm",e2:"🌧️",a:"thunderstorm",o:["thunderstorm","thunderbolt","thunderclap","thunderous"],hint:"A storm with lightning and thunder",celebration:"🌩️" },
    { p1:"day",e1:"☀️",p2:"dream",e2:"💭",a:"daydream",o:["daydream","daybreak","daytime","daylight"],hint:"Pleasant thoughts while awake",celebration:"🌟" },
  ],
};

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

export default function CompoundWordQuest({ onComplete }) {
  const { completeGame } = useGame();
  const [screen, setScreen] = useState("menu");
  const [level, setLevel] = useState(1);
  const [unlocked, setUnlocked] = useState({ 1: true, 2: false, 3: false, 4: false });
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const startLevel = useCallback((lvl) => {
    setLevel(lvl);
    setQuestions(shuffle(LEVELS_DB[lvl]));
    setIdx(0);
    setScore(0);
    setCorrectCount(0);
    setAnswered(false);
    setSelected(null);
    setShowHint(false);
    setScreen("game");
  }, []);

  const current = questions[idx];

  const answer = (opt) => {
    if (answered) return;
    setSelected(opt);
    setAnswered(true);
    if (opt === current.a) {
      setScore(s => s + 10);
      setCorrectCount(c => c + 1);
    }
  };

  const next = () => {
    if (idx + 1 >= questions.length) {
      const nextLvl = level + 1;
      if (LEVELS_DB[nextLvl]) setUnlocked(u => ({ ...u, [nextLvl]: true }));

      const accuracy = Math.round((correctCount / questions.length) * 100);
      completeGame(
        'compound-quest',
        accuracy,
        questions.length
      );
            onComplete?.(accuracy, questions.length);

      setScreen("complete");
    } else {
      setIdx(i => i + 1);
      setAnswered(false);
      setSelected(null);
      setShowHint(false);
    }
  };

  const LEVEL_COLORS = ["", "#22c55e", "#3b82f6", "#f59e0b", "#ef4444"];

  if (screen === "menu") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#f0f9ff,#e0f2fe,#bae6fd)",
      fontFamily: "'Segoe UI', sans-serif", padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: "3.5rem", marginBottom: 8 }}>🧩</div>
      <h1 style={{ fontSize: "2.2rem", color: "#0369a1", margin: "0 0 8px" }}>Compound Word Quest</h1>
      <p style={{ color: "#0284c7", marginBottom: 32 }}>Combine two words to make one!</p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        {[1,2,3,4].map(lvl => (
          <button key={lvl} onClick={() => unlocked[lvl] && startLevel(lvl)} style={{
            padding: "16px 28px", borderRadius: 16, border: "none",
            background: unlocked[lvl] ? LEVEL_COLORS[lvl] : "#e2e8f0",
            color: unlocked[lvl] ? "#fff" : "#94a3b8",
            fontWeight: 800, fontSize: "1rem", cursor: unlocked[lvl] ? "pointer" : "not-allowed",
            boxShadow: unlocked[lvl] ? `0 4px 16px ${LEVEL_COLORS[lvl]}55` : "none",
          }}>
            {unlocked[lvl] ? `Level ${lvl}` : `🔒 Level ${lvl}`}
          </button>
        ))}
      </div>
    </div>
  );

  if (screen === "complete") return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#f0f9ff,#e0f2fe)",
      fontFamily: "'Segoe UI', sans-serif", padding: 24, textAlign: "center",
    }}>
      <div style={{ fontSize: "4rem", marginBottom: 12 }}>🏆</div>
      <h2 style={{ fontSize: "2rem", color: "#0369a1", marginBottom: 8 }}>Level {level} Complete!</h2>
      <p style={{ color: "#0284c7", fontSize: "1.2rem", marginBottom: 24 }}>
        Score: {score} / {questions.length * 10}
      </p>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={() => startLevel(level)} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#6366f1", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🔄 Retry</button>
        {LEVELS_DB[level + 1] && unlocked[level + 1] && (
          <button onClick={() => startLevel(level + 1)} style={{
            padding: "14px 28px", borderRadius: 999, border: "none",
            background: LEVEL_COLORS[level + 1], color: "#fff", fontWeight: 700, cursor: "pointer",
          }}>➡️ Level {level + 1}</button>
        )}
        <button onClick={() => setScreen("menu")} style={{
          padding: "14px 28px", borderRadius: 999, border: "none",
          background: "#94a3b8", color: "#fff", fontWeight: 700, cursor: "pointer",
        }}>🏠 Menu</button>
      </div>
    </div>
  );

  if (!current) return null;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#f0f9ff,#e0f2fe,#bae6fd)",
      fontFamily: "'Segoe UI', sans-serif", padding: 24,
    }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <span style={{ background: LEVEL_COLORS[level], padding: "4px 14px", borderRadius: 999, color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}>LEVEL {level}</span>
          <span style={{ color: "#0369a1", fontWeight: 700 }}>🏆 Score: {score}</span>
          <span style={{ color: "#64748b" }}>{idx + 1} / {questions.length}</span>
        </div>

        {/* Emoji pair */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 32, marginBottom: 24,
          background: "#fff", borderRadius: 24, padding: "24px 20px",
          boxShadow: "0 8px 24px #0369a122",
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem" }}>{current.e1}</div>
            <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600, marginTop: 4 }}>{current.p1}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", fontSize: "1.8rem", color: "#94a3b8" }}>+</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "3.5rem" }}>{current.e2}</div>
            <div style={{ color: "#64748b", fontSize: "0.85rem", fontWeight: 600, marginTop: 4 }}>{current.p2}</div>
          </div>
        </div>

        {/* Hint */}
        {showHint && (
          <div style={{
            background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 12,
            padding: "10px 16px", marginBottom: 16, color: "#92400e", fontSize: "0.9rem", textAlign: "center",
          }}>💡 {current.hint}</div>
        )}

        {/* Options */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 16 }}>
          {current.o.map(opt => {
            const isCorrect = answered && opt === current.a;
            const isWrong = answered && opt === selected && opt !== current.a;
            return (
              <button key={opt} onClick={() => answer(opt)} style={{
                padding: "12px 20px", borderRadius: 999, border: "none", cursor: answered ? "default" : "pointer",
                fontWeight: 700, fontSize: "1rem", minWidth: 140,
                background: isCorrect ? "#22c55e" : isWrong ? "#ef4444" : "#0369a1",
                color: "#fff",
                boxShadow: isCorrect ? "0 0 12px #22c55e88" : "0 4px 0 " + (isWrong ? "#b91c1c" : "#075985"),
                transform: (isCorrect || isWrong) ? "translateY(2px)" : "translateY(0)",
              }}>{opt}</button>
            );
          })}
        </div>

        {answered && (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontWeight: 700, color: selected === current.a ? "#22c55e" : "#ef4444", fontSize: "1.1rem", margin: "0 0 12px" }}>
              {selected === current.a ? `${current.celebration} Perfect! It's "${current.a}"!` : `The answer was "${current.a}" ${current.celebration}`}
            </p>
            <button onClick={next} style={{
              padding: "14px 32px", borderRadius: 999, border: "none",
              background: "linear-gradient(135deg,#0369a1,#0284c7)",
              color: "#fff", fontWeight: 800, fontSize: "1rem", cursor: "pointer",
            }}>➡️ Next</button>
          </div>
        )}

        {!answered && (
          <div style={{ textAlign: "center" }}>
            <button onClick={() => setShowHint(true)} style={{
              padding: "10px 24px", borderRadius: 999, border: "none",
              background: "#fef3c7", color: "#92400e", fontWeight: 700, cursor: "pointer",
            }}>💡 Show Hint</button>
          </div>
        )}
      </div>
    </div>
  );
}
