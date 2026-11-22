# Lab 04-02: Decisions and loops for Bazaar

**Goal:** run Bazaar's delivery and coupon rules (`if` / `elif` / `else`), add up a cart (`for`), count stock down (`while`,
`continue`, `break`), meet the three classic errors, and fix a one-character bug in Ravi's checkout.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code to edit files (or `nano` inside the container).

## How this lab works

The container runs Python 3.13. This lab folder is shared with it as `/lab`, so you edit in VS Code and run in the container.

| Folder | What's inside |
| --- | --- |
| `examples/` | `delivery.py`, `coupon.py`, `cart_total.py`, `stock.py` |
| `mistakes/` | three tiny programs, each with one classic error |
| `exercises/checkout.py` | Ravi's checkout, with a bug for you to fix |
| `solutions/checkout.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

## Task 1: if / else

```bash
python3 examples/delivery.py
```

**Expected output:**

```
Cart ₹299: delivery ₹49
Cart ₹998: delivery ₹49
Cart ₹999: delivery free
Cart ₹1,499: delivery free
```

Now change `>=` to `>` in `examples/delivery.py` and run it again. Which cart changes? (₹999 now pays ₹49.) Change it back.

## Task 2: if / elif / else

```bash
python3 examples/coupon.py
```

**Expected output:** `₹150 off`

Edit the first two lines of `examples/coupon.py` and run it after each change:

| Set `code =` | Set `cart_total =` | Expected output |
| --- | --- | --- |
| `"DIWALI150"` | `29900` | `DIWALI150 needs a cart of ₹500 or more` |
| `"FREEDELIVERY"` | `29900` | `free delivery` |
| `""` | `29900` | `no coupon` |
| `"diwali150"` | `64900` | `unknown coupon` |

Put it back to `"DIWALI150"` and `64900` at the end.

## Task 3: for

```bash
python3 examples/cart_total.py
```

**Expected output:**

```
Cotton Kurta         x1  ₹  649
Masala Box           x2  ₹  598
Steel Water Bottle   x1  ₹  349
Total                    ₹1,596
```

Try: indent the last `print` line by 4 spaces, so it's inside the loop. Run it: the `Total` line now appears after every item. Undo it.

## Task 4: while, continue, break

```bash
python3 examples/stock.py
```

**Expected output:**

```
Sold one Masala Box. 2 left.
Sold one Masala Box. 1 left.
Sold one Masala Box. 0 left.
Out of stock!
Sold 2. 3 left.
Wants 4, only 3 left: refused.
Sold 2. 1 left.
Sold 1. 0 left.
Sold out. Closing orders.
```

## Task 5: Three classic errors

```bash
python3 mistakes/no_colon.py
python3 mistakes/no_indent.py
python3 mistakes/one_equals.py
```

**Expected output:**

```
  File "/lab/mistakes/no_colon.py", line 2
    if cart_total >= 99900
                          ^
SyntaxError: expected ':'
  File "/lab/mistakes/no_indent.py", line 3
    print("free delivery")
    ^^^^^
IndentationError: expected an indented block after 'if' statement on line 2
  File "/lab/mistakes/one_equals.py", line 2
    if code = "DIWALI150":
       ^^^^^^^^^^^^^^^^^^
SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?
```

Fix each file so it prints `free delivery` or `150 off`.

## Task 6: Fix Ravi's checkout

```bash
python3 exercises/checkout.py
```

```
Subtotal: ₹349
Delivery: ₹49
Total:    ₹398
```

That's wrong: Ravi's cart is worth ₹1,596. Find the one-character bug in the loop and fix it. When it's right:

```
Subtotal: ₹1,596
Delivery: free
Total:    ₹1,596
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
PASS: delivery.py: free from exactly ₹999 (>=), ₹49 below
PASS: coupon.py: if / elif / else with and, or, not (five codes)
PASS: cart_total.py: a for loop adds Ravi's cart to ₹1,596
PASS: stock.py: while stops at 0; continue skips, break stops (the last order is never seen)
PASS: the exercise really shows the bug (only the last item counted)
PASS: solution: subtotal ₹1,596 with free delivery
PASS: mistakes/: missing colon, missing indent, = instead of ==
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files, so **undo your edits** to `examples/` and `mistakes/` before running it
(or the checks for those files will fail). It does not grade `exercises/checkout.py`: compare your output with the expected output above.

## Stuck?

- **`IndentationError: expected an indented block`**: the line after a `:` must be indented by 4 spaces.
- **`SyntaxError: expected ':'`**: every `if`, `elif`, `else`, `for` and `while` line ends with `:`.
- **The program never stops**: a `while` condition never became False. Press `Ctrl+C`, then make sure the loop changes something (`stock -= 1`).
- **The total is only the last item**: `=` instead of `+=` inside the loop.

## Clean up

```bash
docker compose down
```
