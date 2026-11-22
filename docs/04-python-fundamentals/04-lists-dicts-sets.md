# Lists, dicts and sets

<div class="bz-meta" markdown>
**Module** 4 · Python fundamentals
**Lesson** 4
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's catalog as a list of dicts, a cart as a list, the set of unique sellers, and a fix for a cart bug where one customer's item appears in another's cart
</div>

!!! abstract "In 1 minute"
    - A **list** holds many values **in order**: `cart = ["Masala Box", "Cotton Kurta"]`. Get one by position: `cart[0]` (counting starts at 0).
    - A **dict** holds values **by name** (a key): `product["price_paise"]`. One Bazaar product is a dict; the whole catalog is a list of dicts.
    - A **set** keeps each value **only once**: perfect for "which sellers do we have?".
    - A **tuple** is a small fixed group, like `("Masala Box", 29900, 2)`. It can't be changed.
    - Lists and dicts **can be changed**. If two names point to the same list, a change through one shows through both. Use `.copy()` to get your own.

> **Previously in Bazaar:** you wrote rules once as functions: `rupees()`, `delivery_charge()`, `cart_subtotal()`.

## 1. Why learn this?

Bazaar doesn't sell one product. It has a catalog of many products, each with a name, a price, a seller and a stock count. Each customer has a cart with several items.

Writing `product1_name`, `product1_price`, `product2_name`… doesn't scale to 5 products, let alone 50,000.
Python's **containers** hold many values under one name. Nearly every program you'll ever write, including all of Django, is built on these four.

## 2. The concept

### Lists: values in order

```python title="lists.py"
--8<-- "labs/04-python-fundamentals/04-lists-dicts-sets/examples/lists.py"
```

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

- Square brackets `[ ]` make a list. Items are separated by commas.
- Each item has a position, its **index**, starting at **0**. So `cart[0]` is the first, and `cart[-1]` counts from the end.
- `.append(x)` adds at the end, `.remove(x)` takes out an item by value, `len(cart)` counts, `x in cart` checks.

### Dicts: values by name

When each value has a **meaning** (name, price, seller), a list of positions gets confusing: was `product[2]` the seller or the stock?
A **dict** (dictionary) gives every value a name, called its **key**:

```python title="dicts.py"
--8<-- "labs/04-python-fundamentals/04-lists-dicts-sets/examples/dicts.py"
```

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

- Curly brackets `{ }` with `key: value` pairs make a dict.
- `product["name"]` looks up a value. `product["stock"] = 40` changes it, or adds it if the key is new.
- `product.get("rating")` gives `None` (or your default) when the key is missing. `product["rating"]` would crash instead.
- `.items()` gives every key with its value, for a loop.

### The catalog: a list of dicts

Put them together, and you get the shape of almost all real data, including the JSON that web APIs send:

```python title="catalog.py"
--8<-- "labs/04-python-fundamentals/04-lists-dicts-sets/examples/catalog.py"
```

```
Red Running Shoes    ₹   999  stock  12
Cotton Kurta         ₹   649  stock  25
Masala Box           ₹   299  stock  40
Wireless Earbuds     ₹ 1,499  stock   8
Steel Water Bottle   ₹   349  stock  60
Cheapest: Masala Box
Search 'bottle' -> Steel Water Bottle
```

Read `p['name']` as "in this product `p`, the value for the key `name`". The loop gives you one product dict per round.

### Sets: each value once

```python title="sets_and_tuples.py"
--8<-- "labs/04-python-fundamentals/04-lists-dicts-sets/examples/sets_and_tuples.py"
```

```
4 sellers
['Kumar Footwear', 'Meera Handloom', 'Patel Spices', 'Sharma Electronics']
Patel Spices sells here? True
Masala Box 59800
```

- Sharma Electronics was added twice, but the **set** kept it once: 4 sellers, not 5.
- A set has **no order** and no positions (no `sellers[0]`). `sorted()` gives you a sorted list when you need one.
- `x in a_set` is very fast, even with millions of values. (Going deeper explains why.)

### Tuples: a fixed group

`("Masala Box", 29900, 2)` is a **tuple**: like a list, but in round brackets `( )`, and it **can't be changed** after it's made.
Use it for small groups that belong together, like one cart line. `name, price, quantity = line` **unpacks** it into three names.
You've been doing this since Lesson 2: `for name, price, quantity in cart:`.

### Which one when?

