#!/usr/bin/env bash
set -euo pipefail

# apply-connect4-layout-fix.sh
# Run this from the ROOT of your bored-teacher-react project.
#
# What it does:
# 1. Board fits comfortably in view (tighter cell sizing, less wasted padding)
# 2. Player color+avatar badges moved from the second navbar row to portrait
#    side panels flanking the board (fills the empty space on desktop, active
#    player glows/floats)
# 3. Reset/Home buttons moved into the TOP bar, inline with Best/Coins/Pause/
#    Full screen/Exit (removes the old second row entirely for Connect 4)

if [ ! -f "games/connect-4/Connect4.jsx" ]; then
  echo "ERROR: run this from the project root (games/connect-4/Connect4.jsx not found)"
  exit 1
fi

echo "Backing up files..."
cp games/connect-4/Connect4.jsx games/connect-4/Connect4.jsx.bak
cp "app/games/[game]/page.tsx" "app/games/[game]/page.tsx.bak"
cp engine/layout/GameShell.tsx engine/layout/GameShell.tsx.bak

echo "Applying patch 1/3: Connect4.jsx (side panels + top-bar reset/home + board sizing)..."
patch -p1 < /dev/stdin <<'PATCH1'
--- a/games/connect-4/Connect4.jsx	2026-07-29 03:29:29.000000000 +0000
+++ b/games/connect-4/Connect4.jsx	2026-07-29 08:05:22.513689273 +0000
@@ -147,23 +147,30 @@
   );
 }
 
