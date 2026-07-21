'use client';
// engine/layout/layouts/LargeDesktopLayout.tsx
//
// Big monitors and wide displays. Same arrangement as DesktopLayout —
// sidebar beside the play area, controls as a caption row below it — but
// the play area gets a max-width so it doesn't stretch uncomfortably wide
// on a 1600px+ screen the way the rest of this app used to before the
// responsive foundation existed (see app/globals.css's old single
// min-width: 1600px rule) — extra width goes to breathing room, not to
// stretching the game itself.

import { type GameLayoutProps } from '../GameLayout';

export default function LargeDesktopLayout({ header, sidebar, controls, children }: GameLayoutProps) {
  return (
    <div className="game-layout game-layout-large-desktop">
      {header && <div className="game-layout-header">{header}</div>}
      <div className="game-layout-body">
        <div className="game-layout-play-area">{children}</div>
        {sidebar && <div className="game-layout-sidebar">{sidebar}</div>}
      </div>
      {controls && <div className="game-layout-controls-row">{controls}</div>}
    </div>
  );
}
