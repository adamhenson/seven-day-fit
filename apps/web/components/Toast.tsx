'use client';

import { useEffect } from 'react';
import type { ReactElement } from 'react';

/**
 * React component to show a transient, accessible toast message fixed at top-center.
 */
export const Toast = ({
  message,
  durationMs = 3500,
  onClose,
}: {
  /** Toast message to display. If null, nothing is rendered */
  message: string | null;
  /** Auto-dismiss duration in milliseconds */
  durationMs?: number;
  /** Callback invoked when toast auto-dismisses */
  onClose?: () => void;
}): ReactElement | null => {
  useEffect(() => {
    if (!message) return;
    const id = window.setTimeout(() => {
      onClose?.();
    }, durationMs);
    return () => window.clearTimeout(id);
  }, [message, durationMs, onClose]);

  if (!message) return null;

  return (
    <div
      className='pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 transform'
      aria-live='polite'
    >
      <div className='pointer-events-auto rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-100 shadow-lg'>
        {message}
      </div>
    </div>
  );
};
