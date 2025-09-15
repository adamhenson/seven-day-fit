'use client';

import { DayCard } from '@/components/DayCard';
import { HeightTransition } from '@/components/HeightTransition';
import { SearchBar } from '@/components/SearchBar';
import { StatusBanner } from '@/components/StatusBanner';
import { mapWeeklyOutfits } from '@/lib/outfit';
import type { TDayWeather, TWeeklyOutfits } from '@seven-day-fit/types';
import { useCallback, useState } from 'react';
import type { ReactElement } from 'react';

/**
 * React page component rendering the search UX and weekly results.
 */
export default function Home(): ReactElement {
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [loading, setLoading] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [days, setDays] = useState<TDayWeather[] | null>(null);
  const [outfits, setOutfits] = useState<TWeeklyOutfits['days'] | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  }, []);

  const handleSearch = useCallback(
    async (input: string) => {
      setLoading(true);
      setStep(0);
      setLocationLabel(null);
      setDays(null);
      setOutfits(null);

      try {
        // Step 0 → 1: resolve location
        setStep(0);
        const resolveRes = await fetch('/api/resolve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ input }),
        });
        if (!resolveRes.ok) throw new Error('Failed to resolve location');
        const data = (await resolveRes.json()) as {
          location?: { displayName: string; lat: number; lon: number; confidence?: number };
          candidate?: { displayName: string; lat: number; lon: number; confidence: number };
          accepted?: boolean;
          advice?: string;
          locationParts?: { name?: string | null; admin1?: string | null; country?: string | null };
          message?: string;
        };
        if (!data.location) {
          showToast(`We couldn't resolve that description. Try a clearer place name.`);
          setLoading(false);
          return;
        }
        setLocationLabel(data.location.displayName);
        setConfidence(data.location.confidence ?? null);
        setAdvice(typeof data.advice === 'string' ? data.advice : null);

        // Step 1 → 2: fetch forecast
        setStep(1);
        const forecastRes = await fetch('/api/forecast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: data.location.lat, lon: data.location.lon }),
        });
        if (!forecastRes.ok) {
          let message = 'Failed to fetch forecast';
          try {
            const errJson = (await forecastRes.json()) as { error?: string };
            if (errJson?.error) message = errJson.error;
          } catch {}
          showToast(message);
          setLoading(false);
          return;
        }
        const { days: forecastDays } = (await forecastRes.json()) as { days: TDayWeather[] };
        setDays(forecastDays);

        // Step 2 → 3: map outfits
        setStep(2);
        const mapped = mapWeeklyOutfits({ days: forecastDays }).map(
          (o, idx): TWeeklyOutfits['days'][number] => ({
            dateISO: forecastDays[idx]!.dateISO,
            high: forecastDays[idx]!.high,
            low: forecastDays[idx]!.low,
            feelsLikeHigh: forecastDays[idx]!.feelsLikeHigh,
            precipType: forecastDays[idx]!.precipType,
            pop: forecastDays[idx]!.pop,
            wind: forecastDays[idx]!.wind,
            maxGust: forecastDays[idx]!.maxGust,
            uvIndex: forecastDays[idx]!.uvIndex,
            summary: forecastDays[idx]!.summary,
            outfit: o.outfit as any,
            notes: o.notes,
          })
        );
        setOutfits(mapped);

        setStep(3);
      } catch (e) {
        showToast((e as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  return (
    <main className='mx-auto flex min-h-screen max-w-7xl flex-col gap-8 p-6'>
      <div className='mx-auto mt-16 w-full max-w-xl text-center'>
        <h1 className='mb-2 text-3xl font-semibold'>Seven Day Fit</h1>
        <p className='text-sm text-muted-foreground'>
          Describe a place and we'll dress you for the week.
        </p>
      </div>

      <SearchBar onSubmit={handleSearch} />

      <HeightTransition show={loading || (!!locationLabel && !!days)}>
        {loading ? (
          <StatusBanner
            indicator={step >= 2 ? 'check' : 'spinner'}
            message={step === 0 ? 'Resolving location...' : 'Fetching forecast...'}
            tone='muted'
          />
        ) : locationLabel && confidence != null && days ? (
          <StatusBanner
            indicator={confidence >= 0.7 ? 'check' : 'warn'}
            message={`Confidence ${(confidence * 100).toFixed(0)}%.${
              confidence < 0.7 && advice ? ` ${advice}` : ''
            }`}
            tone='muted'
          />
        ) : null}
      </HeightTransition>
      {toast ? (
        <div className='pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 transform'>
          <div className='pointer-events-auto rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-100 shadow-lg'>
            {toast}
          </div>
        </div>
      ) : null}
      {/* Final status banner is shown within HeightTransition after loading finishes */}

      {outfits && days && locationLabel ? (
        <h2 className='text-center text-xl text-muted-foreground'>{locationLabel}</h2>
      ) : null}

      {/* no-results notice handled by toast */}
      {outfits && days ? (
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7'>
          {outfits.map((d) => (
            <DayCard key={d.dateISO} day={d} outfit={d.outfit as any} notes={d.notes} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
