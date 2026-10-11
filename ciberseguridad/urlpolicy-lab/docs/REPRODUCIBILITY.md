# Reproduction and evidence

## Functional reproduction

Use the commands in the README from the repository root. All fixtures are local;
no pip packages or network services are required. The suite's 38 methods contain
subtests, 600 integer-oracle IPv4 cases, 1,000 DNS-authority metamorphic cases and
10,000 fuzz strings. These are not 11,638 independently audited vulnerabilities.

The standalone fuzz runner uses the same seed, alphabet and generation order as
the fuzz test. Its length-prefixed UTF-8 input-stream digest identifies the corpus
for this recorded interpreter. Output labels, runtime and memory are environment
dependent. A digest is an integrity check, not an origin/authorship certificate.

## Optional kernel-isolated validation

`python3 -I -S tools/offline_audit.py` requires existing Linux x86_64 installations
of `/usr/bin/python3`, bwrap, strace, prlimit, timeout and libseccomp at the path
recorded in the guard. It never installs dependencies and must run as non-root.
Read `tools/offline_audit.py` and `tools/kernel_guard.py` before executing them.

The host supervisor imports no production module. It makes a temporary copy,
rejects repository symlinks, excludes Git/bytecode/build directories, and binds
only that copy read-only into the child. The child has a new network namespace,
only loopback, no IPv4 routes and no effective capabilities. Seccomp is installed
before project code and prohibits socket creation/network calls, process creation,
exec, namespace/mount changes and changes to resource limits.

| Bound | Value |
| --- | --- |
| Address space | 256 MiB |
| CPU | 10 seconds per functional run; 1 second hard limit for the CPU control |
| Wall time | 15 seconds per child; 18-second host supervision cap |
| Individual child file | 4 MiB |
| Writable workspace | 16 MiB tmpfs, only `/work` |
| Open file descriptors | 64 |
| Captured stdout + stderr | 1 MiB per run |
| Individual trace | 4 MiB |

Before importing the product, preflight verifies denial reasons, effective
limits, read-only mounts, capabilities, no-new-privileges, seccomp and network
namespace separation. Expected negative controls include EPERM for sockets/fork/
exec/limit changes, EROFS for source writes, EFBIG for file limits, ENOSPC for
storage limits and MemoryError for the address-space limit. A CPU loop is expected
to terminate within five seconds; that intentional termination is not a passing
functional test.

`--preflight-only` performs the isolation checks without importing the product.
Failed and inconclusive runs remain in their temporary evidence directory.
The full runner then runs the 38-method suite and standalone fuzz reproduction,
and prints the evidence directory. Raw traces are local evidence; public summaries
omit machine-specific paths and credentials. Tools or kernel settings may make
strict reproduction BLOCKED on a different system; the runner never silently
falls back to executing the project without isolation.

## What was tested, and by whom

`evidence/validation.json` records the fresh portfolio run and environment.
`evidence/tests.log` and `evidence/fuzz.json` preserve its results. The source
provenance file identifies the earlier approved package and its digest. Historical
failures and full isolation traces remain in the preparer's local audit archive;
they are not included as private host logs in this public preparation.

The original audit, portfolio preparation, reruns and critical review were
performed with Codex assistance. A separate critic used the same model and
shared environment. This is not an external independent audit or certification.
Actual GitHub execution, other Python versions and real application integration
have not been verified by these local runs.
