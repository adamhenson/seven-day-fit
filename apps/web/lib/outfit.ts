import type { OutfitPreset, TDayWeather } from '@seven-day-fit/types';

/**
 * Map a single day's weather to outfit presets and notes.
 */
export const outfitForDay = ({
  day,
}: {
  /** Normalized daily weather values */
  day: TDayWeather;
}): { outfit: Array<typeof OutfitPreset._type>; notes: string[] } => {
  const feelsLikeHigh = day.feelsLikeHigh ?? day.high;
  const temperature = Math.round(feelsLikeHigh);
  const isWindy = (day.maxGust ?? 0) >= 30 || (day.wind ?? 0) >= 20;
  const isRainy = day.precipType === 'rain' && (day.pop ?? 0) >= 0.4;
  const isSnowy = day.precipType === 'snow';
  const isUvHigh = (day.uvIndex ?? 0) >= 7;

  if (isSnowy) {
    return { outfit: ['SNOW_GEAR'], notes: [] };
  }

  if (isRainy) {
    return {
      outfit: [feelsLikeHigh <= 64 ? 'RAIN_COOL' : 'RAIN_WARM'],
      notes: isWindy ? ['Add wind shell'] : [],
    };
  }

  let base: typeof OutfitPreset._type;
  if (temperature <= 10) base = 'EXTREME_COLD_FULL';
  else if (temperature <= 29) base = 'VERY_COLD_LAYERED';
  else if (temperature <= 49) base = 'COLD_JACKET';
  else if (temperature <= 64) base = 'COOL_LIGHT_LAYER';
  else if (temperature <= 79) base = 'MILD_CASUAL';
  else if (temperature <= 90) base = 'WARM_SHORT_SLEEVE';
  else base = 'HOT_ULTRALIGHT';

  const outfit = (isWindy ? [base, 'WIND_LAYER_ADDON'] : [base]) as Array<
    typeof OutfitPreset._type
  >;
  const notes = [
    ...(isUvHigh ? ['Hat & SPF'] : []),
    ...(day.low !== undefined && day.low < 58 && base === 'MILD_CASUAL'
      ? ['Light layer AM/PM']
      : []),
  ];

  return { outfit, notes };
};

/**
 * Convert Open-Meteo daily arrays into normalized day objects.
 */
export const normalizeOpenMeteo = ({
  daily,
}: {
  /** Open-Meteo daily payload */
  daily: {
    time: string[];
    temperature_2m_max: Array<number | null>;
    temperature_2m_min: Array<number | null>;
    apparent_temperature_max?: Array<number | null>;
    precipitation_probability_max?: Array<number | null>;
    windspeed_10m_max?: Array<number | null>;
    wind_gusts_10m_max?: Array<number | null>;
    uv_index_max?: Array<number | null>;
    snowfall_sum?: Array<number | null>;
    precipitation_sum?: Array<number | null>;
    weathercode?: Array<number | null>;
  };
}): TDayWeather[] => {
  const days: TDayWeather[] = [];
  for (let i = 0; i < daily.time.length; i += 1) {
    const dateISO = String(daily.time[i]);
    const high = Number(daily['temperature_2m_max'][i]);
    const low = Number(daily['temperature_2m_min'][i]);
    const feelsLikeHigh = (daily['apparent_temperature_max']?.[i] ?? null) as number | null;
    const popPct = (daily['precipitation_probability_max']?.[i] ?? null) as number | null;
    const wind = (daily['windspeed_10m_max']?.[i] ?? null) as number | null;
    const maxGust = (daily['wind_gusts_10m_max']?.[i] ?? null) as number | null;
    const uvIndex = (daily['uv_index_max']?.[i] ?? null) as number | null;
    const weatherCode = (daily['weathercode']?.[i] ?? null) as number | null;
    const snowfall = (daily['snowfall_sum']?.[i] ?? 0) as number | null;
    const precipSum = (daily['precipitation_sum']?.[i] ?? 0) as number | null;

    const pop = popPct == null ? undefined : Math.max(0, Math.min(1, popPct / 100));
    const precipType = snowfall && snowfall > 0 ? 'snow' : (precipSum ?? 0) > 0 ? 'rain' : 'none';

    days.push({
      dateISO,
      high,
      low,
      feelsLikeHigh: feelsLikeHigh ?? undefined,
      precipType: precipType === 'none' ? undefined : precipType,
      pop,
      wind: wind ?? undefined,
      maxGust: maxGust ?? undefined,
      uvIndex: uvIndex ?? undefined,
      summary: weatherCodeToSummary(weatherCode ?? undefined),
    });
  }
  return days;
};

/**
 * Map Open-Meteo WMO weather codes to a compact human summary.
 * @see {@link https://artefacts.ceda.ac.uk/badc_datadocs/surface/code.html | WMO weather codes}
 */
const weatherCodeToSummary = (code?: number): string | undefined => {
  if (typeof code !== 'number') return undefined;

  // Minimal set covering common conditions; extend as needed
  if (code === 0) return 'clear';
  if (code === 1 || code === 2) return 'mostly clear';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'foggy';
  if ([51, 53, 55].includes(code)) return 'drizzle';
  if ([56, 57].includes(code)) return 'freezing drizzle';
  if ([61, 63, 65].includes(code)) return 'rain';
  if ([66, 67].includes(code)) return 'freezing rain';
  if ([71, 73, 75].includes(code)) return 'snow';
  if (code === 77) return 'snow grains';
  if ([80, 81, 82].includes(code)) return 'showers';
  if ([85, 86].includes(code)) return 'snow showers';
  if ([95].includes(code)) return 'thunderstorm';
  if ([96, 99].includes(code)) return 'thunderstorm + hail';

  return undefined;
};

/**
 * Map a week of weather into outfits and notes for each day.
 */
export const mapWeeklyOutfits = ({
  days,
}: {
  /** Array of normalized daily weather values */
  days: TDayWeather[];
}): Array<{ outfit: Array<typeof OutfitPreset._type>; notes: string[] }> => {
  return days.map((d) => outfitForDay({ day: d }));
};
