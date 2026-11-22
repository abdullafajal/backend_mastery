# Memory: stack and heap

<div class="bz-meta" markdown>
**Module** 1 · How computers work
**Lesson** 3
**Reading time** 15 min (+ optional deeper parts)
**You will build** a memory leak on purpose, find the exact line with `tracemalloc`, and watch the kernel kill it at its memory limit
</div>

!!! abstract "In 1 minute"
    - When a function is called, Python makes a **frame** for it on the **stack**; when it returns, the frame is removed.
    - Every Python object (lists, dicts, numbers) lives on the **heap**. A variable is just a **name pointing** to an object.
    - So `b = a` does **not** copy a list: both names point to the same one.
    - Python frees an object when nothing points to it any more. A **memory leak** is when your code keeps pointing to things it doesn't need, like a cache that never forgets.
    - In the lab, you grow a leak, find the exact line, and watch Linux kill it when it uses too much memory (exit code 137).

> **Previously in Bazaar:** You ran Bazaar as several processes and threads. You saw that each process has
> its own memory, that threads share it, and that a container killed with SIGKILL exits with code 137.

## 1. Why learn this?

Three strange reports reach Bazaar's team in one month:

1. **Every night around 3 a.m., the price service restarts** with exit code 137. During the day,
   its memory graph climbs slowly, like a staircase, and never comes down.
2. **The category page crashes** for one seller who made a very deep category tree, with
   `RecursionError: maximum recursion depth exceeded`.
3. **Ravi opens his empty cart and finds Asha's Masala Box in it.**

Three different symptoms, one root cause: how a program uses its memory. In this lesson you will learn
where a program keeps its data (the **stack** and the **heap**), how Python decides when to free it,
and why a program that "can't leak" (Python cleans up for you!) leaks anyway. Then you will reproduce
all three bugs in the lab, and fix them.

## 2. The concept

??? note "Going deeper: A process's memory, from inside"
    In the last lesson, every process got "its own memory". Let's open it. A running Python program's memory
    is divided into areas, each with one job:

    | Area | What lives there | Size |
    | --- | --- | --- |
    | **Code** | the machine instructions of `python3` and the libraries it uses | fixed |
    | **Global data** | values that exist for the whole run of the program | fixed |
    | **Heap** | everything created while the program runs: in Python, **every object** | grows and shrinks |
    | **Stack** (one per thread) | the chain of function calls happening **right now**, with their local variables | grows and shrinks, with a limit |

    Each process sees its own private addresses, starting near zero, as if it had the whole RAM to itself.
    These are **virtual addresses**. The kernel quietly maps them to real RAM in small pieces called **pages**
    (4 KB each in our lab container; 16 KB on an Apple M1 Mac). That is why a process can't touch another
    process's memory: it simply has no address for it. It also explains `VIRT` and `RES` in `top`:
    VIRT is all the virtual space a process has reserved; RES is how much of it is really in RAM.

### The stack: the chain of calls happening right now

Every time a function is called, the program needs a place for that call's own things:

- its **arguments** and **local variables**;
- **where to go back to** when it returns.

That place is a **frame**. Frames are kept on the **stack**: a pile where you can only add on top and
remove from the top, like a stack of plates. Last in, first out.

Here is what happens when Bazaar's code runs `checkout(cart)`, which calls `total(items)`, which calls `price_of(item)`:

1. `checkout` is called → its frame is **pushed** on top of the stack.
2. `checkout` calls `total` → a frame for `total` is pushed on top of it.
3. `total` calls `price_of` → a third frame on top.
4. `price_of` returns 299 → its frame is **popped** (removed). Its local variables are gone.
5. `total` continues exactly where it stopped, because its frame was waiting underneath.
6. `total` returns, then `checkout` returns. Their frames are popped. The stack is back to where it started.

Why is this design so good?

- **It is fast.** Adding or removing a frame just moves a pointer. No searching for free space.
- **It cleans itself.** When a function returns, its frame and its local variables disappear automatically.
- **Each thread has its own stack**, because each thread is in the middle of its own chain of calls.

And its limit: the stack has a fixed maximum size (8 MB for the main thread on our Linux container,
`ulimit -s` shows `8192` KB). A chain of calls that goes too deep runs out of room: a **stack overflow**.

