import React from 'react';

/**
 * Placeholder landing page. Not currently rendered — `App.tsx` mounts
 * `Game.tsx` directly, which has its own internal welcome screen. Reserved
 * here for a future marketing/landing page if this ever needs real routes.
 */
export function Home() {
  return (
    <div className="screen-overlay">
      <div className="welcome-box">
        <div className="welcome-eyebrow">Private Table</div>
        <h1 className="welcome-title">Money Blocks</h1>
        <p className="welcome-sub">This page is a placeholder — the live app starts at the Game screen.</p>
      </div>
    </div>
  );
}
