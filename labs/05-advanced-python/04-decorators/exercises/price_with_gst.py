"""A @with_gst decorator adds 18% GST to whatever price a function returns.
BUG: every decorated price comes out as None. Your task: make the wrapper hand back the result."""

import functools


def with_gst(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        price = func(*args, **kwargs)
        price_with_tax = price + price * 18 // 100
        print(f"{func.__name__}: {price} + 18% GST = {price_with_tax}")
    return wrapper


@with_gst
def kurta_price():
    return 64900


final = kurta_price()
print("Customer pays (paise):", final)
