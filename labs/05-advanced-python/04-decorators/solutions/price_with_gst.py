"""A @with_gst decorator adds 18% GST to whatever price a function returns.
Fixed: the wrapper RETURNS the new price; without return, every decorated call gives back None."""

import functools


def with_gst(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        price = func(*args, **kwargs)
        price_with_tax = price + price * 18 // 100
        print(f"{func.__name__}: {price} + 18% GST = {price_with_tax}")
        return price_with_tax                     # the caller gets this instead of None
    return wrapper


@with_gst
def kurta_price():
    return 64900


final = kurta_price()
print("Customer pays (paise):", final)
