---
doc: prd
status: approved
---

# UncertaintyLab — Product Requirements

A local Monte Carlo workspace for technical users who need a quick, visual estimate of how uncertain measurements affect a model result.

## The Core Journey

1. The user opens UncertaintyLab and immediately sees the preloaded rectangular-sample mass example. No setup, login, navigation, or configuration is required. The results area shows a brief prompt until a simulation is run. **Source:** `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.
2. The user edits the input table and, if needed, adds or removes a variable. They can edit the mathematical expression using the displayed expression rules. **Source:** `scope.md > The Core Loop`, `scope.md > The POC Boundary`.
3. The user selects **Run Simulation**. If inputs and expression are valid, the app samples independent normal inputs using the fixed seed 42. **Source:** `scope.md > The POC Boundary`, `scope.md > Acceptance Criteria`.
4. Results appear directly below the inputs on the same page. The histogram is the main visual; it distinguishes the nominal result from the Monte Carlo sample mean. A compact panel shows the mean, standard deviation, central 95% interval (P2.5–P97.5), sample count, and seed. **Source:** `scope.md > What "Working" Looks Like`, `scope.md > Acceptance Criteria`.
5. If the user edits an input or expression after a successful run, the previous results are cleared and the results area returns to its run prompt. Reloading the page restores the built-in example. **Product decision:** avoid presenting results that no longer match the visible inputs, and avoid adding data storage to the local PoC.

## Screens and Layout

One responsive page, in this order:

1. Title **UncertaintyLab** and the subtitle **Explore how input uncertainty propagates through a mathematical model**.
2. A short explanation that inputs are modeled as independent normal distributions and each ± value means 1σ.
3. An editable input table with name, nominal value, uncertainty (1σ), and unit columns. The mass example is preloaded.
4. An editable expression field prefilled with `length * width * thickness * density`.
5. A prominent **Run Simulation** button.
6. The results area directly below the inputs. On wide screens, place the compact statistics panel beside the histogram; on narrow screens, stack it after the histogram. The histogram stays first. No tabs or hidden panels.

**Source:** `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

## Look and Feel

A quiet scientific-notebook feel: warm off-white background, dark ink text, restrained teal and blue accents, clear labels, and readable system fonts. Use monospaced styling only for the equation and numeric values. The histogram uses a simple, high-contrast palette with distinct line styles for the nominal value and sample mean. Avoid gradients, decorative animation, external fonts, and generic chat-style visuals.

**Product decision:** this style emphasizes legibility and makes the chart and numerical result the focus; it needs no external assets or network access.

## Features and Behavior

### Input Table and Expression

- Start with four rows: `length` = 10.0 ± 0.2 cm, `width` = 5.0 ± 0.1 cm, `thickness` = 1.0 ± 0.05 cm, and `density` = 7.80 ± 0.10 g/cm³.
- **Product decision:** allow adding and removing variables so the app can handle expressions beyond the four-variable example; require at least one row. A newly added row is blank and must be completed before running.
- Variable names are unique identifiers: they start with a letter or underscore and contain only letters, digits, and underscores. A name cannot collide with a supported function name.
- Nominal values must be finite numbers. Uncertainty values must be finite and nonnegative; 0 means that input is fixed at its nominal value. Unit text is an optional informational label (blank for dimensionless inputs). The user is responsible for keeping units coherent; the app does not convert or validate units.
- The expression is editable. It accepts declared variable names, `+`, `-`, `*`, `/`, `**`, parentheses, and the functions `abs`, `sqrt`, `exp`, `log`, `sin`, and `cos`. `log` is the natural logarithm; trigonometric inputs are radians. Other expressions, arbitrary Python, imports, attribute access, and unsupported syntax are rejected.
- For the unchanged built-in expression and units, the output label is **Mass (g)**. If the expression or displayed units change, use **Result (unit not inferred)**; the app does not infer units.

**Source:** `scope.md > The Core Loop`, `scope.md > The POC Boundary`, `scope.md > Acceptance Criteria`.

### Simulation and Results

