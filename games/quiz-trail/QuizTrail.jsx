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
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minHeight: "100%",
    width: "100%",
    padding: "clamp(16px, 3vw, 32px)",
    color: "var(--text)",
    fontFamily: "var(--font-body, 'DM Sans', sans-serif)",
    boxSizing: "border-box",
    gap: 18,
  };

  const card = {
    width: "100%",
    maxWidth: 640,
    background: "var(--surface-strong, rgba(255,255,255,0.08))",
    border: "1px solid var(--border, rgba(255,255,255,0.1))",
    borderRadius: 22,
    padding: "clamp(18px, 3vw, 30px)",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
  };

  const btnPrimary = {
    padding: "12px 26px",
    borderRadius: 999,
    border: "none",
    fontWeight: 800,
    fontFamily: "var(--font-display, 'Syne', sans-serif)",
    fontSize: "1rem",
    cursor: "pointer",
    background: "var(--gold)",
    color: "#1a1a1a",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  };

  const btnSecondary = {
    padding: "10px 20px",
    borderRadius: 999,
    border: "1px solid var(--border-bright, rgba(255,255,255,0.22))",
    fontWeight: 700,
    fontSize: "0.9rem",
    cursor: "pointer",
    background: "transparent",
    color: "var(--text)",
  };

  // ─── Menu screen ───────────────────────────────────────────
  if (screen === "menu") {
    return (
      <div style={wrap}>
        {toast && <Toast toast={toast} />}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40 }}>🧠</div>
          <h1 style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", fontSize: "1.7rem", margin: "6px 0 2px" }}>
            Quiz Trail
          </h1>
          <p style={{ color: "var(--muted)", margin: 0 }}>
            {playerName} · {TOTAL_LEVELS} levels · {QUESTIONS_PER_LEVEL} questions each
          </p>
        </div>

        <div style={{ ...card, display: "flex", flexDirection: "column", gap: 10 }}>
          {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((lv) => {
            const unlocked = lv <= progress.unlockedLevels;
            const done = progress.levelScores.hasOwnProperty(lv);
            const stars = progress.levelStars[lv] || 0;
            return (
              <button
                key={lv}
                onClick={() => unlocked && startLevel(lv)}
                disabled={!unlocked}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 16px",
                  borderRadius: 16,
                  border: `2px solid ${done ? "var(--green)" : "transparent"}`,
                  background: "var(--surface, rgba(255,255,255,0.05))",
                  cursor: unlocked ? "pointer" : "not-allowed",
                  opacity: unlocked ? 1 : 0.45,
                  filter: unlocked ? "none" : "grayscale(0.6)",
                  textAlign: "left",
                  color: "var(--text)",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    flexShrink: 0,
                    background: "var(--bg)",
                    border: "2px solid var(--border-bright, rgba(255,255,255,0.22))",
                    color: "var(--gold)",
                  }}
                >
                  {unlocked ? lv : "🔒"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.5, color: "var(--muted)" }}>
                    Level {lv}
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[1, 2, 3].map((s) => (
                      <span key={s} style={{ color: s <= stars ? "var(--gold)" : "var(--border-bright, rgba(255,255,255,0.22))" }}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                {done && <div style={{ fontSize: "0.8rem", color: "var(--gold)", fontWeight: 700 }}>{progress.levelScores[lv]} pts</div>}
              </button>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button style={btnSecondary} onClick={() => setConfirmReset(true)}>
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
      <div style={wrap}>
        <div style={{ ...card, textAlign: "center", display: "flex", flexDirection: "column", gap: 14, alignItems: "center" }}>
          <div style={{ fontSize: 56 }}>{resultData.isGameOver ? "😢" : "🎉"}</div>
          <h2 style={{ fontFamily: "var(--font-display, 'Syne', sans-serif)", margin: 0 }}>
            {resultData.isGameOver ? "Game Over!" : "Level Complete!"}
          </h2>
          <div style={{ fontSize: "2.4rem", fontWeight: 800, color: "var(--gold)" }}>{resultData.score}</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <StatPill label="✅ Correct" value={resultData.correct} />
            <StatPill label="❌ Wrong" value={resultData.wrong} />
            <StatPill label="⭐ Stars" value={"⭐".repeat(resultData.stars) + "☆".repeat(3 - resultData.stars)} />
            <StatPill label="❤️ Lives Left" value={resultData.lives} />
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {canGoNext && (
              <button style={btnPrimary} onClick={() => startLevel(currentLevel + 1)}>
                ▶ Next Level
              </button>
            )}
            <button style={btnSecondary} onClick={() => startLevel(currentLevel)}>
              🔄 Retry
            </button>
            <button style={btnSecondary} onClick={() => setScreen("menu")}>
              📋 Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Game screen ───────────────────────────────────────────
  const q = levelQuestions[questionIndex];
  const timerPct = Math.max(0, (timerRemaining / timerSeconds) * 100);
  const timerColor = timerPct <= 25 ? "var(--red)" : timerPct <= 50 ? "var(--gold)" : "var(--teal)";
  const progressPct = levelQuestions.length ? (questionIndex / levelQuestions.length) * 100 : 0;

  return (
    <div style={wrap}>
      {toast && <Toast toast={toast} />}
      <div style={{ ...card, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <span
            style={{
              background: "var(--gold)",
              color: "#1a1a1a",
              padding: "4px 12px",
              borderRadius: 999,
              fontWeight: 800,
              fontSize: "0.85rem",
            }}
          >
            Level {currentLevel}
          </span>
          <div style={{ display: "flex", gap: 4, fontSize: "1.2rem" }}>
            {Array.from({ length: MAX_LIVES }, (_, i) => (
              <span key={i} style={{ opacity: i >= lives ? 0.25 : 1, filter: i >= lives ? "grayscale(1)" : "none" }}>
                ❤️
              </span>
            ))}
          </div>
          <span style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
            {questionIndex + 1}/{levelQuestions.length}
          </span>
          <button
            onClick={quitLevel}
            style={{ ...btnSecondary, padding: "4px 12px", fontSize: "0.75rem", borderColor: "var(--red)", color: "var(--red)" }}
          >
            ✕ Quit
          </button>
        </div>

        <Bar pct={progressPct} color="var(--gold)" height={6} />
        <Bar pct={timerPct} color={timerColor} height={5} />

        {q && (
          <>
            <div
              style={{
                background: "var(--surface, rgba(255,255,255,0.05))",
                borderRadius: 16,
                padding: 18,
                fontWeight: 700,
                fontSize: "1.1rem",
                textAlign: "center",
              }}
            >
              {q.question}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {answers.map((item, i) => {
                let bg = "var(--surface, rgba(255,255,255,0.05))";
                let border = "2px solid var(--border, rgba(255,255,255,0.1))";
                if (locked) {
                  if (i === correctIndex) {
                    bg = "rgba(125,187,138,0.25)";
                    border = "2px solid var(--green)";
                  } else if (i === selectedIndex) {
                    bg = "rgba(233,109,109,0.25)";
                    border = "2px solid var(--red)";
                  }
                }
                return (
                  <button
                    key={i}
                    disabled={locked}
                    onClick={() => checkAnswer(i)}
                    style={{
                      padding: 14,
                      borderRadius: 14,
                      border,
                      background: bg,
                      color: "var(--text)",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      textAlign: "left",
                      cursor: locked ? "default" : "pointer",
                      transition: "0.15s",
                    }}
                  >
                    {item.text}
                  </button>
                );
              })}
            </div>

            <div style={{ textAlign: "center", fontWeight: 700 }}>
              Score: <span style={{ color: "var(--gold)" }}>{score}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Bar({ pct, color, height }) {
  return (
    <div style={{ width: "100%", height, background: "var(--surface, rgba(255,255,255,0.05))", borderRadius: 10, overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 10, transition: "width 0.15s linear" }} />
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <div style={{ background: "var(--surface, rgba(255,255,255,0.05))", padding: "8px 14px", borderRadius: 12 }}>
      <div style={{ fontSize: "0.7rem", color: "var(--muted)" }}>{label}</div>
      <div style={{ fontWeight: 800 }}>{value}</div>
    </div>
  );
}

function Toast({ toast }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        left: "50%",
        transform: "translateX(-50%)",
        background: toast.type === "correct" ? "var(--green)" : toast.type === "wrong" ? "var(--red)" : "#333",
        color: toast.type === "correct" ? "#1a1a1a" : "#fff",
        padding: "10px 22px",
        borderRadius: 999,
        fontWeight: 700,
        zIndex: 50,
        maxWidth: "90vw",
        textAlign: "center",
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
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 60,
        padding: 20,
      }}
    >
      <div
        style={{
          background: "var(--surface-strong, rgba(255,255,255,0.08))",
          borderRadius: 18,
          padding: 24,
          maxWidth: 340,
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          color: "var(--text)",
        }}
      >
        <p style={{ margin: 0 }}>{message}</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onCancel}
            style={{ padding: "10px 20px", borderRadius: 999, border: "1px solid var(--border-bright, rgba(255,255,255,0.22))", background: "transparent", color: "var(--text)", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{ padding: "10px 20px", borderRadius: 999, border: "none", background: "var(--red)", color: "#fff", fontWeight: 700, cursor: "pointer" }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
