# asyncio, and 100 supplier APIs

<div class="bz-meta" markdown>
**Module** 5 · Advanced Python
**Lesson** 8
**Reading time** 15 min (+ optional deeper parts)
**You will build** the plan's lab: Bazaar's price checker asks 100 supplier APIs for prices three ways (one by one, threads, asyncio) and times each
</div>

!!! abstract "In 1 minute"
    - **asyncio** waits for many things at once with **one** thread. A single **event loop** juggles all the waiting tasks.
    - `async def` makes a **coroutine**: a function that can pause. `await` is where it pauses ("I'm waiting, run someone else").
    - `asyncio.gather(...)` starts many coroutines and waits for all of them. `asyncio.run(main())` starts the event loop.
    - The lab's 100 supplier calls of 0.1 s each: **10.6 s** one by one, **0.2–0.3 s** with threads or asyncio.
    - Never block inside `async def`: `time.sleep` (or any slow normal call) freezes the whole loop. Use `await asyncio.sleep` and async libraries.

> **Previously in Bazaar:** threads let the price checker wait for 10 suppliers at once; processes made CPU-heavy work use several cores.

## 1. Why learn this?

Bazaar now works with 100 suppliers. Every morning, the price checker asks each one for today's price. Every answer takes about 0.1 s of waiting.
One by one, that's 10 seconds. With threads, it's fast, but 100 threads is a lot of machinery just to wait.

Modern Python backends wait for thousands of things at once: API calls, database queries, WebSocket connections (Module 21). **asyncio** does that with one thread,
and it's what frameworks like FastAPI, and Django's async views, are built on. This lesson ends Module 5 with the plan's lab: the same 100 calls, three ways, timed.

## 2. The concept

### `async def`, `await`, and the event loop

```python title="asyncio_basics.py"
--8<-- "labs/05-advanced-python/08-asyncio-and-100-supplier-apis/examples/asyncio_basics.py"
```

```
ask   Patel Spices
ask   Meera Handloom
ask   Kumar Footwear
reply Meera Handloom
reply Kumar Footwear
reply Patel Spices
[300, 100, 200] in 0.3 s
```

Four new words, in order:

