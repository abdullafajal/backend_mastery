"""Bazaar's web backend, run as a systemd service. It logs one line per request to stdout,
and systemd's journal keeps those lines."""

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

PORT = int(os.environ.get("PORT", "8000"))
SALE = os.environ.get("SALE", "none")


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({"service": "bazaar-web", "pid": os.getpid(), "sale": SALE}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        print(f"request {fmt % args}", flush=True)     # stdout -> the journal


print(f"bazaar-web starting on port {PORT}, PID {os.getpid()}, sale={SALE}", flush=True)
ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
