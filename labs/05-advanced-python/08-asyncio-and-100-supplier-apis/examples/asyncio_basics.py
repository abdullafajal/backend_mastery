"""asyncio basics, no network: three suppliers, each 'answering' after a pause. One thread, one event loop."""

import asyncio
import time


async def fetch_price(supplier, seconds):               # async def = a coroutine: it can pause at await
    print(f"ask   {supplier}")
    await asyncio.sleep(seconds)                         # pause HERE; the event loop runs something else meanwhile
    print(f"reply {supplier}")
    return round(seconds * 1000)                         # a pretend price


async def main():
    start = time.perf_counter()
    prices = await asyncio.gather(                       # start all three, wait for all three
        fetch_price("Patel Spices", 0.3),
        fetch_price("Meera Handloom", 0.1),
        fetch_price("Kumar Footwear", 0.2),
    )
    print(prices, f"in {time.perf_counter() - start:.1f} s")


asyncio.run(main())                                      # start the event loop and run main() in it
