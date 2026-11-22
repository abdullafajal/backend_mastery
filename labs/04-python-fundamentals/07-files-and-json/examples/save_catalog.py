"""Save the catalog as JSON, then load it back: the data survives the program ending."""

import json

catalog = [
    {"name": "Masala Box", "price_paise": 29900, "seller": "Patel Spices", "in_stock": True},
    {"name": "Wireless Earbuds", "price_paise": 149900, "seller": "Sharma Electronics", "in_stock": False},
]

with open("data/catalog.json", "w", encoding="utf-8") as f:
    json.dump(catalog, f, indent=2, ensure_ascii=False)   # indent=2: easy to read; ensure_ascii=False: keep ₹ etc. as is

with open("data/catalog.json", encoding="utf-8") as f:
    loaded = json.load(f)

print(loaded[1]["name"], loaded[1]["in_stock"])
print("same data?", loaded == catalog)
