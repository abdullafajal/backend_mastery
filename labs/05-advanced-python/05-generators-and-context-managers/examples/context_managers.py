"""A context manager runs setup code at the start of `with` and clean-up code at the end, even after an error."""

import contextlib


@contextlib.contextmanager
def till_open(cashier):
    print(f"{cashier} opens the till")          # setup: runs when `with` starts
    try:
        yield                                   # the body of the `with` block runs here
    finally:
        print(f"{cashier} closes the till")     # clean-up: runs at the end, ALWAYS


with till_open("Neha"):
    print("  sold 2 Masala Box")

try:
    with till_open("Rohan"):
        print("  selling Wireless Earbuds...")
        raise ValueError("card declined")
except ValueError as error:
    print("error:", error)
