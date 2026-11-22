"""Bazaar v0.1: the same tiny backend, but honest about its limits.

It has only ONE worker, so it answers ONE request at a time.
Each request "talks to the database" for 20 ms (we fake it with sleep).
That is how many real backends start, and it is fine... until users arrive.

    GET /health     -> {"status": "ok"}
    GET /products   -> all products
"""

import json
import time
# HTTPServer = one worker, one request at a time.
# ThreadingHTTPServer = a new worker (thread) for every request. You will try it in Task 3.
from http.server import BaseHTTPRequestHandler, HTTPServer, ThreadingHTTPServer  # noqa: F401
from pathlib import Path

DATA_FILE = Path(__file__).parent / "products.json"
DB_TIME_SECONDS = 0.020  # pretend every database call takes 20 milliseconds


class BazaarHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.0"  # one request per connection, keeps things simple

    def send_json(self, status, body):
        data = json.dumps(body).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if self.path == "/health":
            return self.send_json(200, {"status": "ok"})
        if self.path == "/products":
            time.sleep(DB_TIME_SECONDS)  # the "database" is busy for 20 ms
            products = json.loads(DATA_FILE.read_text(encoding="utf-8"))
            return self.send_json(200, {"count": len(products)})
        return self.send_json(404, {"error": "Page not found"})

    def log_message(self, fmt, *args):
        pass  # stay quiet: we will send hundreds of requests


if __name__ == "__main__":
    # request_queue_size: how many waiting connections the computer may hold in line.
    HTTPServer.request_queue_size = 128
    server = HTTPServer(("0.0.0.0", 8000), BazaarHandler)  # Task 3: change HTTPServer here
    print("[bazaar] one worker, ready on port 8000", flush=True)
    server.serve_forever()
