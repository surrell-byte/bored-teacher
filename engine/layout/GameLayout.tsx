'use client';
// engine/layout/GameLayout.tsx
//
// Public entry point for a responsive game layout. A game passes its
// header/sidebar/controls content as props and its actual play area as
// children; GameLayout picks the right device-tier arrangement via
// ResponsiveLayout, so individual games never need to know tiers exist.
//
// No game in this repo consumes this yet — engine/layout was five empty
// files with no callers anywhere in the app. This is the contract those
// stub filenames were scaffolded for, built out for the first time.

import { type ReactNode } from 'react';
import ResponsiveLayout from './ResponsiveLayout';

export interface GameLayoutSlots {
  /** Title, pause/exit controls. Optional — layouts render fine without one. */
  header?: ReactNode;
  /** Score, lives, timer, leaderboard — shown alongside play area where there's room for it. */
  sidebar?: ReactNode;
  /** Touch controls, or a plain hint caption — docked bottom at every tier (fixed bar on mobile, in-flow row elsewhere). */
  controls?: ReactNode;
}

export interface GameLayoutProps extends GameLayoutSlots {
  children: ReactNode;
}

export default function GameLayout({ children, header, sidebar, controls }: GameLayoutProps) {
  return (
    <ResponsiveLayout header={header} sidebar={sidebar} controls={controls}>
      {children}
    </ResponsiveLayout>
  );
}
