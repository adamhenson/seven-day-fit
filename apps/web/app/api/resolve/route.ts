import { generateLocationCandidates } from '@/lib/location-candidates';
import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '../../../lib/cache';

/**
 * Prefer the Edge runtime for lower-latency location resolution.
 */
export const runtime = 'edge';

/**
 * Resolve a free-text clue into a primary location and candidate list.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { input?: string };
    const input = (body.input || '').trim();
    if (!input) return NextResponse.json({ error: 'input required' }, { status: 400 });

    const cacheKey = `resolve:${input.toLowerCase()}`;
    let candidates = cacheGet<
      { displayName: string; lat: number; lon: number; confidence: number }[]
    >({ key: cacheKey, ttlMs: 60 * 60 * 1000 });

    if (!candidates) {
      let llm: any[] = [];
      try {
        llm = await generateLocationCandidates({ input });
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message, accepted: false }, { status: 400 });
      }
      candidates = (llm || [])
        .map((c) => ({
          displayName: [c.name, c.admin1 ?? undefined, c.country ?? undefined]
            .filter(Boolean)
            .join(', '),
          lat: c.lat,
          lon: c.lon,
          confidence: c.confidence ?? 0.7,
        }))
        .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lon));
      cacheSet({ key: cacheKey, value: candidates });
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ accepted: false, candidates: [], message: 'no candidates' });
    }

    const sorted = candidates.sort(
      (a: { confidence: number }, b: { confidence: number }) => b.confidence - a.confidence
    );
    const best = sorted[0];

    if (!best) {
      return NextResponse.json({ accepted: false, candidates: [], message: 'no candidates' });
    }
    const accepted = best.confidence >= 0.6;

    return NextResponse.json({
      location: {
        displayName: best.displayName,
        lat: best.lat,
        lon: best.lon,
        country: (best as any).country ?? '',
        admin1: (best as any).admin1,
        placeType: (best as any).placeType,
        confidence: best.confidence,
      },
      accepted,
      candidates: candidates.slice(0, 3),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
