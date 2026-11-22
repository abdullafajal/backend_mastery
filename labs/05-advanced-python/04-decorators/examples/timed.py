"""@timed: measure how long any function takes. Written once, used on every slow function."""

import functools
import time


def timed(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()                       # a precise clock, in seconds
        result = func(*args, **kwargs)
        seconds = time.perf_counter() - start
        print(f"{func.__name__} took {seconds:.1f} s")
        return result
    return wrapper


@timed
def fetch_supplier_prices(seller):
    time.sleep(0.3)                                       # pretend: a slow request to the supplier's API
    return {"Patel Spices": [21000, 23500]}[seller]


@timed
def build_catalog_page():
    time.sleep(0.1)
    return "<html>…</html>"


prices = fetch_supplier_prices("Patel Spices")
page = build_catalog_page()
print(prices, len(page))
