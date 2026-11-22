"""image-cache: keeps about 100 MB of product photos in RAM. One process."""
import os
import time

photos = bytearray(100 * 1024 * 1024)  # 100 MB of "photo" bytes in RAM
for i in range(0, len(photos), 4096):  # touch every page, so the OS really gives us the RAM
    photos[i] = 1
print(f"[image-cache] holding 100 MB, PID {os.getpid()}", flush=True)
while True:
    time.sleep(60)
