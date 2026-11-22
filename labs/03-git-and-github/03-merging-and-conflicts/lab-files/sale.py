"""Diwali sale prices for Bazaar. Rule: a fixed discount on every product of ₹500 or more."""

from products import PRODUCTS, rupees

DISCOUNT_PAISE = 10000      # ₹100 off, in paise (never float for money)
MIN_PRICE_PAISE = 50000     # only for products of ₹500 or more


def diwali_price(price_paise):
    if price_paise >= MIN_PRICE_PAISE:
        return price_paise - DISCOUNT_PAISE
    return price_paise


if __name__ == "__main__":
    for p in PRODUCTS:
        old, new = p["price_paise"], diwali_price(p["price_paise"])
        note = "  Diwali offer!" if new < old else ""
        print(f"{p['name']:<20} {rupees(old):>7} -> {rupees(new):>7}{note}")
