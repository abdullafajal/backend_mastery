# Lab 05-04: Timing and retrying Bazaar's supplier calls

**Goal:** pass functions around as values, write decorators that log, time and retry any function, meet two silent decorator mistakes,
and fix a GST decorator whose wrapper gives back `None`.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`. The "supplier requests" are pretend: `time.sleep()` plays a slow network,
and a counter plays a busy server, so every run gives the same output.

| Folder | What's inside |
| --- | --- |
| `examples/` | `functions_are_values.py`, `log_calls.py`, `timed.py`, `retry.py`, `deeper.py` |
| `mistakes/` | `no_wraps.py`, `retry_no_args.py` |
| `exercises/price_with_gst.py` | a decorator that loses the price; you fix it |
| `solutions/price_with_gst.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: Functions are values

```bash
python3 examples/functions_are_values.py
```

**Expected output:**

```
₹299
['₹299', '₹649']
89910
```

## Task 2: @log_calls

```bash
python3 examples/log_calls.py
```

**Expected output:**

```
→ supplier_price('Patel Spices', 'Masala Box')
← supplier_price returned 21000
→ supplier_price('Meera Handloom', 'Cotton Kurta')
← supplier_price returned 48000
total cost: 69000
supplier_price - What a seller charges Bazaar for one product, in paise.
```

Try: delete the `@log_calls` line and run it again. Only the last two lines remain: the function itself never changed. Put it back.

## Task 3: @timed

```bash
python3 examples/timed.py
```

**Expected output** (times may differ slightly on your computer):

```
fetch_supplier_prices took 0.3 s
build_catalog_page took 0.1 s
[21000, 23500] 14
```

## Task 4: @retry(times=3)

```bash
python3 examples/retry.py
```

**Expected output:**

```
attempt 1 failed: supplier busy
attempt 2 failed: supplier busy
stock: 40
```

Try: change it to `@retry(times=2)`. Now it gives up: the last line is `ConnectionError: gave up after 2 attempts`. Put it back to 3.

## Task 5: Two silent mistakes

```bash
python3 mistakes/no_wraps.py
python3 mistakes/retry_no_args.py
```

**Expected output** (the `0x…` address will differ):

```
wrapper None
<function retry.<locals>.decorator.<locals>.wrapper at 0xffff8b26c720>
```

No errors, just wrong results. Fix each: add `@functools.wraps(func)` (and `import functools`) in the first; write `@retry(times=3)` in the second.

## Task 6: Fix the GST decorator

```bash
python3 exercises/price_with_gst.py
```

```
kurta_price: 64900 + 18% GST = 76582
Customer pays (paise): None
```

The printed line is right, but the customer's price is `None`. Fix the wrapper. When it's right:

```
kurta_price: 64900 + 18% GST = 76582
Customer pays (paise): 76582
```

Compare with `python3 solutions/price_with_gst.py`.

## Task 7 (optional, Going deeper)

```bash
python3 examples/deeper.py
```

**Expected output:**

```
outer before
inner before
  checkout runs
inner after
outer after
2 2 5
slow lookups done: ['110001', '400001']
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: functions_are_values.py: store, pass and return functions
PASS: log_calls.py: before/after lines around each call; wraps keeps the name
PASS: timed.py: @timed measures 0.3 s and 0.1 s, and the results still come back
PASS: retry.py: @retry(times=3) survives two failures
PASS: the exercise really shows the bug (the wrapper returns None)
PASS: solution: the wrapper returns the new price (76582 paise)
PASS: deeper.py: stacking order; lru_cache skips the repeated lookup
PASS: mistakes/no_wraps.py: without functools.wraps the name becomes 'wrapper'
PASS: mistakes/retry_no_args.py: @retry without (times=3) silently returns a function
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/price_with_gst.py`.

## Stuck?

- **A decorated function returns `None`**: the wrapper is missing `return result`.
- **The decorated function never runs**: the wrapper never calls `func(*args, **kwargs)`.
- **You get a function object instead of a value**: a decorator with settings was used without its brackets.

## Clean up

```bash
docker compose down
```
