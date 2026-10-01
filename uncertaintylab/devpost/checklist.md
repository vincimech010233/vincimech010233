---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Run the seeded mass example locally**
  Becomes usable: A local page opens with the built-in rectangular mass example; Run Simulation calculates 50,000 outputs and shows the Mass (g) histogram, nominal/mean markers, and summary statistics. The example values and expression are displayed; editing arrives in slice 2.
  Why now: This first end-to-end slice proves the unique kernel—expression evaluation, uncertainty sampling, and a visible output distribution—before spending time on editing and polish. Bootstrapping stays inside this runnable slice.
  PRD ref: `prd.md > The Core Journey` (steps 1, 3–4), `prd.md > Features and Behavior > Simulation and Results`
  Spec ref: `spec.md > Stack`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > Components > Restricted Expression Reader`, `spec.md > Components > Monte Carlo Simulation`, `spec.md > Components > Results and Histogram`, `spec.md > File Structure`
  Build: Create the `public/` page and modules from the spec, serving only `public/` over loopback. Implement the bounded allowlist AST reader, fixed-seed independent-normal simulation, summary statistics, and SVG histogram for the preloaded mass example. Add focused Node built-in tests and the local start command to README.
  Verify (mechanical): Run `node --test tests/*.test.mjs`; start the specified Python server and request `/`, `/app.mjs`, and `/simulation.mjs` from `127.0.0.1`, confirming each returns successfully and the repository root is not served.
  Learner check: Open the local page, run the mass example, and report whether the histogram, markers, and summary make the result easy to understand at a glance.
  Commit: `Build runnable seeded mass simulation`

- [x] **2. Edit the model and handle invalid input clearly**
  Becomes usable: The full one-page workspace has editable rows and expression, can add/remove rows, runs the same reproducible simulation for the current model, and gives clear errors without stale or partial results.
  Why now: With the calculation path proven and early presentation feedback captured, this slice completes the user-controlled core loop and its important failure states without adding a backend or new statistical features.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Features and Behavior > Input Table and Expression`, `prd.md > Features and Behavior > Simulation and Results`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Components > Workspace and Input Validation`, `spec.md > Components > Restricted Expression Reader`, `spec.md > Components > Results and Histogram`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Make the four example rows and expression editable; add/remove up to the spec limit; validate names, finite values, σ, and grammar; preserve unit text as optional display-only labels without conversion or validation; clear results on edits; render inline errors and empty/run states; apply responsive styling, semantic labels, SVG descriptions, and safe text rendering. Add tests for rejection/error boundaries and document any actual adjustments from early feedback within the PRD/spec boundary.
  Verify (mechanical): Run `node --test tests/*.test.mjs`; start the local server, load the page, execute the built-in example, edit a value and rerun, then exercise invalid names/expression and verify no stale/partial chart remains. Confirm narrow viewport layout and that the HTTP server serves only `public/`.
  Learner check: Try the full workflow, change one input and rerun, then try one invalid expression and report anything confusing, broken, or worth changing.
  Commit: `Complete editable uncertainty workflow`

## Hands-on Checkpoints

- [x] Early usable behavior explored — after slice 1; the learner reported no changes before Slice 2.
- [x] Final kick-the-tires exploration and feedback completed — after slice 2; the learner tested initial run, edited input/rerun, invalid expression, and reload restoration; reported the visualization and layout clear with no changes.

## Final Review

- [x] Final review complete — feedback resolved; the learner reported “sin cambios” and explicitly asked to close `5-build` and continue to `6-ship`, confirming readiness for shipping preparation.

## Code Tour and App Map

- [x] Learning activity complete — evidence-based recap connected the mobile histogram sizing investigation and result-state race to measured browser behavior and the fixed-seed acceptance tests.
- [x] Optional edit and transfer reflection addressed — no code edit was needed; one optional transfer question is offered with the app map.
- [x] `devpost/app-map.html` generated from finished code, checked at wide and narrow viewports, and shown; it includes a project-grounded testing practice.

Activity and evidence: Focused recap of the mobile SVG viewBox mismatch (container 330 px; current viewBox 330×360 at 390×844) and the stale-result race found by CRITIC; removed the extra frame yield, then 12/12 tests and the learner's final end-to-end review passed. No implementation issues were reported by the learner.
Route and stops: Reference route in `devpost/app-map.html`: `public/index.html` / `public/app.mjs` (`readRows`, `handleRun`) → `public/expression.mjs` (`parseExpression`, `evaluateExpression`) → `public/simulation.mjs` (`runSimulation`, `createHistogram`) / `public/histogram.mjs` (`renderHistogram`).
Edit outcome: No optional code edit; the app is complete and the user reported no requested changes.
Reflection: One optional transfer question is offered with the map; no answer is required to continue.
Activity mode: Evidence-based focused recap of a real build investigation, plus the learner's live app review; route is labeled as a reference rather than a completed editor tour.

## Revisions

- Slice 1 implementation committed as `9b23044` (`Build runnable seeded mass simulation`). Automated and local HTTP checks passed. The learner completed the early review with “sin cambios; continúa”.
- Slice 2 validated with 12/12 Node tests, local HTTP checks (including expected 404s for Devpost paths), and mobile/desktop browser runs. A mobile module-cache mismatch was retained as an observed failed visual check, then resolved by versioning the histogram module import; the 390 px viewport now renders a 330×360 SVG without page-level overflow.
- CRITIC found a possible result-state race caused by yielding after showing the results panel. Removed the second animation-frame wait; the final Slice 2 CRITIC audit returned PASS. No product-scope change.
- Final learner checkpoint completed: initial run, length edit/rerun, invalid-expression error, and reload restoration all behaved as expected; learner found the visualization and layout clear and requested no changes. This is the learner's confirmation to close `5-build` and proceed with shipping preparation.
- Added the offline app map and demo shot list after implementation. The app map's source snapshot is commit `9b0fe6e`; map and wrap-up record are committed separately. Final Devpost copy remains learner-authored.
