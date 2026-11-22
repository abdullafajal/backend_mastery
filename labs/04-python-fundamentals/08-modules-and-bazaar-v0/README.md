# Lab 04-08: Modules, and Bazaar v0

**Goal:** use the standard library, see how `import` and `__name__` work, meet two import mistakes, fix a case-sensitive search,
and then use **Bazaar v0**: a command-line catalog in three modules, saved as JSON.

**Time:** about 30 minutes.

**You need:** Docker running. VS Code to read and edit the files.

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`.

| Folder | What's inside |
| --- | --- |
| `bazaar_v0/` | **Bazaar v0**: `main.py` (the command line), `catalog.py` (the rules), `money.py` (paise ↔ ₹), `data/` (the saved catalog) |
| `examples/` | `stdlib_tour.py`, `who_am_i.py`, `import_it.py` |
| `mistakes/` | `typo_import.py`, `shadow/` (a file called `json.py`) |
| `exercises/search.py` | a search that can't find "box" |
| `solutions/search.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: The standard library

```bash
python3 examples/stdlib_tour.py
```

**Expected output:**

```
average price: 759 rupees
delivery by: 2026-11-06
today's lucky coupon: DIWALI150
{"ok": true}
```

## Task 2: Running vs importing

```bash
python3 examples/who_am_i.py
python3 examples/import_it.py
```

**Expected output:**

```
who_am_i.py says its __name__ is '__main__'
I was run directly, so this part runs too.
who_am_i.py says its __name__ is 'who_am_i'
import_it.py is '__main__'
```

## Task 3: Two import mistakes

```bash
python3 mistakes/typo_import.py 2>&1 | tail -1
python3 mistakes/shadow/app.py 2>&1 | tail -1
```

**Expected output:**

```
ModuleNotFoundError: No module named 'mony'
AttributeError: module 'json' has no attribute 'dumps' (consider renaming '/lab/mistakes/shadow/json.py' since it has the same name as the standard library module named 'json' and prevents importing that standard library module)
```

## Task 4: Fix the search

```bash
python3 exercises/search.py
```

```
[]
[]
['Masala Box']
```

Make the search ignore capital letters. When it's right:

```
['Masala Box']
['Steel Water Bottle']
['Masala Box']
```

Compare with `python3 solutions/search.py`.

## Task 5: Bazaar v0

```bash
cd bazaar_v0
python3 money.py
python3 main.py list
```

**Expected output** (on a fresh lab):

```
₹1,531.64 29900 149950
No products.
```

Add Bazaar's five products (quotes keep several words together):

```bash
python3 main.py add "Red Running Shoes" 999 "Kumar Footwear"
python3 main.py add "Cotton Kurta" 649 "Meera Handloom"
python3 main.py add "Masala Box" 299 "Patel Spices"
python3 main.py add "Wireless Earbuds" 1,499 "Sharma Electronics"
python3 main.py add "Steel Water Bottle" 349.00 "Sharma Electronics"
python3 main.py list
```

**Expected output:**

```
Added Red Running Shoes at ₹999.00.
Added Cotton Kurta at ₹649.00.
Added Masala Box at ₹299.00.
Added Wireless Earbuds at ₹1,499.00.
Added Steel Water Bottle at ₹349.00.
Red Running Shoes       ₹999.00  Kumar Footwear
Cotton Kurta            ₹649.00  Meera Handloom
Masala Box              ₹299.00  Patel Spices
Wireless Earbuds      ₹1,499.00  Sharma Electronics
Steel Water Bottle      ₹349.00  Sharma Electronics
```

Open `bazaar_v0/data/catalog.json` in VS Code: the products are saved there, in paise.

## Task 6: Search and refusals

```bash
python3 main.py search box
python3 main.py search SHARMA
python3 main.py search gold
python3 main.py add "masala box" 299 "Patel Spices"; echo "exit code $?"
python3 main.py add "Gift Card" abc "Bazaar"
python3 main.py add "Gift Card" 0 "Bazaar"
```

**Expected output:**

```
Masala Box              ₹299.00  Patel Spices
Wireless Earbuds      ₹1,499.00  Sharma Electronics
Steel Water Bottle      ₹349.00  Sharma Electronics
No products.
Not added: 'masala box' is already in the catalog
exit code 1
Not added: not a price: 'abc'
Not added: the price must be more than ₹0
```

## Task 7: It remembers

Type `exit` to leave the container, start it again with `docker compose run --rm python`, then:

```bash
cd bazaar_v0
python3 main.py list
```

The five products are still there: they were saved to `data/catalog.json` on your computer.

To start over with an empty catalog: `rm data/catalog.json`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: money.py run directly: its __main__ self-test runs
PASS: an empty catalog (no file yet) lists 'No products.'
PASS: add: 5 products, prices typed as 999, 1,499 and 349.00
PASS: list: all 5 products, loaded back from the JSON file
PASS: search: by name or seller, ignoring capitals; no match → 'No products.'
PASS: add refuses duplicates, bad prices and ₹0 (exit code 1)
PASS: an unknown command prints the usage (exit code 2)
PASS: main.py works from any folder (imports and data path are next to main.py)
PASS: the catalog file holds 5 products in paise
PASS: stdlib_tour.py: statistics, datetime, random (seeded), json
PASS: import_it.py: an imported module has its own __name__, so its __main__ part is skipped
PASS: the exercise really shows the bug ("box" finds nothing)
PASS: solution: search ignores capital letters
PASS: mistakes/: a typo in an import; a file named json.py hides the real json
ALL CHECKS PASSED
```

The test uses a temporary catalog file (`BAZAAR_DATA=/tmp/catalog.json`), so **your** catalog in `bazaar_v0/data/` is never touched.
Undo your edits to `bazaar_v0/`, `examples/` and `mistakes/` first; it doesn't grade `exercises/search.py`.

## Stuck?

- **`ModuleNotFoundError: No module named 'catalog'`**: `catalog.py` must sit in the same folder as `main.py`.
- **`Not added: not a price: '…'`**: type the price as digits, like `299`, `1,499` or `349.50`.
- **`add` just prints the usage text**: a name with spaces wasn't in quotes, so `add Masala Box 299 Patel Spices` is 6 words, not 4.
  Write `add "Masala Box" 299 "Patel Spices"`.
- **`AttributeError: module 'json' has no attribute …`**: a file in your folder is called `json.py`. Rename it.

## Clean up

```bash
docker compose down
```
