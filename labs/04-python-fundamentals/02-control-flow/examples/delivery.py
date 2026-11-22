"""Free delivery from ₹999 (99900 paise), otherwise ₹49. One if/else, tried on four carts."""

FREE_FROM_PAISE = 99900      # ₹999
CHARGE_PAISE = 4900          # ₹49

for cart_total in [29900, 99800, 99900, 149900]:      # four example cart totals, in paise
    if cart_total >= FREE_FROM_PAISE:                   # True for ₹999 and more
        message = "free"
    else:                                               # everything else
        message = f"₹{CHARGE_PAISE // 100}"
    print(f"Cart ₹{cart_total // 100:,}: delivery {message}")
