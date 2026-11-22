# tiny_server.py: a server is just a program that waits for requests. Here are its steps, one by one.
# Run it with: python3 tiny_server.py   (then, from another terminal: curl http://localhost:8000/)

import json
import os
import socket

PORT = 8000

listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)   # 1. ask the kernel for a network socket
listener.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)  #    (allow a quick restart on the same port)
listener.bind(("0.0.0.0", PORT))                                # 2. claim port 8000 on every network card
listener.listen()                                               # 3. tell the kernel: queue up connections for me
print(f"[server] PID {os.getpid()} is listening on port {PORT} (socket = fd {listener.fileno()})", flush=True)

served = 0
while True:
    conn, (ip, port) = listener.accept()                        # 4. wait (sleep) until a client connects
    print(f"[server] connection from {ip}:{port}, new fd {conn.fileno()}", flush=True)
    request = conn.recv(65536).decode(errors="replace")         # 5. read the request bytes
    print(f"[server] request line: {request.splitlines()[0]}", flush=True)
    served += 1
    body = json.dumps({"server_pid": os.getpid(), "requests_served": served}).encode()
    conn.sendall(b"HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n"   # 6. write the response
                 + f"Content-Length: {len(body)}\r\nConnection: close\r\n\r\n".encode() + body)
    conn.close()                                                # 7. hang up, and go back to waiting
