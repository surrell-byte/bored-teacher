import { useMemo, useState } from "react";
import { QUIZ_ROUNDS, formatPrize, normalizeAnswer } from "./data";
import "./general-knowledge-quiz.css";

function shuffle(items) {
  return [...items].map((item) => ({ item, order: Math.random() })).sort((a, b) => a.order - b.order).map(({ item }) => item);
}

function prepareRound(round) {
  return round.questions.map((question) => question.spelling
    ? { ...question }
    : { ...question, answers: shuffle(question.answers) });
}

export default function GeneralKnowledgeQuiz({ onComplete }) {
  const [screen, setScreen] = useState("intro");
  const [roundId, setRoundId] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [locked, setLocked] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState("");

  const round = QUIZ_ROUNDS.find((item) => item.id === roundId) || QUIZ_ROUNDS[0];
  const question = questions[questionIndex];
  const prize = round.prizes[questionIndex] || round.prizes.at(-1);
  const progress = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0;
  const ladder = useMemo(() => round.prizes, [round]);

  const startRound = (id = roundId) => {
    const selectedRound = QUIZ_ROUNDS.find((item) => item.id === id) || QUIZ_ROUNDS[0];
    setRoundId(id);
    setQuestions(prepareRound(selectedRound));
    setQuestionIndex(0);
    setCorrectCount(0);
    setAnswer("");
    setFeedback("");
    setLocked(false);
    setScreen("play");
  };

  const submitAnswer = (submitted = answer) => {
    if (locked || !question) return;
    const isCorrect = question.spelling
      ? normalizeAnswer(submitted) === normalizeAnswer(question.spelling)
      : submitted === question.correct;
    setAnswer(submitted);
    setLocked(true);
    setFeedback(isCorrect ? "Correct!" : question.spelling ? `The correct spelling is “${question.spelling}”.` : `The correct answer is ${question.correct}.`);
    if (isCorrect) setCorrectCount((count) => count + 1);
  };

  const nextQuestion = () => {
    if (questionIndex + 1 < questions.length) {
      setQuestionIndex((index) => index + 1);
      setAnswer("");
      setFeedback("");
      setLocked(false);
    } else {
      const score = correctCount * 100;
      onComplete?.(score, Math.round((correctCount / questions.length) * 100));
      setScreen("results");
    }
  };

  return (
    <main className="gk-quiz">
      <div className="gk-glow" aria-hidden="true" />
      {screen === "intro" && <section className="gk-panel gk-intro">
        <span className="gk-kicker">THE BIG QUIZ</span>
        <div className="gk-hero-icon" aria-hidden="true">🧠</div>
        <h1>General Knowledge</h1>
        <p>Three rounds of trivia, spelling challenges, and big prize questions.</p>
        <div className="gk-round-select" aria-label="Choose a round">
          {QUIZ_ROUNDS.map((item) => <button key={item.id} className={roundId === item.id ? "selected" : ""} onClick={() => setRoundId(item.id)} aria-pressed={roundId === item.id}>
            <span>{item.icon}</span><strong>{item.title}</strong><small>{item.questions.length} questions</small>
          </button>)}
        </div>
        <button className="gk-button gk-primary" onClick={() => startRound()}>Start {round.title} <span aria-hidden="true">→</span></button>
      </section>}

      {screen === "play" && question && <section className="gk-play-layout">
        <header className="gk-topbar"><button className="gk-back" onClick={() => setScreen("intro")}>← Rounds</button><span>{round.icon} {round.title}</span><b>QUESTION {questionIndex + 1} / {questions.length}</b></header>
        <div className="gk-progress"><span style={{ width: `${progress}%` }} /></div>
        <div className="gk-play-grid">
          <section className="gk-question-panel" aria-live="polite">
            <div className="gk-prize">{formatPrize(prize)}</div>
            <h1>{question.prompt}</h1>
            {question.spelling ? <form className="gk-spelling" onSubmit={(event) => { event.preventDefault(); submitAnswer(); }}>
              <label htmlFor="gk-answer">Type your answer</label>
              <input id="gk-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} disabled={locked} autoComplete="off" autoCapitalize="none" />
              {!locked && <button className="gk-button gk-primary" type="submit" disabled={!answer.trim()}>Lock in answer</button>}
            </form> : <div className="gk-answers">
              {question.answers.map((choice, index) => {
                const isCorrect = choice === question.correct;
                const className = locked && isCorrect ? "correct" : locked && answer === choice ? "incorrect" : "";
                return <button key={`${choice}-${index}`} className={`gk-answer ${className}`} onClick={() => submitAnswer(choice)} disabled={locked}>
                  <span>{String.fromCharCode(65 + index)}</span>{choice}
                </button>;
              })}
            </div>}
            {locked && <div className={`gk-feedback ${feedback === "Correct!" ? "is-correct" : "is-wrong"}`} role="status">
              <strong>{feedback === "Correct!" ? "✓ Correct" : "✕ Not quite"}</strong><span>{feedback === "Correct!" ? `You reached ${formatPrize(prize)}.` : feedback}</span>
              <button className="gk-button gk-primary" onClick={nextQuestion}>{questionIndex + 1 === questions.length ? "See results" : "Next question"} →</button>
            </div>}
          </section>
          <aside className="gk-ladder" aria-label="Prize ladder">
            <div className="gk-score"><small>RIGHT ANSWERS</small><strong>{correctCount}</strong></div>
            <h2>PRIZE LADDER</h2>
            {[...ladder].reverse().map((amount, reversedIndex) => {
              const index = ladder.length - reversedIndex - 1;
              return <div key={`${amount}-${index}`} className={`gk-ladder-step${index === questionIndex ? " current" : ""}${index < questionIndex ? " passed" : ""}`}><span>{index + 1}</span><b>{formatPrize(amount)}</b></div>;
            })}
          </aside>
        </div>
      </section>}

      {screen === "results" && <section className="gk-panel gk-results">
        <span className="gk-kicker">ROUND COMPLETE</span><div className="gk-hero-icon" aria-hidden="true">{correctCount === questions.length ? "🏆" : "✨"}</div>
        <h1>{correctCount === questions.length ? "Perfect round!" : "Nice work!"}</h1>
        <p>You got <strong>{correctCount} of {questions.length}</strong> questions right.</p>
        <div className="gk-result-score"><span>ACCURACY</span><strong>{Math.round((correctCount / questions.length) * 100)}%</strong></div>
        <div className="gk-result-actions"><button className="gk-button gk-secondary" onClick={() => setScreen("intro")}>Choose a round</button><button className="gk-button gk-primary" onClick={() => startRound(roundId)}>Play again ↻</button></div>
      </section>}
    </main>
  );
}
