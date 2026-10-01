# UncertaintyLab — Demo Shot List

Use this as a recording checklist, not as narration or Devpost submission copy. Target about 2 minutes for a screen recording of the working app on the device/browser it was built for. The overview describes a 1–3 minute video; the detailed rules say it should be under 3 minutes and state no minimum, so stay below 3 minutes and recheck the live rules before uploading.

## Suggested sequence (~2 minutes)

1. **Start screen (10–15 seconds)** — show the preloaded length, width, thickness, density, expression, unit labels, and the independent-normal / 1σ note.
2. **Baseline run (25–35 seconds)** — press **Run Simulation**. Keep the histogram, nominal and mean markers, **Mass (g)** label, percentile interval, SD, sample count, and seed visible long enough to read.
3. **Propagate an edit (25–35 seconds)** — change `length` from 10 to 11, run again, and show the updated histogram and summary. Restore the original model by reloading the page.
4. **Invalid-input recovery (15–20 seconds)** — enter `length + * width`, run, and show the inline error with no stale result. Reload to end on the clean built-in example.

## Capture checklist

- Keep the total video below 3 minutes; the current hackathon rules require a public YouTube or Vimeo link.
- Show the app functioning in the browser. A deployed site is not required for this local-first POC.
- Use a clean desktop/browser window; exclude credentials, personal notifications, unrelated tabs, and local paths from the recording.
- Do not add third-party logos, trademarks, music, or other copyrighted material unless permission covers their use.
- Keep any narration, on-screen text, and subtitles in English, or provide the English translation required by the hackathon rules.
- The learner records, reviews, and uploads the final video; no recording or upload has been made.

## Verified recording facts

- The built-in model's nominal result is **390 g**.
- Seed 42 with 50,000 samples displays mean **389.95 g**, sample SD **23.017 g**, and P2.5–P97.5 **345.39–436.22 g** in the verified browser run.
- With length changed to 11, the verified seeded run displayed a changed result (mean **428.94 g**).
- Reload restores the built-in example. An invalid expression clears prior results and shows an inline parser error.

Rules checked on 2026-10-01: [Build With AI: Basics — overview](https://learn-ai-basics.devpost.com/) and [official rules](https://learn-ai-basics.devpost.com/rules).
