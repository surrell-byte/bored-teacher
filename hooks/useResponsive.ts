'use client';
// hooks/useResponsive.ts

import { useEffect, useState, useCallback, useRef } from 'react';
import { getTier, type BreakpointTier } from '@/config/breakpoints';

const PRESENTATION_KEY = 'presentationMode';

export interface ResponsiveState {
  width: number;
  tier: BreakpointTier;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isTV: boolean;
  /** True for touchscreens — tablets AND touch-capable smartboards alike. */
  isTouch: boolean;
  /** Manual override for classroom smartboards/TVs. See breakpoints.ts. */
  presentationMode: boolean;
  setPresentationMode: (on: boolean) => void;
}

// SSR-safe default so server-rendered markup doesn't flash between a wrong
// guess and the real value on hydration — assume a normal desktop width.
const SSR_DEFAULT_WIDTH = 1280;

export function useResponsive(): ResponsiveState {
  const [width, setWidth] = useState<number>(
    typeof window === 'undefined' ? SSR_DEFAULT_WIDTH : window.innerWidth
  );
  const [isTouch, setIsTouch] = useState(false);
  const [presentationMode, setPresentationModeState] = useState(false);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    function handleResize() {
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => setWidth(window.innerWidth));
    }
    handleResize();
    window.addEventListener('resize', handleResize);

    const coarse = window.matchMedia('(pointer: coarse)');
    setIsTouch(coarse.matches);
    const handleCoarse = (e: MediaQueryListEvent) => setIsTouch(e.matches);
    coarse.addEventListener('change', handleCoarse);

    const stored = localStorage.getItem(PRESENTATION_KEY);
    if (stored === 'true') {
      setPresentationModeState(true);
      document.documentElement.setAttribute('data-presentation', 'true');
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      coarse.removeEventListener('change', handleCoarse);
      if (rafId.current !== null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  const setPresentationMode = useCallback((on: boolean) => {
    setPresentationModeState(on);
    localStorage.setItem(PRESENTATION_KEY, String(on));
    document.documentElement.setAttribute('data-presentation', String(on));
  }, []);

  const tier = getTier(width);

  return {
    width,
    tier,
    isMobile: tier === 'mobile',
    isTablet: tier === 'tablet',
    isDesktop: tier === 'desktop',
    isLargeDesktop: tier === 'largeDesktop',
    isTV: tier === 'tv',
    isTouch,
    presentationMode,
    setPresentationMode,
  };
}
