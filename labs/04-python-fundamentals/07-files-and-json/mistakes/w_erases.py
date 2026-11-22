"""Opening with "w" EMPTIES the file first. Reading it afterwards finds nothing. No error, just lost data."""

with open("data/orders.log", "w", encoding="utf-8") as f:
    pass                                       # meant to read, opened for writing by mistake

with open("data/orders.log", encoding="utf-8") as f:
    print(repr(f.read()))
