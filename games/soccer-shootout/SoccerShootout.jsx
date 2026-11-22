"use client";

import { useEffect, useRef, useState } from "react";
import QUIZ_QUESTIONS from "../quick-fire/questions.json";
import "./soccerShootout.css";

const SHOT_LIMIT = 5;
const SHOT_ANIMATION_MS = 850;
const SHOT_RESULT_HOLD_MS = 180;
const DIRECTIONS = [
  { id: "left", label: "Left corner", shortLabel: "LEFT" },
  { id: "center", label: "Center", shortLabel: "CENTER" },
  { id: "right", label: "Right corner", shortLabel: "RIGHT" },
];
const KEEPER_POSITIONS = { left: "40%", center: "50%", right: "60%" };
const SHOT_TARGETS = {
  left: { x: "39.33%", y: "39.5%" },
  center: { x: "50%", y: "39.5%" },
  right: { x: "60.67%", y: "39.5%" },
};
const ESL_QUESTIONS = QUIZ_QUESTIONS.English;

function randomIndex(length) {
  const value = new Uint32Array(1);
  window.crypto.getRandomValues(value);
  return Math.floor((value[0] / 0x100000000) * length);
}

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = randomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function createEslQuestionDeck() {
  return shuffle(ESL_QUESTIONS).map((question) => ({
    ...question,
    options: shuffle(question.options),
  }));
}

function shuffledKeeperDirections() {
  const directions = DIRECTIONS.map(({ id }) => id);
  for (let index = directions.length - 1; index > 0; index--) {
    const swapIndex = randomIndex(index + 1);
    [directions[index], directions[swapIndex]] = [directions[swapIndex], directions[index]];
  }
  return directions;
}

