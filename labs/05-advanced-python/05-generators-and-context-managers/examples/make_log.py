"""Write Bazaar's order log: 200,000 lines, the same every time (fixed random seed)."""

import random

PRODUCTS = [("Red Running Shoes", 99900), ("Cotton Kurta", 64900), ("Masala Box", 29900),
            ("Wireless Earbuds", 149900), ("Steel Water Bottle", 34900)]
CUSTOMERS = ["Asha", "Ravi", "Fatima", "John", "Priya"]

random.seed(2026)
with open("data/orders.log", "w", encoding="utf-8") as f:
    for number in range(1, 200_001):
        name, price = random.choice(PRODUCTS)
        status = random.choice(["PAID", "PAID", "PAID", "FAILED"])
        f.write(f"{number},{random.choice(CUSTOMERS)},{name},{price},{status}\n")
print("wrote 200000 orders to data/orders.log")
