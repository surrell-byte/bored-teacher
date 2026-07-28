import { useMemo, useState } from "react";

const CONFIG = {
  countadd: { title:"Count & Add", icon:"➕", mode:"count", prompt:"Count both groups and choose the total.", items:["🍎","🐠","⭐","🦕"] },
  feedmonster: { title:"Feed the Monster", icon:"👾", mode:"count", prompt:"How many apples should the monster eat?", items:["🍎"] },
  picturerace: { title:"Picture Race", icon:"🏁", mode:"count", prompt:"Count the pictures before the clock runs out!", items:["🍎","⚽","🐶","🚗","🍕"] },
  moneyblocks: { title:"Money Blocks", icon:"💰", mode:"guess", prompt:"Will the next money block be higher or lower?" },
  higherorlower: { title:"Higher or Lower", icon:"🃏", mode:"guess", prompt:"Will the next card be higher or lower?" },
  redorblack: { title:"Red or Black", icon:"🎴", mode:"colour", prompt:"Call the colour before the card flips." },
  parachutedrop: { title:"Parachute Drop", icon:"🪂", mode:"race", prompt:"Roll the dice and guide your parachute to the finish!" },
  superwings: { title:"Super Wings Races", icon:"✈️", mode:"race", prompt:"Race your plane across the sky." },
  swampjump: { title:"Froggy Hop", icon:"🐸", mode:"race", prompt:"Hop across the lily pads to reach the finish." },
  treasurechest: { title:"Treasure Chest Showdown", icon:"🏴‍☠️", mode:"race", prompt:"Choose a chest, then race for the treasure." },
  unicornwings: { title:"Unicorn Wing Races", icon:"🦄", mode:"race", prompt:"Roll the dice and race your unicorn home." },
  sentencebuilder: { title:"Sentence Builder", icon:"📝", mode:"sentence", prompt:"Put the words in the correct order." },
  whatami: { title:"Field Guide: What Am I?", icon:"🔎", mode:"clue", prompt:"Read the clue and identify the answer." },
  whatsmissing: { title:"What's Missing?", icon:"🧐", mode:"missing", prompt:"Study the row, then find what disappeared." },
};