You have already seen a stack many times without knowing it: **a traceback is the stack, printed.**
Each `File "...", line ..., in <function>` line is one frame, oldest at the top, newest at the bottom.

### The stack in Python

Python adds two things to this picture:

- Python keeps its own frames for Python functions, and they work exactly like the plates above.
- To protect the real stack underneath from overflowing (which would crash the whole interpreter),
  Python stops at about **1,000 nested calls** and raises `RecursionError: maximum recursion depth exceeded`.
  `sys.getrecursionlimit()` shows the limit.

A function that calls itself is **recursive**. Recursion is elegant for trees (like Bazaar's categories),
but every level adds a frame. A category tree 5,000 levels deep needs 5,000 frames, and fails.
The same job written as a **loop** uses one frame, no matter how deep the tree is.

### The heap: everything that outlives a single call

Some data must live longer than the function that made it. When `add_to_cart()` returns, the cart must still exist.
Such data goes on the **heap**: a big area where pieces of memory can be taken in any size, in any order,
and kept for as long as they are needed.

| | Stack | Heap |
| --- | --- | --- |
| Holds | the current calls and their local names | objects, of any size, that may live long |
| Order | strictly last-in, first-out | any order |
| Speed to get memory | very fast (move a pointer) | slower (find a free spot that fits) |
| Who cleans up | automatic, when a function returns | someone must decide when an object is no longer needed |
| Size | small, fixed limit per thread | large: limited by RAM (and container limits) |
| Typical error | stack overflow / `RecursionError` | memory leak, out of memory (exit 137) |

### Python: names point to objects

This is the most useful idea in this lesson: **in Python, a variable is a name that points to an object**,
and the object lives on the heap.

```python
cart = ["Masala Box", "Cotton Kurta"]
```

This makes a list on the heap, and makes the name `cart` point to it. So:

- **`same_cart = ashas_cart` does not copy anything.** It adds a second name for the **same** list.
  Change the list through either name, and both "see" the change.
- **To get a real copy**, ask for one: `list(ashas_cart)` or `ashas_cart.copy()`.
- **Passing a list to a function doesn't copy it either.** The function works on the very same list.

??? note "Going deeper: identity, mutable vs immutable, and object sizes"

    This is the single most useful idea for a Python developer: **in Python, a variable is a name that points
    to an object, and every object lives on the heap.**

    ```python
    cart = ["Masala Box", "Cotton Kurta"]
    ```

    This line does two things: it creates a **list object** on the heap, and it makes the **name** `cart`
    (in the current frame) point to it. Two consequences:

    1. **Two names can point to the same object.** `same_cart = ashas_cart` copies nothing. It adds a second
       name for the one list. Change the list through either name, and both "see" it. This is called **aliasing**.
    2. **Passing a list to a function passes a pointer.** `total(cart)` doesn't copy the cart. The function
       works on the very same list.

    Every object has an **identity**: `id(obj)` gives a number for it (in CPython, its memory address).
    `a is b` asks "same object?", while `a == b` asks "equal values?". Two different lists can be equal.

    Some objects can be changed after they are made (**mutable**: `list`, `dict`, `set`). Others can't
    (**immutable**: `int`, `str`, `tuple`). `price = price + 1` doesn't change the number 999; it creates a
    new int object and points the name `price` at it.

    Objects also cost memory. Real sizes on our Python 3.13 (64-bit) container:

    | Object | Size |
    | --- | --- |
    | `999` (int) | 28 bytes |
    | `10**30` (a huge int) | 40 bytes |
    | `""` (empty str) | 41 bytes |
    | `"Masala Box"` | 51 bytes |
    | `[]` (empty list) | 56 bytes |
    | `[1, 2, 3]` | 88 bytes |
    | `{}` (empty dict) | 64 bytes |
    | `{"id": 1}` | 184 bytes |

    A plain number takes 28 bytes, not 8, because every Python object carries some bookkeeping:
    its type and its reference count (next section). And `sys.getsizeof(list)` counts only the list itself,
    which holds **pointers** (8 bytes each) to its items, not the items. A list of 1,000 product dicts is
    much bigger than `getsizeof` says.

### Who cleans up the heap?

You never free memory yourself in Python. Python keeps a **count** of how many names point to each object.
When the count drops to zero (nothing points to it any more), the object is freed at once.
That's called **reference counting**. (The box below has the details, including a special case.)

??? note "Going deeper: How reference counting works, in detail"
    Something must decide when a heap object is no longer needed. There are two families of languages:

    - **Manual** (C, C++): the programmer asks for memory (`malloc`) and must give it back (`free`).
      Forget to free it: a leak. Free it too early and use it again: a crash, or a security hole.
    - **Automatic** (Python, Java, Go, JavaScript): the language finds objects that nobody can reach any more
      and frees them. This is called **garbage collection**.

    CPython uses two tools together:

    1. **Reference counting.** Every object counts how many names and other objects point to it.
        - `order = Order(1042)` → count 1.
        - `also = order` → count 2.
        - `del order` → count 1. Still reachable as `also`, so it stays.
        - `del also` → count 0. **Freed at that exact moment.**
    2. **The cycle collector**, for one case counting can't handle. If order #1 points to order #2 and #2 points back
       to #1, each has a count of 1 forever, even after your program has no name for either of them.
       Every so often, the cycle collector looks for such groups that nothing outside can reach, and frees them.
       You can also run it yourself with `gc.collect()`.

### So how can Python leak memory?

Garbage collection frees what is **unreachable**. It can't free what is still reachable, even if you will
never use it again. So a **memory leak** in Python means: your program keeps a reference to things it no longer needs.

The classic Bazaar example is a cache:

```python
PRICE_CACHE = {}   # a global: reachable for as long as the program runs

def price_leaky(product_id, user_id, request_id):
    key = (product_id, user_id, request_id)    # request_id is new for every request...
    if key not in PRICE_CACHE:
        PRICE_CACHE[key] = {...}                # ...so every request adds a new entry, forever
```

Each request's frame is popped when it ends, but its entry stays reachable through `PRICE_CACHE`.
In the lab, this grows by about 17 MB every 50,000 requests, and never shrinks.

Typical sources of leaks in backends:

- caches with no size limit, or with keys that never repeat (like the request id above);
- global lists that "just collect" things (all orders, all errors, all log lines);
- Django with `DEBUG = True`: it remembers every SQL query of a request, for debugging (Module 8);
- event listeners or callbacks that are added again and again, and never removed.

The fixes:

- give every cache a **maximum size** (`functools.lru_cache(maxsize=1000)` forgets the least recently used entry)
  or a time limit;
- keep big shared caches **outside** the process, in Redis, which has its own memory limit (Module 22);
- as a safety net, restart workers now and then: Gunicorn's `max_requests` does exactly that (Module 20).

### Finding a leak

1. **Watch the RAM over time** (`RSS`). A leak looks like a staircase going up and never coming down,
   even when traffic is quiet.
2. **Ask Python where the memory was allocated.** The standard library's `tracemalloc` records the file and line
   of every allocation. In the lab it points straight at the cache line. (It costs extra memory while it runs,
   so use it to investigate, not all the time.)
3. **Put a limit on it.** A container memory limit turns a slow leak into a clear, early failure.

### When memory runs out: the OOM killer

When a container goes over its memory limit (or the whole computer runs out of RAM and swap), the Linux kernel's
**OOM killer** (out-of-memory killer) picks a process and ends it with **SIGKILL**. No warning, no cleanup.
The exit code is **137** (128 + 9, from the last lesson), and `docker inspect` shows `"OOMKilled": true`.
That is Bazaar's 3 a.m. restart.

### An analogy, and where it breaks

Think of Bazaar's warehouse office:

- The **stack** is the pile of sticky notes on a clerk's desk. Starting a task puts a note on top, with that task's
  details. Starting a sub-task puts another note on top. Finishing a task throws its note away.
  The clerk always works on the top note. Each clerk (thread) has their own pile.
- The **heap** is the warehouse. Boxes (objects) stay there as long as someone holds a **receipt** for them.
  The receipts are the references. When the last receipt is torn up, the box is thrown out (reference counting).
- A **leak** is a drawer where someone files a receipt for every box, "just in case", and never empties it.
  The warehouse fills up, even though nobody will ever come for those boxes.

Where it breaks: in a real warehouse, a box can be found by walking around. In a program, an object with no
reference can never be found again; that's exactly why it's safe to throw it away. And real warehouses don't
have a strict pile: the stack really is that strict. You can never remove a note from the middle.

??? note "Going deeper: In the real world"
    - **Gunicorn** (Module 20): `max_requests` restarts a worker process after N requests, freeing anything it leaked.
    - **Django** (Module 8): `DEBUG = True` keeps every query of a request in memory. Never use it in production.
    - **Redis** (Module 22): `maxmemory` and an eviction policy (like "remove least recently used keys") stop it from growing forever.
    - **Docker and Kubernetes** (Modules 19 and 26): memory limits per container, and `OOMKilled` in their status.
    - **PostgreSQL** (Modules 16 and 17): its own memory areas (`shared_buffers`, `work_mem`) are sized by you.
    - **Languages**: Java and Go use a "tracing" garbage collector instead of reference counting.
      Rust has no garbage collector at all: its compiler decides at compile time when memory is freed.

### Questions you may have

**Is the stack faster than the heap?**
Getting memory on the stack is faster: it's just moving a pointer. But reading data is equally fast from both;
they are both RAM. And in Python, all objects are on the heap anyway, so you don't choose.

**Does `del` free memory?**
`del name` removes a **name**, and lowers the object's reference count by one. The object is freed only when
the count reaches zero. If something else still points to it, `del` frees nothing.

**When I clear a big cache, does the RAM go back to the operating system?**
Often, yes. In our test, filling a dict with 500,000 entries took RSS from 9 MB to 137 MB, and `cache.clear()`
brought it back to 12 MB. But Python may keep some freed memory to reuse for new objects, so don't be surprised
if RSS doesn't drop all the way.

**Can I just raise the recursion limit?**
`sys.setrecursionlimit()` exists, but raising it a lot can overflow the real stack underneath and crash the
whole interpreter, with no Python error at all. For deep structures, write a loop.

**Why does every Python int take 28 bytes?**
Because it is a full object: it stores its reference count, a pointer to its type (`int`), its size, and then
the number itself. Convenient, but heavy. That is one reason why tools like NumPy store numbers in compact
arrays instead.

**Does garbage collection pause my program?**
Reference counting frees objects immediately, a little at a time. The cycle collector runs every so often
and takes a short time. For a web backend it is almost never a problem.

## 3. See it in action

Pick a situation, then press **Play**. Watch frames appear and disappear on the stack, and objects stay or go on the heap.

<div class="bz-diagram" data-diagram="stack-heap"></div>

## 4. Code example

### Names and objects

```python title="names_and_objects.py"
--8<-- "labs/01-how-computers-work/03-stack-and-heap/app/names_and_objects.py"
```

Output (the `id` numbers are addresses and will be different for you):

```
1) Every object has an identity (its address) and a size:
   id(price) = 281473863018736   size = 28 bytes
   id(cart)  = 281473862899712   size = 72 bytes
2) Two names can point to the SAME object:
   ashas_cart = ['Masala Box', 'Steel Water Bottle']
   same object? True
3) A real copy is a NEW object:
   ashas_cart = ['Masala Box', 'Steel Water Bottle']
   copy_cart  = ['Masala Box', 'Steel Water Bottle', 'Red Running Shoes']
   same object? False
4) Sizes of some empty and small objects:
                                    0 ->   28 bytes
                                  999 ->   28 bytes
      1000000000000000000000000000000 ->   40 bytes
                                   '' ->   41 bytes
                         'Masala Box' ->   51 bytes
                                   [] ->   56 bytes
                            [1, 2, 3] ->   88 bytes
                                   {} ->   64 bytes
                            {'id': 1} ->  184 bytes
```

Part 2 is aliasing: we appended through `same_cart`, and `ashas_cart` changed, because there is only one list.
Part 3 made a real copy with `list(...)`, so the two lists are now independent.

### Who frees what, and when

```python title="who_frees.py"
--8<-- "labs/01-how-computers-work/03-stack-and-heap/app/who_frees.py"
```

Output:

```
1) Reference counting:
   references to the order: 1
   after `also = order`: 2
   deleted the name `order` (the object is still reachable as `also`)
   -> order #1042 was freed
   deleted the name `also`
2) A cycle: two orders that point to each other
   deleted both names... but nothing was freed: each still holds the other
   running the cycle collector:
   -> order #1 was freed
   -> order #2 was freed
   gc.collect() found 11 unreachable objects
```

Read the order of the lines carefully. Order #1042 was freed **inside** `del also`, before the next `print`:
reference counting works instantly. The two orders in a cycle were **not** freed by `del`; only `gc.collect()` freed them.
(`weakref.finalize` lets us run a function when an object is freed, without keeping it alive ourselves.
`gc.collect()` counts 11 objects because each order also has its own attribute dict and helper objects.)

## 5. Under the hood

### A traceback is the stack

`call_stack.py` prints the stack at the moment `price_of()` finds an unknown product:

```
  File "/app/call_stack.py", line 21, in checkout
    return total(cart)
  File "/app/call_stack.py", line 17, in total
    return sum(price_of(i) for i in items)
  File "/app/call_stack.py", line 17, in <genexpr>
    return sum(price_of(i) for i in items)
  File "/app/call_stack.py", line 11, in price_of
    traceback.print_stack(limit=4, file=sys.stdout)  # print the call stack right now
```

Four frames, oldest at the top: `checkout` called `total`, which ran a **generator expression**
(the `(... for i in items)` part gets its own frame), which called `price_of`. This is exactly the shape you see
in every error message. When an error happens, read the traceback as "how did we get here?", top to bottom,
and "what went wrong?" on the last line.

### Recursion vs a loop

```
   recursion limit: 1000
   tree of 500 levels, recursive: 500
   tree of 5000 levels, recursive: RecursionError: maximum recursion depth exceeded
   tree of 5000 levels, with a loop: 5000
```

`depth_recursive()` needs one frame per level. 500 levels fit; 5,000 don't. `depth_loop()` walks the same
5,000 levels with one frame, moving a single variable `node` down the tree.

### Watching a leak grow

`leak.py` simulates 200,000 requests to Bazaar's price service:

```
mode: leaky
 requests | RAM (RSS) | cache size
   50,000 |     31 MB | 50,000
  100,000 |     48 MB | 100,000
  150,000 |     64 MB | 150,000
  200,000 |     84 MB | 200,000
```

```
mode: bounded
 requests | RAM (RSS) | cache size
   50,000 |     14 MB | 1,000
  100,000 |     14 MB | 1,000
  150,000 |     14 MB | 1,000
  200,000 |     14 MB | 1,000
```

The leaky cache grows by about 17 MB per 50,000 requests: roughly 350 bytes per request that are never returned.
The bounded cache (`lru_cache(maxsize=1000)`) stays flat at 14 MB, with exactly 1,000 entries.

`tracemalloc` then names the guilty lines (`find` mode):

```
  /app/leak.py:27: size=45.1 MiB, count=399888, average=118 B
  /app/leak.py:25: size=12.2 MiB, count=199949, average=64 B
  /app/leak.py:44: size=6242 KiB, count=199744, average=32 B
```

Line 27 creates the cache entry (`PRICE_CACHE[key] = {...}`); line 25 builds the key tuple. Each line shows how
much memory it is holding right now, in how many separate pieces (`count`). That is where to look.
(Also notice: with `tracemalloc` running, RSS reached 172 MB instead of 84 MB. Measuring costs memory too.)

### The OOM killer at work

The lab runs the same leak forever, in a container limited to 64 MB:

```
leaky-backend-1  | mode: forever
leaky-backend-1  |  requests | RAM (RSS) | cache size
leaky-backend-1  |    50,000 |     31 MB | 50,000
leaky-backend-1  |   100,000 |     48 MB | 100,000
leaky-backend-1  |   150,000 |     64 MB | 150,000
leaky-backend-1 exited with code 137
```

```
$ docker inspect <container> --format 'exit code {{.State.ExitCode}}, OOMKilled {{.State.OOMKilled}}'
exit code 137, OOMKilled true
```

Right after reaching the 64 MB limit, the kernel killed it. The program printed no error, because SIGKILL gives it
no chance to. Only the exit code and `OOMKilled` tell the story. That is why you must know them.

??? note "Going deeper: how the stack is really built"
    In machine code, a stack frame lives in a real block of RAM. The CPU has a register (the **stack pointer**)
    that holds the address of the top of the stack. Calling a function moves it down by the size of the new frame;
    returning moves it back. The frame holds the saved "return address": where the CPU should continue after the
    function ends. Since Python 3.11, CPython keeps Python function frames in its own compact per-thread area,
    which is why plain Python-to-Python calls became cheaper, but the idea is the same.

??? note "Going deeper: generational garbage collection"
    CPython's cycle collector sorts objects into **generations** by age. New objects are checked often, because
    most objects die young (a request's temporary dicts). Objects that survive several checks are checked rarely.
    `gc.get_threshold()` shows when each generation is checked; `gc.get_count()` shows how many allocations happened
    since. Java and Go use the same "most objects die young" idea in their own collectors.

## 6. Lab

**Lab folder:** `labs/01-how-computers-work/03-stack-and-heap/`

```bash
cd labs/01-how-computers-work/03-stack-and-heap
docker compose run --rm python python3 names_and_objects.py
```

Expected output: the "Names and objects" output above. In the lab you will also:

1. reproduce Ravi's cart bug (a shared default list), and fix it;
2. print the call stack, and hit a `RecursionError`;
3. watch reference counting and the cycle collector free objects;
4. grow a memory leak, compare it with a bounded cache, and find the leaking line with `tracemalloc`;
5. run the leak inside a 64 MB container and watch the OOM killer end it with exit code 137.

When you finish, run `bash test_lab.sh`. You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **A mutable default argument**: `def add_to_cart(item, cart=[])`. The default list is created **once**, when the
   function is defined, and shared by every call. That is how Ravi got Asha's Masala Box.
   **Fix:** `cart=None`, then `if cart is None: cart = []` inside the function.
2. **Thinking `b = a` copies a list or dict.** It adds a second name for the same object. **Fix:** `list(a)`,
   `dict(a)` or `a.copy()` for a copy.
3. **Thinking a copy is always a full copy.** `list(orders)` is a **shallow** copy: the inner lists are still shared.
   **Fix:** `copy.deepcopy(orders)` when the inner objects must be independent.
4. **A cache with no limit.** It works in testing and fills RAM in production. **Fix:** `lru_cache(maxsize=...)`,
   a time limit, or Redis with `maxmemory`.
5. **Deep recursion on data you don't control** (category trees, nested comments, JSON from users).
   One deep input crashes the request with `RecursionError`. **Fix:** use a loop with your own list as a to-do stack.
6. **Raising the recursion limit instead.** Too high, and the interpreter itself can crash with no Python error.
   **Fix:** write a loop.
7. **"Exit code 137, no error in the logs."** The process didn't crash; it was killed for using too much memory.
   **Fix:** check `docker inspect ... OOMKilled`, then look for a leak (RSS staircase, `tracemalloc`).

## 8. Quiz

<div class="bz-quiz" data-quiz="m01-03"></div>

## 9. What's next

Next: [File systems](04-file-systems.md). You will see how the disk is organised into files and folders.

**In one line:** the stack holds the calls happening right now and cleans itself; the heap holds every Python object,
freed when nothing points to it any more, so a "leak" in Python means you are still pointing to things you don't need.

### Cheat sheet

| Task | How |
| --- | --- |
| Is it the same object? | `a is b` (same object) vs `a == b` (equal values) |
| Object's identity / size | `id(obj)`, `sys.getsizeof(obj)` (outer object only) |
| How many references? | `sys.getrefcount(obj) - 1` |
| Copy a list / dict | `list(a)`, `dict(a)`, `a.copy()` (shallow); `copy.deepcopy(a)` (deep) |
| Recursion limit | `sys.getrecursionlimit()` (default 1000) |
| Print the current stack | `traceback.print_stack()` |
| Run the cycle collector | `gc.collect()` |
| Find where memory is allocated | `tracemalloc.start()`, then `tracemalloc.take_snapshot().statistics("lineno")` |
| A bounded cache | `@functools.lru_cache(maxsize=1000)` |
| RAM of a process (Linux) | `grep VmRSS /proc/<pid>/status`, or `RES` in `top` |
| Memory limit in Compose | `mem_limit: 64m` (and `memswap_limit: 64m`) |
| Was it killed for memory? | exit code `137` + `docker inspect <c> --format '{{.State.OOMKilled}}'` |

> **Next in Bazaar:** the price service now keeps its memory in check. But orders, product images and logs
> must be kept on the disk. How does the disk organise them into files and folders? Let's find out.

<div class="bz-complete" data-lesson="m01-03"></div>
