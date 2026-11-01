'use client';

type Connect4Hud = {
  onReset: () => void;
  onHome: () => void;
};

export default function Connect4HeaderActions({ hud }: { hud: Connect4Hud | null }) {
  if (!hud) return null;

  return (
    <>
      <button type="button" role="menuitem" onClick={hud.onReset} title="Reset match">
        <span aria-hidden="true">⟳</span><span>Reset</span>
      </button>
      <button type="button" role="menuitem" onClick={hud.onHome} title="Back to menu">
        <span aria-hidden="true">⌂</span><span>Home</span>
      </button>
    </>
  );
}
