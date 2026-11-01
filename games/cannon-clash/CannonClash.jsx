"use client";

import { useMemo, useState } from "react";
import "./CannonClash.css";

const TEAM_COLORS = ["#f97316", "#38bdf8", "#a78bfa", "#34d399"];
const SHIPS = ["🛳️", "⛵", "🚢", "🏴‍☠️"];
const DEFAULT_QUESTIONS = [
  "What planet is known as the Red Planet? | Mars",
  "How many sides does a triangle have? | Three",
  "What do bees make? | Honey",
  "Which ocean is the largest? | Pacific Ocean",
  "What is the opposite of cold? | Hot",
  "Which animal is the largest on Earth? | Blue whale",
  "What is 6 × 7? | 42",
  "What is the past tense of go? | Went",
];
const CANNON_REWARDS = [
  { points: 1, title: "+1", detail: "A direct hit! One point.", icon: "💥", kind: "hit" },
  { points: 2, title: "+2", detail: "A strong shot! Two points.", icon: "💥", kind: "hit" },
  { points: 3, title: "+3", detail: "Perfect aim! Three points.", icon: "🎯", kind: "strong" },
  { points: 2, title: "+2", detail: "The cannonball ricochets for two points.", icon: "🌀", kind: "ricochet" },
  { points: 0, title: "Shield up!", detail: "Your crew earns a shield against the next bad shot.", icon: "🛡️", kind: "shield", shield: true },
  { points: 0, title: "No points", detail: "Splash! The cannonball missed its target.", icon: "🌊", kind: "miss" },
  { points: 1, title: "+1", detail: "A direct hit! One point.", icon: "💥", kind: "hit" },
  { points: 2, title: "+2", detail: "A strong shot! Two points.", icon: "💥", kind: "hit" },
];

function parseQuestions(source) {
  return source.split(/\r?\n/).map((line) => {
    const [prompt = "", ...parts] = line.split("|");
    return { prompt: prompt.trim(), answer: parts.join("|").trim() || "Teacher decides" };
  }).filter((question) => question.prompt);
}

function Cannon({ selected, reward, onClick, index }) {
  return (
    <button className={`cc-cannon ${selected ? "selected" : ""} ${reward ? "revealed" : ""} ${reward?.kind || ""}`} onClick={onClick} aria-label={`Cannon ${index + 1}${reward ? `, ${reward.title}` : ""}`}>
      {reward ? (
        <span className="cc-cannon-reward"><b>{reward.icon}</b><strong>{reward.title}</strong></span>
      ) : (
        <>
          <span className="cc-cannon-ball" aria-hidden="true" />
          <span className="cc-cannon-mouth" aria-hidden="true" />
          <span className="cc-cannon-barrel" aria-hidden="true" />
          <span className="cc-cannon-wheel wheel-left" aria-hidden="true" />
          <span className="cc-cannon-wheel wheel-right" aria-hidden="true" />
          <span className="cc-cannon-index">{index + 1}</span>
        </>
      )}
    </button>
  );
}

