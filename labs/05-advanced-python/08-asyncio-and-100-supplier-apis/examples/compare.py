"""The plan's lab: the same 100 supplier prices, three ways, timed."""

import time

import fetch_async
import fetch_sync
import fetch_threads

results = {}
for name, module in [("one by one", fetch_sync), ("100 threads", fetch_threads), ("asyncio", fetch_async)]:
    start = time.perf_counter()
    prices = module.fetch_all(100)
    seconds = time.perf_counter() - start
    results[name] = prices
    print(f"{name:<12} {seconds:5.1f} s   {len(prices)} prices, total ₹{sum(prices) // 100:,}")

print("all three agree?", len({tuple(p) for p in results.values()}) == 1)
