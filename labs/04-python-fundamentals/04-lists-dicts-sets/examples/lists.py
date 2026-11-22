"""A list: many values, in order, in [ ]. Asha's cart, as a list of product names."""

cart = ["Masala Box", "Cotton Kurta"]      # a list with 2 items
cart.append("Steel Water Bottle")          # add one at the end

print(cart)
print("items:", len(cart))                 # len = how many
print("first:", cart[0])                   # positions start at 0
print("last: ", cart[-1])                  # -1 = the last one
print("Masala Box in cart?", "Masala Box" in cart)

cart.remove("Cotton Kurta")                # take one out, by value
print(cart)
for item in cart:                          # a for loop walks the list in order
    print("-", item)
