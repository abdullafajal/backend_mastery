"""A list holds every value at once. A generator makes them one at a time, so it hardly uses memory."""

import sys

as_list = [n * 2 for n in range(1_000_000)]     # square brackets: build all 1,000,000 values now
as_gen = (n * 2 for n in range(1_000_000))      # round brackets: a generator, values made on request

print("list:     ", sys.getsizeof(as_list), "bytes")
print("generator:", sys.getsizeof(as_gen), "bytes")
print("same total?", sum(as_list) == sum(as_gen))
