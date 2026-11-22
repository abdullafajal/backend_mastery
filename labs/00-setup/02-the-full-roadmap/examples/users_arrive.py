# users_arrive.py: many Bazaar customers open the app at the same moment.
# Run it with: python3 users_arrive.py   (the lab runs it for you inside Docker)

import os
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor  # lets us send many requests at once

URL = os.environ.get("BAZAAR_URL", "http://localhost:8000") + "/products"


def one_customer(_):
    """One customer opens the product list. Return how long they waited, in ms."""
    start = time.perf_counter()  # a precise stopwatch
    with urllib.request.urlopen(URL, timeout=30) as response:
        response.read()
    return (time.perf_counter() - start) * 1000


print("users | average wait | slowest wait")
print("------+--------------+-------------")
for users in [1, 10, 50, 100]:
    with ThreadPoolExecutor(max_workers=users) as pool:  # all users arrive together
        waits = list(pool.map(one_customer, range(users)))
    average = sum(waits) / len(waits)
    print(f"{users:5} | {average:9.0f} ms | {max(waits):8.0f} ms")
