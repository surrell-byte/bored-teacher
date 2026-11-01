"use client";

import { useMemo, useState } from "react";
import "./DoorDash.css";

const TEAM_COLORS = ["#f97316", "#38bdf8", "#a78bfa", "#34d399"];
const DEFAULT_QUESTIONS = [
  "What planet is known as the Red Planet? | Mars",
  "What is the opposite of empty? | Full",
  "How many sides does a triangle have? | Three",
  "Which animal is the largest on Earth? | Blue whale",
  "What do bees make? | Honey",
  "Which ocean is the largest? | Pacific Ocean",
  "What is the past tense of go? | Went",
  "Name a word that rhymes with light. | Answers vary",
];
const DOOR_REWARDS = [
  { title: "No points", detail: "An empty room! No points this time.", points: 0, icon: "🕸️", kind: "empty" },
  { title: "+1 point", detail: "A quick delivery earns one point.", points: 1, icon: "📦", kind: "small" },
  { title: "+1 point", detail: "A quick delivery earns one point.", points: 1, icon: "📦", kind: "small" },
  { title: "+1 point", detail: "A quick delivery earns one point.", points: 1, icon: "📦", kind: "small" },
  { title: "+2 points", detail: "A double delivery! Two points.", points: 2, icon: "🎁", kind: "medium" },
  { title: "+2 points", detail: "A double delivery! Two points.", points: 2, icon: "🎁", kind: "medium" },
  { title: "+2 points", detail: "A double delivery! Two points.", points: 2, icon: "🎁", kind: "medium" },
  { title: "+3 points", detail: "A big tip! Three points.", points: 3, icon: "💰", kind: "large" },
  { title: "+4 Golden Delivery", detail: "Golden order! Four points.", points: 4, icon: "🌟", kind: "gold" },
  { title: "Express Dash!", detail: "Keep the turn and answer another question.", points: 0, icon: "⚡", kind: "bonus", bonus: true },
  { title: "No points", detail: "The customer was out. No points this time.", points: 0, icon: "🚪", kind: "empty" },
  { title: "+1 point", detail: "A quick delivery earns one point.", points: 1, icon: "📦", kind: "small" },
];

function shuffle(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
  }
  return shuffled;
}

function parseQuestions(text) {
  return text.split(/\r?\n/).map((line) => {
    const [prompt = "", ...answerParts] = line.split("|");
    return { prompt: prompt.trim(), answer: answerParts.join("|").trim() || "Teacher decides" };
  }).filter((question) => question.prompt);
}

function Door({ number, reward, opened, disabled, onClick }) {
  return (
    <button
      className={`dd-door ${opened ? `is-open ${reward?.kind || ""}` : ""}`}
      onClick={onClick}
      disabled={disabled || opened}
      aria-label={opened ? `Door ${number}: ${reward?.title}` : `Choose door ${number}`}
    >
      {opened ? (
        <span className="dd-reward">
          <span className="dd-door-icon" aria-hidden="true">{reward?.icon}</span>
          <strong>{reward?.title}</strong>
        </span>
      ) : (
        <>
          <span className="dd-door-number">{number}</span>
          <span className="dd-door-panel" aria-hidden="true">⌂</span>
          <span className="dd-door-knob" aria-hidden="true" />
          <span className="dd-door-label">PICK ME</span>
        </>
      )}
    </button>
  );
}

