"""Run the existing suite and record results after a trusted guard is installed."""
import contextlib
import io
import json
from pathlib import Path
import resource
import sys
import tempfile
import time
import unittest

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))


def main():
    suite = unittest.defaultTestLoader.discover(str(ROOT / 'tests'))
    if suite.countTestCases() != 38:
        raise RuntimeError('Expected 38 existing test methods; inspect changed discovery')
    start = time.monotonic()
    stream = io.StringIO()
    with contextlib.redirect_stdout(stream), contextlib.redirect_stderr(stream):
        result = unittest.TextTestRunner(stream=stream, verbosity=2).run(suite)
        import urlpolicy_lab as policy
        with tempfile.TemporaryDirectory() as directory:
            report = Path(directory) / 'demo_report.json'
            code = policy.main([str(ROOT / 'examples/cases.json'), '--observed',
                                str(ROOT / 'examples/observed_demo.json'),
                                '--output', str(report)])
            example_equal = report.read_bytes() == (ROOT / 'examples/demo_report.json').read_bytes()
            example_summary = json.loads(report.read_text())['summary']
            if code != 0 or not example_equal:
                raise RuntimeError('README example byte reproduction failed')
    sys.stderr.write(stream.getvalue())
    print(json.dumps({
        'classification': 'VERIFIED', 'tests': result.testsRun,
        'failures': len(result.failures), 'errors': len(result.errors),
        'skipped': len(result.skipped), 'success': result.wasSuccessful(),
        'elapsed_seconds': time.monotonic() - start,
        'maxrss_kib': resource.getrusage(resource.RUSAGE_SELF).ru_maxrss,
        'python': sys.version.split()[0], 'platform': sys.platform,
        'readme_example_bytes_equal': example_equal,
        'readme_example_summary': example_summary,
        'scope': '38 unittest methods, including 10000-input seeded string fuzzing',
    }, sort_keys=True))
    return 0 if result.wasSuccessful() else 1


if __name__ == '__main__':
    raise SystemExit(main())
