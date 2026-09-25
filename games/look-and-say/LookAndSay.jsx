import React, { useEffect, useRef, useState } from "react";
import "./LookAndSay.css";

const rawItems = [
  { word: "apple", emoji: "🍎", sentence: "It is a red apple.", choices: ["It is a red apple.", "It is a red strawberry.", "It is a red cherry."] },
  { word: "ball", emoji: "🟡", sentence: "It is a yellow ball.", choices: ["It is a blue ball.", "It is a yellow ball.", "It is a green kite."] },
  { word: "flower", emoji: "🌼", sentence: "It is a yellow flower.", choices: ["It is a yellow flower.", "It is a red balloon.", "It is a green tree."] },
  { word: "cat", emoji: "🐱", sentence: "It is a small cat.", choices: ["It is a small cat.", "It is a big dog.", "It is a red fox."] },
  { word: "banana", emoji: "🍌", sentence: "It is a yellow banana.", choices: ["It is a yellow banana.", "It is a green apple.", "It is a blue pear."] },
  { word: "car", emoji: "🚗", sentence: "It is a red car.", choices: ["It is a red car.", "It is a yellow bus.", "It is a green bike."] },
  { word: "sun", emoji: "☀️", sentence: "It is a bright sun.", choices: ["It is a bright sun.", "It is a rainy cloud.", "It is a white moon."] },
  { word: "house", emoji: "🏠", sentence: "It is a blue house.", choices: ["It is a blue house.", "It is a red boat.", "It is a green tree."] },
  { word: "fish", emoji: "🐟", sentence: "It is an orange fish.", choices: ["It is an orange fish.", "It is a pink bird.", "It is a yellow frog."] },
  { word: "book", emoji: "📚", sentence: "It is a blue book.", choices: ["It is a blue book.", "It is a red pencil.", "It is a green bag."] },
  { word: "tree", emoji: "🌳", sentence: "It is a green tree.", choices: ["It is a green tree.", "It is a yellow flower.", "It is a brown bear."] },
  { word: "pizza", emoji: "🍕", sentence: "It is a tasty pizza.", choices: ["It is a tasty pizza.", "It is a sweet cake.", "It is a hot soup."] },
  { word: "dog", emoji: "🐶", sentence: "It is a happy dog.", choices: ["It is a happy dog.", "It is a sleepy cat.", "It is a fast horse."] },
  { word: "star", emoji: "⭐", sentence: "It is a bright star.", choices: ["It is a bright star.", "It is a dark cloud.", "It is a round moon."] },
];

const isValidItem = (item) => Boolean(
  item && typeof item.word === "string" && item.word && typeof item.emoji === "string" && item.emoji
  && typeof item.sentence === "string" && item.sentence
  && Array.isArray(item.choices) && item.choices.length >= 2 && item.choices.includes(item.sentence)
);
const items = rawItems.filter(isValidItem);

export default function LookAndSay() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const advanceTimerRef = useRef(null);
  const item = items[current] || null;

  const startGame = () => {
    clearTimeout(advanceTimerRef.current);
    setStarted(true);
    setFinished(false);
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setFeedback("");
  };

  const answerQuestion = (choice) => {
    if (!item || selected !== null || !item.choices.includes(choice)) return;
    setSelected(choice);
    if (choice === item.sentence) {
      setScore((prev) => prev + 1);
      setFeedback("🎉 Correct!");
    } else {
      setFeedback(`❌ Not quite. The answer is "${item.sentence}"`);
    }
    advanceTimerRef.current = setTimeout(() => {
      if (current + 1 >= items.length) {
        setFinished(true);
      } else {
        setCurrent((prev) => prev + 1);
        setSelected(null);
        setFeedback("");
      }
    }, 1000);
  };

  useEffect(() => () => clearTimeout(advanceTimerRef.current), []);

  const progress = items.length > 0 ? ((current + 1) / items.length) * 100 : 0;

  return (
    <div className="look-and-say-game">
      {!started && (
        <div className="start">
          <div className="start-box">
            <div className="start-icon" aria-hidden="true">👀</div>
            <h1>Look <span>&amp;</span> Say!</h1>
            <p><strong>Look carefully!</strong><br />Look at the picture. Choose the sentence that exactly describes what you see.</p>
            <div className="question-badge"><span aria-hidden="true">✦</span> {items.length} QUESTIONS</div>
            <button className="start-btn" onClick={startGame}>Start Game <span aria-hidden="true">→</span></button>
          </div>
        </div>
      )}

      {started && !finished && !item && (
        <div className="finish"><div className="finish-box"><h2>Questions unavailable</h2><p>Please try again later.</p><button className="again" onClick={startGame}>Try Again</button></div></div>
      )}

      {finished && (
        <div className="finish">
          <div className="finish-box">
            <div className="finish-icon">🏆</div>
            <h2>Great job!</h2>
            <div className="final-score">You got {score} out of {items.length} correct!</div>
            <div className="result-message">{score === items.length ? "🌟 Perfect score!" : score >= items.length * 0.8 ? "👏 Excellent work!" : score >= items.length * 0.6 ? "👍 Good job!" : "💪 Keep practising!"}</div>
            <button className="again" onClick={startGame}>Play Again</button>
          </div>
        </div>
      )}

      {started && !finished && item && (
        <>
          <div className="progress"><div className="bar" style={{ width: `${progress}%` }} /></div>
          <div className="question-number">Question {current + 1} of {items.length}</div>
          <div className="picture-card"><div className="picture-emoji" role="img" aria-label={item.word}>{item.emoji}</div></div>
          <div className="question">Which sentence matches the picture?</div>
          <div className="choices">
            {item.choices.map((choice, index) => {
              let className = "choice";
              if (selected !== null) {
                if (choice === item.sentence) className += " correct";
                else if (choice === selected) className += " wrong";
              }
              return <button key={index} className={className} onClick={() => answerQuestion(choice)} disabled={selected !== null}>{choice}</button>;
            })}
          </div>
          <div className="feedback">{feedback}</div>
        </>
      )}
    </div>
  );
}
