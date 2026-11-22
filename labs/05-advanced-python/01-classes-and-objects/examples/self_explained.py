"""What `self` really is: the object before the dot."""


class Product:
    def __init__(self, name, stock):
        self.name = name
        self.stock = stock

    def sell(self, quantity):
        self.stock -= quantity


masala = Product("Masala Box", 40)
masala.sell(2)                    # what you write
Product.sell(masala, 2)           # what Python actually does: masala goes in as `self`
print(masala.stock)               # 40 - 2 - 2
print(type(masala).__name__, isinstance(masala, Product))
