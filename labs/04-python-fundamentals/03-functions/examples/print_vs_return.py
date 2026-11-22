"""The most common beginner bug with functions: print instead of return."""


def subtotal_printed(cart):
    total = 0
    for name, price, quantity in cart:
        total += price * quantity
    print("subtotal is", total)          # shows it on screen... but gives nothing back


def subtotal_returned(cart):
    total = 0
    for name, price, quantity in cart:
        total += price * quantity
    return total                         # gives the value back to whoever called


cart = [("Cotton Kurta", 64900, 1), ("Masala Box", 29900, 2)]
a = subtotal_printed(cart)
b = subtotal_returned(cart)
print("a =", a)                          # None: a function without return gives back None
print("b =", b)
