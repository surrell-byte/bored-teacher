'use client';
// components/GameCard.tsx

import type { CSSProperties } from 'react';
import { useGame } from '@/lib/gameState';
import {
  GAME_NAMES, GAME_ICONS, GAME_TAGS, GAME_BADGE,
  GAME_DIFFICULTY, GAME_BAR_COLOR,
} from '@/constants/index';

interface Props {
  gameId: string;
  onClick: (gameId: string) => void;
}

export default function GameCard({ gameId, onClick }: Props) {
  const { state } = useGame();
  const g = state.games[gameId] ?? { highScore: 0, completions: 0, lastAccuracy: 0 };
  const tag = GAME_TAGS[gameId] ?? { label: 'Game', color: 'tag-vocab' };
  const badge = g.completions > 0 ? `✓ ${g.completions}x` : (GAME_BADGE[gameId] ?? '');
  const gameName = GAME_NAMES[gameId] ?? 'Game';
  const icon = GAME_ICONS[gameId] ?? '🎮';
  const color = GAME_BAR_COLOR[gameId] ?? 'var(--teal)';

  return (
    <div
      className={`game-card${g.completions > 0 ? ' active' : ''}`}
      data-game={gameId}
      onClick={() => onClick(gameId)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(gameId)}
      aria-label={`Play ${gameName}`}
    >
      <div
        className="card-cover"
        style={{ '--cover-accent': color } as CSSProperties}
        aria-hidden
      >
        <div className="card-cover-pattern" />
        <div className="card-cover-icon">{icon}</div>
        <div className="card-cover-copy">
          <span>{tag.label}</span>
          <strong>{gameName}</strong>
        </div>
      </div>

      <div className="card-top">
        <div className="card-icon">{icon}</div>
        <div className={`card-badge${g.completions > 0 ? ' active' : ''}`}>
          {badge || GAME_BADGE[gameId]}
        </div>
      </div>

      <div className="card-name">{gameName}</div>

      <div className="card-footer">
        <div className={`card-tag ${tag.color}`}>{tag.label}</div>
        <div className="card-score">
          Best: <span className={g.highScore > 0 ? 'card-score-val' : 'card-score-empty'}>
            {g.highScore > 0 ? `${g.highScore}%` : '—'}
          </span>
        </div>
      </div>

      <div className="card-meta">
        <span className="card-meta-difficulty">{GAME_DIFFICULTY[gameId]}</span>
      </div>

      <div className="card-play">Play now →</div>
    </div>
  );
}
