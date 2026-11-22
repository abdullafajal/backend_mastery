"""Dict and set comprehensions: same idea, different brackets."""

from catalog_data import catalog

price_of = {p["name"]: p["price_paise"] for p in catalog}         # { key: value  for ... }
print(price_of["Masala Box"])

sellers = {p["seller"] for p in catalog}                          # { value  for ... } = a set: no repeats
print(sorted(sellers))

stock_value = {p["name"]: p["price_paise"] * p["stock"] // 100 for p in catalog if p["stock"] >= 20}
print(stock_value)                                                # ₹ worth of stock, for well-stocked products
