"""Calling a coroutine without await doesn't run it: you get a coroutine object, and a warning."""

import asyncio


async def fetch_price(supplier):
    await asyncio.sleep(0.1)
    return 29900


async def main():
    price = fetch_price("Patel Spices")          # forgot await
    print("price:", price)


asyncio.run(main())
