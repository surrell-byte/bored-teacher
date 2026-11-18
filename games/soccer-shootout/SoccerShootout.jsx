"use client";

import { useEffect, useRef, useState } from "react";
import "./soccerShootout.css";

const SHOT_LIMIT = 5;
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

export default function SoccerShootout({ onComplete }) {
  const [shotNumber, setShotNumber] = useState(0);
  const [goals, setGoals] = useState(0);
  const [aim, setAim] = useState(null);
  const [keeper, setKeeper] = useState("center");
  const [keeperPose, setKeeperPose] = useState("ready");
  const [phase, setPhase] = useState("ready");
  const [feedback, setFeedback] = useState("Choose a corner, then take your shot.");
  const [results, setResults] = useState([]);
  const shotTimerRef = useRef(null);

  useEffect(() => () => {
    if (shotTimerRef.current !== null) window.clearTimeout(shotTimerRef.current);
  }, []);

  const chooseAim = (direction) => {
    if (phase !== "ready") return;
    setAim(direction);
    setFeedback("Aim locked. Take your shot!");
  };

  const shoot = () => {
    if (phase !== "ready" || !aim) return;

    const keeperChoice = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)].id;
    const scored = aim !== keeperChoice;
    const nextShotNumber = shotNumber + 1;
    const nextGoals = goals + Number(scored);
    const nextResults = [...results, { scored, aim, keeper: keeperChoice }];

    setKeeper(keeperChoice);
    setKeeperPose(scored ? `dive-${keeperChoice}` : `save-${keeperChoice}`);
    setPhase("kicking");
    setFeedback(scored ? "GOAL!" : "SAVED!");

    shotTimerRef.current = window.setTimeout(() => {
      setShotNumber(nextShotNumber);
      setGoals(nextGoals);
      setResults(nextResults);
      setAim(null);

      if (nextShotNumber >= SHOT_LIMIT) {
        setKeeper("center");
        setKeeperPose(nextGoals < 3 ? "celebrate" : "disappointed");
        setPhase("complete");
        onComplete?.(nextGoals * 100, Math.round((nextGoals / SHOT_LIMIT) * 100));
      } else {
        setKeeperPose("ready");
        setPhase("ready");
      }
    }, 850);
  };

  const restart = () => {
    if (shotTimerRef.current !== null) window.clearTimeout(shotTimerRef.current);
    shotTimerRef.current = null;
    setShotNumber(0);
    setGoals(0);
    setAim(null);
    setKeeper("center");
    setKeeperPose("ready");
    setPhase("ready");
    setFeedback("Choose a corner, then take your shot.");
    setResults([]);
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.repeat || phase !== "ready") return;
      if (event.target instanceof HTMLElement && event.target.closest("button, input, textarea, select")) return;
      const directionByKey = { "1": "left", "2": "center", "3": "right" };
      if (directionByKey[event.key]) {
        chooseAim(directionByKey[event.key]);
      } else if (event.key === "Enter") {
        event.preventDefault();
        shoot();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  return (
    <main className="soccer-shootout" aria-label="Soccer penalty shootout">
      <header className="ss-scoreboard">
        <div className="ss-match-label"><span aria-hidden="true">⚽</span> PENALTY SHOOTOUT</div>
        <div className="ss-score-line" aria-label={`${goals} goals scored`}>
          <span className="ss-team-name">YOU</span>
          <strong>{goals}<span>–</span>{shotNumber - goals}</strong>
          <span className="ss-team-name">KEEPER</span>
        </div>
        <div className="ss-shot-count">
          {phase === "complete" ? "FULL TIME" : `SHOT ${Math.min(shotNumber + 1, SHOT_LIMIT)} / ${SHOT_LIMIT}`}
        </div>
      </header>

      <div className="ss-live-message" role="status" aria-live="polite">
        {phase === "complete" ? (
          <>
            <strong>{goals >= 3 ? "WHAT A STRIKER!" : "GOOD GAME!"}</strong>
            <span>{goals} {goals === 1 ? "goal" : "goals"} from {SHOT_LIMIT} shots</span>
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
      >
      </div>

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
          <button type="button" className="ss-shoot-button" onClick={restart}>PLAY AGAIN</button>
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

      <div className="ss-shot-dots" aria-label={`${shotNumber} of ${SHOT_LIMIT} shots taken`}>
        {Array.from({ length: SHOT_LIMIT }, (_, index) => {
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
    </main>
  );
}
