"""Going deeper: stacking decorators (order matters), and a ready-made one from the standard library."""

import functools


def tag(label):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            print(f"{label} before")
            result = func(*args, **kwargs)
            print(f"{label} after")
            return result
        return wrapper
    return decorator


@tag("outer")                   # applied LAST, so it runs FIRST: outer(inner(checkout))
@tag("inner")
def checkout():
    print("  checkout runs")


checkout()

calls = []


@functools.lru_cache(maxsize=128)     # remembers answers: the same question isn't asked twice
def delivery_days(pincode):
    calls.append(pincode)             # pretend this is a slow lookup
    return 2 if pincode.startswith("1") else 5


print(delivery_days("110001"), delivery_days("110001"), delivery_days("400001"))
print("slow lookups done:", calls)
