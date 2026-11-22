"""Write Bazaar's order log to a text file, add to it, then read it back."""

# "w" = write: create the file, or EMPTY it if it exists
with open("data/orders.log", "w", encoding="utf-8") as f:
    f.write("Asha bought 2 Masala Box for ₹598\n")       # \n ends the line
    f.write("Ravi bought 1 Cotton Kurta for ₹649\n")

# "a" = append: add at the end, keep what's there
with open("data/orders.log", "a", encoding="utf-8") as f:
    f.write("Priya bought 1 Steel Water Bottle for ₹349\n")

# no mode = "r", read
with open("data/orders.log", encoding="utf-8") as f:
    for line in f:                                     # a file gives you one line per round
        print(line.rstrip("\n"))                       # rstrip: drop the line's own \n
