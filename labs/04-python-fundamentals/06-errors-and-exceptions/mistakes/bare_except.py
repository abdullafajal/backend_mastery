"""A bare except hides every error, even a typo. Look at what it prints, then find the real bug."""

try:
    quantity = int("3")
    total = quantity * pirce_paise      # typo: pirce instead of price
except:
    print("please type a number")      # wrong message: the input was fine!
