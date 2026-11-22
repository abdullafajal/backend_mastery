# Control flow

<div class="bz-meta" markdown>
**Module** 4 · Python fundamentals
**Lesson** 2
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's delivery and coupon rules with `if`, Ravi's cart total with a `for` loop, and a stock counter with `while`
</div>

!!! abstract "In 1 minute"
    - Normally Python runs lines from top to bottom, once each. **Control flow** changes that: skip some lines, or repeat them.
    - `if` / `elif` / `else` **decide**: "if the cart is ₹999 or more, delivery is free; else ₹49". Exactly one block runs.
    - `for` **repeats once per item**: "for every item in Ravi's cart, add its price to the total".
    - `while` **repeats as long as something is true**: "while there's stock, keep selling".
    - The lines that belong to an `if` or a loop are **indented** (4 spaces). The indentation is how Python knows where a block ends.

> **Previously in Bazaar:** you learned values, names and types, and why money is always whole paise in an `int`.

## 1. Why learn this?

Bazaar's rules are full of decisions and repetition:

- Delivery is **free if** the cart is ₹999 or more, **otherwise** ₹49.
- The DIWALI150 coupon gives ₹150 off, **but only if** the cart is at least ₹500.
- A cart total means: **for each** item, add price × quantity.

Last lesson, every program ran straight down, line by line. That can't express "if" or "for each". This lesson can.

## 2. The concept

### `if` and `else`: choose one path

```python
if cart_total >= 99900:          # the condition: True or False?
    message = "free"             # runs only if True
else:
    message = "₹49"              # runs only if False
```

Read it out loud: "**if** the cart total is at least 99900 paise, delivery is free; **else**, ₹49."

- The line ends with a colon `:`.
- The block under it is **indented** by 4 spaces. That's how Python knows which lines belong to the `if`.
- Exactly **one** of the two blocks runs. Then Python continues after the whole `if / else`.

Here it is on four carts:

```python title="delivery.py"
--8<-- "labs/04-python-fundamentals/02-control-flow/examples/delivery.py"
```

```
Cart ₹299: delivery ₹49
Cart ₹998: delivery ₹49
Cart ₹999: delivery free
Cart ₹1,499: delivery free
```

Look at ₹999: it's free, because `>=` means "greater than **or equal**". With `>`, exactly ₹999 would pay ₹49. Always test the exact border value.

### Comparing values

A condition is anything that is `True` or `False`. These **comparison operators** make one:

| Operator | Means | Example (`cart_total = 99900`) |
| --- | --- | --- |
| `==` | equal | `cart_total == 99900` → `True` |
| `!=` | not equal | `cart_total != 0` → `True` |
| `>` `<` | more / less than | `cart_total > 99900` → `False` |
| `>=` `<=` | at least / at most | `cart_total >= 99900` → `True` |

**Careful:** `=` gives a name to a value; `==` asks "are these equal?". In an `if`, it's always `==`.

### `elif`: more than two paths

`elif` means "else, if…". Python checks the conditions **from top to bottom** and runs the **first** block whose condition is `True`. The rest are skipped.

```python title="coupon.py"
--8<-- "labs/04-python-fundamentals/02-control-flow/examples/coupon.py"
```

| `code` | `cart_total` | Prints |
| --- | --- | --- |
| `"DIWALI150"` | `64900` | `₹150 off` |
| `"DIWALI150"` | `29900` | `DIWALI150 needs a cart of ₹500 or more` |
| `"FREEDELIVERY"` | `29900` | `free delivery` |
| `""` | `29900` | `no coupon` |
| `"diwali150"` | `64900` | `unknown coupon` (capital letters matter) |

### `and`, `or`, `not`

- `A and B`: True only if **both** are True. (Right code **and** a big enough cart.)
- `A or B`: True if **at least one** is True. (`FREESHIP` **or** `FREEDELIVERY`.)
- `not A`: flips True and False. Empty text `""`, `0` and `None` count as False, so `not code` means "no code given".

### `for`: once per item

Ravi's cart has three items. A `for` loop runs its block once for each:

```python title="cart_total.py"
--8<-- "labs/04-python-fundamentals/02-control-flow/examples/cart_total.py"
```

