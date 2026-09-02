import React, { useEffect, useRef, useState } from "react";

const questions = [
  { level: "A1", name: "BEGINNER", text: "Big blue balloons bounce." },
  { level: "A1", name: "BEGINNER", text: "Red roses are really red." },
  { level: "A1", name: "BEGINNER", text: "Six silly sheep sit." },
  { level: "A1", name: "BEGINNER", text: "Green grapes grow quickly." },
  { level: "A1", name: "BEGINNER", text: "Ten tiny turtles talk." },
  { level: "A1", name: "BEGINNER", text: "Fresh fish swim fast." },
  { level: "A1", name: "BEGINNER", text: "Three thin things." },
  { level: "A1", name: "BEGINNER", text: "Five funny frogs fly." },
  { level: "A1", name: "BEGINNER", text: "Black birds blink." },
  { level: "A1", name: "BEGINNER", text: "Small snakes slide slowly." },
  { level: "A2", name: "ELEMENTARY", text: "Peter Piper picked a pepper." },
  { level: "A2", name: "ELEMENTARY", text: "She sees six shiny shells." },
  { level: "A2", name: "ELEMENTARY", text: "Seven silly singers sing songs." },
  { level: "A2", name: "ELEMENTARY", text: "Tom took two tiny toys." },
  { level: "A2", name: "ELEMENTARY", text: "Fred found four fresh flowers." },
  { level: "A2", name: "ELEMENTARY", text: "Busy bees buzz by the blue bush." },
  { level: "A2", name: "ELEMENTARY", text: "A big black bug bit a big black bear." },
  { level: "A2", name: "ELEMENTARY", text: "Five fat frogs flew from France." },
  { level: "A2", name: "ELEMENTARY", text: "Three free throws." },
  { level: "A2", name: "ELEMENTARY", text: "Fresh fruit flies freely." },
  { level: "B1", name: "INTERMEDIATE", text: "She sells seashells by the seashore." },
  { level: "B1", name: "INTERMEDIATE", text: "How much wood would a woodchuck chuck?" },
  { level: "B1", name: "INTERMEDIATE", text: "Red lorry, yellow lorry." },
  { level: "B1", name: "INTERMEDIATE", text: "Unique New York, unique New York." },
  { level: "B1", name: "INTERMEDIATE", text: "Toy boat, toy boat, toy boat." },
  { level: "B1", name: "INTERMEDIATE", text: "Which witch wished which wicked wish?" },
  { level: "B1", name: "INTERMEDIATE", text: "A proper copper coffee pot." },
  { level: "B1", name: "INTERMEDIATE", text: "Six slippery snails slid slowly seaward." },
  { level: "B1", name: "INTERMEDIATE", text: "Eleven elves licked eleven little lemons." },
  { level: "B1", name: "INTERMEDIATE", text: "Friendly frogs freely flipped fresh fish." },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "Peter Piper picked a peck of pickled peppers." },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "How can a clam cram in a clean cream can?" },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "If two witches were watching two watches, which witch would watch which watch?" },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "Four furious friends fought for the phone." },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "The thirty-three thieves thought that they thrilled the throne throughout Thursday." },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "A noisy noise annoys an oyster." },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "Six sleek swans swam swiftly southwards." },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "Lesser leather never weathered wetter weather better." },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "Truly rural, truly rural, truly rural." },
  { level: "B2", name: "UPPER-INTERMEDIATE", text: "We surely shall see the sunshine soon." },
  { level: "C1", name: "ADVANCED", text: "The sixth sick sheikh's sixth sheep's sick." },
  { level: "C1", name: "ADVANCED", text: "Pad kid poured curd pulled cod." },
  { level: "C1", name: "ADVANCED", text: "Irish wristwatch, Swiss wristwatch." },
  { level: "C1", name: "ADVANCED", text: "Which wristwatches are Swiss wristwatches?" },
  { level: "C1", name: "ADVANCED", text: "A skunk sat on a stump and thunk the stump stunk." },
  { level: "C1", name: "ADVANCED", text: "Can you can a can as a canner can can a can?" },
  { level: "C1", name: "ADVANCED", text: "The great Greek grape growers grow great Greek grapes." },
  { level: "C1", name: "ADVANCED", text: "If the weather is wet, whether the weather is hot, we have to put up with the weather." },
  { level: "C1", name: "ADVANCED", text: "Near an ear, a nearer ear, a nearly eerie ear." },
  { level: "C1", name: "ADVANCED", text: "Six thick thistle sticks thrust through the thicket." },
  { level: "C2", name: "MASTERY", text: "The sixth sick sheikh's sixth sheep's sickly sickness slowly subsided." },
  { level: "C2", name: "MASTERY", text: "Pad kid poured curd pulled cod while the cold crowd called." },
  { level: "C2", name: "MASTERY", text: "A particularly prickly purple porcupine pricked a perfectly prepared pumpkin." },
  { level: "C2", name: "MASTERY", text: "The bewildered blacksmith briskly brought three bright brass bracelets." },
  { level: "C2", name: "MASTERY", text: "Rarely rural, really rural, rarely really rural." },
  { level: "C2", name: "MASTERY", text: "The sophisticated physicist's fascinating hypothesis frustrated three philosophical theorists." },
  { level: "C2", name: "MASTERY", text: "Sixth-century Scottish scholars scrutinized strangely structured Sanskrit scriptures." },
  { level: "C2", name: "MASTERY", text: "The entrepreneurial anthropologist enthusiastically analyzed three theoretical thermodynamic theories." },
  { level: "C2", name: "MASTERY", text: "British bureaucracy brutally bewildered the brilliant Brazilian biographer." },
  { level: "C2", name: "MASTERY", text: "The quintessentially quirky queen quickly questioned the questionable qualifications of the quiet, quivering quartet." },
];

