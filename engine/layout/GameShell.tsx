'use client';
// engine/layout/GameShell.tsx
//
// Opinionated convenience wrapper around GameLayout for the common case —
// a title, optional stats for the sidebar, optional controls, and a play
// area — with no custom header/sidebar components to build. Games with
// more specific HUD needs use GameLayout directly instead (see BlockFight).

import { type ReactNode } from 'react';
import GameLayout from './GameLayout';
import GameHeader from './GameHeader';
import GameSidebar, { type GameStat } from './GameSidebar';

export interface GameShellProps {
  title: string;
  icon?: ReactNode;
  stats?: GameStat[];
  controls?: ReactNode;
  children: ReactNode;
}

export default function GameShell({ title, icon, stats, controls, children }: GameShellProps) {
  return (
    <GameLayout
      header={<GameHeader title={title} icon={icon} />}
      sidebar={stats && stats.length > 0 ? <GameSidebar stats={stats} /> : undefined}
      controls={controls}
    >
      {children}
    </GameLayout>
  );
}
