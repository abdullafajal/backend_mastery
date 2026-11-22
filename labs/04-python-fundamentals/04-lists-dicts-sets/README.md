# Lab 04-04: Bazaar's catalog, carts and sellers

**Goal:** use lists, dicts, sets and tuples on Bazaar's data, meet the three most common container errors,
and fix a bug where Priya's item shows up in Asha's cart.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`.

| Folder | What's inside |
| --- | --- |
| `examples/` | `lists.py`, `dicts.py`, `catalog.py`, `sets_and_tuples.py`, `aliasing.py` |
| `mistakes/` | `key_error.py`, `index_error.py`, `tuple_change.py` |
| `exercises/starter_cart.py` | the starter-cart bug for you to fix |
| `solutions/starter_cart.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: A list (Asha's cart)

```bash
python3 examples/lists.py
```

**Expected output:**

```
['Masala Box', 'Cotton Kurta', 'Steel Water Bottle']
items: 3
first: Masala Box
last:  Steel Water Bottle
Masala Box in cart? True
['Masala Box', 'Steel Water Bottle']
- Masala Box
- Steel Water Bottle
```

## Task 2: A dict (one product)

```bash
python3 examples/dicts.py
```

**Expected output:**

```
Masala Box
{'name': 'Masala Box', 'price_paise': 27900, 'seller': 'Patel Spices', 'stock': 40}
rating: None
rating: no ratings yet
has a seller? True
name         Masala Box
price_paise  27900
seller       Patel Spices
stock        40
```

## Task 3: The catalog (a list of dicts)

```bash
python3 examples/catalog.py
```

**Expected output:**

```
Red Running Shoes    ₹   999  stock  12
Cotton Kurta         ₹   649  stock  25
Masala Box           ₹   299  stock  40
Wireless Earbuds     ₹ 1,499  stock   8
Steel Water Bottle   ₹   349  stock  60
Cheapest: Masala Box
Search 'bottle' -> Steel Water Bottle
```

Try: change `word = "bottle"` to `"box"` and run it again (`Search 'box' -> Masala Box`). Then put it back.

## Task 4: A set and a tuple

```bash
python3 examples/sets_and_tuples.py
```

**Expected output:**

```
4 sellers
['Kumar Footwear', 'Meera Handloom', 'Patel Spices', 'Sharma Electronics']
Patel Spices sells here? True
Masala Box 59800
```

Five names went in, four came out: Sharma Electronics was added twice.

## Task 5: Two names, one list

```bash
python3 examples/aliasing.py
```

**Expected output:**

```
ashas_cart: ['Masala Box', 'Cotton Kurta']
ashas_cart: ['Masala Box', 'Cotton Kurta']
own_cart:   ['Masala Box', 'Cotton Kurta', 'Steel Water Bottle']
```

## Task 6: Three errors

```bash
python3 mistakes/key_error.py
python3 mistakes/index_error.py
python3 mistakes/tuple_change.py
```

**Expected output:**

```
Traceback (most recent call last):
  File "/lab/mistakes/key_error.py", line 2, in <module>
    print(product["prize_paise"])
          ~~~~~~~^^^^^^^^^^^^^^^
KeyError: 'prize_paise'
Traceback (most recent call last):
  File "/lab/mistakes/index_error.py", line 2, in <module>
    print(cart[2])
          ~~~~^^^
IndexError: list index out of range
Traceback (most recent call last):
  File "/lab/mistakes/tuple_change.py", line 2, in <module>
    line[2] = 3
    ~~~~^^^
TypeError: 'tuple' object does not support item assignment
```

## Task 7: Fix the starter cart

```bash
python3 exercises/starter_cart.py
```

```
Starter: ['Masala Box sample', 'Cotton Kurta']
Asha:    ['Masala Box sample', 'Cotton Kurta']
Priya:   ['Masala Box sample', 'Cotton Kurta']
```

Only Priya added the kurta. Change two lines so each customer gets her **own** list. When it's right:

```
Starter: ['Masala Box sample']
Asha:    ['Masala Box sample']
Priya:   ['Masala Box sample', 'Cotton Kurta']
```

Compare with `python3 solutions/starter_cart.py`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: lists.py: append, len, [0], [-1], in, remove, for
PASS: dicts.py: look up, change, add, .get, in, .items()
PASS: catalog.py: a list of dicts; cheapest product; search
PASS: sets_and_tuples.py: 5 names → 4 unique sellers; tuple unpacking
PASS: aliasing.py: two names, one list; .copy() makes a new one
PASS: the exercise really shows the bug (Asha got Priya's kurta)
PASS: solution: with .copy(), only Priya's cart changes
PASS: mistakes/: KeyError, IndexError, changing a tuple
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/starter_cart.py`.

## Stuck?

- **`KeyError: '…'`**: that key isn't in the dict. Check the spelling, or use `.get()`.
- **`IndexError: list index out of range`**: the last position is `len(cart) - 1`, or simply `cart[-1]`.
- **Everyone's cart changes together**: two names for one list. Use `.copy()`.
- **`TypeError: 'tuple' object does not support item assignment`**: tuples can't change. Use a list, or make a new tuple.

## Clean up

```bash
docker compose down
```
