# Comprehensions

<div class="bz-meta" markdown>
**Module** 4 · Python fundamentals
**Lesson** 5
**Reading time** 12 min (+ optional deeper parts)
**You will build** Bazaar's "Under ₹500" shelf, a price lookup dict and the set of sellers, each in one readable line
</div>

!!! abstract "In 1 minute"
    - A **comprehension** builds a new list (or dict, or set) from another collection, in one line.
    - `[p["name"] for p in catalog]` means "for each product `p` in the catalog, keep its name".
    - Add `if` to keep only some: `[p["name"] for p in catalog if p["price_paise"] < 50000]` gives the products under ₹500.
    - Same idea, other brackets: `{name: price for …}` builds a dict, `{seller for …}` builds a set.
    - Use one when it reads like a sentence. If it needs more than one `if`, or does something (like printing), write a normal loop.

> **Previously in Bazaar:** the catalog became a list of dicts, carts became lists, and sellers a set.

## 1. Why learn this?

Bazaar's Diwali home page needs several lists from the catalog: an "Under ₹500" shelf, all product names for the search box,
a quick price lookup, the list of sellers.

Each one, written as a loop, takes four lines: an empty list, a `for`, an `if`, an `append`. Four similar loops make the page code long, and the point gets lost.
A comprehension says the same thing in one line that reads almost like English.

## 2. The concept

### The same list, two ways

```python title="loop_vs_comprehension.py"
--8<-- "labs/04-python-fundamentals/05-comprehensions/examples/loop_vs_comprehension.py"
```

```
['Masala Box', 'Steel Water Bottle']
['Masala Box', 'Steel Water Bottle']
```

Both give the same list. Line up the parts:

| Loop | Comprehension |
| --- | --- |
| `cheap = []` | the `[ ]` brackets |
| `for p in catalog:` | `for p in catalog` |
| `if p["price_paise"] < 50000:` | `if p["price_paise"] < 50000` |
| `cheap.append(p["name"])` | `p["name"]`, written **first** |

The only surprise is the order: **what you keep comes first**. Read it as:
"a list of **`p["name"]`**, **for each** `p` in the catalog, **if** its price is under 50000 paise."

(`from catalog_data import catalog` loads the catalog from the file next to it. Lesson 8 explains imports; for now, read it as "load the catalog".)

### What you keep can be any expression

The first part can be any calculation, not just a value you already have:

```python title="list_comprehensions.py"
--8<-- "labs/04-python-fundamentals/05-comprehensions/examples/list_comprehensions.py"
```

```
['Red Running Shoes', 'Cotton Kurta', 'Masala Box', 'Wireless Earbuds', 'Steel Water Bottle']
[999, 649, 299, 1499, 349]
Reorder soon: ['Red Running Shoes', 'Wireless Earbuds']
```

- No `if`: every product gives one result. 5 products in, 5 results out.
- `p["price_paise"] // 100` turns each price into rupees.
- With `if`: only products with fewer than 20 in stock.

### Dicts and sets, too

Change the brackets, and you get other containers:

```python title="dict_and_set.py"
--8<-- "labs/04-python-fundamentals/05-comprehensions/examples/dict_and_set.py"
```

```
29900
['Kumar Footwear', 'Meera Handloom', 'Patel Spices', 'Sharma Electronics']
{'Cotton Kurta': 16225, 'Masala Box': 11960, 'Steel Water Bottle': 20940}
```

| Brackets | You write | You get |
| --- | --- | --- |
| `[ ]` | `[x for …]` | a list |
| `{ }` with `key: value` | `{k: v for …}` | a dict |
| `{ }` with one value | `{x for …}` | a set (repeats removed) |

`price_of` is very handy: instead of looping through the catalog every time, `price_of["Masala Box"]` finds the price in one step.

### When a normal loop is better

Comprehensions are for **building a collection**. They're not always the right tool:

| Use a comprehension | Use a normal loop |
| --- | --- |
| one `for`, at most one `if` | several conditions, `elif`, or nested loops |
| you want a new list, dict or set | you want to **do** something: print, save, send |
| it fits on one line and reads like a sentence | you need to explain steps with comments |

`[print(p) for p in catalog]` works, but it builds a useless list of `None`s. For printing, write `for p in catalog: print(p)`.

### An analogy

A comprehension is an **order slip** you hand to a shop assistant:

"From the catalog, bring me **the names** of **each product** **that costs under ₹500**."

You say **what you want**, **from where**, and **which ones**. The assistant does the walking up and down the shelves (the loop) for you.

### Questions you may have

**Is a comprehension faster than a loop?** A little, usually. But choose it for readability, not speed.

**Does it change the catalog?** No. It always builds a **new** collection. The catalog stays as it was.

**Why is it called a "comprehension"?** From maths, where you describe a set by a rule ("all x such that x < 500"). Don't worry about the name.

## 3. See it in action

Pick a situation, then press **Play**. In the first one, type a limit (try 500, 1000 and 5).

<div class="bz-diagram" data-diagram="comprehension"></div>

## 4. Code example

The lab's exercise: the "Under ₹500" shelf for the Diwali home page. It runs without error, but the shelf is empty:

```python title="exercises/under_500.py"
--8<-- "labs/04-python-fundamentals/05-comprehensions/exercises/under_500.py"
```

