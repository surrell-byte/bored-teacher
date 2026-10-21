"use client";

import { useEffect, useRef, useState } from "react";
import { TIC_TAC_ROLL_THEMES } from "../tictacroll/themes";
import { createDistinctQuestionDecks } from "./question-decks";
import QUESTIONS from "./questions.json";
import "./quick-fire.css";

const ROUND_SECONDS = 30;
const POINTS_PER_CORRECT = 10;
const STREAK_BONUS_INTERVAL = 3;
const STREAK_BONUS_POINTS = 5;
const TOPICS = ["Mixed", "General Knowledge", "Science", "Nature", "English", "Sports"];

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const otherIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[otherIndex]] = [shuffled[otherIndex], shuffled[index]];
  }
  return shuffled;
}

function getTopicQuestions(topic) {
  return topic === "Mixed" ? Object.values(QUESTIONS).flat() : QUESTIONS[topic] || [];
}

const THEME_OPTIONS = ["kalahari", "dice", "night"];
const DIE_PIPS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Die({ value, rolling, theme }) {
  return (
    <div className={`qf-die ${rolling ? "is-rolling" : ""}`} role="img" aria-label={`Die showing ${value}`} style={{ "--die-ink": theme.text, "--die-surface": theme.surface }}>
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className={DIE_PIPS[value].includes(index) ? "has-pip" : ""} />
      ))}
    </div>
  );
}

