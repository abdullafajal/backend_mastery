"""How many steps does each kind of algorithm need as n grows? Counted, not timed: the same on every computer."""

import math

print(f"{'n':>9} {'O(1)':>6} {'O(log n)':>9} {'O(n)':>10} {'O(n log n)':>12} {'O(n²)':>16}")
for n in [10, 100, 1_000, 10_000, 1_000_000]:
    log_n = math.ceil(math.log2(n))                   # how many times you can halve n
    print(f"{n:>9,} {1:>6} {log_n:>9} {n:>10,} {n * log_n:>12,} {n * n:>16,}")
