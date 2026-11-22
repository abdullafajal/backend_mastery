"""The same list, built two ways: a loop with append, and a list comprehension."""

from catalog_data import catalog           # the 5 products (modules are Lesson 8; read it as "load the catalog")

# 1. The loop you already know:
cheap = []
for p in catalog:
    if p["price_paise"] < 50000:           # under ₹500
        cheap.append(p["name"])
print(cheap)

# 2. The same thing as a comprehension: [what to keep  for each item  if condition]
cheap = [p["name"] for p in catalog if p["price_paise"] < 50000]
print(cheap)
