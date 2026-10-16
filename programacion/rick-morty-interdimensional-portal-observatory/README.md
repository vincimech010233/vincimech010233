# Rick & Morty — Interdimensional Portal Observatory

This project contains two related deliverables:

- `challenge/Characters.jsx` is a React 19 solution fragment for the ReactChallenges Infinite Scroll challenge. It preserves the starter's first-page promise and uses `use()` with Suspense.
- `app/` is a separate React and TypeScript observatory demo. It adds a visual portal, character cards, retry handling, and a bounded request timeline. Failed remote portraits fall back to a character initial; the observatory stacks below the content at narrower widths.

## Run the app

```sh
cd app
npm ci
npm test
npm run build
npm run dev
```

Use Node.js 20 or newer (the audit used Node 24).

The default data source is a local four-page fixture with six characters per page. Set `VITE_SOURCE=api` to use the public Rick and Morty API instead.

## Architecture

- `challenge/Characters.jsx` consumes the first page supplied by the challenge starter, observes a sentinel, requests `info.next`, and appends each response. The observer disconnects on cleanup.
- `app/src/api/` isolates the mock and REST data sources.
- `app/src/hooks/useInfiniteCharacters.ts` owns pagination, duplicate-request guards, cancellation, response validation, deduplication, retries, and telemetry.
- `app/src/hooks/useIntersectionSentinel.ts` owns the observer lifecycle and re-arms it after each page so a still-visible sentinel can trigger again.
- `app/src/App.tsx` renders cards, loading/error/end states, a manual loader when IntersectionObserver is unavailable, and an observatory panel.

## Verification

On 2026-10-16, the local suite passed 19 tests, TypeScript and the Vite production build passed, the challenge fragment parsed, and `npm audit` reported zero vulnerabilities after updating Vitest to 4.1.11. The app was also inspected in a browser at mobile and desktop viewport sizes.

These are project checks. They are not the 12 official ReactChallenges tests. The official starter and test runner were not included in the supplied archive, so compatibility with that runner remains **NOT_VERIFIED**. Automated accessibility, real API browser behavior, and performance measurements are also **NOT_VERIFIED**.

See [INFORME.md](INFORME.md) for the detailed audit and [LEARN.md](LEARN.md) for evidence-backed learnings.
