# System Design — seven day fit (MVP)

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Biome for lint/format; Zod for schemas
- OpenAI (LLM candidates via `zodResponseFormat`)
- Open‑Meteo (daily forecast)

## Workspace

- apps/web: Next.js app (`app/`, `components/`, `lib/`)
- packages/types: shared Zod schemas and TS types
- TS path alias: `@seven-day-fit/*` → `packages/*/src`

## Routes

- POST `/api/resolve` (Edge)
  - Input `{ input: string }`
  - `generateLocationCandidates` (OpenAI) → pick best; cache in memory
  - Output `{ location, accepted, candidates }`

- POST `/api/forecast` (Edge)
  - Input `{ lat: number, lon: number }` (strict finite check)
  - Open‑Meteo → `normalizeOpenMeteo` → 8 days → return next 7

## Lib

- `location-candidates.ts`: OpenAI client + Zod schema; returns 3 candidates
- `outfit.ts`: normalize Open‑Meteo daily arrays; map to presets + notes
- `outfit-display.ts`: preset → icon/label map; array helper
- `cache.ts`: tiny TTL in‑memory cache

## UI

- 7 centered cards; weekday header; `low° - high° summary`; large icons; inline notes
- Disambiguation when confidence < 0.6; toasts for errors

## Non‑goals

Accounts, DB, commerce. Keep costs minimal and UX snappy.
