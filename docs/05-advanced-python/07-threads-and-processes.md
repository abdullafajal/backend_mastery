# Threads and processes

<div class="bz-meta" markdown>
**Module** 5 · Advanced Python
**Lesson** 7
**Reading time** 15 min (+ optional deeper parts)
**You will build** a price checker that asks 10 suppliers at once instead of one by one, a prime counter that uses several CPU cores, and a stock check that can't oversell
</div>

!!! abstract "In 1 minute"
    - Most backend work is **waiting**: for a supplier's server, a database, a file. Waiting doesn't need the CPU.
    - **Threads** let a program wait for many things **at the same time**. 10 supplier calls of 0.2 s each: 2.0 s one by one, 0.2 s with 10 threads.
    - For **CPU-heavy** work (calculating), threads don't help in normal Python: the **GIL** lets only one thread run Python code at a time.
    - **Processes** are separate Pythons, each with its own GIL, on its own CPU core. They speed up CPU-heavy work.
    - Threads share memory. Two threads changing the same stock at once can oversell it. A **Lock** lets only one in at a time.

> **Previously in Bazaar:** Bazaar became an installable package, with its own virtual environment and pinned dependencies.

## 1. Why learn this?

Bazaar's price checker asks each supplier for today's price. Every request takes about 0.2 s, almost all of it **waiting** for the supplier's server.
With 10 suppliers, one after another, that's 2 seconds of waiting. With 100 suppliers (Lesson 8's lab), 20 seconds, while the CPU sits idle.

Doing several things at once is called **concurrency**. Python offers three ways: threads, processes (this lesson) and `asyncio` (Lesson 8).
Knowing which one fits which job is a senior-level skill, and a classic interview question.

## 2. The concept

### Waiting work: use threads

```python title="waiting.py"
--8<-- "labs/05-advanced-python/07-threads-and-processes/examples/waiting.py"
```

```
one by one: 2.0 s
10 threads: 0.2 s
same prices? True
```

- A **thread** is a separate line of work inside the **same** program (Module 1). The program can have many.
- `ThreadPoolExecutor(max_workers=10)` keeps a "pool" of 10 threads ready. `pool.map(fetch_price, SUPPLIERS)` gives each supplier to a thread and
  collects the results **in the original order**.
- While thread 1 waits for Patel Spices, thread 2 waits for Meera Handloom, and so on. All 10 waits happen together: 0.2 s in total.

`with ThreadPoolExecutor(...) as pool:` is a context manager (Lesson 5): at the end of the block it waits for every thread to finish.

### Computing work: threads don't help

Now CPU-heavy work: counting prime numbers in 4 ranges. The CPU is busy the whole time; nothing is waiting.

```python title="computing.py"
--8<-- "labs/05-advanced-python/07-threads-and-processes/examples/computing.py"
```

```
CPU cores: 8
one by one   1.3 s  (49098 primes)
4 threads    1.3 s  (49098 primes)
4 processes  0.5 s  (49098 primes)
```

(Your times and core count may differ.) Four threads were **no faster** than one by one. Four processes were more than twice as fast.

### Why: the GIL

Normal Python (CPython) has a **GIL**, the Global Interpreter Lock: a rule that **only one thread runs Python code at any moment**.
It keeps Python's own memory management simple and safe.

- When a thread **waits** (`time.sleep`, a network call, reading a file), it lets go of the GIL, so other threads run. That's why waiting work speeds up.
- When threads **compute**, they just take turns holding the GIL. One core does all the work; the others watch.

### Processes: a separate Python each

A **process** is a whole separate running program (Module 1), with its own memory and its own GIL. `ProcessPoolExecutor` starts several Python
processes and sends each one a chunk of work. On 8 cores, 4 processes really compute at the same time.

