"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import "./VolcanoEscape.css";

const GOAL = 15;
const TEAM_COLORS = ["#12b76a", "#f04438", "#a855f7", "#06b6d4"];
const TEAM_ICONS = ["🧑‍🚀", "🧑‍🚒", "🧑‍🎤", "🧑‍🔬"];
const SPIN_OUTCOMES = ["1", "3", "2", "4", "🌋", "🌋"];
const DEFAULT_QUESTIONS = [
  "What planet is known as the Red Planet? | Mars | Venus | Jupiter | Saturn",
  "How many sides does a triangle have? | Three | Two | Four | Five",
  "What do bees make? | Honey | Milk | Bread | Juice",
  "Which ocean is the largest? | Pacific Ocean | Atlantic Ocean | Indian Ocean | Arctic Ocean",
  "What is the opposite of cold? | Hot | Warm | Cool | Freezing",
  "Which animal is the largest on Earth? | Blue whale | Elephant | Giraffe | Great white shark",
  "What is 6 × 7? | 42 | 36 | 48 | 56",
  "What is the past tense of go? | Went | Goes | Going | Gone",
];
const TRACK = [
  { x: 12, y: 80 }, { x: 16, y: 88 }, { x: 22, y: 81 },
  { x: 28, y: 88 }, { x: 35, y: 83 }, { x: 42, y: 81 },
  { x: 49, y: 84 }, { x: 57, y: 83 }, { x: 63, y: 82 },
  { x: 70, y: 88 }, { x: 77, y: 85 }, { x: 83, y: 82 },
  { x: 88, y: 88 }, { x: 91, y: 76 }, { x: 93, y: 65 },
];

function parseQuestions(source) {
  const rows = source.split(/\r?\n/).map((line) => {
    const [prompt = "", answer = "", ...distractors] = line.split("|");
    return {
      prompt: prompt.trim(),
      answer: answer.trim(),
      distractors: distractors.map((choice) => choice.trim()).filter(Boolean),
    };
  }).filter((question) => question.prompt && question.answer);
  const answerPool = [...new Set(rows.map((question) => question.answer))];

  return rows.map((question) => {
    const choices = [...new Set([
      question.answer,
      ...question.distractors.filter((choice) => choice !== question.answer),
      ...answerPool.filter((answer) => answer !== question.answer),
    ])].slice(0, 4);
    for (let index = choices.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [choices[index], choices[swapIndex]] = [choices[swapIndex], choices[index]];
    }
    return {
      ...question,
      choices: choices.length === 4 ? choices : [],
    };
  }).filter((question) => question.choices.length === 4);
}

function Wheel({ rotation, spinning }) {
  return (
    <div className={`ve-wheel-wrap ${spinning ? "is-spinning" : ""}`}>
      <div className="ve-wheel-pointer" aria-hidden="true">▼</div>
      <div className="ve-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
        {SPIN_OUTCOMES.map((outcome, index) => (
          <span className={`ve-wheel-label ve-wheel-label-${index}`} key={`${outcome}-${index}`}>
            {outcome === "🌋" ? <span className="ve-wheel-volcano">{outcome}</span> : outcome}
          </span>
        ))}
        <div className="ve-wheel-hub" aria-hidden="true">▶</div>
      </div>
    </div>
  );
}

