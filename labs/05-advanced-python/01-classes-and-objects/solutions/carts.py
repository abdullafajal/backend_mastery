"""Two customers, two carts, fixed: the list is made in __init__, so every Cart gets its own."""


class Cart:
    def __init__(self, customer):
        self.customer = customer
        self.lines = []                          # a new list for THIS cart

    def add(self, name, quantity=1):
        self.lines.append((name, quantity))


asha = Cart("Asha")
ravi = Cart("Ravi")
ravi.add("Cotton Kurta")
asha.add("Masala Box", 2)

print("Asha:", asha.lines)
print("Ravi:", ravi.lines)
