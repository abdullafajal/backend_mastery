# Lab 01-02: Watch Bazaar's processes and threads

**Goal:** run a small Bazaar server with 4 processes, then use `ps` and `top` to see their PIDs,
parents, threads, RAM and CPU. Send signals, watch the supervisor bring processes back,
create a zombie, and see a race condition oversell Bazaar's earbuds.
Tasks marked *optional, Going deeper* match the lesson's Going-deeper boxes; skip them on your first try.

**Time:** about 40 minutes.

**You need:** Docker running.

## What is in this folder

| File | What it does |
| --- | --- |
| `app/bazaar_shop.py` | `bazaar-backend`: 3 threads (supervisor, web requests, price updater). Starts the other 3 processes. |
| `app/email_worker.py` | `email-worker`: pretends to send order emails. Two of them run. |
| `app/image_cache.py` | `image-cache`: keeps 100 MB of "photos" in RAM. |
| `examples/share_or_not.py` | Code example: threads vs processes sharing a cart. |
| `examples/last_earbuds.py` | Code example: a race condition, and a lock that fixes it. |
| `examples/make_zombie.py` | A parent that forgets its finished child for 15 seconds. |
| `Dockerfile` | Python 3.13.18 plus `ps`, `top` and `free` (the `procps` package). |
| `docker-compose.yml` | Builds and runs the `bazaar` service. |
| `test_lab.sh` | Checks that everything works. |

## Task 1: Start the server

```bash
docker compose up -d --build --wait
```

The first time, Docker **builds** a small image (Python + `procps`). That takes a minute.

**Expected output** (the last line):

```
 Container 02-processes-and-threads-bazaar-1  Healthy
```

## Task 2: List the processes

`docker compose exec bazaar <command>` runs a command **inside** the running container.

```bash
docker compose exec bazaar ps -eo pid,ppid,stat,nlwp,rss,cmd
```

**Expected output:**

```
  PID  PPID STAT NLWP   RSS CMD
    1     0 Ss      1   464 /sbin/docker-init -- python3 -u bazaar_shop.py
    7     1 Sl      3 22848 python3 -u bazaar_shop.py
    8     7 S       1  7736 python3 email_worker.py
    9     7 S       1  7740 python3 email_worker.py
   10     7 S       1 110232 python3 image_cache.py
   27     0 Rs      1  3132 ps -eo pid,ppid,stat,nlwp,rss,cmd
```

Find these in the table:

- `bazaar-backend` is PID 7. The three workers have `PPID 7`: it is their parent.
- `NLWP` (number of threads) of PID 7 is `3`.
- `RSS` of `image_cache.py` is about 110,000 KB: the 100 MB of photos it keeps in RAM.
- `STAT` of PID 7 is `Sl`: sleeping right now (waiting for work), with several threads.
  The lesson explains every `STAT` letter.
- The last line is `ps` itself. It is a process too, while it runs!

## Task 3: Look at the threads

```bash
docker compose exec bazaar ps -T -p 7 -o pid,spid,cmd
```

**Expected output:**

```
  PID  SPID CMD
    7     7 python3 -u bazaar_shop.py
    7    11 python3 -u bazaar_shop.py
    7    12 python3 -u bazaar_shop.py
```

Three lines, all in process 7. `SPID` is each thread's own ID. They run the same program and share its memory.

Now ask the backend itself:

```bash
curl http://localhost:8000/
```

**Expected output** (the price switches between 999 and 899 every 5 seconds):

```json
{"pid": 7, "threads": 4, "prices": {"Red Running Shoes": 999}}
```

Why `4` threads, not 3? Because **your request** gets its own thread while it is being answered.

## Task 4 (optional, Going deeper): Ask a process to stop (SIGTERM)

Plain `kill` sends **SIGTERM**: "please stop". Send it to the email-worker with PID 8:

```bash
docker compose exec bazaar kill 8
docker compose logs bazaar | tail -2
```

**Expected output** (the new PID will differ):

```
bazaar-1  | [bazaar-backend] email_worker.py#1 (PID 8) died (signal SIGTERM), starting a new one
bazaar-1  | [email-worker] started, PID 44
```

