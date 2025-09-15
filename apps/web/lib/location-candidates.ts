import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import { OPENAI_API_KEY, OPENAI_MODEL, OPENAI_MODEL_MAX_COMPLETION_TOKENS } from './constants';

/**
 * Schema for a single LLM-produced location candidate.
 */
const Candidate = z.object({
  lat: z.number(),
  lon: z.number(),
  name: z.string(),
  admin1: z.string().nullable(),
  country: z.string().nullable(),
  placeType: z.enum(['neighborhood', 'city', 'region', 'country']).nullable(),
  confidence: z.number().min(0).max(1).nullable(),
  rationale: z.string().nullable(),
});

/**
 * Schema for the structured LLM response containing exactly two candidates
 * and optional user advice when confidence is low.
 */
const LlmCandidates = z.object({
  candidates: z.array(Candidate).length(2),
  advice: z.string().optional(),
});

/**
 * Convenience TypeScript type for the structured LLM response.
 */
type TLlmCandidates = z.infer<typeof LlmCandidates>;

/**
 * Generate location candidates from the text input.
 */
export const generateLocationCandidates = async ({
  input,
}: { input: string }): Promise<TLlmCandidates['candidates']> => {
  const apiKey = OPENAI_API_KEY;
  if (!apiKey) return [];
  const openai = new OpenAI({ apiKey });

  const model = OPENAI_MODEL;
  const completion = await openai.chat.completions.create({
    max_completion_tokens: OPENAI_MODEL_MAX_COMPLETION_TOKENS,
    model,
    messages: [
      {
        role: 'system',
        content:
          'Task: Convert a text input into exactly 2 canonical place candidates with coordinates. The text could be a city, region, country, or a combination of these (or other ways one may refer to a location). It could also be a coy or nickname-filled clue. Each candidate must include: name (city/region), lat (number), lon (number). Include confidence 0..1 when possible. Prefer cities. Additionally, include an optional advice string when confidence is low that suggests how to phrase a clearer place description (e.g., avoid nicknames, remove non-place words, include city and state/country). Do not repeat or classify user content; provide constructive, neutral guidance only.',
      },
      { role: 'user', content: input },
    ],
    response_format: zodResponseFormat(LlmCandidates, 'candidates'),
  });

  const content = completion.choices[0]?.message?.content ?? '';
  let candidates: TLlmCandidates['candidates'] | [] = [];
  let advice: string | undefined;
  try {
    const text =
      typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? (content as any[]).map((c: any) => (typeof c?.text === 'string' ? c.text : '')).join('')
          : String(content);
    const obj = JSON.parse(text);
    const parsed = LlmCandidates.safeParse(obj);
    if (parsed.success) {
      candidates = parsed.data.candidates;
      advice = parsed.data.advice ?? undefined;
    }
  } catch {}
  // We only return candidates for now; advice may be used by callers later.
  return candidates;
};
