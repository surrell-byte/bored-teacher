import { useState } from "react";
import {
  createEmojiCategoryRound,
  createEmojiWordQuestions,
  EMOJI_CATEGORIES,
  EMOJI_SORT_DIFFICULTIES,
} from "./emoji-category-data.mjs";

const STYLES = `
.ecs-root{--ecs-ink:#26344a;--ecs-orange:#ff9f0a;--ecs-blue:#5589e8;min-height:100%;height:100%;overflow:auto;padding:clamp(12px,3vw,30px);display:flex;align-items:center;justify-content:center;background:linear-gradient(180deg,#ffedbf 0%,#ffe1a0 42%,#ffc96b 100%);color:var(--ecs-ink);font-family:system-ui,-apple-system,"Segoe UI",sans-serif}
.ecs-panel{width:min(100%,1060px);padding:clamp(18px,3vw,34px);border:8px solid #d99e55;border-radius:22px;background:#fffdf7;box-shadow:inset 0 0 0 4px #ffe2aa,0 16px 36px #85521f40}
.ecs-heading{width:fit-content;max-width:100%;margin:0 auto 24px;padding:8px clamp(22px,6vw,72px);border-radius:0 0 18px 18px;background:#ff9f00;color:#fff;text-align:center;font-size:clamp(1.8rem,5vw,3.5rem);font-weight:900;line-height:1.05}
.ecs-subtitle{margin:0 auto 22px;max-width:650px;color:#4b5870;text-align:center;font-size:clamp(1rem,2.2vw,1.2rem);line-height:1.5}
.ecs-actions{display:flex;justify-content:center;align-items:center;gap:12px;flex-wrap:wrap;margin-top:24px}
.ecs-button{min-height:50px;padding:11px 22px;border:2px solid #fff;border-radius:14px;background:#4b76d1;box-shadow:0 4px 0 #294da2;color:#fff;font-family:inherit;font-size:1rem;font-weight:800;line-height:1.2;cursor:pointer;touch-action:manipulation}
.ecs-button:hover{background:#355fb9}.ecs-button:active{transform:translateY(2px);box-shadow:0 2px 0 #294da2}.ecs-button.secondary{border-color:#d8e0ee;background:#fff;color:#31415a;box-shadow:0 4px 0 #c5cfdf}.ecs-button.secondary:hover{background:#eef4ff}
.ecs-hero-emoji{display:flex;justify-content:center;gap:clamp(12px,4vw,38px);margin:18px 0;font-size:clamp(2.8rem,10vw,6rem)}
.ecs-name-form{display:grid;justify-items:center;gap:12px}.ecs-name-form label{font-weight:800}.ecs-name-form input{width:min(100%,380px);min-height:50px;padding:10px 14px;border:2px solid #c4d0e2;border-radius:12px;font:inherit;font-size:1.1rem}.ecs-name-form input:focus{outline:3px solid #8ab6ff;outline-offset:2px}
.ecs-difficulty-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;margin:24px auto;max-width:800px}.ecs-difficulty{min-height:128px;padding:18px 12px;border:3px solid #e0e7f1;border-radius:18px;background:#fff;color:var(--ecs-ink);font:inherit;cursor:pointer}.ecs-difficulty strong{display:block;font-size:1.3rem}.ecs-difficulty span{display:block;margin-top:8px;color:#56647b}.ecs-difficulty[aria-pressed=true]{border-color:#ff9f0a;background:#fff6df;box-shadow:0 0 0 3px #ffcf7a}
.ecs-level-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:20px auto;max-width:900px}.ecs-level{min-height:92px;padding:10px 6px;border:0;background:#eaf1ff;color:#31579d;font:inherit;font-weight:800;cursor:pointer;clip-path:polygon(0 12%,34% 12%,35% 8%,40% 8%,42% 2%,46% 0,54% 0,58% 2%,60% 8%,65% 8%,66% 12%,100% 12%,100% 35%,92% 36%,88% 40%,86% 46%,88% 52%,92% 56%,100% 57%,100% 100%,65% 100%,64% 92%,60% 88%,54% 86%,48% 88%,44% 92%,43% 100%,0 100%,0 65%,8% 64%,12% 60%,14% 54%,12% 48%,8% 44%,0 43%);filter:drop-shadow(0 3px 2px #314e8840)}.ecs-level[aria-pressed=true]{background:#ffe4a8;color:#704500;filter:drop-shadow(0 0 5px #ffad16)}
.ecs-game{width:min(100%,1200px)}.ecs-game-header{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}.ecs-game-header h1{margin:0;font-size:clamp(1.4rem,3vw,2rem)}.ecs-progress{font-weight:800;color:#43516a}
.ecs-prompt{margin:0 0 14px;text-align:center;font-size:clamp(1.1rem,2.4vw,1.45rem);font-weight:800}.ecs-say-prompt{margin:0 0 18px;text-align:center;color:#59667a}
.ecs-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:12px;margin:0 auto 20px;max-width:900px}.ecs-jigsaw-piece{clip-path:polygon(0 12%,34% 12%,35% 8%,40% 8%,42% 2%,46% 0,54% 0,58% 2%,60% 8%,65% 8%,66% 12%,100% 12%,100% 35%,92% 36%,88% 40%,86% 46%,88% 52%,92% 56%,100% 57%,100% 100%,65% 100%,64% 92%,60% 88%,54% 86%,48% 88%,44% 92%,43% 100%,0 100%,0 65%,8% 64%,12% 60%,14% 54%,12% 48%,8% 44%,0 43%);filter:drop-shadow(0 4px 2px #26344a38)}.ecs-item{min-height:144px;padding:18px 8px 12px;border:0;background:#fff;color:var(--ecs-ink);cursor:pointer}.ecs-item[aria-pressed=true]{background:#c9fff5;filter:drop-shadow(0 0 6px #00a99d)}.ecs-item[hidden]{display:none}.ecs-item-emoji{display:block;font-size:clamp(2.5rem,6vw,4rem);line-height:1.05}.ecs-item-word{display:block;margin-top:8px;font-size:1rem;font-weight:900}
.ecs-bins{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}.ecs-bin{min-height:112px;padding:18px 10px 12px;border:0;background:#dce8ff;color:#31579d;font-family:inherit;font-size:1.1rem;font-weight:800;line-height:1.2;cursor:pointer;touch-action:manipulation}.ecs-bin:hover,.ecs-bin:focus-visible{background:#c7d9ff;filter:drop-shadow(0 0 5px #5589e8)}.ecs-bin-icon{display:block;margin-bottom:5px;font-size:1.7rem}
.ecs-word-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;max-width:720px;margin:18px auto}.ecs-word-choice{min-height:100px;padding:18px 12px;border:0;background:#dce8ff;color:#26344a;font-family:inherit;font-size:1.25rem;font-weight:800;line-height:1.2;cursor:pointer}.ecs-word-choice:hover,.ecs-word-choice:focus-visible{background:#ffe4a8;filter:drop-shadow(0 0 5px #ffad16)}.ecs-word-emoji{display:block;margin-bottom:8px;text-align:center;font-size:clamp(3.4rem,10vw,5rem)}
.ecs-feedback{min-height:28px;margin:14px 0 0;text-align:center;font-weight:800;color:#ac3b46}.ecs-feedback.correct{color:#168049}.ecs-howto-steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:20px 0}.ecs-howto-step{padding:16px;border:2px solid #e2e9f4;border-radius:16px;background:#fff;text-align:center}.ecs-howto-step span{display:block;margin-bottom:8px;font-size:2rem}.ecs-howto-step p{margin:0;color:#526077;line-height:1.45}.ecs-victory-score{margin:12px 0;text-align:center;color:#1a784b;font-size:clamp(2rem,7vw,4rem);font-weight:900}
@media(max-width:700px){.ecs-panel{padding:12px;border-width:5px;border-radius:16px}.ecs-heading{margin-bottom:16px}.ecs-difficulty-grid{gap:8px}.ecs-difficulty{min-height:104px;padding:12px 6px}.ecs-difficulty strong{font-size:1.05rem}.ecs-difficulty span{font-size:.85rem}.ecs-level-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:7px}.ecs-level{min-height:76px;font-size:.9rem}.ecs-items{grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.ecs-item{min-height:116px;padding:16px 4px 8px}.ecs-item-word{font-size:.85rem}.ecs-bins{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}.ecs-bin{min-height:90px;font-size:1rem}.ecs-word-choices{gap:8px}.ecs-word-choice{min-height:88px;padding:14px 6px;font-size:1rem}.ecs-word-emoji{font-size:2.8rem}.ecs-howto-steps{grid-template-columns:1fr}.ecs-actions{gap:8px}}
@media(max-height:650px) and (min-width:701px){.ecs-root{align-items:flex-start}.ecs-panel{padding:14px}.ecs-heading{margin-bottom:12px}.ecs-game-header{margin-bottom:8px}.ecs-item{min-height:100px}.ecs-bin{min-height:76px}}
`;

