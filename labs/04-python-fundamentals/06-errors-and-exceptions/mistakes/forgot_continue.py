"""The bulk-order fix WITHOUT `continue`: after a bad line, the OLD quantity is added again. No error, just a wrong total."""

lines = ["2", "three", "5", "", "1"]
total = 0

for text in lines:
    try:
        quantity = int(text)                       # the only line that can fail
    except ValueError:
        print(f"Skipped {text!r}: not a number")
    total += quantity
    print(f"Added {quantity}")

print("Total boxes:", total)
