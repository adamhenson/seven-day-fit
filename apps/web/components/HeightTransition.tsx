'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

/**
 * Simple height transition wrapper. Animates between 0 and content height
 * when `show` toggles or when children size changes.
 */
export const HeightTransition = ({
  children,
  show,
  durationMs = 250,
}: {
  /** Content to animate */
  children: ReactNode;

  /** Whether the content is visible */
  show: boolean;

  /** Transition duration in milliseconds */
  durationMs?: number;
}): ReactElement => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState<number>(0);

  // Measure immediately when visibility changes
  useLayoutEffect(() => {
    if (!show) {
      setHeight(0);
      return;
    }
    const node = contentRef.current;
    setHeight(node ? node.offsetHeight : 0);
  }, [show]);

  // Track content size changes while visible
  useEffect(() => {
    if (!show) return;
    const node = contentRef.current;
    if (!node || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => {
      setHeight(node.offsetHeight);
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, [show]);

  return (
    <div
      ref={containerRef}
      style={{ height, transition: `height ${durationMs}ms ease` }}
      className='overflow-hidden'
      aria-live='polite'
    >
      <div ref={contentRef}>{show ? children : null}</div>
    </div>
  );
};
