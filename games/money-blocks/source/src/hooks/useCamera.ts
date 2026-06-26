import { RefObject, useCallback } from 'react';

/**
 * Returns a function that captures the current bounding rect of the given
 * element ref. Used by the Block reveal animation to anchor its flip overlay
 * to the clicked tile's on-screen position before it animates to center.
 */
export function useCamera<T extends HTMLElement>(ref: RefObject<T>) {
  const captureRect = useCallback((): DOMRect | null => {
    return ref.current ? ref.current.getBoundingClientRect() : null;
  }, [ref]);

  return { captureRect };
}

