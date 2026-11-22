# Lab 05-05: 200,000 orders, one line at a time

**Goal:** see a generator pause at each `yield`, compare a list's memory with a generator's, add up 200,000 orders through a generator pipeline,
write a context manager that always cleans up, and fix an average that crashes because a generator was used twice.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`. Programs write to and read from `data/` (kept out of Git).

| Folder | What's inside |
| --- | --- |
| `examples/` | `make_log.py`, `yield_demo.py`, `list_vs_generator.py`, `pipeline.py`, `context_managers.py`, `deeper.py` |
| `mistakes/` | `stop_iteration.py`, `len_generator.py` |
| `exercises/average_order.py` | an average that crashes; you fix it |
| `solutions/average_order.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: Make the order log

```bash
python3 examples/make_log.py
head -3 data/orders.log
wc -l data/orders.log
```

**Expected output:**

```
wrote 200000 orders to data/orders.log
1,Priya,Red Running Shoes,99900,PAID
2,Ravi,Steel Water Bottle,34900,PAID
3,Priya,Steel Water Bottle,34900,FAILED
200000 data/orders.log
```

## Task 2: Watch a generator pause

```bash
python3 examples/yield_demo.py
```

**Expected output:**

```
generator
  (generator starts)
1001
  (generator resumes)
1002
  (generator resumes again)
1003
  (generator ends)
```

## Task 3: List vs generator memory

```bash
python3 examples/list_vs_generator.py
```

**Expected output:**

```
list:      8448728 bytes
generator: 200 bytes
same total? True
```

## Task 4: The pipeline

```bash
python3 examples/pipeline.py
```

**Expected output:**

```
paid orders: 149,894
paid total:  ₹113,711,456
```

Try: change `paid_only` to keep `"FAILED"` orders instead. You get the other 50,106 orders. Put it back.

## Task 5: A till that always closes

```bash
python3 examples/context_managers.py
```

**Expected output:**

```
Neha opens the till
  sold 2 Masala Box
Neha closes the till
Rohan opens the till
  selling Wireless Earbuds...
Rohan closes the till
error: card declined
```

## Task 6: Two generator mistakes

```bash
python3 mistakes/stop_iteration.py 2>&1 | tail -1
python3 mistakes/len_generator.py 2>&1 | tail -1
```

**Expected output:**

```
StopIteration
TypeError: object of type 'generator' has no len()
```

## Task 7: Fix the average

```bash
python3 exercises/average_order.py 2>&1 | tail -1
```

```
ZeroDivisionError: integer division or modulo by zero
```

`count` is 0. Why? Fix it so the file is read once and both numbers come from one loop. When it's right:

```
average paid order: ₹758
```

Compare with `python3 solutions/average_order.py`.

## Task 8 (optional, Going deeper)

```bash
python3 examples/deeper.py
```

**Expected output:**

```
['Priya', 'Ravi', 'Priya']
Neha opens the till
  Neha is selling
Neha closes the till (error: None)
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: make_log.py: 200,000 order lines written
PASS: yield_demo.py: a generator pauses at each yield
PASS: list_vs_generator.py: list 8448728 bytes vs generator 200 bytes, same total
PASS: pipeline.py: 149894 113711456 (count, rupees) matches an independent awk count
PASS: context_managers.py: the clean-up runs even after an error
PASS: the exercise really crashes (the generator was used up by sum)
PASS: solution: one pass gives the average, ₹758 (matches awk)
PASS: deeper.py: islice, yield from, __enter__/__exit__
PASS: mistakes/: next() past the end; len() of a generator
ALL CHECKS PASSED
```

The test checks the pipeline's answer against a separate count made with `awk`. It checks the lab's own files, so undo your edits to `examples/` first.
It doesn't grade `exercises/average_order.py`.

## Stuck?

- **`FileNotFoundError: … 'data/orders.log'`**: run `python3 examples/make_log.py` first, from `/lab`.
- **A loop does nothing, or a count is 0**: the generator was already used up. Make a new one, or do everything in one loop.
- **`TypeError: object of type 'generator' has no len()`**: count while looping instead.

## Clean up

```bash
docker compose down
```
