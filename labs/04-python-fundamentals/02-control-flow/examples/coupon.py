"""Bazaar's coupon rules: if / elif / else, with and / or / not."""

code = "DIWALI150"           # try other codes: "FREEDELIVERY", "", "diwali150", "SALE10"
cart_total = 64900           # ₹649, in paise

if code == "DIWALI150" and cart_total >= 50000:       # both must be True
    print("₹150 off")
elif code == "DIWALI150":                              # right code, but the cart is too small
    print("DIWALI150 needs a cart of ₹500 or more")
elif code == "FREESHIP" or code == "FREEDELIVERY":    # either one is enough
    print("free delivery")
elif not code:                                         # an empty code "" counts as False
    print("no coupon")
else:                                                  # none of the above
    print("unknown coupon")
