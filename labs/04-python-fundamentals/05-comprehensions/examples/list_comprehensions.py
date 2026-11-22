"""Three list comprehensions on Bazaar's catalog."""

from catalog_data import catalog

names = [p["name"] for p in catalog]                              # no if: one result per product
print(names)

prices_rupees = [p["price_paise"] // 100 for p in catalog]        # any expression: here, paise -> rupees
print(prices_rupees)

low_stock = [p["name"] for p in catalog if p["stock"] < 20]       # with if: only some products
print("Reorder soon:", low_stock)
