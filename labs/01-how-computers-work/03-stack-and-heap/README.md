# Lab 01-03: Stack, heap, and a memory leak

**Goal:** see that Python names point to objects, reproduce Ravi's cart bug, print the call stack, hit a
`RecursionError`, watch Python free objects, then grow a memory leak, find its exact line, and watch the
kernel kill it at its memory limit.

**Time:** about 40 minutes.

**You need:** Docker running.

## What is in this folder

| File | What it does |
| --- | --- |
| `app/names_and_objects.py` | ids, sizes, aliasing and copies |
| `app/cart_bugs.py` | the shared-default-list bug (Ravi's cart) and shallow vs deep copies |
| `app/call_stack.py` | prints the call stack; recursion vs a loop on a deep category tree |
| `app/who_frees.py` | reference counting, and the cycle collector |
| `app/leak.py` | Bazaar's price service with a leaky cache (modes: `leaky`, `bounded`, `find`, `forever`) |
| `docker-compose.yml` | `python` (run one script) and `leaky-backend` (the leak, limited to 64 MB) |
| `test_lab.sh` | Checks that everything works. |

Every script runs with:

```
docker compose run --rm python python3 <file>
```

## Task 1: Names and objects

```bash
docker compose run --rm python python3 names_and_objects.py
```

**Expected output** (the `id` numbers will differ):

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

## Task 2: Ravi's cart

```bash
docker compose run --rm python python3 cart_bugs.py
```

**Expected output:**

```
1) A default list is created ONCE, when the function is defined, and then shared:
   Asha: ['Masala Box']
   Ravi: ['Masala Box', 'Cotton Kurta']
   fixed, Asha: ['Masala Box']
   fixed, Ravi: ['Cotton Kurta']
2) A shallow copy copies the outer list, but shares the inner ones:
   original after changing the shallow copy: [['Masala Box', 'Steel Water Bottle'], ['Cotton Kurta']]
   original after changing the deep copy:    [['Masala Box', 'Steel Water Bottle'], ['Cotton Kurta']]
```

Ravi's new cart already contains Asha's Masala Box: both calls used the **same** default list.
Open `app/cart_bugs.py` and compare `add_to_cart` with `add_to_cart_fixed`.

## Task 3: The call stack, and a RecursionError

```bash
docker compose run --rm python python3 call_stack.py
```

**Expected output:**

```
1) A normal checkout: 948
2) The call stack when something goes wrong:
  File "/app/call_stack.py", line 21, in checkout
    return total(cart)
  File "/app/call_stack.py", line 17, in total
    return sum(price_of(i) for i in items)
  File "/app/call_stack.py", line 17, in <genexpr>
    return sum(price_of(i) for i in items)
  File "/app/call_stack.py", line 11, in price_of
    traceback.print_stack(limit=4, file=sys.stdout)  # print the call stack right now
   KeyError: 'Gold Watch'
3) Bazaar's category tree: Home > Kitchen > ... (each level inside the one above)
   recursion limit: 1000
   tree of 500 levels, recursive: 500
   tree of 5000 levels, recursive: RecursionError: maximum recursion depth exceeded
   tree of 5000 levels, with a loop: 5000
```

Each `File ... in <name>` pair is one **frame**. The loop handles 5,000 levels with a single frame.

## Task 4: Who frees what

```bash
docker compose run --rm python python3 who_frees.py
```

**Expected output:**

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

Order #1042 is freed **during** `del also` (its count hit 0). The two orders in a cycle wait for `gc.collect()`.

## Task 5: Grow a leak, and stop it

```bash
docker compose run --rm python python3 leak.py leaky
docker compose run --rm python python3 leak.py bounded
```

**Expected output** (your MB numbers will differ a little):

```
mode: leaky
 requests | RAM (RSS) | cache size
   50,000 |     31 MB | 50,000
  100,000 |     48 MB | 100,000
  150,000 |     64 MB | 150,000
  200,000 |     84 MB | 200,000
mode: bounded
 requests | RAM (RSS) | cache size
   50,000 |     14 MB | 1,000
  100,000 |     14 MB | 1,000
  150,000 |     14 MB | 1,000
  200,000 |     14 MB | 1,000
```

The leaky cache keeps every request's entry forever. The bounded one keeps at most 1,000.

## Task 6: Find the leaking line

```bash
docker compose run --rm python python3 leak.py find
```

**Expected output** (the end):

```
  /app/leak.py:27: size=45.1 MiB, count=399888, average=118 B
  /app/leak.py:25: size=12.2 MiB, count=199949, average=64 B
  /app/leak.py:44: size=6242 KiB, count=199744, average=32 B
```

Open `app/leak.py` and look at lines 27 and 25. Notice that RSS is also much higher in this mode:
`tracemalloc` needs memory for its own records.

## Task 7: The OOM killer

Run the leak forever, in a container limited to 64 MB:

```bash
docker compose up leaky-backend
```

**Expected output** (after a few seconds):

```
leaky-backend-1  | mode: forever
leaky-backend-1  |  requests | RAM (RSS) | cache size
leaky-backend-1  |    50,000 |     31 MB | 50,000
leaky-backend-1  |   100,000 |     48 MB | 100,000
leaky-backend-1  |   150,000 |     64 MB | 150,000
leaky-backend-1 exited with code 137
```

Now ask Docker why:

```bash
docker compose ps -a --format 'table {{.Service}}\t{{.Status}}'
docker inspect 03-stack-and-heap-leaky-backend-1 --format 'exit code {{.State.ExitCode}}, OOMKilled {{.State.OOMKilled}}'
```

**Expected output:**

```
SERVICE         STATUS
leaky-backend   Exited (137) Less than a second ago
exit code 137, OOMKilled true
```

No Python error at all: SIGKILL gives the program no chance to say anything. Only `137` and `OOMKilled` tell you.

## Check your work

```bash
bash test_lab.sh
```

**Expected output:**

```
PASS: names_and_objects.py: shared list, real copy, int = 28 bytes
PASS: cart_bugs.py: shared default list bug, and its fix
PASS: call_stack.py: stack printed, RecursionError at 5000 levels, loop works
PASS: who_frees.py: freed at the last reference; the cycle only by gc.collect()
PASS: leak.py leaky: RAM grows 31 MB -> 84 MB
PASS: leak.py bounded: RAM stays flat (14 MB -> 14 MB), cache 1,000
PASS: tracemalloc points at line 27 (the cache)
PASS: 64 MB limit: the leaky backend was OOM-killed (exit 137)
ALL CHECKS PASSED
```

## Stuck?

- **`docker inspect` says `No such object`**: the container name depends on your folder name.
  Use the name shown by `docker compose ps -a`.
- **Task 7 runs for a long time without being killed**: check that `docker-compose.yml` still has
  `mem_limit: 64m` and `memswap_limit: 64m`.

## Clean up

```bash
docker compose down
```
