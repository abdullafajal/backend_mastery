# Variables and types

<div class="bz-meta" markdown>
**Module** 4 · Python fundamentals
**Lesson** 1
**Reading time** 15 min (+ optional deeper parts)
**You will build** Ravi's invoice with 18% GST, first with a real float bug, then fixed with integer paise
</div>

!!! abstract "In 1 minute"
    - A **variable** is a name you stick on a value: `price_paise = 29900`. Later you use the name instead of the value.
    - Every value has a **type**: text is `str`, whole numbers are `int`, decimal numbers are `float`, yes/no is `bool`, "nothing yet" is `None`.
    - The type decides what you can do: `29900 * 3` is maths, but `"3" * 3` is `"333"`. What a customer types is always text; `int("3")` turns it into a number.
    - **Bazaar's most important rule:** money is never a `float`. `649 * 1.18` gives `765.8199999999999`. Store money as whole **paise** in an `int`.
    - `f"₹{price}"` (an **f-string**) puts values inside text, for printing.

> **Previously in Bazaar:** the code is on GitHub, and every change is reviewed through a pull request.

## 1. Why learn this?

A customer complained: her bill showed a total of **₹1,531.6399999999999**. Another day, a coupon check said `total == 765.82` was `False`, though the total looked like 765.82.

Both bugs come from one thing: how Python stores numbers. Before Bazaar can grow into a real shop, its code must handle **types**, and especially money, correctly.

This module turns Bazaar's code into clean Python. The first step is the simplest one: values, names and types.

## 2. The concept

### Trying Python: the REPL

Type `python3` in a terminal. You get the **REPL**: a prompt `>>>` where you type one line, and Python answers at once.

```
>>> 29900 // 100
299
>>> type(29900)
<class 'int'>
```

Perfect for trying things. To leave, type `exit()` or press `Ctrl+D`. For real programs, you write a `.py` file and run `python3 file.py`.

### Variables: names for values

```python
product = "Masala Box"
price_paise = 29900
```

- `=` means "**stick this name on this value**". It's not "equals" from maths.
- Later, `price_paise` means 29900: `price_paise * 3` gives `89700`.
- Names use lowercase words joined by `_`: `price_paise`, `in_stock`. They can't start with a number, and `Price` and `price` are **different** names.

You met the deeper idea in Module 1: a variable is a **name that points to an object** in memory. Assigning again moves the name:

```python title="names.py"
--8<-- "labs/04-python-fundamentals/01-variables-and-types/examples/names.py"
```

```
price:     899
old_price: 999
same object? False
```

### The five basic types

| Type | What it holds | Bazaar example |
| --- | --- | --- |
| `str` | text, in quotes | `"Masala Box"` |
| `int` | a whole number | `29900` (paise) |
| `float` | a number with a decimal point | `4.5` (a star rating) |
| `bool` | `True` or `False` | `in_stock = True` |
| `None` | "no value yet" | `discount_code = None` |

`type(x)` tells you the type of any value:

```python title="types_tour.py"
--8<-- "labs/04-python-fundamentals/01-variables-and-types/examples/types_tour.py"
```

```
'Masala Box'   type: str
29900          type: int
True           type: bool
4.5            type: float
None           type: NoneType
```

### The type decides what works

The same `*` does different things for different types:

```
>>> 29900 * 3
89700
>>> "3" * 3
'333'
```

And some things don't work at all. Python stops with an error that names the problem:

```
>>> "Price: ₹" + 299
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    "Price: ₹" + 299
    ~~~~~~~~~~~^~~~~
TypeError: can only concatenate str (not "int") to str
```

Read the **last line** first: you can't join (concatenate) text and a number with `+`.

### Converting between types

Anything a customer types into a form, or that comes from a file, arrives as **text**. Convert it before doing maths:

| Function | Turns | Example |
| --- | --- | --- |
| `int(x)` | text into a whole number | `int("3")` → `3` |
| `str(x)` | anything into text | `str(299)` → `"299"` |
| `float(x)` | text into a decimal number | `float("4.5")` → `4.5` |

If the text isn't a number, you get an error, not a wrong answer:

```
>>> int("three")
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    int("three")
    ~~~^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'three'
```

A whole cart line, with the conversion:

```python title="cart_line.py"
--8<-- "labs/04-python-fundamentals/01-variables-and-types/examples/cart_line.py"
```

