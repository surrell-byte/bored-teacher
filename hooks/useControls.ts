'use client';

import { useEffect, useState } from 'react';

export function useControls(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkViewport = () => setIsMobile(window.innerWidth < breakpoint);

    checkViewport();
    window.addEventListener('resize', checkViewport);

    return () => window.removeEventListener('resize', checkViewport);
  }, [breakpoint]);

  return { isMobile };
}
