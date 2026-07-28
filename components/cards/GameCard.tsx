'use client';

import {
  GAME_NAMES,
  GAME_ICONS,
  GAME_TAGS,
  GAME_DIFFICULTY,
  GAME_BAR_COLOR,
  GAME_COVERS,
} from '@/constants/index';

interface GameCardProps {
  gameId: string;
  onClick: (gameId: string) => void;
}

export default function GameCard({
  gameId,
  onClick,
}: GameCardProps) {
  const cover = GAME_COVERS[gameId];
  const tag = GAME_TAGS[gameId];
  const accent = GAME_BAR_COLOR[gameId] ?? 'var(--teal)';

  return (
    <button
      className="game-card"
      onClick={() => onClick(gameId)}
    >
      <div
        className={`card-cover${cover ? ' has-image' : ''}`}
        style={{ ['--cover-accent' as any]: accent }}
      >
        {cover && (
          <div
            className="card-cover-img"
            style={{ backgroundImage: `url(${cover})` }}
          />
        )}
        <div className="card-cover-pattern" />
        <div className="card-cover-icon">
          {GAME_ICONS[gameId] ?? '🎮'}
        </div>
      </div>

      <h3 className="card-name">
        {GAME_NAMES[gameId] ?? gameId}
      </h3>

      <div className="card-footer">
        {tag && <span className={`card-tag ${tag.color}`}>{tag.label}</span>}
        <span className="card-difficulty">
          {GAME_DIFFICULTY[gameId] ?? 'Mixed'}
        </span>
      </div>
    </button>
  );
}
