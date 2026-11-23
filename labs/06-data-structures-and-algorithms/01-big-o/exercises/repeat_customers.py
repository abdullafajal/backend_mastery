"""Which of today's 20,000 orders come from customers who ordered before? BUG: it's very slow (seconds).
Your task: keep the same answer, but make the check fast. (Hint: what is `in` on a list?)"""

import random
import time

random.seed(2026)
past_customers = [f"C-{random.randrange(1_000_000):06d}" for _ in range(20_000)]
todays_orders = [f"C-{random.randrange(1_000_000):06d}" for _ in range(20_000)]

start = time.perf_counter()
repeat = 0
for customer in todays_orders:
    if customer in past_customers:            # a list: checks up to 20,000 names every time
        repeat += 1
print(f"repeat customers: {repeat}")
print(f"took {time.perf_counter() - start:.2f} s")
