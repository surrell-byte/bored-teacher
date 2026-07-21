'use client';
// engine/layout/layouts/TabletLayout.tsx
//
// Tablets and small laptops in portrait. Enough width for sidebar content
// to sit beside the play area instead of stacking, but still touch-first,
// so controls stay docked at the bottom — just in-flow rather than a
// fixed overlay, since there's vertical room to spare that a phone doesn't have.

import { type GameLayoutProps } from '../GameLayout';

export default function TabletLayout({ header, sidebar, controls, children }: GameLayoutProps) {
  return (
    <div className="game-layout game-layout-tablet">
      {header && <div className="game-layout-header">{header}</div>}
      <div className="game-layout-body">
        <div className="game-layout-play-area">{children}</div>
        {sidebar && <div className="game-layout-sidebar">{sidebar}</div>}
      </div>
      {controls && <div className="game-layout-controls-row">{controls}</div>}
    </div>
  );
}
