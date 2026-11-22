"""A customer types a quantity. try/except turns a crash into a friendly message."""

for text in ["3", "three"]:
    try:
        quantity = int(text)                       # may fail with ValueError
        print(f"{text!r}: OK, {quantity} added to the cart")
    except ValueError:                             # runs only if that error happened
        print(f"{text!r}: please type a number, like 3")
print("The shop is still running.")
