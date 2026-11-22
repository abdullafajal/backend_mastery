"""Names made inside a function live only inside it (local scope)."""

GST_PERCENT = 18                          # made outside any function: every function can read it


def gst(amount_paise):
    tax = amount_paise * GST_PERCENT // 100     # `tax` is local: it exists only during this call
    return tax


print(gst(64900))
print(tax)                                # NameError: there is no `tax` out here
