import { z } from 'zod';
import { ResolvedLocation } from './location';
import { DayWeather } from './weather';

/**
 * Discrete outfit presets used by the recommender.
 */
export const OutfitPreset = z.enum([
  'EXTREME_COLD_FULL',
  'VERY_COLD_LAYERED',
  'COLD_JACKET',
  'COOL_LIGHT_LAYER',
  'MILD_CASUAL',
  'WARM_SHORT_SLEEVE',
  'HOT_ULTRALIGHT',
  'RAIN_COOL',
  'RAIN_WARM',
  'SNOW_GEAR',
  'WIND_LAYER_ADDON',
]);

/** Type of `OutfitPreset`. */
export type TOutfitPreset = z.infer<typeof OutfitPreset>;

/**
 * Outfit recommendation with any human-readable notes.
 */
export const DayRecommendation = z.object({
  outfit: z.array(OutfitPreset),
  notes: z.array(z.string()),
});

/**
 * Combined location and per-day outfit recommendations.
 */
export const WeeklyOutfits = z.object({
  location: ResolvedLocation,
  days: z.array(DayWeather.merge(DayRecommendation)),
});

/** Type of `WeeklyOutfits`. */
export type TWeeklyOutfits = z.infer<typeof WeeklyOutfits>;
