"""A dict: values looked up by a name (a key). One Bazaar product."""

product = {
    "name": "Masala Box",
    "price_paise": 29900,
    "seller": "Patel Spices",
}

print(product["name"])                     # look up by key
product["price_paise"] = 27900             # change a value (Diwali price)
product["stock"] = 40                      # a new key adds a new entry
print(product)
print("rating:", product.get("rating"))    # .get gives None instead of crashing
print("rating:", product.get("rating", "no ratings yet"))   # or your own default
print("has a seller?", "seller" in product)                 # `in` checks the KEYS

for key, value in product.items():         # every key with its value
    print(f"{key:<12} {value}")
