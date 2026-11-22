"""A decorator: wrap a function with extra behaviour, without changing the function itself."""

import functools


def log_calls(func):                           # takes the original function...
    @functools.wraps(func)                     # (keeps func's name and docstring on the wrapper)
    def wrapper(*args, **kwargs):              # ...and builds a new one around it
        print(f"→ {func.__name__}{args}")      # extra behaviour BEFORE
        result = func(*args, **kwargs)         # run the original, with whatever it was given
        print(f"← {func.__name__} returned {result}")   # extra behaviour AFTER
        return result                          # hand the original's answer back
    return wrapper                             # the decorator returns the wrapper


@log_calls                                     # same as: supplier_price = log_calls(supplier_price)
def supplier_price(seller, product):
    """What a seller charges Bazaar for one product, in paise."""
    prices = {("Patel Spices", "Masala Box"): 21000, ("Meera Handloom", "Cotton Kurta"): 48000}
    return prices[(seller, product)]


total = supplier_price("Patel Spices", "Masala Box") + supplier_price("Meera Handloom", "Cotton Kurta")
print("total cost:", total)
print(supplier_price.__name__, "-", supplier_price.__doc__)
