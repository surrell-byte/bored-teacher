import React, { useState } from 'react';
import { AVATARS } from '../../game/Constants';
import { Button } from './Button';

interface SetupScreenProps {
  onStart: (p1Name: string, p1Avatar: string, p2Name: string, p2Avatar: string) => void;
}

/** Pre-game screen where both players pick a name and an avatar. */
export function SetupScreen({ onStart }: SetupScreenProps) {
  const [p1Name, setP1Name] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [p1Avatar, setP1Avatar] = useState(AVATARS[0]);
  const [p2Avatar, setP2Avatar] = useState(AVATARS[1]);

  const handleStart = () => {
    onStart(p1Name.trim() || 'Player One', p1Avatar, p2Name.trim() || 'Player Two', p2Avatar);
  };

  return (
    <div className="screen-overlay">
      <div className="setup-box">
        <div className="setup-header">
          <div className="setup-eyebrow">Private Table</div>
          <h2 className="setup-title">Take Your Seats</h2>
        </div>
        <div className="setup-players">
          <PlayerSetupCard
            label="Player One"
            name={p1Name}
            onNameChange={setP1Name}
            avatar={p1Avatar}
            onAvatarChange={setP1Avatar}
          />
          <PlayerSetupCard
            label="Player Two"
            name={p2Name}
            onNameChange={setP2Name}
            avatar={p2Avatar}
            onAvatarChange={setP2Avatar}
          />
        </div>
        <Button onClick={handleStart}>Deal the Board</Button>
      </div>
    </div>
  );
}

interface PlayerSetupCardProps {
  label: string;
  name: string;
  onNameChange: (value: string) => void;
  avatar: string;
  onAvatarChange: (value: string) => void;
}

function PlayerSetupCard({ label, name, onNameChange, avatar, onAvatarChange }: PlayerSetupCardProps) {
  return (
    <div className="setup-player">
      <div className="setup-player-label">{label}</div>
      <input
        className="setup-name-input"
        type="text"
        placeholder={label}
        value={name}
        maxLength={20}
        onChange={(e) => onNameChange(e.target.value)}
      />
      <div>
        <div className="setup-avatar-label">Avatar</div>
        <div className="avatar-grid">
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              className={`avatar-btn ${avatar === a ? 'selected' : ''}`}
              onClick={() => onAvatarChange(a)}
              aria-label={`Choose avatar ${a}`}
              aria-pressed={avatar === a}
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
