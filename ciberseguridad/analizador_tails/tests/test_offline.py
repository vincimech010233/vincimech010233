"""Local fixtures only: no real HTTP, Tor, browser or VM execution."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import types
import unittest
from unittest.mock import patch

SOURCE = Path(__file__).resolve().parents[1] / 'analizar.py'


class OfflineChecks(unittest.TestCase):
    def setUp(self):
        spec = importlib.util.spec_from_file_location('analizador_fixture', SOURCE)
        self.module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(self.module)
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.out = Path(self.tmp.name) / 'report'
        self.commands = []

    def execute(self, *, mode='linux', dynamic=False, curl_code=0, socks=True):
        def fake_curl(command, **kwargs):
            self.commands.append(command)
            Path(command[command.index('--dump-header') + 1]).write_text('HTTP/1.1 200 OK\n')
            Path(command[command.index('--output') + 1]).write_bytes(b'<script>alert("fixture")</script>')
            return types.SimpleNamespace(returncode=curl_code, stdout='200\nhttps://fixture.invalid/\n127.0.0.1\n', stderr='fixture failure' if curl_code else '')

        args = ['analizar.py', 'https://fixture.invalid/', '--modo', mode, '--salida', str(self.out)]
        if not dynamic:
            args.append('--sin-dinamico')
        with patch.object(sys, 'argv', args), patch.object(self.module, 'socks_available', return_value=socks), patch.object(self.module.subprocess, 'run', side_effect=fake_curl), patch.dict(sys.modules, {'playwright': None, 'playwright.sync_api': None}), patch('socket.create_connection', side_effect=AssertionError('Network forbidden')), contextlib.redirect_stdout(io.StringIO()):
            self.module.main()
        return json.loads((self.out / 'informe.json').read_text())

    def test_help_without_network(self):
        result = subprocess.run([sys.executable, str(SOURCE), '--help'], capture_output=True, text=True, timeout=10)
        self.assertEqual(result.returncode, 0)
        self.assertIn('--sin-dinamico', result.stdout)
        self.assertIn('--tor-puerto', result.stdout)

    def test_static_report_escapes_fixture_script(self):
        report = self.execute()
        html = (self.out / 'informe.html').read_text()
        self.assertNotIn('<script>', html)
        self.assertIn('&lt;script&gt;', html)
        self.assertIn('Content-Security-Policy', html)
        self.assertEqual(report['solicitudes'], [])

    def test_failed_curl_preserved(self):
        report = self.execute(curl_code=28)
        self.assertEqual(report['http_estatico']['codigo_salida'], 28)
        self.assertTrue(any('Falló la descarga' in x for x in report['advertencias']))
        self.assertFalse((self.out / 'fuente_escapada.txt').exists())

    def test_missing_playwright_preserved(self):
        report = self.execute(dynamic=True)
        self.assertTrue(any('Dinámico no completado' in str(x) for x in report['errores']))
        self.assertTrue((self.out / 'informe.html').exists())
        self.assertFalse((self.out / 'captura.png').exists())

    def test_missing_proxy_aborts_before_http_and_report(self):
        with self.assertRaises(SystemExit):
            self.execute(mode='tails', socks=False)
        self.assertEqual(self.commands, [])
        self.assertFalse((self.out / 'informe.json').exists())

    def test_tails_static_uses_proxy_with_remote_dns(self):
        self.execute(mode='tails')
        command = self.commands[0]
        self.assertEqual(command[command.index('--proxy') + 1], 'socks5h://127.0.0.1:9050')

    def test_documented_stale_output_limitation(self):
        self.out.mkdir()
        (self.out / 'captura.png').write_bytes(b'OLD FIXTURE')
        self.execute()
        self.assertEqual((self.out / 'captura.png').read_bytes(), b'OLD FIXTURE')


if __name__ == '__main__':
    unittest.main()
