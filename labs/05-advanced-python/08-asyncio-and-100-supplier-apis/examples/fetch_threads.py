"""Way 2: ask 100 suppliers with 100 threads."""

import os
from concurrent.futures import ThreadPoolExecutor

import httpx

URL = os.environ.get("SUPPLIERS_URL", "http://suppliers:8080")


def fetch_all(n=100):
    limits = httpx.Limits(max_connections=100)
    with httpx.Client(base_url=URL, limits=limits) as client:
        def one(i):
            return client.get(f"/price/{i}").json()["price_paise"]
        with ThreadPoolExecutor(max_workers=100) as pool:
            return list(pool.map(one, range(1, n + 1)))
