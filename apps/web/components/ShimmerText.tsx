'use client';

import type { ReactElement } from 'react';

/**
 * React component that renders per-character shimmer with staggered delays.
 */
export const ShimmerText = ({
  text,
  className,
}: {
  /** String to render with per-character shimmer */
  text: string;
  /** Optional additional class names for the outer wrapper */
  className?: string;
}): ReactElement => {
  return (
    <span className={`inline-flex gap-[0.02em] ${className ?? ''}`} aria-label={text}>
      <span className='sr-only'>{text}</span>
      {[...text].map((ch, i) => (
        <span
          aria-hidden='true'
          key={`${ch}-${i}-${text.length}`}
          style={{ ['--i' as any]: i }}
          className={[
            'bg-clip-text text-transparent',
            'bg-[linear-gradient(90deg,transparent,white,transparent)]',
            'bg-[length:200%_100%]',
            'animate-char',
            '[animation-delay:calc(var(--i)*80ms)]',
            'motion-reduce:animate-none',
            'will-change-[background-position] inline-block',
          ].join(' ')}
        >
          {ch}
        </span>
      ))}
    </span>
  );
};
