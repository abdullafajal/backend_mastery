# check_python.py: is your computer ready to build Bazaar?
# Run it with: python3 check_python.py   (on Windows: py check_python.py)

import platform  # tells us about the computer and the Python version
import sys  # tells us about the Python program that is running this file

REQUIRED = (3, 13)  # this course uses Python 3.13

print(f"Python version   : {platform.python_version()}")
print(f"Python lives at  : {sys.executable}")  # the exact file that is running this script
print(f"Operating system : {platform.system()}")

if sys.version_info[:2] < REQUIRED:  # compare (major, minor), e.g. (3, 9) < (3, 13)
    print("Not ready: please install Python 3.13 or newer.")
    sys.exit(1)  # a non-zero exit code means "something went wrong"

# A first taste of Bazaar: add up Asha's cart.
cart = [
    ("Masala Box", 299, 2),  # (product, price in rupees, quantity)
    ("Cotton Kurta", 649, 1),
]
total = sum(price * quantity for _name, price, quantity in cart)
print(f"Asha's cart total: ₹{total}")
print("Ready to build Bazaar!")
