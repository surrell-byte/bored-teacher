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
