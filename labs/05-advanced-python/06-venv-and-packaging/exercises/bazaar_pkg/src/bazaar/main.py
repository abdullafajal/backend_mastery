"""Bazaar v0's command line, packaged. Installed, it runs as the `bazaar` command.

Usage:
  bazaar list
  bazaar add "Masala Box" 299 "Patel Spices"
  bazaar search box
"""

import os
import sys
from pathlib import Path

from bazaar import catalog                      # inside a package, import with the package name
from bazaar.money import parse_rupees, rupees

# An installed program must not write into its own folder, so the data goes to the user's home folder
# (or wherever BAZAAR_DATA points).
DATA = Path(os.environ.get("BAZAAR_DATA", Path.home() / ".bazaar" / "catalog.json"))


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


def run():
    """The entry point for the `bazaar` command (see pyproject.toml)."""
    sys.exit(main(sys.argv[1:]))
