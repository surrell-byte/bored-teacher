import { useEffect, useState } from "react";

const CHECKPOINT_KEY = "plantVegQuizProgress";
const ROUNDS_PER_LEVEL = 6;

const vocab = [
  { emoji: "🥕", name: "Carrot", category: "Vegetable" },
  { emoji: "🥦", name: "Broccoli", category: "Vegetable" },
  { emoji: "🌽", name: "Corn", category: "Vegetable" },
  { emoji: "🥔", name: "Potato", category: "Vegetable" },
  { emoji: "🍆", name: "Eggplant", category: "Vegetable" },
  { emoji: "🥒", name: "Cucumber", category: "Vegetable" },
  { emoji: "🌶️", name: "Chili Pepper", category: "Vegetable" },
  { emoji: "🫑", name: "Bell Pepper", category: "Vegetable" },
  { emoji: "🧅", name: "Onion", category: "Vegetable" },
  { emoji: "🧄", name: "Garlic", category: "Vegetable" },
  { emoji: "🍅", name: "Tomato", category: "Vegetable" },
  { emoji: "🫛", name: "Peas", category: "Vegetable" },
  { emoji: "🫘", name: "Beans", category: "Vegetable" },
  { emoji: "🥬", name: "Lettuce", category: "Vegetable" },
  { emoji: "🍎", name: "Apple", category: "Fruit" },
  { emoji: "🍌", name: "Banana", category: "Fruit" },
  { emoji: "🥥", name: "Coconut", category: "Fruit" },
  { emoji: "🥑", name: "Avocado", category: "Fruit" },
  { emoji: "🥭", name: "Mango", category: "Fruit" },
  { emoji: "🍊", name: "Orange", category: "Fruit" },
  { emoji: "🌻", name: "Sunflower", category: "Flower" },
  { emoji: "🌹", name: "Rose", category: "Flower" },
  { emoji: "🌷", name: "Tulip", category: "Flower" },
  { emoji: "🌺", name: "Hibiscus", category: "Flower" },
  { emoji: "🌸", name: "Cherry Blossom", category: "Flower" },
  { emoji: "🌳", name: "Tree", category: "Plant" },
  { emoji: "🌲", name: "Evergreen Tree", category: "Plant" },
  { emoji: "🌴", name: "Palm Tree", category: "Plant" },
  { emoji: "🌱", name: "Sprout", category: "Plant Part" },
  { emoji: "🌿", name: "Leafy Sprig", category: "Plant Part" },
  { emoji: "🍃", name: "Leaf", category: "Plant Part" },
];

const triviaQuestions = [
  { question: "Which vegetable do rabbits love to eat?", answer: "Carrot", emoji: "🥕" },
  { question: "There's a saying that this fruit \"keeps the doctor away\". Which fruit?", answer: "Apple", emoji: "🍎" },
  { question: "Which vegetable makes people cry when it's chopped?", answer: "Onion", emoji: "🧅" },
  { question: "Which fruit is a favorite snack for monkeys?", answer: "Banana", emoji: "🍌" },
  { question: "Which vegetable is sliced and fried to make chips and fries?", answer: "Potato", emoji: "🥔" },
  { question: "Which fruit grows high up on tall tropical palm trees?", answer: "Coconut", emoji: "🥥" },
  { question: "Which fruit is mashed up to make guacamole?", answer: "Avocado", emoji: "🥑" },
  { question: "Which flower is often given as a gift on Valentine's Day?", answer: "Rose", emoji: "🌹" },
  { question: "Which flower slowly turns during the day to face the sun?", answer: "Sunflower", emoji: "🌻" },
  { question: "In old stories, which vegetable is said to keep vampires away?", answer: "Garlic", emoji: "🧄" },
  { question: "Which vegetable is cooked down to make ketchup?", answer: "Tomato", emoji: "🍅" },
  { question: "Which vegetable looks like a tiny green tree and is very healthy?", answer: "Broccoli", emoji: "🥦" },
  { question: "Which vegetable is popped to make a crunchy snack?", answer: "Corn", emoji: "🌽" },
  { question: "Which small, spicy vegetable adds heat to food?", answer: "Chili Pepper", emoji: "🌶️" },
  { question: "Which sweet, juicy fruit is very popular in India?", answer: "Mango", emoji: "🥭" },
  { question: "Which vegetable is pickled in vinegar to make pickles?", answer: "Cucumber", emoji: "🥒" },
];

