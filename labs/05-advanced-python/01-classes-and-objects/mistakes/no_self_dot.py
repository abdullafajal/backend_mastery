class Product:
    def __init__(self, name):
        self.name = name

    def label(self):
        return name.upper()          # forgot self. in front of name


print(Product("Masala Box").label())
