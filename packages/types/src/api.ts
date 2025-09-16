import { z } from 'zod';
import { LlmCandidate, ResolvedLocation } from './location';
import { DayWeather } from './weather';

/**
 * Success response for POST /api/resolve
 */
export const ResolveSuccess = z.object({
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

export type TResolveSuccess = z.infer<typeof ResolveSuccess>;

/**
 * Success response for POST /api/forecast
 */
export const ForecastSuccess = z.object({
  days: z.array(DayWeather),
});

export type TForecastSuccess = z.infer<typeof ForecastSuccess>;
