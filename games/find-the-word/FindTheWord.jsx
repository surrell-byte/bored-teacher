import React, { useEffect, useMemo, useRef, useState } from "react";
import "./FindTheWord.css";

const WORD_BANK = [
  {
    sentence: "The early bird catches the ___.",
    answer: "worm",
    distractors: ["fly", "beetle", "moth", "ant", "spider", "caterpillar", "butterfly"],
  },
  {
    sentence: "A picture is worth a thousand ___.",
    answer: "words",
    distractors: ["sentences", "phrases", "stories", "letters", "sounds", "ideas", "numbers"],
  },
  {
    sentence: "Actions speak louder than ___.",
    answer: "words",
    distractors: ["promises", "excuses", "apologies", "speeches", "warnings", "opinions", "rumors"],
  },
  {
    sentence: "The pen is mightier than the ___.",
    answer: "sword",
    distractors: ["shield", "spear", "dagger", "axe", "blade", "lance", "arrow"],
  },
  {
    sentence: "Better late than ___.",
    answer: "never",
    distractors: ["sorry", "early", "last", "absent", "tired", "alone", "forgotten"],
  },
  {
    sentence: "Practice makes ___.",
    answer: "perfect",
    distractors: ["better", "easier", "stronger", "possible", "successful", "effective", "powerful"],
  },
  {
    sentence: "When in Rome, do as the ___ do.",
    answer: "Romans",
    distractors: ["locals", "tourists", "natives", "citizens", "neighbors", "villagers", "travelers"],
  },
  {
    sentence: "Every cloud has a silver ___.",
    answer: "lining",
    distractors: ["edge", "trim", "border", "layer", "thread", "seam", "frame"],
  },
  {
    sentence: "Curiosity killed the ___.",
    answer: "cat",
    distractors: ["mouse", "fox", "rabbit", "dog", "bird", "hare", "kitten"],
  },
  {
    sentence: "Honesty is the best ___.",
    answer: "policy",
    distractors: ["strategy", "choice", "method", "approach", "habit", "solution", "decision"],
  },
];

const ROUNDS = [
  { level: 1, cards: 3 },
  { level: 1, cards: 3 },
  { level: 1, cards: 3 },
  { level: 2, cards: 5 },
  { level: 2, cards: 5 },
  { level: 2, cards: 5 },
  { level: 3, cards: 7 },
  { level: 3, cards: 7 },
  { level: 3, cards: 7 },
  { level: "bonus", cards: 8 },
];

const AVATARS = [
  "🦁", "🐯", "🦊", "🐼", "🐸", "🦉",
  "🐧", "🐢", "🦄", "🐙", "🐳", "🦋",
];

const COLORS = [
  { name: "Ruby", dark: "#7a1f2b", light: "#9c2c3a" },
  { name: "Sapphire", dark: "#1f3d7a", light: "#2c53a0" },
  { name: "Emerald", dark: "#1a5c3a", light: "#237a4d" },
  { name: "Amethyst", dark: "#5a2d7a", light: "#7638a0" },
  { name: "Amber", dark: "#7a4f1f", light: "#a06b2c" },
  { name: "Onyx", dark: "#242424", light: "#3a3a3a" },
  { name: "Rose", dark: "#8a2f52", light: "#b03e6b" },
  { name: "Teal", dark: "#1f6b6b", light: "#2c8f8f" },
  { name: "Slate", dark: "#3a4a5c", light: "#4f6479" },
  { name: "Coral", dark: "#a03f2f", light: "#c9553f" },
  { name: "Olive", dark: "#5a5c1f", light: "#78792c" },
  { name: "Plum", dark: "#4a2350", light: "#63306b" },
];

const SUITS = [
  { symbol: "♠", name: "Spades", color: "black" },
  { symbol: "♥", name: "Hearts", color: "red" },
  { symbol: "♦", name: "Diamonds", color: "red" },
  { symbol: "♣", name: "Clubs", color: "black" },
];

