import React from 'react';
import { Button } from './Button';

interface WelcomeScreenProps {
  onBegin: () => void;
}

/** First screen shown on load — introduces the table before player setup. */
export function WelcomeScreen({ onBegin }: WelcomeScreenProps) {
  return (
    <div className="screen-overlay">
      <div className="welcome-box">
        <div className="welcome-eyebrow">Private Table</div>
        <h1 className="welcome-title">Money Blocks</h1>
        <p className="welcome-sub">
          Two players, one board, twenty-six hidden tiles. Race to a million — or hold the
          richest hand when the table empties.
        </p>
        <div className="welcome-rule" />
        <Button variant="welcome" onClick={onBegin}>Sit Down</Button>
      </div>
    </div>
  );
}