const SENTENCES = ["I like to play football", "The cat sleeps on the sofa", "We eat apples at lunch", "My teacher reads a book"];
const CLUES = [
  { clue:"I have four legs and say woof.", answer:"Dog", options:["Dog","Fish","Bird"] },
  { clue:"I am yellow and monkeys like to eat me.", answer:"Banana", options:["Banana","Carrot","Cheese"] },
  { clue:"I am bright in the sky during the day.", answer:"Sun", options:["Moon","Sun","Star"] },
];
const MEMORY_ITEMS = ["🍎","🍌","🐶","🐱","⚽","🚗","🌈","🎸"];
const shuffle = (items) => [...items].sort(() => Math.random() - .5);
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function LegacyGamePort({ gameId, onComplete }) {
  const config = CONFIG[gameId];
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [message, setMessage] = useState("");
  const [locked, setLocked] = useState(false);
  const [seed, setSeed] = useState(0);
  const [position, setPosition] = useState(0);
  const [raceLog, setRaceLog] = useState("Roll to begin!");

  const challenge = useMemo(() => {
    if (config.mode === "count") {
      const first = randomNumber(1, 5), second = gameId === "feedmonster" ? 0 : randomNumber(1, 5);
      const answer = first + second;
      return { first, second, answer, item: config.items[randomNumber(0, config.items.length - 1)], options:shuffle([answer, Math.max(1, answer - 1), answer + 1, answer + 2]) };
    }
    if (config.mode === "guess") {
      const current = randomNumber(2, 12), next = randomNumber(1, 13);
      return { current, next, answer:next >= current ? "Higher" : "Lower" };
    }
    if (config.mode === "colour") {
      const red = Math.random() > .5;
      return { suit:red ? "♥" : "♠", answer:red ? "Red" : "Black" };
    }
    if (config.mode === "sentence") {
      const answer = SENTENCES[randomNumber(0, SENTENCES.length - 1)];
      return { answer, words:shuffle(answer.split(" ")) };
    }
    if (config.mode === "clue") return CLUES[randomNumber(0, CLUES.length - 1)];
    if (config.mode === "missing") {
      const items = shuffle(MEMORY_ITEMS).slice(0, 5), missingIndex = randomNumber(0, 4);
      return { items, answer:items[missingIndex], missingIndex, options:shuffle([items[missingIndex], ...shuffle(MEMORY_ITEMS.filter(item => !items.includes(item))).slice(0, 3)]) };
    }
    return {};
  }, [config, gameId, seed]);

  if (!config) return null;
  const finalRound = round >= 10;
  const advance = (isCorrect, detail = "") => {
    if (locked) return;
    setLocked(true);
    const nextScore = score + (isCorrect ? 10 : 0);
    const nextCorrect = correct + Number(isCorrect);
    setScore(nextScore); setCorrect(nextCorrect);
    setMessage(isCorrect ? `Correct! +10 ${detail}` : `Not quite. ${detail}`);
    setTimeout(() => {
      if (finalRound) onComplete?.(nextScore, Math.round((nextCorrect / 10) * 100));
      else { setRound(value => value + 1); setSeed(value => value + 1); setMessage(""); setLocked(false); }
    }, 900);
  };
  const roll = () => {
    if (locked || finalRound) return;
    setLocked(true);
    const distance = randomNumber(1, 6), next = Math.min(100, position + distance * 5);
    setPosition(next); setScore(value => value + distance);
    setRaceLog(`You rolled ${distance}! ${next >= 100 ? "You reached the finish!" : "Keep going!"}`);
    setTimeout(() => {
      if (next >= 100) onComplete?.(score + distance, 100);
      else { setRound(value => value + 1); setLocked(false); }
    }, 650);
  };

  const selectSentence = (word) => {
    const selected = message ? message.split("|") : [];
    if (selected.length >= challenge.words.length || locked) return;
    const next = [...selected, word];
    setMessage(next.join("|"));
    if (next.length === challenge.words.length) {
      const isCorrect = next.join(" ") === challenge.answer;
      setTimeout(() => { setMessage(""); advance(isCorrect, isCorrect ? "Great sentence!" : `Try: “${challenge.answer}”`); }, 250);
    }
  };
  const selectedSentence = config.mode === "sentence" && message.includes("|") ? message.split("|") : [];

  return <main className="legacy-port" data-mode={config.mode}>
    <style>{PORT_STYLES}</style>
    <section className="legacy-port-card">
      <header className="legacy-port-header"><span>{config.icon}</span><div><p>React gameplay port</p><h1>{config.title}</h1></div><div className="legacy-port-score">{score}<small>points</small></div></header>
      <div className="legacy-port-progress"><span>Round {Math.min(round, 10)} / 10</span><div><i style={{ width:`${Math.min(round, 10) * 10}%` }} /></div></div>
      <p className="legacy-port-prompt">{config.prompt}</p>
      {config.mode === "count" && <div className="legacy-challenge"><div className="legacy-count-row"><span>{Array.from({ length:challenge.first }, () => challenge.item).join(" ")}</span>{challenge.second > 0 && <><b>+</b><span>{Array.from({ length:challenge.second }, () => challenge.item).join(" ")}</span></>}</div><div className="legacy-options">{challenge.options.map(option => <button disabled={locked} key={option} onClick={() => advance(option === challenge.answer)}>{option}</button>)}</div></div>}
      {config.mode === "guess" && <div className="legacy-challenge"><div className="legacy-number-card">{challenge.current}</div><div className="legacy-options two"><button disabled={locked} onClick={() => advance(challenge.answer === "Higher", `The card was ${challenge.next}.`)}>↑ Higher</button><button disabled={locked} onClick={() => advance(challenge.answer === "Lower", `The card was ${challenge.next}.`)}>↓ Lower</button></div></div>}
      {config.mode === "colour" && <div className="legacy-challenge"><div className={`legacy-suit ${challenge.answer.toLowerCase()}`}>{challenge.suit}</div><div className="legacy-options two"><button disabled={locked} onClick={() => advance(challenge.answer === "Red")}>♥ Red</button><button disabled={locked} onClick={() => advance(challenge.answer === "Black")}>♠ Black</button></div></div>}
      {config.mode === "race" && <div className="legacy-challenge"><div className="legacy-race-track"><span style={{ left:`calc(${position}% - 18px)` }}>{config.icon}</span><b>🏁</b></div><p>{raceLog}</p><button className="legacy-primary" disabled={locked} onClick={roll}>🎲 Roll the dice</button></div>}
      {config.mode === "sentence" && <div className="legacy-challenge"><div className="legacy-sentence-answer">{selectedSentence.join(" ") || "Choose each word in order"}</div><div className="legacy-word-bank">{challenge.words.map((word, index) => <button disabled={locked || selectedSentence.includes(word)} key={`${word}-${index}`} onClick={() => selectSentence(word)}>{word}</button>)}</div></div>}
      {config.mode === "clue" && <div className="legacy-challenge"><blockquote>“{challenge.clue}”</blockquote><div className="legacy-options">{challenge.options.map(option => <button disabled={locked} key={option} onClick={() => advance(option === challenge.answer)}>{option}</button>)}</div></div>}
      {config.mode === "missing" && <div className="legacy-challenge"><div className="legacy-memory-row">{challenge.items.map((item, index) => <span key={`${item}-${index}`}>{index === challenge.missingIndex ? "❓" : item}</span>)}</div><div className="legacy-options">{challenge.options.map(option => <button disabled={locked} key={option} onClick={() => advance(option === challenge.answer)}>{option}</button>)}</div></div>}
      {message && !message.includes("|") && <div className="legacy-feedback">{message}</div>}
      <button className="legacy-restart" onClick={() => { setRound(1); setScore(0); setCorrect(0); setPosition(0); setLocked(false); setMessage(""); setSeed(value => value + 1); }}>↺ Start over</button>
    </section>
  </main>;
}

