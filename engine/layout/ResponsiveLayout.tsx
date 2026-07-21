'use client';
// engine/layout/ResponsiveLayout.tsx
//
// Picks the right device-tier layout via useResponsive() and renders it.
// This is the one place that needs to know the tier list exists — the five
// layouts underneath only need to know how to arrange the slots they're given.

import { useResponsive } from '@/hooks/useResponsive';
import { type GameLayoutProps } from './GameLayout';
import MobileLayout from './layouts/MobileLayout';
import TabletLayout from './layouts/TabletLayout';
import DesktopLayout from './layouts/DesktopLayout';
import LargeDesktopLayout from './layouts/LargeDesktopLayout';
import TVLayout from './layouts/TVLayout';

export default function ResponsiveLayout({ header, sidebar, controls, children }: GameLayoutProps) {
  const { tier, presentationMode } = useResponsive();

  // A teacher's manual presentation-mode toggle always wins over the
  // measured tier — a smartboard usually reports an ordinary 1080p/4K
  // width, same as a desktop monitor, so width alone can never select
  // TVLayout on its own. See hooks/useResponsive.ts.
  const effectiveTier = presentationMode ? 'tv' : tier;
  const slots = { header, sidebar, controls, children };

  switch (effectiveTier) {
    case 'mobile':       return <MobileLayout {...slots} />;
    case 'tablet':       return <TabletLayout {...slots} />;
    case 'largeDesktop': return <LargeDesktopLayout {...slots} />;
    case 'tv':           return <TVLayout {...slots} />;
    case 'desktop':
    default:             return <DesktopLayout {...slots} />;
  }
}
