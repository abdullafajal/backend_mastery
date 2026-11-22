# last_earbuds.py: 10 customers try to buy the last 8 Wireless Earbuds at the same moment.
# Run it with: python3 last_earbuds.py

import threading
import time


def sale(use_lock):
    stock = {"Wireless Earbuds": 8}  # shared by all threads
    sold = []                         # who got a pair
    lock = threading.Lock()           # only one thread may hold it at a time

    def buy(customer):
        if use_lock:
            lock.acquire()            # wait here until no other thread is inside
        try:
            left = stock["Wireless Earbuds"]           # 1. read the stock
            if left > 0:                               # 2. check it
                time.sleep(0.001)                      #    (a tiny pause, like a database call)
                stock["Wireless Earbuds"] = left - 1   # 3. write the new stock
                sold.append(customer)
        finally:
            if use_lock:
                lock.release()        # let the next thread in

    customers = ["Asha", "Ravi", "Fatima", "John", "Priya", "Meera", "Arjun", "Sara", "Kabir", "Zoya"]
    threads = [threading.Thread(target=buy, args=(c,)) for c in customers]
    for t in threads:
        t.start()
    for t in threads:
        t.join()
    print(f"  sold {len(sold)} pairs, stock now says {stock['Wireless Earbuds']}")


print("Without a lock:")
sale(use_lock=False)
print("With a lock:")
sale(use_lock=True)
