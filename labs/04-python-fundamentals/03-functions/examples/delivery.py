"""Bazaar's delivery rule, written once, used for every cart."""

FREE_FROM_PAISE = 99900      # ₹999
CHARGE_PAISE = 4900          # ₹49


def delivery_charge(cart_total_paise):
    """Return the delivery charge in paise: free from ₹999, otherwise ₹49."""
    if cart_total_paise >= FREE_FROM_PAISE:
        return 0
    return CHARGE_PAISE              # only reached when the if didn't return


for total in [29900, 99900, 159600]:
    charge = delivery_charge(total)                  # call it; the answer comes back into `charge`
    print(f"cart {total} paise -> delivery {charge} paise")
