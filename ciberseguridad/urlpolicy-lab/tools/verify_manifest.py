"""Verify shipped file hashes without importing project code."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def main():
    manifest_path = ROOT / 'evidence/file-manifest.json'
    manifest = json.loads(manifest_path.read_text())
    actual = {}
    for path in ROOT.rglob('*'):
        relative = path.relative_to(ROOT)
        if any(part in ('.git', '__pycache__', '.venv', 'build', 'dist') for part in relative.parts):
            continue
        if path.is_symlink():
            raise SystemExit('FAIL: symlink in shipped tree')
        if path.is_file() and path != manifest_path:
            actual[relative.as_posix()] = hashlib.sha256(path.read_bytes()).hexdigest()
    if actual != manifest['files']:
        missing = sorted(set(manifest['files']) - set(actual))
        extra = sorted(set(actual) - set(manifest['files']))
        changed = sorted(name for name in actual.keys() & manifest['files'].keys()
                         if actual[name] != manifest['files'][name])
        raise SystemExit('FAIL: ' + json.dumps({'missing': missing, 'extra': extra, 'changed': changed}))
    print('PASS: ' + str(len(actual)) + ' shipped file hashes match')


if __name__ == '__main__':
    main()
