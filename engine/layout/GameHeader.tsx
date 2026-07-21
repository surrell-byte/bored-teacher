'use client';
// engine/layout/GameHeader.tsx
//
// Default block for GameLayout's `header` slot — a title on the left,
// optional actions (pause/exit/restart) on the right. Games with a custom
// HUD (score bars, etc.) can skip this and pass their own node to
// GameLayout's `header` prop directly instead — see BlockFight for that case.

import { type ReactNode } from 'react';

export interface GameHeaderProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

export default function GameHeader({ title, icon, actions }: GameHeaderProps) {
  return (
    <div className="game-header-default">
      <span className="game-header-title">
        {icon && <span className="game-header-icon">{icon}</span>}
        {title}
      </span>
      {actions && <div className="game-header-actions">{actions}</div>}
    </div>
  );
}
