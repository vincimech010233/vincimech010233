"""Deterministic local string fuzzing, not a security oracle."""
import hashlib
import json
from pathlib import Path
import random
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import urlpolicy_lab as policy


def main():
    seed = 20261011
    count = 10_000
    rng = random.Random(seed)
    alphabet = 'abcXYZ01279.:/@#%[]\\\t\n -_é\x00'
    digest = hashlib.sha256()
    labels = dict.fromkeys(sorted(policy.STATUS), 0)
    completed = 0
    start = time.monotonic()
    for _ in range(count):
        value = rng.choice(('', 'https://', 'http://')) + ''.join(
            rng.choice(alphabet) for _ in range(rng.randrange(160)))
        encoded = value.encode('utf-8')
        digest.update(len(encoded).to_bytes(4, 'big'))
        digest.update(encoded)
        first = policy.classify(value)
        second = policy.classify(value)
        if first != second or first[0] not in policy.STATUS or not isinstance(first[1], str):
            raise RuntimeError('Fuzz invariant failed at input index ' + str(completed))
        labels[first[0]] += 1
        completed += 1
    print(json.dumps({
        'classification': 'VERIFIED', 'seed': seed, 'generated_inputs': completed,
        'classify_calls': completed * 2, 'input_stream_sha256': digest.hexdigest(),
        'labels': labels, 'invariants': ['no uncaught exception', 'valid label',
                                       'determinism', 'string reason'],
        'semantic_security_oracle': False,
        'elapsed_seconds': time.monotonic() - start,
        'python': sys.version.split()[0], 'tool_version': policy.VERSION,
    }, sort_keys=True))


if __name__ == '__main__':
    main()
