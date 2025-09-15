# seven day fit

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

## Scripts

- `npm run web:dev` – start Next.js (App Router) with env loaded
- `npm run web:build` / `npm run web:start` – production build/start
- `npm run typecheck` – strict TS check
- `npm run lint` / `npm run format` – Biome lint/format

## Project layout

```
apps/
  web/               # Next.js app (app router)
    app/             # routes (includes api/resolve, api/forecast)
    components/      # React components (PascalCase)
    lib/             # domain logic (location, outfit, cache)
packages/
  types/             # shared Zod schemas & TS types
```

## Environment variables

- `OPENAI_API_KEY` – required (server‑side only)
- `OPENAI_MODEL` – optional (defaults to a gpt‑5 class model)

The root `.env` is loaded for all workspace commands.

## Notes

- Pre‑commit hooks run Biome (format + lint).
- TypeScript path alias: `@seven-day-fit/*` → `packages/*/src`.
