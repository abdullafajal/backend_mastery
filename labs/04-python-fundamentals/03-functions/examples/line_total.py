"""Parameters with a default value, and calling with names (keyword arguments)."""


def line_total(price_paise, quantity=1, discount_paise=0):
    """Price times quantity, minus a discount per item. quantity and discount are optional."""
    return (price_paise - discount_paise) * quantity


print(line_total(64900))                              # 1 Cotton Kurta: quantity defaults to 1
print(line_total(29900, 2))                           # 2 Masala Boxes
print(line_total(99900, quantity=2, discount_paise=15000))   # 2 shoes, ₹150 off each
print(line_total(price_paise=34900, quantity=3))      # every argument by name