```
Cotton Kurta x 3 = ₹1,947
type of quantity_text: str
type of quantity:      int
'3' * 3 = 333
```

### f-strings: values inside text

Put an `f` before the quotes, and anything inside `{ }` is replaced by its value:

```python
name = "Cotton Kurta"
print(f"{name} costs ₹{64900 // 100}")      # Cotton Kurta costs ₹649
```

Two handy extras inside the braces: `{n:,}` adds commas (`1,947`), and `{n:02d}` pads with zeros to 2 digits (`5` → `05`).

### Money: never `float`

Here's the bug from part 1. 18% GST on a ₹649 Cotton Kurta:

```python title="money_bug.py"
--8<-- "labs/04-python-fundamentals/01-variables-and-types/examples/money_bug.py"
```

```
float total: 765.8199999999999
equals 765.82? False
paise total: 76582
shown to the customer: ₹765.82
```

Why? A `float` stores numbers in **binary** (base 2). Most decimal fractions, like 0.18 or 0.1, can't be stored exactly in binary,
just as 1/3 can't be written exactly in decimal (0.3333…). The tiny error shows up in totals and breaks `==` checks.

**The fix Bazaar uses everywhere:** keep every amount as a whole number of **paise** in an `int`.

- `int` maths is always exact: `64900 * 18 // 100` is exactly `11682`.
- `//` is whole-number division: `29900 // 100` = `299`. `%` gives the remainder: `29900 % 100` = `0`.
- Turn paise into rupees **only when printing**: `f"₹{p // 100:,}.{p % 100:02d}"`.

### An analogy

Variables are **price tags** on items in a shop.

- `price = 999` sticks a tag saying "price" on the box marked 999.
- `price = 899` moves the tag to another box. The 999 box is still there, unchanged.
- The **type** is what the item is: you can weigh rice (numbers), but you can't weigh a label (text).

### Questions you may have

**Do I need to say the type when I make a variable?** No. Python works it out from the value. (Going deeper shows type hints, which are optional notes.)

**Why `price_paise` and not just `price`?** So nobody ever wonders "rupees or paise?". The name says the unit.

**When is `float` fine?** For things that aren't money and don't need exact equality: a 4.5-star rating, a distance, a percentage on a chart.

**Is `True` a string?** No. `True` (no quotes) is a `bool`. `"True"` (with quotes) is a `str`.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="name-tags"></div>

## 4. Code example

Ravi's invoice: the exercise you'll fix in the lab. First, the buggy version, with money as `float`:

```python title="exercises/invoice.py"
--8<-- "labs/04-python-fundamentals/01-variables-and-types/exercises/invoice.py"
```

```
Customer: Ravi
Subtotal: 1298.0
GST 18%:  233.64
Total:    1531.6399999999999
```

The fixed version, with paise:

```python title="solutions/invoice.py"
--8<-- "labs/04-python-fundamentals/01-variables-and-types/solutions/invoice.py"
```

```
Customer: Ravi
Subtotal: ₹1,298.00
GST 18%:  ₹233.64
Total:    ₹1,531.64
```

## 5. Under the hood

### Reading an error message

```
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    "Price: ₹" + 299
    ~~~~~~~~~~~^~~~~
TypeError: can only concatenate str (not "int") to str
```

- **Last line:** the error's type (`TypeError`) and what went wrong.
- **Lines above:** where it happened (file, line number), with `~~~^~~~` pointing at the exact part.
- In a file, it says `File "invoice.py", line 7` instead of `<stdin>`.

### A typo in a name

```
>>> price = 999
>>> Price
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    Price
NameError: name 'Price' is not defined. Did you mean: 'price'?
```

Python cares about capital letters, and it even suggests the name you probably meant.

