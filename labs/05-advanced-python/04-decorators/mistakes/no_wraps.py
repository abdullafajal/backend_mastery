"""Without functools.wraps, the decorated function loses its own name and docstring."""


def log_calls(func):
    def wrapper(*args, **kwargs):
        return func(*args, **kwargs)
    return wrapper


@log_calls
def supplier_price(seller):
    """What a seller charges Bazaar."""
    return 21000


print(supplier_price.__name__, supplier_price.__doc__)