export default function CannonClash({ onComplete, profileName = "" }) {
  const [screen, setScreen] = useState("welcome");
  const [teamCount, setTeamCount] = useState(4);
  const [names, setNames] = useState([
    profileName ? `${profileName}'s Crew` : "Coral Crew",
    "Blue Buccaneers",
    "Purple Pirates",
    "Green Galleons",
  ]);
  const [questionText, setQuestionText] = useState(DEFAULT_QUESTIONS.join("\n"));
  const [teams, setTeams] = useState([]);
  const [turn, setTurn] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [phase, setPhase] = useState("question");
  const [cannons, setCannons] = useState([]);
  const [chosenCannon, setChosenCannon] = useState(null);
  const [reward, setReward] = useState(null);
  const [message, setMessage] = useState("");
  const [winner, setWinner] = useState(null);
  const questions = useMemo(() => parseQuestions(questionText), [questionText]);
  const activeTeam = teams[turn];
  const question = questions.length ? questions[questionIndex % questions.length] : null;

  function startGame() {
    setTeams(Array.from({ length: teamCount }, (_, index) => ({
      name: names[index]?.trim() || `Team ${index + 1}`,
      color: TEAM_COLORS[index],
      ship: SHIPS[index],
      score: 0,
      shield: false,
    })));
    setTurn(0);
    setQuestionIndex(0);
    setCannons([]);
    setChosenCannon(null);
    setReward(null);
    setMessage("");
    setWinner(null);
    setPhase("question");
    setScreen("game");
  }

  function nextTurn(sameTeam = false) {
    setTurn((current) => sameTeam ? current : (current + 1) % teams.length);
    setQuestionIndex((current) => current + 1);
    setChosenCannon(null);
    setReward(null);
    setPhase("question");
  }

  function wrongAnswer() {
    setMessage(`${activeTeam.name} missed it. The next crew gets a turn!`);
    nextTurn();
  }

  function correctAnswer() {
    setCannons(CANNON_REWARDS.map((item) => ({ ...item })).sort(() => Math.random() - 0.5));
    setMessage(`${activeTeam.name} got it! Choose one cannon.`);
    setPhase("cannons");
  }

  function chooseCannon(index) {
    if (phase !== "cannons" || cannons[index]?.opened) return;
    const selected = cannons[index];
    const nextTeams = teams.map((team, teamIndex) => {
      if (teamIndex !== turn) return team;
      if (selected.shield) return { ...team, shield: true };
      return { ...team, score: team.score + selected.points };
    });
    setTeams(nextTeams);
    setCannons((previous) => previous.map((cannon, cannonIndex) => cannonIndex === index ? { ...cannon, opened: true } : cannon));
    setChosenCannon(index);
    setReward(selected);
    setMessage("");
    setPhase("reveal");
  }

  function completeShot() {
    if (reward?.shield) {
      setMessage(`${activeTeam.name} saved a shield for the next turn.`);
      nextTurn();
      return;
    }

    if (reward?.points > 0) {
      const newScore = activeTeam.score;
      if (newScore >= 10) {
        setWinner(turn);
        setScreen("winner");
        onComplete?.(newScore, 100);
        return;
      }
    }
    nextTurn(Boolean(reward?.bonus));
  }

  if (screen === "welcome") {
    return (
      <main className="cannon-clash">
        <section className="cc-welcome">
          <p className="cc-eyebrow">A classroom broadside</p>
          <h1>CANNON<br /><span>CLASH!</span></h1>
          <div className="cc-welcome-scene" aria-hidden="true"><span>⛵</span><span>🚢</span><span>⛵</span></div>
          <p>Answer a question, choose a cannon, and see what your crew hits!</p>
          <button className="cc-primary" onClick={() => setScreen("setup")}>CHOOSE YOUR CREW <span>→</span></button>
          <small>Quiz · Cannon picks · High-seas surprises</small>
        </section>
      </main>
    );
  }

  if (screen === "setup") {
    return (
      <main className="cannon-clash">
        <section className="cc-setup">
          <p className="cc-eyebrow">Gather the crews</p>
          <h1>Choose your teams</h1>
          <div className="cc-setup-grid">
            <section className="cc-setup-card">
              <label className="cc-label">Number of teams
                <select value={teamCount} onChange={(event) => setTeamCount(Number(event.target.value))}>
                  {[2, 3, 4].map((count) => <option value={count} key={count}>{count} teams</option>)}
                </select>
              </label>
              {Array.from({ length: teamCount }, (_, index) => (
                <label className="cc-team-name" key={index}>
                  <span style={{ backgroundColor: TEAM_COLORS[index] }}>{SHIPS[index]}</span>
                  <input aria-label={`Team ${index + 1} name`} maxLength={18} value={names[index]} onChange={(event) => setNames((old) => old.map((name, teamIndex) => teamIndex === index ? event.target.value : name))} />
                </label>
              ))}
              <p className="cc-rule">First crew to 10 points wins!</p>
            </section>
            <section className="cc-setup-card">
              <label className="cc-label" htmlFor="cc-questions">Teacher question bank</label>
              <p>One question and answer per line, separated by |</p>
              <textarea id="cc-questions" value={questionText} rows={8} onChange={(event) => setQuestionText(event.target.value)} />
            </section>
          </div>
          <button className="cc-primary" disabled={!questions.length} onClick={startGame}>SET SAIL <span>→</span></button>
        </section>
      </main>
    );
  }

  if (screen === "winner") {
    return (
      <main className="cannon-clash">
        <section className="cc-winner">
          <span className="cc-trophy">🏆</span>
          <p className="cc-eyebrow">Battle won!</p>
          <h1>{teams[winner]?.name} wins!</h1>
          <p>Their crew reached 10 points and rules the waves.</p>
          <button className="cc-primary" onClick={startGame}>PLAY AGAIN <span>↻</span></button>
          <button className="cc-secondary" onClick={() => setScreen("setup")}>Game setup</button>
        </section>
      </main>
    );
  }

  return (
    <main className="cannon-clash">
      <section className="cc-game-shell">
        <header className="cc-header">
          <div className="cc-brand"><span>⚓</span><div><p className="cc-eyebrow">Quiz battle on the high seas</p><h1>CANNON CLASH</h1></div></div>
          <div className="cc-active-team" style={{ "--team-color": activeTeam?.color }}>{activeTeam?.ship} {activeTeam?.name}</div>
          <button className="cc-menu" onClick={() => setScreen("setup")}>Setup</button>
        </header>

        <div className="cc-scoreboard">
          {teams.map((team, index) => (
            <div className={`cc-score ${index === turn ? "active" : ""}`} style={{ "--team-color": team.color }} key={team.name}>
              <span>{team.ship}</span><strong>{team.name}</strong><b>{team.score}/10</b>
              {team.shield && <small>🛡 SHIELDED</small>}
            </div>
          ))}
        </div>

        <div className="cc-battle-scene">
          <div className="cc-sky-art" aria-hidden="true"><span>☁️</span><span>☁️</span><span>☁️</span><i>🕊️</i></div>
          <div className="cc-enemy-fleet" aria-label="Rival ships">
            {teams.filter((_, index) => index !== turn).map((team) => (
              <span key={team.name} title={`${team.name}'s ship`}>{team.ship}</span>
            ))}
          </div>
          <div className="cc-ocean" />
          <div className="cc-ship-rail" />
          {phase === "cannons" || phase === "reveal" ? (
            <div className="cc-cannon-row" aria-label="Choose a cannon">
              {cannons.map((cannon, index) => (
                <Cannon
                  key={index}
                  index={index}
                  selected={chosenCannon === index}
                  reward={cannon.opened ? cannon : null}
                  onClick={() => chooseCannon(index)}
                />
              ))}
            </div>
          ) : (
            <div className="cc-ready-deck" aria-hidden="true"><div className="cc-ready-cannon">⚓</div><p>Answer correctly to load the cannons!</p></div>
          )}
          {phase === "reveal" && reward?.points > 0 && <div className="cc-floating-points">+{reward.points}</div>}
          {phase === "reveal" && <div className="cc-shot-line" aria-hidden="true">➤</div>}
        </div>

        <div className="cc-turn-panel">
          {phase === "question" && (
            <div className="cc-question">
              <div><p className="cc-eyebrow">QUESTION {questionIndex + 1}</p><h2>{question?.prompt}</h2></div>
              <button className="cc-primary" onClick={() => setPhase("answer")}>Reveal answer</button>
            </div>
          )}
          {phase === "answer" && (
            <div className="cc-question cc-answer-stage">
              <div><p className="cc-eyebrow">TEACHER ANSWER CHECK</p><h2>{question?.prompt}</h2><strong className="cc-answer">{question?.answer}</strong></div>
              <div className="cc-answer-actions">
                <button className="cc-correct" onClick={correctAnswer}>✓ Correct — load cannons</button>
                <button className="cc-wrong" onClick={wrongAnswer}>✕ Not quite — pass turn</button>
              </div>
            </div>
          )}
          {phase === "cannons" && <div className="cc-waiting"><strong>{activeTeam?.name}</strong>, choose one cannon and reveal the shot!</div>}
          {phase === "reveal" && reward && (
            <div className="cc-reward-panel">
              <div className={`cc-reward-coin ${reward.kind}`}>{reward.icon}</div>
              <div><p className="cc-eyebrow">CANNON RESULT</p><h2>{reward.title}</h2><p>{reward.detail}</p></div>
              <button className="cc-primary" onClick={completeShot}>Next crew <span>→</span></button>
            </div>
          )}
          {message && phase !== "reveal" && <p className="cc-message" role="status">{message}</p>}
        </div>
        <footer className="cc-game-footer"><span>🎯 First crew to 10 points wins</span><span>{teams.filter((team) => team.shield).length} shields ready</span></footer>
      </section>
    </main>
  );
}
