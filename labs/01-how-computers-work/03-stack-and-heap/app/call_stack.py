# call_stack.py: every function call adds a frame to the call stack.
# Run it with: python3 call_stack.py

import sys
import traceback


def price_of(item):
    prices = {"Masala Box": 299, "Cotton Kurta": 649}
    if item not in prices:
        traceback.print_stack(limit=4, file=sys.stdout)  # print the call stack right now
        raise KeyError(item)
    return prices[item]


def total(items):
    return sum(price_of(i) for i in items)


def checkout(cart):
    return total(cart)


print("1) A normal checkout:", checkout(["Masala Box", "Cotton Kurta"]))

print("2) The call stack when something goes wrong:")
try:
    checkout(["Masala Box", "Gold Watch"])
except KeyError as e:
    print(f"   KeyError: {e}")

print("3) Bazaar's category tree: Home > Kitchen > ... (each level inside the one above)")


def make_tree(depth):
    tree = {"name": "level 0", "child": None}
    node = tree
    for i in range(1, depth):
        node["child"] = {"name": f"level {i}", "child": None}
        node = node["child"]
    return tree


def depth_recursive(node):
    if node is None:
        return 0
    return 1 + depth_recursive(node["child"])  # one more frame for every level


def depth_loop(node):
    count = 0
    while node is not None:  # no new frames: the same frame loops
        count += 1
        node = node["child"]
    return count


print(f"   recursion limit: {sys.getrecursionlimit()}")
print(f"   tree of 500 levels, recursive: {depth_recursive(make_tree(500))}")
try:
    depth_recursive(make_tree(5000))
except RecursionError as e:
    print(f"   tree of 5000 levels, recursive: RecursionError: {e}")
print(f"   tree of 5000 levels, with a loop: {depth_loop(make_tree(5000))}")
