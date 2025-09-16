'use client';

import { HeightTransition } from '@/components/HeightTransition';
import { StatusBanner } from '@/components/StatusBanner';
import type { TDayWeather } from '@seven-day-fit/types';
import type { ReactElement } from 'react';

/**
 * React component that renders a single animated status banner, switching
 * between loading states and the final confidence/advice message.
 */
export const ResultStatus = ({
  advice,
  confidence,
  days,
  loading,
  locationLabel,
  step,
}: {
  /** Optional advice string from the LLM */
  advice: string | null;

  /** Confidence value 0..1 for the selected location */
  confidence: number | null;

  /** Fetched days; used to gate when final message is shown */
  days: TDayWeather[] | null;

  /** Loading flag for resolve/forecast flow */
  loading: boolean;

  /** Human display label for the selected location */
  locationLabel: string | null;

  /** Current step index (0..3) */
  step: 0 | 1 | 2 | 3;
}): ReactElement => {
  const banner = loading
    ? {
        indicator: (step >= 2 ? 'check' : 'spinner') as 'check' | 'spinner' | 'warn',
        message: step === 0 ? 'Resolving location...' : 'Fetching forecast...',
      }
    : locationLabel && typeof confidence === 'number' && days
      ? {
          indicator: (confidence >= 0.7 ? 'check' : 'warn') as 'check' | 'spinner' | 'warn',
          message: `Confidence ${(confidence * 100).toFixed(0)}%.${
            confidence < 0.7 && advice ? ` ${advice}` : ''
          }`,
        }
      : null;

  return (
    <HeightTransition show={!!banner}>
      {banner ? (
        <StatusBanner indicator={banner.indicator} message={banner.message} tone='muted' />
      ) : null}
    </HeightTransition>
  );
};
