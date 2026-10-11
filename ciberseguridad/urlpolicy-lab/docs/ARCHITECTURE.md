# Architecture and decisions

## Repository layout

```text
urlpolicy_lab.py       production classifier, loaders, comparison and CLI
tests/                38 existing unittest methods
examples/             17 illustrative cases and fabricated observations/report
tools/                reproducible validation and optional isolation harness
evidence/             sanitized run results, provenance and integrity manifest
docs/                 design, scope, reproduction and professional presentation
```

The single production module is intentional: the current workflow does not
justify a framework, server, packaging dependency or multiple abstraction layers.

## Data flow

`main` uses `argparse`, `load_cases` and optional `load_observed`. `load_json`
checks existence/stat size, reads at most `MAX_BYTES + 1`, decodes UTF-8 and rejects
duplicate object keys through `_unique_object`. Schema loaders reject invalid
types and duplicate IDs; `audit` rejects observations for unknown case IDs.

`classify` checks length, controls, schemes, userinfo, fragment delimiters, authority
syntax and ports before classifying a literal with `ipaddress`. ASCII DNS labels
are validated but never resolved. Selected IPv6 mapped/tunnel forms are explicitly
blocked. Remaining literals must be global and non-multicast for this interpreter.

`audit` combines the reference label and supplied observation into PASS, FAIL,
WARN or UNTESTED. `atomic_json` uses `mkstemp`, serializes JSON and calls `os.replace`,
cleaning the temporary file even when replacement fails. `main` maps handled
input/IO errors to exit 2 and hard comparison failures to exit 1.

## Decisions and tradeoffs

| Decision | Reason and consequence |
| --- | --- |
| Standard library only | Reduces installation needs; it does not make dependencies or Python's parser infallible. |
| No DNS or HTTP | Makes local synthetic testing repeatable; connection safety is intentionally unresolved. |
| Conservative raw authority checks | Rejects ambiguous forms before the normal parser; some legal URIs are deliberately rejected by this policy. |
| Explicit REVIEW_DNS | Prevents string parsing from being mistaken for verified destination safety. |
| Independent integer masks for selected IPv4 ranges | Avoids using `ipaddress` as both implementation and oracle for those 600 cases; not a full registry oracle. |
| Atomic output | Reduces partial-report risk and rejects an existing final-path symlink; does not constrain arbitrary caller-selected output directories. |
| Permissive comparison of public literals | Blocking a public literal is acceptable for this security comparison; availability is not tested. |

## Verdict semantics

Missing or SKIPPED observations are UNTESTED. A reference BLOCK with observed
BLOCK passes, with observed ALLOW fails, and with REVIEW warns. A reference
REVIEW_DNS always warns when an observation is present. A reference ALLOW_LITERAL
passes with either observed BLOCK or ALLOW, and warns with REVIEW.

This design allows an all-blocking application to pass. It should not be used
as an application correctness or service-availability test. Exit 0 means only
that the comparison contains no hard FAIL.

## API boundary

The CLI schema loaders are the supported boundary for untrusted local JSON.
Direct callers of `audit` and `atomic_json` must provide the documented structures
and a trusted output parent. `classify` handles non-string arguments by returning
BLOCK. No claim is made that every internal function validates arbitrary objects.
