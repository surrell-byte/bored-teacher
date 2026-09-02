'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

// Each background image's focal point — the point that should stay
// visible when `background-size: cover` crops the image to fit the
// viewport. Tune these once per image, not per viewport.
const BACKGROUNDS: Record<string, { src: string; position: string }> = {
  plain:        { src: '/assets/images/plain-bg.png',              position: 'center' },
  welcome:      { src: '/assets/images/welcome-page.webp',        position: 'center' },
  startPlaying: { src: '/assets/images/start-playing-page.webp',  position: 'center' },
  auth:         { src: '/assets/images/auth-screen-bg.webp',     position: 'center' },
  hub:          { src: '/assets/images/hub-bg-desktop.webp',      position: 'center' },
  games:        { src: '/assets/images/games-bg-desktop.webp',    position: '75% center' },
  leaderboard:  { src: '/assets/images/leaderboard-bg-desktop.webp', position: 'center' },
  trophy:       { src: '/assets/images/trophy-room-bg-desktop.webp', position: 'center' },
  shop:         { src: '/assets/images/shop-bg-desktop.webp',     position: 'center' },
  resources:    { src: '/assets/images/resources-bg-desktop.webp', position: 'center' },
  blog:         { src: '/assets/images/plain-bg.png',             position: 'center' },
  subscription: { src: '/assets/images/subscription-bg.webp',    position: 'center' },
};

export default function AppBackground() {
  const pathname = usePathname();
  const [splashStage, setSplashStage] = useState<'welcome' | 'start-playing'>('welcome');

  useEffect(() => {
    function handleStageChange(event: Event) {
      const detail = (event as CustomEvent<{ stage: string }>).detail;
      if (detail?.stage === 'start-playing') {
        setSplashStage('start-playing');
      }
    }
    window.addEventListener('splashBackgroundChange', handleStageChange as EventListener);
    return () => window.removeEventListener('splashBackgroundChange', handleStageChange as EventListener);
  }, []);

  useEffect(() => {
    if (pathname !== '/') {
      setSplashStage('welcome');
    }
  }, [pathname]);

  let entry = BACKGROUNDS.plain;

  if (pathname === '/') {
    entry = splashStage === 'start-playing' ? BACKGROUNDS.startPlaying : BACKGROUNDS.welcome;
  } else if (pathname === '/auth') {
    entry = BACKGROUNDS.auth;
  } else if (pathname.startsWith('/hub')) {
    entry = BACKGROUNDS.hub;
  } else if (pathname === '/games' || pathname.startsWith('/games/')) {
    entry = BACKGROUNDS.games;
  } else if (pathname.startsWith('/leaderboard')) {
    entry = BACKGROUNDS.leaderboard;
  } else if (pathname.startsWith('/trophy')) {
    entry = BACKGROUNDS.trophy;
  } else if (pathname.startsWith('/shop')) {
    entry = BACKGROUNDS.shop;
  } else if (pathname.startsWith('/resources')) {
    entry = BACKGROUNDS.resources;
  } else if (pathname.startsWith('/blog')) {
    entry = BACKGROUNDS.plain;
  } else if (pathname.startsWith('/subscription')) {
    entry = BACKGROUNDS.subscription;
  }

  useEffect(() => {
    const plainImage = new Image();
    plainImage.decoding = 'async';
    plainImage.fetchPriority = 'high';
    plainImage.src = BACKGROUNDS.plain.src;
    const img = new Image();
    img.decoding = 'async';
    img.src = entry.src;
  }, [entry.src]);

  return (
    <>
      <div
        key={entry.src}
        className="app-background"
        style={{
          backgroundImage: `url(${entry.src})`,
          ['--bg-pos' as any]: entry.position,
        }}
      />
      <div className="app-background-overlay" />
    </>
  );
}
