# Audit report — 2026-10-16

## Scope and evidence

- **VERIFIED:** The supplied ZIP passed CRC integrity checking. Its archive paths were relative, contained no `..` escape components, and contained no symbolic links. It was extracted to a new isolated directory. The original ZIP was preserved.
- **VERIFIED:** The official challenge page lists the first-page `use()` + Suspense starter, `info.next` pagination, automatic sentinel loading, exact test IDs and loading/end strings, append behavior, stop-at-null behavior, and observer cleanup as requirements. Source: [ReactChallenges Infinite Scroll](https://www.reactchallenges.com/challenges/infinite-scroll).
- **VERIFIED:** The challenge starter and official test runner were not present in the archive. `challenge/Characters.jsx` is explicitly a fragment intended to be adapted to that starter.
- **VERIFIED:** Project tests (22/22), TypeScript check, Vite production build, challenge-fragment JSX parsing, and `npm audit` (0 vulnerabilities) passed after the fixes described below.
- **VERIFIED:** The final checks used the bundled Node.js 24 runtime; Vitest 4.1.11 requires Node.js 20 or newer.
- **OBSERVED:** The local app was inspected at 390×844 and 1280×900. A user-provided API-mode screenshot showed 120 characters across six pages, then a page-seven network failure; the observatory counted 8 attempts, 6 completed and 2 failed, while retaining loaded characters. A direct API check had returned HTTP 429. It also showed failed portrait images and horizontal clipping near a 955 px viewport. This is a smoke check, not cross-browser or accessibility certification.

## Challenge contract

The fragment uses React `use()` for the supplied first-page promise, starts from that page's `info.next`, observes `data-testid="sentinel"`, appends results, renders `Loading more characters...` with `data-testid="loading-more"`, renders `End of list` with `data-testid="end-of-list"`, stops at `null`, and disconnects the observer in cleanup.

The fragment validates response shape, aborts on cleanup, detects cursor cycles, rejects duplicate IDs in the initial and later pages, displays request errors with a retry control, and offers a working manual loader if IntersectionObserver is unavailable. Local tests exercise the observer path, the no-observer retry path, cursor-cycle detection, and duplicate IDs. These checks preserve the required test IDs and strings. Compatibility with the real starter and all 12 official tests is **NOT_VERIFIED**.

## App audit and changes

- **MEDIUM, fixed:** A repeated ID within one API page was not removed by the cross-page de-duplication set. The app now rejects duplicate IDs within a page before appending, preventing repeated React keys.
- **MEDIUM, fixed:** Request URLs, including their query strings, were stored in telemetry and shown in the observatory. Events now use page numbers and the UI only reports whether a next page is available.
- **LOW, fixed:** Without IntersectionObserver, the app could not load more content. The observer hook now exits safely and exposes a keyboard-operable manual loader.
- **MEDIUM, improved with external limit remaining:** Transient network errors and HTTP 502/503/504 now get one bounded retry. During backoff the active-request metric drops to zero, the retry is counted only when it starts, and unmount cancels the timer. HTTP 429 honors a short `Retry-After`; longer waits are reported without sending another request early. Persistent outages still require a later manual retry.
- **MEDIUM, fixed:** The challenge fragment previously hid fetch errors, did not detect cycles, and appended duplicate IDs. It now displays an error/retry control, guards cursor cycles, and rejects duplicates.
- **MEDIUM, fixed:** npm audit initially reported two critical and one moderate finding in Vitest's development dependency tree. Vitest was updated to 4.1.11, which supports the available Node 24 and Vite 6. The resulting audit reported zero vulnerabilities.
- **OBSERVED:** The app guards concurrent requests, cancels stale work with AbortController, validates API pages, detects cursor cycles, preserves existing characters on errors, and keeps a bounded telemetry timeline.
- **VERIFIED:** A new Strict Mode test confirms that an active request is aborted when the component unmounts.
- **NOT_VERIFIED:** Formal WCAG 2.2 AA, automated axe checks, cross-browser compatibility, load/performance measurements, visual rendering after the latest responsive CSS change, and reliable live API behavior. The retry logic has unit coverage, but the external API limit cannot be removed by the client. The screenshots showed recoverable network errors on pages five and seven in separate runs.

## Results

| Check | Result |
| --- | --- |
| Project tests | **VERIFIED:** 22 passed |
| TypeScript and production build | **VERIFIED:** passed |
| npm dependency audit | **VERIFIED:** 0 vulnerabilities after update |
| Official challenge tests | **NOT_VERIFIED:** starter and runner absent |
| Browser smoke check | **OBSERVED:** mock app rendered at mobile and desktop viewport settings; API mode loaded pages then hit a network error |
| Accessibility certification / performance measurements | **NOT_VERIFIED** |

## Limitations

The demo defaults to local mock data; the public API requires `VITE_SOURCE=api`. Remote API requests can fail and portraits can be unavailable; failures preserve loaded characters, show a retry action, and now fall back to initials for missing images. No demo deployment or performance claim is included. The portfolio repository is a GitHub profile README repository, not a deployed app site, so the project page links to source; there is no functional demo URL.
