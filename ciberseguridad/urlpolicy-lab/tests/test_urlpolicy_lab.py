import json
from pathlib import Path
import tempfile
import unittest
import sys
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import urlpolicy_lab as m

ROOT = Path(__file__).resolve().parents[1]


class URLPolicyTests(unittest.TestCase):
    def test_catalog_blocked_inputs(self):
        for case in json.loads((ROOT / "examples" / "cases.json").read_text())["cases"]:
            with self.subTest(case=case["id"]):
                label, why = m.classify(case["url"])
                self.assertIn(label, m.STATUS)
                self.assertIsInstance(why, str)
                if case["id"] in {"loopback_ipv4", "rfc1918_ipv4", "linklocal_ipv4", "ipv6_loopback",
                                   "ipv4_mapped_v6", "six_to_four", "teredo", "localhost", "private_dns",
                                   "userinfo", "port_invalid", "opaque_numeric", "http_scheme", "backslash"}:
                    self.assertEqual(label, "BLOCK")

    def test_public_literal_positive(self):
        for value in ("https://8.8.8.8/", "https://[2001:4860:4860::8888]/"):
            self.assertEqual(m.classify(value)[0], "ALLOW_LITERAL")

    def test_dns_never_marked_safe(self):
        self.assertEqual(m.classify("https://webhook.example.test/")[0], "REVIEW_DNS")

    def test_no_network_dependency(self):
        import socket
        with patch.object(socket, "getaddrinfo", side_effect=AssertionError("network resolution forbidden")):
            self.assertEqual(m.classify("https://example.test/")[0], "REVIEW_DNS")

    def test_allow_http_option(self):
        self.assertEqual(m.classify("http://8.8.8.8/")[0], "BLOCK")
        self.assertEqual(m.classify("http://8.8.8.8/", allow_http=True)[0], "ALLOW_LITERAL")

    def test_bad_urls_negative(self):
        for value in ("", "file:///etc/hosts", "javascript:alert(1)", "https:///path",
                      "https://host.test:bad/", "https://[notipv6]/", "https://127.0.0.1\r\nHeader: x/",
                      "https://0x7f000001/", "https://0x7f.0.0.1/", "https://0177.0.0.1/", "https://127.000.000.001/", "https://localhost./"):
            with self.subTest(value=value):
                self.assertEqual(m.classify(value)[0], "BLOCK")

    def test_invalid_json(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory) / "bad.json"
            p.write_text("{" )
            with self.assertRaises(m.InputError):
                m.load_cases(p)

    def test_duplicate_ids(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory) / "cases.json"
            p.write_text(json.dumps({"cases": [{"id": "a", "url": "https://8.8.8.8/"},
                                                 {"id": "a", "url": "https://127.0.0.1/"}]}))
            with self.assertRaises(m.InputError):
                m.load_cases(p)

    def test_observed_unknown_ids(self):
        with self.assertRaises(m.InputError):
            m.audit([{"id": "a", "url": "https://127.0.0.1/"}], {"b": "ALLOW"})

    def test_comparison_flags_negative_observation(self):
        result = m.audit([{"id": "test", "url": "https://127.0.0.1/"}], {"test": "ALLOW"})
        self.assertEqual(result["summary"]["FAIL"], 1)

    def test_comparison_accepts_block(self):
        result = m.audit([{"id": "test", "url": "https://127.0.0.1/"}], {"test": "BLOCK"})
        self.assertEqual(result["summary"]["PASS"], 1)

    def test_comparison_dns_is_review(self):
        result = m.audit([{"id": "test", "url": "https://example.test/"}], {"test": "ALLOW"})
        self.assertEqual(result["summary"]["WARN"], 1)

    def test_cli_end_to_end(self):
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "result.json"
            ret = m.main([str(ROOT / "examples" / "cases.json"), "--observed",
                          str(ROOT / "examples" / "observed_demo.json"), "--output", str(output)])
            self.assertEqual(ret, 0)
            self.assertTrue(output.exists())
            self.assertEqual(json.loads(output.read_text())["summary"]["FAIL"], 0)

    def test_cli_nonzero_for_failure(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            cases = base / "cases.json"
            observations = base / "observed.json"
            cases.write_text(json.dumps({"cases": [{"id": "a", "url": "https://127.0.0.1/"}]}))
            observations.write_text(json.dumps({"observed": [{"id": "a", "decision": "ALLOW"}]}))
            self.assertEqual(m.main([str(cases), "--observed", str(observations),
                                      "--output", str(base / "audit.json")]), 1)

    def test_reject_symlink_output(self):
        with tempfile.TemporaryDirectory() as directory:
            base = Path(directory)
            victim = base / "victim.txt"
            victim.write_text("keep")
            symlink = base / "report.json"
            symlink.symlink_to(victim)
            self.assertEqual(m.main([str(ROOT / "examples" / "cases.json"), "--output", str(symlink)]), 2)
            self.assertEqual(victim.read_text(), "keep")


if __name__ == "__main__":
    unittest.main()
