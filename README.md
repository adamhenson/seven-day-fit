# Seven Day Fit

A tiny web app that turns a free‑text location clue into a 7‑day weather outlook and simple outfit suggestions.

## Features

- LLM‑first location resolution (OpenAI structured output)
- 7‑day forecast from Open‑Meteo (normalized to a compact model)
- Outfit presets with large emoji icons and concise labels
- Edge API routes, lightweight in‑memory caching, TypeScript everywhere

## Requirements

- Node.js 22+
- An OpenAI API key (`OPENAI_API_KEY`)

## Quick start

1) Install

```bash
npm install
```

2) Configure env

```bash
cp example.env .env
# set OPENAI_API_KEY=... (and optionally OPENAI_MODEL)
```

3) Run the app

```bash
npm run web:dev
# http://localhost:3000
```

4) Storybook (components)

```bash
npm -w apps/web run storybook
# http://localhost:6006
```

5) End-to-end tests (Playwright)

```bash
# Install browsers once (or when CI image changes)
npm -w apps/e2e run install:browsers

# Run against local dev (default baseURL http://localhost:3000)
npm -w apps/e2e test

# Run against a remote URL
E2E_BASE_URL="https://preview.example.vercel.app" npm -w apps/e2e test

# If your Vercel preview requires protection bypass, set a token
E2E_BYPASS_TOKEN="<vercel-automation-bypass-secret>" E2E_BASE_URL="https://..." npm -w apps/e2e test
```

## Scripts

- `npm run web:dev` – start Next.js (App Router) with env loaded
- `npm run web:build` / `npm run web:start` – production build/start
- `npm run typecheck` – strict TS check
- `npm run lint` / `npm run format` – Biome lint/format
- `npm -w apps/web run storybook` – run Storybook for UI components
- `npm -w apps/e2e test` – run Playwright E2E tests

## Project layout

```
apps/
  web/               # Next.js app (app router)
    app/             # routes (includes api/resolve, api/forecast)
    components/      # React components (PascalCase)
    lib/             # domain logic (location, outfit, cache)
  e2e/               # Playwright E2E workspace (tests, config)
packages/
  types/             # shared Zod schemas & TS types
.github/
  workflows/         # GitHub Actions (typecheck, e2e)
```

## Environment variables

- `OPENAI_API_KEY` – required (server‑side only)
- `OPENAI_MODEL` – optional (defaults to a gpt‑5 class model)

E2E/CI specific (optional):

- `E2E_BASE_URL` – base URL for Playwright when testing a remote app
- `E2E_BYPASS_TOKEN` – Vercel Protection Bypass token for automated tests

The root `.env` is loaded for all workspace commands.

## Notes

- Pre‑commit hooks run Biome (format + lint).
- TypeScript path alias: `@seven-day-fit/*` → `packages/*/src`.
- State management uses Zustand in `apps/web/lib/useSearch.ts`.
- Shared DTOs and schemas live in `packages/types` (Zod + inferred TS).
- CI includes:
  - Typecheck on push/PR (`.github/workflows/typecheck.yml`).
  - E2E on Vercel Preview via repository_dispatch `vercel.deployment.success` (`.github/workflows/e2e.yml`). Provide repo secrets: `VERCEL_TOKEN`, `VERCEL_PROJECT_ID`, (optional) `VERCEL_ORG_ID`, and `VERCEL_BYPASS_TOKEN` when previews are protected.
