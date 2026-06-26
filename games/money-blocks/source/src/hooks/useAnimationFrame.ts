import { useEffect, useRef } from 'react';

/** Runs `callback(deltaMs)` on every animation frame while `active` is true. */
export function useAnimationFrame(callback: (deltaMs: number) => void, active = true): void {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  const frameRef = useRef<number>();
  const lastTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) return;

    const loop = (time: number) => {
      if (lastTimeRef.current != null) {
        callbackRef.current(time - lastTimeRef.current);
      }
      lastTimeRef.current = time;
      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      lastTimeRef.current = null;
    };
  }, [active]);
}

