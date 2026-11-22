"""Bazaar v0's search, as a standalone module. BUG: searching "box" finds nothing, though Bazaar sells a Masala Box.
Your task: make the search ignore capital letters, in both the word and the product names."""

products = [
    {"name": "Masala Box", "seller": "Patel Spices"},
    {"name": "Steel Water Bottle", "seller": "Sharma Electronics"},
]


def search(products, word):
    return [p["name"] for p in products if word in p["name"]]


if __name__ == "__main__":
    print(search(products, "box"))
    print(search(products, "BOTTLE"))
    print(search(products, "Masala"))
