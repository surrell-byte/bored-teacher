"use client";

import { useMemo, useState } from "react";

const AVATARS = ["🐶", "🐱", "🐰", "🦊", "🐼", "🦁", "🐢", "🦉", "🐬", "🦄"];

const QUESTIONS = [
  {
    question: "A dog is panting heavily after running. What should you do first?",
    answers: [
      "Let it rest in a cool place and offer water.",
      "Give it a large amount of food.",
      "Keep it running until it stops.",
      "Leave it in the sun.",
    ],
    correct: "Let it rest in a cool place and offer water.",
    fact: "When animals are hot or tired, rest and water are important for recovery.",
  },
  {
    question: "What is the best way to help a cat who seems scared and hiding?",
    answers: [
      "Approach quickly and pick it up immediately.",
      "Speak calmly and give it a quiet, safe space.",
      "Shout to scare it out.",
      "Feed it lots of treats all at once.",
    ],
    correct: "Speak calmly and give it a quiet, safe space.",
    fact: "A calm, low-stress environment helps frightened animals feel safer.",
  },
  {
    question: "Which sign suggests an animal may be sick and need a vet?",
    answers: [
      "It is sleeping after a long walk.",
      "It is eating normally and playful.",
      "It has a sudden fever, vomiting, or unusual weakness.",
      "It wakes up for breakfast.",
    ],
    correct: "It has a sudden fever, vomiting, or unusual weakness.",
    fact: "Vomiting, fever, and weakness can be signs that an animal needs professional care.",
  },
  {
    question: "What should you do before giving any medicine to an animal?",
    answers: [
      "Ask a vet or a trusted adult for the correct dosage and instructions.",
      "Guess based on the size of the bottle.",
      "Give it double the amount to be safe.",
      "Mix it into food without checking.",
    ],
    correct: "Ask a vet or a trusted adult for the correct dosage and instructions.",
    fact: "Animals need safe, correct treatment. Wrong medicine or dosage can be harmful.",
  },
  {
    question: "Why is regular grooming important for some animals?",
    answers: [
      "It helps keep skin, fur, and paws healthy and clean.",
      "It makes them less hungry.",
      "It helps them fly.",
      "It keeps them awake all night.",
    ],
    correct: "It helps keep skin, fur, and paws healthy and clean.",
    fact: "Grooming can prevent mats, skin problems, and discomfort.",
  },
  {
    question: "Which choice best shows animal welfare?",
    answers: [
      "Ignoring an injured animal because it is not yours.",
      "Providing food, water, shelter, and kindness.",
      "Leaving animals outside in bad weather without care.",
      "Forcing an animal to work until it is exhausted.",
    ],
    correct: "Providing food, water, shelter, and kindness.",
    fact: "Good animal welfare means meeting the animal's basic needs and treating it humanely.",
  },
  {
    question: "A rabbit has a small cut on its paw. What should happen next?",
    answers: [
      "Wash it gently and keep it clean, then ask an adult or vet if it is serious.",
      "Leave it alone until it heals by itself.",
      "Cover it with glue.",
      "Give it a lot of exercise right away.",
    ],
    correct: "Wash it gently and keep it clean, then ask an adult or vet if it is serious.",
    fact: "Small injuries need gentle care and monitoring, especially if they do not improve.",
  },
  {
    question: "What is a sign of good animal nutrition?",
    answers: [
      "The animal eats a balanced diet suitable for its needs.",
      "The animal only eats sweets.",
      "The animal never drinks water.",
      "The animal is fed random leftovers every day.",
    ],
    correct: "The animal eats a balanced diet suitable for its needs.",
    fact: "Balanced nutrition supports growth, immunity, and overall health.",
  },
];

