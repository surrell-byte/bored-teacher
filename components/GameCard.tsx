'use client';
// components/GameCard.tsx

import { useGame } from '@/lib/gameState';
import {
  GAME_NAMES, GAME_ICONS, GAME_TAGS, GAME_BADGE,
  GAME_DIFFICULTY, GAME_BAR_COLOR, GAME_IMAGES,
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
      <img src={GAME_IMAGES[gameId]} className="card-image" alt="" />
      <div className="card-top">
        <div className="card-icon">{GAME_ICONS[gameId]}</div>
        <div className={`card-badge${g.completions > 0 ? ' active' : ''}`}>
          {badge || GAME_BADGE[gameId]}
        </div>
      </div>

      <div className="card-name">{GAME_NAMES[gameId]}</div>

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
