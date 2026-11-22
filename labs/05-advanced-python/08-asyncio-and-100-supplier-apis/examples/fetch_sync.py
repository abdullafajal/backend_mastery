"""Way 1: ask 100 suppliers one by one."""

import os

import httpx

URL = os.environ.get("SUPPLIERS_URL", "http://suppliers:8080")


def fetch_all(n=100):
    with httpx.Client(base_url=URL) as client:
        return [client.get(f"/price/{i}").json()["price_paise"] for i in range(1, n + 1)]
