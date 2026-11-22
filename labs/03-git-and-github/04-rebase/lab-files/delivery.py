"""Delivery charge for a Bazaar order. Free delivery when the cart is ₹999 or more."""

FREE_DELIVERY_FROM_PAISE = 99900    # ₹999, in paise (never float for money)
DELIVERY_CHARGE_PAISE = 4900        # ₹49


def delivery_charge(cart_total_paise):
    if cart_total_paise >= FREE_DELIVERY_FROM_PAISE:
        return 0
    return DELIVERY_CHARGE_PAISE


if __name__ == "__main__":
    from products import PRODUCTS, rupees
    for p in PRODUCTS[:3]:                         # three example carts, one product each
        charge = delivery_charge(p["price_paise"])
        print(f"Cart {rupees(p['price_paise']):>6} ({p['name']}): delivery {rupees(charge) if charge else 'free'}")
