#!/usr/bin/env bash
# Replaces the old comment-only breakpoints block in app/globals.css with
# real CSS custom properties: --bp-* tokens (mirroring config/breakpoints.ts),
# a fluid spacing/type scale, and a [data-presentation="true"] override block
# for classroom smartboards/TVs.
#
# This is additive — it doesn't touch any of your existing ~23 per-component
# media queries. Those keep working exactly as they do now. Components can
# migrate to the new --space-*/--text-* tokens incrementally.
#
# Usage: run from the repo root (bored-teacher-react/)
#   chmod +x apply-responsive-foundation.sh
#   ./apply-responsive-foundation.sh

set -euo pipefail

CSS_FILE="app/globals.css"
ANCHOR_START="/* Breakpoints (common set) --------------------------------------------------"
OLD_BLOCK="/* Breakpoints (common set) --------------------------------------------------
   0–479px  : small phones
   480–767px: large phones
   768–1023px: tablets
   1024–1279px: small laptops
   1280–1535px: desktop
   1536px+  : large desktop
   Use these in media queries: (max-width:767px), (min-width:768px) and (max-width:1023px), (min-width:1024px)
*/"

if grep -qF "bp-tv" "$CSS_FILE"; then
  echo "Breakpoint tokens already present in $CSS_FILE — skipping CSS patch."
elif grep -qF "$ANCHOR_START" "$CSS_FILE"; then
  NEW_BLOCK=$(cat <<'CSSEOF'
/* Breakpoints ------------------------------------------------------------
   Single source of truth — mirrors config/breakpoints.ts. If you change a
   value here, change it there too (CSS can't import from TS without a
   build step in this project).

   mobile         0–639     phones
   tablet         640–1023  tablets, small laptops in portrait
   desktop        1024–1535 laptops, standard monitors
   large-desktop  1536–2559 big monitors, wide displays
   tv             2560+     ultrawide monitors, classroom smartboards/TVs

   Custom properties can't be read inside @media conditions, so use the
   literal px values in media queries themselves:
   (min-width: 640px), (min-width: 1024px), (min-width: 1536px), (min-width: 2560px)
*/
:root {
  --bp-tablet: 640px;
  --bp-desktop: 1024px;
  --bp-large-desktop: 1536px;
  --bp-tv: 2560px;

  /* Fluid spacing/type scale — grows smoothly across the whole range
     instead of jumping at breakpoints. Prefer these over hardcoded px so
     the app scales as one system; existing per-component media queries
     keep working untouched while you migrate incrementally. */
  --space-xs:  clamp(4px, 0.3vw, 8px);
  --space-sm:  clamp(8px, 0.6vw, 14px);
  --space-md:  clamp(12px, 1vw, 20px);
  --space-lg:  clamp(20px, 1.6vw, 36px);
  --space-xl:  clamp(32px, 2.4vw, 56px);

  --text-sm:   clamp(0.8rem, 0.75rem + 0.2vw, 0.95rem);
  --text-base: clamp(1rem, 0.95rem + 0.25vw, 1.15rem);
  --text-lg:   clamp(1.15rem, 1.05rem + 0.5vw, 1.5rem);
  --text-xl:   clamp(1.5rem, 1.3rem + 1vw, 2.25rem);
  --text-2xl:  clamp(2rem, 1.6rem + 2vw, 3.5rem);

  --tap-target-min: 44px; /* WCAG minimum; presentation mode raises this */
}

/* Presentation mode — manual override for smartboards/TVs, toggled by a
   teacher via useResponsive().setPresentationMode(true). Width alone can't
   detect "this is a smartboard": most run at ordinary 1080p/4K, same as a
   desktop monitor, just viewed from across a classroom. Everything below
   scales up for that viewing distance when this attribute is set. */
[data-presentation="true"] {
  --space-xs:  clamp(8px, 0.5vw, 14px);
  --space-sm:  clamp(14px, 1vw, 22px);
  --space-md:  clamp(20px, 1.6vw, 32px);
  --space-lg:  clamp(32px, 2.4vw, 56px);
  --space-xl:  clamp(48px, 3.5vw, 84px);

  --text-sm:   clamp(1.1rem, 1rem + 0.3vw, 1.3rem);
  --text-base: clamp(1.4rem, 1.2rem + 0.6vw, 1.75rem);
  --text-lg:   clamp(1.75rem, 1.5rem + 1vw, 2.4rem);
  --text-xl:   clamp(2.25rem, 1.8rem + 1.8vw, 3.5rem);
  --text-2xl:  clamp(3rem, 2.2rem + 3vw, 5rem);

  --tap-target-min: 64px;
}
CSSEOF
)
  python3 - "$CSS_FILE" "$NEW_BLOCK" <<'PYEOF'
