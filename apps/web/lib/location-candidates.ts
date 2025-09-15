import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';

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
 * Schema for the structured LLM response containing exactly three candidates.
 */
const LlmCandidates = z.object({
  candidates: z.array(Candidate).length(3),
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
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return [];
  const openai = new OpenAI({ apiKey });

  const model = process.env.OPENAI_MODEL || 'gpt-5';
  const completion = await openai.chat.completions.create({
    max_completion_tokens: 5000,
    model,
    messages: [
      {
        role: 'system',
        content:
          'Task: Convert a text input into 3 canonical place candidates with coordinates. The text could be a city, region, country, or a combination of these (or other ways one may refer to a location). It could also be a coy or nickname-filled clue. Each candidate must include: name (city/region), lat (number), lon (number). Include confidence 0..1 when possible. If ambiguous, still provide 3 plausible guesses. Prefer cities.',
      },
      { role: 'user', content: input },
    ],
    ...(model.startsWith('gpt-5') ? {} : { temperature: 0.2 as number }),
    response_format: zodResponseFormat(LlmCandidates, 'candidates'),
  });

  const content = completion.choices[0]?.message?.content ?? '';
  let candidates: TLlmCandidates['candidates'] | [] = [];
  try {
    const text =
      typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? (content as any[]).map((c: any) => (typeof c?.text === 'string' ? c.text : '')).join('')
          : String(content);
    const obj = JSON.parse(text);
    const parsed = LlmCandidates.safeParse(obj);
    if (parsed.success) candidates = parsed.data.candidates;
  } catch {}
  return candidates;
};
