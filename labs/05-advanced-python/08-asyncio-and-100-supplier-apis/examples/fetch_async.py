"""Way 3: ask 100 suppliers with asyncio: one thread, one event loop, 100 requests waiting together."""

import asyncio
import os

import httpx

URL = os.environ.get("SUPPLIERS_URL", "http://suppliers:8080")


async def fetch_all_async(n=100):
    limits = httpx.Limits(max_connections=100)
    async with httpx.AsyncClient(base_url=URL, limits=limits) as client:
        async def one(i):
            response = await client.get(f"/price/{i}")       # pause until the supplier answers
            return response.json()["price_paise"]
        return await asyncio.gather(*(one(i) for i in range(1, n + 1)))


def fetch_all(n=100):
    return asyncio.run(fetch_all_async(n))
