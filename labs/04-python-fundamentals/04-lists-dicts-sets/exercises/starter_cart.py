"""Every new customer starts with Bazaar's 'starter cart' (one free sample).
BUG: when Priya adds an item, Asha's cart and the starter cart change too.
Your task: give each customer her OWN list, so only Priya's cart changes."""

starter = ["Masala Box sample"]

asha_cart = starter
priya_cart = starter
priya_cart.append("Cotton Kurta")

print("Starter:", starter)
print("Asha:   ", asha_cart)
print("Priya:  ", priya_cart)
