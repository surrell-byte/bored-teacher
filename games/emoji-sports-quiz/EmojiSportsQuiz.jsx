import { useEffect, useState } from "react";
import "./EmojiSportsQuiz.css";

const EMOJI_QUESTIONS = [
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

const SPELLING_QUESTIONS = [
  { answer: "Badminton", image: "/assets/games/sports-quiz/badminton.webp", alt: "Players playing badminton" },
  { answer: "Basketball", image: "/assets/games/sports-quiz/basketball-1.jpg", alt: "A basketball" },
  { answer: "Tennis", image: "/assets/games/sports-quiz/tennis.avif", alt: "A tennis ball" },
  { answer: "Cricket", image: "/assets/games/sports-quiz/cricket.webp", alt: "A cricket match" },
  { answer: "Ice Hockey", image: "/assets/games/sports-quiz/ice-hockey.webp", alt: "Ice hockey players" },
  { answer: "Swimming", image: "/assets/games/sports-quiz/swimming.jpg", alt: "A swimmer" },
  { answer: "American Football", image: "/assets/games/sports-quiz/american-football.webp", alt: "American football players" },
];

const SENTENCE_QUESTIONS = [
  { sentence: "We use a racket and shuttlecock to play ____.", answer: "Badminton", options: ["Badminton", "Baseball", "Rugby", "Swimming"] },
  { sentence: "A team scores points by throwing a ball through a hoop in ____.", answer: "Basketball", options: ["Football", "Basketball", "Tennis", "Cricket"] },
  { sentence: "Players use rackets to hit a ball over a net in ____.", answer: "Tennis", options: ["Tennis", "Ice Hockey", "Golf", "Boxing"] },
  { sentence: "A bat, wickets, and a hard ball are used in ____.", answer: "Cricket", options: ["Rugby", "Cricket", "Bowling", "Cycling"] },
  { sentence: "Players wear skates and use sticks to hit a puck in ____.", answer: "Ice Hockey", options: ["Ice Hockey", "Football", "Volleyball", "Athletics"] },
  { sentence: "You wear goggles and move through water in ____.", answer: "Swimming", options: ["Surfing", "Swimming", "Fencing", "Judo"] },
  { sentence: "Players carry an oval ball and wear helmets in ____.", answer: "American Football", options: ["American Football", "Tennis", "Golf", "Table Tennis"] },
  { sentence: "Players score goals by kicking a ball into a net in ____.", answer: "Football", options: ["Basketball", "Football", "Rugby", "Baseball"] },
];

const MODES = [
  { id: "emoji", icon: "😀", title: "Emoji Match", description: "Name the sport from its emoji clue." },
  { id: "spell", icon: "✏️", title: "Spell the Sport", description: "Look at the sport and spell its name." },
  { id: "sentence", icon: "💬", title: "Complete the Sentence", description: "Choose the sport that completes each sentence." },
];

const shuffle = (items) => {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
};

const balancedRound = (questions) => shuffle(questions).map((question, questionIndex) => {
  const distractors = shuffle(question.options.filter((option) => option !== question.answer));
  const options = [...distractors];
  options.splice(questionIndex % question.options.length, 0, question.answer);
  return { ...question, options };
});

const normalise = (value) => value.trim().toLowerCase().replace(/[\s-]+/g, " ");

export default function EmojiSportsQuiz({ onHudUpdate, onComplete }) {
  const [screen, setScreen] = useState("modes");
  const [mode, setMode] = useState(null);
  const [round, setRound] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [spellingAttempt, setSpellingAttempt] = useState("");
  const [answered, setAnswered] = useState(false);

  const question = round[currentQuestion];
  const activeMode = MODES.find((item) => item.id === mode);

  useEffect(() => {
    onHudUpdate?.(screen === "quiz" ? { score, streak } : null);
  }, [onHudUpdate, screen, score, streak]);

  useEffect(() => {
    const returnToModes = () => setScreen("modes");
    window.addEventListener("emoji-sports:main-menu", returnToModes);
    return () => window.removeEventListener("emoji-sports:main-menu", returnToModes);
  }, []);

  const startGame = (modeId) => {
    const nextRound = modeId === "emoji" ? balancedRound(EMOJI_QUESTIONS)
      : modeId === "sentence" ? balancedRound(SENTENCE_QUESTIONS)
        : shuffle(SPELLING_QUESTIONS);
    setMode(modeId);
    setRound(nextRound);
    setCurrentQuestion(0);
    setScore(0);
    setStreak(0);
    setSelectedAnswer(null);
    setSpellingAttempt("");
    setAnswered(false);
    setScreen("quiz");
  };

  const finishAnswer = (answer, isCorrect) => {
    if (answered) return;
    setSelectedAnswer(answer);
    setAnswered(true);
    if (isCorrect) {
      setStreak((value) => value + 1);
      setScore((value) => value + 100 + streak * 25);
    } else {
      setStreak(0);
    }
  };

  const submitSpelling = (event) => {
    event.preventDefault();
    if (spellingAttempt.trim()) finishAnswer(spellingAttempt, normalise(spellingAttempt) === normalise(question.answer));
  };

  const nextQuestion = () => {
    if (currentQuestion + 1 >= round.length) {
      const maxScore = round.length * 100 + ((round.length * (round.length - 1)) / 2) * 25;
      onComplete?.(score, Math.round((score / maxScore) * 100));
      setScreen("end");
      return;
    }
    setCurrentQuestion((value) => value + 1);
    setSelectedAnswer(null);
    setSpellingAttempt("");
    setAnswered(false);
  };

  const percentage = round.length ? Math.round((score / (round.length * 100 + ((round.length * (round.length - 1)) / 2) * 25)) * 100) : 0;
  const resultMessage = percentage >= 80 ? "🔥 Sports master! You know your games!" : percentage >= 60 ? "👏 Great job! You know your sports!" : percentage >= 40 ? "👍 Not bad! Keep practicing!" : "💪 Keep playing — you'll get better!";

  if (screen === "modes") return <div className="emoji-sports-page"><section className="emoji-sports-game mode-menu" aria-labelledby="sports-quiz-title"><div className="mode-menu-heading"><span aria-hidden="true">🏆</span><p>Choose a mode</p><h1 id="sports-quiz-title">Sports <span>Quiz</span></h1><p>Every level is ready to play.</p></div><div className="mode-grid">{MODES.map((item) => <button key={item.id} type="button" className="mode-card" onClick={() => startGame(item.id)}><span className="mode-icon" aria-hidden="true">{item.icon}</span><span className="mode-copy"><strong>{item.title}</strong><small>{item.description}</small></span><span className="mode-status">Play →</span></button>)}</div></section></div>;

  if (screen === "end") return <div className="emoji-sports-page"><section className="emoji-sports-game end-screen"><div className="big-emoji">🏆</div><p className="mode-kicker">{activeMode?.title}</p><h1>Quiz Complete!</h1><p>{resultMessage}</p><div className="final-score">{score}</div><p>You scored {score} points across {round.length} questions.</p><div className="end-actions"><button className="start-btn secondary" type="button" onClick={() => setScreen("modes")}>CHOOSE A MODE</button><button className="start-btn" type="button" onClick={() => startGame(mode)}>PLAY AGAIN</button></div></section></div>;

  const isSpellingMode = mode === "spell";
  const isCorrect = selectedAnswer === question.answer || (isSpellingMode && normalise(selectedAnswer || "") === normalise(question.answer));
  const prompt = isSpellingMode ? "Spell the sport in the picture." : mode === "sentence" ? "Choose the sport that completes the sentence." : "Which sport is this?";

  return <div className="emoji-sports-page"><section className="emoji-sports-game"><div className="quiz-topline"><button type="button" className="back-to-modes" onClick={() => setScreen("modes")}>← Modes</button><span>{activeMode?.title}</span></div><div className="progress"><div className="progress-bar" style={{ width: `${((currentQuestion + 1) / round.length) * 100}%` }} /></div><div className={`question-card ${isSpellingMode ? "question-card-image" : ""}`}><div className="question-number">QUESTION {currentQuestion + 1} / {round.length}</div>{mode === "emoji" && <div className="emojis">{question.emojis}</div>}{isSpellingMode && <img className="sport-photo" src={question.image} alt={question.alt} />}{mode === "sentence" && <p className="sentence-question">{question.sentence}</p>}<div className="question">{prompt}</div></div>{isSpellingMode ? <form className="spelling-form" onSubmit={submitSpelling}><label className="sr-only" htmlFor="sports-spelling-answer">Type the sport name</label><input id="sports-spelling-answer" value={spellingAttempt} onChange={(event) => setSpellingAttempt(event.target.value)} disabled={answered} autoComplete="off" placeholder="Type the sport name" />{!answered && <button className="next" type="submit">CHECK SPELLING</button>}</form> : <div className="answers">{question.options.map((option, optionIndex) => <button key={option} type="button" className={`answer${answered && option === question.answer ? " correct" : ""}${answered && option === selectedAnswer && option !== question.answer ? " wrong" : ""}`} onClick={() => finishAnswer(option, option === question.answer)} disabled={answered}><span className="answer-letter">{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div>}<div className={`feedback ${answered ? isCorrect ? "feedback-correct" : "feedback-wrong" : ""}`}>{!answered ? "Choose your answer!" : isCorrect ? `✅ Correct! +${100 + (streak - 1) * 25} points` : `❌ Not quite! The answer is ${question.answer}.`}</div>{answered && <button className="next" type="button" onClick={nextQuestion}>{currentQuestion + 1 === round.length ? "SEE RESULTS →" : "NEXT QUESTION →"}</button>}</section></div>;
}
