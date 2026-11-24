"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import "./nathans-space-quiz.css";

const QUESTIONS = [
  {
    prompt: "How far from Earth had humans ventured since 1973?",
    answers: ["650 kilometres", "6,500 kilometres", "65 kilometres", "650,000 kilometres"],
    correct: "650 kilometres",
    fact: "The passage says humans have not ventured more than 650 kilometres from Earth since 1973.",
    image: "/assets/games/know-it-all/moon-landing.webp",
  },
  {
    prompt: "Which transportation system ended in 2011?",
    answers: ["The space shuttle programme", "The International Space Station", "The Apollo programme", "The cargo-rocket programme"],
    correct: "The space shuttle programme",
    fact: "NASA's space shuttle programme ended in 2011.",
    image: "/assets/games/know-it-all/moon-landing.webp",
  },
  {
    prompt: "What did SpaceX send to the ISS in early 2012?",
    answers: ["An astronaut team", "An unmanned rocket", "A lunar rover", "A cargo plane"],
    correct: "An unmanned rocket",
    fact: "In early 2012, SpaceX sent an unmanned rocket to the International Space Station.",
    image: "/assets/games/know-it-all/sun-earth.webp",
  },
  {
    prompt: "Which company plans to mine asteroids?",
    answers: ["Planetary Resources", "SpaceX", "NASA", "Mars Global"],
    correct: "Planetary Resources",
    fact: "Planetary Resources has developed plans to use robotic spacecraft to mine asteroids.",
    image: "/assets/games/know-it-all/olympus-mons-question.webp",
  },
  {
    prompt: "Which precious metal could an ounce cost $1,600 on Earth?",
    answers: ["Platinum", "Gold", "Silver", "Copper"],
    correct: "Platinum",
    fact: "The passage gives platinum as a metal that can cost $1,600 per ounce on Earth.",
    image: "/assets/games/know-it-all/olympus-mons-answer.webp",
  },
  {
    prompt: "Why might asteroid robots save lives?",
    answers: ["They work on Mars", "They avoid dangerous mining missions", "They are cheaper than robots on Earth", "They can fly planes"],
    correct: "They avoid dangerous mining missions",
    fact: "Robots could travel millions of kilometres to locate and mine asteroids.",
    image: "/assets/games/know-it-all/saturn-question.webp",
  },
  {
    prompt: "Who founded SpaceX?",
    answers: ["Elon Musk", "Peter Diamandis", "Mason Peck", "Jeff Bezos"],
    correct: "Elon Musk",
    fact: "Elon Musk founded SpaceX and is investing in his own space programme.",
    image: "/assets/games/know-it-all/saturn-answer.webp",
  },
  {
    prompt: "How does SpaceX reduce cargo costs?",
    answers: ["By using smaller rockets", "By sharing ISS supplies", "By creating reusable rockets", "By launching only at night"],
    correct: "By creating reusable rockets",
    fact: "Musk's reusable rockets helped make transporting cargo to the ISS cheaper.",
    image: "/assets/games/know-it-all/planets-question.webp",
  },
  {
    prompt: "What does Elon Musk want to establish on Mars?",
    answers: ["A research library", "A human colony", "A tourism park", "An asteroid factory"],
    correct: "A human colony",
    fact: "Musk wants to establish a human colony on Mars.",
    image: "/assets/games/know-it-all/olympus-mons-answer.webp",
  },
  {
    prompt: "According to Peter Diamandis, what creates an incentive to explore space?",
    answers: ["Historic ships", "A strong economy", "A new age of sailing", "Government jobs"],
    correct: "A strong economy",
    fact: "Diamandis says that creating an economic incentive can encourage people to explore space.",
    image: "/assets/games/know-it-all/earth-spheres-question.webp",
  },
];

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