export default function VictoryVet({ onComplete }) {
  const [screen, setScreen] = useState("welcome");
  const [playerName, setPlayerName] = useState("");
  const [avatar, setAvatar] = useState("🐶");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const question = QUESTIONS[currentQuestion];
  const progress = useMemo(() => ((currentQuestion + 1) / QUESTIONS.length) * 100, [currentQuestion]);

  function handleAnswer(answer) {
    if (selected) return;
    setSelected(answer);

    if (answer === question.correct) {
      setScore((value) => value + 10);
    } else {
      setLives((value) => Math.max(0, value - 1));
    }
  }

  function nextQuestion() {
    if (currentQuestion >= QUESTIONS.length - 1 && selected !== question.correct) {
      setSelected(null);
      return;
    }
    if (currentQuestion >= QUESTIONS.length - 1) {
      onComplete?.(score + 10, Math.round(((score + 10) / (QUESTIONS.length * 10)) * 100));
    }
    setSelected(null);

    if (currentQuestion >= QUESTIONS.length - 1) {
      setCurrentQuestion(0);
      setScore(0);
      setLives(3);
      return;
    }

    setCurrentQuestion((value) => value + 1);
  }

  const complete = currentQuestion >= QUESTIONS.length - 1 && selected === question.correct;

  if (screen === "welcome") return <main className="victory-vet vv-welcome"><section className="vv-welcome-card"><div className="vv-welcome-icon">🩺🐾</div><p className="vv-kicker">ANIMAL CARE ACADEMY</p><h1>Victory Vet</h1><p>Learn how to help animals stay safe, healthy, and happy.</p><button className="vv-reset" onClick={() => setScreen("setup")}>Start mission</button></section></main>;
  if (screen === "setup") return <main className="victory-vet vv-welcome"><section className="vv-welcome-card vv-setup"><p className="vv-kicker">READY, {playerName || "VET"}?</p><h1>Choose your vet</h1><input className="vv-name-input" value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Your name" maxLength={18} /><div className="vv-avatar-grid">{AVATARS.map((item) => <button type="button" className={avatar === item ? "selected" : ""} onClick={() => setAvatar(item)} key={item}>{item}</button>)}</div><button className="vv-reset" disabled={!playerName.trim()} onClick={() => { setCurrentQuestion(0); setSelected(null); setScore(0); setLives(3); setScreen("game"); }}>Enter clinic</button></section></main>;

  return (
    <main className="victory-vet">
      <style>{`
        .victory-vet {
          min-height: 100%;
          width: 100%;
          padding: 18px;
          color: var(--text);
          background: linear-gradient(180deg, rgba(15,26,24,0.98), rgba(18,27,25,0.98));
        }
        .vv-shell {
          max-width: 1120px; margin: 0 auto; display: grid; gap: 24px;
        }
        .vv-topbar {
          display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; align-items: center;
        }
        .vv-title {
          display: flex; align-items: center; gap: 14px;
        }
        .vv-icon {
          width: 54px; height: 54px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
          background: rgba(90,190,150,0.12); border: 1px solid rgba(90,190,150,0.3); font-size: 2rem;
        }
        .vv-title h1 { margin: 0; font-size: clamp(1.7rem, 4vw, 2.5rem); }
        .vv-title p { margin: 4px 0 0; color: var(--muted); }
        .vv-stats { display: flex; gap: 12px; flex-wrap: wrap; }
        .vv-stat { min-width: 90px; padding: 10px 12px; border-radius: 14px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); }
        .vv-stat span { display: block; font-size: 0.7rem; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
        .vv-stat strong { font-size: 1.2rem; }
        .vv-card {
          background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 22px; padding: 18px;
        }
        .vv-track { height: 10px; border-radius: 999px; background: rgba(255,255,255,0.06); overflow: hidden; }
        .vv-fill { height: 100%; border-radius: inherit; background: linear-gradient(135deg, #73d799, #7dd8d8); }
        .vv-meta { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; color: var(--muted); }
        .vv-badge { padding: 6px 10px; border-radius: 999px; border: 1px solid var(--border); background: rgba(255,255,255,0.04); }
        .vv-question { margin-top: 28px; }
        .vv-question h2 { margin: 0 0 22px; font-size: clamp(1.6rem, 3vw, 2.7rem); line-height: 1.2; }
        .vv-answers { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .vv-answer { cursor: pointer; min-height: 76px; padding: 18px 20px; border-radius: 16px; border: 1px solid var(--border); background: rgba(255,255,255,0.02); color: var(--text); text-align: left; font-size: 1.08rem; }
        .vv-context-image { display: grid; place-items: center; min-height: 190px; margin-top: 24px; border-radius: 18px; overflow: hidden; background: linear-gradient(135deg, rgba(76,180,145,.16), rgba(66,125,180,.16)); }
        .vv-context-image img { width: 100%; height: 220px; object-fit: cover; }
        .vv-welcome { display: grid; place-items: center; min-height: 100%; text-align: center; }
        .vv-welcome-card { width: min(680px, 100%); padding: 56px 28px; border: 1px solid var(--border); border-radius: 28px; background: rgba(255,255,255,.04); box-shadow: 0 24px 70px rgba(0,0,0,.28); }
        .vv-welcome-icon { font-size: 5rem; }
        .vv-kicker { color: #7ed9b0; font-size: .75rem; font-weight: 800; letter-spacing: .16em; }
        .vv-welcome-card h1 { font-size: clamp(2.5rem, 7vw, 4.5rem); margin: 10px 0; }
        .vv-welcome-card > p:not(.vv-kicker) { color: var(--muted); font-size: 1.1rem; line-height: 1.7; margin-bottom: 24px; }
        .vv-name-input { width: min(400px, 100%); padding: 16px; border: 1px solid var(--border-bright); border-radius: 14px; background: rgba(255,255,255,.06); color: var(--text); font-size: 1.1rem; text-align: center; }
        .vv-avatar-grid { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin: 24px 0; }
        .vv-avatar-grid button { width: 58px; height: 58px; border: 2px solid var(--border); border-radius: 14px; background: rgba(255,255,255,.05); font-size: 1.8rem; cursor: pointer; }
        .vv-avatar-grid button.selected { border-color: #7ed9b0; background: rgba(126,217,176,.16); }
        .vv-answer.correct { background: rgba(42,176,112,0.14); border-color: rgba(42,176,112,0.45); }
        .vv-answer.wrong { background: rgba(220,92,92,0.12); border-color: rgba(220,92,92,0.4); }
        .vv-feedback { margin-top: 18px; padding: 16px; border-radius: 16px; border: 1px solid var(--border); background: rgba(255,255,255,0.03); }
        .vv-feedback.correct { border-color: rgba(42,176,112,0.45); background: rgba(42,176,112,0.12); }
        .vv-feedback.wrong { border-color: rgba(220,92,92,0.4); background: rgba(220,92,92,0.12); }
        .vv-fact { margin-top: 12px; color: var(--muted); }
        .vv-next { margin-top: 16px; border: none; background: linear-gradient(135deg, #7ed9b0, #50c5c3); color: white; font-weight: 800; padding: 12px 18px; border-radius: 12px; cursor: pointer; }
        .vv-end { text-align: center; padding: 30px 10px 10px; }
        .vv-end h2 { margin-bottom: 12px; }
        .vv-score { font-size: 2.4rem; font-weight: 800; margin: 20px 0; }
        .vv-reset { border: none; padding: 12px 18px; border-radius: 12px; font-weight: 800; background: linear-gradient(135deg, #7ed9b0, #50c5c3); color: white; cursor: pointer; }
        @media (max-width: 640px) { .vv-answers { grid-template-columns: 1fr; } }
      `}</style>

      <div className="vv-shell">
        <header className="vv-topbar">
          <div className="vv-title">
            <div className="vv-icon">🩺</div>
            <div>
              <h1>Victory Vet</h1>
              <p>Animal care mission</p>
            </div>
          </div>

          <div className="vv-stats">
            <div className="vv-stat">
              <span>Score</span>
              <strong>{score}</strong>
            </div>
            <div className="vv-stat">
              <span>Lives</span>
              <strong>{lives}</strong>
            </div>
          </div>
        </header>

        <div className="vv-card">
          <div className="vv-track">
            <div className="vv-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="vv-meta">
            <span>Question {currentQuestion + 1} / {QUESTIONS.length}</span>
            <span className="vv-badge">Vet Check</span>
          </div>

          {selected && currentQuestion === QUESTIONS.length - 1 ? (
            <div className="vv-end">
              <h2>Mission complete!</h2>
              <p>Your animal care skills are ready for the next challenge.</p>
              <div className="vv-score">{score} pts</div>
              <button className="vv-reset" onClick={() => { setCurrentQuestion(0); setSelected(null); setScore(0); setLives(3); }}>Play again</button>
            </div>
          ) : (
            <div className="vv-question">
              <div className="vv-context-image"><img src="/assets/covers/animal-class-quest-cover.webp" alt="Animal care context" /></div>
              <h2>{question.question}</h2>
              <div className="vv-answers">
                {question.answers.map((answer) => {
                  const isCorrect = answer === question.correct;
                  const isSelected = answer === selected;
                  let className = "vv-answer";
                  if (selected && isCorrect) className += " correct";
                  if (selected && isSelected && !isCorrect) className += " wrong";

                  return (
                    <button key={answer} className={className} onClick={() => handleAnswer(answer)} disabled={Boolean(selected)}>
                      {answer}
                    </button>
                  );
                })}
              </div>

              {selected && (
                <div className={`vv-feedback ${selected === question.correct ? "correct" : "wrong"}`}>
                  <strong>{selected === question.correct ? "✅ Correct!" : "❌ Not quite"}</strong>
                  <div className="vv-fact">{question.fact}</div>
                  <button className="vv-next" onClick={nextQuestion}>{complete ? "Finish round" : "Next question"}</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