export default function QuickFire({ onComplete }) {
  const [phase, setPhase] = useState("players");
  const [mode, setMode] = useState("solo");
  const [playerNames, setPlayerNames] = useState(["Player 1", "Player 2"]);
  const [themeId, setThemeId] = useState("night");
  const [topic, setTopic] = useState("Mixed");
  const [questionDeck, setQuestionDeck] = useState([]);
  const [battleDecks, setBattleDecks] = useState([[], []]);
  const [playerResults, setPlayerResults] = useState([null, null]);
  const [turnIndex, setTurnIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [diceValues, setDiceValues] = useState([null, null]);
  const [rollingDie, setRollingDie] = useState(null);
  const [diceTied, setDiceTied] = useState(false);
  const [diceWinner, setDiceWinner] = useState(null);
  const deadlineRef = useRef(0);
  const feedbackTimeoutRef = useRef(null);
  const diceTimeoutRef = useRef(null);
  const completedRef = useRef(false);
  const currentQuestion = questionDeck.length ? questionDeck[questionIndex % questionDeck.length] : null;
  const timerPercent = (timeLeft / ROUND_SECONDS) * 100;
  const selectedTheme = TIC_TAC_ROLL_THEMES.find((item) => item.id === themeId) || TIC_TAC_ROLL_THEMES[0];
  const themeStyle = {
    "--qf-page": selectedTheme.bg,
    "--qf-surface": selectedTheme.surface,
    "--qf-card": selectedTheme.card,
    "--qf-ink": selectedTheme.text,
    "--qf-muted": selectedTheme.muted,
    "--qf-line": selectedTheme.border,
    "--qf-accent": selectedTheme.accent,
    "--qf-accent-2": selectedTheme.accent2,
    "--qf-glow": selectedTheme.glow,
    "--qf-shadow": selectedTheme.shadow,
    "--qf-success": themeId === "night" ? "#63e5a5" : "#16885a",
    "--qf-error": themeId === "night" ? "#ff9299" : "#c32d43",
  };

  const completeBattle = (results) => {
    const totalScore = results.reduce((total, result) => total + (result?.score || 0), 0);
    const totalAnswered = results.reduce((total, result) => total + (result?.answeredCount || 0), 0);
    const totalCorrect = results.reduce((total, result) => total + (result?.correctCount || 0), 0);
    onComplete?.(totalScore, totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0);
  };

  const finishRound = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current);
      feedbackTimeoutRef.current = null;
    }
    setTimeLeft(0);
    const result = { score, correctCount, answeredCount, bestStreak };
    if (mode === "battle") {
      setPlayerResults((current) => {
        const next = [...current];
        next[turnIndex] = result;
        return next;
      });
      if (turnIndex === 0) {
        setPhase("handoff");
      } else {
        const firstResult = playerResults[0];
        if (firstResult?.score === score) {
          setPhase("tiebreak");
        } else {
          setPhase("finished");
          completeBattle([firstResult, result]);
        }
      }
    } else {
      setPhase("finished");
      const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;
      onComplete?.(score, accuracy);
    }
  };
  const finishRoundRef = useRef(finishRound);
  finishRoundRef.current = finishRound;

  useEffect(() => {
    if (phase !== "playing") return undefined;
    const updateTimer = () => {
      const remaining = Math.max(0, deadlineRef.current - Date.now());
      setTimeLeft(Math.ceil(remaining / 1000));
      if (remaining <= 0) finishRoundRef.current();
    };
    updateTimer();
    const interval = window.setInterval(updateTimer, 100);
    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => () => {
    if (feedbackTimeoutRef.current !== null) window.clearTimeout(feedbackTimeoutRef.current);
    if (diceTimeoutRef.current !== null) window.clearTimeout(diceTimeoutRef.current);
  }, []);

  const startTurn = (deck, playerIndex) => {
    if (feedbackTimeoutRef.current !== null) window.clearTimeout(feedbackTimeoutRef.current);
    completedRef.current = false;
    setTurnIndex(playerIndex);
    setQuestionDeck(deck);
    setQuestionIndex(0);
    setTimeLeft(ROUND_SECONDS);
    setScore(0);
    setCorrectCount(0);
    setAnsweredCount(0);
    setStreak(0);
    setBestStreak(0);
    setFeedback(null);
    setSelectedAnswer("");
    deadlineRef.current = Date.now() + ROUND_SECONDS * 1000;
    setPhase("playing");
  };

  const beginGame = () => {
    const questions = shuffle(getTopicQuestions(topic));
    const decks = mode === "battle"
      ? createDistinctQuestionDecks(questions)
      : [questions, []];
    setBattleDecks(decks);
    setPlayerResults([null, null]);
    setDiceValues([null, null]);
    setDiceTied(false);
    setDiceWinner(null);
    startTurn(decks[0], 0);
  };

  const startSecondTurn = () => startTurn(battleDecks[1], 1);

  const advanceQuestion = () => {
    setQuestionIndex((index) => index + 1);
    setFeedback(null);
    setSelectedAnswer("");
  };

  const chooseAnswer = (option) => {
    if (phase !== "playing" || feedback !== null || !currentQuestion) return;
    const isCorrect = option === currentQuestion.answer;
    setSelectedAnswer(option);
    setAnsweredCount((count) => count + 1);
    if (isCorrect) {
      const nextStreak = streak + 1;
      const earnsBonus = nextStreak % STREAK_BONUS_INTERVAL === 0;
      setFeedback(earnsBonus ? "bonus" : "correct");
      setCorrectCount((count) => count + 1);
      setStreak(nextStreak);
      setBestStreak((best) => Math.max(best, nextStreak));
      setScore((current) => current + POINTS_PER_CORRECT + (earnsBonus ? STREAK_BONUS_POINTS : 0));
    } else {
      setFeedback("wrong");
      setStreak(0);
    }
    feedbackTimeoutRef.current = window.setTimeout(advanceQuestion, 550);
  };

  const skipQuestion = () => {
    if (phase !== "playing" || feedback !== null) return;
    advanceQuestion();
  };

  const backToSetup = () => {
    if (feedbackTimeoutRef.current !== null) window.clearTimeout(feedbackTimeoutRef.current);
    setFeedback(null);
    setPhase("setup");
  };

  const rollTieBreakDie = () => {
    const playerIndex = diceValues[0] === null ? 0 : 1;
    if (rollingDie !== null || diceValues[playerIndex] !== null) return;
    setRollingDie(playerIndex);
    diceTimeoutRef.current = window.setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      const nextValues = [...diceValues];
      nextValues[playerIndex] = roll;
      setDiceValues(nextValues);
      setRollingDie(null);
      diceTimeoutRef.current = null;
      if (nextValues[0] !== null && nextValues[1] !== null) {
        if (nextValues[0] === nextValues[1]) {
          setDiceTied(true);
        } else {
          setDiceWinner(nextValues[0] > nextValues[1] ? 0 : 1);
          setPhase("finished");
          completeBattle(playerResults);
        }
      }
    }, 750);
  };

  const rerollTie = () => {
    setDiceValues([null, null]);
    setDiceTied(false);
  };

  const winningPlayer = diceWinner === null
    ? playerResults[0]?.score > playerResults[1]?.score ? 0 : 1
    : diceWinner;

  return (
    <div className="qf-root" data-theme={themeId} style={themeStyle}>
      <div className="qf-shell">
        {phase === "players" && (
          <section className="qf-panel qf-setup-panel qf-player-panel">
            <div className="qf-hero-icon" aria-hidden="true">🎮</div>
            <h2 className="qf-title">Who&apos;s playing?</h2>
            <p className="qf-intro">Choose a game mode, enter player names, and pick a look for your quiz.</p>

            <div className="qf-mode-grid" role="group" aria-label="Game mode">
              <button className={`qf-mode-button ${mode === "solo" ? "is-selected" : ""}`} type="button" onClick={() => setMode("solo")} aria-pressed={mode === "solo"}>
                <strong>Solo play</strong><span>Beat your own score</span>
              </button>
              <button className={`qf-mode-button ${mode === "battle" ? "is-selected" : ""}`} type="button" onClick={() => setMode("battle")} aria-pressed={mode === "battle"}>
                <strong>2-player battle</strong><span>Take turns and outscore a friend</span>
              </button>
            </div>

            <div className="qf-player-inputs">
              <label className="qf-field">
                <span>Player 1 name</span>
                <input value={playerNames[0]} onChange={(event) => setPlayerNames((current) => [event.target.value, current[1]])} maxLength={18} placeholder="Enter a name" />
              </label>
              {mode === "battle" && (
                <label className="qf-field">
                  <span>Player 2 name</span>
                  <input value={playerNames[1]} onChange={(event) => setPlayerNames((current) => [current[0], event.target.value])} maxLength={18} placeholder="Enter a name" />
                </label>
              )}
            </div>

            <div className="qf-topic-heading">Choose a theme</div>
            <div className="qf-theme-grid">
              {THEME_OPTIONS.map((id) => {
                const theme = TIC_TAC_ROLL_THEMES.find((item) => item.id === id);
                return (
                  <button className={`qf-theme-button ${themeId === id ? "is-selected" : ""}`} key={id} type="button" onClick={() => setThemeId(id)} aria-pressed={themeId === id}>
                    <span className="qf-theme-swatch" style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent2})` }} />
                    <span>{theme.name}</span>
                    {themeId === id && <span className="qf-topic-check" aria-hidden="true">✓</span>}
                  </button>
                );
              })}
            </div>

            <button className="qf-primary-button" type="button" onClick={() => setPhase("setup")} disabled={!playerNames[0].trim() || (mode === "battle" && !playerNames[1].trim())}>
              Continue <span aria-hidden="true">→</span>
            </button>
          </section>
        )}

        {phase === "setup" && (
          <section className="qf-panel qf-setup-panel">
            <h2 className="qf-title">A little knowledge goes a long way.</h2>
            <p className="qf-intro">{mode === "battle" ? `${playerNames[0].trim()} and ${playerNames[1].trim()} each get a separate 30-second turn.` : `${playerNames[0].trim()}, answer as many questions as you can before time runs out.`}</p>

            <div className="qf-rules">
              <div className="qf-rule-card"><span className="qf-rule-icon">⏱</span><strong>30 seconds</strong><small>{mode === "battle" ? "Each player's turn" : "One fast round"}</small></div>
              <div className="qf-rule-card"><span className="qf-rule-icon">✦</span><strong>10 points</strong><small>For each correct answer</small></div>
              <div className="qf-rule-card"><span className="qf-rule-icon">🔥</span><strong>Streak bonus</strong><small>+5 every 3 in a row</small></div>
            </div>

            <div className="qf-setup-actions">
              <button className="qf-text-button" type="button" onClick={() => setPhase("players")}>← Players and theme</button>
              <span className="qf-current-theme">{selectedTheme.name}</span>
            </div>
            <div className="qf-topic-heading">Choose your topic</div>
            <div className="qf-topic-grid">
              {TOPICS.map((item) => (
                <button
                  className={`qf-topic-button ${topic === item ? "is-selected" : ""}`}
                  key={item}
                  type="button"
                  onClick={() => setTopic(item)}
                  aria-pressed={topic === item}
                >
                  {item === "Mixed" ? "🎲" : item === "General Knowledge" ? "🌍" : item === "Science" ? "🧪" : item === "Nature" ? "🌿" : item === "English" ? "📚" : "🏅"}
                  <span>{item}</span>
                  {topic === item && <span className="qf-topic-check" aria-hidden="true">✓</span>}
                </button>
              ))}
            </div>

            <button className="qf-primary-button" onClick={beginGame} type="button">
              {mode === "battle" ? "Start battle" : "Start 30-second round"} <span aria-hidden="true">→</span>
            </button>
            <p className="qf-small-note">No penalty for a wrong answer. Keep moving and trust your first thought!</p>
          </section>
        )}

        {phase === "playing" && currentQuestion && (
          <section className="qf-game-panel">
            <div className="qf-game-topline">
              <button className="qf-text-button" type="button" onClick={backToSetup}>← Exit round</button>
              <span className="qf-playing-topic">{mode === "battle" ? `${playerNames[turnIndex].trim()}'S TURN` : (topic === "Mixed" ? "MIXED TOPICS" : topic.toUpperCase())}</span>
            </div>
            {mode === "battle" && <div className="qf-battle-turn" aria-live="polite">Battle turn {turnIndex + 1} of 2 · {topic === "Mixed" ? "Mixed topics" : topic}</div>}

            <div className="qf-timer-card">
              <div className="qf-timer-meta"><span>TIME REMAINING</span><span>{Math.round(timerPercent)}%</span></div>
              <div className={`qf-timer-number ${timeLeft <= 10 ? "is-urgent" : ""}`} aria-live="polite">
                <span className="qf-clock-icon">◷</span> 00:{String(timeLeft).padStart(2, "0")}
              </div>
              <div className="qf-timer-track"><div className={`qf-timer-fill ${timeLeft <= 10 ? "is-urgent" : ""}`} style={{ width: `${timerPercent}%` }} /></div>
            </div>

            <div className="qf-stats-row">
              <div className="qf-stat-card"><span className="qf-stat-label">SCORE</span><strong>{score}</strong><span className="qf-stat-unit">POINTS</span></div>
              <div className="qf-stat-card"><span className="qf-stat-label">CORRECT</span><strong>{correctCount}</strong><span className="qf-stat-unit">ANSWERS</span></div>
              <div className="qf-stat-card"><span className="qf-stat-label">STREAK</span><strong>{streak} <span className="qf-streak-flame">🔥</span></strong><span className="qf-stat-unit">IN A ROW</span></div>
            </div>

            <div className="qf-question-card">
              <div className="qf-question-meta"><span>QUESTION {questionIndex + 1}</span><span className="qf-points-pill">+{POINTS_PER_CORRECT} PTS</span></div>
              <h2>{currentQuestion.question}</h2>
              <div className="qf-options-grid">
                {currentQuestion.options.map((option, index) => {
                  let stateClass = "";
                  if (feedback && option === currentQuestion.answer) stateClass = "is-correct";
                  else if (feedback === "wrong" && option === selectedAnswer) stateClass = "is-wrong";
                  return (
                    <button
                      key={`${currentQuestion.question}-${option}`}
                      className={`qf-option-button ${stateClass}`}
                      type="button"
                      onClick={() => chooseAnswer(option)}
                      disabled={feedback !== null}
                    >
                      <span className="qf-option-letter">{String.fromCharCode(65 + index)}</span>
                      <span>{option}</span>
                      {feedback && option === currentQuestion.answer && <span className="qf-option-result">✓</span>}
                      {feedback === "wrong" && option === selectedAnswer && <span className="qf-option-result">×</span>}
                    </button>
                  );
                })}
              </div>
              <div className="qf-question-footer">
                <span className={`qf-feedback ${feedback ? `is-${feedback}` : ""}`} aria-live="polite">
                  {feedback === "bonus" ? "Correct! Streak bonus earned!" : feedback === "correct" ? "Correct! +10 points" : feedback === "wrong" ? "Not quite — keep going!" : "Choose the best answer"}
                </span>
                <button className="qf-skip-button" type="button" onClick={skipQuestion} disabled={feedback !== null}>Skip →</button>
              </div>
            </div>
          </section>
        )}

        {phase === "handoff" && (
          <section className="qf-panel qf-results-panel">
            <div className="qf-results-icon" aria-hidden="true">🤝</div>
            <h2 className="qf-title">Pass the game to {playerNames[1].trim()}</h2>
            <p className="qf-intro">{playerNames[0].trim()} has finished their turn. {playerNames[1].trim()} gets a fresh set of questions and 30 seconds to score.</p>
            <button className="qf-primary-button" type="button" onClick={startSecondTurn}>Start {playerNames[1].trim()}&apos;s turn <span aria-hidden="true">→</span></button>
          </section>
        )}

        {phase === "tiebreak" && (
          <section className="qf-panel qf-results-panel qf-tiebreak-panel">
            <div className="qf-results-icon" aria-hidden="true">🎲</div>
            <h2 className="qf-title">It&apos;s a tie!</h2>
            <p className="qf-intro">Both players scored {playerResults[0]?.score} points. Roll the die to decide the winner.</p>
            <div className="qf-dice-row">
              {[0, 1].map((index) => (
                <div className="qf-dice-player" key={index}>
                  <span>{playerNames[index].trim()}</span>
                  <Die value={diceValues[index] || 1} rolling={rollingDie === index} theme={selectedTheme} />
                  {diceValues[index] !== null && <strong>{diceValues[index]}</strong>}
                </div>
              ))}
            </div>
            {diceTied ? (
              <>
                <p className="qf-dice-message" aria-live="polite">The die rolls tied. Roll again to decide the winner.</p>
                <button className="qf-primary-button" type="button" onClick={rerollTie}>Roll again <span aria-hidden="true">↻</span></button>
              </>
            ) : (
              <button className="qf-primary-button" type="button" onClick={rollTieBreakDie} disabled={rollingDie !== null}>
                {diceValues[0] === null ? `${playerNames[0].trim()} roll` : `${playerNames[1].trim()} roll`}
                <span aria-hidden="true">🎲</span>
              </button>
            )}
          </section>
        )}

        {phase === "finished" && (
          <section className="qf-panel qf-results-panel">
            <div className="qf-results-icon" aria-hidden="true">{mode === "battle" ? "🏆" : "⏱️"}</div>
            <h2 className="qf-title qf-results-title">{mode === "battle" ? `${playerNames[winningPlayer].trim()} wins!` : "Time's up!"}</h2>
            {mode === "battle" ? (
              <>
                <p className="qf-intro">{diceWinner !== null ? "The die roll decided the battle." : "Here are the final battle scores."}</p>
                <div className="qf-battle-scores">
                  {[0, 1].map((index) => (
                    <div className={`qf-battle-score ${winningPlayer === index ? "is-winner" : ""}`} key={index}>
                      <span>{playerNames[index].trim()}{winningPlayer === index ? " · WINNER" : ""}</span>
                      <strong>{playerResults[index]?.score ?? 0}</strong>
                      <small>{playerResults[index]?.correctCount ?? 0} correct answers</small>
                      {diceValues[index] !== null && <small>Die roll: {diceValues[index]}</small>}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="qf-intro">{playerNames[0].trim()}, here&apos;s how you did.</p>
                <div className="qf-final-score-card">
                  <span>YOUR FINAL SCORE</span>
                  <strong>{score}</strong>
                  <small>POINTS</small>
                </div>
                <div className="qf-results-stats">
                  <div><strong>{correctCount}</strong><span>Correct answers</span></div>
                  <div><strong>{answeredCount}</strong><span>Questions answered</span></div>
                  <div><strong>{bestStreak}</strong><span>Best streak</span></div>
                </div>
              </>
            )}
            <div className="qf-results-actions">
              <button className="qf-primary-button" type="button" onClick={beginGame}>Play again <span aria-hidden="true">↻</span></button>
              <button className="qf-secondary-button" type="button" onClick={backToSetup}>Change topic</button>
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