-// ── Rendered inside the GameShell's own navbar (controls bar) while a ──
-// ── match is in progress: P1 badge left, Home/Reset centre, P2 badge right.
-export function Connect4Controls({ hud }) {
+// ── Rendered inline in the GameShell's TOP bar, alongside Best/Coins/ ──
+// ── Pause/Full screen/Exit, so Reset + Home sit in the same row.
+export function Connect4HeaderActions({ hud }) {
   if (!hud) return null;
-  const { p1, p2, current, active, onReset, onHome } = hud;
+  const { onReset, onHome } = hud;
   return (
-    <div className="c4-navbar-hud">
-      <div className={`c4-navbar-slot${active && current === 1 ? " turn" : ""}`} style={{ "--turn-a": p1.theme.a }}>
-        <PlayerBadge name={p1.name} avatar={p1.avatar} theme={p1.theme} score={p1.score} align="left" />
-      </div>
-      <div className="c4-navbar-center">
-        <button type="button" className="c4-navbar-btn" onClick={onReset} title="Reset match">⟳ Reset</button>
-        <button type="button" className="c4-navbar-btn" onClick={onHome} title="Back to menu">⌂ Home</button>
-      </div>
-      <div className={`c4-navbar-slot${active && current === 2 ? " turn" : ""}`} style={{ "--turn-a": p2.theme.a }}>
-        <PlayerBadge name={p2.name} avatar={p2.avatar} theme={p2.theme} score={p2.score} align="right" />
+    <>
+      <button type="button" className="game-shell-header-action" onClick={onReset} title="Reset match">⟳ Reset</button>
+      <button type="button" className="game-shell-header-action" onClick={onHome} title="Back to menu">⌂ Home</button>
+    </>
+  );
+}
+
+// ── Portrait player panel — sits in the empty space to the left/right ──
+// ── of the board itself, instead of in a navbar row.
+function SidePanel({ name, avatar, theme, score, active, side }) {
+  return (
+    <div className={`c4-side-panel c4-side-${side}${active ? " active" : ""}`} style={{ "--badge-a": theme.a, "--badge-b": theme.b }}>
+      <div className="c4-side-avatar" style={{ background: `radial-gradient(circle at 35% 30%, ${theme.a}, ${theme.b})` }}>
+        <span>{avatar}</span>
       </div>
+      <div className="c4-side-name">{name}</div>
+      <div className="c4-side-score">{score} win{score !== 1 ? "s" : ""}</div>
+      {active && <div className="c4-side-turn">Your turn</div>}
     </div>
   );
 }
@@ -334,7 +341,7 @@
       "--p1-a": t1.a, "--p1-b": t1.b, "--p2-a": t2.a, "--p2-b": t2.b,
       minHeight: "100%", width: "100%", display: "flex", alignItems: "center", justifyContent: "center",
       background: "radial-gradient(circle at center, #0d1322 0%, #06080f 70%), #05070d",
-      fontFamily: "'DM Sans', sans-serif", color: "#e8edf5", position: "relative", overflow: "hidden", padding: "1.5rem",
+      fontFamily: "'DM Sans', sans-serif", color: "#e8edf5", position: "relative", overflow: "hidden", padding: "0.8rem",
     }}>
       {/* ambient glow wash */}
       <div style={{
@@ -475,7 +482,9 @@
       )}
 
       {screen === "game" && (
-        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0, position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
+        <div className="c4-game-row" style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>
+          <SidePanel name={p1Name} avatar={p1Avatar} theme={t1} score={scores.p1} active={active && current === 1} side="left" />
+
           <div className={`c4-board-frame${!active ? " over" : ""}`}>
             <div className="c4-board-grid">
               {board.map((row, r) => row.map((cell, c) => {
@@ -508,6 +517,8 @@
               ))}
             </div>
           </div>
+
+          <SidePanel name={p2Name} avatar={p2Avatar} theme={t2} score={scores.p2} active={active && current === 2} side="right" />
         </div>
       )}
 
@@ -642,21 +653,51 @@
         .c4-badge-name { font-weight: 800; font-size: clamp(0.9rem, 1.6vw, 1.15rem); color: #e8edf5; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 34vw; }
         .c4-badge-score { font-family: 'DM Mono', monospace; font-size: 0.72rem; opacity: 0.6; color: #9aa7bd; letter-spacing: 0.5px; }
 
-        /* ── In-game navbar HUD, rendered by the page via GameShell's controls bar ── */
-        .c4-navbar-hud { display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 14px; white-space: normal; }
-        .c4-navbar-slot { border-radius: 100px; padding: 4px 12px 4px 4px; transition: box-shadow 0.2s; min-width: 0; }
-        .c4-navbar-slot.turn { box-shadow: 0 0 0 2px var(--turn-a), 0 0 16px var(--turn-a)66; background: rgba(255,255,255,0.05); }
-        .c4-navbar-hud .c4-badge-right.c4-badge { flex-direction: row-reverse; }
-        .c4-navbar-center { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
-        .c4-navbar-btn {
-          display: inline-flex; align-items: center; gap: 4px; min-height: 32px; padding: 6px 12px;
-          border-radius: 100px; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06);
-          color: #e8edf5; font-family: 'DM Sans', sans-serif; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.18s;
+        /* ── Game screen: side panels flank the board, everything sized to ── */
+        /* ── fit within the viewport without scrolling.                     */
+        .c4-game-row {
+          display: flex; align-items: center; justify-content: center;
+          gap: clamp(0.8rem, 2.4vw, 2.2rem);
+        }
+
+        /* ── Portrait player panel — replaces the old navbar badges; lives ── */
+        /* ── in the empty space beside the board and grows to fill it.      */
+        .c4-side-panel {
+          display: flex; flex-direction: column; align-items: center; justify-content: center;
+          gap: clamp(0.5rem, 1.4vh, 1rem);
+          width: clamp(96px, 12vw, 176px);
+          padding: clamp(1rem, 2.4vh, 1.8rem) 0.8rem;
+          border-radius: 24px;
+          background: linear-gradient(160deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01)), rgba(10,14,24,0.55);
+          border: 1px solid rgba(255,255,255,0.08);
+          box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
+          transition: box-shadow 0.25s, border-color 0.25s, background 0.25s;
+          flex-shrink: 0;
+        }
+        .c4-side-panel.active {
+          border-color: var(--badge-a); background: rgba(255,255,255,0.06);
+          box-shadow: 0 0 0 2px var(--badge-a)55, 0 0 30px var(--badge-a)33, inset 0 1px 0 rgba(255,255,255,0.08);
+        }
+        .c4-side-avatar {
+          width: clamp(56px, 7vw, 104px); height: clamp(56px, 7vw, 104px); border-radius: 50%;
+          display: flex; align-items: center; justify-content: center;
+          font-size: clamp(1.8rem, 3.2vw, 3rem);
+          box-shadow: inset 0 4px 10px rgba(255,255,255,0.3), inset 0 -8px 16px rgba(0,0,0,0.35), 0 0 20px var(--badge-a)55;
+        }
+        .c4-side-panel.active .c4-side-avatar { animation: c4Float 2s ease-in-out infinite; }
+        .c4-side-name {
+          font-weight: 800; font-size: clamp(0.8rem, 1.1vw, 1rem); color: #e8edf5; text-align: center;
+          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;
+        }
+        .c4-side-score { font-family: 'DM Mono', monospace; font-size: 0.68rem; opacity: 0.6; color: #9aa7bd; letter-spacing: 0.5px; }
+        .c4-side-turn {
+          font-family: 'DM Mono', monospace; font-size: 0.6rem; letter-spacing: 1.5px; text-transform: uppercase;
+          color: var(--badge-a); background: var(--badge-a)1a; border: 1px solid var(--badge-a)55;
+          padding: 3px 10px; border-radius: 100px;
         }
-        .c4-navbar-btn:hover { background: rgba(255,255,255,0.14); border-color: #d4a853; color: #f0c46a; }
 
         .c4-board-frame {
-          --cell: min(13vw, 15vh, 108px);
+          --cell: min(8.6vw, 11vh, 84px);
           --gap-x: calc(var(--cell) * 0.22);
           --gap-y: calc(var(--cell) * 0.14);
           --pad-x: calc(var(--cell) * 0.42);
@@ -667,7 +708,7 @@
           border-radius: 28px;
           padding: var(--pad-y) var(--pad-x);
           box-shadow: 0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -10px 30px rgba(0,0,0,0.5);
-          position: relative; margin: 0.8rem auto 0;
+          position: relative; margin: 0 auto; flex-shrink: 0;
         }
         .c4-board-grid {
           display: grid;
@@ -722,13 +763,18 @@
           100% { transform: translate(var(--drift), 110vh) rotate(var(--rot)); opacity: 0.9; }
         }
 
+        @media (max-width: 720px) {
+          .c4-game-row { flex-direction: column; gap: 0.6rem; }
+          .c4-side-panel {
+            flex-direction: row; width: 100%; max-width: 380px; padding: 0.5rem 1rem;
+            gap: 0.7rem; justify-content: flex-start;
+          }
+          .c4-side-avatar { width: 34px; height: 34px; font-size: 1.1rem; }
+          .c4-side-name { font-size: 0.8rem; max-width: 40vw; }
+          .c4-side-turn { margin-left: auto; }
+        }
         @media (max-width: 520px) {
           .c4-board-frame { --cell: min(12vw, 52px); }
-          .c4-navbar-hud { gap: 8px; }
-          .c4-badge-avatar { width: 30px; height: 30px; font-size: 0.95rem; }
-          .c4-badge-name { max-width: 20vw; font-size: 0.72rem; }
-          .c4-badge-score { display: none; }
-          .c4-navbar-btn span { display: none; }
         }
       `}</style>
     </div>
PATCH1

echo "Applying patch 2/3: app/games/[game]/page.tsx (wire headerExtra, drop old controls bar)..."
patch -p1 < /dev/stdin <<'PATCH2'
--- a/app/games/[game]/page.tsx	2026-07-29 03:29:30.000000000 +0000
+++ b/app/games/[game]/page.tsx	2026-07-29 08:04:21.678494133 +0000
@@ -10,7 +10,7 @@
 import { GAME_COMPONENTS } from '@/games/catalog.components';
 import { GameShell } from '@/engine';
 import DesktopControls from '@/components/ui/controls/DesktopControls';
-import { Connect4Controls } from '@/games/connect-4/Connect4.jsx';
+import { Connect4HeaderActions } from '@/games/connect-4/Connect4.jsx';
 
 // ── Types ─────────────────────────────────────────────────────
 interface GameResult {
@@ -88,7 +88,8 @@
         completion={result}
         onContinue={handleContinue}
         onRestart={handleContinue}
-        controls={isConnect4 ? (c4Hud ? <Connect4Controls hud={c4Hud} /> : null) : <DesktopControls />}
+        controls={isConnect4 ? null : <DesktopControls />}
+        headerExtra={isConnect4 && c4Hud ? <Connect4HeaderActions hud={c4Hud} /> : null}
         stats={[
           { label: 'Best', value: state.games[gameId]?.highScore ?? 0, icon: '⭐' },
           { label: 'Coins', value: state.coins, icon: '🪙' },
PATCH2

echo "Applying patch 3/3: engine/layout/GameShell.tsx (add headerExtra prop)..."
patch -p1 < /dev/stdin <<'PATCH3'
--- a/engine/layout/GameShell.tsx	2026-07-28 17:00:24.000000000 +0000
+++ b/engine/layout/GameShell.tsx	2026-07-29 08:04:09.567698723 +0000
@@ -21,6 +21,8 @@
   icon?: ReactNode;
   stats?: GameStat[];
   controls?: ReactNode;
+  /** Extra buttons rendered inline in the top bar, alongside stats/Pause/Full screen/Exit. */
+  headerExtra?: ReactNode;
   children: ReactNode;
   /** Increment this when replacing a game instance (for example, after retry). */
   sessionKey?: string | number;
@@ -36,7 +38,7 @@
  * while each game remains responsible only for its own mechanics and UI.
  */
 export default function GameShell({
-  gameId, title, icon, stats, controls, children, sessionKey = 0,
+  gameId, title, icon, stats, controls, headerExtra, children, sessionKey = 0,
   completion, onContinue, onRestart, onSessionEvent,
 }: GameShellProps) {
   const [paused, setPaused] = useState(false);
@@ -129,6 +131,7 @@
                       ))}
                     </div>
                   )}
+                  {headerExtra}
                   <button type="button" className="game-shell-header-action" onClick={paused ? resume : pause} aria-pressed={paused}>
                     {paused ? 'Resume' : 'Pause'}
                   </button>
PATCH3

echo ""
echo "Done. Backups saved as *.bak next to each changed file."
echo "Restart your dev server (or it should hot-reload) and check /games/connect4."
