# locality.py: the same work, the same data, only the ORDER changes.
# Run it with: python3 locality.py   (the lab runs it inside Docker: docker compose run --rm race python3 locality.py)

import random
import time
from array import array

N = 10_000_000
prices = array("q", range(N))  # 10 million prices, stored side by side in RAM (8 bytes each)

in_order = list(range(N))      # visit them 0, 1, 2, 3, ...
shuffled = in_order[:]         # visit the very same positions, but jumbled
random.seed(42)                # same "random" order on every run
random.shuffle(shuffled)

for name, order in [("in order", in_order), ("random order", shuffled)]:
    start = time.perf_counter()
    total = 0
    for i in order:
        total += prices[i]     # read one price from RAM
    print(f"{name:13} {time.perf_counter() - start:.2f} s   (total = {total:,})")
