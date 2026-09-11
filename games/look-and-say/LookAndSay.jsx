import React, { useState } from "react";
import "./LookAndSay.css";

const items = [
  {
    word: "apple",
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2ZlOWYxZCIvPjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQ1IiBmaWxsPSIjZWRlMi0xIi8+PHN0eWxlPmN1cnNvcjogcG9pbnRlciA7PC9zdHlsZT48L3N2Zz4=",
    sentence: "It's a red apple.",
    choices: ["It's a red apple.", "It's a red strawberry.", "It's a red cherry."]
  },
  {
    word: "ball",
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2RlZmZlZmYiLz48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0NCIgZmlsbD0iI2Y2YzE0ZiIvPjwvc3ZnPg==",
    sentence: "It is a blue ball.",
    choices: ["It is a blue ball.", "It is a yellow ball.", "It is a green kite."]
  },
  {
    word: "flower",
    image: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2VlZjk3NCIvPjxYbGFuZSBoYXQ+PC9YbGFuZT48L3N2Zz4=",
    sentence: "It is a yellow flower.",
    choices: ["It is a yellow flower.", "It is a red balloon.", "It is a green tree."]
  },
];

export default function LookAndSay() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");

  const item = items[current];

  const startGame = () => {
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback("");
  };

  const answerQuestion = (choice) => {
    if (selected !== null) return;

    setSelected(choice);

    if (choice === item.sentence) {
      setScore((prev) => prev + 1);
      setFeedback("🎉 Correct!");
    } else {
      setFeedback(`❌ Not quite. The answer is "${item.sentence}"`);
    }

    setTimeout(() => {
      if (current + 1 >= items.length) {
        setFinished(true);
      } else {
        setCurrent((prev) => prev + 1);
        setSelected(null);
        setFeedback("");
      }
    }, 1000);
  };

  const restart = () => {
    startGame();
  };

  const progress = items.length > 0 ? ((current + 1) / items.length) * 100 : 0;

  return (
    <div className="game">
      {!started && (
        <div className="start">
          <div className="start-box">
            <div className="start-icon">💡</div>
            <h1>Look & Say!</h1>
            <p>Look at the picture. Choose the sentence that says exactly what you see. There are 50 colourful questions!</p>
            <button className="start-btn" onClick={startGame}>Start Game</button>
          </div>
        </div>
      )}

      {finished && (
        <div className="finish">
          <div className="finish-box">
            <div className="finish-icon">🏆</div>
            <h2>Great job!</h2>
            <div className="final-score">You got {score} out of {items.length} correct!</div>
            <div className="result-message">
              {score === items.length ? "🌟 Perfect score!" : score >= items.length * 0.8 ? "👏 Excellent work!" : score >= items.length * 0.6 ? "👍 Good job!" : "💪 Keep practising!"}
            </div>
            <button className="again" onClick={restart}>Play Again</button>
          </div>
        </div>
      )}

      {started && !finished && item && (
        <>
          <div className="top">
            <div>
              <div className="title"><span className="bulb">💡</span>Look and say.</div>
              <div className="subtitle">Look carefully. Choose the sentence that matches the picture.</div>
            </div>
            <div className="score">⭐ {score}</div>
          </div>

          <div className="progress">
            <div className="bar" style={{ width: `${progress}%` }} />
          </div>

          <div className="question-number">Question {current + 1} of {items.length}</div>

          <div className="picture-card">
            <img src={item.image} alt={item.word} />
          </div>

          <div className="question">Which sentence matches the picture?</div>

          <div className="choices">
            {item.choices.map((choice, index) => {
              let className = "choice";

              if (selected !== null) {
                if (choice === item.sentence) className += " correct";
                else if (choice === selected) className += " wrong";
              }

              return (
                <button key={index} className={className} onClick={() => answerQuestion(choice)} disabled={selected !== null}>{choice}</button>
              );
            })}
          </div>

          <div className="feedback">{feedback}</div>
        </>
      )}
    </div>
  );
}
