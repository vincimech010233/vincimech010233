#!/usr/bin/env python3
"""Offline, fail-closed URL policy fixture checker for defensive QA.

No DNS, HTTP, sockets, telemetry, or third-party dependencies.
This is not a production SSRF prevention library.
"""

from __future__ import annotations

import argparse
import ipaddress
import json
import os
from pathlib import Path
import re
import sys
import tempfile
from urllib.parse import urlsplit

VERSION = "1.0.1"
MAX_BYTES = 1_048_576
MAX_CASES = 512
MAX_URL_LENGTH = 4096
STATUS = {"BLOCK", "REVIEW_DNS", "ALLOW_LITERAL"}
OBSERVED = {"BLOCK", "ALLOW", "SKIPPED", "REVIEW"}


class InputError(ValueError):
    """Invalid local input (not an application vulnerability)."""


def classify(url: str, *, allow_http: bool = False) -> tuple[str, str]:
    """Return (decision, reason). Fail closed on malformed/ambiguous URLs.

    REVIEW_DNS means no conclusion about host resolution or safe connection.
    ALLOW_LITERAL is only a policy-classification of a global IP literal.
    """
    if not isinstance(url, str) or not url or len(url) > MAX_URL_LENGTH:
        return "BLOCK", "empty_or_oversized_url"
    if any(ord(c) < 33 or ord(c) == 127 for c in url):
        return "BLOCK", "whitespace_or_control_character"
    if "\\" in url:
        return "BLOCK", "backslash_parser_ambiguity"
    try:
        parsed = urlsplit(url)
        if parsed.scheme.lower() not in ({"https", "http"} if allow_http else {"https"}):
            return "BLOCK", "disallowed_scheme"
        if not parsed.netloc or not parsed.hostname:
            return "BLOCK", "missing_hostname"
        if parsed.username is not None or parsed.password is not None or "@" in parsed.netloc:
            return "BLOCK", "userinfo_forbidden"
        if "#" in url:
            return "BLOCK", "fragment_forbidden"
        if "%" in parsed.netloc:
            return "BLOCK", "encoded_authority_forbidden"
        if parsed.netloc.startswith("["):
            authority_valid = re.fullmatch(r"\[[0-9a-fA-F:.]+\](?::[0-9]+)?", parsed.netloc)
        else:
            authority_valid = re.fullmatch(r"[^:\[\]]+(?::[0-9]+)?", parsed.netloc)
        if authority_valid is None:
            return "BLOCK", "invalid_authority_syntax"
        # Access port explicitly: urlsplit accepts but does not validate bad ports.
        port = parsed.port
        if port is not None and not 1 <= port <= 65535:
            return "BLOCK", "invalid_port"
        host = parsed.hostname.lower()
        if host.endswith(".."):
            return "BLOCK", "invalid_hostname_label"
        host = host.removesuffix(".")
    except (ValueError, TypeError):
        return "BLOCK", "malformed_url"
    if not host or len(host) > 253:
        return "BLOCK", "invalid_hostname"

    if host == "localhost" or host.endswith((".localhost", ".local", ".internal")):
        return "BLOCK", "local_hostname"
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        # Hostnames made of numbers and dots, or hex numeric encodings,
        # are deliberately not treated as DNS names.
        if re.fullmatch(r"(?:0[xX][0-9a-fA-F]+|0[0-7]+|[0-9]+)(?:\.(?:0[xX][0-9a-fA-F]+|0[0-7]+|[0-9]+))*", host):
            return "BLOCK", "ambiguous_numeric_hostname"
        if not re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]{0,251}[a-z0-9])?", host):
            return "BLOCK", "invalid_hostname_syntax"
        labels = host.split(".")
        if any(not label or len(label) > 63 or label.startswith("-") or label.endswith("-") for label in labels):
            return "BLOCK", "invalid_hostname_label"
        return "REVIEW_DNS", "hostname_requires_verified_dns_and_pinned_dial"

    if isinstance(ip, ipaddress.IPv6Address):
        if ip.ipv4_mapped is not None:
            return "BLOCK", "ipv4_mapped_ipv6_requires_explicit_policy"
        if ip.sixtofour is not None:
            return "BLOCK", "ipv6_6to4_tunnel_requires_explicit_policy"
        if ip.teredo is not None:
            return "BLOCK", "ipv6_teredo_tunnel_requires_explicit_policy"
    if ip.is_multicast:
        return "BLOCK", "multicast_ip_literal"
    if not ip.is_global:
        return "BLOCK", "non_global_ip_literal"
    return "ALLOW_LITERAL", "global_ip_literal_only_connection_not_tested"


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise InputError("Duplicate JSON object key")
        result[key] = value
    return result


def load_json(path: Path):
    if not path.is_file() or path.stat().st_size > MAX_BYTES:
        raise InputError(f"Input not found or exceeds {MAX_BYTES} bytes: {path}")
    try:
        with path.open("rb") as file:
            data = file.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES:
            raise InputError(f"Input exceeds {MAX_BYTES} bytes: {path}")
        return json.loads(data.decode("utf-8"), object_pairs_hook=_unique_object)
    except (UnicodeError, json.JSONDecodeError, RecursionError) as error:
        raise InputError(f"Invalid UTF-8/JSON in {path}: {error}") from error


