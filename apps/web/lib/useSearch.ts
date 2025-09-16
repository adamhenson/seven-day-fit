'use client';

import type {
  TDayWeather,
  TForecastSuccess,
  TResolveLocationSuccess,
  TWeeklyOutfits,
} from '@seven-day-fit/types';
import { create } from 'zustand';
import { mapWeeklyOutfits } from './outfit';

/**
 * Global search state for the Home page. Holds the flow step, loading state,
 * selected location label + confidence, weekly days and outfits, and a toast.
 */
type TSearchState = {
  advice: string | null;
  confidence: number | null;
  days: TDayWeather[] | null;
  loading: boolean;
  locationLabel: string | null;
  outfits: TWeeklyOutfits['days'] | null;
  step: 0 | 1 | 2 | 3;
  toast: string | null;
};

/**
 * Search actions.
 */
type TSearchActions = {
  setToast: (msg: string | null) => void;
  runSearch: (input: string) => Promise<void>;
  reset: () => void;
};

/**
 * Zustand store for the search flow. Encapsulates the async pipeline:
 *  - resolve-location → forecast → map outfits, with coarse step markers (0..3)
 *  - exposes a single `runSearch` action and helpers for toast + reset
 */
export const useSearch = create<TSearchState & TSearchActions>((set) => ({
  advice: null,
  confidence: null,
  days: null,
  loading: false,
  locationLabel: null,
  outfits: null,
  step: 0,
  toast: null,

  /**
   * Set or clear the toast message.
   */
  setToast: (msg) => set({ toast: msg }),

  /**
   * Reset volatile state back to an idle baseline.
   */
  reset: () =>
    set({
      advice: null,
      confidence: null,
      days: null,
      outfits: null,
      locationLabel: null,
      step: 0,
    }),

  /**
   * Execute the end-to-end search flow.
   *
   * Params:
   *  - input: free-text description to resolve into a location candidate
   */
  runSearch: async (input: string) => {
    if (!input.trim()) return;
    set({ loading: true, step: 0, advice: null, locationLabel: null, days: null, outfits: null });
    try {
      // Resolve
      set({ step: 0 });
      const resolveRes = await fetch('/api/resolve-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
      if (!resolveRes.ok) throw new Error('Failed to resolve location');
      const data = (await resolveRes.json()) as Partial<TResolveLocationSuccess> & {
        error?: string;
        message?: string;
      };
      if (!data.location) {
        const msg = !data.advice ? 'Try a clearer place name.' : data.advice;
        set({ toast: `We couldn't resolve that description. ${msg}` });
        set({ loading: false });
        return;
      }
      set({
        locationLabel: data.location.displayName,
        confidence: data.location.confidence ?? null,
        advice: data.advice ?? null,
      });

      // Forecast
      set({ step: 1 });
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
        set({ toast: message, loading: false });
        return;
      }
      const { days } = (await forecastRes.json()) as TForecastSuccess;
      set({ days });

      // Map outfits
      set({ step: 2 });
      const mapped = mapWeeklyOutfits({ days }).map((o, idx): TWeeklyOutfits['days'][number] => ({
        dateISO: days[idx]!.dateISO,
        high: days[idx]!.high,
        low: days[idx]!.low,
        feelsLikeHigh: days[idx]!.feelsLikeHigh,
        precipType: days[idx]!.precipType,
        pop: days[idx]!.pop,
        wind: days[idx]!.wind,
        maxGust: days[idx]!.maxGust,
        uvIndex: days[idx]!.uvIndex,
        summary: days[idx]!.summary,
        outfit: o.outfit,
        notes: o.notes,
      }));
      set({ outfits: mapped, step: 3 });
    } catch (e) {
      set({ toast: (e as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));
