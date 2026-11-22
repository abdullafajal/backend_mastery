class Product:
    def __init__(self, name):
        self.name = name

    def label():                    # forgot self
        return "Product"


print(Product("Masala Box").label())
