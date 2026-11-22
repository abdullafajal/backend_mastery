"""One cart line for Asha: name, quantity, line total. Shows type conversion."""

product = "Cotton Kurta"
price_paise = 64900
quantity_text = "3"                      # text typed by a customer is always a str

quantity = int(quantity_text)            # convert str -> int, so we can do maths
line_total = price_paise * quantity      # 64900 * 3 = 194700 paise

print(f"{product} x {quantity} = ₹{line_total // 100:,}")
print("type of quantity_text:", type(quantity_text).__name__)
print("type of quantity:     ", type(quantity).__name__)
print("'3' * 3 =", quantity_text * 3)    # str * int repeats text: a classic surprise