const MAX_LIVES = 3;
const GUESS_TIME = 7;

const shuffle = (array) => {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr;
};

export default function FindTheWord() {
  const [screen, setScreen] = useState("welcome");

  const [player, setPlayer] = useState({
    name: "",
    age: "",
    avatar: null,
    colorIdx: null,
    suitIdx: null,
  });

  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [perfectRounds, setPerfectRounds] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalGuesses, setTotalGuesses] = useState(0);

  const [guessesUsed, setGuessesUsed] = useState(0);
  const [cards, setCards] = useState([]);
  const [locked, setLocked] = useState(true);
  const [roundActive, setRoundActive] = useState(false);

  const [message, setMessage] = useState("Watch the word...");
  const [messageType, setMessageType] = useState("");

  const [showSentence, setShowSentence] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [powerups, setPowerups] = useState({
    slow: 2,
    hint: 2,
    remove: 1,
  });

  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);
  const timeoutRefs = useRef([]);

  const [roundData, setRoundData] = useState(null);
  const [correctCardId, setCorrectCardId] = useState(null);

  const color = player.colorIdx !== null ? COLORS[player.colorIdx] : COLORS[0];
  const suit = player.suitIdx !== null ? SUITS[player.suitIdx] : SUITS[0];

  const clearTimers = () => {
    clearInterval(timerRef.current);
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const setupComplete =
    player.name.trim().length > 0 &&
    player.avatar !== null &&
    player.colorIdx !== null &&
    player.suitIdx !== null;

  const currentConfig = ROUNDS[round];

  const startGame = () => {
    clearTimers();

    setRound(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setPerfectRounds(0);
    setCorrectAnswers(0);
    setTotalGuesses(0);

    setPowerups({ slow: 2, hint: 2, remove: 1 });

    setShowResults(false);
    setShowSentence(false);
    setScreen("game");

    startRound(0);
  };

  const startRound = (roundNumber) => {
    clearTimers();

    const config = ROUNDS[roundNumber];
    const data = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    const answerIndex = Math.floor(Math.random() * config.cards);
    const pool = shuffle(data.distractors).slice(0, config.cards - 1);

    while (pool.length < config.cards - 1) {
      const extra = shuffle(WORD_BANK.flatMap((w) => w.distractors)).filter(
        (word) => word !== data.answer && !pool.includes(word)
      );

      if (!extra.length) break;
      pool.push(extra[0]);
    }

    const newCards = [];
    let poolIndex = 0;

    for (let i = 0; i < config.cards; i++) {
      const isAnswer = i === answerIndex;
      newCards.push({
        id: `${roundNumber}-${i}-${Math.random()}`,
        word: isAnswer ? data.answer : pool[poolIndex++],
        isAnswer,
        flipped: false,
        dimmed: false,
        disabled: false,
        hint: false,
      });
    }

    setRoundData(data);
    setCorrectCardId(newCards[answerIndex].id);
    setCards(newCards);
    setRound(roundNumber);
    setGuessesUsed(0);
    setLocked(true);
    setRoundActive(true);
    setMessage("Watch the word...");
    setMessageType("");
    setTimeLeft(null);

    timeoutRefs.current.push(
      setTimeout(() => {
        setCards((prev) => prev.map((card) => (card.isAnswer ? { ...card, flipped: true } : card)));
        setMessage("MEMORISE THE WORD!");
      }, 600)
    );

    timeoutRefs.current.push(
      setTimeout(() => {
        setCards((prev) => prev.map((card) => ({ ...card, flipped: false })));
        setMessage("Get ready...");
      }, 2000)
    );

    timeoutRefs.current.push(
      setTimeout(() => {
        runCountdown(roundNumber, newCards);
      }, 2500)
    );
  };

  const runCountdown = (roundNumber, initialCards) => {
    let count = 3;

    const tick = () => {
      if (count > 0) {
        setMessage(`🔔 ${count}`);
        count--;
        timeoutRefs.current.push(setTimeout(tick, 700));
      } else {
        setMessage("🔀 SHUFFLE!");
        timeoutRefs.current.push(
          setTimeout(() => {
            shuffleCards(initialCards, roundNumber);
          }, 300)
        );
      }
    };

    tick();
  };

  const shuffleCards = (initialCards, roundNumber) => {
    const config = ROUNDS[roundNumber];
    let shuffled = [...initialCards];

    const passes = config.cards <= 3 ? 5 : config.cards <= 5 ? 7 : config.cards <= 7 ? 9 : 11;
    let pass = 0;

    const doPass = () => {
      if (pass >= passes) {
        setCards(shuffled);
        finishShuffle();
        return;
      }

      const mode = Math.floor(Math.random() * 3);

      if (mode === 0) {
        let i = Math.floor(Math.random() * shuffled.length);
        let j = Math.floor(Math.random() * shuffled.length);

        while (j === i) {
          j = Math.floor(Math.random() * shuffled.length);
        }

        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      } else if (mode === 1) {
        const start = Math.floor(Math.random() * Math.max(1, shuffled.length - 2));
        const end = Math.min(shuffled.length - 1, start + 2);
        const section = shuffled.slice(start, end + 1).reverse();
        shuffled.splice(start, section.length, ...section);
      } else {
        shuffled = shuffle(shuffled);
      }

      setCards([...shuffled]);
      pass++;

      timeoutRefs.current.push(setTimeout(doPass, config.cards >= 7 ? 280 : 400));
    };

    doPass();
  };

  const finishShuffle = () => {
    setMessage("Which card has the missing word?");
    setLocked(false);
    setTimeLeft(GUESS_TIME);

    clearInterval(timerRef.current);

    const endTime = Date.now() + GUESS_TIME * 1000;

    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      const seconds = remaining / 1000;

      setTimeLeft(seconds);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleTimeout();
      }
    }, 100);
  };

  const handleTimeout = () => {
    if (locked || !roundActive) return;

    clearInterval(timerRef.current);

    setLocked(true);
    setTimeLeft(0);
    setGuessesUsed(MAX_LIVES);

    setMessage("⏰ Time is up!");
    setMessageType("bad");

    roundLost();
  };

  const getSpeedBonus = () => {
    if (timeLeft === null) return 0;
    if (timeLeft >= 5) return 40;
    if (timeLeft >= 3) return 25;
    if (timeLeft >= 1) return 10;
    return 0;
  };

  const handleGuess = (card) => {
    if (locked || !roundActive) return;
    if (card.disabled || card.dimmed) return;

    setTotalGuesses((prev) => prev + 1);

    if (card.isAnswer) {
      setLocked(true);
      clearInterval(timerRef.current);
      roundWon(card);
      return;
    }

    const newGuesses = guessesUsed + 1;
    setGuessesUsed(newGuesses);

    setCards((prev) => prev.map((c) => c.id === card.id ? { ...c, flipped: true, dimmed: true, disabled: true } : c));

    if (newGuesses >= MAX_LIVES) {
      setLocked(true);
      roundLost();
    } else {
      const remaining = MAX_LIVES - newGuesses;
      setMessageType("bad");
      setMessage(`Not there. ${remaining} guess${remaining === 1 ? "" : "es"} left.`);
    }
  };

  const roundWon = (clickedCard) => {
    setRoundActive(false);

    const config = ROUNDS[round];
    const levelMult = config.level === "bonus" ? 3 : config.level;
    const basePoints = 100 * levelMult;
    const penalty = guessesUsed * 20;
    const speedBonus = getSpeedBonus();
    const streakBonus = streak * 10;

    const points = Math.max(20, basePoints - penalty + speedBonus + streakBonus);
    const perfect = guessesUsed === 0 && speedBonus >= 25;
    const totalPoints = perfect ? points + 50 : points;

    const newScore = score + totalPoints;
    const newStreak = streak + 1;

    setScore(newScore);
    setStreak(newStreak);
    setBestStreak((prev) => Math.max(prev, newStreak));
    setCorrectAnswers((prev) => prev + 1);

    if (perfect) {
      setPerfectRounds((prev) => prev + 1);
    }

    setCards((prev) => prev.map((card) => card.id === clickedCard.id ? { ...card, flipped: true, correct: true } : card));

    let bonusText = "";
    if (speedBonus > 0) bonusText += ` ⚡ +${speedBonus} speed`;
    if (streakBonus > 0) bonusText += ` 🔥 +${streakBonus} streak`;

    setMessageType("good");

    if (perfect) {
      setMessage(`✨ PERFECT! +${totalPoints} points`);
    } else {
      setMessage(`Found it! +${totalPoints} points${bonusText}`);
    }

    setShowSentence(true);
  };

  const roundLost = () => {
    clearInterval(timerRef.current);

    setRoundActive(false);
    setStreak(0);

    setCards((prev) => prev.map((card) => card.isAnswer ? { ...card, flipped: true, correct: true } : card));

    setMessageType("bad");
    setMessage("Out of guesses! Here is the word.");
    setShowSentence(true);
  };

  const continueGame = () => {
    setShowSentence(false);

    if (round >= ROUNDS.length - 1) {
      showFinalResults();
      return;
    }

    startRound(round + 1);
  };

  const showFinalResults = () => {
    clearInterval(timerRef.current);
    setRoundActive(false);
    setShowResults(true);
  };

  const playAgain = () => {
    setShowResults(false);
    setScreen("game");
    startGame();
  };

  const useSlow = () => {
    if (powerups.slow <= 0 || locked || !roundActive) return;

    setPowerups((prev) => ({ ...prev, slow: prev.slow - 1 }));
    setTimeLeft((prev) => (prev === null ? prev : prev + 3));

    setMessageType("good");
    setMessage("🐌 Shuffle slowed! +3 seconds");
  };

  const useHint = () => {
    if (powerups.hint <= 0 || locked || !roundActive) return;

    setPowerups((prev) => ({ ...prev, hint: prev.hint - 1 }));
    setCards((prev) => prev.map((card) => card.id === correctCardId ? { ...card, hint: true } : card));

    setTimeout(() => {
      setCards((prev) => prev.map((card) => card.id === correctCardId ? { ...card, hint: false } : card));
    }, 700);

    setMessageType("good");
    setMessage("👁️ The correct card flashed!");
  };

  const useRemove = () => {
    if (powerups.remove <= 0 || locked || !roundActive) return;

    const wrongCards = cards.filter((card) => !card.isAnswer && !card.dimmed && !card.disabled);
    if (!wrongCards.length) return;

    const target = wrongCards[Math.floor(Math.random() * wrongCards.length)];

    setCards((prev) => prev.map((card) => card.id === target.id ? { ...card, dimmed: true, disabled: true } : card));
    setPowerups((prev) => ({ ...prev, remove: prev.remove - 1 }));

    setMessageType("good");
    setMessage("❌ One wrong card removed!");
  };

  const renderSentence = () => {
    if (!roundData) return null;

    const parts = roundData.sentence.split("___");

    return (
      <>
        {parts[0]}
        <span className={showSentence ? "blank-filled" : "blank"}>{showSentence ? roundData.answer : "?"}</span>
        {parts[1]}
      </>
    );
  };

  const accuracy = totalGuesses > 0 ? Math.round((correctAnswers / totalGuesses) * 100) : 0;

  let finalTitle = "";
  let finalText = "";
  let finalRank = "";

  if (score >= 1200) {
    finalTitle = `${player.name || "Champion"}, You're a Word Master!`;
    finalText = "Outstanding memory, speed and vocabulary.";
    finalRank = "💎 DIAMOND";
  } else if (score >= 900) {
    finalTitle = `Excellent Work, ${player.name || "Champion"}!`;
    finalText = "You handled the shuffle like a true card shark.";
    finalRank = "🥇 GOLD";
  } else if (score >= 600) {
    finalTitle = `Sharp Eyes, ${player.name || "Champion"}!`;
    finalText = "A strong performance. Your tracking skills are improving.";
    finalRank = "🥈 SILVER";
  } else {
    finalTitle = `Keep Practicing, ${player.name || "Champion"}!`;
    finalText = "The cards won this time. Ready for revenge?";
    finalRank = "🥉 BRONZE";
  }

  if (screen === "welcome") {
    return (
      <div className="screen active welcome-screen">
        <h1><span className="word-icon">Aa</span>Find the Word</h1>
        <div className="subtitle">Watch closely. Trust your eyes.</div>
        <p className="welcome-desc">
          A word is hidden under one of several cards. Watch it, then the cards <b>shuffle</b>. Track the right card and complete the sentence — you get <b>3 chances</b> and a ticking clock each round. Play through <b>10 rounds</b> across three levels, plus a bonus finale.
        </p>
        <button className="btn big" onClick={() => setScreen("setup")}>Let's Play</button>
      </div>
    );
  }

  if (screen === "setup") {
    return (
      <div className="screen active">
        <h1 className="setup-title">Set Up Your Game</h1>
        <div className="subtitle">Make it yours</div>

        <div className="setup-card">
          <div className="setup-grid">
            <div className="setup-left">
              <div className="field-block full">
                <label className="field-label">Player Name</label>
                <input type="text" placeholder="Enter your name" maxLength={24} value={player.name} onChange={(e) => setPlayer((p) => ({ ...p, name: e.target.value }))} />
              </div>

              <div className="field-block">
                <label className="field-label">Age</label>
                <input type="number" min="2" max="100" placeholder="Age" value={player.age} onChange={(e) => setPlayer((p) => ({ ...p, age: e.target.value }))} />
              </div>

              <div className="field-block">
                <label className="field-label">Avatar</label>
                <div className="avatar-grid">
                  {AVATARS.map((avatar) => (
                    <button key={avatar} className={`avatar-opt ${player.avatar === avatar ? "selected" : ""}`} onClick={() => setPlayer((p) => ({ ...p, avatar }))}>{avatar}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="setup-right">
              <div className="field-block">
                <label className="field-label">Card Colour</label>
                <div className="color-grid">
                  {COLORS.map((c, i) => (
                    <button key={c.name} className={`color-opt ${player.colorIdx === i ? "selected" : ""}`} onClick={() => setPlayer((p) => ({ ...p, colorIdx: i }))}>
                      <span className="color-swatch" style={{ background: c.light }} />
                      <span className="color-name">{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="field-block suit-block">
                <label className="field-label">Card Suit</label>
                <div className="suit-grid">
                  {SUITS.map((s, i) => (
                    <button key={s.name} className={`suit-opt ${s.color} ${player.suitIdx === i ? "selected" : ""}`} onClick={() => setPlayer((p) => ({ ...p, suitIdx: i }))}>{s.symbol}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="setup-actions">
            <button className="btn big" disabled={!setupComplete} onClick={() => { setScreen("game"); startGame(); }}>Begin Game</button>
            {!setupComplete && <div className="setup-hint">Fill in your name, pick an avatar, colour, and suit to continue</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active game-screen" style={{ "--card-color": color.dark, "--card-color-light": color.light }}>
      <h1 className="game-title"><span className="word-icon small">Aa</span>Find the Word</h1>

      <div className="sentence-box">
        <div className="sentence-instruction">Find the missing word among the cards</div>
        <div className="sentence-text">{renderSentence()}</div>
      </div>

      <div className="hud">
        <div className="hud-item"><span className="label">Round</span><span className="value">{round + 1} / {ROUNDS.length}</span></div>
        <div className="hud-item"><span className="label">Score</span><span className="value">{score}</span></div>
        <div className={`hud-item ${streak >= 3 ? "streak-hot" : ""}`}><span className="label">Streak</span><span className="value">{streak}</span></div>
        <div className={`hud-item timer-hud ${timeLeft !== null && timeLeft <= 3 ? "critical" : timeLeft !== null && timeLeft <= 5 ? "warning" : ""}`}>
          <span className="label">Time</span><span className="value">{timeLeft === null ? "--" : timeLeft.toFixed(1)}</span>
        </div>
      </div>

      <div className="progress">
        {ROUNDS.map((r, i) => <div key={i} className={`dot ${i < round ? "done" : i === round ? "current" : ""} ${r.level === "bonus" ? "bonus" : ""}`} />)}
      </div>

      <div className="level-banner">{currentConfig.level === "bonus" ? `Bonus Round · ${currentConfig.cards} Cards` : `Level ${currentConfig.level} · ${currentConfig.cards} Cards`}</div>

      <div className="lives">
        {Array.from({ length: MAX_LIVES }).map((_, i) => <div key={i} className={`life ${i < guessesUsed ? "used" : ""}`} />)}
      </div>

      <div className="powerups">
        <button className="powerup" disabled={powerups.slow <= 0 || locked || !roundActive} onClick={useSlow}>🐌<span>Slow</span><b>{powerups.slow}</b></button>
        <button className="powerup" disabled={powerups.hint <= 0 || locked || !roundActive} onClick={useHint}>👁️<span>Hint</span><b>{powerups.hint}</b></button>
        <button className="powerup" disabled={powerups.remove <= 0 || locked || !roundActive} onClick={useRemove}>❌<span>Remove</span><b>{powerups.remove}</b></button>
      </div>

      <div className="stage">
        <div className="card-row" style={{ gridTemplateColumns: `repeat(${cards.length}, 120px)` }}>
          {cards.map((card) => (
            <button key={card.id} disabled={locked || card.disabled || card.dimmed} className={`card ${card.flipped ? "flipped" : ""} ${card.dimmed ? "dimmed" : ""} ${card.hint ? "hint-glow" : ""} ${card.correct ? "correct-glow" : ""}`} onClick={() => handleGuess(card)}>
              <div className="card-inner">
                <div className="card-face card-back"><span className="suit-mark">{suit.symbol}</span></div>
                <div className="card-face card-front">{card.isAnswer ? <span className="word-label">{card.word}</span> : <span className="empty-mark">×</span>}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="status">
        <div className={`msg ${messageType} ${message.includes("PERFECT") ? "perfect-text" : ""}`}>{message}</div>
      </div>

      {showSentence && roundData && (
        <div className="overlay show">
          <div className="overlay-card">
            <h2>{messageType === "good" ? `Found it, ${player.name || "player"}!` : "So close!"}</h2>
            <p>Read the full sentence before moving on.</p>
            <div className="full-sentence-box">
              {roundData.sentence.split("___").map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i === 0 && <b>{roundData.answer}</b>}
                </React.Fragment>
              ))}
            </div>
            <button className="btn big" onClick={continueGame}>{round === ROUNDS.length - 1 ? "See Results" : "Continue"}</button>
          </div>
        </div>
      )}

      {showResults && (
        <div className="overlay show">
          <div className="overlay-card results-card">
            <div className="victory-confetti">🏆 ✨ 🃏 ✨ 🏆</div>
            <h2>{finalTitle}</h2>
            <p>{finalText}</p>

            <div className="results-grid">
              <div className="result-stat"><span>Score</span><b>{score}</b></div>
              <div className="result-stat"><span>Best Streak</span><b>{bestStreak}</b></div>
              <div className="result-stat"><span>Perfect</span><b>{perfectRounds}</b></div>
              <div className="result-stat"><span>Accuracy</span><b>{accuracy}%</b></div>
            </div>

            <div className="final-rank">{finalRank}</div>
            <button className="btn big" onClick={playAgain}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