The price: starting a process is slower than starting a thread, and data must be **copied** between processes (it's pickled and sent). So use them
for big chunks of computing, not for tiny tasks. `if __name__ == "__main__":` (Module 4) is required, because each worker process imports your file.

| Work | Example | Use |
| --- | --- | --- |
| mostly waiting (I/O) | supplier APIs, database, files | threads (or `asyncio`, Lesson 8) |
| mostly computing (CPU) | resizing images, counting, reports | processes |

### Shared data: the oversell problem

Threads share the program's memory. That's convenient, and dangerous. Five customers try to buy the **last** pair of Wireless Earbuds at the same moment:

```python title="oversell.py"
--8<-- "labs/05-advanced-python/07-threads-and-processes/examples/oversell.py"
```

```
lock=False: 5 sold, stock now -4
lock=True: 1 sold, stock now 0
```

Without a lock, all five threads **check** "stock > 0?" before any of them **takes** one. All see 1, all sell. Bazaar now owes four customers earbuds it doesn't have.
This is a **race condition** (Module 1, Lesson 2): the result depends on the timing of threads.

`with lock:` lets only **one** thread at a time run the check-and-take. The others wait their turn, then see stock 0.

### An analogy

Bazaar's packing desk:

- **One by one:** one packer phones each supplier and waits on hold before calling the next. Most of the day is spent listening to hold music.
- **Threads:** one packer with **10 phones**, all on hold at once. Whichever supplier answers first gets served. Fast, because the job was waiting.
- **The GIL:** but if the job is **packing boxes**, 10 phones don't help: the packer still has only two hands.
- **Processes:** hire 4 packers, each at their own desk. Real parallel work, but each new packer takes time to hire and needs their own copy of the order sheet.
- **A lock:** the single key to the stock cupboard. Only the person holding it can check and take the last pair.

### Questions you may have

**How many threads should I use?** For waiting work, enough to cover the requests in flight (10–100 is common). For processes, about the number of CPU cores.

**Does Django use threads?** A web server runs many requests at once, using several processes, each often with several threads (Module 20). Your view code mostly waits on the database, so this works well.

**Will the GIL go away?** Python 3.13 added an experimental "free-threaded" build without a GIL (see Going deeper). Normal Python still has it.

## 3. See it in action

Pick the kind of work, then press **Play**. Time runs from left to right.

<div class="bz-diagram" data-diagram="concurrency-timeline"></div>

## 4. Code example

The lab's exercise: fetch 5 supplier prices in threads. It prints `0`:

```python title="exercises/price_check.py"
--8<-- "labs/05-advanced-python/07-threads-and-processes/exercises/price_check.py"
```

```
prices received: 0
```

`t.start()` only **starts** each thread; it doesn't wait. The main program rushed on to `print` while all 5 threads were still waiting for their suppliers.
`t.join()` means "wait here until this thread has finished":

```python title="solutions/price_check.py (lines 16-19)"
--8<-- "labs/05-advanced-python/07-threads-and-processes/solutions/price_check.py:16:19"
```

```
prices received: 5
```

(A `ThreadPoolExecutor` in a `with` block does the joining for you. That's one reason to prefer it.)

## 5. Under the hood

### Sending a lambda to a process

Work goes to another process by **pickling** it (turning it into bytes, like JSON for Python objects). A `lambda` has no name to find it by, so it can't be pickled.
The traceback is long; its last line:

```
_pickle.PicklingError: Can't pickle <function <lambda> at 0xffff80529ee0>: attribute lookup <lambda> on __main__ failed
```

**Fix:** give it a name with `def`, at the top level of the file. (Threads don't have this problem: they share memory, nothing is copied.)

### Timing is not exact

`time.sleep(0.2)` and the operating system's scheduling are never perfectly precise. That's why the lab's test accepts a range ("between 1.9 and 3.0 s")
and never an exact time. Real network calls vary far more.

??? note "Going deeper: free-threaded Python"

    Python 3.13 can be built **without** the GIL (the "free-threaded" build, usually run as `python3.13t`). Then threads can compute on several cores at once.
    It's still **experimental**: some packages don't support it yet, and single-threaded code runs a little slower. `sys._is_gil_enabled()` tells you which
    build you're on; the lab's image prints `True` (normal Python). Expect this to become more common over the coming Python versions.

??? note "Going deeper: more tools"

    | Tool | Use |
    | --- | --- |
    | `pool.submit(f, x)` + `concurrent.futures.as_completed(...)` | handle results as they finish, not in order |
    | `queue.Queue` | a thread-safe line of jobs between producer and worker threads |
    | `threading.Event`, `Semaphore` | signal between threads; allow only N at a time |
    | `multiprocessing.Pool` | the older process pool API |

    A lock fixes the race inside **one** program. Bazaar's real stock lives in PostgreSQL, shared by many servers: there, the database's own locking
    (`SELECT ... FOR UPDATE`, Module 16) does this job.

??? note "Going deeper: why the oversell is so reliable here"

    Without the `time.sleep(0.01)`, the race would happen only now and then: a thread would usually finish check-and-take before the next one ran.
    That's what makes race conditions so nasty: tests pass, then a busy Diwali sale finds the bug. The small sleep plays "a slow database" and makes the
    timing problem show up every time, so you can see it and fix it.

## 6. Lab

**Lab folder:** `labs/05-advanced-python/07-threads-and-processes/`

```bash
cd labs/05-advanced-python/07-threads-and-processes
docker compose run --rm python
```

Time 10 supplier calls one by one and with threads, compare threads and processes on CPU-heavy work, oversell the last pair of earbuds and fix it with a lock,
see why a lambda can't go to a process, and fix the price checker that prints before its threads are done.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Threads for CPU-heavy work.** No faster (the GIL). **Fix:** processes for computing, threads for waiting.
2. **Forgetting to wait for threads.** Results are read before they exist. **Fix:** `join()`, or a `ThreadPoolExecutor` in a `with` block.
3. **Changing shared data without a lock.** Oversold stock, lost updates. **Fix:** `with lock:` around check-and-change, or don't share (return results instead).
4. **Tiny tasks in processes.** Start-up and copying cost more than the work. **Fix:** big chunks per process.
5. **No `if __name__ == "__main__":` with processes.** Worker processes re-run your top-level code. **Fix:** put the start-up code under it.

## 8. Quiz

<div class="bz-quiz" data-quiz="m05-07"></div>

## 9. What's next

Next: `asyncio`, a third way to wait for many things at once, with one thread and an event loop, and the plan's lab: 100 supplier APIs, three ways, timed: [asyncio, and 100 supplier APIs](08-asyncio-and-100-supplier-apis.md).

**In one line:** threads overlap **waiting** (I/O), but the GIL stops them from speeding up **computing**; processes compute on several cores at once;
threads share memory, so protect shared changes with a lock, and always wait for threads to finish.

### Cheat sheet

| Task | Code |
| --- | --- |
| Many waits at once | `with ThreadPoolExecutor(max_workers=10) as pool: list(pool.map(f, items))` |
| Heavy computing on several cores | `with ProcessPoolExecutor() as pool: list(pool.map(f, chunks))` (under `if __name__ == "__main__":`) |
| A thread by hand | `t = threading.Thread(target=f, args=(x,))`, `t.start()`, `t.join()` |
| Only one thread at a time | `lock = threading.Lock()` … `with lock: …` |
| How many cores? | `os.cpu_count()` |

| | Threads | Processes |
| --- | --- | --- |
| Good for | waiting (network, database, files) | computing |
| Memory | shared (needs locks) | separate (data is copied) |
| GIL | one shared GIL | one GIL each |
| Start-up cost | small | bigger |

> **Next in Bazaar:** 100 supplier APIs. Threads work, but 100 threads is a lot of machinery for a lot of waiting. Python's `asyncio` handles thousands of
> waits with just one thread. Next lesson: asyncio, and the plan's lab: the same 100 calls, three ways, timed.

<div class="bz-complete" data-lesson="m05-07"></div>
