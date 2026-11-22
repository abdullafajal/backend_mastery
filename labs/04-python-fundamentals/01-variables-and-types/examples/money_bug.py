"""Why Bazaar never stores money as float: 18% GST on a Cotton Kurta."""

# With float (rupees as a decimal number):
price = 649.00                     # ₹649
total = price * 1.18               # add 18% GST
print("float total:", total)       # expected 765.82 ...
print("equals 765.82?", total == 765.82)

# With int paise (₹1 = 100 paise): exact, always.
price_paise = 64900
gst_paise = price_paise * 18 // 100          # 18% of 64900 = 11682 (// = whole-number division)
total_paise = price_paise + gst_paise        # 76582
print("paise total:", total_paise)
print(f"shown to the customer: ₹{total_paise // 100:,}.{total_paise % 100:02d}")
