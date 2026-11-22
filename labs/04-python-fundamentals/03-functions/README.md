# Lab 04-03: Bazaar's rules as functions

**Goal:** write and call functions, see the difference between `print` and `return`, use default values and keyword arguments,
meet three function errors, and fix Ravi's checkout, which crashes because one function gives back `None`.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`.

| Folder | What's inside |
| --- | --- |
| `examples/` | `rupees.py`, `delivery.py`, `line_total.py`, `print_vs_return.py`, `scope.py` |
| `mistakes/` | three tiny programs, each with one classic error |
| `exercises/checkout.py` | Ravi's checkout, which crashes; you fix it |
| `solutions/checkout.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: Define once, call many times

```bash
python3 examples/rupees.py
```

**Expected output:**

```
₹299.00
₹1,531.64
Earbuds cost ₹1,499.00
```

Add a fourth line at the end of `examples/rupees.py`: `print(rupees(34900))`. Run it: `₹349.00`. Then remove the line again.

## Task 2: return, and one rule for every cart

```bash
python3 examples/delivery.py
```

**Expected output:**

```
cart 29900 paise -> delivery 4900 paise
cart 99900 paise -> delivery 0 paise
cart 159600 paise -> delivery 0 paise
```

Diwali: change `FREE_FROM_PAISE = 99900` to `79900` and run it again. **One** edit changed the rule for every cart (here nothing
changes for these three carts; add `79900` to the list to see it). Put it back to `99900`.

## Task 3: Default values and keyword arguments

```bash
python3 examples/line_total.py
```

**Expected output:**

```
64900
59800
169800
104700
```

## Task 4: print is not return

```bash
python3 examples/print_vs_return.py
```

**Expected output:**

```
subtotal is 124700
a = None
b = 124700
```

## Task 5: Local names

```bash
python3 examples/scope.py
```

**Expected output** (the crash is on purpose):

```
11682
Traceback (most recent call last):
  File "/lab/examples/scope.py", line 12, in <module>
    print(tax)                                # NameError: there is no `tax` out here
          ^^^
NameError: name 'tax' is not defined. Did you mean: 'max'?
```

## Task 6: Three errors

```bash
python3 mistakes/no_colon.py
python3 mistakes/missing_argument.py
python3 mistakes/call_before_def.py
```

**Expected output:**

```
  File "/lab/mistakes/no_colon.py", line 1
    def rupees(paise)
                     ^
SyntaxError: expected ':'
Traceback (most recent call last):
  File "/lab/mistakes/missing_argument.py", line 7, in <module>
    print(delivery_charge())
          ~~~~~~~~~~~~~~~^^
TypeError: delivery_charge() missing 1 required positional argument: 'total'
Traceback (most recent call last):
  File "/lab/mistakes/call_before_def.py", line 1, in <module>
    print(rupees(29900))
          ^^^^^^
NameError: name 'rupees' is not defined
```

## Task 7: Fix Ravi's checkout

```bash
python3 exercises/checkout.py
```

```
Traceback (most recent call last):
  File "/lab/exercises/checkout.py", line 23, in <module>
    delivery = delivery_charge(subtotal)
  File "/lab/exercises/checkout.py", line 16, in delivery_charge
    if subtotal >= 99900:
       ^^^^^^^^^^^^^^^^^
TypeError: '>=' not supported between instances of 'NoneType' and 'int'
```

Read it from the bottom: `subtotal` is `None`. Where did it come from? Find the function that gives back nothing, and add the missing line.
When it's right:

```
Subtotal: ₹1,596.00
Delivery: ₹0.00
Total:    ₹1,596.00
```

Compare with `python3 solutions/checkout.py`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: rupees(): one function, three calls
PASS: delivery_charge(): returns 4900 below ₹999, 0 from ₹999
PASS: line_total(): default quantity=1 and keyword arguments
PASS: print is not return: a function without return gives back None
PASS: scope.py: a local name doesn't exist outside its function
PASS: the exercise really crashes (cart_subtotal gives back None)
PASS: solution: return subtotal → ₹1,596.00, free delivery
PASS: mistakes/: no colon, missing argument, call before def
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/checkout.py`.

## Stuck?

- **`TypeError: ... 'NoneType' ...`**: a function gave back `None`. Look for a missing `return` (or a `print` where a `return` should be).
- **`TypeError: ... missing 1 required positional argument`**: you called the function without a value it needs.
- **`NameError: name 'rupees' is not defined`**: the call runs before the `def` line, or there's a typo in the name.
- **Nothing happens when you run the file**: you only defined functions and never called them. Add a call at the bottom.

## Clean up

```bash
docker compose down
```
