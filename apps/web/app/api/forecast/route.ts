import { normalizeOpenMeteo } from '@/lib/outfit';
import { NextResponse } from 'next/server';

/**
 * Prefer the Edge runtime for fast weather fetches.
 */
export const runtime = 'edge';

/**
 * Fetch 8 days, then return the 7 days starting tomorrow.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { lat?: unknown; lon?: unknown };
    const lat = typeof body.lat === 'number' ? body.lat : Number(body.lat);
    const lon = typeof body.lon === 'number' ? body.lon : Number(body.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return NextResponse.json({ error: 'lat and lon required' }, { status: 400 });
    }

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', String(lat));
    url.searchParams.set('longitude', String(lon));
    url.searchParams.set(
      'daily',
      [
        'temperature_2m_max',
        'temperature_2m_min',
        'apparent_temperature_max',
        'precipitation_probability_max',
        'precipitation_sum',
        'windspeed_10m_max',
        'wind_gusts_10m_max',
        'uv_index_max',
        'snowfall_sum',
        'weathercode',
      ].join(',')
    );
    url.searchParams.set('timezone', 'auto');
    url.searchParams.set('forecast_days', '8');
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('wind_speed_unit', 'mph');
    url.searchParams.set('precipitation_unit', 'inch');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ error: 'weather fetch failed' }, { status: 502 });
    type TOpenMeteoDaily = Parameters<typeof normalizeOpenMeteo>[0]['daily'];
    const json = (await res.json()) as { daily: TOpenMeteoDaily };
    const allDays = normalizeOpenMeteo({ daily: json.daily });

    // Prefer simple rule: drop today (index 0) and take next 7.
    const days = allDays.slice(1, 8);

    return NextResponse.json({ days });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
