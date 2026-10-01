---
doc: spec
status: approved
---

# UncertaintyLab — Technical Spec

## How This Works, In Plain Language

The page is a small set of local files opened in a modern browser. A built-in Python command serves only those app files from the laptop; it does not calculate results or send inputs elsewhere. The browser keeps the current table and expression in memory, checks the expression using a small, safe math reader, and performs the Monte Carlo calculation itself. It then draws a histogram and summary on the same page. Nothing is saved when the page closes.

This shape avoids a database, a web framework, an API, accounts, and package installation. It preserves the full idea—editable uncertain inputs, a mathematical model, a reproducible simulation, and an output distribution—while keeping the demo local and easy to run.

## The Core Journey Through the System

PRD ref: `prd.md > The Core Journey`.

```text
Open public/index.html through the local Python file server
        ↓
Browser loads the mass example into the editable workspace
        ↓
User edits rows/formula → browser validates and clears any old result
        ↓
Run Simulation → allowlisted expression becomes a small math tree
        ↓
Seed 42 → independent normal draws → 50,000 finite output values
        ↓
Browser calculates statistics and 30 histogram bins
        ↓
SVG histogram + summary appear below the inputs
```

The server only returns static files. Input values travel from the form to browser JavaScript, then to the expression parser and simulation functions; the resulting values go to the statistics and histogram renderer. No input or result leaves the browser.

## Stack

