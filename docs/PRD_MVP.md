# PRD: Seven Day Fit (MVP)

## What it does

Free‑text location → 7‑day forecast → daily outfit suggestions.

## User flow

1. Type a place or clue (e.g., “the windy city”).
2. We resolve to candidates via an LLM, pick the best, then fetch weather.
3. Show 7 cards (Mon–Sun) with temps, summary, large icons, and concise outfit text.

## Scope

- LLM‑first location candidates (OpenAI structured output), no external geocoder.
- Open‑Meteo daily forecast; we normalize to a simple `DayWeather` model.
- Outfit mapping via discrete presets + notes.
- In‑memory cache per input and per `(lat,lon)` query.
- Errors surface as toasts; no accounts or DB.

## Success bar

- Returns 7 days starting tomorrow.
- Guesses are visible with confidence and lightweight disambiguation.
- Clean, fast UI with centered cards and large visuals.

## Out of scope (MVP)

Accounts, persistence, commerce, push, DB search.

