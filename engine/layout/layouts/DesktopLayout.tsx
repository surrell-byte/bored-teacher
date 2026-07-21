'use client';
// engine/layout/layouts/DesktopLayout.tsx
//
// Laptops and standard monitors — mouse/keyboard first. Header on top,
// sidebar as a persistent column beside the play area for HUD content
// (score/lives/leaderboard), and controls as a caption row below the
// play area — same slot arrangement as tablet, just with room to spare.
//
// Earlier this folded `controls` into the sidebar column instead. That
// works for a real interactive d-pad, but a game passing plain hint text
// (like BlockFight's "← → Move · ↑ Jump" caption) ended up stranded at
// the top of an otherwise-empty side column, disconnected from the play
// area it was describing. Keeping controls in a bottom row like every
// other tier avoids that regardless of what a game puts there.

import { type GameLayoutProps } from '../GameLayout';

export default function DesktopLayout({ header, sidebar, controls, children }: GameLayoutProps) {
  return (
    <div className="game-layout game-layout-desktop">
      {header && <div className="game-layout-header">{header}</div>}
      <div className="game-layout-body">
        <div className="game-layout-play-area">{children}</div>
        {sidebar && <div className="game-layout-sidebar">{sidebar}</div>}
      </div>
      {controls && <div className="game-layout-controls-row">{controls}</div>}
    </div>
  );
}
