"""Two threads touching the same stock at once can oversell it. A Lock lets only one in at a time."""

import threading
import time

stock = {"Wireless Earbuds": 1}
lock = threading.Lock()


def buy(customer, sold, use_lock):
    def check_and_take():
        if stock["Wireless Earbuds"] > 0:            # 1. check
            time.sleep(0.01)                         #    (a tiny pause, like a slow database)
            stock["Wireless Earbuds"] -= 1           # 2. take
            sold.append(customer)
    if use_lock:
        with lock:                                   # only one thread at a time inside
            check_and_take()
    else:
        check_and_take()


for use_lock in (False, True):
    stock["Wireless Earbuds"] = 1
    sold = []
    threads = [threading.Thread(target=buy, args=(c, sold, use_lock)) for c in ["Asha", "Ravi", "Fatima", "John", "Priya"]]
    for t in threads:
        t.start()
    for t in threads:
        t.join()                                     # wait for each thread to finish
    print(f"lock={use_lock}: {len(sold)} sold, stock now {stock['Wireless Earbuds']}")
