"""Ravi's invoice, fixed: every amount is an int number of paise. Rupees appear only when printing."""

shoes_paise = 99900         # Red Running Shoes, ₹999, quantity 1
masala_paise = 29900        # Masala Box, ₹299, quantity 1

subtotal = shoes_paise + masala_paise       # 129800 paise
gst = subtotal * 18 // 100                  # 18% GST = 23364 paise (// = whole-number division)
total = subtotal + gst                      # 153164 paise

print("Customer: Ravi")
print(f"Subtotal: ₹{subtotal // 100:,}.{subtotal % 100:02d}")    # rupees, then 2-digit paise
print(f"GST 18%:  ₹{gst // 100:,}.{gst % 100:02d}")
print(f"Total:    ₹{total // 100:,}.{total % 100:02d}")
