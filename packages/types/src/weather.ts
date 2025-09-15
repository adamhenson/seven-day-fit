import { z } from 'zod';

/**
 * Normalized daily weather values from the forecast provider.
 */
export const DayWeather = z.object({
  dateISO: z.string(),
  high: z.number(),
  low: z.number(),
  feelsLikeHigh: z.number().optional(),
  precipType: z.enum(['none', 'rain', 'snow']).optional(),
  pop: z.number().min(0).max(1).optional(),
  wind: z.number().optional(),
  maxGust: z.number().optional(),
  uvIndex: z.number().optional(),
  summary: z.string().optional(),
});

/**
 * Array of normalized daily weather values for a week.
 */
export const WeeklyWeather = z.object({
  days: z.array(DayWeather),
});

/** Type of `DayWeather`. */
export type TDayWeather = z.infer<typeof DayWeather>;
/** Type of `WeeklyWeather`. */
export type TWeeklyWeather = z.infer<typeof WeeklyWeather>;
