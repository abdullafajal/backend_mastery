"""Save Asha's cart to data/asha_cart.json, then load it back and print the total.
Fixed: json.dump writes real JSON (double quotes), so json.load can read it back."""

import json

cart = {"customer": "Asha", "items": [
    {"name": "Masala Box", "price_paise": 29900, "quantity": 2},
    {"name": "Cotton Kurta", "price_paise": 64900, "quantity": 1},
]}

with open("data/asha_cart.json", "w", encoding="utf-8") as f:
    json.dump(cart, f, indent=2)                   # real JSON, not Python's own text for a dict

with open("data/asha_cart.json", encoding="utf-8") as f:
    loaded = json.load(f)

total = sum(item["price_paise"] * item["quantity"] for item in loaded["items"])
print(f"{loaded['customer']}'s cart: ₹{total // 100:,}")
