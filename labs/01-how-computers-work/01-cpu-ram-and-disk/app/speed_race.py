# speed_race.py: how long does Bazaar wait for data from RAM, disk and the network?
# Run it with: python3 speed_race.py   (the lab runs it inside Docker for you)

import http.client
import json
import os
import time
from pathlib import Path

HERE = Path(__file__).parent
ORDERS_FILE = Path(os.environ.get("ORDERS_FILE", "/tmp/orders.log"))
INVENTORY_HOST = os.environ.get("INVENTORY_HOST", "localhost")


def average_time(job, repeat):
    """Run job() many times. Return the average time of one run, in nanoseconds."""
    start = time.perf_counter_ns()  # a precise stopwatch, in nanoseconds
    for _ in range(repeat):
        job()
    return (time.perf_counter_ns() - start) / repeat


# 1. RAM: the products are already loaded into a Python dict in memory.
products = {p["id"]: p for p in json.loads((HERE / "products.json").read_text())}

def from_ram():
    return products[1]["name"]  # look up Red Running Shoes in memory


# 2. Disk, reading: open the products file and read it again.
def read_from_disk():
    return (HERE / "products.json").read_bytes()


# 3. Disk, saving for real: write an order and force it onto the disk with fsync.
orders = ORDERS_FILE.open("a")

def save_to_disk():
    orders.write('{"order": "Masala Box x 2", "total": 598}\n')
    orders.flush()            # move the text from Python to the operating system
    os.fsync(orders.fileno()) # ask the OS to really put it on the disk, and wait


# 4. Network: ask another server (inventory-service) how many shoes are in stock.
connection = http.client.HTTPConnection(INVENTORY_HOST, 9000, timeout=5)

def over_network():
    connection.request("GET", "/stock/1")
    return connection.getresponse().read()


results = [
    ("RAM (dict lookup)", average_time(from_ram, 1_000_000)),
    ("Disk read (file)", average_time(read_from_disk, 2_000)),
    ("Disk save (fsync)", average_time(save_to_disk, 300)),
    ("Network (other server)", average_time(over_network, 300)),
]

ram = results[0][1]
print(f"{'where the data comes from':<25} | {'one trip':>10} | vs RAM")
print("-" * 25 + "-+-" + "-" * 10 + "-+-" + "-" * 10)
for name, ns in results:
    shown = f"{ns:,.0f} ns" if ns < 10_000 else f"{ns / 1000:,.0f} µs"
    print(f"{name:<25} | {shown:>10} | {ns / ram:>8,.0f}x")
