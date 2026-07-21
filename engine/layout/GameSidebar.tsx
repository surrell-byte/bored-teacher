'use client';
// engine/layout/GameSidebar.tsx
//
// Default block for GameLayout's `sidebar` slot — a simple labelled stat
// list (score, lives, time, whatever a game wants to surface). Games with
// a richer HUD can pass their own node to GameLayout's `sidebar` prop instead.

export interface GameStat {
  label: string;
  value: string | number;
  icon?: string;
}

export interface GameSidebarProps {
  stats: GameStat[];
}

export default function GameSidebar({ stats }: GameSidebarProps) {
  return (
    <div className="game-sidebar-default">
      {stats.map(s => (
        <div key={s.label} className="game-sidebar-stat">
          {s.icon && <span className="game-sidebar-stat-icon">{s.icon}</span>}
          <span className="game-sidebar-stat-value">{s.value}</span>
          <span className="game-sidebar-stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
