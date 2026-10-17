# Open Source Contributions

[Back to portfolio](../README.md) · [Volver al portfolio en español](README.es.md)

This area records contributions reviewed and accepted in projects maintained by others. It distinguishes upstream work from projects in my own repositories.

## External code review and issue diagnosis

### Dokploy — scheduler backup runtime dependency identified

[Pull request #5349](https://github.com/Dokploy/dokploy/pull/5349) · [Author's follow-up commit `5a7084c`](https://github.com/Dokploy/dokploy/pull/5349/commits/5a7084c)

- Reviewed a third-party proposal introducing Google Drive, OneDrive, FTPS and SFTP backup destinations.
- Flagged that scheduled password-authenticated FTP/SFTP backup operations call `rclone obscure` via `getRclonePathAndFlags`, while the separate `apps/schedules` Docker runtime did not include the `rclone` executable.
- Suggested provisioning a pinned, integrity-verified rclone binary in the scheduler image and covering the runtime with a smoke test.
- The PR author subsequently added rclone to the scheduler image in commit `5a7084c`, explicitly describing this as the scheduler runtime fix. The author later reported an independent 5/5 CI pass and 1,245/1,245 tests passing on a later PR head; these are **author-reported results**, not tests performed by this reviewer.
- **Status:** Public technical review comment followed by a related fix from the PR author. The PR remained open awaiting upstream review/approval as of 2026-10-17. This is not a claim of authorship of the PR or a merged upstream change.

**Evidence:** [review comment and author response in PR #5349](https://github.com/Dokploy/dokploy/pull/5349)

## Submitted contributions (not merged)

### Co4 — Python package metadata and PyPI discoverability

[Pull request #13](https://github.com/JerrettDavis/Co4/pull/13) · [Related issue #12](https://github.com/JerrettDavis/Co4/issues/12)

- Submitted a `pyproject.toml` update adding project URLs and PyPI Trove classifiers, including the MIT license classifier required by the issue.
- Reported successful isolated editable installation, isolated wheel build, Python compilation, and whitespace checks. Wheel metadata inspection reported five project URLs and eight classifiers.
- Reported test result: 93 passed, 1 failed; the failing distribution test expected an absent, Git-ignored `examples/worker.toml`, outside the metadata-only change.
- **Status:** Closed without merge. This is a submitted and tested contribution, not an accepted upstream change; no claim is made that the implementation was incorporated.

**Evidence:** [PR, proposed diff, validation notes, and final status](https://github.com/JerrettDavis/Co4/pull/13)

## Merged contributions

### Microsoft OpenTelemetry Python — default logging collection fix

[Pull request #288](https://github.com/microsoft/opentelemetry-distro-python/pull/288) · [Upstream repository](https://github.com/microsoft/opentelemetry-distro-python)

- Fixed default Python log collection in the plain OpenTelemetry setup by attaching the logging handler to the root logger when the logger name is omitted, empty, or `None`, while retaining duplicate-handler protection and named-logger behavior.
- Added and reorganized 23 regression cases into existing test suites, covering default and named loggers, levels, propagation, repeat setup, and disabled logging.
- Added integration coverage for concurrent Azure Monitor and OTLP logging: a single `LoggingHandler` and `LoggerProvider` with both exporters/processors.
- Incorporated maintainer feedback on test placement and concise documentation. The PR received maintainer approval and was merged into upstream `main` on 2026-10-16.
- The maintainer expects a package release in the first week of November 2026; this is a forecast, not a confirmed published version.

**Evidence:** [merged PR, changes and reviews](https://github.com/microsoft/opentelemetry-distro-python/pull/288) · [release timing comment](https://github.com/microsoft/opentelemetry-distro-python/pull/288#issuecomment-6218513273)

### PlasmaPy — units and particle guidance in `AGENTS.md`

[Pull request #3388](https://github.com/PlasmaPy/PlasmaPy/pull/3388) · [Upstream repository](https://github.com/PlasmaPy/PlasmaPy)

- Addressed [issue #3285](https://github.com/PlasmaPy/PlasmaPy/issues/3285), which requested concise `astropy.units` and `plasmapy.particles` guidance for `AGENTS.md`, including temperature inputs expressed in eV and the `@particle_input` and `@validate_quantities` decorators.
- Expanded `AGENTS.md` with unit-aware quantity and conversion guidance; temperature-energy equivalency for temperature arguments that accept energy units such as eV; and guidance on `Particle`, `CustomParticle`, `ParticleList`, `ParticleLike` / `ParticleListLike`, `@particle_input`, and `@validate_quantities`.
- Added a changelog entry and the contributor alias to `CITATION.cff`. The PR changed only `AGENTS.md`, `CITATION.cff`, and `changelog/3388.internal.rst`; its scope is repository guidance and contributor metadata, with no PlasmaPy runtime code changes.
- The maintainer approved the PR and suggested a minor wording edit before merge. It was merged into upstream `main` on 2026-10-05.

**Evidence (VERIFIED):** [PR diff](https://github.com/PlasmaPy/PlasmaPy/pull/3388/files) · [merged commit](https://github.com/PlasmaPy/PlasmaPy/commit/5990ca662b6aab57ff1dfd62bdc4256ec13ec63c) · [requesting issue](https://github.com/PlasmaPy/PlasmaPy/issues/3285)

### Axiomize Quantum Skills 2.0 — numeric-oracle regression coverage

[Pull request #11](https://github.com/Furox-Art/axiomize-quantum-skills-2.0/pull/11) · [Upstream repository](https://github.com/Furox-Art/axiomize-quantum-skills-2.0)

- Added regression coverage for numeric-oracle keyword alternatives separated by `|`.
- Covered matching alternatives such as `temperature rise: 50 K` and `dT 50 K`.
- Added negative tests for values outside tolerance and reports without any matching keyword alternative.
- Left production logic unchanged and validated the contribution with 4 focused passing tests and the full suite: 406 passed, 8 skipped.
- Merged into the upstream `main` branch. The maintainer explicitly confirmed that the added cases were the regression coverage the grader needed and thanked the contribution.

**Evidence:** implementation, tests, validation results, merge status, and maintainer feedback are available in the merged pull request.

### StockVeda — API error disclosure fix

[Pull request #74](https://github.com/CRS5226/StockVeda/pull/74) · [Upstream repository](https://github.com/CRS5226/StockVeda)

- Replaced unexpected internal exception details in API responses with generic messages, while logging tracebacks server-side.
- Preserved descriptive input-validation errors and existing HTTP status codes.
- Added regression tests for API responses and server logs across affected backend handlers.
- Verified with 26 passing backend tests, Python compile checks, and `git diff --check`.
- Merged into the upstream `master` branch. The maintainer confirmed the change closed two CodeQL stack-trace-exposure alerts.

**Evidence:** implementation, tests, CI checks, and maintainer feedback are available in the merged pull request. This contribution documents a focused security fix; it does not claim a full security audit of StockVeda.
