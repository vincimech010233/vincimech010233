"""Trusted audit guard. Never import package before installing kernel filter."""
import ctypes, errno, os, resource, sys

def install():
    lib = ctypes.CDLL('/usr/lib/x86_64-linux-gnu/libseccomp.so.2', use_errno=True)
    lib.seccomp_init.argtypes = [ctypes.c_uint32]
    lib.seccomp_init.restype = ctypes.c_void_p
    lib.seccomp_syscall_resolve_name.argtypes = [ctypes.c_char_p]
    lib.seccomp_syscall_resolve_name.restype = ctypes.c_int
    lib.seccomp_rule_add.argtypes = [ctypes.c_void_p, ctypes.c_uint32, ctypes.c_int, ctypes.c_uint]
    lib.seccomp_rule_add.restype = ctypes.c_int
    lib.seccomp_load.argtypes = [ctypes.c_void_p]
    lib.seccomp_load.restype = ctypes.c_int
    lib.seccomp_release.argtypes = [ctypes.c_void_p]
    ctx = lib.seccomp_init(0x7fff0000)
    if not ctx:
        raise RuntimeError('seccomp init failed')
    names = ('fork vfork clone clone3 execve execveat socket socketpair connect accept accept4 '
             'bind listen sendto sendmsg sendmmsg recvfrom recvmsg recvmmsg shutdown '
             'unshare setns mount umount2 pivot_root chroot ptrace process_vm_readv process_vm_writev '
             'prctl seccomp setrlimit prlimit64 io_uring_setup io_uring_enter io_uring_register '
             'bpf userfaultfd open_by_handle_at name_to_handle_at fsopen fsconfig fsmount '
             'move_mount open_tree mount_setattr setuid setgid setreuid setregid '
             'setresuid setresgid setgroups capset kill tkill tgkill').split()
    try:
        for name in names:
            nr = lib.seccomp_syscall_resolve_name(name.encode())
            if nr < 0:
                raise RuntimeError('unknown syscall: '+name)
            if lib.seccomp_rule_add(ctx, 0x00050000 | errno.EPERM, nr, 0) != 0:
                raise RuntimeError('seccomp rule failed: '+name)
        if lib.seccomp_load(ctx) != 0:
            raise RuntimeError('seccomp load failed')
    finally:
        lib.seccomp_release(ctx)
    return names

limits = {str(k): resource.getrlimit(k) for k in
          (resource.RLIMIT_AS, resource.RLIMIT_CPU, resource.RLIMIT_FSIZE, resource.RLIMIT_NOFILE)}
denied = install()
if sys.argv[1] == 'preflight':
    import json, pathlib, socket
    def blocked(fn):
        try:
            fn()
        except OSError as e:
            return {'denied': True, 'errno': e.errno}
        raise RuntimeError('Expected isolation failure absent')
    checks = {}
    checks['socket'] = blocked(lambda: socket.socket(socket.AF_INET, socket.SOCK_STREAM))
    checks['fork'] = blocked(os.fork)
    checks['exec'] = blocked(lambda: os.execv('/usr/bin/true', ['true']))
    libc=ctypes.CDLL(None,use_errno=True)
    limit=(ctypes.c_ulong*2)(32,64)
    assert libc.setrlimit(resource.RLIMIT_NOFILE,ctypes.byref(limit)) == -1
    assert ctypes.get_errno() == errno.EPERM
    checks['change_limit']={'denied':True,'errno':ctypes.get_errno()}
    checks['outside_write'] = blocked(lambda: pathlib.Path('/repo/canary').write_text('synthetic'))
    checks['outside_read'] = blocked(lambda: pathlib.Path('/private-canary').read_text())
    checks['single_file_limit'] = blocked(lambda: pathlib.Path('/work/big').write_bytes(b'x' * (5*1024*1024)))
    pathlib.Path('/work/big').unlink(missing_ok=True)
    try:
        files = []
        for i in range(20):
            p=pathlib.Path('/work') / ('quota-'+str(i))
            files.append(p)
            try:
                p.write_bytes(b'x' * (1024*1024))
            except OSError as e:
                assert e.errno == errno.ENOSPC
                checks['total_storage_limit']={'denied': True, 'errno':e.errno,'successful_mib':i}
                break
        else:
            raise RuntimeError('No tmpfs quota')
    finally:
        for p in files:
            p.unlink(missing_ok=True)
    try:
        bytearray(256*1024*1024)
    except MemoryError:
        checks['memory_limit']={'denied':True}
    else:
        raise RuntimeError('Memory quota not active')
    assert not os.path.exists('/private-canary')
    assert os.getuid() != 0
    status = pathlib.Path('/proc/self/status').read_text()
    assert 'CapEff:\t0000000000000000' in status
    assert 'NoNewPrivs:\t1' in status
    assert 'Seccomp:\t2' in status
    print(json.dumps({'checks':checks,'limits':limits,'denied_syscalls':denied,
        'netns':os.readlink('/proc/self/ns/net'),'interfaces':pathlib.Path('/proc/net/dev').read_text(),
        'routes':pathlib.Path('/proc/net/route').read_text(),
        'mountinfo':pathlib.Path('/proc/self/mountinfo').read_text(),
        'status':pathlib.Path('/proc/self/status').read_text(), 'environment':dict(os.environ)},indent=2))
elif sys.argv[1] == 'cpu-probe':
    while True:
        pass
else:
    # Inspected scripts only. No exec syscall; runpy executes within guarded interpreter.
    import runpy
    path=sys.argv[1]
    sys.argv=sys.argv[1:]
    sys.path.insert(0, '/repo')
    runpy.run_path(path,run_name='__main__')
