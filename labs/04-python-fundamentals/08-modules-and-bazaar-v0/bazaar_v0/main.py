"""Bazaar v0: a command-line product catalog.

Usage:
  python3 main.py list
  python3 main.py add "Masala Box" 299 "Patel Spices"
  python3 main.py search box
"""

import os
import sys
from pathlib import Path

import catalog                                   # our own module: catalog.py, next to this file
from money import parse_rupees, rupees           # our own module: money.py

# The catalog file lives next to this program. BAZAAR_DATA (an environment variable, Module 2) can point elsewhere.
DATA = Path(os.environ.get("BAZAAR_DATA", Path(__file__).parent / "data" / "catalog.json"))


def show(products):
    if not products:
        print("No products.")
    for p in products:
        print(f"{p['name']:<20} {rupees(p['price_paise']):>10}  {p['seller']}")


def main(args):
    """Run one command. Return 0 if it worked, 1 if it was refused, 2 if the command was wrong."""
    products = catalog.load(DATA)
    if args[:1] == ["list"] and len(args) == 1:
        show(products)
    elif args[:1] == ["add"] and len(args) == 4:
        try:
            product = catalog.add(products, args[1], parse_rupees(args[2]), args[3])
        except ValueError as error:
            print("Not added:", error)
            return 1
        catalog.save(products, DATA)
        print(f"Added {product['name']} at {rupees(product['price_paise'])}.")
    elif args[:1] == ["search"] and len(args) == 2:
        show(catalog.search(products, args[1]))
    else:
        print(__doc__.strip())
        return 2
    return 0


if __name__ == "__main__":                       # True only when you run this file, not when it's imported
    sys.exit(main(sys.argv[1:]))                 # sys.argv: the words typed after "python3"
