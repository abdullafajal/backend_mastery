"""A Product class: one blueprint, many product objects, each with its own data."""


class Product:
    """One product in Bazaar's catalog. Money is int paise."""

    def __init__(self, name, price_paise, seller, stock):     # runs when you make a new Product
        self.name = name                                        # self = the new object being made
        self.price_paise = price_paise
        self.seller = seller
        self.stock = stock

    def price_text(self):                                       # a method: a function that belongs to the class
        return f"₹{self.price_paise // 100:,}.{self.price_paise % 100:02d}"

    def sell(self, quantity):
        """Take `quantity` from this product's stock, or raise ValueError."""
        if quantity > self.stock:
            raise ValueError(f"only {self.stock} {self.name} left")
        self.stock -= quantity


masala = Product("Masala Box", 29900, "Patel Spices", 40)       # make an object (an instance)
earbuds = Product("Wireless Earbuds", 149900, "Sharma Electronics", 8)

print(masala.name, masala.price_text())                         # attributes and methods use a dot
masala.sell(2)
print("Masala Box stock:", masala.stock)
print("Earbuds stock:   ", earbuds.stock)                       # a different object: unchanged

try:
    earbuds.sell(10)
except ValueError as error:
    print("Not sold:", error)
