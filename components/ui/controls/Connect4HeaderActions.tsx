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
        ⟳ Reset
      </button>
      <button type="button" className="game-shell-header-action" onClick={hud.onHome} title="Back to menu">
        ⌂ Home
      </button>
    </>
  );
}
