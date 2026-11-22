"""Going deeper: islice, yield from, and a context manager written as a class."""

import itertools


def read_lines(path):
    with open(path, encoding="utf-8") as f:
        yield from f                                  # "yield every value of f, one by one"


first_three = list(itertools.islice(read_lines("data/orders.log"), 3))   # take only 3 lines, then stop reading
print([line.split(",")[1] for line in first_three])


class Till:
    """The same idea as @contextlib.contextmanager, written with __enter__ and __exit__."""

    def __init__(self, cashier):
        self.cashier = cashier

    def __enter__(self):                              # runs when `with` starts; its return value goes after `as`
        print(f"{self.cashier} opens the till")
        return self

    def __exit__(self, exc_type, exc, tb):            # runs at the end, always; gets the error if there was one
        print(f"{self.cashier} closes the till (error: {exc_type.__name__ if exc_type else None})")
        return False                                  # False: don't hide the error


with Till("Neha") as till:
    print(" ", till.cashier, "is selling")