const LEVEL_COLORS = {
  A1: "beginner",
  A2: "elementary",
  B1: "intermediate",
  B2: "upper-intermediate",
  C1: "advanced",
  C2: "mastery",
};

export default function TongueTwisterGame() {
  const [screen, setScreen] = useState("start");
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [answer, setAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const timerRef = useRef(null);
  const question = questions[current];

  useEffect(() => {
    if (screen !== "game") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((time) => {
        if (time <= 1) {
          clearInterval(timerRef.current);
          handleLoseLife("Time's up! ⏰");
          return 0;
        }

        return time - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [screen, current]);

  const startGame = () => {
    clearInterval(timerRef.current);

    setCurrent(0);
    setScore(0);
    setLives(3);
    setAnswer("");
    setFeedback(null);
    setTimeLeft(30);
    setScreen("game");
  };

  const handleLoseLife = (message) => {
    clearInterval(timerRef.current);

    setFeedback({ type: "error", message });

    setLives((previous) => {
      const nextLives = previous - 1;

      if (nextLives <= 0) {
        setTimeout(() => {
          setScreen("end");
        }, 900);
      } else {
        setTimeout(() => {
          moveToNextQuestion();
        }, 900);
      }

      return nextLives;
    });
  };

  const moveToNextQuestion = () => {
    if (current + 1 >= questions.length) {
      setScreen("end");
      return;
    }

    setCurrent((previous) => previous + 1);
    setAnswer("");
    setFeedback(null);
    setTimeLeft(30);
  };

  const normalize = (text) =>
    text
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:'"]/g, "")
      .replace(/\s+/g, " ");

  const checkAnswer = () => {
    if (!answer.trim()) {
      setFeedback({ type: "error", message: "Type the tongue twister first." });
      return;
    }

    if (normalize(answer) === normalize(question.text)) {
      clearInterval(timerRef.current);

      const points = 100 + timeLeft * 5;
      setScore((previous) => previous + points);
      setFeedback({ type: "success", message: `🎉 Perfect! +${points} points` });

      setTimeout(() => {
        moveToNextQuestion();
      }, 900);
    } else {
      handleLoseLife("Not quite! Try again.");
    }
  };

  const hearTwister = () => {
    if (!("speechSynthesis" in window)) {
      setFeedback({ type: "error", message: "Text-to-speech isn't supported in this browser." });
      return;
    }

    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(question.text);
    speech.lang = "en-US";
    speech.rate = 0.8;
    speech.pitch = 1;
    window.speechSynthesis.speak(speech);
  };

  const startSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setFeedback({ type: "error", message: "Speech recognition isn't supported here. Try Chrome." });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;

    setIsListening(true);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setAnswer(spokenText);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setFeedback({ type: "error", message: "I couldn't hear you. Try again." });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  if (screen === "start") {
    return (
      <div className="tt-game">
        <div className="tt-start-screen">
          <div className="tt-icon">👅</div>
          <h1>Tongue Twister Challenge</h1>
          <p>Test your English pronunciation with 60 tongue twisters, progressing from A1 beginner to C2 mastery.</p>
          <button className="tt-start-button" onClick={startGame}>Start Challenge →</button>
          <div className="tt-level-preview"><span>A1</span><span>A2</span><span>B1</span><span>B2</span><span>C1</span><span>C2</span></div>
        </div>
      </div>
    );
  }

  if (screen === "end") {
    return (
      <div className="tt-game">
        <div className="tt-end-screen">
          <div className="tt-icon">🏆</div>
          <h1>Challenge Complete!</h1>
          <div className="tt-final-score">{score}</div>
          <div className="tt-points-label">POINTS</div>
          <p>You completed the tongue twister challenge.</p>
          <div className="tt-result-stats">
            <div><strong>{current}</strong><span>Completed</span></div>
            <div><strong>{score}</strong><span>Score</span></div>
          </div>
          <button className="tt-start-button" onClick={startGame}>Play Again</button>
        </div>
      </div>
    );
  }

  const progress = ((current + 1) / questions.length) * 100;
  const timerProgress = (timeLeft / 30) * 100;

  return (
    <div className="tt-game">
      <header className="tt-header">
        <div className="tt-logo">👅 Tongue Twister</div>
        <div className="tt-stats">
          <div className="tt-stat">⭐ <strong>{score}</strong></div>
          <div className="tt-stat">❤️ <strong>{lives}</strong></div>
        </div>
      </header>

      <div className="tt-progress-area">
        <div className="tt-progress-info">
          <span>Challenge {current + 1} of {questions.length}</span>
          <span>{question.level}</span>
        </div>
        <div className="tt-progress"><div className="tt-progress-bar" style={{ width: `${progress}%` }} /></div>
      </div>

      <main className="tt-main">
        <div className="tt-level">
          <span className={`tt-level-badge ${LEVEL_COLORS[question.level]}`}>{question.level} • {question.name}</span>
          <h1>Say It!</h1>
          <p>Read the tongue twister and type it below.</p>
        </div>

        <div className="tt-challenge">
          <div className="tt-card">
            <span className="tt-difficulty">{question.level}</span>
            <div className="tt-twister">{question.text}</div>
          </div>

          <div className="tt-timer-area">
            <div className="tt-timer-info">
              <span>Time</span>
              <strong>{timeLeft}s</strong>
            </div>
            <div className="tt-timer"><div className="tt-timer-bar" style={{ width: `${timerProgress}%` }} /></div>
          </div>

          <div className="tt-input-area">
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  checkAnswer();
                }
              }}
              placeholder="Type the tongue twister here..."
              disabled={isListening}
            />

            <div className="tt-buttons">
              <button className="tt-speak-button" onClick={hearTwister}>🔊 Hear It</button>
              <button className={`tt-mic-button ${isListening ? "listening" : ""}`} onClick={startSpeechRecognition}>{isListening ? "🎙️ Listening..." : "🎤 Speak"}</button>
              <button className="tt-secondary-button" onClick={() => setAnswer("")}>Clear</button>
              <button className="tt-primary-button" onClick={checkAnswer}>✓ Check Answer</button>
            </div>
          </div>

          <div className={`tt-feedback ${feedback?.type || ""}`}>{feedback?.message}</div>
        </div>
      </main>
    </div>
  );
}
