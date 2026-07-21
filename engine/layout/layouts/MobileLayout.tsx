'use client';
// engine/layout/layouts/MobileLayout.tsx
//
// Phones. Full-bleed play area is the priority — header collapses to a
// thin strip, sidebar content (score/lives/timer) folds into a slim row
// above the play area instead of a side panel (no width to spare for
// one), and controls dock to the bottom as a fixed bar for thumb reach.

import { type GameLayoutProps } from '../GameLayout';

export default function MobileLayout({ header, sidebar, controls, children }: GameLayoutProps) {
  return (
    <div className="game-layout game-layout-mobile">
      {header && <div className="game-layout-header">{header}</div>}
      {sidebar && <div className="game-layout-sidebar-strip">{sidebar}</div>}
      <div className="game-layout-play-area">{children}</div>
      {controls && <div className="game-layout-controls-bar">{controls}</div>}
    </div>
  );
}
