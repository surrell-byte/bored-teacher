'use client';
// components/PageTransition.tsx
// Wraps every page in a fade+slide-up animation on route change.

import { usePathname } from 'next/navigation';
import { useEffect, useRef, ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);

  // Game pages use position:fixed for full-screen iframe — skip the
  // transform-based animation or it breaks the fixed stacking context.
  const isGamePage = pathname?.startsWith('/games/');
  const isRoot = pathname === '/';

  useEffect(() => {
    if (isGamePage || isRoot) return;
    const el = ref.current;
    if (!el) return;
    el.classList.remove('page-enter-active');
    // Force reflow so the animation restarts on every navigation
    void el.offsetWidth;
    el.classList.add('page-enter-active');
  }, [pathname, isGamePage]);

  if (isGamePage) {
    return <>{children}</>;
  }

  return (
    <div ref={ref} className="page-enter" style={{ minHeight: '100%' }}>
      {children}
    </div>
  );
}