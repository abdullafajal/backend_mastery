"""Bazaar's GiftCard. BUG: describing it crashes with an AttributeError.
Your task: make GiftCard's __init__ let Product set up the name, price and seller too."""


class Product:
    def __init__(self, name, price_paise, seller):
        self.name = name
        self.price_paise = price_paise
        self.seller = seller

    def needs_delivery(self):
        return True

    def describe(self):
        delivery = "delivered" if self.needs_delivery() else "sent by email"
        return f"{self.name} (₹{self.price_paise // 100:,}) from {self.seller}, {delivery}"


class GiftCard(Product):
    def __init__(self, price_paise, to_email):
        self.to_email = to_email                     # only the gift card's own extra data is set

    def needs_delivery(self):
        return False


card = GiftCard(50000, "priya@example.com")
print(card.describe())
print("to:", card.to_email)
