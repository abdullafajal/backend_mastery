"""Ravi's invoice. BUG: money is stored as float, so the total prints wrong.
Your task: store every price in paise (int) and print the lines exactly right."""

shoes_price = 999.00        # Red Running Shoes, quantity 1
masala_price = 299.00       # Masala Box, quantity 1

subtotal = shoes_price + masala_price
gst = subtotal * 0.18       # 18% GST
total = subtotal + gst

print("Customer: Ravi")
print("Subtotal:", subtotal)
print("GST 18%: ", gst)
print("Total:   ", total)
