"""Going deeper: the lookup order (__mro__), a read-only property, and the __eq__/__hash__ trap."""


class Product:
    def __init__(self, name, price_paise):
        self.name = name
        self.price_paise = price_paise

    @property                                   # read like an attribute, computed like a method
    def price_rupees(self):
        return self.price_paise // 100

    def __eq__(self, other):
        return isinstance(other, Product) and self.name == other.name


class GiftCard(Product):
    pass


print([cls.__name__ for cls in GiftCard.__mro__])        # where Python looks, in order
masala = Product("Masala Box", 29900)
print(masala.price_rupees)                               # no () needed
try:
    masala.price_rupees = 1                              # a property without a setter can't be assigned
except AttributeError as error:
    print("AttributeError:", error)
try:
    print({masala})                                      # defining __eq__ removed the default __hash__
except TypeError as error:
    print("TypeError:", error)
