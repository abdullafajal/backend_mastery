# Dataclasses and type hints

<div class="bz-meta" markdown>
**Module** 5 · Advanced Python
**Lesson** 3
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's Product, Cart and Coupon as dataclasses, and catch a wrong price type with mypy before the code ever runs
</div>

!!! abstract "In 1 minute"
    - `@dataclass` writes `__init__`, `__repr__` and `__eq__` for you. You only list the **fields**: `name: str`, `price_paise: int`.
    - `price_paise: int` is a **type hint**: a note saying "this should be an int". Python does **not** check it while running.
    - **mypy** is a tool that reads the hints **before** running and reports mistakes like passing `"299"` where an `int` is expected.
    - For a list field, use `field(default_factory=list)`: every object gets its own new list. A plain `= []` is refused.
    - `@dataclass(frozen=True)` makes objects that can't be changed after they're made, like a coupon.

> **Previously in Bazaar:** the gift card was built on top of `Product` with inheritance, and products learned to work with `==` and `sorted()`.

## 1. Why learn this?

Look at Lesson 1's `Product.__init__`: `self.name = name`, `self.price_paise = price_paise`, `self.seller = seller`, `self.stock = stock`.
Then `__repr__` lists the same four names again, and `__eq__` a third time. Add a field, and you must remember three places.

And nothing stops this: a form sends the price as text, `"299"`, and somewhere `price_paise * 2` quietly becomes `"299299"`.

Dataclasses remove the repetition. Type hints, checked by mypy, catch the wrong type on your laptop, before a customer ever sees it.
Django models and DRF serializers (Level 2) are built on these same ideas.

## 2. The concept

### `@dataclass`: list the fields, get the methods

```python title="before_after.py"
--8<-- "labs/05-advanced-python/03-dataclasses-and-type-hints/examples/before_after.py"
```

```
ProductByHand(name='Masala Box', price_paise=29900, seller='Patel Spices')
Product(name='Masala Box', price_paise=29900, seller='Patel Spices')
True
```

The two classes behave the same. The dataclass is a third of the code:

- `@dataclass` above the class turns it into a **dataclass**. (The `@` line is a decorator: Lesson 4 explains how it works.)
- Each line like `name: str` is a **field**: a name, a colon, and the type.
- From that list, `@dataclass` writes `__init__` (in the same order), `__repr__` and `__eq__` (same field values → equal).

### Defaults, lists, checks and frozen objects

```python title="dataclass_features.py"
--8<-- "labs/05-advanced-python/03-dataclasses-and-type-hints/examples/dataclass_features.py"
```

```
Product(name='Cotton Kurta', price_paise=64900, seller='Meera Handloom', stock=0)
[] ['Cotton Kurta']
Refused: price_paise must be a whole number above 0, not 'cheap'
Coupon(code='DIWALI150', discount_paise=15000)
```

| You write | It means |
| --- | --- |
| `stock: int = 0` | a default: `Product("Cotton Kurta", 64900, "Meera Handloom")` works without a stock |
| `lines: list = field(default_factory=list)` | call `list()` for **each** new cart: every cart gets its own empty list |
| `def __post_init__(self):` | runs right after the generated `__init__`: the place for your checks |
| `@dataclass(frozen=True)` | the object can't be changed after it's made |

Lesson 1's shared-cart bug can't happen here: Asha's list stays `[]` while Ravi's gets the kurta.

### Type hints: notes about types

You've been writing them in every field. They work on functions too:

```python
def line_total(price_paise: int, quantity: int) -> int:
```

Read it as: "`price_paise` should be an `int`, `quantity` should be an `int`, and the function returns an `int`".

Here's the surprise: Python **doesn't check** hints while running. They're only notes:

```python title="type_hints.py"
--8<-- "labs/05-advanced-python/03-dataclasses-and-type-hints/examples/type_hints.py"
```

```
59800
299299
```

`"299" * 2` repeated the text. No error, just a wrong price.

### mypy: checking the hints before running

