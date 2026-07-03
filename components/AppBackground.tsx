'use client';

import { usePathname } from 'next/navigation';

export default function AppBackground() {
  const pathname = usePathname();
  let bg = '/assets/images/start-playing-page.webp';

  if (pathname === '/') {
    bg = '/assets/images/welcome-page.webp';
  } else if (pathname === '/auth') {
    bg = '/assets/images/auth-screen.png';
  }

  return (
    <>
      <div
        className="app-background"
        style={{ backgroundImage: `url(${bg})` }}
      />
      <div className="app-background-overlay" />
    </>
  );
}
