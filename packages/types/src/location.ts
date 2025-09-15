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
export const LlmCandidate = z.object({
  candidate: z
    .object({
      lat: z.number(),
      lon: z.number(),
      name: z.string(),
      admin1: z.string().nullable(),
      country: z.string().nullable(),
      placeType: z.enum(['neighborhood', 'city', 'region', 'country']).nullable(),
      confidence: z.number().min(0).max(1).nullable(),
      rationale: z.string().nullable(),
    })
    .nullable(),
  advice: z.string().nullable(),
});

/** Type of `LlmCandidate`. */
export type TLlmCandidate = z.infer<typeof LlmCandidate>;
