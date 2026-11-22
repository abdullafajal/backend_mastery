# cart_bugs.py: two famous bugs that come from "names point to objects".
# Run it with: python3 cart_bugs.py

import copy

print("1) A default list is created ONCE, when the function is defined, and then shared:")


def add_to_cart(item, cart=[]):      # BUG: this one list is reused by every call
    cart.append(item)
    return cart


print("   Asha:", add_to_cart("Masala Box"))
print("   Ravi:", add_to_cart("Cotton Kurta"))   # Ravi gets Asha's Masala Box!


def add_to_cart_fixed(item, cart=None):
    if cart is None:                  # FIX: make a new list inside the call
        cart = []
    cart.append(item)
    return cart


print("   fixed, Asha:", add_to_cart_fixed("Masala Box"))
print("   fixed, Ravi:", add_to_cart_fixed("Cotton Kurta"))

print("2) A shallow copy copies the outer list, but shares the inner ones:")
orders = [["Masala Box"], ["Cotton Kurta"]]
shallow = list(orders)               # new outer list, SAME inner lists
shallow[0].append("Steel Water Bottle")
print("   original after changing the shallow copy:", orders)
deep = copy.deepcopy(orders)         # new outer list AND new inner lists
deep[1].append("Red Running Shoes")
print("   original after changing the deep copy:   ", orders)
