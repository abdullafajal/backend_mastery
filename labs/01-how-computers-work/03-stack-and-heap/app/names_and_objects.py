# names_and_objects.py: in Python, a variable is a NAME that points to an OBJECT on the heap.
# Run it with: python3 names_and_objects.py

import sys

price = 999
cart = ["Masala Box", "Cotton Kurta"]

print("1) Every object has an identity (its address) and a size:")
print(f"   id(price) = {id(price)}   size = {sys.getsizeof(price)} bytes")
print(f"   id(cart)  = {id(cart)}   size = {sys.getsizeof(cart)} bytes")

print("2) Two names can point to the SAME object:")
ashas_cart = ["Masala Box"]
same_cart = ashas_cart              # no copy! both names point to one list
same_cart.append("Steel Water Bottle")
print(f"   ashas_cart = {ashas_cart}")
print(f"   same object? {ashas_cart is same_cart}")

print("3) A real copy is a NEW object:")
copy_cart = list(ashas_cart)        # makes a new list with the same items
copy_cart.append("Red Running Shoes")
print(f"   ashas_cart = {ashas_cart}")
print(f"   copy_cart  = {copy_cart}")
print(f"   same object? {ashas_cart is copy_cart}")

print("4) Sizes of some empty and small objects:")
for thing in [0, 999, 10**30, "", "Masala Box", [], [1, 2, 3], {}, {"id": 1}]:
    print(f"   {thing!r:>34} -> {sys.getsizeof(thing):>4} bytes")
