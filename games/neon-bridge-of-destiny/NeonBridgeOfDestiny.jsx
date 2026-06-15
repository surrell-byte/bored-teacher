import { useState, useCallback } from "react";

const ROWS = 8;
const MAX_LIVES = 4;

function generateSolution() {
  return Array.from({ length: ROWS }, () => Math.floor(Math.random() * 2));
}

export default function NeonBridgeOfDestiny({ onComplete }) {
  const [solution, setSolution] = useState(() => generateSolution());
  const [step, setStep] = useState(0);
  const [player, setPlayer] = useState(1);
  const [lives, setLives] = useState({ 1: MAX_LIVES, 2: MAX_LIVES });
  const [active, setActive] = useState(true);
  const [broken, setBroken] = useState(new Set()); // "row-side" combos revealed as wrong
  const [revealed, setRevealed] = useState(new Set()); // correct ones revealed
  const [flash, setFlash] = useState(null); // "safe" | "fall"
  const [msg, setMsg] = useState("");
  const [winner, setWinner] = useState(null);
  const [player1CorrectChoices, setPlayer1CorrectChoices] = useState(0);
  const [player1TotalChoices, setPlayer1TotalChoices] = useState(0);

  const p1Color = "#a855f7";
  const p2Color = "#06b6d4";

  const choose = useCallback((side) => {
    if (!active || flash) return;
    const correct = solution[step];
    const isCorrect = side === correct;

    // Track Player 1's choices
    if (player === 1) {
      setPlayer1TotalChoices(prev => prev + 1);
      if (isCorrect) {
        setPlayer1CorrectChoices(prev => prev + 1);
      }
    }

    if (isCorrect) {
      setFlash("safe");
      const key = `${step}-${side}`;
      setRevealed(prev => new Set([...prev, key]));
      setMsg(`⚡ Player ${player} stepped safely!`);
      setTimeout(() => {
        setFlash(null);
        const nextStep = step + 1;
        if (nextStep >= ROWS) {
          setWinner(player);
          setActive(false);
          setMsg(`🏆 Player ${player} crossed the bridge!`);
          // Game ends - report for Player 1
          if (player === 1) { // If Player 1 won
            const finalScore = ROWS * 20; // Score adjusted to allow for achievements like "Grammar Rookie"
            const finalAccuracy = player1TotalChoices > 0 ? Math.round((player1CorrectChoices / player1TotalChoices) * 100) : 0;
            onComplete?.(finalScore, finalAccuracy);
          } else { // If Player 2 won, Player 1's score is 0
            const finalAccuracy = player1TotalChoices > 0 ? Math.round((player1CorrectChoices / player1TotalChoices) * 100) : 0;
            onComplete?.(0, finalAccuracy);
          }
        } else {
          setStep(nextStep);
          setPlayer(p => p === 1 ? 2 : 1);
          setMsg("");
        }
      }, 600);
    } else {
      setFlash("fall");
      const key = `${step}-${side}`;
      setBroken(prev => new Set([...prev, key]));
      const newLives = { ...lives, [player]: lives[player] - 1 };
      setMsg(`💥 Player ${player} fell! ${newLives[player]} lives left`);
      setTimeout(() => {
        setFlash(null);
        if (newLives[player] <= 0) {
          setWinner(player === 1 ? 2 : 1);
          setActive(false);
          setMsg(`🏆 Player ${player === 1 ? 2 : 1} wins! Player ${player} ran out of lives.`);
          setLives(newLives);
          // Game ends - report for Player 1
          if (player === 1) { // If Player 1 ran out of lives (lost)
            const finalAccuracy = player1TotalChoices > 0 ? Math.round((player1CorrectChoices / player1TotalChoices) * 100) : 0;
            onComplete?.(0, finalAccuracy);
          } else { // If Player 2 ran out of lives (Player 1 won)
            const finalScore = ROWS * 20; // Player 1 wins, so they get the full score
            const finalAccuracy = player1TotalChoices > 0 ? Math.round((player1CorrectChoices / player1TotalChoices) * 100) : 0;
            onComplete?.(finalScore, finalAccuracy);
          }
        } else {
          setLives(newLives);
          setPlayer(p => p === 1 ? 2 : 1);
        }
      }, 700);
    }
  }, [active, flash, solution, step, player, lives, player1CorrectChoices, player1TotalChoices, onComplete]);

  const reset = () => {
    setSolution(generateSolution());
    setStep(0);
    setPlayer(1);
    setLives({ 1: MAX_LIVES, 2: MAX_LIVES });
    setActive(true);
    setBroken(new Set());
    setRevealed(new Set());
    setFlash(null);
    setMsg("");
    setWinner(null);
    setPlayer1CorrectChoices(0);
    setPlayer1TotalChoices(0);
  };

  const playerColor = player === 1 ? p1Color : p2Color;

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "linear-gradient(180deg,#020617 0%,#0c0a1e 50%,#000 100%)",
      fontFamily: "'Segoe UI', sans-serif", color: "#f1f5f9", padding: 20,
    }}>
      <h1 style={{
        fontSize: "1.6rem", letterSpacing: 3, margin: "0 0 6px",
        background: "linear-gradient(135deg,#a855f7,#06b6d4)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>NEON BRIDGE OF DESTINY</h1>

      {/* Lives panel */}
      <div style={{ display: "flex", gap: 40, marginBottom: 16, alignItems: "center" }}>
        {[1, 2].map(p => (
          <div key={p} style={{ textAlign: "center" }}>
            <div style={{ color: p === 1 ? p1Color : p2Color, fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>
              PLAYER {p} {!winner && player === p && active ? "⚡" : ""}
            </div>
            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
              {Array.from({ length: MAX_LIVES }, (_, i) => (
                <span key={i} style={{ fontSize: "1.1rem", opacity: i < lives[p] ? 1 : 0.2 }}>
                  {p === 1 ? "🟣" : "🔵"}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div style={{
        minHeight: 32, textAlign: "center", fontWeight: 700, fontSize: "1rem",
        color: flash === "safe" ? "#4ade80" : flash === "fall" ? "#f87171" : playerColor,
        marginBottom: 12,
      }}>
        {msg || (active ? `⚡ Player ${player}'s turn — Row ${step + 1}/${ROWS}` : "")}
      </div>

      {/* Bridge */}
      <div style={{
        display: "flex", flexDirection: "column", gap: 6,
        padding: "16px 12px", background: "rgba(255,255,255,0.03)",
        borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)",
        marginBottom: 16,
      }}>
        {Array.from({ length: ROWS }, (_, rowFromTop) => {
          const rowIdx = ROWS - 1 - rowFromTop; // bottom rows are lower indices
          const isCurrentRow = rowIdx === step && active;
          const isPastRow = rowIdx < step;

          return (
            <div key={rowFromTop} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 20, textAlign: "right", fontSize: "0.75rem", color: "#475569" }}>{rowIdx + 1}</span>
              {[0, 1].map(side => {
                const key = `${rowIdx}-${side}`;
                const isBroken = broken.has(key);
                const isSafe = revealed.has(key);
                const isChoice = isCurrentRow;

                let bg = "rgba(255,255,255,0.04)";
                let border = "1px solid rgba(255,255,255,0.08)";
                let glow = "";
                let label = side === 0 ? "LEFT" : "RIGHT";

                if (isBroken) { bg = "rgba(239,68,68,0.15)"; border = "1px solid #ef4444"; label = "💥"; }
                else if (isSafe) { bg = "rgba(74,222,128,0.15)"; border = "1px solid #4ade80"; label = "✓"; }
                else if (isChoice) {
                  bg = player === 1 ? "rgba(168,85,247,0.15)" : "rgba(6,182,212,0.15)";
                  border = `1px solid ${playerColor}`;
                  glow = `0 0 12px ${playerColor}55`;
                }

                return (
                  <div key={side}
                    onClick={() => isChoice && choose(side)}
                    style={{
                      width: 90, height: 38, borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "0.8rem", fontWeight: 700, cursor: isChoice ? "pointer" : "default",
                      background: bg, border, boxShadow: glow,
                      color: isBroken ? "#f87171" : isSafe ? "#4ade80" : isChoice ? playerColor : "#475569",
                      transition: "all 0.15s",
                      transform: isChoice ? "scale(1.04)" : "scale(1)",
                    }}>
                    {label}
                  </div>
                );
              })}
              {isPastRow && (
                <span style={{ fontSize: "0.75rem", color: "#22c55e" }}>✓</span>
              )}
            </div>
          );
        }).reverse()}
      </div>

      {winner && (
        <div style={{
          background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "16px 32px",
          textAlign: "center", marginBottom: 16, border: `1px solid ${winner === 1 ? p1Color : p2Color}`,
        }}>
          <div style={{ fontSize: "2.5rem", marginBottom: 6 }}>🏆</div>
          <div style={{ fontWeight: 800, fontSize: "1.3rem", color: winner === 1 ? p1Color : p2Color }}>
            Player {winner} Wins!
          </div>
        </div>
      )}

      <button onClick={reset} style={{
        padding: "12px 28px", borderRadius: 999, border: "none",
        background: "linear-gradient(135deg,#a855f7,#7c3aed)",
        color: "#fff", fontWeight: 700, cursor: "pointer",
        boxShadow: "0 4px 16px #a855f744",
      }}>⚡ New Bridge</button>

      <p style={{ color: "#334155", fontSize: "0.8rem", marginTop: 12 }}>
        2 players take turns choosing LEFT or RIGHT. Wrong tile = lose a life!
      </p>
    </div>
  );
}