export default function EmojiCategorySort({ onComplete, profileName = "" }) {
  const [screen, setScreen] = useState("splash");
  const [playerName, setPlayerName] = useState(profileName);
  const [difficulty, setDifficulty] = useState("easy");
  const [level, setLevel] = useState("mixed");
  const [round, setRound] = useState([]);
  const [sortedIds, setSortedIds] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");

  const startGame = () => {
    setRound(level === "mixed"
      ? createEmojiCategoryRound(difficulty)
      : createEmojiWordQuestions(level));
    setSortedIds([]);
    setSelectedId(null);
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setFeedback("");
    setScreen("game");
  };

  const sortSelectedItem = (categoryId, itemId = selectedId) => {
    if (!itemId || sortedIds.includes(itemId)) return;
    const item = round.find((entry) => entry.id === itemId);
    if (!item) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (item.categoryId !== categoryId) {
      setFeedback(`Not quite! ${item.word} belongs in ${EMOJI_CATEGORIES.find((category) => category.id === item.categoryId)?.label}. Try again.`);
      return;
    }

    const nextSortedIds = [...sortedIds, item.id];
    const nextScore = score + 100;
    setSortedIds(nextSortedIds);
    setSelectedId(null);
    setScore(nextScore);
    setFeedback(`Great sorting! ${item.word} belongs in ${EMOJI_CATEGORIES.find((category) => category.id === categoryId)?.label}.`);

    if (nextSortedIds.length === round.length) {
      setScreen("victory");
      onComplete?.(nextScore, Math.round((round.length / nextAttempts) * 100));
    }
  };

  const answerWordQuestion = (itemId) => {
    const item = round[questionIndex];
    if (!item) return;
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);
    if (item.id !== itemId) {
      setFeedback("Not quite. Look closely at the emoji and try another word.");
      return;
    }
    const nextScore = score + 100;
    const nextIndex = questionIndex + 1;
    setScore(nextScore);
    setFeedback(`Correct! ${item.word}.`);
    if (nextIndex === round.length) {
      setScreen("victory");
      onComplete?.(nextScore, Math.round((round.length / nextAttempts) * 100));
    } else {
      setQuestionIndex(nextIndex);
    }
  };

  const items = round;
  const remainingCount = level === "mixed" ? round.length - sortedIds.length : round.length - questionIndex;
  const selectedCategory = EMOJI_CATEGORIES.find((category) => category.id === level);
  const currentQuestion = round[questionIndex];

  return (
    <main className="ecs-root">
      <style>{STYLES}</style>
      <section className={`ecs-panel${screen === "game" ? " ecs-game" : ""}`} aria-live="polite">
        {screen === "splash" && (
          <>
            <h1 className="ecs-heading">Sort &amp; Say!</h1>
            <p className="ecs-subtitle">A bright emoji challenge. Name each picture, then sort it into the right category!</p>
            <div className="ecs-hero-emoji" aria-hidden="true"><span>🍎</span><span>🚆</span><span>🐼</span><span>🌈</span></div>
            <div className="ecs-actions">
              <button className="ecs-button" type="button" onClick={() => setScreen("setup")}>Let&apos;s play!</button>
              <button className="ecs-button secondary" type="button" onClick={() => setScreen("how-to")}>How to play</button>
            </div>
          </>
        )}

        {screen === "setup" && (
          <>
            <h1 className="ecs-heading">Who&apos;s playing?</h1>
            <p className="ecs-subtitle">Enter your name and get ready to sort.</p>
            <form className="ecs-name-form" onSubmit={(event) => { event.preventDefault(); if (playerName.trim()) setScreen("menu"); }}>
              <label htmlFor="emoji-sort-player-name">Player name</label>
              <input id="emoji-sort-player-name" value={playerName} maxLength={24} autoComplete="given-name" placeholder="Your name" onChange={(event) => setPlayerName(event.target.value)} required />
              <div className="ecs-actions">
                <button className="ecs-button" type="submit" disabled={!playerName.trim()}>Continue</button>
                <button className="ecs-button secondary" type="button" onClick={() => setScreen("splash")}>Back</button>
              </div>
            </form>
          </>
        )}

        {screen === "menu" && (
          <>
            <h1 className="ecs-heading">Ready, {playerName.trim()}?</h1>
            <p className="ecs-subtitle">Choose a vocabulary level or Mixed sorting, then set a difficulty.</p>
            <div className="ecs-level-grid" aria-label="Choose a level">
              <button type="button" className="ecs-level" aria-pressed={level === "mixed"} onClick={() => setLevel("mixed")}>🧩 Mixed</button>
              {EMOJI_CATEGORIES.map((category) => (
                <button key={category.id} type="button" className="ecs-level" aria-pressed={level === category.id} onClick={() => setLevel(category.id)}>
                  {category.icon} {category.label}
                </button>
              ))}
            </div>
            <p className="ecs-subtitle">{level === "mixed" ? "Sort mixed emojis into their categories." : `${selectedCategory?.label} level: match each emoji to its English word (${selectedCategory?.items.length} questions).`}</p>
            {level === "mixed" ? (
              <div className="ecs-difficulty-grid" aria-label="Choose difficulty">
                {Object.entries(EMOJI_SORT_DIFFICULTIES).map(([id, setting]) => (
                  <button key={id} type="button" className="ecs-difficulty" aria-pressed={difficulty === id} onClick={() => setDifficulty(id)}>
                    <strong>{setting.label}</strong><span>{setting.items} items</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="ecs-subtitle">This level includes all {selectedCategory?.items.length} word-match questions.</p>
            )}
            <div className="ecs-actions">
              <button className="ecs-button" type="button" onClick={startGame}>{level === "mixed" ? "Start sorting" : "Start word match"}</button>
              <button className="ecs-button secondary" type="button" onClick={() => setScreen("how-to")}>How to play</button>
              <button className="ecs-button secondary" type="button" onClick={() => setScreen("setup")}>Change name</button>
            </div>
          </>
        )}

        {screen === "how-to" && (
          <>
            <h1 className="ecs-heading">How to play</h1>
            <p className="ecs-subtitle">Look at each emoji, say its name, and sort it into the matching category.</p>
            <div className="ecs-howto-steps">
              <div className="ecs-howto-step"><span aria-hidden="true">👀</span><p>Choose an emoji card to see which one you are sorting.</p></div>
              <div className="ecs-howto-step"><span aria-hidden="true">🗣️</span><p>Say the word out loud, then choose Food, Transport, Animals, or Nature.</p></div>
              <div className="ecs-howto-step"><span aria-hidden="true">🏆</span><p>Sort every item correctly to finish the round. A wrong category lets you try again.</p></div>
            </div>
            <p className="ecs-subtitle">Mixed rounds: Easy 3 · Medium 5 · Hard 7 items. Category levels match a larger vocabulary set to words.</p>
            <div className="ecs-actions">
              <button className="ecs-button" type="button" onClick={() => setScreen(playerName.trim() ? "menu" : "setup")}>Continue</button>
            </div>
          </>
        )}

        {screen === "game" && (
          <>
            <div className="ecs-game-header">
              <h1>Sort &amp; Say! · {playerName.trim()}</h1>
              <span className="ecs-progress">{selectedCategory ? `${selectedCategory.label} · ` : ""}Items left: {remainingCount} · Score: {score}</span>
            </div>
            {level === "mixed" ? (
              <>
            <p className="ecs-prompt">Choose an emoji, then tap its category.</p>
            <p className="ecs-say-prompt">Say the word aloud before you sort it!</p>
            <div className="ecs-items" aria-label="Emoji items to sort">
              {items.filter((item) => !sortedIds.includes(item.id)).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="ecs-item ecs-jigsaw-piece"
                  aria-label={`Select ${item.word}`}
                  aria-pressed={selectedId === item.id}
                  draggable
                  onDragStart={(event) => { setSelectedId(item.id); event.dataTransfer.setData("text/plain", item.id); }}
                  onClick={() => { setSelectedId(item.id); setFeedback(`Selected ${item.word}. Now choose its category.`); }}
                >
                  <span className="ecs-item-emoji" aria-hidden="true">{item.emoji}</span>
                  <span className="ecs-item-word">{item.word}</span>
                </button>
              ))}
            </div>
            <p className="ecs-prompt">{selectedId ? `Where does ${items.find((item) => item.id === selectedId)?.word} belong?` : "Choose an item to begin."}</p>
            <div className="ecs-bins" aria-label="Emoji categories">
              {EMOJI_CATEGORIES.map((category) => (
                <button key={category.id} type="button" className="ecs-bin ecs-jigsaw-piece" onClick={() => sortSelectedItem(category.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const itemId = event.dataTransfer.getData("text/plain"); setSelectedId(itemId); sortSelectedItem(category.id, itemId); }}>
                  <span className="ecs-bin-icon" aria-hidden="true">{category.icon}</span>{category.label}
                </button>
              ))}
            </div>
            <p className={`ecs-feedback${feedback.startsWith("Great") ? " correct" : ""}`} role="status">{feedback || "Select an emoji to start sorting."}</p>
              </>
            ) : currentQuestion && (
              <>
                <p className="ecs-prompt">Say the emoji, then choose the correct word.</p>
                <p className="ecs-say-prompt">Question {questionIndex + 1} of {round.length}</p>
                <div className="ecs-word-emoji" role="img" aria-label={`Emoji clue ${currentQuestion.emoji}`}>{currentQuestion.emoji}</div>
                <div className="ecs-word-choices" aria-label="Word choices">
                  {currentQuestion.choices.map((choice) => (
                    <button key={choice.id} className="ecs-word-choice ecs-jigsaw-piece" type="button" onClick={() => answerWordQuestion(choice.id)}>
                      {choice.word}
                    </button>
                  ))}
                </div>
                <p className={`ecs-feedback${feedback.startsWith("Correct") ? " correct" : ""}`} role="status">{feedback || "Choose the matching word."}</p>
              </>
            )}
            <div className="ecs-actions"><button className="ecs-button secondary" type="button" onClick={() => setScreen("menu")}>Main menu</button></div>
          </>
        )}

        {screen === "victory" && (
          <>
            <h1 className="ecs-heading">{level === "mixed" ? `Amazing sorting, ${playerName.trim()}!` : `Great word matching, ${playerName.trim()}!`}</h1>
            <div className="ecs-hero-emoji" aria-hidden="true"><span>🎉</span><span>🏆</span><span>🎉</span></div>
            <p className="ecs-subtitle">{level === "mixed" ? `You sorted all ${round.length} emoji items into their categories.` : `You matched all ${round.length} ${selectedCategory?.label.toLowerCase()} emojis to their words.`}</p>
            <p className="ecs-victory-score">{score} points</p>
            <p className="ecs-subtitle">Accuracy: {Math.round((round.length / Math.max(1, attempts)) * 100)}%</p>
            <div className="ecs-actions">
              <button className="ecs-button" type="button" onClick={startGame}>Play again</button>
              <button className="ecs-button secondary" type="button" onClick={() => setScreen("menu")}>Main menu</button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