- **HTML, CSS, and browser JavaScript ES modules:** the page, responsive layout, restricted expression reader, simulation, and SVG chart. No framework, bundler, CDN, browser storage, or external package is needed. The browser’s standard `Math` functions supply the allowlisted math operations; the seeded uniform generator and normal sampler are implemented locally. [JavaScript `Math` reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math), [SVG overview](https://developer.mozilla.org/en-US/docs/Web/SVG).
- **Python 3 standard library `http.server` (static serving only):** starts a loopback-only file server without a virtual environment or `pip` install. It is not an application backend and is not for production or untrusted network access. The current workspace has Python 3.12.3 (OBSERVED). [Official `http.server` documentation](https://docs.python.org/3/library/http.server.html).
- **Node.js built-in test runner (tests only):** pure calculation modules can be checked without adding test packages. It is not required to run the app. The current workspace has Node.js v18.19.1 (OBSERVED). [Official Node.js test runner documentation](https://nodejs.org/api/test.html).

## Where It Runs and How Someone Tries It

- **Runtime:** a current desktop browser with JavaScript ES modules and SVG support; all calculation and rendering happen in that browser. Python 3 serves the static app from the same machine. No account, key, external service, GPU, or deployment is required.
- **Start:** from the project root, run `python3 -m http.server 8000 --bind 127.0.0.1 --directory public`.
- **Open:** visit `http://127.0.0.1:8000/` in the browser. If port 8000 is busy, choose another port in the command and URL. Stop the server with Ctrl+C.
- **Optional calculation tests:** with Node.js installed, run `node --test tests/*.test.mjs` from the project root; Node is not needed to use the app.
- **Recording path:** open the page, show the preloaded variables and 1σ note, run the mass simulation, then show **Mass (g)**, the nominal/mean markers, histogram, and compact statistics. Optionally make one small input edit and rerun to show propagation. Keep the recording under three minutes. A public GitHub repository and short public video are required for the eventual submission; local recording is sufficient, and deployment is optional.
- **Exposure boundary:** bind to `127.0.0.1` and serve only `public/`, never the repository root, because the repository also contains planning material. Do not use Python’s basic file server as a public host.

## Look and Feel

Implements `prd.md > Look and Feel` and `prd.md > Screens and Layout`. Use a warm off-white page, dark high-contrast text, restrained teal and blue accents, and system fonts only. Keep the equation and numeric values monospaced. Let the input form read as a compact scientific worksheet; put the histogram first in the results area and keep the summary close. On wide screens, place the summary beside the chart; on narrow screens, stack it after the chart. Use distinct line styles as well as colors for nominal and sample-mean markers. Avoid gradients, animations, remote fonts, decorative graphics, tabs, and hidden panels.

## Components

### Workspace and Input Validation

Implements `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Input Table and Expression`, and `prd.md > States and Boundaries`. Render the built-in `length`, `width`, `thickness`, and `density` rows, expression, 1σ/independence note, and Run button. Support adding/removing rows (minimum one, maximum 16); each row has a unique valid name, finite nominal value, finite nonnegative 1σ value, and optional unit label. Reject blank/incomplete rows, duplicate or invalid names, and names reserved for functions. On any input/expression edit, discard prior results and return the results area to its initial prompt. Render user-provided names, units, and errors as text nodes; never interpret them as HTML.

### Restricted Expression Reader

Implements `prd.md > Features and Behavior > Input Table and Expression`. Tokenize the text and parse it into a bounded abstract syntax tree (AST), a small tree describing only the approved math. Evaluate that tree through explicit operator and function handlers; do not compile it into JavaScript or use dynamic evaluation.

Allowed leaves are declared variable names only; numeric literals and unknown names are errors. Allowed operators are unary `+`/`-` and binary `+`, `-`, `*`, `/`, and `**`. Parentheses group expressions. Allowed one-argument functions are `abs`, `sqrt`, `exp`, `log`, `sin`, and `cos`; `log` is natural log and trig uses radians. Reject all other tokens, calls, member/attribute access, imports, commas, and unsupported syntax. Function names are reserved and case-sensitive. Each function takes exactly one expression.

Precedence is conventional: parentheses first; exponentiation is right-associative; a leading unary sign applies after exponentiation; multiplication/division precede addition/subtraction. Reject expressions longer than 512 characters or an AST deeper than 64 levels before evaluation. The AST resolves each variable to its row index after input validation.

### Monte Carlo Simulation

Implements `prd.md > Features and Behavior > Simulation and Results`. Use fixed constants of 50,000 samples and seed 42, reset at the start of every run; show both in the result summary. Generate a deterministic 32-bit Mulberry32 uniform stream from seed 42. Map each word `w` to `(w + 1) / (2^32 + 1)` so both uniforms used by the normal transform are strictly between zero and one. Use Box–Muller in draw order: consume `u1`, then `u2`; produce `z0 = sqrt(-2 ln u1) cos(2πu2)` first and cache `z1 = sqrt(-2 ln u1) sin(2πu2)` for the next normal draw. For each sample, visit input rows in table order and consume one normal draw per row, including rows whose σ is zero; produce `μ + σz`. This keeps the stream order explicit and each row uses a separate normal variate.

Evaluate the nominal output once from nominal inputs without consuming the seeded stream. For each simulated sample, evaluate the parsed AST. If an input, function, sample, output, or required statistic is non-finite or undefined, stop and show an error with no partial result. Do not truncate, resample, or silently drop negative or invalid values.

### Results and Histogram

Implements `prd.md > Features and Behavior > Simulation and Results` and `prd.md > States and Boundaries`. Compute the mean and sample standard deviation (`N−1`) with Welford’s online algorithm. Sort a copy of the 50,000 outputs for percentiles. Use linear interpolation at position `(N−1)q` for `q = 0.025` and `q = 0.975`; display these endpoints as the central 95% interval. Use exactly 30 equal-width bins spanning the finite sample minimum and maximum. Place an observation equal to the maximum in the last bin. The chart's horizontal display range must also include the nominal output and sample mean, even when either lies outside the sampled minimum/maximum; place the sample bins at their true positions in that wider range so both markers remain visible without changing the sampled histogram counts. For a constant output, draw one bar at the sampled value's true position with a fixed visible SVG width; label the axis with the exact value and do not imply a nonzero data range. Still extend the display range if needed to show a marker.

Draw the chart as inline SVG made from DOM nodes: bars, axes, labels, legend, and two distinct vertical markers for the nominal output and sample mean. Provide an accessible chart title/description; keep the numerical summary visible as ordinary HTML text. For the built-in formula and its matching unit labels use **Mass (g)**; otherwise label the output **Result (unit not inferred)**. When results are present, show mean, standard deviation, P2.5–P97.5, sample count, and seed. If the nominal inputs still match the built-in example, the nominal marker is 390 g.

### Local Static File Server

Implements `prd.md > The Core Journey` and the local-only boundary. Python’s standard static server serves files from `public/` and binds only to loopback. It has no routes that accept or calculate user input. No browser-to-server form requests are made.

## Data Model

- **Input row:** `{ id, name, nominal, sigma, unit }`. The form is the editable source; on Run, validate and copy values into a temporary simulation input structure. Unit is display-only and may be blank.
- **Expression:** one string in the expression field; parsed only when Run is selected after successful row validation.
- **Fixed settings:** sample count `50_000`, seed `42`, histogram bins `30`; constants in the simulation module, not user-editable controls.
- **Transient result:** nominal output, sample mean, sample SD, two percentile endpoints, sample count, seed, and 50,000 output values used to form the histogram. Lives only in browser memory. Editing an input or formula clears it. Refreshing or closing the page restores the built-in example and clears all prior values/results.

No user data is written to files, cookies, local storage, or a server.

## File Structure

```text
uncertaintylab/
├── public/                    # Only files exposed by the local HTTP server
│   ├── index.html             # One-page workspace markup
│   ├── styles.css             # Responsive scientific-notebook styling
│   ├── app.mjs                # Form state, validation, event wiring, result view
│   ├── expression.mjs         # Tokenizer, bounded parser, AST evaluator
│   ├── simulation.mjs         # Seeded PRNG, normal draws, stats, histogram bins
│   └── histogram.mjs          # Accessible inline SVG chart renderer
├── tests/
│   ├── expression.test.mjs    # Grammar, precedence, allowlist, rejection cases
│   └── simulation.test.mjs    # Nominal mass, determinism, stats, histogram edges
├── devpost/
│   ├── scope.md               # Approved product boundary
│   ├── prd.md                 # Approved product requirements
│   ├── spec.md                # This technical blueprint
│   └── learner-profile.md     # Local-only profile; excluded from public repository
├── .gitignore                 # Excludes local skill/profile/build artifacts
├── LICENSE                    # To be added in the ship-preparation phase
└── README.md                  # Local start/test instructions and demo overview
```

The installed `.agents/skills/` directory and its lock metadata support the local learning workflow, not the app; keep them out of the public app contents. The file server’s `--directory public` setting ensures even the workspace’s planning docs are not served.

## External Services and Dependencies

There are **no runtime external services or third-party code dependencies**. The browser’s standard HTML, CSS, ES modules, `Math`, and SVG facilities run locally. Python’s standard library provides only static file serving. Node’s built-in test runner is optional and used only to run unit tests.

Documentation references: [Python `http.server`](https://docs.python.org/3/library/http.server.html), [JavaScript `Math`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math), [SVG](https://developer.mozilla.org/en-US/docs/Web/SVG), and [Node.js test runner](https://nodejs.org/api/test.html). No keys, accounts, network calls, rates, or costs apply.

## Important Failure Modes

- **Missing browser features or JavaScript error** → show a concise startup/error state; require a current browser with ES modules and SVG support.
- **Invalid expression, row, or sampled value** → keep inputs visible, announce an actionable inline error, and show no stale or partial chart.
- **Port 8000 is occupied or Python is unavailable** → explain how to select another local port or install/use an existing Python 3 interpreter; do not switch to a cloud host.

## What Was Simplified and Why

- **Browser-local calculation** instead of a Python API/backend — the page has one user and no shared data; this removes a service boundary while preserving actual Monte Carlo sampling.
- **A small AST reader and allowlist** instead of arbitrary Python or a general-purpose formula engine — it meets the expression requirement without executing user code or adding a dependency.
- **Hand-drawn SVG histogram** instead of a charting package — one chart needs only bars, labels, and two markers; no package or network load is warranted.
- **Fixed 50,000 samples, seed 42, and 30 bins** instead of settings panels — these are enough for the defined demo and keep repeatability visible.
- **In-memory input/result state** instead of saved projects — the user can immediately demonstrate the core loop without accounts or data-management features.

## Decisions and Open Issues

- **User delegation:** the user explicitly authorized the assistant to decide remaining technical and architecture details, prioritizing completion, clarity, reproducibility, demo quality, and the approved PoC boundary. The following stack and implementation choices are assistant-selected under that delegation, not attributed as learner preferences.
- **Browser-first stack:** chosen over a Python backend to remove APIs, packages, startup coordination, and a second runtime in the critical path; the accepted tradeoff is that calculations are tied to the local browser engine.
- **Seeded generator and normal transform:** Mulberry32 plus Box–Muller is small enough to explain and makes repeated runs deterministic. Repeated runs in the same browser engine with the same app source and inputs are the reproducibility target; the last floating-point bits are not promised to match across different browser engines.
- **Numerical conventions:** use Welford sample SD, linear interpolation for percentiles, and explicit histogram edge rules to make summary behavior testable.
- **Input bounds:** cap the PoC at 16 variable rows and 512 expression characters/64 AST levels; these bounds protect the small parser/UI from accidental oversized input without creating an advanced model limit.
- **Exposure boundary:** serve only `public/` over loopback to avoid exposing the profile and planning files to the browser server.
- **Learner uncertainty:** no specific technical uncertainty was expressed in the conversation or profile. No learning question is inferred. The build will verify the practical runtime and repeatability in the available browser.
- **Remaining open issues:** none block implementation. Browser timing and visual clarity are empirical checks in `5-build`; licensing and learner-authored submission fields are handled in `6-ship` before any public action.
