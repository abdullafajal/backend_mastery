"""Without __eq__, == asks 'is it the very same object?', not 'is it the same product?'."""


class Product:
    def __init__(self, name):
        self.name = name


print(Product("Masala Box") == Product("Masala Box"))
