# import_products.py: a slow job, like importing 10 sellers' product lists. Takes about 10 seconds.
import time

for seller in range(1, 11):
    print(f"imported seller {seller}/10", flush=True)
    time.sleep(1)
print("import finished", flush=True)
