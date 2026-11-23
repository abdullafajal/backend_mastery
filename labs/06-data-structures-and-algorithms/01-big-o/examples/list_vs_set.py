"""Is a product id in the catalog? A list checks one by one: O(n). A set jumps straight there: O(1)."""

import time

N = 1_000_000
ids_list = [f"P-{i:07d}" for i in range(N)]           # 1,000,000 product ids
ids_set = set(ids_list)
look_for = [f"P-{i:07d}" for i in range(N - 200, N)]    # 200 ids near the END of the list (the worst case for a list)

start = time.perf_counter()
found = sum(1 for x in look_for if x in ids_list)
per_list = (time.perf_counter() - start) / len(look_for)

start = time.perf_counter()
found_set = sum(1 for x in look_for if x in ids_set)
per_set = (time.perf_counter() - start) / len(look_for)

print(f"list: {found} found, {per_list * 1000:.1f} ms per lookup")      # milliseconds: thousandths of a second
print(f"set:  {found_set} found, {per_set * 1_000_000:.1f} µs per lookup")   # microseconds: millionths of a second
print(f"the set was about {round(per_list / per_set, -2):,.0f} times faster")
