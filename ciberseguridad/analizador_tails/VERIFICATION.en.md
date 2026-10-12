# Verification and provenance

[Español](VERIFICACION.md) · [English](VERIFICATION.en.md)

Date: October 12, 2026. Documentation review and packaging assisted by Codex.

## VERIFIED: local checks

- Both original ZIPs pass Python `zipfile` CRC checks.
- The original Tails and Linux scripts are identical and preserved byte for byte in this publication.
- Syntax is checked using `compile`, together with the `--help` command.
- Seven offline tests pass with simulated HTTP and proxy availability: CLI help, HTML content escaping, curl failure, missing Playwright, abort without a proxy, SOCKS proxy selection with remote name resolution, and preservation of old files when reusing the output folder.
- The old-file test verifies a program limitation, not a fix: use a new output folder.

From the extracted folder, repeat the tests with:

```bash
python3 -m unittest discover -s tests -v
```

These tests use local fixtures. They do not make HTTP connections, open a browser, or test Tor.

## OBSERVED: supplied code

Static mode uses curl; the dynamic phase uses Chromium managed by Playwright. The script does not automate Tor Browser or install its dependencies. The HTML escapes received content; `fuente_escapada.txt` contains raw text. Screenshots, when present, are viewed separately.

The comment about avoiding WebRTC leaks does not establish an explicit disabling mechanism. The code does not demonstrate absence of leaks or guarantee anonymity. Reports can save sensitive data received from a site, including headers and URL parameters.

## NOT_VERIFIED: pending checks

- Boot and execution in actual Tails/VMware and Linux/VMware environments.
- Package download from a Tails VM through Tor.
- Compatible, working Chromium/Playwright in Tails.
- Effective network containment, identification of the proxy as Tor, and absence of leaks.
- Actual browser screenshots and rendering.

## Publication scope

Documentation is improved, offline tests are included, and the ZIPs are repackaged. No analysis features are added to the original script. Each ZIP includes the guide, quick start, verification notes, tests, and original README to preserve provenance. The user's original files remain intact.

Both ZIPs now include Spanish and English documentation. Program help, option names, and reports remain in Spanish. The historical original README is preserved, with a separate English translation identified as such.

The general validation of the preparation workspace failed because of an existing missing or non-unique `event_id` in its historical log; the local diagnosis is preserved. That result is not presented as successful validation of the workspace or VMs.
