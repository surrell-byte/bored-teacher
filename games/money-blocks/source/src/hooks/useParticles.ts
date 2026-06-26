import { useMemo } from 'react';

export interface Particle {
  id: number;
  left: string;
  background: string;
  animationDuration: string;
  animationDelay: string;
}

const COLORS = ['#E8C97A', '#C9A961', '#F3EFE6', '#8C6B33'];

/** Generates a stable list of confetti particle styles, regenerated when `seed` changes. */
export function useParticles(count: number, seed: number | string = 0): Particle[] {
  return useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      background: COLORS[Math.floor(Math.random() * COLORS.length)],
      animationDuration: `${(2.5 + Math.random() * 2).toFixed(2)}s`,
      animationDelay: `${(Math.random() * 1.2).toFixed(2)}s`,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, seed]);
}

