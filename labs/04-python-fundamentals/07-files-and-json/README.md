# Lab 04-07: Bazaar remembers (files and JSON)

**Goal:** write and read a text file, save Bazaar's catalog as JSON and load it back, load a missing or broken cart safely,
meet three file mistakes, and fix Asha's cart so it's saved as real JSON.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to look at the files the programs make.

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`. Every program writes into `data/`,
so you can open each file it makes in VS Code on your computer. (`data/` is kept out of Git.)

| Folder | What's inside |
| --- | --- |
| `examples/` | `text_file.py`, `json_text.py`, `save_catalog.py`, `safe_load.py`, `deeper.py` |
| `mistakes/` | `set_to_json.py`, `missing_file.py`, `w_erases.py` |
| `exercises/save_cart.py` | Asha's cart, which can't be loaded back |
| `solutions/save_cart.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

Run every command from `/lab` (where you start), because the programs use the relative path `data/...`.

## Task 1: A text file

```bash
python3 examples/text_file.py
cat data/orders.log
```

**Expected output:** the program prints the three lines, and `cat` shows the same three lines in the file.

```
Asha bought 2 Masala Box for ₹598
Ravi bought 1 Cotton Kurta for ₹649
Priya bought 1 Steel Water Bottle for ₹349
```

## Task 2: JSON is text

```bash
python3 examples/json_text.py
```

**Expected output:**

```
{"customer": "Ravi", "items": [["Cotton Kurta", 1]], "coupon": null, "gift": true}
str
{'customer': 'Ravi', 'items': [['Cotton Kurta', 1]], 'coupon': None, 'gift': True}
```

## Task 3: Save the catalog, load it back

```bash
python3 examples/save_catalog.py
cat data/catalog.json
```

**Expected output:**

```
Wireless Earbuds False
same data? True
[
  {
    "name": "Masala Box",
    "price_paise": 29900,
    "seller": "Patel Spices",
    "in_stock": true
  },
  {
    "name": "Wireless Earbuds",
    "price_paise": 149900,
    "seller": "Sharma Electronics",
    "in_stock": false
  }
]
```

Open `data/catalog.json` in VS Code too.

## Task 4: Missing and broken files

```bash
python3 examples/safe_load.py
```

**Expected output:**

```
{'items': []}
data/broken.json is broken (Expecting value: line 1 column 12 (char 11)); starting with an empty cart
{'items': []}
```

Look at `data/broken.json`: half a file, `{"items": [`.

## Task 5: Three file mistakes

```bash
python3 mistakes/set_to_json.py 2>&1 | tail -1
python3 mistakes/missing_file.py 2>&1 | tail -1
python3 examples/text_file.py > /dev/null
python3 mistakes/w_erases.py
```

**Expected output:**

```
TypeError: Object of type set is not JSON serializable
FileNotFoundError: [Errno 2] No such file or directory: 'data/old_orders.log'
''
```

(`2>&1 | tail -1` shows just the last line of each traceback.) The last one: `orders.log` had three lines, and opening it with `"w"` emptied it, with no error at all.

## Task 6: Fix Asha's cart

```bash
python3 exercises/save_cart.py 2>&1 | tail -1
cat data/asha_cart.json
```

```
json.decoder.JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)
{'customer': 'Asha', 'items': [{'name': 'Masala Box', 'price_paise': 29900, 'quantity': 2}, {'name': 'Cotton Kurta', 'price_paise': 64900, 'quantity': 1}]}
```

Single quotes: that's not JSON. Change the line that writes the file so it writes real JSON. When it's right:

```
Asha's cart: ₹1,247
```

and `data/asha_cart.json` uses double quotes. Compare with `python3 solutions/save_cart.py`.

## Task 7 (optional, Going deeper)

```bash
python3 examples/deeper.py
```

**Expected output:**

```
deeper.log True Masala Box restocked: 40
"₹299" "₹299"
asha_cart_safe.json Asha False
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: text_file.py: write, append, read back (with ₹)
PASS: save_catalog.py: json.dump then json.load gives the same data
PASS: data/catalog.json is real JSON text (true/false, indented)
PASS: json_text.py: dumps/loads; None→null, True→true, tuple→list
PASS: safe_load.py: missing file and broken file both handled
PASS: the exercise really crashes (str(cart) isn't JSON)
PASS: solution: json.dump → Asha's cart ₹1,247
PASS: deeper.py: pathlib, ensure_ascii, safe save with os.replace
PASS: mistakes/: a set isn't JSON; a missing file
PASS: mistakes/w_erases.py: opening with "w" empties the file, silently
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/save_cart.py`.

## Stuck?

- **`FileNotFoundError: [Errno 2] No such file or directory: 'data/…'`**: you're not in `/lab`. Run `cd /lab`.
- **`JSONDecodeError: Expecting property name enclosed in double quotes`**: the file was written with `str()`, not `json.dump()`.
- **`TypeError: Object of type set is not JSON serializable`**: turn the set into a list first: `sorted(my_set)`.
- **A file is suddenly empty**: something opened it with `"w"`. Use `"a"` to add, or no mode to read.

## Clean up

```bash
docker compose down
```
