# Junior Developer Project Collection

A curated set of 12 small, standalone learning projects covering Python, C++, browser JavaScript, Go, Java, Rust, SQLite and Node.js. The examples use synthetic or fictional data and are intended for practice and demonstration, not production use.

These are starter exercises, not claims of professional or original work. Adapt the code, understand the design choices, and describe only work you can personally explain.

## Projects

1. [Energy Audit CLI](01-python-energy-audit/) — Python CSV summaries and a transparent high-use heuristic.
2. [Local CTI Indicator Triage](02-python-cti-triage/) — offline parsing of fictional indicators; scores are not threat attribution.
3. [1D Heat Diffusion Simulator](03-cpp-heat-diffusion/) — explicit finite-difference numerical demo.
4. [Accessible Task Board](04-js-accessible-task-board/) — browser task list with local storage.
5. [Scientific Data Fit](05-python-science-fit/) — dependency-free linear least-squares fit.
6. [Local Health Check API](06-go-local-health-api/) — localhost HTTP health endpoints.
7. [Expense Summary](07-java-expense-summary/) — CSV spending summary by category.
8. [Log Summary](08-rust-log-summary/) — severity counts and frequent error messages.
9. [Library Lending Analytics](09-sql-library-analytics/) — SQLite schema and reports using fictional records.
10. [Inventory API](10-node-inventory-api/) — in-memory JSON API bound to localhost.
11. [Budget Planner](11-js-budget-planner/) — browser expense tracker with local storage.
12. [Log Insights CLI](12-node-log-insights/) — local JSONL log summarization.

## Review and verification

**VERIFIED:** Python unit tests passed for energy audit (2), CTI triage (4), and scientific fit (2). Rust tests passed (3). Node inventory API tests passed (2), and Node log-insights tests passed (2). The SQLite report script and the Python, Rust and Node sample commands produced output. JavaScript source syntax checks passed with Node.

**NOT_VERIFIED:** C++ build/CTest, Go tests and Java compilation could not run because CMake, Go and `javac` are not installed in the review environment. Browser interaction was not exercised in an actual browser. Passing sample runs do not establish production readiness.

**OBSERVED:** The archive included Python bytecode caches; these generated artifacts were excluded. During review, a Rust log grouping bug (case-insensitive severity detection with case-sensitive extraction) and IPv6 acceptance under an `ipv4` label were corrected, with regression coverage for the latter and Rust unit coverage for mixed-case errors. Energy rate validation now rejects non-finite values. The Go README was corrected to stop claiming graceful shutdown, which the implementation does not provide.