import sys, pathlib
css_file, new_block = sys.argv[1], sys.argv[2]
old_block = """/* Breakpoints (common set) --------------------------------------------------
   0\u2013479px  : small phones
   480\u2013767px: large phones
   768\u20131023px: tablets
   1024\u20131279px: small laptops
   1280\u20131535px: desktop
   1536px+  : large desktop
   Use these in media queries: (max-width:767px), (min-width:768px) and (max-width:1023px), (min-width:1024px)
*/"""
path = pathlib.Path(css_file)
text = path.read_text()
assert text.count(old_block) == 1, f"expected exactly 1 match, found {text.count(old_block)}"
path.write_text(text.replace(old_block, new_block, 1))
print(f"Patched {css_file}")
PYEOF
else
  echo "Couldn't find the expected breakpoints comment block in $CSS_FILE."
  echo "It may have already been edited — check manually before re-running."
  exit 1
fi

mkdir -p config hooks

if [ -s "config/breakpoints.ts" ]; then
  echo "config/breakpoints.ts already has content — not overwriting. Check it manually."
else
  cat > config/breakpoints.ts <<'TSEOF'
// config/breakpoints.ts
// Single source of truth for responsive tiers, consumed by
// hooks/useResponsive.ts. Mirrors the --bp-* custom properties defined in
// app/globals.css — if you change a value here, change it there too (CSS
// can't import from TS without a build step in this project).
//
// Tiers (min-width, mobile-first):
//   mobile         0–639     phones
//   tablet         640–1023  tablets, small laptops in portrait
//   desktop        1024–1535 laptops, standard monitors
//   largeDesktop   1536–2559 big monitors, wide displays
//   tv             2560+     ultrawide monitors, classroom smartboards/TVs
//
// Width alone can't tell a smartboard from an ordinary 1080p monitor —
// most smartboards render at normal resolutions, just viewed from across a
// room. For that, pair this with `presentationMode` in useResponsive,
// which a teacher toggles manually.

export const BREAKPOINTS = {
  tablet: 640,
  desktop: 1024,
  largeDesktop: 1536,
  tv: 2560,
} as const;

export type BreakpointTier = 'mobile' | 'tablet' | 'desktop' | 'largeDesktop' | 'tv';

export function getTier(width: number): BreakpointTier {
  if (width >= BREAKPOINTS.tv) return 'tv';
  if (width >= BREAKPOINTS.largeDesktop) return 'largeDesktop';
  if (width >= BREAKPOINTS.desktop) return 'desktop';
  if (width >= BREAKPOINTS.tablet) return 'tablet';
  return 'mobile';
}
TSEOF
  echo "Wrote config/breakpoints.ts"
fi

if [ -s "hooks/useResponsive.ts" ]; then
  echo "hooks/useResponsive.ts already has content — not overwriting. Check it manually."
else
  cat > hooks/useResponsive.ts <<'TSEOF'
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
TSEOF
  echo "Wrote hooks/useResponsive.ts"
fi

echo
echo "Done. Foundation in place:"
echo "  config/breakpoints.ts       — tier definitions"
echo "  hooks/useResponsive.ts      — tier/touch/presentation-mode hook"
echo "  app/globals.css             — --bp-*/--space-*/--text-* tokens + presentation mode"
echo
echo "Nothing in your existing UI consumes these yet — run 'npm run build' to"
echo "confirm nothing broke, then we can wire up Navbar/AppShell next."
