"""Building the set INSIDE the loop: still correct, but it rebuilds 20,000 items each time, so it's slow again."""

import random
import time

random.seed(2026)
past_customers = [f"C-{random.randrange(1_000_000):06d}" for _ in range(20_000)]
todays_orders = [f"C-{random.randrange(1_000_000):06d}" for _ in range(2_000)]     # only 2,000, or it takes too long

start = time.perf_counter()
repeat = sum(1 for c in todays_orders if c in set(past_customers))     # set(...) runs 2,000 times
print(f"repeat customers: {repeat}, took {time.perf_counter() - start:.2f} s")
