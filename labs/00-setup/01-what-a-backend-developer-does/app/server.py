"""Bazaar v0.0 — the smallest possible Bazaar backend.

It uses only Python's standard library, so there is nothing to install.
It answers three kinds of requests:

    GET /health            -> {"status": "ok"}
    GET /products          -> all products (add ?q=shoes to search)
    GET /products/<id>     -> one product, or a 404 error
"""

import json  # turns Python data into JSON text and back
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

# Our "database" for now is a plain JSON file. Later in the course it becomes PostgreSQL.
DATA_FILE = Path(__file__).parent / "products.json"


def load_products():
    """Read every product from the data file."""
    with DATA_FILE.open(encoding="utf-8") as f:
        return json.load(f)


def to_public(product):
    """Business rule: customers see 'in_stock', never the exact stock count."""
    return {
        "id": product["id"],
        "name": product["name"],
        "price": product["price"],  # price in rupees (whole numbers for now)
        "seller": product["seller"],
        "in_stock": product["stock"] > 0,  # the backend decides this, not the phone
    }


class BazaarHandler(BaseHTTPRequestHandler):
    """Python calls do_GET() once for every GET request that arrives."""

    def send_json(self, status, body):
        data = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)  # status line, e.g. "HTTP/1.0 200 OK"
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()  # an empty line separates headers from the body
        self.wfile.write(data)  # the body: our JSON

    def do_GET(self):
        url = urlparse(self.path)  # "/products?q=shoes" -> path + query parts
        parts = [p for p in url.path.split("/") if p]  # "/products/2" -> ["products", "2"]

        if parts == ["health"]:
            return self.send_json(200, {"status": "ok"})

        if parts == ["products"]:
            query = parse_qs(url.query).get("q", [""])[0].lower()
            products = [to_public(p) for p in load_products()]
            if query:  # simple search: keep products whose name contains the word
                products = [p for p in products if query in p["name"].lower()]
            return self.send_json(200, {"count": len(products), "products": products})

        if len(parts) == 2 and parts[0] == "products" and parts[1].isdigit():
            wanted = int(parts[1])
            for p in load_products():
                if p["id"] == wanted:
                    return self.send_json(200, to_public(p))
            return self.send_json(404, {"error": f"Product {wanted} not found"})

        return self.send_json(404, {"error": "Page not found"})

    def log_message(self, fmt, *args):
        # One clear line per request, so you can watch requests arrive in the logs.
        print(f"[bazaar] {self.address_string()} {fmt % args}", flush=True)


if __name__ == "__main__":
    # 0.0.0.0 means "accept connections from outside this container too".
    server = ThreadingHTTPServer(("0.0.0.0", 8000), BazaarHandler)
    print("[bazaar] Bazaar backend is running on port 8000", flush=True)
    server.serve_forever()
