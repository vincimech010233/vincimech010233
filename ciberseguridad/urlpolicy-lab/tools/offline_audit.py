"""Fail-closed Linux x86_64 supervisor. Never imports the product on the host.

Requires existing bwrap, strace, prlimit, timeout and libseccomp. Installs nothing.
Only a temporary copy of this repository is bound into the sandbox.
"""
import hashlib
import errno
import json
import os
from pathlib import Path
import platform
import resource
import selectors
import shutil
import signal
import subprocess
import sys
import tempfile
import time

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ('bwrap', 'strace', 'prlimit', 'timeout')


def run(mode, repository, output, cpu=10):
    tag = Path(mode).stem
    trace = output / (tag + '.trace')
    command = [
        '/usr/bin/prlimit', '--fsize=4194304', '--core=0', '--',
        '/usr/bin/strace', '-f', '-e', 'trace=%network,%process,seccomp,prctl',
        '-o', str(trace), '/usr/bin/timeout', '-k', '1s', '15s',
        '/usr/bin/prlimit', '--as=268435456', '--cpu=' + str(cpu),
        '--fsize=4194304', '--nofile=64', '--core=0', '--',
        '/usr/bin/bwrap', '--unshare-all', '--unshare-user', '--disable-userns',
        '--new-session', '--die-with-parent', '--cap-drop', 'ALL',
        '--ro-bind', '/usr', '/usr', '--ro-bind', '/lib', '/lib',
        '--ro-bind', '/lib64', '/lib64', '--ro-bind', str(repository), '/repo',
        '--proc', '/proc', '--remount-ro', '/proc', '--size', '16777216',
        '--tmpfs', '/work', '--symlink', '/work', '/tmp', '--remount-ro', '/',
        '--chdir', '/work', '/usr/bin/python3', '-I', '-B',
        '/repo/tools/kernel_guard.py', mode,
    ]
    process = subprocess.Popen(
        command, env={'PATH': '/usr/bin:/bin', 'TMPDIR': '/work', 'LC_ALL': 'C.UTF-8'},
        close_fds=True, stdin=subprocess.DEVNULL, stdout=subprocess.PIPE,
        stderr=subprocess.PIPE, start_new_session=True)
    selector = selectors.DefaultSelector()
    for pipe, label in ((process.stdout, 'stdout'), (process.stderr, 'stderr')):
        os.set_blocking(pipe.fileno(), False)
        selector.register(pipe, selectors.EVENT_READ, label)
    buffers = {'stdout': bytearray(), 'stderr': bytearray()}
    start = time.monotonic()
    failure = None
    while selector.get_map():
        if time.monotonic() - start > 18:
            failure = 'host time cap'
            os.killpg(process.pid, signal.SIGKILL)
            break
        for key, _ in selector.select(.1):
            data = os.read(key.fd, 16384)
            if not data:
                selector.unregister(key.fileobj)
                continue
            remaining = 1048576 - sum(map(len, buffers.values()))
            buffers[key.data].extend(data[:remaining])
            if len(data) > remaining:
                failure = 'host output cap'
                os.killpg(process.pid, signal.SIGKILL)
    code = process.wait(timeout=2)
    for label, content in buffers.items():
        (output / (tag + '.' + label)).write_bytes(content)
    result = {'mode': mode, 'returncode': code, 'failure': failure,
              'wall_seconds': time.monotonic() - start}
    (output / (tag + '.result.json')).write_text(json.dumps(result, indent=2) + '\n')
    if failure:
        raise RuntimeError(failure)
    return result


