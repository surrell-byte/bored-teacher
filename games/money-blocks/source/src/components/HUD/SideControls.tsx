import React, { useState } from 'react';
import { ThemeSelector } from '../ThemeSelector/ThemeSelector';
import { TurnPill } from './TurnPill';
import { HowToPlayModal } from './HowToPlayModal';
import { useGame } from '../../context/GameContext';

export function SideControls() {
  const { reset } = useGame();
  const [htpOpen, setHtpOpen] = useState(false);

  return (
    <div className="side-controls">
      <div className="side-buttons">
        <button className="side-btn" onClick={() => setHtpOpen(true)}>How to Play</button>
        <button className="side-btn" onClick={reset}>Reset Table</button>
      </div>
      <ThemeSelector />
      <TurnPill />
      <HowToPlayModal open={htpOpen} onClose={() => setHtpOpen(false)} />
    </div>
  );
}