??? note "Going deeper: Decimal, and rounding paise"

    Sometimes an amount really has fractions of a paisa, for example 18% GST on ₹0.99. Paise in `int` can't hold that, so you
    must decide **how to round**. Python's `decimal` module does exact decimal maths with the rounding rule you choose:

    ```python
    from decimal import Decimal, ROUND_HALF_UP
    gst = (Decimal("0.99") * Decimal("0.18")).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)   # Decimal('0.18')
    ```

    Always build a `Decimal` from **text** (`Decimal("0.18")`), never from a float (`Decimal(0.18)` carries the float's error inside).
    Django's money fields use `Decimal` (Module 8). Bazaar's rule: `int` paise for amounts, `Decimal` where a rate must be rounded.

    `round(2.675, 2)` gives `2.67`, not `2.68`: the float `2.675` is really a bit less than 2.675. Another reason to avoid floats for money.

??? note "Going deeper: dynamic typing and type hints"

    Python is **dynamically typed**: the **value** has a type, the **name** doesn't. The same name can point to an `int` now and a `str` later:

    ```python
    x = 29900
    x = "Masala Box"     # allowed (but confusing; don't do this in real code)
    ```

    **Type hints** are optional notes saying what type a name should hold:

    ```python
    price_paise: int = 29900
    ```

    Python itself ignores them when running. Tools like `mypy` and your editor read them and warn you before the code runs. Module 5 covers them.

??? note "Going deeper: identity, is vs ==, and immutability"

    - `==` asks "same **value**?". `is` asks "same **object**?" (`id()` is the object's identity number).
    - Use `is` only with `None`: `if discount_code is None:`. For values, always `==`.
    - `int`, `float`, `str`, `bool` and `None` are **immutable**: an object of these types never changes. Every "change" makes a new object
      and moves the name, as in the `price = 899` example. Lists and dicts (Lesson 4) are **mutable**, and that's where two names for the
      same object start to matter.
    - CPython reuses small ints (-5 to 256) and some strings, so `a is b` can be `True` for equal small values by accident. Never rely on it.

## 6. Lab

**Lab folder:** `labs/04-python-fundamentals/01-variables-and-types/`

```bash
cd labs/04-python-fundamentals/01-variables-and-types
docker compose run --rm python
```

You're in `/lab`, inside Python 3.13. The lab folder is shared with your computer, so you can edit files in VS Code and run them here.
Explore types in the REPL, run the four examples, see the float bug, then fix `exercises/invoice.py` so Ravi's total is exactly `₹1,531.64`.
`solutions/invoice.py` has one answer; try on your own first.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Money as `float`.** `1531.6399999999999` on a bill, and `==` checks that fail. **Fix:** whole paise in an `int`; rupees only when printing.
2. **Maths on text.** `"3" * 3` is `"333"`, and `"3" + 1` is a `TypeError`. **Fix:** convert input first: `int(quantity_text)`.
3. **`/` when you wanted whole numbers.** `29900 / 100` is `299.0`, a float. **Fix:** `//` for whole-number division, `%` for the remainder.
4. **Capital letters.** `Price` isn't `price`: `NameError`. **Fix:** lowercase names with `_`, and read Python's "Did you mean" hint.
5. **Names that hide the unit.** `price = 299` (rupees?) next to `total = 89700` (paise?). **Fix:** `price_paise`, `total_paise`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m04-01"></div>

## 9. What's next

Next: making decisions and repeating work: free delivery `if` the cart is big enough, `for` every item in the cart. [Control flow](02-control-flow.md).

**In one line:** a variable is a name on a value; every value has a type (`str`, `int`, `float`, `bool`, `None`) that decides what works;
convert text with `int()`, print with f-strings, and keep money in `int` paise, never `float`.

### Cheat sheet

| Task | Code |
| --- | --- |
| Make a variable | `price_paise = 29900` |
| What type is it? | `type(price_paise)` |
| Text → number | `int("3")`, `float("4.5")` |
| Anything → text | `str(299)` |
| Value inside text | `f"{name} costs ₹{price_paise // 100:,}"` |
| Whole-number division / remainder | `29900 // 100` → `299` / `29900 % 100` → `0` |
| Paise → "₹1,531.64" | `f"₹{p // 100:,}.{p % 100:02d}"` |
| Try one line | `python3`, then type at `>>>` (`exit()` to leave) |

| Type | Example | Use in Bazaar |
| --- | --- | --- |
| `str` | `"Masala Box"` | names, text |
| `int` | `29900` | money (paise), counts |
| `float` | `4.5` | ratings (never money) |
| `bool` | `True` | in stock? |
| `None` | `None` | not set yet |

> **Next in Bazaar:** Ravi's cart has many items, and delivery is free only above ₹999. The code must **decide** and **repeat**.
> Next lesson: `if`, `for` and `while`.

<div class="bz-complete" data-lesson="m04-01"></div>
