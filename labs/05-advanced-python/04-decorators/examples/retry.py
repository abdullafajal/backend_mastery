"""@retry(times=3): a decorator that takes its own settings. It retries a function that fails."""

import functools


def retry(times):                                         # 1. takes the settings...
    def decorator(func):                                  # 2. ...returns the real decorator...
        @functools.wraps(func)
        def wrapper(*args, **kwargs):                     # 3. ...which returns the wrapper
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except ConnectionError as error:
                    print(f"attempt {attempt} failed: {error}")
            raise ConnectionError(f"gave up after {times} attempts")
        return wrapper
    return decorator


calls = {"count": 0}


@retry(times=3)
def fetch_stock(product):
    calls["count"] += 1
    if calls["count"] < 3:                                # the supplier's server is busy twice, then answers
        raise ConnectionError("supplier busy")
    return {"Masala Box": 40}[product]


print("stock:", fetch_stock("Masala Box"))