```
Cotton Kurta         x1  ₹  649
Masala Box           x2  ₹  598
Steel Water Bottle   x1  ₹  349
Total                    ₹1,596
```

How it works, step by step:

1. `cart` is a **list**: several values, in order, inside `[ ]`. Here, each value is one item: (name, price, quantity). Lesson 4 covers lists properly.
2. `for name, price, quantity in cart:` takes the first item and gives its three parts the names `name`, `price`, `quantity`.
3. The indented block runs with those values. Then the loop takes the next item, and so on.
4. When there are no items left, the loop ends. The next line **without** indentation (the `Total` print) runs once.

`total = 0` comes **before** the loop, so it starts at zero once. `total += line` means "add `line` to `total`", every round.

### `while`: repeat while something is true

`while` checks its condition before every round. When it becomes False, the loop stops.

```python title="stock.py (part 1)"
--8<-- "labs/04-python-fundamentals/02-control-flow/examples/stock.py:4:8"
```

```
Sold one Masala Box. 2 left.
Sold one Masala Box. 1 left.
Sold one Masala Box. 0 left.
Out of stock!
```

Use `for` when you have a collection to walk through (a cart, a list of orders). Use `while` when you repeat **until something changes** (stock runs out).
Something inside a `while` must change its condition; otherwise it never stops.

### `continue` and `break`

Inside any loop:

- `continue` = "skip the rest of this round, go to the next one".
- `break` = "stop the whole loop now".

```python title="stock.py (part 2)"
--8<-- "labs/04-python-fundamentals/02-control-flow/examples/stock.py:11:20"
```

```
Sold 2. 3 left.
Wants 4, only 3 left: refused.
Sold 2. 1 left.
Sold 1. 0 left.
Sold out. Closing orders.
```

The last customer (who wanted 3) is never even looked at: `break` ended the loop first.

### An analogy

A shop's billing counter:

- `if / else`: the cashier checks one thing and picks one action. "Bill ₹999 or more? No delivery fee. Otherwise, add ₹49."
- `for`: the cashier scans **every item** in the basket, one by one, adding each to the bill.
- `while`: the shop keeps selling **while** there's stock on the shelf.
- `break`: "Shop's closing!" Everyone still in the queue goes home.

### Questions you may have

**Why do spaces matter so much in Python?** Other languages use `{ }` to mark a block; Python uses indentation. Use 4 spaces (VS Code does it when you press Tab).

**What if no condition is True and there's no `else`?** Then no block runs, and Python simply continues after the `if`.

**Can I put an `if` inside a `for`?** Yes, and you will all the time: the stock example does exactly that. Each level adds 4 more spaces.

## 3. See it in action

Pick a situation, then press **Play**. In **if / else**, type a cart total (try 998, 999 and 1499).

<div class="bz-diagram" data-diagram="control-flow"></div>

## 4. Code example

Ravi's checkout: the exercise you'll fix in the lab. It runs without any error, but the answer is wrong:

```python title="exercises/checkout.py"
--8<-- "labs/04-python-fundamentals/02-control-flow/exercises/checkout.py"
```

```
Subtotal: ₹349
Delivery: ₹49
Total:    ₹398
```

₹349 is just the Steel Water Bottle, the **last** item. The loop **replaces** the subtotal each round instead of adding to it. The fix is one character:

```python title="solutions/checkout.py (line 11)"
--8<-- "labs/04-python-fundamentals/02-control-flow/solutions/checkout.py:11:11"
```

```
Subtotal: ₹1,596
Delivery: free
Total:    ₹1,596
```

One wrong character changed both the subtotal **and** the delivery decision. That's why you always check a program's answer, not just that it runs.

## 5. Under the hood

### Three errors you'll meet this week

Python checks the whole file **before** running it. These mistakes stop it before line 1 runs. They're in the lab's `mistakes/` folder.

**Forgot the colon:**

```
  File "/lab/mistakes/no_colon.py", line 2
    if cart_total >= 99900
                          ^
SyntaxError: expected ':'
```

**Forgot to indent:**

```
  File "/lab/mistakes/no_indent.py", line 3
    print("free delivery")
    ^^^^^
IndentationError: expected an indented block after 'if' statement on line 2
```

**`=` instead of `==`:**

