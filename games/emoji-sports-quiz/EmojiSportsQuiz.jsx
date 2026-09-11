import { useState } from "react";
import "./EmojiSportsQuiz.css";

const questions = [
  { emojis: "⚽🥅👟", answer: "Football", options: ["Football", "Basketball", "Hockey", "Tennis"] },
  { emojis: "🏀⛹️‍♂️🗑️", answer: "Basketball", options: ["Volleyball", "Basketball", "Handball", "Rugby"] },
  { emojis: "🎾🥎🏃", answer: "Tennis", options: ["Tennis", "Baseball", "Golf", "Cricket"] },
  { emojis: "🏏🏃‍♂️🧤", answer: "Cricket", options: ["Baseball", "Cricket", "Hockey", "Tennis"] },
  { emojis: "🏈🏃‍♂️💥", answer: "American Football", options: ["Rugby", "American Football", "Football", "Wrestling"] },
  { emojis: "🏉🏃‍♂️💪", answer: "Rugby", options: ["Rugby", "American Football", "Handball", "Football"] },
  { emojis: "🏐🙌🔥", answer: "Volleyball", options: ["Volleyball", "Basketball", "Tennis", "Badminton"] },
  { emojis: "🏒🥅❄️", answer: "Ice Hockey", options: ["Ice Hockey", "Field Hockey", "Curling", "Skating"] },
  { emojis: "🏸🪶🏃", answer: "Badminton", options: ["Tennis", "Badminton", "Table Tennis", "Squash"] },
  { emojis: "🏓👋⚡", answer: "Table Tennis", options: ["Badminton", "Table Tennis", "Tennis", "Volleyball"] },
  { emojis: "⛳🏌️‍♂️🌳", answer: "Golf", options: ["Golf", "Baseball", "Cricket", "Bowling"] },
  { emojis: "🥊👊🥇", answer: "Boxing", options: ["Boxing", "Wrestling", "Karate", "Judo"] },
  { emojis: "🏊‍♂️🌊⏱️", answer: "Swimming", options: ["Swimming", "Surfing", "Diving", "Water Polo"] },
  { emojis: "🚴‍♂️🚲🏁", answer: "Cycling", options: ["Cycling", "Motor Racing", "Running", "Skateboarding"] },
  { emojis: "🏃‍♂️💨🏁", answer: "Athletics", options: ["Athletics", "Cycling", "Football", "Marathon"] },
  { emojis: "🎳💥🎯", answer: "Bowling", options: ["Bowling", "Golf", "Darts", "Baseball"] },
  { emojis: "🎯🏹🍎", answer: "Archery", options: ["Archery", "Darts", "Shooting", "Golf"] },
  { emojis: "🥋🥇💪", answer: "Judo", options: ["Judo", "Boxing", "Karate", "Wrestling"] },
  { emojis: "🏄‍♂️🌊🏖️", answer: "Surfing", options: ["Swimming", "Surfing", "Water Polo", "Sailing"] },
  { emojis: "🤺⚔️🏆", answer: "Fencing", options: ["Fencing", "Archery", "Boxing", "Judo"] },
];

export default function EmojiSportsQuiz() {
  const [screen, setScreen] = useState("start");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);

  const question = questions[currentQuestion];

  const startGame = () => {
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setAnswered(false);
    setScreen("quiz");
  };

  const selectAnswer = (option) => {
    if (answered) return;

    const correct = question.answer;
    const isCorrect = option === correct;

    setSelectedAnswer(option);
    setAnswered(true);

    if (isCorrect) {
      const newStreak = streak + 1;
      const points = 100 + streak * 25;

      setStreak(newStreak);
      setScore((prev) => prev + points);
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= questions.length) {
      setScreen("end");
      return;
    }

    setCurrentQuestion((prev) => prev + 1);
    setSelectedAnswer(null);
    setAnswered(false);
  };

  const percentage = Math.round((score / 10000) * 100);

  const getResultMessage = () => {
    if (percentage >= 80) return "🔥 Sports master! You know your games!";
    if (percentage >= 60) return "👏 Great job! You know your sports!";
    if (percentage >= 40) return "👍 Not bad! Keep practicing!";
    return "💪 Keep playing — you'll get better!";
  };

  if (screen === "start") {
    return (
      <div className="emoji-sports-page">
        <div className="emoji-sports-game">
          <div className="start-screen">
            <div className="big-emoji">🏆⚽🏀🎾</div>
            <h1>Emoji <span>Sports</span></h1>
            <p>Can you figure out the sport from the emojis?</p>
            <button className="start-btn" onClick={startGame}>PLAY QUIZ</button>
          </div>
        </div>
      </div>
    );
  }

  if (screen === "end") {
    return (
      <div className="emoji-sports-page">
        <div className="emoji-sports-game">
          <div className="end-screen">
            <div className="big-emoji">🏆</div>
            <h1>Quiz Complete!</h1>
            <p>{getResultMessage()}</p>
            <div className="final-score">{score}</div>
            <p>You scored {score} points across {questions.length} questions.</p>
            <button className="start-btn" onClick={startGame}>PLAY AGAIN</button>
          </div>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="emoji-sports-page">
      <div className="emoji-sports-game">
        <div className="quiz-header">
          <div className="quiz-title">Emoji <span>Sports</span></div>
          <div className="stats">
            <div className="stat"><small>SCORE</small><strong>{score}</strong></div>
            <div className="stat"><small>STREAK</small><strong>{streak}</strong></div>
          </div>
        </div>

        <div className="progress">
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>

        <div className="question-card">
          <div className="question-number">QUESTION {currentQuestion + 1} / {questions.length}</div>
          <div className="emojis">{question.emojis}</div>
          <div className="question">Which sport is this?</div>
        </div>

        <div className="answers">
          {question.options.map((option) => {
            const isCorrect = option === question.answer;
            const isSelected = option === selectedAnswer;

            let className = "answer";

            if (answered && isCorrect) className += " correct";
            if (answered && isSelected && !isCorrect) className += " wrong";

            return (
              <button key={option} className={className} onClick={() => selectAnswer(option)} disabled={answered}>
                <span className="answer-letter">{String.fromCharCode(65 + question.options.indexOf(option))}</span>
                {option}
              </button>
            );
          })}
        </div>

        <div className={`feedback ${answered ? selectedAnswer === question.answer ? "feedback-correct" : "feedback-wrong" : ""}`}> 
          {!answered ? "Choose your answer!" : selectedAnswer === question.answer ? `✅ Correct! +${100 + (streak - 1) * 25} points` : `❌ Not quite! The answer is ${question.answer}.`}
        </div>

        {answered && (
          <button className="next" onClick={nextQuestion}>{currentQuestion + 1 === questions.length ? "SEE RESULTS →" : "NEXT QUESTION →"}</button>
        )}
      </div>
    </div>
  );
}
