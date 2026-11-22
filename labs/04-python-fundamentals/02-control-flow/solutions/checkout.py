"""Ravi's checkout, fixed: += adds each line to the subtotal instead of replacing it."""

cart = [
    ("Cotton Kurta", 64900, 1),
    ("Masala Box", 29900, 2),
    ("Steel Water Bottle", 34900, 1),
]

subtotal = 0
for name, price, quantity in cart:
    subtotal += price * quantity          # += ADDS to the subtotal; = would replace it

if subtotal >= 99900:
    delivery = 0
    delivery_text = "free"
else:
    delivery = 4900
    delivery_text = "₹49"

print(f"Subtotal: ₹{subtotal // 100:,}")
print(f"Delivery: {delivery_text}")
print(f"Total:    ₹{(subtotal + delivery) // 100:,}")