- Use independent normal samples, with each input represented as Normal(μ = nominal value, σ = stated ± value). The fixed sample count and its presentation are specified in `spec.md`.
- Use the fixed seed 42 and display it so repeating a run with the same inputs produces the same simulation output.
- Show one simple histogram with distinct markers and a legend for the nominal output (expression evaluated at nominal inputs) and Monte Carlo sample mean.
- Show the mean, standard deviation, P2.5, P97.5, sample count, and seed in the compact summary. Present P2.5–P97.5 as the central 95% percentile interval. Statistical implementation conventions are specified in `spec.md`.
- If inputs, names, or the expression are invalid, keep the edited values, show a clear inline error, and do not run or display partial results.
- If any simulated sample produces a non-finite output (for example, division by zero or a value outside `sqrt`/`log`'s domain), stop the run and show an error. Do not silently discard invalid samples or present a partial histogram, since that could bias the distribution.
- Editing any input or the expression after a successful run clears that result. The user can run again to see a distribution for the current values.

**Source:** `scope.md > What "Working" Looks Like`, `scope.md > Acceptance Criteria`.

## States and Boundaries

- **First use:** the mass example and formula are loaded; the results area invites the user to run the simulation.
- **Valid result:** histogram first, statistics immediately beside it or below it, with distinct nominal and mean markers. For the built-in example, show the **Mass (g)** label and nominal value **390 g**; include the mean, standard deviation, P2.5–P97.5 interval, sample count, and seed 42.
- **Invalid input/expression:** inline error explains what needs correction; current edits remain visible and no partial output appears.
- **Undefined simulated output:** the run stops, reports that at least one sample was invalid, and shows no partial distribution.
- **Edited after a result:** old results are cleared to prevent confusion with the changed inputs.
- **Reload:** restore the built-in example; do not persist user data between page loads.
- **Units:** labels are displayed but not converted or checked. Help text reminds users to keep quantities dimensionally coherent.

## User-Stated Choices and Assistant Decisions

- **User-stated choices from the approved scope and later direct requirements:** one local workflow; an independent normal model where ± means 1σ; the example and units; fixed seed 42; central 95% output interval; restricted expression syntax; one primary example; the single-page workspace, its first-screen content, and the histogram-first results layout; no GPU, APIs, conversion, correlations, or extra distribution families.
- **Assistant decision — dynamic variables:** allow adding/removing rows, with at least one row required. This preserves the user's ability to try a different expression while keeping the same single-page workflow.
- **Assistant decision — fixed sample count:** use 50,000 samples and do not expose a sample-count control. This gives a smooth demo histogram without adding an advanced settings surface; local run time will be measured during validation.
- **Assistant decision — histogram and statistical conventions:** use a fixed 30-bin histogram and sample standard deviation with denominator N−1. These choices keep the display compact and use a familiar estimate; details are specified in `4-spec`.
- **Assistant decision — unit labels:** display units as labels and leave unit consistency to the user. Conversion and dimensional validation would expand the PoC.
- **Assistant decision — no persistence:** reload to the built-in example rather than saving browser data; this is simpler and avoids retaining scientific inputs unexpectedly.
- **Assistant decision — errors:** fail clearly on invalid or non-finite samples instead of silently dropping them, preserving an honest interpretation of the simulated distribution.
- **Assistant decision — visual style:** use a restrained scientific-notebook presentation for legibility, with no external visual dependencies.

## What We're Building

- A local, single-page app with the built-in mass example loaded at first open.
- Editable numeric input rows, an editable restricted mathematical expression, and a prominent simulation action.
- A reproducible independent-normal Monte Carlo run with fixed seed 42 and a fixed sample count.
- A histogram-first results view with nominal and sample-mean markers, mean, standard deviation, central 95% interval, sample count, and seed.
- Clear input/expression/simulation error handling and no stale or partial results.

## Deferred From the POC

- User-configurable distributions, correlations, seed, or sample count: the approved demo uses independent normals, seed 42, and a fixed sample count.
- Saving, loading, exporting, or comparing simulation runs: these are not needed to demonstrate the core propagation loop.
- Unit conversion or dimensional validation: users keep units coherent; automatic unit handling would expand the work.
- Additional examples and advanced statistical models: the mass example is the initial demonstration; consider another only after the full loop is complete.

## Possible Later Enhancements

After the PoC works end to end, possible later directions include additional distribution families, correlated inputs, unit-aware results, adjustable simulation settings, and saved comparisons.

## Non-Goals

- Accounts, cloud execution, external APIs, or remote services; the app runs locally at zero cost.
- GPU acceleration; the small CPU simulation is sufficient for the proof of concept.
- Arbitrary code execution or a Python console; expressions stay within the restricted allowlist.
- Automatic unit conversion or dimensional analysis.
- A full statistical workbench, multi-run comparison dashboard, or advanced modeling suite.

## Open Questions

None that block the specification. Implementation and performance details will be resolved in `spec.md`.
