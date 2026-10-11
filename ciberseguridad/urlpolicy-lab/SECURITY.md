# Security policy

URLPolicy Lab 1.0.1 is a local defensive QA utility. It does not send requests,
resolve DNS or provide runtime SSRF protection. Run only owner-authorized local
fixtures, and keep production URLs, tokens and private decision logs out of this
repository and its reports.

## Scope of maintenance

The recorded review covers version 1.0.1 on Linux x86_64 / CPython 3.12.3.
No support SLA or security-certification claim is made. Input/output boundaries
and exclusions are described in `docs/THREAT_MODEL.md`.

## Reporting a concern

This project has no deployed service or activated private reporting channel.
The maintainer should configure GitHub private vulnerability reporting or supply
an appropriate private contact. Until then, do not post sensitive details in a
public issue. This pending maintenance improvement does not represent an
activated reporting service.

For a report, provide the affected version, a minimal synthetic local fixture,
the expected and observed result, and the interpreter version. Do not probe
third-party systems, send live webhook requests, or include credentials.

This document establishes reporting expectations; it does not claim that a
private contact or reporting service has already been activated.
