'use client';

import { useEffect, useState, type CSSProperties, type RefObject } from 'react';

export function useCoverArtStyle<T extends HTMLElement>(
  containerRef: RefObject<T | null>,
  desktopAspectRatio: number,
  mobileAspectRatio: number,
  enabled: boolean
): CSSProperties {
  const [artStyle, setArtStyle] = useState<CSSProperties>({});

  useEffect(() => {
    const container = containerRef.current;
    if (!enabled || !container) return undefined;

    function updateSize() {
      const currentContainer = containerRef.current;
      if (!currentContainer) return;
      const { width, height } = currentContainer.getBoundingClientRect();
      if (width <= 0 || height <= 0) return;

      const isPortraitPhone = window.matchMedia('(max-width: 760px) and (orientation: portrait)').matches;
      const aspectRatio = isPortraitPhone ? mobileAspectRatio : desktopAspectRatio;
      const widthInPixels = Math.max(width, height * aspectRatio);
      const heightInPixels = widthInPixels / aspectRatio;
      setArtStyle(previous => (
        previous.width === widthInPixels && previous.height === heightInPixels
          ? previous
          : { width: widthInPixels, height: heightInPixels }
      ));
    }

    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(updateSize);
    observer?.observe(container);
    window.addEventListener('resize', updateSize);
    updateSize();

    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', updateSize);
    };
  }, [containerRef, desktopAspectRatio, enabled, mobileAspectRatio]);

  return artStyle;
}
