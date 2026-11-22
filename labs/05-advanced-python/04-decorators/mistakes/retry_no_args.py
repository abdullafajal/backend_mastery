"""@retry needs its settings: @retry(times=3). Written as plain @retry, no error, but calling fetch_stock gives back a function, not the stock."""

import functools


def retry(times):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator


@retry
def fetch_stock(product):
    return 40


print(fetch_stock("Masala Box"))