The supervisor (the backend's main thread) noticed the exit, read **why** it ended, and started a new worker.
List the processes again with the command from Task 2: PID 8 is gone, a new email-worker has `PPID 7`,
and nothing else stopped.

## Task 5 (optional, Going deeper): Force a process to stop (SIGKILL)

`kill -9` sends **SIGKILL**: "stop now". The process gets no chance to clean up.

```bash
docker compose exec bazaar kill -9 9
docker compose logs bazaar | tail -2
```

**Expected output:**

```
bazaar-1  | [bazaar-backend] email_worker.py#2 (PID 9) died (signal SIGKILL), starting a new one
bazaar-1  | [email-worker] started, PID 58
```

## Task 6: Make the CPU work

Open a **second** terminal and run `top` inside the container:

```bash
docker compose exec bazaar top
```

In the first terminal, ask for a heavy report:

```bash
curl http://localhost:8000/report
```

**Expected output in `top`** for about 3 seconds (look at PID 7):

```
  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    7 root      20   0  328944  22864   8816 S 100.0   0.6   0:02.46 python3
   10 root      20   0  114468 110216   4860 S   0.0   2.7   0:00.05 python3
```

100% means **one** CPU core is fully busy. Look at the `%Cpu(s)` line at the top:
the whole computer is still mostly idle (`id`). Press `q` to quit `top`.

Now run the report again, and while it runs, list the backend's threads:

```bash
docker compose exec bazaar ps -T -p 7 -o spid,stat,pcpu
```

**Expected output** (the thread IDs will differ):

```
 SPID STAT %CPU
    7 Sl    1.9
   11 Sl    0.0
   12 Sl    0.0
   66 Rl   99.1
```

A **fourth** thread appeared: the one answering your `/report` request. It is running (`R`) and busy (99%).
When the request ends, it disappears.

## Task 7 (optional, Going deeper): Create a zombie

In one terminal, start a parent that forgets to collect its child for 15 seconds:

```bash
docker compose exec bazaar python3 /examples/make_zombie.py
```

Within those 15 seconds, in your second terminal:

```bash
docker compose exec bazaar ps -eo pid,ppid,stat,cmd
```

**Expected output** (among the other lines; PIDs will differ):

```
   20     0 Ss   python3 /examples/make_zombie.py
   26    20 Z    [sleep] <defunct>
```

`Z` and `<defunct>`: the `sleep` child has finished, but its parent hasn't collected it yet.
After 15 seconds the first terminal prints `parent collected the child. The zombie is gone.`,
and the zombie line disappears.

## Task 8: Threads vs processes

```bash
docker compose exec bazaar python3 /examples/share_or_not.py
```

**Expected output** (PIDs will differ):

```
Main program, PID 40
1) Three THREADS add to the cart:
  inside PID 40: the cart has 1 item(s)
  inside PID 40: the cart has 2 item(s)
  inside PID 40: the cart has 3 item(s)
   After the threads, the main program sees 3 item(s).
2) Three PROCESSES add to the cart:
  inside PID 49: the cart has 4 item(s)
  inside PID 50: the cart has 4 item(s)
  inside PID 51: the cart has 4 item(s)
   After the processes, the main program sees 3 item(s).
```

If you have Python 3.13 on your laptop, also run `python3 examples/share_or_not.py` there.
On a Mac or Windows, the processes print `1 item(s)` instead of `4`. The lesson explains why.

## Task 9: The last earbuds (a race condition)

```bash
docker compose exec bazaar python3 /examples/last_earbuds.py
```

**Expected output** (the "stock now says" number without a lock can change):

```
Without a lock:
  sold 10 pairs, stock now says 7
With a lock:
  sold 8 pairs, stock now says 0
```

Run it a few times. Without the lock, Bazaar sells more earbuds than it has, every time.

## Task 10 (optional, Going deeper): Peek into /proc, and check the RAM

```bash
docker compose exec bazaar grep -E "Threads|VmRSS|ctxt" /proc/7/status
docker compose exec bazaar free -m
```

**Expected output** (your numbers will differ):

```
VmRSS:	   22856 kB
Threads:	3
voluntary_ctxt_switches:	43
nonvoluntary_ctxt_switches:	12
               total        used        free      shared  buff/cache   available
Mem:            3918         605        3156           0         290        3313
Swap:           1023           0        1023
```

`ps` and `top` read these same `/proc` files. `buff/cache` is the page cache from the last lesson.

## Check your work

```bash
bash test_lab.sh
```

**Expected output** (PIDs and numbers will differ):

```
Starting lab (builds the image the first time)...
PASS: bazaar-backend (PID 7) has 3 child processes
PASS: bazaar-backend runs 3 threads
PASS: image-cache holds over 100 MB of RAM (110224 KB)
PASS: killed email-worker 8; the supervisor started a new one (now: 9 69 )
PASS: supervisor reports SIGTERM for PID 8
PASS: supervisor reports SIGKILL for PID 9
PASS: make_zombie.py created a zombie (STAT Z, <defunct>)
PASS: /proc/7/status says Threads: 3
PASS: /report keeps bazaar-backend busy (100% CPU in top)
PASS: share_or_not.py: threads share the cart, processes don't
PASS: last_earbuds.py: oversells without a lock, exactly 8 with a lock
ALL CHECKS PASSED
```

## Stuck?

- **`kill: (8): No such process`** in Task 4 or 5: the PIDs on your computer are different.
  Use a PID from your own Task 2 list.
- **`curl` returns the website instead of JSON, or `port is already allocated`**: something else uses
  port 8000. Restart on another port: `BAZAAR_PORT=8001 docker compose up -d --wait`,
  then use `localhost:8001`.

## Clean up

```bash
docker compose down
```
