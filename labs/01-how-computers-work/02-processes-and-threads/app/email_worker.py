"""email-worker: pretends to send Bazaar's order emails, forever. One process."""
import os
import time

print(f"[email-worker] started, PID {os.getpid()}", flush=True)
while True:
    time.sleep(1)  # "send an email", then wait for the next one
