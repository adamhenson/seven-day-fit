import { generateLocationCandidate } from '@/lib/location-candidate';
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
    type TCached = {
      candidates: { displayName: string; lat: number; lon: number; confidence: number }[];
      advice?: string;
      parts?: { name?: string | null; admin1?: string | null; country?: string | null };
    };
    const cached = cacheGet<TCached>({ key: cacheKey, ttlMs: 60 * 60 * 1000 });
    let candidates = cached?.candidates ?? null;
    let cachedAdvice: string | undefined = cached?.advice;
    let cachedParts: TCached['parts'] | undefined = cached?.parts;

    if (!candidates) {
      let llm: { candidate: any | null; advice?: string } = { candidate: null };
      const advice: string | undefined = undefined;
      try {
        llm = await generateLocationCandidate({ input });
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message, accepted: false }, { status: 400 });
      }
      const primary = llm?.candidate
        ? {
            displayName: [
              llm.candidate.name,
              llm.candidate.admin1 ?? undefined,
              llm.candidate.country ?? undefined,
            ]
              .filter(Boolean)
              .join(', '),
            lat: llm.candidate.lat,
            lon: llm.candidate.lon,
            confidence: llm.candidate.confidence ?? 0.7,
          }
        : null;
      const localAdvice =
        typeof llm?.advice === 'string' && llm.advice.trim() ? llm.advice.trim() : null;
      // Persist both candidates and advice (and raw parts) in cache so we can reuse advice on hits
      const sanitize = (v?: string | null): string | undefined => {
        if (v == null) return undefined;
        const t = String(v).trim();
        if (!t) return undefined;
        const lower = t.toLowerCase();
        if (lower === 'null' || lower === 'undefined') return undefined;
        return t.replace(/^[,;\s]+|[,;\s]+$/g, '');
      };
      const parts = llm?.candidate
        ? {
            name: sanitize(llm.candidate.name),
            admin1: sanitize(llm.candidate.admin1 as string | null),
            country: sanitize(llm.candidate.country as string | null),
          }
        : undefined;

      candidates = primary ? [primary] : [];
      cacheSet({ key: cacheKey, value: { candidates, advice: localAdvice ?? undefined, parts } });
      cachedAdvice = localAdvice ?? undefined;
      cachedParts = parts;
    }

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ accepted: false, candidate: null, message: 'no candidates' });
    }

    const sorted = candidates.sort(
      (a: { confidence: number }, b: { confidence: number }) => b.confidence - a.confidence
    );
    const best = sorted[0];

    if (!best) {
      return NextResponse.json({ accepted: false, candidate: null, message: 'no candidates' });
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
      candidate: best,
      advice: cachedAdvice,
      locationParts: cachedParts,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
