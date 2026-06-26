import React from 'react';
import { useParticles } from '../../hooks/useParticles';

interface ConfettiProps {
  /** Number of pieces to render. */
  count?: number;
  /** Pass a value that changes (e.g. winner name) to regenerate the burst. */
  seed?: number | string;
}

/** Falling confetti burst shown behind the winner screen. */
export function Confetti({ count = 60, seed = 0 }: ConfettiProps) {
  const particles = useParticles(count, seed);

  return (
    <>
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti"
          style={{
            left: p.left,
            background: p.background,
            animationDuration: p.animationDuration,
            animationDelay: p.animationDelay,
          }}
        />
      ))}
    </>
  );
}