```
Under ₹500: []
```

Bazaar keeps money in **paise** (Lesson 1). `< 500` means "under ₹5", and nothing is that cheap. The fix:

```python title="solutions/under_500.py (line 6)"
--8<-- "labs/04-python-fundamentals/05-comprehensions/solutions/under_500.py:6:6"
```

```
Under ₹500: ['Masala Box', 'Steel Water Bottle']
```

An empty result is easy to miss on a busy page. When a list comes out empty, check the units first.

## 5. Under the hood

### `if … else` goes in a different place

A filter `if` goes **at the end**. If you add an `else` there, Python stops:

```
  File "/lab/mistakes/if_else_order.py", line 3
    labels = [p["name"] for p in catalog if p["price_paise"] < 50000 else "too costly"]
                                                                     ^^^^
SyntaxError: invalid syntax
```

An `if` at the end **skips** items; it can't have an `else`. To **choose a value** for every item, the `if … else` goes **before** the `for` (see Going deeper).

### The loop name stays inside

```
Traceback (most recent call last):
  File "/lab/mistakes/loop_name_outside.py", line 4, in <module>
    print(p)
          ^
NameError: name 'p' is not defined
```

The `p` in a comprehension exists only inside it. (A normal `for p in catalog:` loop is different: there, `p` still holds the **last** product after the loop.)

??? note "Going deeper: if/else inside, sum/any/all, and two fors"

    ```python title="deeper.py"
    --8<-- "labs/04-python-fundamentals/05-comprehensions/examples/deeper.py"
    ```

    ```
    ['too costly', 'too costly', 'Masala Box', 'too costly', 'Steel Water Bottle']
    stock worth ₹ 73105
    anything sold out? False
    every price set?   True
    ['Masala Box', 'Masala Box', 'Cotton Kurta']
    ```

    - `value_if_true if condition else value_if_false` **before** the `for` picks a value for **every** item. Nothing is skipped.
    - Without `[ ]`, inside `sum()`, `any()` or `all()`, it's a **generator expression**: values are made one at a time and never stored
      as a whole list. With millions of orders, that saves a lot of memory. Module 5 covers generators.
    - Two `for`s run like nested loops, the first `for` on the outside. Past two `for`s, write normal loops.

??? note "Going deeper: comprehensions in real Bazaar code"

    You'll see these shapes all the time later in the course:

    - Turning database rows into JSON for an API: `[{"name": p.name, "price": p.price_paise} for p in products]` (Module 11).
    - Building a lookup to avoid slow repeated searches: `stock_by_id = {p.id: p.stock for p in products}`.
    - Checking a whole order: `all(item.quantity <= item.product.stock for item in order.items)`.

    A comprehension that needs a scroll bar to read is a loop in disguise. Rewrite it as one.

## 6. Lab

**Lab folder:** `labs/04-python-fundamentals/05-comprehensions/`

```bash
cd labs/04-python-fundamentals/05-comprehensions
docker compose run --rm python
```

Compare the loop and the comprehension, run the list, dict and set examples, change their conditions, meet the two errors in `mistakes/`,
and fix the empty "Under ₹500" shelf.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Wrong units in the condition.** `< 500` instead of `< 50000` paise: an empty shelf, no error. **Fix:** money is paise; check empty results.
2. **Putting what you keep last.** `[for p in catalog p["name"]]` is a syntax error. **Fix:** what you keep comes **first**.
3. **`else` after a filter `if`.** `SyntaxError`. **Fix:** filter = `if` at the end; choose a value = `a if cond else b` before the `for`.
4. **Comprehensions for actions.** `[print(p) for p in catalog]` builds a pointless list. **Fix:** a normal loop for doing things.
5. **One giant comprehension.** Three conditions and two `for`s on one line. **Fix:** a normal loop with comments.

## 8. Quiz

<div class="bz-quiz" data-quiz="m04-05"></div>

## 9. What's next

Next: what to do when something goes wrong, like a customer typing "three" as a quantity: [Errors and exceptions](06-errors-and-exceptions.md).

**In one line:** `[what for item in collection if condition]` builds a new list in one readable line; `{k: v for …}` builds a dict, `{x for …}` a set;
use a normal loop when it stops reading like a sentence.

### Cheat sheet

| Task | Code |
| --- | --- |
| Every product's name | `[p["name"] for p in catalog]` |
| Only some | `[p["name"] for p in catalog if p["price_paise"] < 50000]` |
| Transform | `[p["price_paise"] // 100 for p in catalog]` |
| Name → price lookup | `{p["name"]: p["price_paise"] for p in catalog}` |
| Unique sellers | `{p["seller"] for p in catalog}` |
| A value for every item | `["cheap" if p["price_paise"] < 50000 else "costly" for p in catalog]` |
| Total without a list | `sum(p["stock"] for p in catalog)` |
| Any / all | `any(p["stock"] == 0 for p in catalog)` |

> **Next in Bazaar:** customers type all sorts of things: "three" as a quantity, a product name that doesn't exist, a coupon with a typo.
> Bazaar must not crash on any of them. Next lesson: catching errors with `try` and `except`.

<div class="bz-complete" data-lesson="m04-05"></div>
