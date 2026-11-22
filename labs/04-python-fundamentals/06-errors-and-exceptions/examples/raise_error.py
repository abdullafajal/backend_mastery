"""Your own rules can raise errors too. The function says WHAT is wrong; the caller decides what to show."""

stock = {"Masala Box": 40, "Wireless Earbuds": 8}


def reserve(name, quantity):
    """Take `quantity` items from stock, or raise ValueError with the reason."""
    if quantity <= 0:
        raise ValueError("quantity must be at least 1")
    if quantity > stock[name]:
        raise ValueError(f"only {stock[name]} {name} left")
    stock[name] -= quantity
    return stock[name]


for name, quantity in [("Masala Box", 2), ("Wireless Earbuds", 10), ("Masala Box", 0)]:
    try:
        left = reserve(name, quantity)
        print(f"Reserved {quantity} {name}. {left} left.")
    except ValueError as error:
        print(f"Can't reserve {quantity} {name}: {error}")
