"""Two names, one list. A change through one name is seen through the other."""

ashas_cart = ["Masala Box"]
same_cart = ashas_cart                     # NOT a copy: a second name for the same list
same_cart.append("Cotton Kurta")           # changes the one list
print("ashas_cart:", ashas_cart)           # it has Cotton Kurta too!

own_cart = ashas_cart.copy()               # a real copy: a new list with the same items
own_cart.append("Steel Water Bottle")
print("ashas_cart:", ashas_cart)           # unchanged this time
print("own_cart:  ", own_cart)
