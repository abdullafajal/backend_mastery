# Lab 01-05: Be a server

**Goal:** run a web server built from raw sockets and watch each step, start a second server on the same port,
print a server "inventory", read the kernel's socket table, and run a process out of file descriptors.
Tasks marked *optional, Going deeper* match the lesson's Going-deeper boxes; skip them on your first try.

**Time:** about 30 minutes.

**You need:** Docker running.

## What is in this folder

| File | What it does |
| --- | --- |
| `app/tiny_server.py` | a complete tiny web server: socket, bind, listen, accept, recv, send, close |
| `app/server_inventory.py` | prints CPU, load, RAM, disk, inodes, file limits, uptime and listening sockets |
| `app/too_many_files.py` | opens files until the file descriptor limit stops it |
| `docker-compose.yml` | `server` (runs `tiny_server.py`, port 8000) and `python` (tools, limited to 50 open files) |
| `test_lab.sh` | Checks that everything works. |

## Task 1: Start the server and call it

```bash
docker compose up -d server
curl http://localhost:8000/
curl http://localhost:8000/orders
```

**Expected output:**

```
{"server_pid": 7, "requests_served": 1}
{"server_pid": 7, "requests_served": 2}
```

## Task 2: Read the server's steps

```bash
docker compose logs server
```

**Expected output** (the client port numbers will differ):

```
server-1  | [server] PID 7 is listening on port 8000 (socket = fd 3)
server-1  | [server] connection from 192.168.65.1:20742, new fd 4
server-1  | [server] request line: GET / HTTP/1.1
server-1  | [server] connection from 192.168.65.1:58483, new fd 4
server-1  | [server] request line: GET /orders HTTP/1.1
```

Open `app/tiny_server.py` next to the logs and match each line to its step (1–7 in the comments).

## Task 3: Two servers, one port

Start a second copy of the server **inside the same container**:

```bash
docker compose exec server python3 tiny_server.py
```

**Expected output** (the last line):

```
OSError: [Errno 98] Address already in use
```

## Task 4: The server's inventory

```bash
docker compose exec server python3 server_inventory.py
```

**Expected output** (your numbers will differ):

```
name (hostname)   : f4151932b771
operating system  : Linux 6.12.54-linuxkit (aarch64)
CPU cores         : 8
load average      : 0.23 0.30 0.28  (1, 5, 15 minutes)
RAM               : 3918 MB total, 3414 MB available
disk /            : 58 GB total, 52 GB free
inodes /          : 3,907,584 total, 3,786,050 free
open files limit  : 1048576 per process (hard limit 1048576)
up for            : 0.5 hours
listening on      : 127.0.0.11:35165, 0.0.0.0:8000
```

The lesson explains every line. `0.0.0.0:8000` is your server; `127.0.0.11:...` is Docker's built-in DNS.

## Task 5 (optional, Going deeper): The kernel's socket table, raw

```bash
docker compose exec server cat /proc/net/tcp
```

Find the line whose 4th column (`st`) is `0A` (LISTEN) and whose local address ends in `:1F40`.
`1F40` is hexadecimal for 8000: that's your server.

## Task 6: Too many open files

```bash
docker compose run --rm python python3 too_many_files.py
```

**Expected output:**

```
this process may have 50 open files at once
opened 47 files, then: [Errno 24] Too many open files: '/app/tiny_server.py'
```

47, because file descriptors 0, 1 and 2 were already taken by stdin, stdout and stderr.

## Check your work

```bash
bash test_lab.sh
```

**Expected output** (the request numbers may differ):

```
PASS: tiny_server.py answers, and counts requests (2, 3)
PASS: logs show the listening socket (fd 3) and a connection (fd 4)
PASS: a second server on port 8000: Address already in use
PASS: server_inventory.py: cores, and listening on 0.0.0.0:8000 (+ Docker DNS)
PASS: limit of 50 file descriptors: 47 opened + stdin/stdout/stderr
ALL CHECKS PASSED
```

## Stuck?

- **`curl` returns something else, or `port is already allocated`**: another program uses port 8000 on your laptop.
  Start on another port: `BAZAAR_PORT=8001 docker compose up -d server`, then use `localhost:8001`.
- **`curl: (52) Empty reply from server` right after starting**: the server may still be starting. Wait a second and try again.

## Clean up

```bash
docker compose down
```
