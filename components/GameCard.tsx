'use client';
// components/GameCard.tsx

import { useGame } from '@/lib/gameState';
import {
  GAME_NAMES, GAME_ICONS, GAME_TAGS, GAME_BADGE,
  GAME_DIFFICULTY, GAME_DESC, GAME_BAR_COLOR,
} from '@/lib/constants';

interface Props {
  gameId: string;
  onClick: (gameId: string) => void;
}

export default function GameCard({ gameId, onClick }: Props) {
  const { state } = useGame();
  const g = state.games[gameId] ?? { highScore: 0, completions: 0, lastAccuracy: 0 };
  const tag = GAME_TAGS[gameId] ?? { label: 'Game', color: 'tag-vocab' };
  const badge = g.completions > 0 ? `✓ ${g.completions}x` : (GAME_BADGE[gameId] ?? '');

  return (
    <div
      className={`game-card${g.completions > 0 ? ' active' : ''}`}
      data-game={gameId}
      onClick={() => onClick(gameId)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(gameId)}
      aria-label={`Play ${GAME_NAMES[gameId]}`}
    >
      <div className="card-top">
        <div className="card-icon">{GAME_ICONS[gameId]}</div>
        <div className={`card-badge${g.completions > 0 ? ' active' : ''}`}>
          {badge || GAME_BADGE[gameId]}
        </div>
      </div>

      <div className="card-name">{GAME_NAMES[gameId]}</div>
      <div className="card-desc">{GAME_DESC[gameId]}</div>

      <div className="card-footer">
        <div className={`card-tag ${tag.color}`}>{tag.label}</div>
        <div className="card-score">
          Best: <span>{g.highScore > 0 ? `${g.highScore}%` : '—'}</span>
        </div>
      </div>

      <div className="card-progress-bar">
        <div
          className="card-progress-fill"
          style={{
            width: `${Math.min(100, g.lastAccuracy ?? 0)}%`,
            background: GAME_BAR_COLOR[gameId] ?? 'var(--gold)',
          }}
        />
      </div>

      <div className="card-launch">
        <div className="card-difficulty">{GAME_DIFFICULTY[gameId]}</div>
        <div className="card-cta">Play now →</div>
      </div>
    </div>
  );
}
