import type { ReactNode } from 'react';
import { GAME_CATALOG } from '@/games/catalog.data';

export function generateStaticParams() {
  return Object.keys(GAME_CATALOG).map(game => ({ game }));
}

export default function GameLayout({ children }: { children: ReactNode }) {
  return children;
}