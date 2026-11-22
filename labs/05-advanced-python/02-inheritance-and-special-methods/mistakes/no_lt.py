"""Without __lt__, Python doesn't know how to sort products."""


class Product:
    def __init__(self, name, price_paise):
        self.name = name
        self.price_paise = price_paise


print(sorted([Product("Wireless Earbuds", 149900), Product("Masala Box", 29900)]))
