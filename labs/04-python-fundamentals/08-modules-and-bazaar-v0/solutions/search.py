"""Bazaar v0's search, fixed: both sides are made lowercase before comparing, so capital letters don't matter."""

products = [
    {"name": "Masala Box", "seller": "Patel Spices"},
    {"name": "Steel Water Bottle", "seller": "Sharma Electronics"},
]


def search(products, word):
    word = word.lower()                                            # "BOTTLE" -> "bottle"
    return [p["name"] for p in products if word in p["name"].lower()]


if __name__ == "__main__":
    print(search(products, "box"))
    print(search(products, "BOTTLE"))
    print(search(products, "Masala"))
