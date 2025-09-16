import { generateLocationCandidate } from '@/lib/location-candidate';
import type { TCandidateDisplay } from '@seven-day-fit/types';
import { NextResponse } from 'next/server';
import { cacheGet, cacheSet } from '../../../lib/cache';

export const runtime = 'edge';

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
      let llm: { candidate: any | null; advice: string | null } = { candidate: null, advice: null };
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

      const localAdvice =
        typeof llm?.advice === 'string' && llm.advice.trim() ? llm.advice.trim() : null;

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
        country: (candidate as any).country ?? '',
        admin1: (candidate as any).admin1,
        placeType: (candidate as any).placeType,
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
