"""Delivery charge for a Bazaar order. Free delivery when the cart is ₹999 or more."""

FREE_DELIVERY_FROM_PAISE = 99900    # ₹999, in paise (never float for money)
DELIVERY_CHARGE_PAISE = 4900        # ₹49


def delivery_charge(cart_total_paise):
    if cart_total_paise >= FREE_DELIVERY_FROM_PAISE:
        return 0
    return DELIVERY_CHARGE_PAISE
