# Lab 04-06: Bazaar doesn't crash on bad input

**Goal:** handle bad input with `try`/`except`, give different answers for different errors, raise your own errors for Bazaar's rules,
see three ways error handling goes wrong, and fix a bulk-order import that crashes on one bad line.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`.

| Folder | What's inside |
| --- | --- |
| `examples/` | `try_except.py`, `two_errors.py`, `raise_error.py`, `else_finally.py` |
| `mistakes/` | `wrong_except.py`, `bare_except.py`, `forgot_continue.py` |
| `exercises/bulk_order.py` | the crashing import for you to fix |
| `solutions/bulk_order.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: try / except

```bash
python3 examples/try_except.py
```

**Expected output:**

```
'3': OK, 3 added to the cart
'three': please type a number, like 3
The shop is still running.
```

## Task 2: Two errors, two answers

```bash
python3 examples/two_errors.py
```

**Expected output:**

```
Masala Box x2: ₹598
Gold Watch: sorry, Bazaar doesn't sell this
Cotton Kurta: bad quantity (invalid literal for int() with base 10: 'two')
```

## Task 3: raise for Bazaar's rules

```bash
python3 examples/raise_error.py
```

**Expected output:**

```
Reserved 2 Masala Box. 38 left.
Can't reserve 10 Wireless Earbuds: only 8 Wireless Earbuds left
Can't reserve 0 Masala Box: quantity must be at least 1
```

## Task 4: else and finally

```bash
python3 examples/else_finally.py
```

**Expected output:**

```
'5': 5 boxes
  (line checked)
'five': not a number
  (line checked)
```

## Task 5: Three ways it goes wrong

```bash
python3 mistakes/wrong_except.py
python3 mistakes/bare_except.py
python3 mistakes/forgot_continue.py
```

**Expected output:**

```
Traceback (most recent call last):
  File "/lab/mistakes/wrong_except.py", line 2, in <module>
    quantity = int("three")
ValueError: invalid literal for int() with base 10: 'three'
please type a number
Added 2
Skipped 'three': not a number
Added 2
Added 5
Skipped '': not a number
Added 5
Added 1
Total boxes: 15
```

1. `wrong_except.py`: `except KeyError` doesn't catch a `ValueError`, so it still crashes.
2. `bare_except.py`: the input `"3"` is fine, yet it says "please type a number". Open the file and find the real bug (a typo). Fix the typo
   by defining `price_paise = 29900` and spelling it right, then change `except:` to `except ValueError:`.
3. `forgot_continue.py`: no error, but 15 boxes instead of 8. After a bad line, the old `quantity` is added again.

## Task 6: Fix the bulk-order import

```bash
python3 exercises/bulk_order.py
```

```
Added 2
Traceback (most recent call last):
  File "/lab/exercises/bulk_order.py", line 9, in <module>
    quantity = int(text)
ValueError: invalid literal for int() with base 10: 'three'
```

Wrap the one risky line in `try`/`except ValueError`, print `Skipped '…': not a number`, and go on with the next line. When it's right:

```
Added 2
Skipped 'three': not a number
Added 5
Skipped '': not a number
Added 1
Total boxes: 8
```

If you get 15 boxes, look at Task 5's third mistake. Compare with `python3 solutions/bulk_order.py`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: try_except.py: 'three' gives a message, not a crash
PASS: two_errors.py: KeyError and ValueError get different answers
PASS: raise_error.py: your own rules raise ValueError with a reason
PASS: else_finally.py: else only without error, finally always
PASS: the exercise really crashes at 'three' (the last 3 lines are lost)
PASS: solution: bad lines skipped, total 8 boxes
PASS: mistakes/forgot_continue.py: no error, but 15 boxes instead of 8
PASS: mistakes/: the wrong except still crashes; a bare except hides a typo
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/bulk_order.py`.

## Stuck?

- **It still crashes inside `try`**: the `except` names a different error than the one in the traceback's last line.
- **The total is too big**: after catching the error, use `continue` so the old value isn't reused.
- **`IndentationError` after adding `try`**: the risky line must be indented under `try:`, and `except` lines up with `try`.

## Clean up

```bash
docker compose down
```
