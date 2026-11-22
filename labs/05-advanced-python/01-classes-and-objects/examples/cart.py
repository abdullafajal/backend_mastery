"""Objects working together: a Cart holds Products and quantities."""


class Product:
    def __init__(self, name, price_paise):
        self.name = name
        self.price_paise = price_paise


class Cart:
    def __init__(self, customer):
        self.customer = customer
        self.lines = []                          # each Cart gets its OWN new list

    def add(self, product, quantity=1):
        self.lines.append((product, quantity))

    def total_paise(self):
        return sum(product.price_paise * quantity for product, quantity in self.lines)


kurta = Product("Cotton Kurta", 64900)
masala = Product("Masala Box", 29900)

ravi = Cart("Ravi")
ravi.add(kurta)
ravi.add(masala, 2)
print(ravi.customer, len(ravi.lines), "lines, total", ravi.total_paise() // 100, "rupees")
