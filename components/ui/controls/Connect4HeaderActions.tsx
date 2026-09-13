'use client';

type Connect4Hud = {
  onReset: () => void;
  onHome: () => void;
};

export default function Connect4HeaderActions({ hud }: { hud: Connect4Hud | null }) {
  if (!hud) return null;

  return (
    <>
      <button type="button" className="game-shell-header-action" onClick={hud.onReset} title="Reset match">
        <span aria-hidden="true">⟳</span><span className="game-shell-action-label">Reset</span>
      </button>
      <button type="button" className="game-shell-header-action" onClick={hud.onHome} title="Back to menu">
        <span aria-hidden="true">⌂</span><span className="game-shell-action-label">Home</span>
      </button>
    </>
  );
}
