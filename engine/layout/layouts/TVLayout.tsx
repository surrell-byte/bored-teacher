'use client';
// engine/layout/layouts/TVLayout.tsx
//
// Classroom smartboards and ultrawide displays viewed from across a room.
// This is the one layout that's about viewing distance, not screen width —
// it's only ever reached two ways: a genuinely 2560px+ wide viewport, or a
// teacher manually flipping on presentation mode (see ResponsiveLayout,
// hooks/useResponsive.ts). Either way, everything here uses the
// --text-xl/--space-xl/--tap-target-min tokens from app/globals.css's
// [data-presentation="true"] block, so text, spacing, and tap targets all
// scale up together for a kid standing several feet from the screen.
// Sidebar and controls follow the same split as every other tier: sidebar
// beside the play area, controls as a caption row below it.

import { type GameLayoutProps } from '../GameLayout';

export default function TVLayout({ header, sidebar, controls, children }: GameLayoutProps) {
  return (
    <div className="game-layout game-layout-tv">
      {header && <div className="game-layout-header">{header}</div>}
      <div className="game-layout-body">
        <div className="game-layout-play-area">{children}</div>
        {sidebar && <div className="game-layout-sidebar">{sidebar}</div>}
      </div>
      {controls && <div className="game-layout-controls-row">{controls}</div>}
    </div>
  );
}
