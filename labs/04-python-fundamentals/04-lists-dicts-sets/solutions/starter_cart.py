"""Every new customer starts with Bazaar's 'starter cart' (one free sample).
Fixed: .copy() gives each customer her own list, so only Priya's cart changes."""

starter = ["Masala Box sample"]

asha_cart = starter.copy()                 # a new list for Asha
priya_cart = starter.copy()                # a new list for Priya
priya_cart.append("Cotton Kurta")

print("Starter:", starter)
print("Asha:   ", asha_cart)
print("Priya:  ", priya_cart)
