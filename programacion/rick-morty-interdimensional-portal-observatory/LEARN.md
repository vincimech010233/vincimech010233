# LEARN

LEARNING: De-duplicate IDs within each response page before appending; a set of IDs from prior pages alone does not catch duplicates inside one response.
EVIDENCE: The critical review found the issue in `useInfiniteCharacters.ts`; a regression test now verifies that a page with a repeated ID is rejected.
IMPACT: Prevents duplicate React keys and inconsistent rendered character records.
CONFIDENCE: HIGH
CARRY_FORWARD: Keep a fixture with repeated IDs when changing pagination behavior.
UNRESOLVED: The challenge fragment still needs the actual starter and official runner for compatibility verification.

LEARNING: Observability should report pagination progress without retaining the full request URL.
EVIDENCE: A regression test supplies a URL query token and confirms that the token does not appear in the rendered UI or timeline.
IMPACT: Reduces accidental exposure if a future source uses sensitive query parameters.
CONFIDENCE: HIGH
CARRY_FORWARD: Keep telemetry labels non-sensitive and bounded.
UNRESOLVED: None for the local observatory; real API browser behavior remains NOT_VERIFIED.


LEARNING: Remote character images need an explicit failure state, and a responsive panel should stack before the available width forces horizontal clipping.
EVIDENCE: The user-provided API-mode screenshot showed broken portrait icons and a clipped observatory at about 955 px. Added image-error and empty-name fallback tests; CSS keeps the panel beside cards above 700 px and stacks it on narrow phones.
IMPACT: Cards remain readable when an image host fails, and the metrics panel has room to fit at common tablet widths.
CONFIDENCE: HIGH for the fallback behavior (automated tests); MEDIUM for the responsive fix (CSS/build verified, post-change visual check pending).
CARRY_FORWARD: Check broken image behavior and intermediate viewport widths during visual QA.
UNRESOLVED: Confirm the layout in a browser after the CSS change; the live API also returned a recoverable page-five network failure in the observed run.


LEARNING: Infinite scroll needs bounded retry behavior that respects an API's Retry-After response; moving a panel does not fix an upstream request failure.
EVIDENCE: The user screenshot showed six completed pages and a page-seven failure; a direct API check returned HTTP 429. Added one retry for transient network and selected server failures, honors short Retry-After delays, reports longer waits, tracks active requests accurately during backoff, cancels delay on unmount, and tests network retry and HTTP 429 handling.
IMPACT: Transient failures can recover without user action; sustained rate limits are reported clearly without request loops.
CONFIDENCE: HIGH for retry logic, request counts, and abort behavior in local tests; NOT_VERIFIED for successful recovery against the live rate-limited API.
CARRY_FORWARD: Keep automatic retries bounded and respect server-provided delays.
UNRESOLVED: The public API may continue to limit requests; visual confirmation that the observatory sits beside the cards at the user's viewport remains pending.
