"""Save Asha's cart to data/asha_cart.json, then load it back and print the total.
BUG: loading crashes with a JSONDecodeError.
Your task: look at how the file is written (open data/asha_cart.json in VS Code), and write real JSON instead."""

import json

cart = {"customer": "Asha", "items": [
    {"name": "Masala Box", "price_paise": 29900, "quantity": 2},
    {"name": "Cotton Kurta", "price_paise": 64900, "quantity": 1},
]}

with open("data/asha_cart.json", "w", encoding="utf-8") as f:
    f.write(str(cart))

with open("data/asha_cart.json", encoding="utf-8") as f:
    loaded = json.load(f)

total = sum(item["price_paise"] * item["quantity"] for item in loaded["items"])
print(f"{loaded['customer']}'s cart: ₹{total // 100:,}")
