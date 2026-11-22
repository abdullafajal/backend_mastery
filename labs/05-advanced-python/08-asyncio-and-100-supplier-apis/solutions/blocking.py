"""Ten suppliers with asyncio, fixed: await asyncio.sleep pauses only this task, so all ten wait together."""

import asyncio
import time


async def fetch_price(supplier):
    await asyncio.sleep(0.1)                          # pause this task; the event loop runs the others
    return 20000 + supplier * 100


async def main():
    start = time.perf_counter()
    prices = await asyncio.gather(*(fetch_price(s) for s in range(1, 11)))
    print(f"{len(prices)} prices in {time.perf_counter() - start:.1f} s")


asyncio.run(main())
