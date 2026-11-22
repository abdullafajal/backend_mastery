"""Bazaar's 'Under ₹500' shelf for the Diwali home page.
Fixed: prices are in paise, so ₹500 is 50000, not 500."""

from catalog_data import catalog

under_500 = [p["name"] for p in catalog if p["price_paise"] < 50000]    # ₹500 = 50000 paise
print("Under ₹500:", under_500)