const PORT_STYLES = `
.legacy-port{min-height:100%;display:grid;place-items:center;padding:30px;background:radial-gradient(circle at top,#253d65 0%,#101624 56%,#090c13 100%);font-family:var(--font-body,system-ui);color:#f8fbff}.legacy-port *{box-sizing:border-box}.legacy-port-card{width:min(100%,680px);padding:clamp(22px,4vw,40px);border:1px solid rgba(255,255,255,.16);border-radius:28px;background:rgba(18,28,47,.88);box-shadow:0 28px 70px rgba(0,0,0,.42);text-align:center}.legacy-port-header{display:flex;align-items:center;gap:13px;text-align:left}.legacy-port-header>span{font-size:2.5rem}.legacy-port-header p{margin:0;color:#8ed8ff;font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;font-weight:700}.legacy-port-header h1{margin:2px 0 0;font-size:clamp(1.45rem,4vw,2rem)}.legacy-port-score{margin-left:auto;color:#ffd961;font-size:1.7rem;font-weight:800;text-align:right}.legacy-port-score small{display:block;color:#b9c3d5;font-size:.65rem;text-transform:uppercase;letter-spacing:.1em}.legacy-port-progress{display:flex;align-items:center;gap:12px;margin:26px 0 16px;color:#b9c3d5;font-size:.78rem;font-weight:700}.legacy-port-progress>div{height:7px;flex:1;border-radius:99px;background:#24344d;overflow:hidden}.legacy-port-progress i{display:block;height:100%;background:linear-gradient(90deg,#56d8c5,#78adff);border-radius:inherit;transition:width .35s}.legacy-port-prompt{margin:0 0 24px;color:#dce5f3;font-size:1.05rem}.legacy-challenge{min-height:230px;display:grid;align-content:center;gap:22px}.legacy-count-row{display:flex;justify-content:center;align-items:center;gap:14px;font-size:clamp(1.7rem,5vw,2.5rem);flex-wrap:wrap}.legacy-count-row span{max-width:100%;word-break:break-word}.legacy-count-row b{color:#ffd961}.legacy-options{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.legacy-options.two{grid-template-columns:1fr 1fr}.legacy-options button,.legacy-word-bank button{min-height:55px;border:1px solid rgba(255,255,255,.18);border-radius:15px;background:#263b5b;color:#fff;font:inherit;font-weight:800;cursor:pointer;transition:transform .15s,background .15s}.legacy-options button:hover,.legacy-word-bank button:hover{transform:translateY(-2px);background:#365784}.legacy-options button:disabled,.legacy-word-bank button:disabled,.legacy-primary:disabled{opacity:.55;cursor:default;transform:none}.legacy-number-card,.legacy-suit{width:125px;height:155px;margin:auto;display:grid;place-items:center;border-radius:18px;background:#fff;color:#17233a;font-size:4.5rem;font-weight:900;box-shadow:0 12px 28px rgba(0,0,0,.28)}.legacy-suit.red{color:#dc4a57}.legacy-suit.black{color:#19212e}.legacy-race-track{height:66px;border-radius:99px;background:repeating-linear-gradient(90deg,#17354b 0 42px,#1f4661 42px 84px);position:relative;border:2px solid #78adff}.legacy-race-track span{position:absolute;top:12px;font-size:2.2rem;transition:left .45s ease}.legacy-race-track b{position:absolute;right:12px;top:19px}.legacy-primary{justify-self:center;padding:14px 25px;border:0;border-radius:99px;background:linear-gradient(135deg,#f9d768,#f09b58);color:#182033;font:inherit;font-weight:900;cursor:pointer}.legacy-sentence-answer{min-height:64px;padding:17px;border:1px dashed #78adff;border-radius:14px;color:#dce5f3;font-weight:700}.legacy-word-bank{display:flex;justify-content:center;gap:9px;flex-wrap:wrap}.legacy-word-bank button{min-height:auto;padding:10px 13px}.legacy-challenge blockquote{margin:0;padding:20px;border-radius:18px;background:#213653;color:#dce5f3;font-size:1.2rem;font-style:italic}.legacy-memory-row{display:flex;justify-content:center;gap:10px;flex-wrap:wrap}.legacy-memory-row span{width:68px;height:78px;display:grid;place-items:center;border-radius:14px;background:#f7fbff;color:#14223b;font-size:2rem}.legacy-feedback{min-height:28px;margin-top:12px;color:#78efba;font-weight:800}.legacy-restart{margin-top:20px;border:0;background:transparent;color:#aebed1;font:inherit;cursor:pointer}@media(max-width:520px){.legacy-port{padding:16px}.legacy-port-card{padding:22px 16px;border-radius:20px}.legacy-options{grid-template-columns:repeat(2,1fr)}.legacy-port-header h1{font-size:1.35rem}.legacy-port-header>span{font-size:2rem}.legacy-challenge{min-height:250px}}
`;
