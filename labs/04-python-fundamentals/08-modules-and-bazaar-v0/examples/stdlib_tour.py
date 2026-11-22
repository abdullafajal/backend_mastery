"""A few modules from Python's standard library, used the Bazaar way."""

import json                                   # import the whole module, use it as json.dumps(...)
import random
import statistics
from datetime import date, timedelta          # or import just the names you need

prices_paise = [99900, 64900, 29900, 149900, 34900]
print("average price:", statistics.mean(prices_paise) // 100, "rupees")

ordered = date(2026, 11, 1)                   # Diwali sale order date
print("delivery by:", ordered + timedelta(days=5))

random.seed(2026)                             # same seed, same "random" picks (good for tests)
print("today's lucky coupon:", random.choice(["DIWALI150", "FREEDELIVERY", "NEW50"]))

print(json.dumps({"ok": True}))
