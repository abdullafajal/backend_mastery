"""A typo in an overriding method's name. No error: the gift card silently keeps Product's version."""


class Product:
    def needs_delivery(self):
        return True


class GiftCard(Product):
    def needs_delivary(self):            # typo: delivary, so this is a NEW method, not an override
        return False


print("gift card needs delivery?", GiftCard().needs_delivery())