def main():
    if sys.platform != 'linux' or platform.machine() != 'x86_64' or os.getuid() == 0:
        raise SystemExit('BLOCKED: requires non-root Linux x86_64')
    if any(shutil.which(tool) != '/usr/bin/' + tool for tool in TOOLS):
        raise SystemExit('BLOCKED: required existing system tools unavailable')
    if not Path('/usr/lib/x86_64-linux-gnu/libseccomp.so.2').is_file():
        raise SystemExit('BLOCKED: expected local libseccomp unavailable')
    workspace = Path(tempfile.mkdtemp(prefix='urlpolicy-offline-'))
    repository = workspace / 'repo'
    output = workspace / 'results'
    output.mkdir()
    files = {}
    for path in ROOT.rglob('*'):
        relative = path.relative_to(ROOT)
        if any(part in ('.git', '__pycache__', '.venv', 'build', 'dist') for part in relative.parts):
            continue
        if path.is_symlink():
            raise SystemExit('BLOCKED: repository contains symlinks')
        if path.is_file():
            destination = repository / relative
            destination.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, destination)
            files[str(relative)] = hashlib.sha256(destination.read_bytes()).hexdigest()
    (output / 'input-manifest.json').write_text(json.dumps(files, indent=2) + '\n')
    print('Evidence directory:', output, flush=True)
    result = run('preflight', repository, output)
    if result['returncode'] != 0:
        raise SystemExit('BLOCKED: isolation preflight failed; product was not imported')
    preflight = json.loads((output / 'preflight.stdout').read_text())
    if preflight['netns'] == os.readlink('/proc/self/ns/net'):
        raise SystemExit('BLOCKED: network namespace unchanged')
    if any(not value.get('denied') for value in preflight['checks'].values()):
        raise SystemExit('BLOCKED: isolation negative control did not deny operation')
    expected_errors = {'socket': errno.EPERM, 'fork': errno.EPERM,
                       'exec': errno.EPERM, 'change_limit': errno.EPERM,
                       'outside_write': errno.EROFS, 'outside_read': errno.ENOENT,
                       'single_file_limit': errno.EFBIG,
                       'total_storage_limit': errno.ENOSPC}
    if any(preflight['checks'][name].get('errno') != code
           for name, code in expected_errors.items()):
        raise SystemExit('BLOCKED: unexpected isolation denial reason')
    expected_limits = {resource.RLIMIT_AS: 268435456, resource.RLIMIT_CPU: 10,
                       resource.RLIMIT_FSIZE: 4194304, resource.RLIMIT_NOFILE: 64}
    if any(preflight['limits'][str(kind)] != [value, value]
           for kind, value in expected_limits.items()):
        raise SystemExit('BLOCKED: effective resource limits differ')
    interfaces = [line.split(':')[0].strip() for line in
                  preflight['interfaces'].splitlines()[2:]]
    if interfaces != ['lo'] or preflight['routes'].splitlines()[1:]:
        raise SystemExit('BLOCKED: unexpected network interfaces or routes')
    mounts = [line.split() for line in preflight['mountinfo'].splitlines()]
    if any('rw' in mount[5].split(',') and mount[4] != '/work' for mount in mounts):
        raise SystemExit('BLOCKED: writable mount outside temporary workspace')
    if not any(mount[4] == '/repo' and 'ro' in mount[5].split(',') for mount in mounts):
        raise SystemExit('BLOCKED: repository mount is not read-only')
    if sys.argv[1:] == ['--preflight-only']:
        print('PASS: preflight only; product was not imported')
        return
    if sys.argv[1:]:
        raise SystemExit('BLOCKED: unknown arguments')
    cpu = run('cpu-probe', repository, output, cpu=1)
    if cpu['returncode'] not in (-signal.SIGKILL, 128 + signal.SIGKILL,
                                 -signal.SIGXCPU, 128 + signal.SIGXCPU):
        raise SystemExit('BLOCKED: CPU control returned unexpected status')
    if cpu['wall_seconds'] >= 5:
        raise SystemExit('BLOCKED: cannot distinguish CPU termination from timeout')
    for mode in ('/repo/tools/run_validation.py', '/repo/tools/fuzz.py'):
        result = run(mode, repository, output)
        if result['returncode'] != 0:
            raise SystemExit('FAILED: inspect preserved evidence')
    print('PASS: sandbox preflight, CPU control, 38 tests and seeded fuzz completed')


if __name__ == '__main__':
    main()
