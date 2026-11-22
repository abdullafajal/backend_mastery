"""The same Product, written by hand (Lesson 1) and as a dataclass."""

from dataclasses import dataclass


class ProductByHand:
    def __init__(self, name, price_paise, seller):
        self.name = name
        self.price_paise = price_paise
        self.seller = seller

    def __repr__(self):
        return f"ProductByHand(name={self.name!r}, price_paise={self.price_paise!r}, seller={self.seller!r})"

    def __eq__(self, other):
        return isinstance(other, ProductByHand) and (self.name, self.price_paise, self.seller) == (other.name, other.price_paise, other.seller)


@dataclass                                   # writes __init__, __repr__ and __eq__ for you, from the fields below
class Product:
    name: str                                # a field: its name and its type
    price_paise: int
    seller: str


print(ProductByHand("Masala Box", 29900, "Patel Spices"))
print(Product("Masala Box", 29900, "Patel Spices"))
print(Product("Masala Box", 29900, "Patel Spices") == Product("Masala Box", 29900, "Patel Spices"))
