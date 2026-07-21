'use client';
// engine/layout/GameBottomBar.tsx
//
// Default block for GameLayout's `controls` slot — a row of on-screen
// buttons for touch play, sized to --tap-target-min. Games with a
// keyboard-hint footer or a custom d-pad can pass their own node to
// GameLayout's `controls` prop instead — see BlockFight for that case.

export interface GameButton {
  label: string;
  onPress: () => void;
}

export interface GameBottomBarProps {
  buttons: GameButton[];
}

export default function GameBottomBar({ buttons }: GameBottomBarProps) {
  return (
    <div className="game-bottombar-default">
      {buttons.map(b => (
        <button
          key={b.label}
          type="button"
          className="game-bottombar-btn"
          onClick={b.onPress}
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}
