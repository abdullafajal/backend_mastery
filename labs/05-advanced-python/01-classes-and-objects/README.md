# Lab 05-01: Bazaar's Product and Cart classes

**Goal:** make objects from a class, see `self` at work, let a class refuse bad data, build a cart of products,
meet three class errors, and fix two carts that share one list.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`.

| Folder | What's inside |
| --- | --- |
| `examples/` | `product.py`, `self_explained.py`, `validate_and_repr.py`, `cart.py` |
| `mistakes/` | `no_self_param.py`, `no_self_dot.py`, `missing_arg.py` |
| `exercises/carts.py` | two carts that share one list; you fix it |
| `solutions/carts.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: A class and two objects

```bash
python3 examples/product.py
```

**Expected output:**

```
Masala Box ₹299.00
Masala Box stock: 38
Earbuds stock:    8
Not sold: only 8 Wireless Earbuds left
```

Try: add `earbuds.sell(3)` and `print(earbuds.stock)` at the end. You get `5`, and Masala Box still has 38. Then remove the lines.

## Task 2: What `self` is

```bash
python3 examples/self_explained.py
```

**Expected output:**

```
36
Product True
```

## Task 3: Refuse bad data

```bash
python3 examples/validate_and_repr.py
```

**Expected output:**

```
Product('Cotton Kurta', 64900, 'Meera Handloom')
Refused: price_paise must be a whole number of paise above 0, not 'cheap'
The dict happily holds: cheap
```

## Task 4: A cart of products

```bash
python3 examples/cart.py
```

**Expected output:**

```
Ravi 2 lines, total 1247 rupees
```

## Task 5: Three errors

```bash
python3 mistakes/no_self_param.py 2>&1 | tail -1
python3 mistakes/no_self_dot.py 2>&1 | tail -1
python3 mistakes/missing_arg.py 2>&1 | tail -1
```

**Expected output:**

```
TypeError: Product.label() takes 0 positional arguments but 1 was given
NameError: name 'name' is not defined. Did you mean: 'self.name'?
TypeError: Product.__init__() missing 1 required positional argument: 'price_paise'
```

## Task 6: Fix the two carts

```bash
python3 exercises/carts.py
```

```
Asha: [('Cotton Kurta', 1), ('Masala Box', 2)]
Ravi: [('Cotton Kurta', 1), ('Masala Box', 2)]
```

Asha never added a kurta. Move the list so every cart gets its own. When it's right:

```
Asha: [('Masala Box', 2)]
Ravi: [('Cotton Kurta', 1)]
```

Compare with `python3 solutions/carts.py`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: product.py: two objects, each with its own stock; sell() raises
PASS: self_explained.py: masala.sell(2) is Product.sell(masala, 2)
PASS: validate_and_repr.py: __init__ refuses 'cheap'; __repr__ prints nicely
PASS: cart.py: a Cart of Products adds up to ₹1,247
PASS: the exercise really shows the bug (one list shared by both carts)
PASS: solution: self.lines in __init__ → each cart has its own list
PASS: mistakes/: no self parameter, no self. prefix, missing argument
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/carts.py`.

## Stuck?

- **`takes 0 positional arguments but 1 was given`**: the method has no `self` parameter.
- **`NameError: name '…' is not defined. Did you mean: 'self.…'?`**: write `self.` in front of the attribute.
- **Every object shows the same data**: a list or dict is on the class. Create it in `__init__` with `self.`.

## Clean up

```bash
docker compose down
```
