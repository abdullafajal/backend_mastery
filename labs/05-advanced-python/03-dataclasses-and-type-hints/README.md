# Lab 05-03: Dataclasses, and catching type mistakes with mypy

**Goal:** rewrite a class as a dataclass, use defaults, `default_factory`, `__post_init__` and `frozen`, see Python ignore a type hint
while mypy catches it, and fix a Cart dataclass that Python refuses to create.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

This lab builds its own small image: Python 3.13 plus **mypy 2.4.1** (the type checker). This lab folder is shared with it as `/lab`.

| Folder | What's inside |
| --- | --- |
| `examples/` | `before_after.py`, `dataclass_features.py`, `type_hints.py`, `deeper.py` |
| `mistakes/` | `frozen_change.py`, `default_order.py` |
| `exercises/cart.py` | a Cart dataclass that won't even load; you fix it |
| `solutions/cart.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

(The first time, Docker builds the image. That takes a minute.)

## Task 1: By hand vs dataclass

```bash
python3 examples/before_after.py
```

**Expected output:**

```
ProductByHand(name='Masala Box', price_paise=29900, seller='Patel Spices')
Product(name='Masala Box', price_paise=29900, seller='Patel Spices')
True
```

## Task 2: Dataclass features

```bash
python3 examples/dataclass_features.py
```

**Expected output:**

```
Product(name='Cotton Kurta', price_paise=64900, seller='Meera Handloom', stock=0)
[] ['Cotton Kurta']
Refused: price_paise must be a whole number above 0, not 'cheap'
Coupon(code='DIWALI150', discount_paise=15000)
```

## Task 3: Hints are not checked while running

```bash
python3 examples/type_hints.py
```

**Expected output:**

```
59800
299299
```

## Task 4: mypy checks them before running

```bash
mypy examples/type_hints.py
```

**Expected output:**

```
examples/type_hints.py:9: error: Argument 1 to "line_total" has incompatible type "str"; expected "int"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

Now delete the hints from `line_total` (make it `def line_total(price_paise, quantity):`) and run mypy again:

```
Success: no issues found in 1 source file
```

No hints, no check. Put the hints back.

Also try `mypy examples/dataclass_features.py`: it flags line 35, where the example passes `"cheap"` on purpose to show `__post_init__` refusing it.

## Task 5: Two dataclass mistakes

```bash
python3 mistakes/frozen_change.py 2>&1 | tail -1
python3 mistakes/default_order.py 2>&1 | tail -1
```

**Expected output:**

```
dataclasses.FrozenInstanceError: cannot assign to field 'discount_paise'
TypeError: non-default argument 'seller' follows default argument 'stock'
```

## Task 6: Fix the Cart dataclass

```bash
python3 exercises/cart.py 2>&1 | tail -1
```

```
ValueError: mutable default <class 'list'> for field lines is not allowed: use default_factory
```

Do what the message says. When it's right:

```
Asha: []
Ravi: [('Cotton Kurta', 1)]
```

Then check it with `mypy exercises/cart.py`: `Success: no issues found in 1 source file`. Compare with `solutions/cart.py`.

## Task 7 (optional, Going deeper)

```bash
python3 examples/deeper.py
mypy examples/deeper.py
```

**Expected output:**

```
['Masala Box', 'Wireless Earbuds']
Product(price_paise=29900, name='Masala Box', tags=['spices'])
None
25
Success: no issues found in 1 source file
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Building the lab image (Python 3.13 + mypy 2.4.1; the first time takes a minute)...
PASS: mypy 2.4.1 is installed
PASS: before_after.py: @dataclass writes the same __init__/__repr__/__eq__
PASS: dataclass_features.py: default, default_factory, __post_init__, frozen
PASS: type_hints.py: Python ignores hints while running ('299' * 2 = '299299')
PASS: mypy catches the wrong type before running
PASS: the exercise really fails (a list as a default)
PASS: solution: default_factory=list gives each cart its own list
PASS: mypy: the solution has no type errors
PASS: deeper.py: order=True, list[str], Product | None; mypy clean
PASS: mistakes/: changing a frozen coupon; a field without default after one with
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/cart.py`.

## Stuck?

- **`mypy: command not found`**: you're not in this lab's container. Run `docker compose run --rm python` from this lab's folder.
- **`ValueError: mutable default … use default_factory`**: `from dataclasses import dataclass, field`, then `lines: list = field(default_factory=list)`.
- **`TypeError: non-default argument … follows default argument`**: move fields with a default to the end.

## Clean up

```bash
docker compose down
docker image rm bazaar-lab-python-mypy:m05-03    # optional: frees the disk space of this lab's image
```
