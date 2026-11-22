"""inventory-service: a second tiny Bazaar server, in its own container.

It answers one question over the network: "how many of product X are in stock?"

    GET /stock/<id>   -> {"product_id": 1, "stock": 12}
"""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

STOCK = {1: 12, 2: 30, 3: 50, 4: 8, 5: 0}  # product_id -> units in the warehouse


class InventoryHandler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"  # keep the connection open between requests
    disable_nagle_algorithm = True  # send small answers at once, don't wait to bundle them

    def do_GET(self):
        product_id = int(self.path.rsplit("/", 1)[-1])
        body = json.dumps({"product_id": product_id, "stock": STOCK.get(product_id, 0)}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        pass  # stay quiet: the race sends hundreds of requests


if __name__ == "__main__":
    print("[inventory] ready on port 9000", flush=True)
    ThreadingHTTPServer(("0.0.0.0", 9000), InventoryHandler).serve_forever()
