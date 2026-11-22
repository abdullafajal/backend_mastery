"""Bazaar's catalog: a list of dicts. This is how most real data looks in Python (and in JSON)."""

catalog = [
    {"name": "Red Running Shoes", "price_paise": 99900, "seller": "Kumar Footwear", "stock": 12},
    {"name": "Cotton Kurta", "price_paise": 64900, "seller": "Meera Handloom", "stock": 25},
    {"name": "Masala Box", "price_paise": 29900, "seller": "Patel Spices", "stock": 40},
    {"name": "Wireless Earbuds", "price_paise": 149900, "seller": "Sharma Electronics", "stock": 8},
    {"name": "Steel Water Bottle", "price_paise": 34900, "seller": "Sharma Electronics", "stock": 60},
]

for p in catalog:
    print(f"{p['name']:<20} ₹{p['price_paise'] // 100:>6,}  stock {p['stock']:>3}")

cheapest = catalog[0]
for p in catalog:
    if p["price_paise"] < cheapest["price_paise"]:
        cheapest = p
print("Cheapest:", cheapest["name"])

word = "bottle"
for p in catalog:
    if word in p["name"].lower():          # .lower() so "Bottle" matches "bottle"
        print("Search", repr(word), "->", p["name"])
