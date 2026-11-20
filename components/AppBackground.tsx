'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Each background image's focal point — the point that should stay
// visible when `background-size: cover` crops the image to fit the
// viewport. Tune these once per image, not per viewport.
const BACKGROUNDS: Record<string, { src: string; position: string }> = {
  plain:        { src: '/assets/.optimized/images/plain-bg.webp',  position: 'center' },
  general:      { src: '/assets/images/general-bg.webp',           position: 'center' },
  home:         { src: '/assets/images/startup-background-desktop.webp', position: 'center' },
  auth:         { src: '/assets/images/auth-screen-bg.webp',     position: 'center' },
  hub:          { src: '/assets/images/hub-bg-desktop.webp',      position: 'center' },
  games:        { src: '/assets/images/games-bg-desktop.webp',    position: '75% center' },
  leaderboard:  { src: '/assets/images/leaderboard-bg-desktop.webp', position: 'center' },
  trophy:       { src: '/assets/images/trophy-room-bg-desktop.webp', position: 'center' },
  shop:         { src: '/assets/images/shop-bg-desktop.webp',     position: 'center' },
  resources:    { src: '/assets/images/resources-bg-desktop.webp', position: 'center' },
  blog:         { src: '/assets/.optimized/images/plain-bg.webp', position: 'center' },
  subscription: { src: '/assets/images/subscription-bg.webp',    position: 'center' },
};
export default function AppBackground() {
  const pathname = usePathname();

  let entry = BACKGROUNDS.plain;

  if (pathname === '/') {
    entry = BACKGROUNDS.home;
  } else if (pathname === '/auth') {
    entry = BACKGROUNDS.auth;
  } else if (pathname.startsWith('/hub')) {
    entry = BACKGROUNDS.hub;
  } else if (pathname.startsWith('/games/flagmaster')) {
    entry = BACKGROUNDS.general;
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
    const phoneMedia = window.matchMedia('(max-width: 760px) and (orientation: portrait)');
    const tabletMedia = window.matchMedia('(min-width: 761px) and (max-width: 1100px) and (min-aspect-ratio: 5/4) and (max-aspect-ratio: 3/2)');
    const preload = () => {
      const src = pathname === '/'
        ? phoneMedia.matches
          ? '/assets/images/startup-background-portrait.webp'
          : tabletMedia.matches
            ? '/assets/images/startup-background-tablet.webp'
            : entry.src
        : entry.src;
      const img = new Image();
      img.decoding = 'async';
      img.fetchPriority = 'high';
      img.src = src;
    };
    preload();
    if (pathname !== '/') return;
    phoneMedia.addEventListener('change', preload);
    tabletMedia.addEventListener('change', preload);
    return () => {
      phoneMedia.removeEventListener('change', preload);
      tabletMedia.removeEventListener('change', preload);
    };
  }, [entry.src, pathname]);

  return (
    <>
      <div
        key={entry.src}
        className="app-background"
        data-page={pathname === '/' ? 'home' : undefined}
        style={{
          backgroundImage: `url(${entry.src})`,
          ['--bg-pos' as any]: entry.position,
        }}
      />
      <div className="app-background-overlay" />
    </>
  );
}
