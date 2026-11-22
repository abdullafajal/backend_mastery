# Lab 05-07: Waiting together, computing in parallel

**Goal:** time supplier calls one by one and with threads, compare threads and processes on CPU-heavy work, oversell the last pair of earbuds and fix it
with a lock, and fix a price checker that prints before its threads are done.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`. "Supplier calls" are pretend: `time.sleep(0.2)` plays the network wait.
Times depend on your computer, so yours may differ a little from the ones below.

| Folder | What's inside |
| --- | --- |
| `examples/` | `waiting.py`, `computing.py`, `oversell.py` |
| `mistakes/` | `lambda_to_process.py` |
| `exercises/price_check.py` | a price checker that doesn't wait for its threads |
| `solutions/price_check.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: Waiting work

```bash
python3 examples/waiting.py
```

**Expected output:**

```
one by one: 2.0 s
10 threads: 0.2 s
same prices? True
```

Try: change `max_workers=10` to `max_workers=2`. Now it's about 1.0 s: only 2 waits overlap at a time. Put it back.

## Task 2: Computing work

```bash
python3 examples/computing.py
```

**Expected output** (core count and times depend on your computer):

```
CPU cores: 8
one by one   1.3 s  (49098 primes)
4 threads    1.3 s  (49098 primes)
4 processes  0.5 s  (49098 primes)
```

Threads: no gain (the GIL). Processes: much faster, if your Docker has more than one core. Docker Desktop's Settings → Resources shows how many CPUs it may use.

## Task 3: Oversell, then lock

```bash
python3 examples/oversell.py
```

**Expected output:**

```
lock=False: 5 sold, stock now -4
lock=True: 1 sold, stock now 0
```

## Task 4: A lambda can't go to a process

```bash
python3 mistakes/lambda_to_process.py 2>&1 | tail -1
```

**Expected output** (the `0x…` address will differ):

```
_pickle.PicklingError: Can't pickle <function <lambda> at 0xffff80529ee0>: attribute lookup <lambda> on __main__ failed
```

Fix it: define `def to_rupees(paise): return paise // 100` at the top of the file, and pass `to_rupees` instead of the lambda. Then it prints `[299, 649]`.

## Task 5: Fix the price checker

```bash
python3 exercises/price_check.py
```

```
prices received: 0
```

The threads were started, but the program didn't wait for them. Make it wait for every thread. When it's right:

```
prices received: 5
```

Compare with `python3 solutions/price_check.py`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output** (your times and cores may differ; the test accepts a sensible range):

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: waiting.py: one by one 2.0 s, 10 threads 0.2 s, same prices
PASS: computing.py: one by one 1.3 s, threads 1.3 s (GIL: no gain), processes 0.5 s on 8 cores
PASS: oversell.py: without a lock 5 sold from a stock of 1; with a lock, 1
PASS: the exercise really shows the bug (printed before the threads finished)
PASS: solution: join() waits for all 5 prices
PASS: mistakes/: a lambda can't be sent to another process
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/price_check.py`.

## Stuck?

- **Processes aren't faster**: Docker may be limited to 1 CPU. Check Docker Desktop's Resources settings.
- **Results are missing or empty**: the program read them before the threads finished. `join()` them, or use a `ThreadPoolExecutor` in a `with` block.
- **`PicklingError: Can't pickle …`**: only named, top-level functions can be sent to a process.
- **Numbers go wrong only sometimes**: a race condition. Put a lock around code that checks and changes shared data.

## Clean up

```bash
docker compose down
```
