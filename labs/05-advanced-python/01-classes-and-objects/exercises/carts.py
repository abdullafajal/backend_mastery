"""Two customers, two carts. BUG: Asha's cart shows Ravi's Cotton Kurta.
Your task: make each Cart get its own list of lines."""


class Cart:
    lines = []                                   # <- look here

    def __init__(self, customer):
        self.customer = customer

    def add(self, name, quantity=1):
        self.lines.append((name, quantity))


asha = Cart("Asha")
ravi = Cart("Ravi")
ravi.add("Cotton Kurta")
asha.add("Masala Box", 2)

print("Asha:", asha.lines)
print("Ravi:", ravi.lines)
