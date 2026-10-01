---
doc: scope
status: approved
---

# UncertaintyLab

A local, equation-driven Monte Carlo proof of concept for seeing how uncertain inputs spread into a calculated result.

## The Unique Kernel
Quickly visualize how uncertainty in measured inputs propagates through a user's mathematical model, without manually deriving propagation formulas. The workflow stays local and gives an immediate, interpretable output distribution.

## Who It's For
Scientists, engineers, students, and technical professionals working with uncertain measurements. The first demonstrator is an engineer estimating the mass of a rectangular sample from uncertain dimensions and density; the current alternative they want to avoid is manually deriving propagation formulas.

## The Core Loop
Enter uncertain input values and a mathematical expression, run an independent-normal Monte Carlo simulation locally, then inspect the output distribution and summary statistics. Each displayed ± uncertainty is the normal distribution's standard deviation (1σ), centered at the nominal value; this meaning must be explicit in the interface and documentation. The intended example computes mass as length × width × thickness × density.

## Inspiration & Identity
No visual or product reference has been named. The experience should make the numerical result quick to understand; detailed visual direction belongs in the PRD.

## Why This Matters to the Learner
The learner's stated immediate goal is to complete a solid demo. A more personal motivation has not been established.

## What "Working" Looks Like
On the screen, a user can run the rectangular-sample mass example with uncertain dimensions and density and see a mass distribution, mean, standard deviation, central 95% percentile interval (P2.5–P97.5), and a simple visualization. The uncertainties are propagated by Monte Carlo rather than a manually derived formula. Repeating a run with the same inputs and sample count produces exactly the same result using the fixed seed, which is shown to the user.

## Acceptance Criteria
- The built-in example uses length = 10.0 ± 0.2 cm, width = 5.0 ± 0.1 cm, thickness = 1.0 ± 0.05 cm, and density = 7.80 ± 0.10 g/cm³. Each ± is explicitly labeled as 1σ.
- The expression `length * width * thickness * density` evaluated at the nominal inputs equals 390 g; all example units remain coherent in cm, g, and g/cm³.
- The simulation displays the output distribution, mean, standard deviation, and central 95% percentile interval P2.5–P97.5.
- A fixed seed (42) is visible in the results; identical inputs, sample count, and seed reproduce identical simulation outputs.
- The expression parser accepts only user-declared variable names, `+`, `-`, `*`, `/`, `**`, parentheses, and the functions `abs`, `sqrt`, `exp`, `log`, `sin`, and `cos`. `log` is the natural logarithm and trigonometric inputs are radians. The parser does not use `eval` and rejects arbitrary Python, imports, attribute access, and other syntax.

## The POC Boundary
- One end-to-end local workflow for numeric uncertain inputs and a mathematical expression.
- Independent normal input distributions and Monte Carlo sampling, with each input represented as Normal(μ = nominal value, σ = stated ± value).
- Clearly label each input ± value as 1σ in the interface and documentation. Do not interpret input ± values as interval bounds, confidence bounds, or any alternative to 1σ in this proof of concept; the requested output percentile interval remains in scope.
- A restricted, non-`eval` expression grammar with user-declared variables, basic arithmetic, parentheses, and a small allowlist of mathematical functions.
- Deterministic repeatability with a fixed, visible seed of 42.
- One built-in rectangular-sample mass example as the initial demonstration; a second example is optional only after the core loop is complete.
- No GPU, paid services, or external APIs.

## Later
- Additional distribution families.
- Correlations between inputs.
- Automatic unit conversion.
- Additional examples and advanced statistical modeling.

## Explicitly Cut
- Cloud execution and external services: the project must run locally at zero cost.
- Advanced modeling features that are not needed to demonstrate uncertainty propagation in the single core workflow.
