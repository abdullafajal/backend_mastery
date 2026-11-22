"""Bazaar's bulk-order form, fixed: a bad line is skipped with a message, and the import keeps going."""

lines = ["2", "three", "5", "", "1"]
total = 0

for text in lines:
    try:
        quantity = int(text)                       # the only line that can fail
    except ValueError:
        print(f"Skipped {text!r}: not a number")
        continue                                   # go on with the next line
    total += quantity
    print(f"Added {quantity}")

print("Total boxes:", total)