- `async def fetch_price(...)` defines a **coroutine**: a function that can **pause** in the middle and continue later. (Like a generator's `yield`, Lesson 5.)
- `await asyncio.sleep(0.3)` is a pause point: "I'm waiting; run something else, and wake me when this is done".
- The **event loop** is the scheduler. It runs one coroutine until it hits an `await`, then switches to another one that's ready.
- `asyncio.gather(a, b, c)` starts all three and waits until **all** are done. It returns their results **in the order you passed them**.

Look at the output: all three "ask" lines first (each ran until its `await`), then the replies in order of **speed** (Meera's 0.1 s first).
Total: 0.3 s, the **longest** wait, not the sum (0.6 s).

### One thread, many waits

How is this different from Lesson 7's threads?

| | Threads | asyncio |
| --- | --- | --- |
| How many threads | one per waiting task | **one** for all |
| Who switches tasks | the operating system, at any moment | the event loop, **only at `await`** |
| Shared data | needs locks (the oversell bug) | much safer: nothing switches in the middle of your code |
| Libraries | any (normal `requests`, `httpx.Client`) | must be **async** (`httpx.AsyncClient`, async database drivers) |
| Good for | a few dozen waits, older libraries | hundreds or thousands of waits |

Neither helps **computing** (the GIL, Lesson 7). For that, it's still processes.

### The plan's lab: 100 suppliers, three ways

The lab runs a small server with 100 pretend supplier APIs. `GET /price/7` answers `{"supplier": 7, "price_paise": 20700}` after 0.1 s.
The same job, written three ways with the same library (**httpx**, which can do both normal and async requests):

```python title="fetch_sync.py"
--8<-- "labs/05-advanced-python/08-asyncio-and-100-supplier-apis/examples/fetch_sync.py"
```

```python title="fetch_threads.py"
--8<-- "labs/05-advanced-python/08-asyncio-and-100-supplier-apis/examples/fetch_threads.py"
```

```python title="fetch_async.py"
--8<-- "labs/05-advanced-python/08-asyncio-and-100-supplier-apis/examples/fetch_async.py"
```

In the async one, look for the three changes: `httpx.AsyncClient` (an async client), `await client.get(...)` (a pause point), and
`asyncio.gather(*...)` (start all 100). The `*` unpacks the 100 coroutines into separate arguments.

```python title="compare.py"
--8<-- "labs/05-advanced-python/08-asyncio-and-100-supplier-apis/examples/compare.py"
```

```
one by one    10.6 s   100 prices, total ₹25,050
100 threads    0.3 s   100 prices, total ₹25,050
asyncio        0.2 s   100 prices, total ₹25,050
all three agree? True
```

Same 100 prices, same total, three very different times. Threads and asyncio are close here (your two numbers may swap from run to run).
The difference shows at thousands of waits: 1,000 threads cost real memory and switching; 1,000 coroutines are cheap.

### An analogy

The event loop is **one very organised waiter** at Bazaar's canteen, serving 100 tables.

- He takes table 1's order and hands it to the kitchen. He doesn't stand there waiting for the food: that's the `await`.
- He takes table 2's order, table 3's, … all 100 in a moment.
- When the kitchen rings the bell for any table, he serves it, then checks for the next ready dish.

One waiter, a hundred tables, nobody waiting long. But if he stops at one table to **cook the meal himself** (`time.sleep`, or heavy computing),
every other table waits. That's the one rule of asyncio: **never block the loop**.

### Questions you may have

**Can I call an async function from normal code?** At the top of a program, with `asyncio.run(main())`. Inside async code, with `await`. You can't `await` in a normal `def`.

**Should all of Bazaar be async?** Only where there's a lot of waiting. Django mostly works the normal way; it has async views for the waiting-heavy parts.
FastAPI is async from the start. Module 21 (real-time) needs it most.

**What is `Limits(max_connections=100)` for?** httpx keeps a pool of open connections, and this caps how many can be open at once.
100 is already httpx's default (the lab's container prints `Limits(max_connections=100, max_keepalive_connections=20, keepalive_expiry=5.0)`);
the lab writes it out so you can see and change it. With fewer connections than requests, the extra requests queue for a free one.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="event-loop"></div>

## 4. Code example

The lab's exercise: ten suppliers with asyncio, but it takes as long as one by one:

```python title="exercises/blocking.py"
--8<-- "labs/05-advanced-python/08-asyncio-and-100-supplier-apis/exercises/blocking.py"
```

```
10 prices in 1.0 s
```

`time.sleep` is a normal, **blocking** call: it never gives control back to the event loop. So the loop is stuck inside the first task for 0.1 s,
then the second, … one after another. The fix is the asyncio pause:

```python title="solutions/blocking.py (lines 7-9)"
--8<-- "labs/05-advanced-python/08-asyncio-and-100-supplier-apis/solutions/blocking.py:7:9"
```

```
10 prices in 0.1 s
```

The same mistake in real code: calling `requests.get(...)` (a blocking library) inside `async def`. Use an async client like `httpx.AsyncClient`.

## 5. Under the hood

### Forgetting `await`

```python title="mistakes/no_await.py"
--8<-- "labs/05-advanced-python/08-asyncio-and-100-supplier-apis/mistakes/no_await.py"
```

```
/usr/local/lib/python3.13/asyncio/events.py:89: RuntimeWarning: coroutine 'fetch_price' was never awaited
  self._context.run(self._callback, *self._args)
RuntimeWarning: Enable tracemalloc to get the object allocation traceback
price: <coroutine object fetch_price at 0xffffba275c00>
```

Calling a coroutine without `await` doesn't run it: you get a **coroutine object**, and Python warns that it was never awaited. Bugs like this look like
"the price is a strange object". Read warnings: they often point straight at the bug.

### `await` outside `async def`

```
  File "/lab/mistakes/await_outside.py", line 3
    await asyncio.sleep(0.1)          # await only works inside an async def
    ^^^^^^^^^^^^^^^^^^^^^^^^
SyntaxError: 'await' outside function
```

`await` only works inside `async def`. At the top of a script, use `asyncio.run(...)`.

??? note "Going deeper: tasks, timeouts and limits"

    - `asyncio.create_task(coro)` starts a coroutine in the background right away and gives you a **Task** to `await` later.
    - `async with asyncio.timeout(2):` (Python 3.11+) cancels whatever is inside if it takes longer than 2 s. Real supplier calls need timeouts.
    - `asyncio.Semaphore(20)` with `async with sem:` limits how many requests run at once, so you don't flood a supplier with 1,000 requests.
    - `asyncio.gather(..., return_exceptions=True)` returns errors as results instead of failing the whole batch when one supplier is down.
    - httpx's connection pool: `httpx.Limits(max_connections=100)` allows up to 100 open connections at once. Too few, and requests queue for a free connection.

??? note "Going deeper: how the event loop works"

    The event loop asks the operating system "tell me when any of these network connections has data" (Linux calls this `epoll`), and sleeps until something
    is ready. A coroutine is built on the same machinery as generators (Lesson 5): `await` hands control back to the loop, which later resumes the coroutine
    exactly where it paused. That's why switching is cheap: no threads, no operating-system switch, just a function continuing.

??? note "Going deeper: asyncio and the rest of the stack"

    - **Databases:** async drivers (`asyncpg`, `psycopg` 3's async mode) let a server wait on many queries at once.
    - **Web servers:** ASGI servers (Uvicorn) run async frameworks; Django supports ASGI too (Module 20).
    - **Mixing:** `await asyncio.to_thread(blocking_function, …)` runs an old blocking function in a thread without freezing the loop.

## 6. Lab

**Lab folder:** `labs/05-advanced-python/08-asyncio-and-100-supplier-apis/`

```bash
cd labs/05-advanced-python/08-asyncio-and-100-supplier-apis
docker compose up -d suppliers
docker compose run --rm python
```

Two containers: `suppliers` (100 pretend supplier APIs, standard library only) and `python` (where you run code, with httpx 0.28.1).
Watch the event loop in `asyncio_basics.py`, run the plan's comparison (`cd examples && python3 compare.py`), see two asyncio mistakes,
and fix the "async" code that's as slow as one by one.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Blocking calls inside `async def`** (`time.sleep`, `requests.get`, heavy loops). The whole loop freezes. **Fix:** `await asyncio.sleep`, async libraries, `asyncio.to_thread` for old code.
2. **Forgetting `await`.** You get a coroutine object and a "never awaited" warning. **Fix:** `await` every coroutine (or `gather` them).
3. **`await` one by one in a loop** (`[await f(i) for i in …]`). Correct, but sequential: 10 s again. **Fix:** `asyncio.gather(*(f(i) for i in …))`.
4. **No limits or timeouts.** 1,000 requests at once can overload a supplier; one dead supplier can hang everything. **Fix:** a Semaphore and `asyncio.timeout`.
5. **asyncio for computing.** No speed-up (one thread, and the GIL). **Fix:** processes for CPU work.

## 8. Quiz

<div class="bz-quiz" data-quiz="m05-08"></div>

## 9. What's next

Module 5 is complete! Bazaar's Python is now grown-up: classes, dataclasses and type hints, decorators, generators, packaging, and three ways to do things at once.
Next, in Module 6: **Data structures and algorithms for backend** *(coming soon)*.

**In one line:** asyncio runs many waiting tasks on one thread; `async def` makes a coroutine, `await` is where it pauses, `gather` runs many at once,
`asyncio.run` starts the loop; never block inside it. 100 supplier calls: 10.6 s one by one, about 0.2 s with asyncio.

### Cheat sheet

```python
import asyncio
import httpx

async def fetch(client, i):                       # a coroutine
    response = await client.get(f"/price/{i}")    # pause here while waiting
    return response.json()["price_paise"]

async def main():
    async with httpx.AsyncClient(base_url="http://suppliers:8080") as client:
        return await asyncio.gather(*(fetch(client, i) for i in range(1, 101)))   # all 100 at once

prices = asyncio.run(main())                      # start the event loop
```

| Waiting work | Computing work |
| --- | --- |
| threads or asyncio | processes |

> **Next in Bazaar:** Bazaar's in-memory shopping carts need to expire, be found instantly among a million, and be kept in order. That's
> data structures: hash maps, heaps, trees. Module 6.

<div class="bz-complete" data-lesson="m05-08"></div>
