type AnalyticsEvent =
  | { name: 'game_started'; theme: string }
  | { name: 'block_revealed'; blockType: string; player: 1 | 2 }
  | { name: 'game_ended'; reason: 'goal' | 'board-empty'; winner: string | null };

/**
 * Minimal analytics sink. Replace the body of `track` with a real provider
 * call (e.g. a fetch to an analytics endpoint) when one is available.
 */
export function track(event: AnalyticsEvent): void {
  if (import.meta.env?.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event);
  }
}

