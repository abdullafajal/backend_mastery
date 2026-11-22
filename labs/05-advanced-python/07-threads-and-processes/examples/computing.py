"""CPU-heavy work: counting primes in 4 ranges. Threads don't help here (the GIL); processes do."""

import os
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor

CHUNKS = [(1, 150_000), (150_000, 300_000), (300_000, 450_000), (450_000, 600_000)]


def count_primes(bounds):
    low, high = bounds
    count = 0
    for n in range(max(low, 2), high):
        if all(n % d for d in range(2, int(n ** 0.5) + 1)):
            count += 1
    return count


def timed(label, run):
    start = time.perf_counter()
    total = sum(run())
    print(f"{label:<12} {time.perf_counter() - start:.1f} s  ({total} primes)")
    return time.perf_counter() - start


if __name__ == "__main__":                                   # needed: worker processes import this file
    print("CPU cores:", os.cpu_count())
    timed("one by one", lambda: [count_primes(c) for c in CHUNKS])
    with ThreadPoolExecutor(max_workers=4) as pool:
        timed("4 threads", lambda: list(pool.map(count_primes, CHUNKS)))
    with ProcessPoolExecutor(max_workers=4) as pool:
        timed("4 processes", lambda: list(pool.map(count_primes, CHUNKS)))
