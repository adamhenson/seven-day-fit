import 'server-only';

/**
 * Centralized environment-derived constants for the web workspace.
 * These are server-only to avoid leaking secrets into client bundles.
 */

/**
 * OpenAI API key used on the server. Empty string if not provided.
 */
export const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY ?? '';

/**
 * OpenAI model identifier; defaults to a gpt-5 class model.
 */
export const OPENAI_MODEL: string = process.env.OPENAI_MODEL || 'gpt-5';

/**
 * Upper bound for completion tokens when calling OpenAI chat completions.
 */
export const OPENAI_MODEL_MAX_COMPLETION_TOKENS: number = !process.env
  .OPENAI_MODEL_MAX_COMPLETION_TOKENS
  ? 5000
  : Number.parseInt(process.env.OPENAI_MODEL_MAX_COMPLETION_TOKENS, 10);
