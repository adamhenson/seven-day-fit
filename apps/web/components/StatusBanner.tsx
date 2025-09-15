'use client';

import type { ReactElement } from 'react';

/**
 * React component that displays a left-aligned status indicator (spinner or check)
 * with accompanying message inside a compact, bordered banner. Designed to mirror
 * Cursor-like inline status UI and be reusable for future messaging.
 */
export const StatusBanner = ({
  indicator,
  message,
  tone,
}: {
  /** Visual indicator to render on the left */
  indicator: 'spinner' | 'check' | 'warn';

  /** Message text to display to the right of the indicator */
  message: string;

  /** Optional visual tone variant */
  tone?: 'default' | 'muted';
}): ReactElement => {
  const containerTone =
    tone === 'muted'
      ? 'border-neutral-300 bg-neutral-100 text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200'
      : 'border-neutral-300 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100';

  return (
    <div
      className={`mx-auto w-full max-w-xl rounded-md border px-3 py-2 text-sm shadow-sm ${containerTone}`}
      aria-live='polite'
      aria-atomic='true'
    >
      <div className='flex items-center gap-3'>
        <div className='flex h-4 w-4 items-center justify-center' aria-hidden='true'>
          {indicator === 'spinner' ? (
            // neutral spinner
            <svg
              className='h-4 w-4 animate-spin text-neutral-500'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
              focusable='false'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='3'
              />
              <path
                className='opacity-75'
                d='M22 12c0-5.523-4.477-10-10-10'
                stroke='currentColor'
                strokeWidth='3'
                strokeLinecap='round'
              />
            </svg>
          ) : indicator === 'check' ? (
            // grey/black check (not green)
            <svg
              className='h-4 w-4 text-neutral-700 dark:text-neutral-300'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
              focusable='false'
            >
              <path
                d='M5 12.5l4.5 4.5L19.5 7.5'
                stroke='currentColor'
                strokeWidth='2.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          ) : (
            // exclamation triangle in neutral tone
            <svg
              className='h-4 w-4 text-neutral-700 dark:text-neutral-300'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
              aria-hidden='true'
              focusable='false'
            >
              <path
                d='M12 3l9 16H3l9-16z'
                stroke='currentColor'
                strokeWidth='1.8'
                strokeLinejoin='round'
              />
              <path d='M12 9v5' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
              <circle cx='12' cy='16.5' r='0.9' fill='currentColor' />
            </svg>
          )}
        </div>
        <div className='flex-1 leading-5'>{message}</div>
      </div>
    </div>
  );
};
