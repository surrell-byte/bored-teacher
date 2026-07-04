'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

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

  useEffect(() => {
    [
      '/assets/images/welcome-page.webp',
      '/assets/images/start-playing-page.webp',
      '/assets/images/hub-bg-desktop.webp',
      '/assets/images/games-bg-desktop.webp',
      '/assets/images/leaderboard-bg-desktop.webp',
      '/assets/images/trophy-room-bg-desktop.webp',
      '/assets/images/shop-bg-desktop.webp',
      '/assets/images/resources-bg-desktop.webp',
      '/assets/images/logo.png',
    ].forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  let bg = '/assets/images/start-playing-page.webp';

  if (pathname === '/') {
    bg = splashStage === 'start-playing'
      ? '/assets/images/start-playing-page.webp'
      : '/assets/images/welcome-page.webp';
  } else if (pathname === '/auth') {
    bg = '/assets/images/welcome-page.webp';
  } else if (pathname.startsWith('/hub')) {
    bg = '/assets/images/hub-bg-desktop.webp';
  } else if (pathname === '/games' || pathname.startsWith('/games/')) {
    bg = '/assets/images/games-bg-desktop.webp';
  } else if (pathname.startsWith('/leaderboard')) {
    bg = '/assets/images/leaderboard-bg-desktop.webp';
  } else if (pathname.startsWith('/trophy')) {
    bg = '/assets/images/trophy-room-bg-desktop.webp';
  } else if (pathname.startsWith('/payment')) {
    bg = '/assets/images/shop-bg-desktop.webp';
  } else if (pathname.startsWith('/resources')) {
    bg = '/assets/images/resources-bg-desktop.webp';
  }

  return (
    <>
      <div className="app-background" style={{ backgroundImage: `url(${bg})` }} />
      <div className="app-background-overlay" />
    </>
  );
}
