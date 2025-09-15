import { z } from 'zod';

/**
 * Normalized location selected for forecast and display.
 */
export const ResolvedLocation = z.object({
  displayName: z.string(),
  lat: z.number(),
  lon: z.number(),
  country: z.string(),
  admin1: z.string().optional(),
  placeType: z.enum(['neighborhood', 'city', 'region', 'country']).optional(),
  confidence: z.number().min(0).max(1),
  explanation: z.string().optional(),
});

/** Type of `ResolvedLocation`. */
export type TResolvedLocation = z.infer<typeof ResolvedLocation>;

/**
 * Optional lightweight candidate list shape.
 */
export const LlmCandidates = z.object({
  candidates: z
    .array(
      z.object({
        name: z.string(),
        admin1: z.string().optional(),
        country: z.string().optional(),
        confidence: z.number().min(0).max(1),
        rationale: z.string().optional(),
      })
    )
    .max(2),
  advice: z.string().optional(),
});

/** Type of `LlmCandidates`. */
export type TLlmCandidates = z.infer<typeof LlmCandidates>;
