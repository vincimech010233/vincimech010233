# Professional presentation

Use these as project descriptions. They do not assert employment, paid client
audits, independent certification or personal authorship beyond documented evidence.
The authorized portfolio destination is
https://github.com/vincimech010233/vincimech010233/tree/main/ciberseguridad/urlpolicy-lab.

## GitHub short description

Offline Python QA for webhook URL policies: synthetic fixtures, bounded JSON
inputs, regression tests and reproducible fuzzing. No network requests.

## Five topics

`application-security` · `python` · `defensive-security` · `security-automation` · `fuzz-testing`

## CV description

**URLPolicy Lab — defensive Python security portfolio project**

Local URL-policy classification and observation comparison with bounded JSON
validation, explicit uncertainty labels and atomic reporting. Includes 38 automated
test methods and reproducible 10,000-input robustness fuzzing. Codex-assisted
preparation and review; runtime SSRF protection and external certification are
outside scope. Validated on Linux / CPython 3.12.3.

## LinkedIn description

URLPolicy Lab is a defensive security portfolio project exploring how to test
outbound webhook URL policies without contacting a network. It provides synthetic
fixtures, strict local JSON validation and an observation-comparison report.
The repository documents architecture, threat boundaries, 38 automated tests and
seeded 10,000-input robustness fuzzing. Preparation and review used Codex assistance;
the results do not establish real vulnerability discoveries or runtime SSRF protection.

## Brief interview explanation

The CLI loads bounded local case and observation files, classifies each URL string,
and compares the application's supplied decision with an illustrative reference
policy. DNS names remain REVIEW_DNS because string parsing cannot establish the
connected destination. Reports are atomically replaced, while tests exercise input
limits, malformed authorities, verdict semantics and failure handling. The project
is deliberately small and documents the limits of each piece of evidence.

## Three interview questions and code-based answers

### 1. Why not mark a syntactically valid hostname as safe?

`classify` returns REVIEW_DNS after validating DNS labels. It performs no resolution
or connection. DNS answers, redirects and the HTTP client could change the actual
destination, so the tool cannot conclude connection safety. `audit` maps a present
observation for REVIEW_DNS to WARN.

### 2. How does the tool enforce the JSON byte limit despite a stale stat?

`load_json` first checks the path and stat size, then reads at most MAX_BYTES + 1
from the binary file and checks the bytes actually read before UTF-8 decoding.
The stale-stat regression mocks `Path.stat`; duplicate keys are separately rejected
by the JSON object-pairs hook. Nested JSON errors are converted to InputError.

### 3. What do the fuzz results and exit code 0 actually prove?

The seeded fuzz test checks that 10,000 generated strings produce valid labels,
string reasons and deterministic results without uncaught exceptions. It is not
a semantic oracle or completeness proof. Exit 0 means no hard comparison FAIL;
WARN or UNTESTED may remain, and blocking a public literal can PASS. The tests
explicitly preserve those semantics rather than calling them complete protection.
