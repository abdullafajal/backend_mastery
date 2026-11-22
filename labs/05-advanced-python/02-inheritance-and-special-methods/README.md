# Lab 05-02: The Bazaar Gift Card

**Goal:** build `GiftCard` on top of `Product`, see which methods it overrides and which it inherits, make products work with
`print()`, `==`, `sorted()` and `len()`, meet three mistakes, and fix a gift card whose parent setup never runs.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`.

| Folder | What's inside |
| --- | --- |
| `examples/` | `inheritance.py`, `special_methods.py`, `deeper.py` |
| `mistakes/` | `override_typo.py`, `no_eq.py`, `no_lt.py` |
| `exercises/gift_card.py` | a gift card that crashes; you fix it |
| `solutions/gift_card.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: Inheritance

```bash
python3 examples/inheritance.py
```

**Expected output:**

```
Masala Box (₹299), delivered
Bazaar Gift Card (₹500), sent by email
True True
₹500
```

Try: delete `GiftCard`'s `needs_delivery` method and run it again. The gift card is now "delivered". Undo it.

## Task 2: Special methods

```bash
python3 examples/special_methods.py
```

**Expected output:**

```
Masala Box - ₹299
[Product('Masala Box', 29900), Product('Steel Water Bottle', 34900)]
True
[Product('Masala Box', 29900), Product('Steel Water Bottle', 34900), Product('Wireless Earbuds', 149900)]
items in cart: 3
```

## Task 3: Three mistakes

```bash
python3 mistakes/override_typo.py
python3 mistakes/no_eq.py
python3 mistakes/no_lt.py 2>&1 | tail -1
```

**Expected output:**

```
gift card needs delivery? True
False
TypeError: '<' not supported between instances of 'Product' and 'Product'
```

The first two give no error at all, just a wrong answer. Fix the typo in `override_typo.py` (`needs_delivary` → `needs_delivery`) and run it: `False`. Then undo it.

## Task 4: Fix the gift card

```bash
python3 exercises/gift_card.py 2>&1 | tail -1
```

```
AttributeError: 'GiftCard' object has no attribute 'name'
```

Make `GiftCard.__init__` run `Product`'s setup first, with the name `"Bazaar Gift Card"` and the seller `"Bazaar"`. When it's right:

```
Bazaar Gift Card (₹500) from Bazaar, sent by email
to: priya@example.com
```

Compare with `python3 solutions/gift_card.py`.

## Task 5 (optional, Going deeper)

```bash
python3 examples/deeper.py
```

**Expected output:**

```
['GiftCard', 'Product', 'object']
299
AttributeError: property 'price_rupees' of 'Product' object has no setter
TypeError: unhashable type: 'Product'
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: inheritance.py: GiftCard overrides needs_delivery, inherits the rest
PASS: special_methods.py: __str__, __repr__, __eq__, __lt__ (sorted), __len__
PASS: the exercise really crashes (no super().__init__, so no name)
PASS: solution: super().__init__ sets the shared parts
PASS: deeper.py: __mro__, a read-only property, __eq__ removes __hash__
PASS: mistakes/override_typo.py: a misspelled override silently keeps the parent's method
PASS: mistakes/no_eq.py: without __eq__, two equal products aren't ==
PASS: mistakes/no_lt.py: without __lt__, sorted() fails
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so undo your edits to `examples/` and `mistakes/` first. It doesn't grade `exercises/gift_card.py`.

## Stuck?

- **`AttributeError: '…' object has no attribute '…'`** in a child class: its `__init__` didn't call `super().__init__(...)`.
- **The child behaves like the parent**: the overriding method's name doesn't match exactly.
- **`TypeError: '<' not supported between instances`**: define `__lt__` to sort your objects.

## Clean up

```bash
docker compose down
```
