"""Special methods let your objects work with print(), ==, sorted() and len()."""


class Product:
    def __init__(self, name, price_paise, seller):
        self.name = name
        self.price_paise = price_paise
        self.seller = seller

    def __repr__(self):                                   # for developers: repr(), lists, the REPL
        return f"Product({self.name!r}, {self.price_paise})"

    def __str__(self):                                    # for customers: print(), str(), f-strings
        return f"{self.name} - ₹{self.price_paise // 100:,}"

    def __eq__(self, other):                              # what == means for products
        return isinstance(other, Product) and (self.name, self.seller) == (other.name, other.seller)

    def __lt__(self, other):                              # what < means: cheaper first; sorted() uses it
        return self.price_paise < other.price_paise


class Cart:
    def __init__(self):
        self.lines = []

    def add(self, product, quantity=1):
        self.lines.append((product, quantity))

    def __len__(self):                                    # what len(cart) means: number of items
        return sum(quantity for _, quantity in self.lines)


earbuds = Product("Wireless Earbuds", 149900, "Sharma Electronics")
masala = Product("Masala Box", 29900, "Patel Spices")
bottle = Product("Steel Water Bottle", 34900, "Sharma Electronics")

print(masala)                                            # uses __str__
print([masala, bottle])                                  # a list shows each item with __repr__
print(masala == Product("Masala Box", 29900, "Patel Spices"))
print(sorted([earbuds, masala, bottle]))

cart = Cart()
cart.add(masala, 2)
cart.add(bottle)
print("items in cart:", len(cart))