```
  File "/lab/mistakes/one_equals.py", line 2
    if code = "DIWALI150":
       ^^^^^^^^^^^^^^^^^^
SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?
```

Each message gives the file, the line number, a `^` under the problem, and often the fix.

??? note "Going deeper: truthiness and short-circuiting"

    Any value can be used as a condition. These count as **False** ("falsy"): `False`, `None`, `0`, `""` (empty text), and empty
    collections like `[]` and `{}`. Everything else is **True** ("truthy"). So `if cart:` means "if the cart isn't empty".

    `and` and `or` stop as soon as they know the answer (**short-circuit**):

    - In `A and B`, if `A` is False, `B` isn't even evaluated.
    - In `A or B`, if `A` is True, `B` isn't evaluated.

    That makes this safe: `if quantity != 0 and total // quantity > 50000:`. When `quantity` is 0, the division never runs.

??? note "Going deeper: range, enumerate, and loop else"

    - `for i in range(3):` gives `0, 1, 2`. `range(1, 4)` gives `1, 2, 3`. Handy for "do this N times".
    - `for number, item in enumerate(cart, start=1):` gives each item **and** its position: `1, ("Cotton Kurta", 64900, 1)`, and so on.
    - A loop can have an `else:` block that runs only if the loop ended **without** `break`. Rarely needed; many people find it confusing.
    - `match` / `case` (Python 3.10+) can replace long `if / elif` chains that compare one value against many fixed options.

??? note "Going deeper: the one-line if (conditional expression)"

    ```python
    delivery_text = "free" if delivery == 0 else "₹49"
    ```

    This picks one of two **values** in a single line. Good for short, simple choices. For anything with more than two outcomes, or
    with side effects (like printing), use a normal `if` block: it's easier to read.

## 6. Lab

**Lab folder:** `labs/04-python-fundamentals/02-control-flow/`

```bash
cd labs/04-python-fundamentals/02-control-flow
docker compose run --rm python
```

Run the four examples, change the coupon code and the cart totals to see different paths, meet the three classic errors in `mistakes/`,
and fix the one-character bug in `exercises/checkout.py` so Ravi's subtotal is `₹1,596` with free delivery.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`>` instead of `>=` at the border.** A ₹999 cart pays delivery. **Fix:** test the exact border value (998, 999, 1000) every time.
2. **`=` instead of `+=` in a loop.** Only the last item counts. **Fix:** `total += …`, and start `total = 0` **before** the loop.
3. **Wrong indentation.** A line meant for the loop runs only once (or the other way round). **Fix:** check which lines are indented under the `for`.
4. **`=` in a condition.** `SyntaxError: … Maybe you meant '=='`. **Fix:** `==` to compare.
5. **A `while` that never ends.** The condition never becomes False. **Fix:** make sure something inside changes it (`stock -= 1`). Press `Ctrl+C` to stop a stuck program.

## 8. Quiz

<div class="bz-quiz" data-quiz="m04-02"></div>

## 9. What's next

Next: giving a piece of code a name, so you can reuse it everywhere: [Functions](03-functions.md).

**In one line:** `if / elif / else` picks exactly one block, `for` runs a block once per item, `while` repeats while a condition is True,
`continue` skips a round, `break` stops the loop, and indentation decides which lines belong where.

### Cheat sheet

| Task | Code |
| --- | --- |
| Choose between two | `if total >= 99900:` … `else:` … |
| Choose among many | `if …:` … `elif …:` … `else:` … |
| Both / either / not | `a and b`, `a or b`, `not a` |
| Once per item | `for name, price, quantity in cart:` |
| N times | `for i in range(3):` |
| While something holds | `while stock > 0:` |
| Skip this round / stop the loop | `continue` / `break` |
| Add to a running total | `total += line` (start with `total = 0` before the loop) |

| Compare | Meaning |
| --- | --- |
| `==` / `!=` | equal / not equal |
| `>` / `<` | more / less than |
| `>=` / `<=` | at least / at most |

> **Next in Bazaar:** the delivery rule is now written in three different files. When the free-delivery limit changes for Diwali,
> someone will forget one of them. The fix: write the rule **once**, give it a name, and use it everywhere. That's a function.

<div class="bz-complete" data-lesson="m04-02"></div>
