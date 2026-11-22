"""100 pretend supplier APIs in one small server. GET /price/<n> answers after 0.1 s, like a real supplier's slow server.
Standard library only; one thread per request, so many requests can be waiting at the same time."""

import json
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"               # keep-alive, like real servers
    disable_nagle_algorithm = True              # answer at once (see CLAUDE.md §5)

    def do_GET(self):
        parts = self.path.strip("/").split("/")
        if len(parts) != 2 or parts[0] != "price" or not parts[1].isdigit():
            self.send_error(404)
            return
        n = int(parts[1])
        time.sleep(0.1)                         # the supplier "thinks" for 0.1 s
        body = json.dumps({"supplier": n, "price_paise": 20000 + n * 100}).encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):          # keep the console quiet
        pass


class Server(ThreadingHTTPServer):
    daemon_threads = True
    request_queue_size = 256                    # room for 100+ connections arriving at once


print("suppliers listening on port 8080", flush=True)
Server(("0.0.0.0", 8080), Handler).serve_forever()
