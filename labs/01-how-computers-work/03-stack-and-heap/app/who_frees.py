# who_frees.py: when does Python free an object? Reference counting, and the cycle collector.
# Run it with: python3 who_frees.py

import gc
import sys
import weakref


class Order:
    def __init__(self, number):
        self.number = number
        self.related = None


def watch(obj, label):
    weakref.finalize(obj, print, f"   -> {label} was freed")  # prints when the object is freed


print("1) Reference counting:")
order = Order(1042)
watch(order, "order #1042")
print(f"   references to the order: {sys.getrefcount(order) - 1}")  # -1: getrefcount itself holds one
also = order
print(f"   after `also = order`: {sys.getrefcount(order) - 1}")
del order
print("   deleted the name `order` (the object is still reachable as `also`)")
del also
print("   deleted the name `also`")

print("2) A cycle: two orders that point to each other")
gc.disable()                      # switch the automatic cycle collector off, to see the problem
a, b = Order(1), Order(2)
a.related, b.related = b, a       # a -> b and b -> a
watch(a, "order #1")
watch(b, "order #2")
del a, b
print("   deleted both names... but nothing was freed: each still holds the other")
print("   running the cycle collector:")
found = gc.collect()
print(f"   gc.collect() found {found} unreachable objects")
gc.enable()