const growthStagesQuestion = {
  type: "special",
  category: "Plant Knowledge",
  emoji: "🌱➡️🌳",
  name: "1. Seed → 2. Sprout → 3. Leaves → 4. Flowers → 5. Fruit",
  questionText: "What are the five stages of a plant's growth?",
  options: [
    "1. Seed → 2. Sprout → 3. Leaves → 4. Flowers → 5. Fruit",
    "1. Seed → 2. Flowers → 3. Sprout → 4. Leaves → 5. Fruit",
    "1. Fruit → 2. Flowers → 3. Leaves → 4. Sprout → 5. Seed",
    "1. Seed → 2. Leaves → 3. Sprout → 4. Flowers → 5. Fruit",
  ],
};

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function articleFor(name) {
  return /^[aeiou]/i.test(name) ? "an" : "a";
}

function normalize(str) {
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

function getDifficultyScore(item) {
  const name = (item.name || item.answer || item.question || "").toLowerCase();
  let score = 0;
  if (item.category === "Plant Part" || item.category === "Plant") score += 3;
  else if (item.category === "Flower") score += 2;
  if (name.includes(" ") || name.length > 9) score += 2;
  if (["chili pepper", "bell pepper", "leafy sprig", "evergreen tree", "cherry blossom", "coconut", "avocado", "eggplant"].includes(name)) score += 2;
  return score;
}

function buildProgressiveRounds(items, extraItems = []) {
  const ordered = [...items].sort((a, b) => getDifficultyScore(a) - getDifficultyScore(b));
  const roughSize = Math.max(1, Math.ceil(ordered.length / ROUNDS_PER_LEVEL));
  const rounds = [];

  for (let i = 0; i < ROUNDS_PER_LEVEL; i += 1) {
    const chunk = ordered.slice(i * roughSize, (i + 1) * roughSize);
    if (chunk.length) rounds.push(chunk);
  }

  if (extraItems.length) {
    const lastRound = rounds[rounds.length - 1] || [];
    rounds[rounds.length - 1] = [...lastRound, ...extraItems];
  }

  return rounds.slice(0, ROUNDS_PER_LEVEL);
}

function medalFor(percentage) {
  if (percentage >= 90) return { medal: "🏆", text: "Amazing! You're a true plant expert! 🌿" };
  if (percentage >= 70) return { medal: "🥇", text: "Great work! Your plant knowledge is growing! 🌱" };
  if (percentage >= 50) return { medal: "🥈", text: "Nice effort! Keep learning about plants and vegetables! 🥕" };
  return { medal: "🌱", text: "Every expert starts with a seed. Try again and grow your score!" };
}

function ProgressBar({ percent }) {
  return (
    <div className="h-2 bg-green-100 rounded-full overflow-hidden mb-6">
      <div
        className="h-full bg-green-500 transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function StatPill({ children }) {
  return (
    <div className="bg-green-50 px-3 py-2 rounded-xl font-bold text-sm">{children}</div>
  );
}

function MenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-green-50 hover:bg-green-100 rounded-xl px-3 py-2 font-bold text-sm text-green-950"
    >
      🏠 Menu
    </button>
  );
}

