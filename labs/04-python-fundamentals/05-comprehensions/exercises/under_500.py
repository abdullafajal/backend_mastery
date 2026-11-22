"""Bazaar's 'Under ₹500' shelf for the Diwali home page.
BUG: the shelf comes out empty. Your task: find the unit mistake in the condition and fix it."""

from catalog_data import catalog

under_500 = [p["name"] for p in catalog if p["price_paise"] < 500]
print("Under ₹500:", under_500)
