'use client';

import { DayCard } from '@/components/DayCard';
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
  const [candidates, setCandidates] = useState<Array<{
    displayName: string;
    lat: number;
    lon: number;
    confidence: number;
  }> | null>(null);
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
          candidates?: Array<{ displayName: string; lat: number; lon: number; confidence: number }>;
          accepted?: boolean;
          message?: string;
        };
        if (!data.location) {
          setCandidates(data.candidates ?? []);
          showToast(`We couldn't resolve that description. Try a clearer place name.`);
          setLoading(false);
          return;
        }
        setLocationLabel(data.location.displayName);
        setConfidence(data.location.confidence ?? null);
        setCandidates(data.candidates ?? null);

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
    <main className='mx-auto flex min-h-screen max-w-3xl flex-col gap-8 p-6'>
      <div className='mx-auto mt-16 w-full max-w-xl text-center'>
        <h1 className='mb-2 text-3xl font-semibold'>Seven Day Fit</h1>
        <p className='text-sm text-muted-foreground'>
          Describe a place and we'll dress you for the week.
        </p>
      </div>

      <SearchBar onSubmit={handleSearch} />

      {loading ? (
        <StatusBanner
          indicator={step >= 2 ? 'check' : 'spinner'}
          message={
            step === 0
              ? 'Decoding your clue…'
              : step === 1
                ? 'Fetching forecast…'
                : 'Forecast ready'
          }
          tone='muted'
        />
      ) : null}
      {toast ? (
        <div className='pointer-events-none fixed left-1/2 top-4 z-50 -translate-x-1/2 transform'>
          <div className='pointer-events-auto rounded-md border border-neutral-700 bg-neutral-900 px-4 py-2 text-sm text-neutral-100 shadow-lg'>
            {toast}
          </div>
        </div>
      ) : null}
      {locationLabel ? (
        <div className='mx-auto max-w-xl text-center text-sm text-muted-foreground'>
          We guessed {locationLabel}
          {confidence != null ? ` (confidence ${(confidence * 100).toFixed(0)}%)` : ''}.
        </div>
      ) : null}
      {candidates && confidence != null && confidence < 0.6 ? (
        <div className='mx-auto max-w-xl text-center text-xs text-muted-foreground'>
          Not sure? Did you mean:
          <div className='mt-2 flex flex-wrap justify-center gap-2'>
            {candidates.map((c) => (
              <button
                type='button'
                key={`${c.displayName}-${c.lat}-${c.lon}`}
                className='rounded-full border px-2 py-0.5'
                onClick={async () => {
                  setLocationLabel(c.displayName);
                  setConfidence(c.confidence);
                  setStep(1);
                  const forecastRes = await fetch('/api/forecast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lat: c.lat, lon: c.lon }),
                  });
                  if (!forecastRes.ok) {
                    let message = 'Failed to fetch forecast';
                    try {
                      const errJson = (await forecastRes.json()) as { error?: string };
                      if (errJson?.error) message = errJson.error;
                    } catch {}
                    showToast(message);
                    return;
                  }
                  const { days: forecastDays } = (await forecastRes.json()) as {
                    days: TDayWeather[];
                  };
                  setDays(forecastDays);
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
                }}
              >
                {c.displayName} ({(c.confidence * 100).toFixed(0)}%)
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {/* no-results notice handled by toast */}
      {outfits && days ? (
        <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3'>
          {outfits.map((d) => (
            <DayCard key={d.dateISO} day={d} outfit={d.outfit as any} notes={d.notes} />
          ))}
        </div>
      ) : null}
    </main>
  );
}
