import { LlmCandidate, type TLlmCandidate } from '@seven-day-fit/types';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { OPENAI_API_KEY, OPENAI_MODEL, OPENAI_MODEL_MAX_COMPLETION_TOKENS } from './constants';

/**
 * Using shared DTO schema + type from @seven-day-fit/types
 */

/**
 * Generate a single best location candidate from the text input.
 */
export const generateLocationCandidate = async ({
  input,
}: { input: string }): Promise<{
  candidate: TLlmCandidate['candidate'];
  advice: string | null;
}> => {
  const apiKey = OPENAI_API_KEY;
  if (!apiKey) return { candidate: null as TLlmCandidate['candidate'], advice: null };
  const openai = new OpenAI({ apiKey });

  const model = OPENAI_MODEL;
  const completion = await openai.chat.completions.create({
    max_completion_tokens: OPENAI_MODEL_MAX_COMPLETION_TOKENS,
    model,
    messages: [
      {
        role: 'system',
        content:
          'Task: Convert a text input into exactly 1 canonical place candidate with coordinates. The text could be a city, region, country, or a combination of these (or other ways one may refer to a location). It could also be a coy or nickname-filled clue. The candidate must include: name (city/region), lat (number), lon (number). Include confidence 0..1 when possible. Prefer cities. Additionally, include an optional advice string when confidence is low that suggests how to phrase a clearer place description (e.g., avoid nicknames, remove non-place words, include city and state/country). Do not repeat or classify user content; provide constructive, neutral guidance only.',
      },
      { role: 'user', content: input },
    ],
    response_format: zodResponseFormat(LlmCandidate, 'candidate'),
  });

  const content = completion.choices[0]?.message?.content ?? '';
  let candidate = null as TLlmCandidate['candidate'];
  let advice: string | null = null;
  try {
    const text =
      typeof content === 'string'
        ? content
        : Array.isArray(content)
          ? (content as any[]).map((c: any) => (typeof c?.text === 'string' ? c.text : '')).join('')
          : String(content);
    const obj = JSON.parse(text);
    const parsed = LlmCandidate.safeParse(obj);
    if (parsed.success) {
      candidate = parsed.data.candidate;
      advice = parsed.data.advice ?? null;
    }
  } catch {}
  return { candidate, advice: advice ?? null };
};
