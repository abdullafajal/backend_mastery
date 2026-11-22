# make_logs.py: create Bazaar's access log for one Diwali day. Same seed = same file for every student.
import random
from pathlib import Path

random.seed(2026)
CUSTOMERS = ["asha", "ravi", "fatima", "john", "priya", "meera", "arjun", "sara"]
PRODUCTS = {"red_running_shoes": 999, "cotton_kurta": 649, "masala_box": 299,
            "wireless_earbuds": 1499, "steel_water_bottle": 349}
PATHS = ["/products", "/products", "/products", "/cart", "/checkout", "/search?q=shoes"]

lines = []
for i in range(2000):
    hour = random.choice([9, 10, 11, 12, 12, 13, 18, 19, 20, 20, 20, 21, 21, 22])
    t = f"2026-11-21T{hour:02d}:{random.randint(0, 59):02d}:{random.randint(0, 59):02d}"
    path = random.choice(PATHS)
    status = random.choices([200, 404, 500], weights=[90, 4, 6])[0]
    ms = random.randint(20, 400) if status != 500 else random.randint(800, 3000)
    cust = random.choice(CUSTOMERS)
    if path == "/checkout":
        product = random.choice(list(PRODUCTS))
        qty = random.randint(1, 3)
        amount = PRODUCTS[product] * qty if status == 200 else 0
        lines.append((t, f"{t} POST {path} {status} {ms}ms customer={cust} product={product} qty={qty} amount={amount}"))
    else:
        lines.append((t, f"{t} GET {path} {status} {ms}ms customer={cust}"))

lines.sort()
logs = Path("/srv/bazaar/logs")
logs.mkdir(parents=True, exist_ok=True)
(logs / "access.log").write_text("\n".join(l for _, l in lines) + "\n")
print(f"wrote {len(lines)} lines to {logs / 'access.log'}")
