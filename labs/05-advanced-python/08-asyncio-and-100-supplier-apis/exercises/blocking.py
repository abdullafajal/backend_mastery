"""Ten suppliers with asyncio. BUG: it takes 1.0 s instead of 0.1 s, as if they ran one by one.
Your task: find the line that blocks the whole event loop, and make it pause the asyncio way."""

import asyncio
import time


async def fetch_price(supplier):
    time.sleep(0.1)                                   # pretend: waiting for the supplier
    return 20000 + supplier * 100


async def main():
    start = time.perf_counter()
    prices = await asyncio.gather(*(fetch_price(s) for s in range(1, 11)))
    print(f"{len(prices)} prices in {time.perf_counter() - start:.1f} s")


asyncio.run(main())
