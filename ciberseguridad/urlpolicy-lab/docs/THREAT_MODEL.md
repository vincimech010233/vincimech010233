# Threat model

## Assets and trust boundaries

Protect the local QA process against malformed input causing misleading labels,
unhandled errors or uncontrolled input growth. Preserve existing reports against
partial replacement. Keep the distinction between reference-policy labels and
unverified application observations explicit.

Inputs may be malformed or intentionally ambiguous synthetic URL strings and
local JSON files. Observation files are assertions supplied by the caller, not
authenticated evidence from a real application. The Python interpreter and
standard library, test harness and output parent directory are trusted.

## Controls exercised

Bounded reads, maximum case count, constrained case IDs, type validation,
duplicate keys/IDs rejection, explicit authority/port handling, controlled CLI
errors, final-output-symlink rejection, temporary-file cleanup and atomic replace.
The tests exercise invalid UTF-8, deeply nested JSON and a stale stat/read-size
scenario. URL classification returns BLOCK for inputs beyond its length limit.

## Filesystem assumptions

The application accepts caller-selected input/output paths and can replace an
existing regular output file. It does not constrain writes to a project directory.
Input symlinks and symlinked parent directories are not prohibited. Atomic output
does not defend against an attacker controlling parent-directory components or
their replacement, and does not promise durable storage after power loss.
Use a trusted directory and ordinary user permissions.

The optional audit harness provides a separate OS boundary: source/runtime/proc
are read-only and only a bounded temporary workspace is writable. That protection
is not automatically active when invoking the CLI normally.

## Explicit exclusions

No actual HTTP client, DNS resolution/rebinding, DNS timing, redirect chain,
connection-time pinning, client-parser equivalence, proxy, TLS or egress control
is tested. There is no active scanning or third-party exploitation workflow.
Literal-address classification follows the selected interpreter; an accepted
literal is not proof of a safe route or connection. IPv6 coverage is selective,
not a complete embedded-address or translation-policy analysis.

The illustrative fixtures are not exhaustive. Fuzzing is bounded string
robustness testing, not proof of semantic correctness. PASS does not establish
absence of vulnerabilities, and no real vulnerability discovery is claimed.
False positives, business-policy compatibility and application availability are
outside the current comparison.

## Residual limitations

Errors may contain caller-provided filenames or IDs. Do not put secrets in
inputs/paths or publish raw private logs. JSON reports include the supplied URLs.
Review output before sharing it. No hardening against hostile terminals or
shared filesystem attackers is claimed.
