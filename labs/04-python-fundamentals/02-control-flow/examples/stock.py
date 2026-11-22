"""Masala Box stock: a while loop, then a for loop with continue and break."""

# 1. while: repeat as long as the condition is True.
stock = 3
while stock > 0:
    stock -= 1                                     # same as: stock = stock - 1
    print(f"Sold one Masala Box. {stock} left.")
print("Out of stock!")

# 2. for, with continue (skip this one) and break (stop the loop).
stock = 5
for wanted in [2, 4, 2, 1, 3]:                     # quantities customers ask for, in order
    if wanted > stock:
        print(f"Wants {wanted}, only {stock} left: refused.")
        continue                                   # skip the rest; go to the next customer
    stock -= wanted
    print(f"Sold {wanted}. {stock} left.")
    if stock == 0:
        print("Sold out. Closing orders.")
        break                                      # leave the loop now
