"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useGame } from "@/lib/gameState";
import { playBeep } from "@/lib/sound/beep";
import { allQuestions, TOTAL_LEVELS, QUESTIONS_PER_LEVEL, MAX_LIVES } from "./data";

const STORAGE_KEY = "quiz-trail-progress";

function loadSavedProgress() {
  if (typeof window === "undefined") return { unlockedLevels: 1, levelScores: {}, levelStars: {} };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { unlockedLevels: 1, levelScores: {}, levelStars: {} };
    const d = JSON.parse(raw);
    return {
      unlockedLevels: d.unlockedLevels || 1,
      levelScores: d.levelScores || {},
      levelStars: d.levelStars || {},
    };
  } catch {
    return { unlockedLevels: 1, levelScores: {}, levelStars: {} };
  }
}

function saveProgress(payload) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // storage unavailable — ignore, session still works
  }
}

function computeStars(pct) {
  return pct >= 80 ? 3 : pct >= 50 ? 2 : pct >= 25 ? 1 : 0;
}

function shuffleAnswers(question) {
  const indexed = question.answers.map((text, i) => ({ text, originalIndex: i }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  const correctIndex = indexed.findIndex((it) => it.originalIndex === question.correct);
  return { shuffled: indexed, correctIndex };
}

// ── Picture cards: no photo assets are bundled per-question, so instead we ──
// ── infer a topic from the question/answer text and render a large, richly
// ── themed emoji "hero" tile with a matching gradient. Guarantees every
// ── question gets a relevant, fast, always-available visual (no broken
// ── image links, no network dependency).
const VISUAL_CATEGORIES = [
  { key: "animals", emoji: "🦁", gradient: ["#f5c842", "#a86d0a"], match: ["animal","lion","tiger","elephant","zebra","panda","giraffe","spider","bee","penguin","ostrich","dog","cat","cow","horse","bird","eagle","hawk","sparrow","snake","python","anaconda","cobra","platypus","dragon","mammal","reptile","amphibian","bat","whale","shark","fish","bear","wolf","fox","rabbit","camel","rhino","hippo","cheetah","gazelle","falcon","owl","komodo" ] },
  { key: "space", emoji: "🪐", gradient: ["#4d9aff", "#1a1f6b"], match: ["planet","moon","mars","venus","jupiter","saturn","mercury","neptune","uranus","solar system","galaxy","astronaut","satellite","space","star","sun","gravity","universe","milky way","titan","europa","ganymede","callisto"] },
  { key: "geography", emoji: "🌍", gradient: ["#3de8a0", "#0a5a4a"], match: ["country","capital","continent","city","nation","population","island","border","kingdom","republic","language spoken","flag"] },
  { key: "water", emoji: "🌊", gradient: ["#4db8d4", "#0a4a6b"], match: ["ocean","river","sea","lake","water","coastline","trench","tsunami","wave","amazon","nile","mississippi","atlantic","pacific","indian ocean","arctic","caspian","dead sea"] },
  { key: "science", emoji: "🧪", gradient: ["#2dd4bf", "#0f5f5a"], match: ["element","chemical","gas","atom","molecule","periodic table","oxygen","nitrogen","hydrogen","carbon","acid","ph of","reaction","boiling point","noble gas","symbol"] },
  { key: "physics", emoji: "⚡", gradient: ["#b87dff", "#4a1f8a"], match: ["gravity","speed of light","speed of sound","energy","force","newton","electric","voltage","ampere","pressure","physics","relativity","motion","magnet"] },
  { key: "history", emoji: "🏛️", gradient: ["#e8a45a", "#7a3a10"], match: ["war","ancient","empire","treaty","century","emperor","civilization","pyramid","revolution","independence","kingdom of","dynasty","explorer","expedition","colonial"] },
  { key: "art", emoji: "🎨", gradient: ["#ff85b0", "#7a1050"], match: ["paint","painted","artist","sculpture","composed","symphony","sonata","novel","wrote","author","poem","canterbury","shakespeare","orwell"] },
  { key: "sports", emoji: "🏆", gradient: ["#ffb020", "#8a3a10"], match: ["sport","tennis","football","soccer","basketball","cricket","rugby","olympic","fifa","world cup","racket","slam dunk","wimbledon"] },
  { key: "math", emoji: "🔢", gradient: ["#6d9bff", "#2a1f8a"], match: [" + "," is 5","number","prime","how many days","how many hours","how many legs","how many"] },
  { key: "body", emoji: "🫀", gradient: ["#ff6b7f", "#7a1020"], match: ["human body","organ","bone","heart","blood","artery","skin","brain","vitamin","cell","liver","lungs","thyroid"] },
  { key: "weather", emoji: "⛅", gradient: ["#dff6ff", "#2a6b8a"], match: ["season","weather","sky","cloud","rain","snow","ice","frozen","climate","autumn","winter","summer","spring"] },
  { key: "food", emoji: "🍎", gradient: ["#ff9966", "#8a2a10"], match: ["fruit","food","honey","banana","apple","pizza","cheese","olive oil","eat"] },
  { key: "tech", emoji: "💻", gradient: ["#7c93ff", "#1a1a4a"], match: ["www","website","internet","computer","technology"] },
];
const FALLBACK_VISUALS = [
  { key: "brain", emoji: "🧠", gradient: ["#d4a853", "#7a4a10"] },
  { key: "puzzle", emoji: "🧩", gradient: ["#8a6dff", "#2a1a6b"] },
  { key: "bulb", emoji: "💡", gradient: ["#ffe066", "#8a5a10"] },
];
function getVisual(question) {
  if (!question) return FALLBACK_VISUALS[0];
  const text = (question.question + " " + question.answers.join(" ")).toLowerCase();
  for (const cat of VISUAL_CATEGORIES) {
    if (cat.match.some((k) => text.includes(k))) return cat;
  }
  return FALLBACK_VISUALS[question.level % FALLBACK_VISUALS.length];
}

const QUIZ_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
  .qt-root * { box-sizing: border-box; }
  .qt-root { font-family: 'DM Sans', sans-serif; }
  .qt-brand { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
  .qt-mono { font-family: 'DM Mono', monospace; }

  .qt-glass {
    background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015)),
                linear-gradient(160deg, rgba(17,24,39,0.94), rgba(8,11,18,0.98));
    border: 1px solid rgba(255,255,255,0.1);
    backdrop-filter: blur(24px);
    box-shadow: 0 24px 70px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.07);
  }

  .qt-hero-icon {
    display: flex; align-items: center; justify-content: center;
    font-size: clamp(2.4rem, 6vw, 3.6rem);
    filter: drop-shadow(0 0 20px rgba(212,168,83,0.4));
    animation: qtFloat 3s ease-in-out infinite;
  }

  .qt-level-card {
    display: flex; align-items: center; gap: 14px; padding: 12px 16px 12px 12px;
    border-radius: 18px; border: 2px solid transparent; cursor: pointer;
    background: rgba(255,255,255,0.035); text-align: left; color: #e8edf5;
    transition: transform 0.15s, border-color 0.15s, background 0.15s;
    width: 100%;
  }
  .qt-level-card:hover:not(:disabled) { transform: translateY(-1px); border-color: rgba(212,168,83,0.5); background: rgba(255,255,255,0.06); }
  .qt-level-card:disabled { cursor: not-allowed; opacity: 0.4; filter: grayscale(0.7); }
  .qt-level-card.done { border-color: rgba(61,232,160,0.45); }
  .qt-level-thumb {
    width: 52px; height: 52px; border-radius: 14px; flex-shrink: 0; position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
    box-shadow: inset 0 3px 8px rgba(255,255,255,0.25), inset 0 -6px 12px rgba(0,0,0,0.35);
  }
  .qt-level-thumb .qt-lock { position: absolute; inset: 0; background: rgba(4,6,12,0.55); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; backdrop-filter: blur(2px); }
  .qt-level-info { flex: 1; min-width: 0; }
  .qt-level-label { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 1.5px; color: #8b98b0; margin-bottom: 2px; }
  .qt-level-stars { display: flex; gap: 2px; font-size: 0.85rem; }
  .qt-level-score { font-family: 'DM Mono', monospace; font-size: 0.75rem; color: #d4a853; font-weight: 700; white-space: nowrap; }

  .qt-btn { border: none; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s, filter 0.15s; font-family: 'DM Sans', sans-serif; }
  .qt-btn:active { transform: scale(0.97); }
  .qt-btn-primary {
    padding: 13px 30px; border-radius: 100px; font-weight: 800; font-family: 'Bebas Neue', sans-serif;
    letter-spacing: 1.5px; font-size: 1.15rem;
    background: linear-gradient(135deg, #d4a853, #f0c46a 55%, #a86d0a);
    color: #1a1206; box-shadow: 0 10px 28px rgba(212,168,83,0.32);
  }
  .qt-btn-primary:hover { box-shadow: 0 14px 36px rgba(212,168,83,0.48); filter: brightness(1.06); }
  .qt-btn-ghost {
    padding: 11px 22px; border-radius: 100px; font-weight: 700; font-size: 0.85rem;
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.18); color: #b8c2d6;
  }
  .qt-btn-ghost:hover { border-color: #d4a853; color: #f0c46a; }
  .qt-btn-danger { border-color: rgba(232,68,90,0.5); color: #ff8a95; }
  .qt-btn-danger:hover { border-color: #e8445a; color: #ff8a95; background: rgba(232,68,90,0.1); }

  .qt-hud-pill {
    display: inline-flex; align-items: center; gap: 6px; padding: 5px 14px; border-radius: 100px;
    background: linear-gradient(135deg, #d4a853, #a86d0a); color: #1a1206; font-weight: 800; font-size: 0.8rem;
    font-family: 'Bebas Neue', sans-serif; letter-spacing: 1px;
  }
  .qt-lives { display: flex; gap: 4px; font-size: 1.15rem; }
  .qt-life { transition: opacity 0.2s, filter 0.2s; }
  .qt-life.spent { opacity: 0.22; filter: grayscale(1); }

  .qt-bar-track { width: 100%; background: rgba(255,255,255,0.06); border-radius: 10px; overflow: hidden; }
  .qt-bar-fill { height: 100%; border-radius: 10px; transition: width 0.15s linear; }

  .qt-picture-card {
    position: relative; border-radius: 24px; overflow: hidden; height: clamp(140px, 22vh, 210px);
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 20px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.15);
  }
  .qt-picture-card::before {
    content: ''; position: absolute; inset: 0;
    background: radial-gradient(circle at 30% 25%, rgba(255,255,255,0.28), transparent 55%);
  }
  .qt-picture-card::after {
    content: ''; position: absolute; inset: 0; opacity: 0.5;
    background-image: radial-gradient(rgba(255,255,255,0.14) 1.5px, transparent 1.5px);
    background-size: 22px 22px;
  }
  .qt-picture-emoji {
    position: relative; z-index: 1; font-size: clamp(3.6rem, 10vw, 6rem);
    filter: drop-shadow(0 8px 18px rgba(0,0,0,0.35));
    animation: qtPop 0.4s cubic-bezier(0.25,1.4,0.5,1);
  }

  .qt-question-card {
    border-radius: 18px; padding: clamp(16px, 2.6vw, 22px); text-align: center;
    font-weight: 700; font-size: clamp(1rem, 2vw, 1.2rem); line-height: 1.4;
  }

  .qt-answer-btn {
    padding: 15px 16px; border-radius: 16px; font-size: 0.95rem; font-weight: 700; text-align: left;
    color: #e8edf5; transition: transform 0.12s, background 0.15s, border-color 0.15s;
    display: flex; align-items: center; gap: 10px;
  }
  .qt-answer-btn:not(:disabled):hover { transform: translateY(-1px); border-color: rgba(212,168,83,0.6) !important; }
  .qt-answer-key {
    width: 26px; height: 26px; border-radius: 8px; background: rgba(255,255,255,0.08); flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 800; color: #8b98b0;
  }

  .qt-toast {
    position: fixed; top: 18px; left: 50%; transform: translateX(-50%); z-index: 60;
    padding: 12px 26px; border-radius: 100px; font-weight: 800; max-width: 90vw; text-align: center;
    box-shadow: 0 12px 30px rgba(0,0,0,0.4); animation: qtToastIn 0.25s cubic-bezier(0.25,1.4,0.5,1);
  }

  .qt-celeb-icon { font-size: clamp(3.4rem, 8vw, 4.6rem); animation: qtFloat 2.4s ease-in-out infinite; }
  .qt-celeb-score {
    font-family: 'Bebas Neue', sans-serif; font-size: clamp(2.4rem, 6vw, 3.2rem); letter-spacing: 2px;
    background: linear-gradient(135deg, #d4a853, #f0c46a); -webkit-background-clip: text; background-clip: text; color: transparent;
  }
  .qt-stat-pill {
    background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); padding: 10px 16px; border-radius: 14px; min-width: 90px;
  }

  @keyframes qtFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes qtPop { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.08); } 100% { transform: scale(1); opacity: 1; } }
  @keyframes qtToastIn { from { transform: translateX(-50%) translateY(-16px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }
  @keyframes qtScreenEnter { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
`;

export default function QuizTrail({ onComplete }) {
  const { completeGame, state: hubState } = useGame();
  const playerName = hubState?.name || "Player";

  const [screen, setScreen] = useState("menu"); // menu | game | result
  const [progress, setProgress] = useState(() => loadSavedProgress());

  const [currentLevel, setCurrentLevel] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [levelQuestions, setLevelQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [correctIndex, setCorrectIndex] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [locked, setLocked] = useState(false);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const [timerSeconds, setTimerSeconds] = useState(15);
  const [timerRemaining, setTimerRemaining] = useState(15);
  const timerRef = useRef(null);
  const lockedRef = useRef(false);
  lockedRef.current = locked;

  const [toast, setToast] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [resultData, setResultData] = useState(null);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  function clearTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function showToast(message, type) {
    setToast({ message, type });
    setTimeout(() => setToast((t) => (t?.message === message ? null : t)), 1600);
  }

  const startTimer = useCallback((seconds, onExpire) => {
    clearTimer();
    setTimerRemaining(seconds);
    let remaining = seconds;
    timerRef.current = setInterval(() => {
      remaining -= 0.1;
      if (remaining <= 0) {
        remaining = 0;
        setTimerRemaining(0);
        clearTimer();
        if (!lockedRef.current) onExpire();
        return;
      }
      setTimerRemaining(remaining);
    }, 100);
  }, []);

  function loadQuestion(idx, questions) {
    if (idx >= questions.length) return; // caller handles completion
    const q = questions[idx];
    const { shuffled, correctIndex: ci } = shuffleAnswers(q);
    setAnswers(shuffled);
    setCorrectIndex(ci);
    setSelectedIndex(-1);
    setLocked(false);
    startTimer(timerSecondsFor(currentLevel), () => handleTimeout(q, idx, questions));
  }

  function timerSecondsFor(lv) {
    return lv <= 3 ? 15 : lv <= 6 ? 20 : lv <= 8 ? 25 : 30;
  }

  function startLevel(lv) {
    const questions = allQuestions.filter((q) => q.level === lv);
    const secs = timerSecondsFor(lv);
    setCurrentLevel(lv);
    setQuestionIndex(0);
    setLevelQuestions(questions);
    setScore(0);
    setLives(MAX_LIVES);
    setCorrectCount(0);
    setWrongCount(0);
    setTimerSeconds(secs);
    setScreen("game");
    setLocked(false);

    const q = questions[0];
    const { shuffled, correctIndex: ci } = shuffleAnswers(q);
    setAnswers(shuffled);
    setCorrectIndex(ci);
    setSelectedIndex(-1);
    startTimer(secs, () => handleTimeout(q, 0, questions));
  }

  function advance(nextIdx, questions, finalScore, finalCorrect, finalWrong, finalLives) {
    if (nextIdx >= questions.length) {
      finishLevel(false, finalScore, finalCorrect, finalWrong, finalLives, questions.length);
      return;
    }
    setQuestionIndex(nextIdx);
    const q = questions[nextIdx];
    const { shuffled, correctIndex: ci } = shuffleAnswers(q);
    setAnswers(shuffled);
    setCorrectIndex(ci);
    setSelectedIndex(-1);
    setLocked(false);
    startTimer(timerSeconds, () => handleTimeout(q, nextIdx, questions));
  }

  function handleTimeout(q, idx, questions) {
    if (lockedRef.current) return;
    setLocked(true);
    playBeep(160, 0.35);
    showToast("⏰ Time's up! Answer: " + q.answers[q.correct], "wrong");
    const newWrong = wrongCount + 1;
    const newLives = lives - 1;
    setWrongCount(newWrong);
    setLives(newLives);
    if (newLives <= 0) {
      setTimeout(() => finishLevel(true, score, correctCount, newWrong, 0, questions.length), 1400);
    } else {
      setTimeout(() => advance(idx + 1, questions, score, correctCount, newWrong, newLives), 1400);
    }
  }

  function checkAnswer(selIdx) {
    if (lockedRef.current) return;
    setLocked(true);
    clearTimer();
    setSelectedIndex(selIdx);
    const q = levelQuestions[questionIndex];
    const isCorrect = selIdx === correctIndex;

    if (isCorrect) {
      playBeep(520, 0.15);
      const bonus = Math.floor(timerRemaining * 3);
      const gained = 100 + bonus;
      const newScore = score + gained;
      const newCorrect = correctCount + 1;
      setScore(newScore);
      setCorrectCount(newCorrect);
      showToast("✅ Correct! +" + gained + " pts", "correct");
      setTimeout(() => advance(questionIndex + 1, levelQuestions, newScore, newCorrect, wrongCount, lives), 1300);
    } else {
      playBeep(160, 0.35);
      const newWrong = wrongCount + 1;
      const newLives = lives - 1;
      setWrongCount(newWrong);
      setLives(newLives);
      showToast("❌ Wrong! Answer: " + q.answers[q.correct], "wrong");
      if (newLives <= 0) {
        setTimeout(() => finishLevel(true, score, correctCount, newWrong, 0, levelQuestions.length), 1400);
      } else {
        setTimeout(() => advance(questionIndex + 1, levelQuestions, score, correctCount, newWrong, newLives), 1400);
      }
    }
  }

  function finishLevel(isGameOver, finalScore, finalCorrect, finalWrong, finalLives, totalQ) {
    clearTimer();
    const pct = totalQ ? Math.round((finalCorrect / totalQ) * 100) : 0;
    const stars = computeStars(pct);

    setProgress((prev) => {
      const prevScore = prev.levelScores[currentLevel] || 0;
      const next = {
        unlockedLevels: prev.unlockedLevels,
        levelScores: { ...prev.levelScores },
        levelStars: { ...prev.levelStars },
      };
      if (finalScore > prevScore) {
        next.levelScores[currentLevel] = finalScore;
        next.levelStars[currentLevel] = Math.max(prev.levelStars[currentLevel] || 0, stars);
      }
      if (stars >= 1 && currentLevel >= next.unlockedLevels && currentLevel < TOTAL_LEVELS) {
        next.unlockedLevels = currentLevel + 1;
      }
      saveProgress(next);
      return next;
    });

    completeGame?.("quiz-trail", pct, totalQ);
    onComplete?.(finalScore, pct);

    setResultData({
      isGameOver,
      score: finalScore,
      correct: finalCorrect,
      wrong: finalWrong,
      lives: finalLives,
      stars,
    });
    setScreen("result");
  }

  async function handleResetProgress() {
    setConfirmReset(false);
    saveProgress({ unlockedLevels: 1, levelScores: {}, levelStars: {} });
    setProgress({ unlockedLevels: 1, levelScores: {}, levelStars: {} });
  }

  function quitLevel() {
    clearTimer();
    setScreen("menu");
  }

  // ─── Styling helpers ───────────────────────────────────────
  const wrap = {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100%",
    width: "100%",
    padding: "clamp(16px, 3vw, 32px)",
    color: "#e8edf5",
    boxSizing: "border-box",
    gap: 18,
    background: "radial-gradient(circle at 50% 0%, #161d30 0%, #05070d 70%), #05070d",
    overflow: "hidden",
  };

  const card = {
    width: "100%",
    maxWidth: 640,
    borderRadius: 24,
    padding: "clamp(18px, 3vw, 30px)",
    position: "relative",
    zIndex: 1,
  };

  // ─── Menu screen ───────────────────────────────────────────
  if (screen === "menu") {
    return (
      <div className="qt-root" style={wrap}>
        <style>{QUIZ_STYLES}</style>
        {toast && <Toast toast={toast} />}
        <div style={{ textAlign: "center", position: "relative", zIndex: 1, animation: "qtScreenEnter 0.5s ease-out" }}>
          <div className="qt-hero-icon">🧠</div>
          <h1 className="qt-brand" style={{ fontSize: "clamp(2.2rem, 6vw, 3rem)", margin: "4px 0 2px", background: "linear-gradient(135deg, #d4a853, #f0c46a 50%, #a86d0a)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Quiz Trail
          </h1>
          <p style={{ color: "#8b98b0", margin: 0, fontSize: "0.9rem" }}>
            {playerName} · {TOTAL_LEVELS} levels · {QUESTIONS_PER_LEVEL} questions each
          </p>
        </div>

        <div className="qt-glass" style={{ ...card, display: "flex", flexDirection: "column", gap: 8, animation: "qtScreenEnter 0.6s ease-out", maxHeight: "56vh", overflowY: "auto" }}>
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((lv) => {
            const unlocked = lv <= progress.unlockedLevels;
            const done = progress.levelScores.hasOwnProperty(lv);
            const stars = progress.levelStars[lv] || 0;
            const thumbQ = allQuestions.find((qq) => qq.level === lv);
            const visual = getVisual(thumbQ);
            return (
              <button
                key={lv}
                className={`qt-level-card${done ? " done" : ""}`}
                onClick={() => unlocked && startLevel(lv)}
                disabled={!unlocked}
              >
                <div className="qt-level-thumb" style={{ background: `radial-gradient(circle at 35% 30%, ${visual.gradient[0]}, ${visual.gradient[1]})` }}>
                  {unlocked ? visual.emoji : null}
                  {!unlocked && <div className="qt-lock">🔒</div>}
                </div>
                <div className="qt-level-info">
                  <div className="qt-level-label">Level {lv}</div>
                  <div className="qt-level-stars">
                    {[1, 2, 3].map((s) => (
                      <span key={s} style={{ color: s <= stars ? "#d4a853" : "rgba(255,255,255,0.18)" }}>★</span>
                    ))}
                  </div>
                </div>
                {done && <div className="qt-level-score">{progress.levelScores[lv]} pts</div>}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10, position: "relative", zIndex: 1 }}>
          <button className="qt-btn qt-btn-ghost qt-btn-danger" onClick={() => setConfirmReset(true)}>
            🔄 Reset Progress
          </button>
        </div>

        {confirmReset && (
          <ConfirmModal
            message="Reset all Quiz Trail progress? This cannot be undone."
            onCancel={() => setConfirmReset(false)}
            onConfirm={handleResetProgress}
          />
        )}
      </div>
    );
  }

  // ─── Result screen ─────────────────────────────────────────
  if (screen === "result" && resultData) {
    const canGoNext = !resultData.isGameOver && currentLevel < TOTAL_LEVELS;
    return (
      <div className="qt-root" style={wrap}>
        <style>{QUIZ_STYLES}</style>
        <div className="qt-glass" style={{ ...card, textAlign: "center", display: "flex", flexDirection: "column", gap: 14, alignItems: "center", animation: "qtScreenEnter 0.5s ease-out" }}>
          <div className="qt-celeb-icon">{resultData.isGameOver ? "😢" : "🎉"}</div>
          <h2 className="qt-brand" style={{ fontSize: "1.8rem", letterSpacing: 1.5, margin: 0, color: "#e8edf5" }}>
            {resultData.isGameOver ? "Game Over" : "Level Complete!"}
          </h2>
          <div className="qt-celeb-score">{resultData.score}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <StatPill label="✅ Correct" value={resultData.correct} />
            <StatPill label="❌ Wrong" value={resultData.wrong} />
            <StatPill label="⭐ Stars" value={"⭐".repeat(resultData.stars) + "☆".repeat(3 - resultData.stars)} />
            <StatPill label="❤️ Lives Left" value={resultData.lives} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginTop: 4 }}>
            {canGoNext && (
              <button className="qt-btn qt-btn-primary" onClick={() => startLevel(currentLevel + 1)}>
                ▶ Next Level
              </button>
            )}
            <button className="qt-btn qt-btn-ghost" onClick={() => startLevel(currentLevel)}>
              🔄 Retry
            </button>
            <button className="qt-btn qt-btn-ghost" onClick={() => setScreen("menu")}>
              📋 Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Game screen ───────────────────────────────────────────
  const q = levelQuestions[questionIndex];
  const visual = getVisual(q);
  const timerPct = Math.max(0, (timerRemaining / timerSeconds) * 100);
  const timerColor = timerPct <= 25 ? "#e8445a" : timerPct <= 50 ? "#d4a853" : "#2dd4bf";
  const progressPct = levelQuestions.length ? (questionIndex / levelQuestions.length) * 100 : 0;
  const answerKeys = ["A", "B", "C", "D"];

  return (
    <div className="qt-root" style={wrap}>
      <style>{QUIZ_STYLES}</style>
      {toast && <Toast toast={toast} />}
      <div className="qt-glass" style={{ ...card, display: "flex", flexDirection: "column", gap: 14, animation: "qtScreenEnter 0.4s ease-out" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span className="qt-hud-pill">Level {currentLevel}</span>
          <div className="qt-lives">
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <span key={i} className={`qt-life${i >= lives ? " spent" : ""}`}>❤️</span>
            ))}
          </div>
          <span className="qt-mono" style={{ color: "#8b98b0", fontSize: "0.85rem" }}>
            {questionIndex + 1}/{levelQuestions.length}
          </span>
          <button onClick={quitLevel} className="qt-btn qt-btn-ghost qt-btn-danger" style={{ padding: "5px 14px", fontSize: "0.75rem" }}>
            ✕ Quit
          </button>
        </div>

        <div className="qt-bar-track" style={{ height: 6 }}>
          <Bar pct={progressPct} color="#d4a853" />
        </div>
        <div className="qt-bar-track" style={{ height: 5 }}>
          <Bar pct={timerPct} color={timerColor} />
        </div>

        {q && (
          <>
            <div key={questionIndex} className="qt-picture-card" style={{ background: `linear-gradient(150deg, ${visual.gradient[0]}, ${visual.gradient[1]})` }}>
              <span className="qt-picture-emoji">{visual.emoji}</span>
            </div>

            <div className="qt-glass qt-question-card" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
              {q.question}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {answers.map((item, i) => {
                let bg = "rgba(255,255,255,0.04)";
                let border = "2px solid rgba(255,255,255,0.09)";
                if (locked) {
                  if (i === correctIndex) {
                    bg = "rgba(61,232,160,0.16)";
                    border = "2px solid #3de8a0";
                  } else if (i === selectedIndex) {
                    bg = "rgba(232,68,90,0.18)";
                    border = "2px solid #e8445a";
                  }
                }
                return (
                  <button
                    key={i}
                    disabled={locked}
                    onClick={() => checkAnswer(i)}
                    className="qt-answer-btn"
                    style={{ border, background: bg, cursor: locked ? "default" : "pointer" }}
                  >
                    <span className="qt-answer-key">{answerKeys[i]}</span>
                    {item.text}
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: "center", fontWeight: 700 }}>
              Score: <span style={{ color: "#d4a853" }}>{score}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Bar({ pct, color }) {
  return <div className="qt-bar-fill" style={{ width: `${pct}%`, background: color }} />;
}

function StatPill({ label, value }) {
  return (
    <div className="qt-stat-pill">
      <div style={{ fontSize: "0.7rem", color: "#8b98b0" }}>{label}</div>
      <div style={{ fontWeight: 800, color: "#e8edf5" }}>{value}</div>
    </div>
  );
}

function Toast({ toast }) {
  return (
    <div
      className="qt-toast"
      style={{
        background: toast.type === "correct" ? "#3de8a0" : toast.type === "wrong" ? "#e8445a" : "#333",
        color: toast.type === "correct" ? "#0a3a28" : "#fff",
      }}
    >
      {toast.message}
    </div>
  );
}

function ConfirmModal({ message, onCancel, onConfirm }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 20,
      }}
    >
      <div className="qt-glass" style={{ borderRadius: 20, padding: 24, maxWidth: 340, width: "100%", textAlign: "center", display: "flex", flexDirection: "column", gap: 16, color: "#e8edf5" }}>
        <p style={{ margin: 0 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onCancel} className="qt-btn qt-btn-ghost">
            Cancel
          </button>
          <button onClick={onConfirm} className="qt-btn qt-btn-ghost qt-btn-danger" style={{ fontWeight: 700 }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