| Container | Looks like | Use it for | Bazaar example |
| --- | --- | --- | --- |
| list | `["a", "b"]` | many values, in order, may change | a cart, the catalog |
| dict | `{"name": "a"}` | values looked up by name | one product |
| set | `{"a", "b"}` | unique values, fast "is it in?" | the sellers |
| tuple | `("a", 1)` | a small fixed group | one cart line |

### Two names, one list

In Lesson 1 you saw that `old_price = price` doesn't copy anything: it adds a second name for the same object. With numbers that never mattered,
because numbers can't change. **Lists and dicts can change.** So now it matters a lot:

```python title="aliasing.py"
--8<-- "labs/04-python-fundamentals/04-lists-dicts-sets/examples/aliasing.py"
```

```
ashas_cart: ['Masala Box', 'Cotton Kurta']
ashas_cart: ['Masala Box', 'Cotton Kurta']
own_cart:   ['Masala Box', 'Cotton Kurta', 'Steel Water Bottle']
```

Asha never added Cotton Kurta, but her cart has it: `same_cart` and `ashas_cart` are two names for **one** list.
`.copy()` makes a **new** list with the same items, so changes to the copy don't touch the original.

### An analogy

- A **list** is a **numbered queue** at the counter: order matters, and you can call "number 0!".
- A **dict** is a **product label**: "Name: Masala Box. Price: ₹299. Seller: Patel Spices." You read it by the field's name.
- A **set** is the **guest list** at the door: each name once; checking "is Priya on it?" is instant.
- Two names for one list are **two people sharing one shopping basket**: anything one puts in, the other finds in it too.

### Questions you may have

**Why does counting start at 0?** The index means "how many steps from the start". The first item is 0 steps away. Almost every programming language does this.

**Can a list hold different types?** Yes, `["Masala Box", 29900, True]` works. But in good code, one list holds one **kind** of thing (all products, or all names).

**Can dict keys be anything?** Usually text or numbers. They must be unique: assigning to an existing key replaces its value.

**`{}` is a dict or a set?** An empty `{}` is a dict. An empty set is `set()`.

## 3. See it in action

Press **Play** to watch two names share one list. (The other situations repeat Lesson 1.)

<div class="bz-diagram" data-diagram="name-tags" data-state-sit="list"></div>

## 4. Code example

The lab's exercise: every new customer starts with Bazaar's starter cart (a free sample). Priya adds a kurta, and…

```python title="exercises/starter_cart.py"
--8<-- "labs/04-python-fundamentals/04-lists-dicts-sets/exercises/starter_cart.py"
```

```
Starter: ['Masala Box sample', 'Cotton Kurta']
Asha:    ['Masala Box sample', 'Cotton Kurta']
Priya:   ['Masala Box sample', 'Cotton Kurta']
```

All three names point to **one** list, so Asha (and every future customer) gets Priya's kurta. The fix gives each customer her own list:

```python title="solutions/starter_cart.py (lines 6-8)"
--8<-- "labs/04-python-fundamentals/04-lists-dicts-sets/solutions/starter_cart.py:6:8"
```

```
Starter: ['Masala Box sample']
Asha:    ['Masala Box sample']
Priya:   ['Masala Box sample', 'Cotton Kurta']
```

On a real website, this exact bug shows one customer's cart to another. That's why shared, changeable data is the first thing to suspect when
"data appears where it shouldn't".

## 5. Under the hood

### Three errors you'll meet often

**A key that isn't there** (here, a typo: `prize` instead of `price`):

```
Traceback (most recent call last):
  File "/lab/mistakes/key_error.py", line 2, in <module>
    print(product["prize_paise"])
          ~~~~~~~^^^^^^^^^^^^^^^
KeyError: 'prize_paise'
```

**A position past the end** (a 2-item list has positions 0 and 1 only):

```
Traceback (most recent call last):
  File "/lab/mistakes/index_error.py", line 2, in <module>
    print(cart[2])
          ~~~~^^^
IndexError: list index out of range
```

**Changing a tuple:**

```
Traceback (most recent call last):
  File "/lab/mistakes/tuple_change.py", line 2, in <module>
    line[2] = 3
    ~~~~^^^
TypeError: 'tuple' object does not support item assignment
```

??? note "Going deeper: slices and more list tools"

    ```python
    catalog_names = ["Red Running Shoes", "Cotton Kurta", "Masala Box", "Wireless Earbuds", "Steel Water Bottle"]
    print(catalog_names[1:3])        # ['Cotton Kurta', 'Masala Box']: from index 1 up to (not including) 3
    print(catalog_names[:2])         # the first two
    print(catalog_names[-2:])        # the last two
    ```

    | Tool | Does |
    | --- | --- |
    | `cart.insert(0, x)` | add at a position |
    | `cart.pop()` | remove and return the last item (`pop(0)`: the first) |
    | `cart.sort()` / `sorted(cart)` | sort in place / return a new sorted list |
    | `sorted(catalog, key=lambda p: p["price_paise"])` | sort dicts by one field |
    | `", ".join(cart)` | one string from a list of strings |
    | `min(prices)`, `max(prices)`, `sum(prices)` | smallest, biggest, total |

