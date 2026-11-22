"""Going deeper: if/else inside, sum/any/all with a generator, and two `for`s."""

from catalog_data import catalog

# if ... else BEFORE the for: choose a value for every item (no item is skipped)
labels = [p["name"] if p["price_paise"] < 50000 else "too costly" for p in catalog]
print(labels)

# No brackets inside sum(), any(), all(): a generator expression, which makes values one at a time
print("stock worth ₹", sum(p["price_paise"] * p["stock"] for p in catalog) // 100)
print("anything sold out?", any(p["stock"] == 0 for p in catalog))
print("every price set?  ", all(p["price_paise"] > 0 for p in catalog))

# Two fors: one line per unit in the cart
cart = [("Masala Box", 2), ("Cotton Kurta", 1)]
print([name for name, quantity in cart for _ in range(quantity)])