export default function NathansSpaceQuiz({ onComplete, profileName }) {
  const [screen, setScreen] = useState("intro");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);

  const question = QUESTIONS[questionIndex];
  const choices = useMemo(() => shuffle(question.answers), [question]);
  const playerName = profileName || "";
  const correctCount = answers.filter((answer) => answer.correct).length;
  const progress = ((questionIndex + (locked ? 1 : 0)) / QUESTIONS.length) * 100;

  useEffect(() => {
    const openMenu = () => setScreen("intro");
    window.addEventListener("nathans-space-quiz:main-menu", openMenu);
    return () => window.removeEventListener("nathans-space-quiz:main-menu", openMenu);
  }, []);

  const startQuiz = () => {
    setQuestionIndex(0);
    setAnswers([]);
    setSelected(null);
    setLocked(false);
    setScreen("play");
  };

  const chooseAnswer = (answer) => {
    if (locked) return;
    const isCorrect = answer === question.correct;
    setSelected(answer);
    setLocked(true);
    setAnswers((current) => [...current, { correct: isCorrect }]);
  };

  const nextQuestion = () => {
    if (questionIndex + 1 === QUESTIONS.length) {
      const finalCount = answers.filter((answer) => answer.correct).length;
      onComplete?.(finalCount * 100, Math.round((finalCount / QUESTIONS.length) * 100));
      setScreen("results");
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelected(null);
    setLocked(false);
  };

  return (
    <main className={`nsq nsq-${screen}`}>
      {screen === "intro" && (
        <section className="nsq-intro-card">
          <div className="nsq-planet" aria-hidden="true"><span /></div>
          <div className="nsq-intro-copy">
            <p className="nsq-eyebrow">NATHAN&apos;S CLASSROOM CHALLENGE</p>
            <h1><small>Nathan&apos;s</small> Space Quiz</h1>
            <p className="nsq-intro-text">Blast through 10 questions about the future of space travel, Mars, and asteroid mining.</p>
            <button className="nsq-start" type="button" onClick={startQuiz}>
              Launch quiz <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      )}

      {screen === "play" && (
        <section className="nsq-game">
          <header className="nsq-header">
            <div>
              <p>NATHAN&apos;S SPACE QUIZ</p>
              <strong>Question {questionIndex + 1} of {QUESTIONS.length}</strong>
            </div>
            <div className="nsq-score"><span>Score</span><strong>{correctCount * 100}</strong></div>
          </header>
          <div className="nsq-progress"><span style={{ width: `${progress}%` }} /></div>

          <div className="nsq-layout">
            <section className="nsq-question-card" aria-live="polite">
              <div className="nsq-question-image">
                <Image src={question.image} alt="" fill sizes="(max-width: 760px) 100vw, 420px" />
              </div>
              <div className="nsq-question-copy">
                <p className="nsq-category">MISSION {String(questionIndex + 1).padStart(2, "0")}</p>
                <h2>{question.prompt}</h2>
                <div className="nsq-answers">
                  {choices.map((choice, index) => {
                    const state = locked
                      ? choice === question.correct
                        ? "correct"
                        : choice === selected
                          ? "wrong"
                          : ""
                      : "";
                    return (
                      <button key={choice} type="button" className={`nsq-answer ${state}`} onClick={() => chooseAnswer(choice)} disabled={locked}>
                        <span>{String.fromCharCode(65 + index)}</span>
                        <strong>{choice}</strong>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {locked && (
              <aside className={`nsq-feedback ${selected === question.correct ? "is-correct" : "is-wrong"}`}>
                <span className="nsq-feedback-icon" aria-hidden="true">{selected === question.correct ? "✓" : "!"}</span>
                <div>
                  <p>{selected === question.correct ? "CORRECT!" : "NOT QUITE"}</p>
                  <strong>{question.fact}</strong>
                </div>
                <button type="button" onClick={nextQuestion}>
                  {questionIndex + 1 === QUESTIONS.length ? "Finish mission" : "Next question"} <span aria-hidden="true">→</span>
                </button>
              </aside>
            )}
          </div>
        </section>
      )}

      {screen === "results" && (
        <section className="nsq-results-card">
          <div className="nsq-results-orbit" aria-hidden="true"><span>★</span></div>
          <p className="nsq-eyebrow">MISSION COMPLETE</p>
          <h1>{correctCount === QUESTIONS.length ? "Perfect flight!" : correctCount >= 7 ? "Great space journey!" : "Keep exploring!"}</h1>
          <div className="nsq-result-ring">
            <strong>{correctCount}</strong>
            <span>OUT OF {QUESTIONS.length}</span>
          </div>
          <p>{playerName ? `${playerName}, you` : "You"} scored {Math.round((correctCount / QUESTIONS.length) * 100)}% accuracy.</p>
          <button className="nsq-start" type="button" onClick={startQuiz}>Play again <span aria-hidden="true">↻</span></button>
        </section>
      )}
    </main>
  );
}