??? note "Going deeper: why dict and set lookups are fast"

    `x in a_list` checks items one by one: 50,000 products means up to 50,000 checks. A dict or set uses a **hash table**: Python turns the key into
    a number (its **hash**) that tells it almost exactly where to look. So `key in a_dict` takes about the same time for 5 or 5 million entries.
    Module 6 builds a hash map by hand.

    That's also why set items and dict keys must be **unchangeable** (hashable): strings, numbers, tuples. A list can't be a dict key:
    `{["a"]: 1}` gives `TypeError: unhashable type: 'list'`.

    Since Python 3.7, a dict keeps keys in the order you added them. Sets still have no order.

??? note "Going deeper: shallow vs deep copies"

    `.copy()` is a **shallow** copy: a new outer list, but the items inside are the **same** objects. For a list of strings that's fine
    (strings can't change). For a list of dicts, changing a product through the copy changes it in the original too:

    ```python
    import copy

    catalog = [{"name": "Masala Box", "stock": 40}]
    shallow = catalog.copy()
    shallow[0]["stock"] = 2                  # changes the SAME inner dict
    print(catalog[0]["stock"])               # 2

    deep = copy.deepcopy(catalog)            # copies the inner dicts as well
    deep[0]["stock"] = 1
    print(catalog[0]["stock"])               # still 2
    ```

    Other ways to copy a list: `list(cart)` and `cart[:]`. A dict: `dict(product)` or `product.copy()`.
    The same "shared default" trap from Lesson 3 (`def add(item, cart=[])`) is aliasing too.

## 6. Lab

**Lab folder:** `labs/04-python-fundamentals/04-lists-dicts-sets/`

```bash
cd labs/04-python-fundamentals/04-lists-dicts-sets
docker compose run --rm python
```

Run the five examples, try the three errors in `mistakes/`, then fix `exercises/starter_cart.py` so Priya's kurta stays in Priya's cart only.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Counting from 1.** `cart[1]` is the **second** item; `cart[len(cart)]` is an `IndexError`. **Fix:** first is `[0]`, last is `[-1]`.
2. **`product["key"]` for a key that may be missing.** `KeyError`. **Fix:** `product.get("rating")`, or check `"rating" in product` first.
3. **`b = a` and expecting a copy.** Changes show up in both. **Fix:** `b = a.copy()` when each needs its own.
4. **A list where a set fits.** Duplicate sellers, and slow `in` checks on big lists. **Fix:** a `set` for unique values.
5. **Positions where names fit.** `product[2]`: is that the seller or the stock? **Fix:** a dict, `product["seller"]`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m04-04"></div>

## 9. What's next

Next: building lists and dicts in one short, readable line, for example "the names of all products under ₹500": [Comprehensions](05-comprehensions.md).

**In one line:** a list keeps values in order (`cart[0]`), a dict keeps them by key (`product["price_paise"]`), a set keeps each value once,
a tuple is a fixed group; lists and dicts can change, so use `.copy()` when two parts of the program need their own.

### Cheat sheet

| Task | List | Dict |
| --- | --- | --- |
| Make | `cart = ["Masala Box"]` | `p = {"name": "Masala Box"}` |
| Read | `cart[0]`, `cart[-1]` | `p["name"]`, `p.get("rating")` |
| Add / change | `cart.append(x)` | `p["stock"] = 40` |
| Remove | `cart.remove(x)` | `del p["stock"]` |
| Count | `len(cart)` | `len(p)` |
| Is it there? | `x in cart` | `"name" in p` (keys) |
| Loop | `for item in cart:` | `for key, value in p.items():` |
| Own copy | `cart.copy()` | `p.copy()` |

| Set | Tuple |
| --- | --- |
| `sellers = set()`, `sellers.add(x)`, `x in sellers` | `line = ("Masala Box", 29900, 2)`, `name, price, qty = line` |

> **Next in Bazaar:** the catalog page needs "all products under ₹500", "every name in capitals", "price per seller". Each is a loop with an
> `append`. Python has a shorter, clearer way to write those: comprehensions.

<div class="bz-complete" data-lesson="m04-04"></div>
