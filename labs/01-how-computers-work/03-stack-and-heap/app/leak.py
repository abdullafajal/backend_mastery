# leak.py: Bazaar's price service, with a cache that never forgets.
# Run it with: python3 leak.py <mode>
#   leaky   - 200,000 requests with the cache that never forgets
#   bounded - the same requests with a cache of at most 1000 answers
#   find    - like leaky, but asks tracemalloc WHICH LINE holds the memory
#   forever - leaky, without stopping (use it with a memory limit!)

import sys
import tracemalloc
from functools import lru_cache


def rss_mb():
    """RAM really used by this process right now (Linux only), in MB."""
    with open("/proc/self/status") as f:
        for line in f:
            if line.startswith("VmRSS:"):
                return int(line.split()[1]) / 1024


PRICE_CACHE = {}  # global: lives as long as the program


def price_leaky(product_id, user_id, request_id):
    key = (product_id, user_id, request_id)       # request_id is new every time: the key never repeats!
    if key not in PRICE_CACHE:
        PRICE_CACHE[key] = {"product_id": product_id, "price": 999, "currency": "INR", "note": "x" * 200}
    return PRICE_CACHE[key]["price"]


@lru_cache(maxsize=1000)                          # keeps at most 1000 answers, forgets the oldest
def price_bounded(product_id, user_id):
    return {"product_id": product_id, "price": 999, "currency": "INR", "note": "x" * 200}["price"]


mode = sys.argv[1] if len(sys.argv) > 1 else "leaky"
if mode == "find":
    tracemalloc.start()  # records where every allocation happens (this costs extra RAM itself)
print(f"mode: {mode}")
print(f"{'requests':>9} | {'RAM (RSS)':>9} | cache size")
request = 0
while True:
    for _ in range(50_000):
        request += 1
        if mode == "bounded":
            price_bounded(request % 5, request % 2000)
        else:
            price_leaky(request % 5, request % 2000, request)
    size = price_bounded.cache_info().currsize if mode == "bounded" else len(PRICE_CACHE)
    print(f"{request:>9,} | {rss_mb():>6.0f} MB | {size:,}", flush=True)
    if mode != "forever" and request >= 200_000:
        break

if mode == "find":
    for stat in tracemalloc.take_snapshot().statistics("lineno")[:3]:
        print(f"  {stat}")