export default function DoorDash({ onComplete, profileName = "" }) {
  const [screen, setScreen] = useState("setup");
  const [teamCount, setTeamCount] = useState(4);
  const [teamNames, setTeamNames] = useState([
    profileName ? `${profileName}'s Team` : "Orange Comets",
    "Blue Rockets",
    "Purple Pandas",
    "Green Geckos",
  ]);
  const [questionText, setQuestionText] = useState(DEFAULT_QUESTIONS.join("\n"));
  const [targetScore, setTargetScore] = useState(10);
  const [teams, setTeams] = useState([]);
  const [doors, setDoors] = useState([]);
  const [activeTeam, setActiveTeam] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [stage, setStage] = useState("question");
  const [reveal, setReveal] = useState(null);
  const [keepTurn, setKeepTurn] = useState(false);
  const [message, setMessage] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const questions = useMemo(() => parseQuestions(questionText), [questionText]);
  const active = teams[activeTeam];
  const question = questions.length ? questions[questionIndex % questions.length] : null;
  const openedCount = doors.filter((door) => door.opened).length;

  const startGame = () => {
    const nextTeams = Array.from({ length: teamCount }, (_, index) => ({
      name: teamNames[index]?.trim() || `Team ${index + 1}`,
      score: 0,
      color: TEAM_COLORS[index],
    }));
    setTeams(nextTeams);
    setDoors(shuffle(DOOR_REWARDS).map((reward, index) => ({ number: index + 1, reward, opened: false })));
    setActiveTeam(0);
    setQuestionIndex(0);
    setStage("question");
    setReveal(null);
    setKeepTurn(false);
    setMessage("");
    setCorrectAnswers(0);
    setAnsweredQuestions(0);
    setScreen("game");
  };

  const continueTurn = (sameTeam = false) => {
    if (openedCount >= doors.length) {
      const topScore = Math.max(...teams.map((team) => team.score));
      const winners = teams.filter((team) => team.score === topScore);
      setReveal({ title: winners.length > 1 ? "It's a tie!" : `${winners[0].name} wins!`, detail: `Final score: ${topScore} points.`, icon: "🏆", kind: "winner" });
      setScreen("winner");
      onComplete?.(topScore, answeredQuestions ? Math.round((correctAnswers / answeredQuestions) * 100) : 0);
      return;
    }
    if (!sameTeam) setActiveTeam((value) => (value + 1) % teams.length);
    setQuestionIndex((value) => value + 1);
    setKeepTurn(false);
    setReveal(null);
    setStage("question");
    setMessage(sameTeam ? "Express delivery! Same team gets another question." : "");
  };

  const markWrong = () => {
    setAnsweredQuestions((value) => value + 1);
    setMessage(`${active?.name} missed it. The next team is up.`);
    continueTurn();
  };

  const markCorrect = () => {
    setCorrectAnswers((value) => value + 1);
    setAnsweredQuestions((value) => value + 1);
    setStage("doors");
    setMessage(`${active?.name} got it! Choose one unopened door.`);
  };

  const openDoor = (doorIndex) => {
    if (stage !== "doors" || doors[doorIndex]?.opened) return;
    const selected = doors[doorIndex];
    const nextScore = active.score + selected.reward.points;
    const nextTeams = teams.map((team, index) => index === activeTeam ? { ...team, score: nextScore } : team);
    const nextDoors = doors.map((door, index) => index === doorIndex ? { ...door, opened: true } : door);
    setTeams(nextTeams);
    setDoors(nextDoors);
    setReveal(selected.reward);
    setKeepTurn(Boolean(selected.reward.bonus));
    setStage("reveal");
    setMessage("");

    if (nextScore >= targetScore) {
      setReveal({ title: `${active.name} wins!`, detail: `You reached ${targetScore} points!`, icon: "🏆", kind: "winner" });
      setScreen("winner");
      onComplete?.(nextScore, answeredQuestions ? Math.round((correctAnswers / answeredQuestions) * 100) : 0);
      return;
    }

    if (nextDoors.every((door) => door.opened)) {
      const highScore = Math.max(...nextTeams.map((team) => team.score));
      const winners = nextTeams.filter((team) => team.score === highScore);
      setReveal({ title: winners.length > 1 ? "It's a tie!" : `${winners[0].name} wins!`, detail: `The doors are all open. Final score: ${highScore}.`, icon: "🏆", kind: "winner" });
      setScreen("winner");
      onComplete?.(highScore, answeredQuestions ? Math.round((correctAnswers / answeredQuestions) * 100) : 0);
    }
  };

  if (screen === "setup") {
    return (
      <main className="door-dash">
        <div className="dd-shell dd-setup">
          <div className="dd-hero">
            <div className="dd-hero-art" aria-hidden="true"><span>🚪</span><i>📦</i></div>
            <div>
              <p className="dd-eyebrow">A classroom door-pick quiz</p>
              <h1>DOOR DASH</h1>
              <p className="dd-tagline">Answer right. Pick a door. See what’s inside!</p>
            </div>
          </div>
          <div className="dd-setup-grid">
            <section className="dd-setup-card">
              <h2>Choose your teams</h2>
              <label className="dd-field">Teams
                <select value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))}>
                  {[2, 3, 4].map((count) => <option key={count} value={count}>{count} teams</option>)}
                </select>
              </label>
              {Array.from({ length: teamCount }, (_, index) => (
                <label className="dd-team-field" key={index}>
                  <span style={{ backgroundColor: TEAM_COLORS[index] }} />
                  <input
                    value={teamNames[index]}
                    maxLength={18}
                    aria-label={`Team ${index + 1} name`}
                    onChange={(event) => setTeamNames((previous) => previous.map((name, nameIndex) => nameIndex === index ? event.target.value : name))}
                  />
                </label>
              ))}
              <label className="dd-field">Points to win
                <select value={targetScore} onChange={(event) => setTargetScore(Number(event.target.value))}>
                  {[6, 8, 10, 12, 15].map((score) => <option value={score} key={score}>{score} points</option>)}
                </select>
              </label>
            </section>
            <section className="dd-setup-card dd-questions-setup">
              <h2>Teacher question bank</h2>
              <p>One question and answer per line, separated by a vertical bar.</p>
              <textarea value={questionText} onChange={(event) => setQuestionText(event.target.value)} rows={9} aria-label="Questions and answers" />
              <small>Example: What is 6 × 7? | 42</small>
            </section>
          </div>
          <button className="dd-primary" onClick={startGame} disabled={!questions.length}>Start the dash <span aria-hidden="true">→</span></button>
          {!questions.length && <p className="dd-validation">Add at least one question to start.</p>}
        </div>
      </main>
    );
  }

  if (screen === "winner") {
    return (
      <main className="door-dash">
        <section className="dd-shell dd-winner">
          <span className="dd-winner-icon">{reveal?.icon || "🏆"}</span>
          <p className="dd-eyebrow">Delivery complete</p>
          <h1>{reveal?.title}</h1>
          <p>{reveal?.detail}</p>
          <div className="dd-final-scores">{teams.map((team) => <div key={team.name}><span style={{ backgroundColor: team.color }} />{team.name}<strong>{team.score}</strong></div>)}</div>
          <button className="dd-primary" onClick={startGame}>Play again</button>
          <button className="dd-secondary" onClick={() => setScreen("setup")}>Game setup</button>
        </section>
      </main>
    );
  }

  return (
    <main className="door-dash">
      <div className="dd-shell dd-game">
        <header className="dd-game-header">
          <div className="dd-brand"><span aria-hidden="true">🚪</span><div><p className="dd-eyebrow">Classroom quiz game</p><h1>DOOR DASH</h1></div></div>
          <div className="dd-turn-badge" style={{ "--team-color": active?.color }}>Up now: {active?.name}</div>
          <button className="dd-small-button" onClick={() => setScreen("setup")}>Setup</button>
        </header>

        <div className="dd-scoreboard" aria-label="Team scores">
          {teams.map((team, index) => (
            <div className={`dd-score ${index === activeTeam ? "is-active" : ""}`} style={{ "--team-color": team.color }} key={team.name}>
              <span>{team.name}</span><strong>{team.score}</strong>
            </div>
          ))}
        </div>

        <div className="dd-status-row">
          <span>DOORS OPENED <strong>{openedCount}/12</strong></span>
          <span>FIRST TO <strong>{targetScore}</strong></span>
        </div>

        {stage === "question" && (
          <section className="dd-question-card">
            <p className="dd-eyebrow">Question {questionIndex + 1}</p>
            <h2>{question?.prompt}</h2>
            <button className="dd-primary" onClick={() => setStage("answer")}>Reveal answer</button>
          </section>
        )}

        {stage === "answer" && (
          <section className="dd-question-card dd-answer-card">
            <p className="dd-eyebrow">Teacher answer check</p>
            <h2>{question?.prompt}</h2>
            <div className="dd-answer">{question?.answer}</div>
            <div className="dd-answer-actions">
              <button className="dd-correct" onClick={markCorrect}>✓ Correct — choose a door</button>
              <button className="dd-wrong" onClick={markWrong}>✕ Not quite — pass turn</button>
            </div>
          </section>
        )}

        {stage === "doors" && (
          <>
            <section className="dd-question-card dd-door-prompt">
              <p className="dd-eyebrow">Correct answer!</p>
              <h2>Pick a door for {active?.name}</h2>
              <p>One hides a golden delivery. One earns another question. What’s behind your pick?</p>
            </section>
            <div className="dd-door-grid">
              {doors.map((door, index) => (
                <Door key={door.number} number={door.number} reward={door.reward} opened={door.opened} disabled={false} onClick={() => openDoor(index)} />
              ))}
            </div>
          </>
        )}

        {stage === "reveal" && reveal && (
          <section className={`dd-reveal-card ${reveal.kind}`}>
            <span className="dd-reveal-icon">{reveal.icon}</span>
            <p className="dd-eyebrow">Door opened!</p>
            <h2>{reveal.title}</h2>
            <p>{reveal.detail}</p>
            <button className="dd-primary" onClick={() => continueTurn(keepTurn)}>{keepTurn ? "Take the express dash →" : "Next team →"}</button>
          </section>
        )}

        {message && <p className="dd-game-message" role="status">{message}</p>}
      </div>
    </main>
  );
}
