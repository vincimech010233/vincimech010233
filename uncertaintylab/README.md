# UncertaintyLab

UncertaintyLab is a local-first web proof of concept for exploring how uncertain measurements propagate through a mathematical model. It solves one practical problem: estimate the distribution of a calculated result when the inputs are uncertain, without manually deriving an uncertainty-propagation formula.

The built-in scientific example estimates the mass of a rectangular sample from its length, width, thickness, and density.

## Features

- One-page workspace with an editable table of inputs and a mathematical expression.
- Monte Carlo simulation of 50,000 samples from independent normal input distributions.
- Fixed seed (`42`) for repeatable runs.
- Output histogram with nominal and sample-mean markers.
- Mean, sample standard deviation, central 95% percentile interval, sample count, and seed.
- A bounded mathematical expression parser; arbitrary Python and JavaScript are not executed.
- Inline validation and errors; invalid runs do not leave stale results visible.
- No backend, account, third-party runtime dependency, GPU, or external API.

## Requirements

- Python 3, to serve the static app locally.
- A modern browser with JavaScript modules and SVG support.
- Node.js 18 or newer only if you want to run the automated tests.

The runtime app has no package installation step.

## Run locally

From the repository root, start a static server bound to loopback and restricted to the app's `public/` directory:

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory public
```

Open <http://127.0.0.1:8000/>. On the first screen, inspect the preloaded model and choose **Run Simulation**. Stop the server with `Ctrl+C` when finished.

## Built-in example

The preloaded inputs are:

| Variable | Nominal value | Uncertainty (1σ) | Unit |
| --- | ---: | ---: | --- |
| `length` | 10.0 | 0.2 | cm |
| `width` | 5.0 | 0.1 | cm |
| `thickness` | 1.0 | 0.05 | cm |
| `density` | 7.80 | 0.10 | g/cm³ |

The expression is:

```text
length * width * thickness * density
```

Its nominal value is 390 g. The input units are already coherent; the app treats unit labels as display-only text and does not convert or validate dimensions.

## Monte Carlo method

For each of 50,000 samples, the app draws each input independently from a normal distribution centered at its nominal value. The uncertainty field is the distribution's standard deviation: `±` means **1σ**, not a confidence interval or a range. A seeded Mulberry32 uniform generator and Box–Muller transform provide the sample stream. The fixed seed is `42`.

The result panel reports the sample mean, sample standard deviation using the `N−1` denominator, and a linearly interpolated central percentile interval from `P2.5` to `P97.5`. The histogram uses 30 bins. The nominal result evaluates the expression at the nominal inputs and is shown separately from the simulated mean.

Re-running the same model with the same seed reproduces the same sample sequence in the same JavaScript math environment. Tiny floating-point differences can occur across browser engines. The seeded generator is suitable for this proof of concept, not research-grade or security-sensitive random sampling.

## Expression syntax

Expressions can use declared variable names, parentheses, unary `+`/`-`, binary `+`, `-`, `*`, `/`, `**`, and these one-argument functions: `abs`, `sqrt`, `exp`, `log`, `sin`, and `cos`. `log` is natural logarithm; trigonometric functions use radians. Numeric literals, unknown names, attributes, imports, arbitrary code, and unlisted functions are rejected. See [`devpost/spec.md`](devpost/spec.md) for the full bounded grammar.

## Run tests

From the repository root:

```sh
node --test tests/*.test.mjs
```

The tests cover expression parsing and rejection, the nominal 390 g result, seeded repeatability, simulation statistics and validation, and histogram edge cases.

## Privacy and local processing

The Python server serves static files from `public/` on `127.0.0.1`. All input validation, expression evaluation, simulation, and chart rendering happen in the browser. The app sends no requests to external services and writes no model values to files, cookies, local storage, or a server. Closing or reloading the page resets the workspace to the built-in example.

## Limitations

- Only independent normal input distributions are modeled. Correlations, other distributions, and confidence-interval interpretations are out of scope.
- Units are labels; automatic conversion and dimensional analysis are not implemented.
- Normal samples are not truncated, so an input near zero may produce physically impossible negative values. Review whether the normal and independence assumptions suit the real model before using its output.
- The random generator is intentionally compact and is not designed for scientific certification, cryptography, or safety-critical decisions.
- Results describe the chosen model and assumptions; they do not establish whether those assumptions match a real system.

## License

An MIT license file is included; confirm the copyright-holder notice in [`LICENSE`](LICENSE) before public release.
