import { generateLocationCandidate } from '@/lib/location-candidate';
import type { TCandidateDisplay, TLlmCandidate } from '@seven-day-fit/types';
import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '../../../lib/cache';

/**
 * Edge runtime provides lower latency for short LLM + network hops.
 */
export const runtime = 'edge';

/**
 * Resolve a free‑text description into a single best location candidate and
 * a compact UI/display shape. We memoize results per input to keep the route
 * snappy and cost‑efficient.
 *
 * Flow (happy path):
 * 1) Validate input → derive a cache key (case‑insensitive)
 * 2) Cache hit: return stored candidate + advice + normalized parts
 * 3) Cache miss: call `generateLocationCandidate` (LLM structured output)
 * 4) Map to a display candidate (adds `displayName`); sanitize parts
 * 5) Persist to cache and respond with { location, candidate, advice }
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { input?: string };
    const input = (body.input || '').trim();
    if (!input) return NextResponse.json({ error: 'input required' }, { status: 400 });

    const cacheKey = `resolve-location:${input.toLowerCase()}`;
    type TCached = {
      candidate: TCandidateDisplay | null;
      advice?: string;
      parts?: { name?: string | null; admin1?: string | null; country?: string | null };
    };
    const cached = cacheGet<TCached>({ key: cacheKey, ttlMs: 60 * 60 * 1000 });
    let candidate = cached?.candidate ?? null;
    let cachedAdvice: string | undefined = cached?.advice;
    let cachedParts: TCached['parts'] | undefined = cached?.parts;

    if (!candidate) {
      let llm: { candidate: TLlmCandidate['candidate'] | null; advice: string | null } = {
        candidate: null,
        advice: null,
      };
      try {
        llm = await generateLocationCandidate({ input });
      } catch (e) {
        return NextResponse.json({ error: (e as Error).message, accepted: false }, { status: 400 });
      }

      const primary: TCandidateDisplay | null = llm?.candidate
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

      // Advice is optional and only present for low‑confidence or ambiguous inputs
      const localAdvice =
        typeof llm?.advice === 'string' && llm.advice.trim() ? llm.advice.trim() : null;

      /**
       * Drop empty/placeholder fragments (e.g., "null", "undefined") and trim
       * punctuation the LLM might include when composing parts.
       */
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

      candidate = primary;
      cacheSet({ key: cacheKey, value: { candidate, advice: localAdvice ?? undefined, parts } });
      cachedAdvice = localAdvice ?? undefined;
      cachedParts = parts;
    }

    if (!candidate) {
      return NextResponse.json({ accepted: false, candidate: null, message: 'no candidates' });
    }

    const accepted = candidate.confidence >= 0.6;

    return NextResponse.json({
      location: {
        displayName: candidate.displayName,
        lat: candidate.lat,
        lon: candidate.lon,
        country: '',
        admin1: undefined,
        placeType: undefined,
        confidence: candidate.confidence,
      },
      accepted,
      candidate,
      advice: cachedAdvice,
      locationParts: cachedParts,
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
