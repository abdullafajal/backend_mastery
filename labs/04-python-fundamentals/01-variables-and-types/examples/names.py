"""Names point to objects. Assigning again moves the name; it doesn't change the old object."""

price = 999                  # the name `price` points to the int object 999
old_price = price            # a second name for the SAME object
price = 899                  # Diwali: `price` now points to a NEW object, 899

print("price:    ", price)
print("old_price:", old_price)           # still 999: ints can't change, the name moved
print("same object?", price is old_price)
