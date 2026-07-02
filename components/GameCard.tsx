'use client';
// components/GameCard.tsx

import type { CSSProperties } from 'react';
import { useGame } from '@/lib/gameState';
import {
  GAME_NAMES, GAME_ICONS, GAME_TAGS, GAME_BADGE,
  GAME_DIFFICULTY, GAME_BAR_COLOR, GAME_IMAGES,
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
  const image = GAME_IMAGES[gameId];

  function makeSvgDataUrl(icon: string, title: string, tagLabel: string, accent: string) {
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' width='1200' height='600'>
        <defs>
          <linearGradient id='g' x1='0' x2='1' y1='0' y2='1'>
            <stop offset='0' stop-color='${accent}' stop-opacity='0.9' />
            <stop offset='1' stop-color='#0b2616' stop-opacity='0.9' />
          </linearGradient>
        </defs>
        <rect width='100%' height='100%' fill='url(#g)' />
        <g>
          <text x='92%' y='22%' font-size='160' text-anchor='middle' dominant-baseline='middle'>${icon}</text>
        </g>
        <text x='8%' y='70%' font-size='44' fill='white' font-family='sans-serif' font-weight='700'>${title}</text>
        <text x='8%' y='86%' font-size='28' fill='rgba(255,255,255,0.85)' font-family='sans-serif'>${tagLabel}</text>
      </svg>
    `;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

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
        className={`card-cover${image ? ' has-image' : ''}`}
        style={{ '--cover-accent': color } as CSSProperties}
        aria-hidden
      >
        {image ? (
          <div
            className="card-cover-img"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div
            className="card-cover-img"
            style={{ backgroundImage: `url(${makeSvgDataUrl(icon, gameName, tag.label, color)})` }}
          />
        )}

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