**mypy** is a separate tool (installed in this lab's container). It reads your code and its hints, and **runs nothing**:

```
$ mypy examples/type_hints.py
examples/type_hints.py:9: error: Argument 1 to "line_total" has incompatible type "str"; expected "int"  [arg-type]
Found 1 error in 1 file (checked 1 source file)
```

The file name, the line number (9), and what's wrong. You fix it before the code ever reaches a customer.
When everything matches, mypy says `Success: no issues found in 1 source file`.

Editors do the same check as you type: VS Code's Python extension underlines the wrong argument in red.
Hints also make your editor's suggestions much better: it knows `product.` has `name`, `price_paise` and `seller`.

### An analogy

A dataclass is a **pre-printed form**: you decide the boxes (Name, Price, Seller), and the printing press makes the form, the copy for your records,
and the "compare two forms" checklist. You don't draw each one by hand.

Type hints are the **small print under each box**: "Price: whole number, in paise". The form doesn't enforce it, but **mypy** is the clerk who reads
every filled-in form before it's filed, and sends back the one that says "299" in words.

### Questions you may have

**Should every class be a dataclass?** Classes that mostly **hold data** (Product, Coupon, a cart line): yes. Classes that mostly **do things**, with
complex setup: a normal class is fine. You can still add methods to a dataclass.

**Do I need hints everywhere?** Start with function parameters and return values, and dataclass fields. That's where they catch the most bugs.

**If Python ignores hints, why not check types with `isinstance` everywhere?** Do that at the **edges**, where outside data comes in (a form, a file, an API),
as `__post_init__` does. Inside your own code, mypy checks every call at once, for free.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="dataclass-hints"></div>

## 4. Code example

The lab's exercise: Bazaar's Cart as a dataclass. Python refuses to even create the class:

```python title="exercises/cart.py"
--8<-- "labs/05-advanced-python/03-dataclasses-and-type-hints/exercises/cart.py"
```

The traceback is long (it comes from inside `dataclasses.py`); its last line says it all:

```
ValueError: mutable default <class 'list'> for field lines is not allowed: use default_factory
```

This is the dataclass **protecting** you from Lesson 1's shared-list bug: a list written as a default would be shared by every cart.
The fix does what the message says:

```python title="solutions/cart.py (lines 4-10)"
--8<-- "labs/05-advanced-python/03-dataclasses-and-type-hints/solutions/cart.py:4:10"
```

```
Asha: []
Ravi: [('Cotton Kurta', 1)]
```

And mypy agrees there are no type mistakes: `Success: no issues found in 1 source file`.

## 5. Under the hood

### Changing a frozen object

```
dataclasses.FrozenInstanceError: cannot assign to field 'discount_paise'
```

(`mistakes/frozen_change.py`.) Someone tried to raise the DIWALI150 coupon's discount after it was made. Frozen objects are safer to share:
nobody can change them behind your back.

### A field without a default after one with a default

```
TypeError: non-default argument 'seller' follows default argument 'stock'
```

(`mistakes/default_order.py`.) The generated `__init__` is `__init__(self, name, stock=0, seller)`, which isn't allowed, just like a normal function (Module 4).
**Fix:** put fields with defaults last.

### What mypy needs

mypy can only check what's hinted. Remove the hints from `line_total` and run mypy again: `Success: no issues found`, and the `"299"` bug slips through.
No hint, no check. (The lab's test does exactly this to prove the check is real.)

??? note "Going deeper: more hints, and dataclass options"

    ```python title="deeper.py"
    --8<-- "labs/05-advanced-python/03-dataclasses-and-type-hints/examples/deeper.py"
    ```

    ```
    ['Masala Box', 'Wireless Earbuds']
    Product(price_paise=29900, name='Masala Box', tags=['spices'])
    None
    25
    ```

    mypy: `Success: no issues found in 1 source file`.

    | Hint | Means |
    | --- | --- |
    | `list[str]` | a list of strings |
    | `dict[str, int]` | a dict from strings to ints |
    | `tuple[str, int]` | a pair: a string, then an int |
    | `Product | None` | a Product, or `None` (e.g. "not found") |

    `order=True` writes `<`, `>`, … comparing fields **in order**, so putting `price_paise` first sorts by price.
    Other options: `slots=True` (less memory per object), `kw_only=True` (every field must be passed by name).

??? note "Going deeper: checking data at run time"

    Hints + mypy check **your code**. Data from **outside** (a form, a JSON file, an API request) only exists while running, so it needs a run-time check.
    You did that by hand in `__post_init__`. Libraries like **pydantic** read the same hints and check (and convert) incoming data automatically.
    In Level 2, Django REST Framework's **serializers** play this role for Bazaar's API.

??? note "Going deeper: mypy settings"

    By default mypy skips functions with **no** hints at all (that's why removing them silenced it). In real projects, teams turn on stricter checks
    in a config file, for example `strict = true` under `[tool.mypy]` in `pyproject.toml` (Lesson 6), so un-hinted functions are reported too.
    Run mypy in CI (Module 24), so a pull request with a type error can't be merged.

## 6. Lab

**Lab folder:** `labs/05-advanced-python/03-dataclasses-and-type-hints/`

```bash
cd labs/05-advanced-python/03-dataclasses-and-type-hints
docker compose run --rm python
```

This lab's container also has mypy (version 2.4.1). Compare a hand-written class with a dataclass, try defaults, `default_factory`, `__post_init__` and
`frozen`, see Python run `"299" * 2` while mypy catches it, and fix the Cart dataclass that Python refuses to create.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`lines: list = []` in a dataclass.** `ValueError: mutable default … use default_factory`. **Fix:** `field(default_factory=list)`.
2. **Trusting hints at run time.** `"299"` gets through. **Fix:** run mypy (and your editor's checks); check outside data in `__post_init__`.
3. **A field with a default before one without.** `TypeError: non-default argument … follows default argument`. **Fix:** defaults last.
4. **Changing a frozen object.** `FrozenInstanceError`. **Fix:** make a new object instead (or don't freeze it, if it must change).
5. **No hints on a function.** mypy skips it silently. **Fix:** hint parameters and return values.

## 8. Quiz

<div class="bz-quiz" data-quiz="m05-03"></div>

## 9. What's next

Next: the `@` you've now seen three times (`@dataclass`, `@property`). How to write your own, to add timing, logging or retries to any function: [Decorators](04-decorators.md).

**In one line:** `@dataclass` writes `__init__`, `__repr__` and `__eq__` from typed fields; use `field(default_factory=list)` for lists and
`frozen=True` for things that must not change; type hints are notes that Python ignores while running, but mypy checks before running.

### Cheat sheet

| Task | Code |
| --- | --- |
| A data class | `@dataclass` + `class Product:` + `name: str` lines |
| A default | `stock: int = 0` (after fields without defaults) |
| A fresh list each time | `lines: list = field(default_factory=list)` |
| Check after setup | `def __post_init__(self): …` |
| Can't be changed | `@dataclass(frozen=True)` |
| Hint a function | `def line_total(price_paise: int, quantity: int) -> int:` |
| Maybe nothing | `-> Product | None` |
| Check the hints | `mypy file.py` |

> **Next in Bazaar:** Bazaar wants to know how long each supplier's price request takes, and to retry when one fails.
> Adding timing code to every function would be copy-paste again. Decorators wrap any function with extra behaviour, in one line.

<div class="bz-complete" data-lesson="m05-03"></div>