export default function SoccerShootout({ onComplete }) {
  const [screen, setScreen] = useState("menu");
  const [mode, setMode] = useState("classic");
  const [playerCount, setPlayerCount] = useState(1);
  const [playerNames, setPlayerNames] = useState(["", ""]);
  const [shotNumber, setShotNumber] = useState(0);
  const [playerGoals, setPlayerGoals] = useState([0, 0]);
  const [aim, setAim] = useState(null);
  const [keeper, setKeeper] = useState("center");
  const [keeperPose, setKeeperPose] = useState("ready");
  const [phase, setPhase] = useState("ready");
  const [feedback, setFeedback] = useState("");
  const [answerFeedback, setAnswerFeedback] = useState("");
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [questionDeck, setQuestionDeck] = useState([]);
  const [results, setResults] = useState([]);
  const keeperChoicesRef = useRef([]);
  const shotTimerRef = useRef(null);

  const maxShots = SHOT_LIMIT * playerCount;
  const completedShots = Math.min(shotNumber, maxShots);
  const activePlayerIndex = playerCount === 2 ? Math.min(shotNumber, maxShots - 1) % 2 : 0;
  const playerName = playerNames[activePlayerIndex].trim() || `Player ${activePlayerIndex + 1}`;
  const currentQuestion = questionDeck[shotNumber];
  const shotInTurn = playerCount === 2
    ? Math.floor(completedShots / 2) + 1
    : completedShots + 1;
  const winnerIndex = playerGoals[0] === playerGoals[1] ? -1 : playerGoals[0] > playerGoals[1] ? 0 : 1;
  const scoreLabel = playerCount === 2
    ? `${playerNames[0]} has ${playerGoals[0]} ${playerGoals[0] === 1 ? "goal" : "goals"}, ${playerNames[1]} has ${playerGoals[1]} ${playerGoals[1] === 1 ? "goal" : "goals"}`
    : `${playerNames[0]} has ${playerGoals[0]} ${playerGoals[0] === 1 ? "goal" : "goals"}`;

  useEffect(() => () => {
    if (shotTimerRef.current !== null) window.clearTimeout(shotTimerRef.current);
  }, []);

  useEffect(() => {
    const handleMainMenu = () => returnToMenu();
    window.addEventListener("soccer-shootout:main-menu", handleMainMenu);
    return () => window.removeEventListener("soccer-shootout:main-menu", handleMainMenu);
  }, []);

  const startGame = () => {
    if (!playerNames[0].trim() || (playerCount === 2 && !playerNames[1].trim())) return;
    if (shotTimerRef.current !== null) window.clearTimeout(shotTimerRef.current);
    shotTimerRef.current = null;
    setShotNumber(0);
    setPlayerGoals([0, 0]);
    setAim(null);
    setKeeper("center");
    setKeeperPose("ready");
    setPhase(mode === "esl" ? "question" : "ready");
    setFeedback(mode === "esl" ? "Answer correctly to unlock your shot." : "Choose a corner, then take your shot.");
    setAnswerFeedback("");
    setSelectedAnswer("");
    setQuestionDeck(mode === "esl" ? createEslQuestionDeck() : []);
    setResults([]);
    keeperChoicesRef.current = [];
    setScreen("game");
  };

  const returnToMenu = () => {
    if (shotTimerRef.current !== null) window.clearTimeout(shotTimerRef.current);
    shotTimerRef.current = null;
    setAim(null);
    setPhase("ready");
    setScreen("menu");
  };

  const chooseAim = (direction) => {
    if (screen !== "game" || phase !== "ready") return;
    setAim(direction);
    setFeedback("Aim locked. Take your shot!");
  };

  const answerQuestion = (answer) => {
    if (phase !== "question" || !currentQuestion) return;
    setSelectedAnswer(answer);
    if (answer === currentQuestion.answer) {
      setAnswerFeedback("");
      setFeedback("Correct! Choose where to shoot.");
      setPhase("ready");
    } else {
      setAnswerFeedback("Not quite. Try again.");
    }
  };

  const shoot = () => {
    if (screen !== "game" || phase !== "ready" || !aim) return;

    if (keeperChoicesRef.current.length === 0) {
      keeperChoicesRef.current = shuffledKeeperDirections();
    }
    const keeperChoice = keeperChoicesRef.current.pop();
    const scored = aim !== keeperChoice;
    const nextShotNumber = shotNumber + 1;
    const nextPlayerGoals = [...playerGoals];
    if (scored) nextPlayerGoals[activePlayerIndex] += 1;
    const nextTotalGoals = nextPlayerGoals.slice(0, playerCount).reduce((total, goals) => total + goals, 0);
    const nextResults = [...results, { scored, aim, keeper: keeperChoice, player: activePlayerIndex }];

    setKeeper(keeperChoice);
    setKeeperPose(scored ? `dive-${keeperChoice}` : `save-${keeperChoice}`);
    setPhase("kicking");
    setFeedback(scored ? "GOAL!" : "SAVED!");

    shotTimerRef.current = window.setTimeout(() => {
      shotTimerRef.current = null;
      setShotNumber(nextShotNumber);
      setPlayerGoals(nextPlayerGoals);
      setResults(nextResults);
      setAim(null);
      setAnswerFeedback("");
      setSelectedAnswer("");

      if (nextShotNumber >= maxShots) {
        setKeeper("center");
        setKeeperPose(Math.max(...nextPlayerGoals.slice(0, playerCount)) < 3 ? "celebrate" : "disappointed");
        setPhase("complete");
        onComplete?.(nextTotalGoals * 100, Math.round((nextTotalGoals / maxShots) * 100));
      } else {
        setKeeper("center");
        setKeeperPose("ready");
        setFeedback(mode === "esl" ? "Answer correctly to unlock your shot." : "Choose a corner, then take your shot.");
        setPhase(mode === "esl" ? "question" : "ready");
      }
    }, SHOT_ANIMATION_MS + SHOT_RESULT_HOLD_MS);
  };

  const handleKeyDown = (event) => {
    if (event.repeat || screen !== "game" || phase !== "ready") return;
    if (event.target instanceof HTMLElement && event.target.closest("button, input, textarea, select")) return;
    const directionByKey = { "1": "left", "2": "center", "3": "right" };
    if (directionByKey[event.key]) {
      chooseAim(directionByKey[event.key]);
    } else if (event.key === "Enter") {
      event.preventDefault();
      shoot();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  const completionMessage = playerCount === 1
    ? (playerGoals[0] >= 3 ? "WHAT A STRIKER!" : "GOOD GAME!")
    : winnerIndex === -1
      ? "IT'S A DRAW!"
      : `${playerNames[winnerIndex].trim()} WINS!`;

  return (
    <main className={`soccer-shootout ${screen === "menu" || screen === "setup" ? "is-setup-screen" : ""}`} aria-label="Soccer penalty shootout">
      {screen === "menu" && (
        <section className="ss-screen ss-menu-screen" aria-labelledby="ss-menu-title">
          <p className="ss-screen-eyebrow">⚽ PENALTY SHOOTOUT</p>
          <h1 id="ss-menu-title">Choose your mode</h1>
          <p className="ss-screen-description">Pick how you want to play. You can play solo or take turns with a friend.</p>
          <div className="ss-mode-options" role="group" aria-label="Game mode">
            <button
              className={`ss-mode-option ${mode === "classic" ? "is-selected" : ""}`}
              type="button"
              onClick={() => setMode("classic")}
              aria-pressed={mode === "classic"}
            >
              <span className="ss-mode-icon" aria-hidden="true">🥅</span>
              <strong>Classic</strong>
              <span>Aim and shoot. No questions.</span>
              <small>DEFAULT</small>
            </button>
            <button
              className={`ss-mode-option ${mode === "esl" ? "is-selected" : ""}`}
              type="button"
              onClick={() => setMode("esl")}
              aria-pressed={mode === "esl"}
            >
              <span className="ss-mode-icon" aria-hidden="true">📚</span>
              <strong>ESL mode</strong>
              <span>Answer an English question to unlock each shot.</span>
            </button>
          </div>
          <button className="ss-screen-primary" type="button" onClick={() => setScreen("setup")}>
            CONTINUE <span aria-hidden="true">→</span>
          </button>
        </section>
      )}

      {screen === "setup" && (
        <form
          className="ss-screen ss-setup-screen"
          onSubmit={(event) => {
            event.preventDefault();
            startGame();
          }}
        >
          <p className="ss-screen-eyebrow">{mode === "esl" ? "📚 ESL MODE" : "🥅 CLASSIC MODE"}</p>
          <h1>Who&apos;s playing?</h1>
          <p className="ss-screen-description">Choose the number of players and enter their names.</p>
          <div className="ss-player-count" role="group" aria-label="Number of players">
            {[1, 2].map((count) => (
              <button
                key={count}
                className={`ss-player-count-button ${playerCount === count ? "is-selected" : ""}`}
                type="button"
                onClick={() => setPlayerCount(count)}
                aria-pressed={playerCount === count}
              >
                {count} {count === 1 ? "PLAYER" : "PLAYERS"}
              </button>
            ))}
          </div>
          <div className="ss-player-inputs">
            {Array.from({ length: playerCount }, (_, index) => (
              <label className="ss-player-field" key={index} htmlFor={`ss-player-${index + 1}`}>
                <span>PLAYER {index + 1}</span>
                <input
                  id={`ss-player-${index + 1}`}
                  value={playerNames[index]}
                  onChange={(event) => setPlayerNames((current) => current.map((name, nameIndex) => (
                    nameIndex === index ? event.target.value : name
                  )))}
                  maxLength={18}
                  autoComplete={index === 0 ? "given-name" : "off"}
                  placeholder={`Enter player ${index + 1}'s name`}
                  required
                />
              </label>
            ))}
          </div>
          <p className="ss-setup-rule">
            {playerCount === 1
              ? "Take five shots against the goalkeeper."
              : "Take turns for five shots each. Highest score wins."}
            {mode === "esl" ? " Answer each question correctly before choosing a shot." : ""}
          </p>
          <div className="ss-screen-actions">
            <button className="ss-screen-secondary" type="button" onClick={() => setScreen("menu")}>← MODES</button>
            <button className="ss-screen-primary" type="submit">START MATCH <span aria-hidden="true">→</span></button>
          </div>
        </form>
      )}

      {screen === "game" && (
        <>
          <header className="ss-scoreboard">
            <div className="ss-match-label">
              <span aria-hidden="true">⚽</span> {mode === "esl" ? "ESL SHOOTOUT" : "PENALTY SHOOTOUT"}
            </div>
            <div className="ss-score-line" aria-label={scoreLabel}>
              {playerCount === 1 ? (
                <>
                  <span className="ss-team-name">{playerNames[0].trim()}</span>
                  <strong>{playerGoals[0]}<span>–</span>{shotNumber - playerGoals[0]}</strong>
                  <span className="ss-team-name">KEEPER</span>
                </>
              ) : (
                <>
                  <span className="ss-team-name">{playerNames[0].trim()}</span>
                  <strong>{playerGoals[0]}<span>–</span>{playerGoals[1]}</strong>
                  <span className="ss-team-name">{playerNames[1].trim()}</span>
                </>
              )}
            </div>
            <div className="ss-shot-count">
              {phase === "complete"
                ? "FULL TIME"
                : `${playerName} · SHOT ${Math.min(shotInTurn, SHOT_LIMIT)} / ${SHOT_LIMIT}`}
            </div>
          </header>

          <div className="ss-live-message" role="status" aria-live="polite">
            {phase === "complete" ? (
              <>
                <strong>{completionMessage}</strong>
                <span>
                  {playerCount === 1
                    ? `${playerGoals[0]} ${playerGoals[0] === 1 ? "goal" : "goals"} from ${SHOT_LIMIT} shots`
                    : `${playerNames[0]} ${playerGoals[0]} – ${playerGoals[1]} ${playerNames[1]}`}
                </span>
              </>
            ) : (
              <span className={phase === "kicking" ? "is-result" : ""}>{feedback}</span>
            )}
          </div>

          <div className="ss-goal-targets" aria-label="Choose where to aim">
            {DIRECTIONS.map((direction) => (
              <button
                className={`ss-goal-target ${aim === direction.id ? "is-selected" : ""}`}
                type="button"
                key={direction.id}
                aria-label={`Aim for the ${direction.label.toLowerCase()}`}
                aria-pressed={aim === direction.id}
                disabled={phase !== "ready"}
                onClick={() => chooseAim(direction.id)}
              >
                <span>{direction.shortLabel}</span>
              </button>
            ))}
          </div>

          <div
            className={`ss-keeper ss-keeper--${keeperPose} ss-keeper-position--${keeper} ${phase === "kicking" ? "is-diving" : ""}`}
            style={{ "--keeper-position": KEEPER_POSITIONS[keeper] }}
            role="img"
            aria-label="Goalkeeper"
          />

          <div
            className={`ss-ball ${phase === "kicking" ? "is-kicking" : ""}`}
            style={{
              "--shot-x": aim ? SHOT_TARGETS[aim].x : "50%",
              "--shot-y": aim ? SHOT_TARGETS[aim].y : "65%",
            }}
            aria-hidden="true"
          >
            ⚽
          </div>

          {phase === "question" && currentQuestion && (
            <section className="ss-question-panel" aria-labelledby="ss-question-title">
              <p className="ss-question-eyebrow">ESL QUESTION · {playerName}</p>
              <h2 id="ss-question-title">{currentQuestion.question}</h2>
              <p className="ss-question-feedback" aria-live="polite">
                {answerFeedback || "Choose the correct answer to unlock your shot."}
              </p>
              <div className="ss-answer-options">
                {currentQuestion.options.map((option) => (
                  <button
                    className={`ss-answer-option ${selectedAnswer === option && answerFeedback ? "is-incorrect" : ""}`}
                    key={option}
                    type="button"
                    onClick={() => answerQuestion(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </section>
          )}

          {phase !== "question" && (
            <section className="ss-controls" aria-label="Shootout controls">
              <div className="ss-aim-controls">
                {DIRECTIONS.map((direction, index) => (
                  <button
                    type="button"
                    key={direction.id}
                    className={`ss-aim-button ${aim === direction.id ? "is-selected" : ""}`}
                    aria-pressed={aim === direction.id}
                    disabled={phase !== "ready"}
                    onClick={() => chooseAim(direction.id)}
                  >
                    <span>{direction.shortLabel}</span>
                    <kbd>{index + 1}</kbd>
                  </button>
                ))}
              </div>
              {phase === "complete" ? (
                <button type="button" className="ss-shoot-button" onClick={startGame}>PLAY AGAIN</button>
              ) : (
                <button
                  type="button"
                  className="ss-shoot-button"
                  disabled={!aim || phase !== "ready"}
                  onClick={shoot}
                >
                  {phase === "kicking" ? "SHOOTING…" : "KICK IT!"}
                  <span aria-hidden="true"> ↗</span>
                </button>
              )}
              <p className="ss-hint">Pick a corner or press 1, 2, 3 · Enter to shoot</p>
            </section>
          )}

          <div className={`ss-shot-dots ${playerCount === 2 ? "ss-shot-dots--two-player" : ""}`} aria-label={`${completedShots} of ${maxShots} shots taken`}>
            {Array.from({ length: maxShots }, (_, index) => {
              const result = results[index];
              return (
                <span
                  key={index}
                  className={`ss-shot-dot ${result ? (result.scored ? "is-goal" : "is-saved") : ""}`}
                  aria-label={result ? (result.scored ? "Goal" : "Saved") : "Not taken"}
                >
                  {result ? (result.scored ? "✓" : "×") : index + 1}
                </span>
              );
            })}
          </div>
        </>
      )}
    </main>
  );
}
