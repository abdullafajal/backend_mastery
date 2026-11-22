"""Bazaar's bulk-order form: each line is what Patel Spices typed as a quantity of Masala Box.
BUG: one bad line crashes the whole import, and the good lines after it are lost.
Your task: catch the ValueError for each line, print a message, skip it, and keep going."""

lines = ["2", "three", "5", "", "1"]
total = 0

for text in lines:
    quantity = int(text)
    total += quantity
    print(f"Added {quantity}")

print("Total boxes:", total)
