"""Ravi's checkout, fixed: cart_subtotal now RETURNS the subtotal instead of giving back None."""


def rupees(paise):
    return f"₹{paise // 100:,}.{paise % 100:02d}"


def cart_subtotal(cart):
    subtotal = 0
    for name, price, quantity in cart:
        subtotal += price * quantity
    return subtotal                      # without this line, the function gives back None


def delivery_charge(subtotal):
    if subtotal >= 99900:
        return 0
    return 4900


cart = [("Cotton Kurta", 64900, 1), ("Masala Box", 29900, 2), ("Steel Water Bottle", 34900, 1)]
subtotal = cart_subtotal(cart)
delivery = delivery_charge(subtotal)
print("Subtotal:", rupees(subtotal))
print("Delivery:", rupees(delivery))
print("Total:   ", rupees(subtotal + delivery))
