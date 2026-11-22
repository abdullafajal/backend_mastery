"""Add up Ravi's cart with a for loop. Each item is (name, price in paise, quantity)."""

cart = [                                  # a list: many values in [ ] (Lesson 4 explains lists fully)
    ("Cotton Kurta", 64900, 1),
    ("Masala Box", 29900, 2),
    ("Steel Water Bottle", 34900, 1),
]

total = 0                                 # start at zero, BEFORE the loop
for name, price, quantity in cart:        # once per item; the three names take that item's values
    line = price * quantity
    total += line                         # same as: total = total + line
    print(f"{name:<20} x{quantity}  ₹{line // 100:>5,}")
print(f"{'Total':<20}     ₹{total // 100:>5,}")
