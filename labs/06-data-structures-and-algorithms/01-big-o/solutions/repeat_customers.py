"""Which of today's 20,000 orders come from customers who ordered before? Fixed: a set makes each check O(1), so 20,000 checks are instant."""

import random
import time

random.seed(2026)
past_customers = [f"C-{random.randrange(1_000_000):06d}" for _ in range(20_000)]
todays_orders = [f"C-{random.randrange(1_000_000):06d}" for _ in range(20_000)]

start = time.perf_counter()
past = set(past_customers)                    # build the set once: O(n)
repeat = 0
for customer in todays_orders:
    if customer in past:                      # a set: one jump, whatever its size
        repeat += 1
print(f"repeat customers: {repeat}")
print(f"took {time.perf_counter() - start:.2f} s")
