# Lab 04-05: Bazaar's shelves in one line

**Goal:** build lists, dicts and sets from Bazaar's catalog with comprehensions, compare them with plain loops,
meet two comprehension errors, and fix the empty "Under ₹500" shelf.

**Time:** about 20 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`.
Every folder has its own copy of `catalog_data.py` (Bazaar's 5 products), so each program can load it with `from catalog_data import catalog`.

| Folder | What's inside |
| --- | --- |
| `examples/` | `loop_vs_comprehension.py`, `list_comprehensions.py`, `dict_and_set.py`, `deeper.py` |
| `mistakes/` | `if_else_order.py`, `loop_name_outside.py` |
| `exercises/under_500.py` | the empty-shelf bug for you to fix |
| `solutions/under_500.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: A loop and a comprehension

```bash
python3 examples/loop_vs_comprehension.py
```

**Expected output:** the same list twice.

```
['Masala Box', 'Steel Water Bottle']
['Masala Box', 'Steel Water Bottle']
```

## Task 2: List comprehensions

```bash
python3 examples/list_comprehensions.py
```

**Expected output:**

```
['Red Running Shoes', 'Cotton Kurta', 'Masala Box', 'Wireless Earbuds', 'Steel Water Bottle']
[999, 649, 299, 1499, 349]
Reorder soon: ['Red Running Shoes', 'Wireless Earbuds']
```

Try: change `< 20` to `< 30` in the last comprehension. Cotton Kurta (stock 25) joins the list. Put it back.

## Task 3: Dict and set comprehensions

```bash
python3 examples/dict_and_set.py
```

**Expected output:**

```
29900
['Kumar Footwear', 'Meera Handloom', 'Patel Spices', 'Sharma Electronics']
{'Cotton Kurta': 16225, 'Masala Box': 11960, 'Steel Water Bottle': 20940}
```

## Task 4: Two errors

```bash
python3 mistakes/if_else_order.py
python3 mistakes/loop_name_outside.py
```

**Expected output:**

```
  File "/lab/mistakes/if_else_order.py", line 3
    labels = [p["name"] for p in catalog if p["price_paise"] < 50000 else "too costly"]
                                                                     ^^^^
SyntaxError: invalid syntax
Traceback (most recent call last):
  File "/lab/mistakes/loop_name_outside.py", line 4, in <module>
    print(p)
          ^
NameError: name 'p' is not defined
```

## Task 5: Fix the "Under ₹500" shelf

```bash
python3 exercises/under_500.py
```

```
Under ₹500: []
```

The shelf is empty, though Masala Box costs ₹299. Find the unit mistake and fix it. When it's right:

```
Under ₹500: ['Masala Box', 'Steel Water Bottle']
```

Compare with `python3 solutions/under_500.py`.

## Task 6 (optional, Going deeper)

```bash
python3 examples/deeper.py
```

**Expected output:**

```
['too costly', 'too costly', 'Masala Box', 'too costly', 'Steel Water Bottle']
stock worth ₹ 73105
anything sold out? False
every price set?   True
['Masala Box', 'Masala Box', 'Cotton Kurta']
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: all four copies of catalog_data.py are identical
PASS: the loop and the comprehension build the same list
PASS: list comprehensions: names, rupees, low stock
PASS: dict and set comprehensions: price_of, sellers, stock value
PASS: the exercise really shows the bug (empty shelf: 500 is not ₹500)
PASS: solution: 50000 paise gives Masala Box and Steel Water Bottle
PASS: deeper.py: if/else inside, sum/any/all, two fors
PASS: mistakes/: if/else in the wrong place; the loop name doesn't exist outside
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/under_500.py`.

## Stuck?

- **`ModuleNotFoundError: No module named 'catalog_data'`**: you moved or renamed `catalog_data.py`. It must sit in the same folder as the program.
- **`SyntaxError: invalid syntax` near `else`**: a filter `if` can't have an `else`. See the lesson's Going-deeper box for `a if cond else b`.
- **An empty list `[]`**: the condition is never True. Check the units (paise!) and `<` vs `>`.

## Clean up

```bash
docker compose down
```
