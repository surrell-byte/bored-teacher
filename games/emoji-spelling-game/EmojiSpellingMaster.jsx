import { useState, useCallback, useEffect, useRef } from "react";
import { useGame } from "@/lib/gameState";
import { useCoverArtStyle } from "@/lib/use-cover-art-style";

const PLAYER_AVATARS = [
  { label: "Astro Explorer", value: "/assets/images/avatars/astro-explorer-avatar.svg" },
  { label: "Sky Dragon", value: "/assets/images/avatars/sky-dragon-avatar.svg" },
  { label: "Rainbow Unicorn", value: "/assets/images/avatars/rainbow-unicorn-avatar.svg" },
  { label: "Cat", value: "🐱" },
  { label: "Fox", value: "🦊" },
  { label: "Robot", value: "🤖" },
];

function PlayerAvatar({ value, alt }) {
  const isImage = value.startsWith("/") || value.startsWith("//") || value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:image/");
  if (!isImage) return <span className="esm-player-avatar-emoji" role="img" aria-label={alt}>{value}</span>;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={value} alt={alt} />;
}

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

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function getLetterPool(word) {
  const needed = word.split("");
  const extra = shuffle(ALPHABET.filter(l => !needed.includes(l))).slice(0, Math.max(4, 8 - needed.length));
  return shuffle([...needed, ...extra]);
}

function getMissingChoices(word, index) {
  const answer = word[index];
  const distractors = shuffle(ALPHABET.filter(letter => letter !== answer)).slice(0, 4);
  return shuffle([answer, ...distractors]);
}