function AnswerGrid({ options, onSelect, disabled, correctAnswer, selected }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        let extra = "bg-white border-green-100 hover:border-green-400 hover:bg-green-50";
        if (disabled) {
          if (opt === correctAnswer) extra = "bg-green-200 border-green-500";
          else if (opt === selected) extra = "bg-red-200 border-red-500";
          else extra = "bg-white border-green-100 opacity-70";
        }
        return (
          <button
            key={opt}
            disabled={disabled}
            onClick={() => onSelect(opt)}
            className={`min-h-[65px] border-2 rounded-2xl font-extrabold text-base px-3 py-3 transition-transform ${extra} ${
              disabled ? "cursor-default" : "cursor-pointer hover:-translate-y-0.5"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function Feedback({ text, wrong }) {
  if (!text) return null;
  return (
    <div
      className={`mt-4 p-3.5 rounded-2xl font-extrabold text-center ${
        wrong ? "bg-red-50 text-red-900" : "bg-green-50 text-green-900"
      }`}
    >
      {text}
    </div>
  );
}

function NextButton({ onClick, label = "Next Question →" }) {
  return (
    <button
      onClick={onClick}
      className="w-full mt-3 py-4 rounded-2xl bg-green-950 text-white font-extrabold text-base hover:opacity-90"
    >
      {label}
    </button>
  );
}

export default function PlantVegetableQuiz() {
  const [screen, setScreen] = useState("menu");
  const [savedCheckpoint, setSavedCheckpoint] = useState(null);
  const [lastLevel, setLastLevel] = useState(null);
  const [finalScore, setFinalScore] = useState(0);
  const [finalPercent, setFinalPercent] = useState(0);
  const [roundBadge, setRoundBadge] = useState("");

  const [learnRounds, setLearnRounds] = useState([]);
  const [learnRoundIndex, setLearnRoundIndex] = useState(0);
  const [learnItemIndex, setLearnItemIndex] = useState(0);
  const [learnScore, setLearnScore] = useState(0);

  const [chooseRounds, setChooseRounds] = useState([]);
  const [chooseRoundIndex, setChooseRoundIndex] = useState(0);
  const [chooseIndex, setChooseIndex] = useState(0);
  const [chooseScore, setChooseScore] = useState(0);
  const [chooseStreak, setChooseStreak] = useState(0);
  const [chooseLives, setChooseLives] = useState(3);
  const [chooseOptions, setChooseOptions] = useState([]);
  const [chooseAnswered, setChooseAnswered] = useState(false);
  const [chooseSelected, setChooseSelected] = useState(null);
  const [chooseFeedback, setChooseFeedback] = useState("");
  const [chooseFeedbackWrong, setChooseFeedbackWrong] = useState(false);

  const [spellRounds, setSpellRounds] = useState([]);
  const [spellRoundIndex, setSpellRoundIndex] = useState(0);
  const [spellIndex, setSpellIndex] = useState(0);
  const [spellScore, setSpellScore] = useState(0);
  const [spellStreak, setSpellStreak] = useState(0);
  const [spellLives, setSpellLives] = useState(3);
  const [spellInput, setSpellInput] = useState("");
  const [spellAnswered, setSpellAnswered] = useState(false);
  const [spellCorrect, setSpellCorrect] = useState(false);
  const [spellFeedback, setSpellFeedback] = useState("");
  const [spellHintText, setSpellHintText] = useState("");
  const [spellHintsUsed, setSpellHintsUsed] = useState(0);

  const [triviaRounds, setTriviaRounds] = useState([]);
  const [triviaRoundIndex, setTriviaRoundIndex] = useState(0);
  const [triviaIndex, setTriviaIndex] = useState(0);
  const [triviaScore, setTriviaScore] = useState(0);
  const [triviaStreak, setTriviaStreak] = useState(0);
  const [triviaLives, setTriviaLives] = useState(3);
  const [triviaOptions, setTriviaOptions] = useState([]);
  const [triviaAnswered, setTriviaAnswered] = useState(false);
  const [triviaSelected, setTriviaSelected] = useState(null);
  const [triviaFeedback, setTriviaFeedback] = useState("");
  const [triviaFeedbackWrong, setTriviaFeedbackWrong] = useState(false);
  const [triviaShowEmoji, setTriviaShowEmoji] = useState(false);

  function persistCheckpoint(levelKey, roundIndex, score) {
    const checkpoint = { levelKey, roundIndex, score };
    sessionStorage.setItem(CHECKPOINT_KEY, JSON.stringify(checkpoint));
    setSavedCheckpoint(checkpoint);
  }

  function clearCheckpoint() {
    sessionStorage.removeItem(CHECKPOINT_KEY);
    setSavedCheckpoint(null);
  }

  function getCurrentLearnRound() {
    return learnRounds[learnRoundIndex] || [];
  }

  function getCurrentChooseRound() {
    return chooseRounds[chooseRoundIndex] || [];
  }

  function getCurrentSpellRound() {
    return spellRounds[spellRoundIndex] || [];
  }

  function getCurrentTriviaRound() {
    return triviaRounds[triviaRoundIndex] || [];
  }

  function buildChooseOptions(item) {
    if (item.type === "special") return shuffle(item.options);
    const wrongPool = vocab.filter((value) => value.name !== item.name);
    const wrongs = shuffle(wrongPool).slice(0, 3).map((value) => value.name);
    return shuffle([item.name, ...wrongs]);
  }

  function buildTriviaOptions(question) {
    const wrongPool = vocab.filter((value) => value.name !== question.answer);
    const wrongs = shuffle(wrongPool).slice(0, 3).map((value) => value.name);
    return shuffle([question.answer, ...wrongs]);
  }

  function completeRound(levelKey, nextRoundIndex, score, totalRounds, roundLabel) {
    setRoundBadge(roundLabel);
    setFinalScore(score);
    setFinalPercent(Math.round((score / totalRounds) * 100));

    if (nextRoundIndex >= ROUNDS_PER_LEVEL) {
      setLastLevel(levelKey);
      setScreen("result");
      clearCheckpoint();
      return;
    }

    persistCheckpoint(levelKey, nextRoundIndex, score);
    setLastLevel(levelKey);
    setScreen("roundComplete");
  }

  function resetSpellQuestion() {
    setSpellInput("");
    setSpellAnswered(false);
    setSpellCorrect(false);
    setSpellFeedback("");
    setSpellHintText("");
    setSpellHintsUsed(0);
  }

  function startLearn(resumeRoundIndex = 0) {
    const rounds = buildProgressiveRounds(vocab);
    setLearnRounds(rounds);
    setLearnRoundIndex(resumeRoundIndex);
    setLearnItemIndex(0);
    setLearnScore(0);
    setScreen("learn");
    setLastLevel("learn");
  }

  function startChoose(resumeRoundIndex = 0) {
    const rounds = buildProgressiveRounds(vocab, [growthStagesQuestion]);
    setChooseRounds(rounds);
    setChooseRoundIndex(resumeRoundIndex);
    setChooseIndex(0);
    setChooseScore(0);
    setChooseStreak(0);
    setChooseLives(3);
    setChooseAnswered(false);
    setChooseSelected(null);
    setChooseFeedback("");
    setChooseFeedbackWrong(false);
    setChooseOptions(buildChooseOptions(rounds[resumeRoundIndex][0]));
    setScreen("choose");
    setLastLevel("choose");
  }

  function startSpell(resumeRoundIndex = 0) {
    const rounds = buildProgressiveRounds(vocab);
    setSpellRounds(rounds);
    setSpellRoundIndex(resumeRoundIndex);
    setSpellIndex(0);
    setSpellScore(0);
    setSpellStreak(0);
    setSpellLives(3);
    resetSpellQuestion();
    setScreen("spell");
    setLastLevel("spell");
  }

  function startTrivia(resumeRoundIndex = 0) {
    const rounds = buildProgressiveRounds(triviaQuestions);
    setTriviaRounds(rounds);
    setTriviaRoundIndex(resumeRoundIndex);
    setTriviaIndex(0);
    setTriviaScore(0);
    setTriviaStreak(0);
    setTriviaLives(3);
    setTriviaAnswered(false);
    setTriviaSelected(null);
    setTriviaFeedback("");
    setTriviaFeedbackWrong(false);
    setTriviaShowEmoji(false);
    setTriviaOptions(buildTriviaOptions(rounds[resumeRoundIndex][0]));
    setScreen("trivia");
    setLastLevel("trivia");
  }

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.sessionStorage.getItem(CHECKPOINT_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      setSavedCheckpoint(parsed);
    } catch {
      window.sessionStorage.removeItem(CHECKPOINT_KEY);
    }
  }, []);

  function resumeCheckpoint() {
    if (!savedCheckpoint) return;
    if (savedCheckpoint.levelKey === "learn") startLearn(savedCheckpoint.roundIndex);
    if (savedCheckpoint.levelKey === "choose") startChoose(savedCheckpoint.roundIndex);
    if (savedCheckpoint.levelKey === "spell") startSpell(savedCheckpoint.roundIndex);
    if (savedCheckpoint.levelKey === "trivia") startTrivia(savedCheckpoint.roundIndex);
  }

  function selectChooseAnswer(selected) {
    if (chooseAnswered) return;
    const item = getCurrentChooseRound()[chooseIndex];
    if (!item) return;
    const correct = selected === item.name;
    const isSpecial = item.type === "special";

    setChooseAnswered(true);
    setChooseSelected(selected);

    if (correct) {
      const newStreak = chooseStreak + 1;
      setChooseStreak(newStreak);
      setChooseScore((score) => score + 10 + (newStreak > 1 ? 5 : 0));
      setChooseFeedbackWrong(false);
      if (isSpecial) {
        setChooseFeedback(newStreak >= 3 ? `🔥 Correct! You're on a ${newStreak} streak!` : "✅ Correct!");
      } else {
        setChooseFeedback(
          newStreak >= 3
            ? `🔥 It's ${articleFor(item.name)} ${item.name}! You're on a ${newStreak} streak!`
            : `✅ Correct! It's ${articleFor(item.name)} ${item.name}!`
        );
      }
    } else {
      setChooseLives((lives) => lives - 1);
      setChooseStreak(0);
      setChooseFeedbackWrong(true);
      setChooseFeedback(
        isSpecial
          ? `🌱 Not quite! The correct order is: ${item.name}`
          : `🌱 Not quite! It's ${articleFor(item.name)} ${item.name}.`
      );
    }
  }

  function nextChoose() {
    const currentRound = getCurrentChooseRound();
    if (!currentRound.length) return;

    if (chooseIndex < currentRound.length - 1) {
      const nextIndex = chooseIndex + 1;
      setChooseIndex(nextIndex);
      setChooseAnswered(false);
      setChooseSelected(null);
      setChooseFeedback("");
      setChooseFeedbackWrong(false);
      setChooseOptions(buildChooseOptions(currentRound[nextIndex]));
      return;
    }

    const nextRoundIndex = chooseRoundIndex + 1;
    const roundLabel = `Round ${chooseRoundIndex + 1} cleared!`;
    if (chooseLives <= 0) {
      completeRound("choose", nextRoundIndex, chooseScore, chooseScore + 10, roundLabel);
      return;
    }

    completeRound("choose", nextRoundIndex, chooseScore, chooseScore + 10, roundLabel);
  }

  function submitSpell() {
    if (spellAnswered) return;
    const item = getCurrentSpellRound()[spellIndex];
    if (!item) return;
    const guess = normalize(spellInput);
    const correct = guess.length > 0 && guess === normalize(item.name);

    setSpellAnswered(true);
    setSpellCorrect(correct);

    if (correct) {
      const newStreak = spellStreak + 1;
      const bonus = spellHintsUsed > 0 ? 0 : 5;
      setSpellStreak(newStreak);
      setSpellScore((score) => score + 10 + (newStreak > 1 ? 5 : 0) + bonus);
      setSpellFeedback(`✅ Correct! It's ${articleFor(item.name)} ${item.name}!`);
    } else {
      setSpellLives((lives) => lives - 1);
      setSpellStreak(0);
      setSpellFeedback(`🌱 Not quite! The correct spelling is "${item.name}".`);
    }
  }

  function useSpellHint() {
    if (spellAnswered) return;
    const item = getCurrentSpellRound()[spellIndex];
    if (!item) return;
    const nextHintsUsed = spellHintsUsed + 1;
    setSpellHintsUsed(nextHintsUsed);
    const revealed = item.name.slice(0, nextHintsUsed);
    setSpellHintText(`💡 Starts with: ${revealed}... (${item.name.length} letters)`);
  }

  function nextSpell() {
    const currentRound = getCurrentSpellRound();
    if (!currentRound.length) return;

    if (spellIndex < currentRound.length - 1) {
      setSpellIndex((value) => value + 1);
      resetSpellQuestion();
      return;
    }

    const nextRoundIndex = spellRoundIndex + 1;
    const roundLabel = `Round ${spellRoundIndex + 1} cleared!`;
    if (spellLives <= 0) {
      completeRound("spell", nextRoundIndex, spellScore, spellScore + 10, roundLabel);
      return;
    }
    completeRound("spell", nextRoundIndex, spellScore, spellScore + 10, roundLabel);
  }

  function selectTriviaAnswer(selected) {
    if (triviaAnswered) return;
    const question = getCurrentTriviaRound()[triviaIndex];
    if (!question) return;
    const correct = selected === question.answer;

    setTriviaAnswered(true);
    setTriviaSelected(selected);
    setTriviaShowEmoji(true);

    if (correct) {
      const newStreak = triviaStreak + 1;
      setTriviaStreak(newStreak);
      setTriviaScore((score) => score + 10 + (newStreak > 1 ? 5 : 0));
      setTriviaFeedbackWrong(false);
      setTriviaFeedback(
        newStreak >= 3
          ? `🔥 Correct! ${question.answer} is right — ${newStreak} streak!`
          : `✅ Correct! The answer is ${question.answer}.`
      );
    } else {
      setTriviaLives((lives) => lives - 1);
      setTriviaStreak(0);
      setTriviaFeedbackWrong(true);
      setTriviaFeedback(`🌱 Not quite! The correct answer is ${question.answer}.`);
    }
  }

  function nextTrivia() {
    const currentRound = getCurrentTriviaRound();
    if (!currentRound.length) return;

    if (triviaIndex < currentRound.length - 1) {
      const nextIndex = triviaIndex + 1;
      setTriviaIndex(nextIndex);
      setTriviaAnswered(false);
      setTriviaSelected(null);
      setTriviaFeedback("");
      setTriviaFeedbackWrong(false);
      setTriviaShowEmoji(false);
      setTriviaOptions(buildTriviaOptions(currentRound[nextIndex]));
      return;
    }

    const nextRoundIndex = triviaRoundIndex + 1;
    const roundLabel = `Round ${triviaRoundIndex + 1} cleared!`;
    if (triviaLives <= 0) {
      completeRound("trivia", nextRoundIndex, triviaScore, triviaScore + 10, roundLabel);
      return;
    }
    completeRound("trivia", nextRoundIndex, triviaScore, triviaScore + 10, roundLabel);
  }

  function playAgain() {
    if (lastLevel === "choose") startChoose();
    if (lastLevel === "spell") startSpell();
    if (lastLevel === "trivia") startTrivia();
    if (lastLevel === "learn") startLearn();
  }

  function nextLearn() {
    const currentRound = getCurrentLearnRound();
    if (!currentRound.length) return;

    if (learnItemIndex < currentRound.length - 1) {
      setLearnItemIndex((value) => value + 1);
      return;
    }

    const nextRoundIndex = learnRoundIndex + 1;
    const roundLabel = `Round ${learnRoundIndex + 1} cleared!`;
    completeRound("learn", nextRoundIndex, learnScore + 10, learnScore + 10, roundLabel);
  }

  const currentLearnItem = getCurrentLearnRound()[learnItemIndex];
  const currentChooseItem = getCurrentChooseRound()[chooseIndex];
  const currentSpellItem = getCurrentSpellRound()[spellIndex];
  const currentTriviaQuestion = getCurrentTriviaRound()[triviaIndex];

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-5 bg-gradient-to-br from-green-950 via-green-800 to-green-900">
      <div className="w-full max-w-3xl bg-green-50 text-green-950 rounded-[28px] p-6 shadow-2xl">
        {screen === "menu" && (
          <div className="text-center py-6">
            <div className="text-6xl mb-3">🌱🥕🌻🍅</div>
            <h1 className="text-3xl font-black mb-2">Plant & Vegetable Quiz</h1>
            <p className="text-green-700 max-w-md mx-auto mb-6">
              Every level is split into six short rounds so you can pause, celebrate, and keep your progress.
            </p>

            {savedCheckpoint && (
              <div className="mb-6 rounded-2xl border-2 border-green-200 bg-white p-4 text-left">
                <div className="text-xs font-black tracking-wider uppercase text-green-700 mb-1">Checkpoint saved</div>
                <div className="font-bold text-green-900">
                  Resume {savedCheckpoint.levelKey} from round {savedCheckpoint.roundIndex + 1}
                </div>
                <button
                  onClick={resumeCheckpoint}
                  className="mt-3 w-full rounded-2xl bg-green-950 px-4 py-3 text-sm font-extrabold text-white"
                >
                  Resume Progress
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <button onClick={() => startLearn(0)} className="text-left border-2 border-green-100 hover:border-green-400 hover:bg-green-100 bg-white rounded-2xl p-5 transition">
                <div className="text-4xl mb-2">📖</div>
                <div className="text-[11px] font-black tracking-wider uppercase text-green-700 mb-1">Level 1</div>
                <h3 className="text-lg font-bold mb-1">Learn the Words</h3>
                <p className="text-sm text-green-700">Start easy, then move into harder plants, fruits and flowers as the rounds grow.</p>
              </button>

              <button onClick={() => startChoose(0)} className="text-left border-2 border-green-100 hover:border-green-400 hover:bg-green-100 bg-white rounded-2xl p-5 transition">
                <div className="text-4xl mb-2">✅</div>
                <div className="text-[11px] font-black tracking-wider uppercase text-green-700 mb-1">Level 2</div>
                <h3 className="text-lg font-bold mb-1">Choose the Answer</h3>
                <p className="text-sm text-green-700">Early rounds use simple items and the later rounds get harder with longer plant names.</p>
              </button>

              <button onClick={() => startSpell(0)} className="text-left border-2 border-green-100 hover:border-green-400 hover:bg-green-100 bg-white rounded-2xl p-5 transition">
                <div className="text-4xl mb-2">✏️</div>
                <div className="text-[11px] font-black tracking-wider uppercase text-green-700 mb-1">Level 3</div>
                <h3 className="text-lg font-bold mb-1">Spell It</h3>
                <p className="text-sm text-green-700">Build confidence with easy words first before tackling multi-word plant names.</p>
              </button>

              <button onClick={() => startTrivia(0)} className="text-left border-2 border-green-100 hover:border-green-400 hover:bg-green-100 bg-white rounded-2xl p-5 transition">
                <div className="text-4xl mb-2">🧠</div>
                <div className="text-[11px] font-black tracking-wider uppercase text-green-700 mb-1">Level 4</div>
                <h3 className="text-lg font-bold mb-1">Plant and Veg Trivia</h3>
                <p className="text-sm text-green-700">Use six short rounds to grow from easy farm facts into trickier plant questions.</p>
              </button>
            </div>
          </div>
        )}

        {screen === "roundComplete" && (
          <div className="text-center py-8">
            <div className="text-7xl mb-2">🎉</div>
            <h2 className="text-3xl font-black mb-2">Congratulations!</h2>
            <p className="text-green-700 max-w-md mx-auto mb-6">{roundBadge || "You completed this round."}</p>
            <div className="rounded-2xl border-2 border-green-200 bg-white p-4 text-left mb-6">
              <div className="text-xs font-black tracking-wider uppercase text-green-700">Checkpoint</div>
              <div className="mt-1 font-bold text-green-900">Your progress is saved automatically.</div>
            </div>
            <button
              onClick={() => {
                if (lastLevel === "learn") startLearn(learnRoundIndex + 1);
                if (lastLevel === "choose") startChoose(chooseRoundIndex + 1);
                if (lastLevel === "spell") startSpell(spellRoundIndex + 1);
                if (lastLevel === "trivia") startTrivia(triviaRoundIndex + 1);
              }}
              className="w-full rounded-2xl bg-green-950 px-5 py-4 text-lg font-extrabold text-white"
            >
              Continue to Next Round →
            </button>
          </div>
        )}

        {screen === "learn" && currentLearnItem && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="text-xl font-black">📖 Learn the Words</div>
              <MenuButton onClick={() => setScreen("menu")} />
            </div>

            <ProgressBar percent={((learnRoundIndex + 1) / ROUNDS_PER_LEVEL) * 100} />
            <div className="text-center font-extrabold text-green-700 mb-2">Round {learnRoundIndex + 1} of {ROUNDS_PER_LEVEL}</div>

            <div className="text-center py-2 pb-6">
              <div className="text-8xl mb-2">{currentLearnItem.emoji}</div>
              <div className="text-3xl font-black text-green-700 mb-1">It&apos;s {articleFor(currentLearnItem.name)} {currentLearnItem.name}!</div>
              <div className="text-sm font-extrabold tracking-widest uppercase text-green-600">{currentLearnItem.category}</div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                disabled={learnItemIndex === 0}
                onClick={() => setLearnItemIndex((value) => Math.max(value - 1, 0))}
                className="flex-1 py-4 rounded-2xl font-extrabold bg-green-100 disabled:opacity-40"
              >
                ← Previous
              </button>
              <button onClick={nextLearn} className="flex-1 py-4 rounded-2xl font-extrabold bg-green-950 text-white">
                {learnItemIndex < getCurrentLearnRound().length - 1 ? "Next →" : "Finish Round →"}
              </button>
            </div>
          </div>
        )}

        {screen === "choose" && currentChooseItem && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div className="text-xl font-black">✅ Choose the Answer</div>
              <div className="flex gap-2 items-center flex-wrap">
                <StatPill>⭐ {chooseScore}</StatPill>
                <StatPill>🔥 {chooseStreak}</StatPill>
                <StatPill>❤️ {chooseLives}</StatPill>
                <MenuButton onClick={() => setScreen("menu")} />
              </div>
            </div>

            <ProgressBar percent={((chooseIndex + 1) / Math.max(getCurrentChooseRound().length, 1)) * 100} />
            <div className="text-center text-xs font-black tracking-widest uppercase text-green-700 mb-2">Round {chooseRoundIndex + 1} of {ROUNDS_PER_LEVEL}</div>

            {currentChooseItem.type !== "special" && (
              <div className="text-center text-8xl py-4 pb-6">{currentChooseItem.emoji}</div>
            )}

            <h2 className="text-center text-2xl sm:text-3xl font-black mb-3">
              {currentChooseItem.type === "special" ? currentChooseItem.questionText : "What&apos;s this?"}
            </h2>

            <AnswerGrid
              options={chooseOptions}
              onSelect={selectChooseAnswer}
              disabled={chooseAnswered}
              correctAnswer={currentChooseItem.name}
              selected={chooseSelected}
            />

            <Feedback text={chooseFeedback} wrong={chooseFeedbackWrong} />
            {chooseAnswered && <NextButton onClick={nextChoose} label={chooseIndex < getCurrentChooseRound().length - 1 ? "Next Question →" : "Finish Round →"} />}
          </div>
        )}

        {screen === "spell" && currentSpellItem && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div className="text-xl font-black">✏️ Spell It</div>
              <div className="flex gap-2 items-center flex-wrap">
                <StatPill>⭐ {spellScore}</StatPill>
                <StatPill>🔥 {spellStreak}</StatPill>
                <StatPill>❤️ {spellLives}</StatPill>
                <MenuButton onClick={() => setScreen("menu")} />
              </div>
            </div>

            <ProgressBar percent={((spellIndex + 1) / Math.max(getCurrentSpellRound().length, 1)) * 100} />
            <div className="text-center text-xs font-black tracking-widest uppercase text-green-700 mb-2">Round {spellRoundIndex + 1} of {ROUNDS_PER_LEVEL}</div>

            <div className="text-center text-8xl py-4 pb-6">{currentSpellItem.emoji}</div>
            <h2 className="text-center text-2xl sm:text-3xl font-black mb-3">What&apos;s this? Type the word!</h2>

            <input
              type="text"
              value={spellInput}
              disabled={spellAnswered}
              onChange={(event) => setSpellInput(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && submitSpell()}
              placeholder="Type here..."
              autoComplete="off"
              className={`w-full p-4 text-lg font-bold text-center rounded-2xl border-2 outline-none ${
                spellAnswered
                  ? spellCorrect
                    ? "bg-green-200 border-green-500"
                    : "bg-red-200 border-red-500"
                  : "border-green-100 focus:border-green-400"
              }`}
            />

            <div className="flex gap-3 mt-3">
              <button onClick={useSpellHint} disabled={spellAnswered} className="flex-1 py-3.5 rounded-2xl font-extrabold bg-yellow-100 text-yellow-900 disabled:opacity-50">💡 Hint</button>
              <button onClick={submitSpell} disabled={spellAnswered} className="flex-1 py-3.5 rounded-2xl font-extrabold bg-green-500 text-green-950 disabled:opacity-50">Submit</button>
            </div>

            <div className="text-center font-extrabold text-yellow-800 mt-2 min-h-[20px]">{spellHintText}</div>
            <Feedback text={spellFeedback} wrong={spellAnswered && !spellCorrect} />
            {spellAnswered && <NextButton onClick={nextSpell} label={spellIndex < getCurrentSpellRound().length - 1 ? "Next Question →" : "Finish Round →"} />}
          </div>
        )}

        {screen === "trivia" && currentTriviaQuestion && (
          <div>
            <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
              <div className="text-xl font-black">🧠 Plant and Veg Trivia</div>
              <div className="flex gap-2 items-center flex-wrap">
                <StatPill>⭐ {triviaScore}</StatPill>
                <StatPill>🔥 {triviaStreak}</StatPill>
                <StatPill>❤️ {triviaLives}</StatPill>
                <MenuButton onClick={() => setScreen("menu")} />
              </div>
            </div>

            <ProgressBar percent={((triviaIndex + 1) / Math.max(getCurrentTriviaRound().length, 1)) * 100} />
            <div className="text-center text-xs font-black tracking-wider uppercase text-green-700 mb-2">Round {triviaRoundIndex + 1} of {ROUNDS_PER_LEVEL}</div>

            <h2 className="text-center text-2xl sm:text-3xl font-black mb-3">{currentTriviaQuestion.question}</h2>
            {triviaShowEmoji && <div className="text-center text-8xl py-2 pb-4">{currentTriviaQuestion.emoji}</div>}

            <AnswerGrid
              options={triviaOptions}
              onSelect={selectTriviaAnswer}
              disabled={triviaAnswered}
              correctAnswer={currentTriviaQuestion.answer}
              selected={triviaSelected}
            />

            <Feedback text={triviaFeedback} wrong={triviaFeedbackWrong} />
            {triviaAnswered && <NextButton onClick={nextTrivia} label={triviaIndex < getCurrentTriviaRound().length - 1 ? "Next Question →" : "Finish Round →"} />}
          </div>
        )}

        {screen === "result" && (
          <div className="text-center py-8 px-2">
            <div className="text-7xl mb-2">{medalFor(finalPercent).medal}</div>
            <h1 className="text-3xl font-black mb-2">Level Complete!</h1>
            <div className="text-6xl font-black my-3">{finalScore}</div>
            <p className="text-green-700 max-w-md mx-auto mb-6">{medalFor(finalPercent).text}</p>

            <div className="flex gap-3">
              <button onClick={() => setScreen("menu")} className="flex-1 py-4 rounded-2xl font-extrabold bg-green-100">🏠 Main Menu</button>
              <button onClick={playAgain} className="flex-1 py-4 rounded-2xl font-extrabold bg-green-950 text-white">🔄 Play Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
