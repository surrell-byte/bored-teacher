'use client';
// engine/layout/GameHeader.tsx
//
// Default block for GameLayout's `header` slot — a title on the left,
// optional actions (pause/exit/restart) on the right. Games with a custom
// HUD (score bars, etc.) can skip this and pass their own node to
// GameLayout's `header` prop directly instead — see BlockFight for that case.

import { type ReactNode } from 'react';
import AvatarDisplay from '@/engine/ui/AvatarDisplay';

export interface GameHeaderProps {
  title: string;
  icon?: ReactNode;
  actions?: ReactNode;
  playerAvatar?: string;
  playerName?: string;
}

export default function GameHeader({ title, icon, actions, playerAvatar, playerName }: GameHeaderProps) {
  return (
    <div className="game-header-default">
      <span className="game-header-title">
        {playerAvatar && <AvatarDisplay value={playerAvatar} size={30} alt={`${playerName || 'Player'} avatar`} className="game-header-player-avatar" />}
        {icon && <span className="game-header-icon">{icon}</span>}
        {title}
      </span>
      {actions && <div className="game-header-actions">{actions}</div>}
    </div>
  );
}