def load_cases(path: Path) -> list[dict[str, str]]:
    raw = load_json(path)
    if not isinstance(raw, dict) or not isinstance(raw.get("cases"), list):
        raise InputError("Cases file must contain a 'cases' array")
    if not (1 <= len(raw["cases"]) <= MAX_CASES):
        raise InputError(f"Cases count must be between 1 and {MAX_CASES}")
    output: list[dict[str, str]] = []
    seen: set[str] = set()
    for index, value in enumerate(raw["cases"]):
        if not isinstance(value, dict):
            raise InputError(f"case {index} is not an object")
        case_id, url = value.get("id"), value.get("url")
        if not isinstance(case_id, str) or not re.fullmatch(r"[a-zA-Z0-9_.-]{1,80}", case_id):
            raise InputError(f"case {index} has invalid id")
        if case_id in seen:
            raise InputError(f"duplicate case id: {case_id}")
        if not isinstance(url, str):
            raise InputError(f"case {case_id} URL is not a string")
        seen.add(case_id)
        output.append({"id": case_id, "url": url})
    return output


def load_observed(path: Path) -> dict[str, str]:
    raw = load_json(path)
    if not isinstance(raw, dict) or not isinstance(raw.get("observed"), list):
        raise InputError("Observed file must contain an 'observed' array")
    if len(raw["observed"]) > MAX_CASES:
        raise InputError("Observed entries exceed maximum")
    outcomes: dict[str, str] = {}
    for index, item in enumerate(raw["observed"]):
        if not isinstance(item, dict) or not isinstance(item.get("id"), str):
            raise InputError(f"invalid observed entry {index}")
        ident, decision = item["id"], item.get("decision")
        if ident in outcomes or not isinstance(decision, str) or decision not in OBSERVED:
            raise InputError(f"duplicate id or invalid decision for observed '{ident}'")
        outcomes[ident] = decision
    return outcomes


def audit(cases: list[dict[str, str]], observed: dict[str, str] | None = None, *, allow_http: bool = False) -> dict:
    if observed is not None:
        unknown = set(observed) - {case["id"] for case in cases}
        if unknown:
            raise InputError("observed has unknown case ids: " + ", ".join(sorted(unknown)[:5]))
    rows = []
    counts = {"PASS": 0, "FAIL": 0, "WARN": 0, "UNTESTED": 0}
    for case in cases:
        expected, reason = classify(case["url"], allow_http=allow_http)
        actual = observed.get(case["id"]) if observed is not None else None
        if actual is None or actual == "SKIPPED":
            verdict = "UNTESTED"
        elif expected == "BLOCK":
            verdict = "PASS" if actual == "BLOCK" else "FAIL" if actual == "ALLOW" else "WARN"
        elif expected == "REVIEW_DNS":
            verdict = "WARN"  # DNS safety cannot be concluded from an offline URL string.
        else:  # ALLOW_LITERAL does not require a guard to allow it.
            verdict = "PASS" if actual in {"BLOCK", "ALLOW"} else "WARN"
        counts[verdict] += 1
        rows.append({"id": case["id"], "url": case["url"], "expected": expected,
                     "reason": reason, "observed": actual, "verdict": verdict})
    return {"tool": "URLPolicy Lab", "version": VERSION, "mode": "offline",
            "policy": {"allow_http": allow_http, "no_network_operations": True},
            "summary": counts, "cases": rows,
            "limits": ["No DNS resolution, redirects or connection-time pinning are tested.",
                       "ALLOW_LITERAL is not proof of a safe HTTP request.",
                       "A PASS does not establish absence of SSRF vulnerabilities."]}


def atomic_json(path: Path, data: dict):
    # Atomic replacement avoids partial files and never opens an existing symlink.
    if path.is_symlink() or not path.parent.is_dir():
        raise InputError("Output path is a symlink or its directory does not exist")
    fd, temporary = tempfile.mkstemp(prefix=".urlpolicy-", suffix=".json", dir=path.parent)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as file:
            json.dump(data, file, indent=2, ensure_ascii=True)
            file.write("\n")
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Offline webhook URL-policy fixture audit (never sends requests).")
    parser.add_argument("cases", type=Path, help="Local JSON file with {cases: [{id, url}, ...]}")
    parser.add_argument("--observed", type=Path, help="Optional local JSON file with {observed: [{id, decision}, ...]}")
    parser.add_argument("--output", type=Path, required=True, help="Result JSON path")
    parser.add_argument("--allow-http", action="store_true", help="Include http scheme in the example policy")
    parser.add_argument("--version", action="version", version=VERSION)
    args = parser.parse_args(argv)
    try:
        cases = load_cases(args.cases)
        observed = load_observed(args.observed) if args.observed is not None else None
        result = audit(cases, observed, allow_http=args.allow_http)
        atomic_json(args.output, result)
    except (InputError, OSError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2
    counts = result["summary"]
    print("Offline analysis complete: " + ", ".join(f"{label}={counts[label]}" for label in counts))
    print("Report:", args.output)
    return 1 if counts["FAIL"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