export default function EmojiSpellingMaster({ onComplete, startAtMenu = false }) {
  const { completeGame, setState, state: player } = useGame();
  const [screen, setScreen] = useState(startAtMenu ? "start" : "player-info"); // player-info | start | game | over
  const menuStageRef = useRef(null);
  const menuArtStyle = useCoverArtStyle(menuStageRef, 1672 / 941, 941 / 1672, screen === "start");
  const [mode, setMode] = useState("spell");
  const [level, setLevel] = useState("easy");
  const [menuLevel, setMenuLevel] = useState("easy");
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
  const [missingChoices, setMissingChoices] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const playerName = player.name?.trim() || "Explorer";
  const [playerNameInput, setPlayerNameInput] = useState(player.name === "Explorer" ? "" : player.name);
  const [avatarInput, setAvatarInput] = useState(player.avatar);

  useEffect(() => {
    const showMainMenu = () => setScreen("start");
    window.addEventListener("emoji-spelling:main-menu", showMainMenu);
    return () => window.removeEventListener("emoji-spelling:main-menu", showMainMenu);
  }, []);

  useEffect(() => {
    if (screen !== "game") return undefined;
    const timer = window.setInterval(() => setTimeLeft(value => value > 0 ? value - 1 : 30), 1000);
    return () => window.clearInterval(timer);
  }, [screen, qIdx]);

  const startGame = useCallback((lvl) => {
    const qs = shuffle(DATA[lvl]);
    setMode("spell");
    setLevel(lvl);
    setQuestions(qs);
    setQIdx(0);
    setScore(0);
    setCorrectCount(0);
    setLives(5);
    setTimeLeft(30);
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
    setTimeLeft(30);
    setFeedback("");
    setWon(false);
    const missingIndex = Math.floor(Math.random() * qs[0].word.length);
    setMissing({ index: missingIndex, choice: null });
    setMissingChoices(getMissingChoices(qs[0].word, missingIndex));
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
      const missingIndex = Math.floor(Math.random() * questions[nextIdx].word.length);
      setMissing({ index: missingIndex, choice: null });
      setMissingChoices(getMissingChoices(questions[nextIdx].word, missingIndex));
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

  if (screen === "player-info") return (
    <div className="esm-screen esm-screen--player-info" data-screen="player-info">
      <form
        className="esm-player-setup"
        onSubmit={event => {
          event.preventDefault();
          const name = playerNameInput.trim();
          if (!name) return;
          setState({ name, avatar: avatarInput });
          setScreen("start");
        }}
      >
        <div className="esm-player-setup-heading">
          <PlayerAvatar value={avatarInput} alt="Selected player avatar" />
          <div><h1>Who&apos;s playing?</h1><p>Choose a name and avatar for your game.</p></div>
        </div>
        <label htmlFor="esm-player-name">Player name</label>
        <input
          id="esm-player-name"
          autoComplete="name"
          maxLength={32}
          required
          value={playerNameInput}
          onChange={event => setPlayerNameInput(event.target.value)}
          placeholder="Enter your name"
        />
        <fieldset className="esm-player-avatar-picker">
          <legend>Choose your avatar</legend>
          <div>
            {PLAYER_AVATARS.map(avatar => (
              <button
                key={avatar.value}
                type="button"
                className={avatarInput === avatar.value ? "is-selected" : ""}
                aria-label={avatar.label}
                aria-pressed={avatarInput === avatar.value}
                onClick={() => setAvatarInput(avatar.value)}
              >
                <PlayerAvatar value={avatar.value} alt="" />
              </button>
            ))}
          </div>
        </fieldset>
        <button className="esm-player-setup-submit" type="submit">Save &amp; continue</button>
      </form>
    </div>
  );

  if (screen === "start") return (
    <div className="esm-screen esm-screen--menu" data-screen="menu" ref={menuStageRef}>
      <div className="esm-menu-controls" style={menuArtStyle} role="group" aria-label="Choose a difficulty and game mode">
        {["easy", "medium", "hard"].map(lvl => (
          <button
            key={lvl}
            type="button"
            className={`esm-menu-button esm-level-${lvl}`}
            aria-label={`${lvl} difficulty`}
            aria-pressed={menuLevel === lvl}
            onClick={() => { setMenuLevel(lvl); setLevel(lvl); }}
          />
        ))}
        <button
          type="button"
          className="esm-menu-button esm-mode-spell"
          aria-label={`Spell the word, ${menuLevel} difficulty`}
          onClick={() => startGame(menuLevel)}
        />
        <button
          type="button"
          className="esm-menu-button esm-mode-missing"
          aria-label={`Choose the missing letter, ${menuLevel} difficulty`}
          onClick={() => startMissing(menuLevel)}
        />
      </div>
    </div>
  );

  if (screen === "over") return (
    <div className="esm-screen esm-screen--over" data-screen="over" style={{
      alignItems: "center", justifyContent: "center",
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
    <div className="esm-screen esm-screen--game" data-screen="game" style={{ alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif", color: "#e0e7ff", padding: 24 }}>
      <div className="esm-game-content">
        <div className="esm-game-hud">
          <span className="esm-player-identity"><PlayerAvatar value={player.avatar} alt={`${playerName}'s avatar`} /><span>{playerName}</span></span>
          <span className="esm-lives" role="img" aria-label={`${lives} of 5 lives remaining`}>
            {Array.from({ length: 5 }, (_, i) => <span key={i} className={`esm-life${i < lives ? " is-active" : ""}`} aria-hidden="true">♥</span>)}
          </span>
          <span className={`esm-timer${timeLeft <= 10 ? " is-urgent" : ""}`} role="timer" aria-label={`${timeLeft} seconds remaining`}>
            <span className="esm-timer-icon" aria-hidden="true">◷</span><span className="esm-timer-value">{timeLeft}</span><span className="esm-timer-unit">sec</span>
          </span>
        </div>
        <div className={`esm-card${feedback === "correct" ? " is-correct" : feedback === "wrong" ? " is-wrong" : ""}`}>
          <div style={{ fontSize: "clamp(4rem, 12vw, 8rem)" }}>{current.emoji}</div>
          <h2 style={{ fontSize: "clamp(2rem, 6vw, 4rem)", letterSpacing: 8 }}>{current.word.split("").map((letter, index) => index === missing.index ? (missing.choice || "_") : letter).join("")}</h2>
          <p>Which letter completes the word?</p>
          <div className="esm-answer-grid esm-answer-grid--missing">{missingChoices.map(letter => <button key={letter} disabled={!!feedback} onClick={() => chooseMissing(letter)}>{letter}</button>)}</div>
          {feedback && <p style={{ color: feedback === "correct" ? "#4ade80" : "#f87171", fontWeight: 700 }}>{feedback === "correct" ? "✅ Correct!" : `❌ The answer is ${current.word[missing.index]}`}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="esm-screen esm-screen--game" data-screen="game" style={{
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", color: "#e0e7ff", padding: 24,
    }}>
      <div className="esm-game-content">
        <div className="esm-game-hud">
          <span className="esm-player-identity"><PlayerAvatar value={player.avatar} alt={`${playerName}'s avatar`} /><span>{playerName}</span></span>
          <span className="esm-lives" role="img" aria-label={`${lives} of 5 lives remaining`}>
            {Array.from({ length: 5 }, (_, i) => <span key={i} className={`esm-life${i < lives ? " is-active" : ""}`} aria-hidden="true">♥</span>)}
          </span>
          <span className={`esm-timer${timeLeft <= 10 ? " is-urgent" : ""}`} role="timer" aria-label={`${timeLeft} seconds remaining`}>
            <span className="esm-timer-icon" aria-hidden="true">◷</span><span className="esm-timer-value">{timeLeft}</span><span className="esm-timer-unit">sec</span>
          </span>
        </div>

        <div
          className={`esm-card${feedback === "correct" ? " is-correct" : feedback === "wrong" ? " is-wrong" : ""}`}
          style={{ textAlign: "center", marginBottom: 20 }}
        >
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
        <div className="esm-answer-grid esm-answer-grid--letters">
          {letterPool.map((letter, i) => (
            <button key={i} onClick={() => tapLetter(i, letter)}
              disabled={usedPoolIdx.has(i) || !!feedback}
              className={usedPoolIdx.has(i) ? "is-used" : ""}>
              {letter}
            </button>
          ))}
        </div>

        <div className="esm-game-actions">
          <button type="button" onClick={removeLast}>⌫ Back</button>
          <button type="button" onClick={() => { setTyped([]); setUsedPoolIdx(new Set()); }}>🔄 Clear</button>
        </div>
      </div>
    </div>
  );
}
