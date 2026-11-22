"""Bazaar's catalog: load, save, add and search. A catalog is a list of product dicts."""

import json


def load(path):
    """Read the catalog from a JSON file. No file yet means an empty catalog."""
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return []


def save(products, path):
    """Write the catalog to a JSON file (making its folder if needed)."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(products, f, indent=2, ensure_ascii=False)


def add(products, name, price_paise, seller):
    """Add one product and return it. Raise ValueError if a rule is broken."""
    name, seller = name.strip(), seller.strip()
    if not name or not seller:
        raise ValueError("a product needs a name and a seller")
    if price_paise <= 0:
        raise ValueError("the price must be more than ₹0")
    if any(p["name"].lower() == name.lower() for p in products):
        raise ValueError(f"{name!r} is already in the catalog")
    product = {"name": name, "price_paise": price_paise, "seller": seller}
    products.append(product)
    return product


def search(products, word):
    """Products whose name or seller contains `word`, ignoring capital letters."""
    word = word.lower()
    return [p for p in products if word in p["name"].lower() or word in p["seller"].lower()]
