# Open Source Contributions

[Back to portfolio](../README.md) · [Volver al portfolio en español](README.es.md)

This area records contributions reviewed and accepted in projects maintained by others. It distinguishes upstream work from projects in my own repositories.

## Merged contributions

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
