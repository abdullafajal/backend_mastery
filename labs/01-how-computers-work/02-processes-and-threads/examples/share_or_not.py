# share_or_not.py: do threads and processes share memory?
# Run it with: python3 share_or_not.py

import os
import threading
from multiprocessing import Process

cart = []  # Asha's cart, in this program's memory


def add_masala_box():
    cart.append("Masala Box")  # change the cart
    print(f"  inside PID {os.getpid()}: the cart has {len(cart)} item(s)")


if __name__ == "__main__":  # needed: on Mac and Windows, a new process re-reads this file
    print(f"Main program, PID {os.getpid()}")

    print("1) Three THREADS add to the cart:")
    threads = [threading.Thread(target=add_masala_box) for _ in range(3)]
    for t in threads:
        t.start()
    for t in threads:
        t.join()  # wait for the thread to finish
    print(f"   After the threads, the main program sees {len(cart)} item(s).")

    print("2) Three PROCESSES add to the cart:")
    processes = [Process(target=add_masala_box) for _ in range(3)]
    for p in processes:
        p.start()
    for p in processes:
        p.join()  # wait for the process to finish
    print(f"   After the processes, the main program sees {len(cart)} item(s).")