export default function VolcanoEscape({ onComplete, profileName = "" }) {
  const [screen, setScreen] = useState("welcome");
  const [gameMode, setGameMode] = useState(null);
  const [teamCount, setTeamCount] = useState(4);
  const [playerName, setPlayerName] = useState(profileName);
  const [names, setNames] = useState([
    profileName ? `${profileName}'s Crew` : "Sunny Sailors",
    "Lava Legends",
    "Cloud Chasers",
    "Forest Flyers",
  ]);
  const [questionText, setQuestionText] = useState(DEFAULT_QUESTIONS.join("\n"));
  const [teams, setTeams] = useState([]);
  const [turn, setTurn] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState("question");
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [message, setMessage] = useState("");
  const [winner, setWinner] = useState(null);
  const spinTimeout = useRef(null);
  const questions = useMemo(() => parseQuestions(questionText), [questionText]);
  const activeTeam = teams[turn];
  const question = questions.length ? questions[questionIndex % questions.length] : null;

  useEffect(() => () => {
    if (spinTimeout.current) clearTimeout(spinTimeout.current);
  }, []);

  function startGame() {
    if (!gameMode) return;
    const nextTeams = Array.from({ length: teamCount }, (_, index) => ({
      name: names[index]?.trim() || `Team ${index + 1}`,
      color: TEAM_COLORS[index],
      icon: TEAM_ICONS[index],
      position: 0,
      shield: false,
    }));
    setTeams(nextTeams);
    setTurn(0);
    setQuestionIndex(0);
    setPhase(gameMode === "esl" ? "question" : "spin");
    setRotation(0);
    setSpinning(false);
    const playerGreeting = playerName.trim() ? `${playerName.trim()} — ` : "";
    setMessage(gameMode === "esl"
      ? `${playerGreeting}${nextTeams[0].name} is up first. Choose the correct answer to spin!`
      : `${playerGreeting}${nextTeams[0].name} is up first. Spin the wheel!`);
    setWinner(null);
    setScreen("game");
  }

  function advanceTurn() {
    setTurn((current) => (current + 1) % teams.length);
    if (gameMode === "esl") setQuestionIndex((current) => current + 1);
    setPhase(gameMode === "esl" ? "question" : "spin");
    setMessage("");
  }

  function answerWrong() {
    setMessage(`${activeTeam.name} chose the wrong answer. The next crew gets a turn.`);
    setPhase("result");
  }

  function answerCorrect() {
    setMessage(`${activeTeam.name} got it right! Spin to escape the volcano.`);
    setPhase("spin");
  }

  function finishGame(winningTeam, finalTeams) {
    setTeams(finalTeams);
    setWinner(winningTeam);
    setScreen("winner");
    onComplete?.(GOAL, 100);
  }

  function applyLanding(team, destination, nextTeams, nextTurn) {
    let position = Math.min(GOAL, destination);
    let shield = team.shield;
    let landingMessage = `${team.name} moved to space ${position}.`;

    if (position === 4 || position === 10) {
      shield = true;
      landingMessage += " Found an Eruption Shield!";
    } else if (position === 6 || position === 12) {
      position = Math.min(GOAL, position + 1);
      landingMessage = `Steam vent boost! ${team.name} hops to space ${position}.`;
    }

    const updatedTeams = nextTeams.map((item, index) =>
      index === nextTurn ? { ...item, position, shield } : item,
    );
    if (position >= GOAL) {
      finishGame(nextTurn, updatedTeams);
      return;
    }
    setTeams(updatedTeams);
    setMessage(landingMessage);
    setPhase("result");
  }

  function spinWheel() {
    if (spinning || phase !== "spin" || !activeTeam) return;
    const outcomeIndex = Math.floor(Math.random() * SPIN_OUTCOMES.length);
    const segmentCenter = outcomeIndex * (360 / SPIN_OUTCOMES.length) + 360 / SPIN_OUTCOMES.length / 2;
    const targetRotation = rotation + 360 * 5 + ((360 - segmentCenter - rotation % 360 + 360) % 360);
    const nextTeams = teams.map((team) => ({ ...team }));
    const currentTeam = { ...nextTeams[turn] };
    const result = SPIN_OUTCOMES[outcomeIndex];
    setRotation(targetRotation);
    setSpinning(true);

    spinTimeout.current = setTimeout(() => {
      setSpinning(false);
      if (result === "🌋") {
        const updatedTeams = nextTeams.map((team) => {
          if (team.shield) return { ...team, shield: false };
          return { ...team, position: Math.max(0, team.position - 2) };
        });
        setTeams(updatedTeams);
        const shieldedCount = nextTeams.filter((team) => team.shield).length;
        setMessage(`VOLCANO ERUPTION! Every unshielded crew slides back 2 spaces.${shieldedCount ? ` ${shieldedCount} shield${shieldedCount > 1 ? "s" : ""} protected their crew.` : ""}`);
        setPhase("result");
        return;
      }

      const move = Number(result);
      applyLanding(currentTeam, currentTeam.position + move, nextTeams, turn);
    }, 3100);
  }

  const scenePath = TRACK.map((point) => `${point.x},${point.y}`).join(" ");

  if (screen === "welcome") {
    return (
      <main className="volcano-escape is-full-screen-canvas">
        <section className="ve-welcome">
          <div className="ve-welcome-art">
            <p className="ve-eyebrow">A classroom team adventure</p>
            <h1>VOLCANO<br /><span>ESCAPE!</span></h1>
            <p>Choose your game mode, spin, and race your crew to safety!</p>
            <button className="ve-button" onClick={() => setScreen("menu")}>TAP HERE <span>→</span></button>
            <small>Normal mode · ESL mode · Team race</small>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "menu") {
    return (
      <main className="volcano-escape is-full-screen-canvas">
        <section className="ve-menu-screen">
          <p className="ve-eyebrow">Choose how to play</p>
          <h1>Main menu</h1>
          <div className="ve-mode-options">
            <button type="button" className="ve-mode-card" onClick={() => { setGameMode("normal"); setScreen("setup"); }}>
              <span aria-hidden="true">🎡</span>
              <strong>Normal mode</strong>
              <small>Spin the wheel and follow the result. No questions.</small>
            </button>
            <button type="button" className="ve-mode-card" onClick={() => { setGameMode("esl"); setScreen("setup"); }}>
              <span aria-hidden="true">📚</span>
              <strong>ESL mode</strong>
              <small>Answer a multiple-choice question before each spin.</small>
            </button>
          </div>
          <button type="button" className="ve-link-button" onClick={() => setScreen("welcome")}>Back</button>
        </section>
      </main>
    );
  }

  if (screen === "setup") {
    return (
      <main className="volcano-escape is-full-screen-canvas">
        <section className="ve-setup">
          <p className="ve-eyebrow">{gameMode === "esl" ? "ESL mode" : "Normal mode"}</p>
          <h1>Player and team info</h1>
          <div className="ve-setup-grid">
            <section className="ve-setup-card">
              <label className="ve-label" htmlFor="ve-player-name">Player / teacher name
                <input id="ve-player-name" value={playerName} maxLength={24} placeholder="Enter your name" onChange={(event) => setPlayerName(event.target.value)} />
              </label>
              <label className="ve-label">Teams
                <select value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))}>
                  {[2, 3, 4].map((count) => <option value={count} key={count}>{count} teams</option>)}
                </select>
              </label>
              {Array.from({ length: teamCount }, (_, index) => (
                <label className="ve-team-name" key={index}>
                  <span style={{ backgroundColor: TEAM_COLORS[index] }}>{TEAM_ICONS[index]}</span>
                  <input value={names[index]} maxLength={18} aria-label={`Team ${index + 1} name`} onChange={(event) => setNames((old) => old.map((name, nameIndex) => nameIndex === index ? event.target.value : name))} />
                </label>
              ))}
            </section>
            {gameMode === "esl" && (
              <section className="ve-setup-card">
                <label className="ve-label" htmlFor="ve-questions">ESL multiple-choice questions</label>
                <p>Use one per line: question | correct answer | wrong choice 1 | wrong choice 2 | wrong choice 3</p>
                <textarea id="ve-questions" value={questionText} rows={8} onChange={(event) => setQuestionText(event.target.value)} />
                {!questions.length && <p className="ve-validation" role="alert">Add at least one complete question with three answer choices.</p>}
              </section>
            )}
          </div>
          <div className="ve-setup-actions">
            <button type="button" className="ve-link-button" onClick={() => setScreen("menu")}>Back to main menu</button>
            <button className="ve-button" disabled={gameMode === "esl" && !questions.length} onClick={startGame}>Start the escape <span>→</span></button>
          </div>
        </section>
      </main>
    );
  }

  if (screen === "winner") {
    return (
      <main className="volcano-escape is-full-screen-canvas">
        <section className="ve-winner">
          <span className="ve-cup">🏆</span>
          <p className="ve-eyebrow">Safe at last!</p>
          <h1>{teams[winner]?.name} made it out!</h1>
          <p>Your crew escaped the eruption first.</p>
          <button className="ve-button" onClick={startGame}>Play again <span>↻</span></button>
          <button className="ve-link-button" onClick={() => setScreen("menu")}>Main menu</button>
        </section>
      </main>
    );
  }

  const spinningRef = spinning;
  return (
    <main className="volcano-escape is-playing">
      <section className="ve-game-shell">
        <div className="ve-score-row">
          {teams.map((team, index) => (
            <div className={`ve-score-card ${index === turn ? "active" : ""}`} style={{ "--team-color": team.color }} key={team.name}>
              <span>{team.icon}</span><strong>{team.name}</strong><b>{team.position}/{GOAL}</b>
              {team.shield && <small>🛡 SHIELD</small>}
            </div>
          ))}
        </div>

        <div className="ve-scene">
          <button className="ve-menu-button ve-scene-menu" onClick={() => setScreen("menu")}>Menu</button>
          <svg className="ve-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={scenePath} fill="none" stroke="#fff0a8" strokeWidth="1.25" strokeDasharray="1.3 1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="ve-start-boat" aria-label="Starting boat">
            <span className="ve-boat-crews">{teams.filter((team) => team.position === 0).map((team) => <i key={team.name} style={{ "--team-color": team.color }}>{team.icon}</i>)}</span>
            <span className="ve-boat-emoji">🛶</span><span className="ve-start-label">START</span>
          </div>
          {TRACK.map((point, index) => {
            const special = index + 1 === 4 || index + 1 === 10 ? "shield" : index + 1 === 6 || index + 1 === 12 ? "boost" : "";
            return (
              <div className={`ve-track-tile ${special}`} key={index} style={{ left: `${point.x}%`, top: `${point.y}%` }}>
                <span>{index + 1}</span>
                <div className="ve-pawns">
                  {teams.filter((team) => team.position === index + 1).map((team) => (
                    <i key={team.name} title={team.name} style={{ "--team-color": team.color }}>{team.icon}</i>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="ve-finish" style={{ left: `${TRACK[GOAL - 1].x}%`, top: `${TRACK[GOAL - 1].y - 10}%` }}>SAFE<br />ZONE 🏁</div>

          <div className="ve-spinner-card">
            <span className="ve-spinner-caption">ESCAPE SPINNER</span>
            <Wheel rotation={rotation} spinning={spinningRef} />
            {phase === "spin" ? (
              <button className="ve-spin-button" onClick={spinWheel} disabled={spinning}>SPIN!</button>
            ) : (
              <div className="ve-spin-hint">{spinning ? "Spinning…" : "Answer to spin"}</div>
            )}
          </div>

          <div className="ve-landmark">🌋</div>
        </div>

        <div className="ve-turn-panel">
          {phase === "question" && gameMode === "esl" && (
            <div className="ve-question">
              <div className="ve-question-content">
                <p className="ve-eyebrow">QUESTION {questionIndex + 1} · {activeTeam?.name}</p>
                <h2>{question?.prompt}</h2>
                <div className="ve-answer-options">
                  {question?.choices.map((choice) => (
                    <button type="button" className="ve-answer-choice" key={choice} onClick={() => choice === question.answer ? answerCorrect() : answerWrong()}>
                      {choice}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          {phase === "spin" && <div className="ve-waiting"><strong>{activeTeam?.name}</strong>, {gameMode === "esl" ? "spin the wheel to find out how far you escape!" : "spin the wheel!"}</div>}
          {phase === "result" && <div className="ve-result"><p>{message}</p><button className="ve-button" onClick={advanceTurn}>Next team <span>→</span></button></div>}
          {message && phase !== "result" && <p className="ve-message" role="status">{message}</p>}
        </div>
      </section>
    </main>
  );
}
