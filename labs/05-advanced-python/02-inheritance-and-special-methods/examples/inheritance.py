"""A GiftCard IS A Product: it inherits everything, and changes only what's different."""


class Product:
    def __init__(self, name, price_paise, seller, stock):
        self.name = name
        self.price_paise = price_paise
        self.seller = seller
        self.stock = stock

    def price_text(self):
        return f"₹{self.price_paise // 100:,}"

    def needs_delivery(self):
        return True

    def describe(self):
        delivery = "delivered" if self.needs_delivery() else "sent by email"
        return f"{self.name} ({self.price_text()}), {delivery}"


class GiftCard(Product):                                  # (Product) = "build on Product"
    def __init__(self, price_paise):
        super().__init__("Bazaar Gift Card", price_paise, "Bazaar", stock=None)   # let Product set up the shared parts

    def needs_delivery(self):                             # override: replace Product's version
        return False


catalog = [Product("Masala Box", 29900, "Patel Spices", 40), GiftCard(50000)]
for item in catalog:
    print(item.describe())                                # one call, the right behaviour for each

card = catalog[1]
print(isinstance(card, GiftCard), isinstance(card, Product))
print(card.price_text())                                  # not written in GiftCard: inherited from Product
