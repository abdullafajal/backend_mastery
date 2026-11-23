# Lab 06-01: Big-O with a million products

**Goal:** see how steps grow for O(1) … O(n²), time a lookup in 1,000,000 product ids with a list and with a set, find prices with binary search,
and fix a repeat-customer check that's O(n²).

**Time:** about 20 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`. Times depend on your computer; the step counts never do.

| Folder | What's inside |
| --- | --- |
| `examples/` | `count_steps.py`, `list_vs_set.py`, `binary_search.py` |
| `mistakes/` | `set_in_loop.py` |
| `exercises/repeat_customers.py` | a slow O(n²) check; you fix it |
| `solutions/repeat_customers.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: Count the steps

```bash
python3 examples/count_steps.py
```

**Expected output:**

```
        n   O(1)  O(log n)       O(n)   O(n log n)            O(n²)
       10      1         4         10           40              100
      100      1         7        100          700           10,000
    1,000      1        10      1,000       10,000        1,000,000
   10,000      1        14     10,000      140,000      100,000,000
1,000,000      1        20  1,000,000   20,000,000 1,000,000,000,000
```

## Task 2: A list vs a set

```bash
python3 examples/list_vs_set.py
```

**Expected output** (about 2 seconds; your numbers will differ, the ratio stays huge):

```
list: 200 found, 9.5 ms per lookup
set:  200 found, 0.5 µs per lookup
the set was about 19,800 times faster
```

## Task 3: Binary search

```bash
python3 examples/binary_search.py
```

**Expected output:**

```
     29,900: index     298 after 19 steps
     64,900: index     648 after 19 steps
 99,999,900: index 999,998 after 19 steps
     12,345: index      -1 after 20 steps
```

## Task 4: A set in the wrong place

```bash
python3 mistakes/set_in_loop.py
```

**Expected output** (time will differ):

```
repeat customers: 28, took 1.22 s
```

Move `set(past_customers)` out of the loop (build it once, store it in a name). The time drops to about 0.00 s.

## Task 5: Fix the repeat-customer check

```bash
python3 exercises/repeat_customers.py
```

```
repeat customers: 386
took 3.47 s
```

Keep the answer (386) and make it fast. When it's right:

```
repeat customers: 386
took 0.00 s
```

Compare with `python3 solutions/repeat_customers.py`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output** (times and the ratio will differ):

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: count_steps.py: the step table for O(1) … O(n²)
PASS: list_vs_set.py: both find 200; the set is 19100× faster
PASS: binary_search.py: 1,000,000 prices, at most 20 steps
PASS: exercise 3.53 s vs solution 0.01 s: same 386 repeat customers, the set version far faster
PASS: mistakes/set_in_loop.py: right answer, but the set is rebuilt every time
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade your `exercises/` edits.

## Stuck?

- **The fixed version gives a different number than 386**: you changed what's counted, not just how. Only replace the list lookup with a set lookup.
- **Still slow**: is the `set(...)` built inside the loop? Build it once, before.
- **`list_vs_set.py` takes very long**: it builds a million ids; a few seconds is normal on a slow machine.

## Clean up

```bash
docker compose down
```
