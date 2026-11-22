# Lab 05-08: 100 supplier APIs, three ways (the plan's lab)

**Goal:** watch the asyncio event loop at work, ask 100 supplier APIs for prices one by one, with threads and with asyncio, and compare the times;
then meet two asyncio mistakes and fix "async" code that's as slow as one by one.

**Time:** about 30 minutes.

**You need:** Docker running. The first build needs internet (it installs httpx from PyPI).

## How this lab works

Two containers:

| Container | What it does |
| --- | --- |
| `suppliers` | 100 pretend supplier APIs in one small server (`supplier_server/server.py`, standard library only). `GET /price/7` answers `{"supplier": 7, "price_paise": 20700}` after 0.1 s. |
| `python` | where you run the lab's programs. It has **httpx 0.28.1**, a library that can make normal and async requests. |

| Folder | What's inside |
| --- | --- |
| `examples/` | `asyncio_basics.py`, `fetch_sync.py`, `fetch_threads.py`, `fetch_async.py`, `compare.py` |
| `mistakes/` | `no_await.py`, `await_outside.py` |
| `exercises/blocking.py` | "async" code that's as slow as one by one |
| `solutions/blocking.py` | one correct answer (look only after you try) |

```bash
docker compose up -d suppliers
docker compose run --rm python
```

(The first time, Docker builds the `python` image. That takes a minute.)

## Task 1: Talk to one supplier

```bash
python3 -c 'import httpx; print(httpx.get("http://suppliers:8080/price/7").json())'
```

**Expected output:**

```
{'supplier': 7, 'price_paise': 20700}
```

## Task 2: The event loop

```bash
python3 examples/asyncio_basics.py
```

**Expected output:**

```
ask   Patel Spices
ask   Meera Handloom
ask   Kumar Footwear
reply Meera Handloom
reply Kumar Footwear
reply Patel Spices
[300, 100, 200] in 0.3 s
```

## Task 3: The plan's comparison

```bash
cd examples
python3 compare.py
cd ..
```

**Expected output** (about 10 seconds; your times will differ a little, and threads/asyncio may swap):

```
one by one    10.6 s   100 prices, total ₹25,050
100 threads    0.3 s   100 prices, total ₹25,050
asyncio        0.2 s   100 prices, total ₹25,050
all three agree? True
```

Try: in `examples/fetch_async.py`, replace the `gather` line with `return [await one(i) for i in range(1, n + 1)]` and run `compare.py` again.
asyncio now takes about 10 s too: awaiting one by one is sequential. Undo it.

## Task 4: Two asyncio mistakes

```bash
python3 mistakes/no_await.py
python3 mistakes/await_outside.py 2>&1 | tail -1
```

**Expected output** (the `0x…` address will differ):

```
/usr/local/lib/python3.13/asyncio/events.py:89: RuntimeWarning: coroutine 'fetch_price' was never awaited
  self._context.run(self._callback, *self._args)
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
price: <coroutine object fetch_price at 0xffffba275c00>
SyntaxError: 'await' outside function
```

## Task 5: Fix the blocking code

```bash
python3 exercises/blocking.py
```

```
10 prices in 1.0 s
```

Ten tasks, gathered, but they ran one after another. Find the line that blocks the event loop and replace it with the asyncio way to pause. When it's right:

```
10 prices in 0.1 s
```

Compare with `python3 solutions/blocking.py`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output** (times may differ; the test accepts a sensible range):

```
Building the lab image (Python 3.13 + httpx 0.28.1) and starting the supplier server...
PASS: the supplier server answers: {'supplier': 7, 'price_paise': 20700}
PASS: asyncio_basics.py: all asked first, replies in order of speed, 0.3 s total
PASS: compare.py: one by one 10.6 s, 100 threads 0.2 s, asyncio 0.3 s; all three got the same 100 prices
PASS: the exercise really shows the bug (time.sleep blocks: 1.0 s for 10)
PASS: solution: await asyncio.sleep lets all 10 wait together (0.1 s)
PASS: mistakes/: a coroutine without await; await outside async def
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` first. It doesn't grade `exercises/blocking.py`.

## Stuck?

- **`httpx.ConnectError: [Errno -2] Name or service not known`** or connection refused: the supplier server isn't running. Run `docker compose up -d suppliers` (on your computer).
- **asyncio is as slow as one by one**: something blocks (`time.sleep`, a normal HTTP client), or you `await` in a loop instead of `gather`.
- **`price: <coroutine object …>`**: you forgot `await`.

## Clean up

```bash
docker compose down
docker image rm bazaar-lab-python-httpx:m05-08     # optional: frees the image's disk space
```
