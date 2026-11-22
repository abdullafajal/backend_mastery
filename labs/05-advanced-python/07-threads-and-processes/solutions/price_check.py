"""Fetch 5 supplier prices in threads, fixed: join() waits for every thread before the result is used."""

import threading
import time

prices = []


def fetch_price(supplier):
    time.sleep(0.2)                       # waiting for the supplier
    prices.append((supplier, len(supplier) * 1000))


threads = [threading.Thread(target=fetch_price, args=(s,))
           for s in ["Patel Spices", "Meera Handloom", "Kumar Footwear", "Sharma Electronics", "Supplier 5"]]
for t in threads:
    t.start()
for t in threads:
    t.join()                              # wait until this thread has finished

print("prices received:", len(prices))
