import { z } from 'zod';
import { LlmCandidate, ResolvedLocation } from './location';
import { DayWeather } from './weather';

/**
 * Display-friendly candidate object used by the API for caching/transport.
 */
export const CandidateDisplay = z.object({
  displayName: z.string(),
  lat: z.number(),
  lon: z.number(),
  confidence: z.number(),
});
export type TCandidateDisplay = z.infer<typeof CandidateDisplay>;

/**
 * Success response for POST /api/resolve
 */
export const ResolveLocationSuccess = z.object({
  location: ResolvedLocation,
  accepted: z.boolean(),
  candidate: z.object({
    displayName: z.string(),
    lat: z.number(),
    lon: z.number(),
    confidence: z.number(),
  }),
  advice: LlmCandidate.shape.advice,
  locationParts: z
    .object({
      name: z.string().nullable().optional(),
      admin1: z.string().nullable().optional(),
      country: z.string().nullable().optional(),
    })
    .optional(),
});

export type TResolveLocationSuccess = z.infer<typeof ResolveLocationSuccess>;

/**
 * Success response for POST /api/forecast
 */
export const ForecastSuccess = z.object({
  days: z.array(DayWeather),
});

export type TForecastSuccess = z.infer<typeof ForecastSuccess>;
