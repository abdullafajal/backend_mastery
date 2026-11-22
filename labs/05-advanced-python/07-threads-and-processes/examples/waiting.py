"""Asking 10 suppliers for a price. Each answer takes 0.2 s of WAITING (like a network call).
One by one, the waits add up. With threads, they overlap."""

import time
from concurrent.futures import ThreadPoolExecutor

SUPPLIERS = ["Patel Spices", "Meera Handloom", "Kumar Footwear", "Sharma Electronics", "Supplier 5",
             "Supplier 6", "Supplier 7", "Supplier 8", "Supplier 9", "Supplier 10"]


def fetch_price(supplier):
    time.sleep(0.2)                              # waiting for the supplier's server; the CPU is idle
    return len(supplier) * 1000                  # a pretend price in paise


start = time.perf_counter()
one_by_one = [fetch_price(s) for s in SUPPLIERS]
print(f"one by one: {time.perf_counter() - start:.1f} s")

start = time.perf_counter()
with ThreadPoolExecutor(max_workers=10) as pool:            # 10 threads, one per supplier
    with_threads = list(pool.map(fetch_price, SUPPLIERS))   # same function, same order of results
print(f"10 threads: {time.perf_counter() - start:.1f} s")
print("same prices?", one_by_one == with_threads)
