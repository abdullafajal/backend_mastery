"""A class can refuse bad data (in __init__), and show itself nicely (with __repr__)."""


class Product:
    def __init__(self, name, price_paise, seller):
        if not isinstance(price_paise, int) or price_paise <= 0:     # a dict would accept anything
            raise ValueError(f"price_paise must be a whole number of paise above 0, not {price_paise!r}")
        self.name = name
        self.price_paise = price_paise
        self.seller = seller

    def __repr__(self):                                              # how the object is shown by print()
        return f"Product({self.name!r}, {self.price_paise}, {self.seller!r})"


print(Product("Cotton Kurta", 64900, "Meera Handloom"))
try:
    Product("Masala Box", "cheap", "Patel Spices")
except ValueError as error:
    print("Refused:", error)

as_dict = {"name": "Masala Box", "price_paise": "cheap"}              # the dict says nothing
print("The dict happily holds:", as_dict["price_paise"])
