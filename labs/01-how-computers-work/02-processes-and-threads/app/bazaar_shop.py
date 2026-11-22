"""bazaar-backend: the main Bazaar process.

Inside this ONE process run three threads:
  1. main          - the supervisor: starts the worker processes, restarts any that die
  2. web-requests  - answers HTTP requests on port 8000
  3. price-updater - changes a price in memory every few seconds

It also starts 3 separate PROCESSES: two email workers and one image cache.
"""

import json
import os
import signal
import subprocess
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

prices = {"Red Running Shoes": 999}  # shared by all threads of this process


def price_updater():
    """Thread 3: a small sale every few seconds. Other threads see the change at once."""
    while True:
        time.sleep(5)
        prices["Red Running Shoes"] = 899 if prices["Red Running Shoes"] == 999 else 999


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/report":  # heavy work: keeps one CPU core busy for about 3 seconds
            end, total = time.time() + 3, 0
            while time.time() < end:
                total += sum(i * i for i in range(10_000))
            body = {"report": "done"}
        else:
            body = {"pid": os.getpid(), "threads": threading.active_count(), "prices": prices}
        data = json.dumps(body).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def log_message(self, fmt, *args):
        pass


def start(script):
    """Start another Python program as a separate PROCESS (a child of this one)."""
    return subprocess.Popen(["python3", script])


if __name__ == "__main__":
    print(f"[bazaar-backend] started, PID {os.getpid()}", flush=True)
    workers = {"email_worker.py#1": start("email_worker.py"),
               "email_worker.py#2": start("email_worker.py"),
               "image_cache.py": start("image_cache.py")}

    server = ThreadingHTTPServer(("0.0.0.0", 8000), Handler)
    threading.Thread(target=server.serve_forever, name="web-requests", daemon=True).start()
    threading.Thread(target=price_updater, name="price-updater", daemon=True).start()

    while True:  # the main thread is the supervisor
        time.sleep(1)
        for name, proc in workers.items():
            code = proc.poll()  # None while running; the exit code once the process has ended
            if code is not None:
                # A negative code means "stopped by a signal": -15 = SIGTERM, -9 = SIGKILL
                why = f"signal {signal.Signals(-code).name}" if code < 0 else f"exit code {code}"
                print(f"[bazaar-backend] {name} (PID {proc.pid}) died ({why}), starting a new one", flush=True)
                workers[name] = start(name.split("#")[0])
