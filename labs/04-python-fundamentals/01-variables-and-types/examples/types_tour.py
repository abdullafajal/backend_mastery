"""A tour of Python's basic types, with Bazaar data."""

name = "Masala Box"          # str: text, in quotes
price_paise = 29900          # int: a whole number (₹299 = 29900 paise)
in_stock = True              # bool: True or False
rating = 4.5                 # float: a number with a decimal point
discount_code = None         # None: "no value yet"

for value in [name, price_paise, in_stock, rating, discount_code]:
    print(f"{value!r:<14} type: {type(value).__name__}")   # !r shows strings with their quotes
