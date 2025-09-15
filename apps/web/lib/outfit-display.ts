import type { TOutfitPreset } from '@seven-day-fit/types';

/**
 * Human-friendly label and icon for a given outfit preset.
 */
export type TOutfitVisual = {
  /** Emoji or short icon representation */
  icon: string;
  /** Human-friendly text label */
  label: string;
};

/**
 * Lookup of outfit preset → visual (icon + label).
 */
export const visualForPresetMap = new Map<TOutfitPreset, TOutfitVisual>([
  ['EXTREME_COLD_FULL', { icon: '🥶', label: 'extreme cold bundle' }],
  ['VERY_COLD_LAYERED', { icon: '🧥🧣', label: 'heavy layers' }],
  ['COLD_JACKET', { icon: '🧥', label: 'jacket' }],
  ['COOL_LIGHT_LAYER', { icon: '🧥', label: 'light layer' }],
  ['MILD_CASUAL', { icon: '👕', label: 'casual' }],
  ['WARM_SHORT_SLEEVE', { icon: '☀️👕', label: 'short sleeve' }],
  ['HOT_ULTRALIGHT', { icon: '☀️🩳', label: 'ultralight' }],
  ['RAIN_COOL', { icon: '🌧️🧥', label: 'rain shell + layer' }],
  ['RAIN_WARM', { icon: '🌧️', label: 'rain shell' }],
  ['SNOW_GEAR', { icon: '❄️🧥', label: 'snow gear' }],
  ['WIND_LAYER_ADDON', { icon: '💨', label: 'wind layer' }],
]);

/**
 * Map an array of presets into visuals; preserves order.
 */
export const visualsForPresets = ({
  presets,
}: {
  /** Presets to convert into visuals */
  presets: TOutfitPreset[];
}): TOutfitVisual[] =>
  presets.map((p) => visualForPresetMap.get(p) ?? { icon: '👕', label: 'unknown' });
