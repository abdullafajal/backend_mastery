"""A set keeps each value once. A tuple is a fixed group of values."""

sellers = set()                            # an empty set
for name in ["Kumar Footwear", "Meera Handloom", "Patel Spices",
             "Sharma Electronics", "Sharma Electronics"]:
    sellers.add(name)                      # adding a value that's already there does nothing
print(len(sellers), "sellers")
print(sorted(sellers))                     # sets have no order; sorted() gives a list in A-Z order
print("Patel Spices sells here?", "Patel Spices" in sellers)

line = ("Masala Box", 29900, 2)            # a tuple: (name, price, quantity), in ( )
name, price, quantity = line               # unpacking: three names at once
print(name, price * quantity)
