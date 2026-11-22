# Inheritance and special methods

<div class="bz-meta" markdown>
**Module** 5 · Advanced Python
**Lesson** 2
**Reading time** 15 min (+ optional deeper parts)
**You will build** a `GiftCard` class built on top of `Product`, and products that work with `print()`, `==`, `sorted()` and `len()`
</div>

!!! abstract "In 1 minute"
    - **Inheritance**: `class GiftCard(Product):` builds a new class on top of an existing one. A gift card **is a** product: it gets all of `Product`'s methods for free.
    - The child class only writes what's **different**. Writing a method with the same name **overrides** the parent's version: a gift card doesn't need delivery.
    - `super().__init__(...)` lets the parent set up its parts (name, price, seller) before the child adds its own.
    - When you call a method, Python looks in the object's own class first, then in the parent class.
    - **Special methods** like `__str__`, `__eq__`, `__lt__` and `__len__` decide what `print()`, `==`, `sorted()` and `len()` do with your objects.

> **Previously in Bazaar:** products and carts became classes that guard their own data.

## 1. Why learn this?

Bazaar starts selling the **Bazaar Gift Card** (₹500). It has a name, a price and a seller, like every product.
But it's sent by email: no delivery, and no stock limit.

You could copy the whole `Product` class and change two lines. That's Module 4's copy-paste problem again: fix a bug in `Product`, and the copy keeps it.
Inheritance lets `GiftCard` **reuse** `Product` and change only what's different. Django uses this everywhere: every model you write starts with `class Product(models.Model):`.

## 2. The concept

### A class built on another

```python title="inheritance.py"
--8<-- "labs/05-advanced-python/02-inheritance-and-special-methods/examples/inheritance.py"
```

```
Masala Box (₹299), delivered
Bazaar Gift Card (₹500), sent by email
True True
₹500
```

- `class GiftCard(Product):` means "GiftCard is a kind of Product". `Product` is the **parent** class; `GiftCard` is the **child** class.
- `GiftCard` never defines `price_text()` or `describe()`, yet `card.price_text()` works: it **inherited** them.
- `GiftCard` does define `needs_delivery()`. That **overrides** (replaces) the parent's version, for gift cards only.
- `isinstance(card, Product)` is `True`: a gift card **is a** product. Any code that works with products works with gift cards.

### `super().__init__`: let the parent do its part

`GiftCard.__init__` takes just a price. It calls `super().__init__(...)`, which runs `Product.__init__`, so `self.name`, `self.price_paise`
and `self.seller` are set exactly as for every other product. Then the child can add its own extra attributes.

**`super()`** means "my parent class". If the child forgets this call, the parent's setup never runs. That's this lesson's exercise (part 4).

### Where Python finds a method

When you call `card.needs_delivery()`, Python looks:

1. in the object's own class, `GiftCard`. Found: use it.
2. If it isn't there, in the parent class, `Product`. And so on up.

So `card.price_text()` (not in `GiftCard`) is found in `Product`, while `card.needs_delivery()` stops at `GiftCard`'s own version.

Here's the clever part: `describe()` is written once, in `Product`, and calls `self.needs_delivery()`. For `masala`, that finds `Product`'s version;
for `card`, `GiftCard`'s. **One** loop, `for item in catalog: print(item.describe())`, does the right thing for each kind of product.
Same call, different behaviour per class: that's called **polymorphism**.

### Special methods: making `print`, `==`, `sorted` and `len` work

Methods with double underscores on both sides are **special methods** (also called "dunder methods"). You don't call them directly:
Python calls them when you use the matching feature.

```python title="special_methods.py"
--8<-- "labs/05-advanced-python/02-inheritance-and-special-methods/examples/special_methods.py"
```

```
Masala Box - ₹299
[Product('Masala Box', 29900), Product('Steel Water Bottle', 34900)]
True
[Product('Masala Box', 29900), Product('Steel Water Bottle', 34900), Product('Wireless Earbuds', 149900)]
items in cart: 3
```

| You write | Python calls | Bazaar meaning |
| --- | --- | --- |
| `print(masala)`, `f"{masala}"` | `__str__` | text for customers |
| `repr(masala)`, inside a printed list | `__repr__` | text for developers |
| `a == b` | `__eq__` | same name and seller → same product |
| `a < b`, `sorted(...)` | `__lt__` | cheaper comes first |
| `len(cart)` | `__len__` | number of items in the cart |

You already wrote `__init__` and `__repr__` in Lesson 1: they're special methods too.

### An analogy

Bazaar's **product rule book** has one general chapter, "Products": every product has a name, a price and a seller, gets a price tag, and is delivered.

The "Gift Cards" chapter starts with one line: "Everything in the Products chapter applies, **except**: gift cards are sent by email."
Nobody copies the whole Products chapter. When a question comes up, you read the Gift Cards chapter first; if it doesn't say, you go back to Products.

### Questions you may have

**When should I use inheritance?** When the new thing truly **is a** kind of the old thing (a gift card is a product). If it merely **has** one
(a cart has products), store it as an attribute instead, like Lesson 1's `Cart`.

**Can a child class call the parent's version of an overridden method?** Yes: `super().needs_delivery()` inside the child.

**What is `object`?** The parent of every class. If you write `class Product:` with no parent, it silently inherits from `object`, which provides
defaults like a basic `__repr__` and `==`.

## 3. See it in action

Pick an object and a method, then press **Play**. Try `card` with each method, then `masala`.

<div class="bz-diagram" data-diagram="method-lookup"></div>

## 4. Code example

The lab's exercise: a gift card for Priya, sent to her email. Describing it crashes:

```python title="exercises/gift_card.py"
--8<-- "labs/05-advanced-python/02-inheritance-and-special-methods/exercises/gift_card.py"
```

```
Traceback (most recent call last):
  File "/lab/exercises/gift_card.py", line 28, in <module>
    print(card.describe())
          ~~~~~~~~~~~~~^^
  File "/lab/exercises/gift_card.py", line 16, in describe
    return f"{self.name} (₹{self.price_paise // 100:,}) from {self.seller}, {delivery}"
              ^^^^^^^^^
AttributeError: 'GiftCard' object has no attribute 'name'
```

`GiftCard` has its own `__init__`, so `Product.__init__` **doesn't run** on its own. Nobody set `self.name`. The fix: call the parent's setup first.

```python title="solutions/gift_card.py (lines 18-21)"
--8<-- "labs/05-advanced-python/02-inheritance-and-special-methods/solutions/gift_card.py:18:21"
```

```
Bazaar Gift Card (₹500) from Bazaar, sent by email
to: priya@example.com
```

## 5. Under the hood

### Two silent mistakes, and a loud one

**A typo in an override.** No error, just the wrong behaviour:

```python title="mistakes/override_typo.py"
--8<-- "labs/05-advanced-python/02-inheritance-and-special-methods/mistakes/override_typo.py"
```

```
gift card needs delivery? True
```

`needs_delivary` is a brand-new method, so `needs_delivery` is still `Product`'s. Bazaar would try to ship an email.

**`==` without `__eq__`.** Python's default `==` asks "is it the very same object?":

```python title="mistakes/no_eq.py"
--8<-- "labs/05-advanced-python/02-inheritance-and-special-methods/mistakes/no_eq.py"
```

```
False
```

**Sorting without `__lt__`:**

```
Traceback (most recent call last):
  File "/lab/mistakes/no_lt.py", line 10, in <module>
    print(sorted([Product("Wireless Earbuds", 149900), Product("Masala Box", 29900)]))
          ~~~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
TypeError: '<' not supported between instances of 'Product' and 'Product'
```

??? note "Going deeper: lookup order, properties, and the __eq__/__hash__ trap"

    ```python title="deeper.py"
    --8<-- "labs/05-advanced-python/02-inheritance-and-special-methods/examples/deeper.py"
    ```

    ```
    ['GiftCard', 'Product', 'object']
    299
    AttributeError: property 'price_rupees' of 'Product' object has no setter
    TypeError: unhashable type: 'Product'
    ```

    - `Class.__mro__` ("method resolution order") is the exact list Python searches, ending with `object`.
    - `@property` makes a method look like an attribute: `masala.price_rupees`, no brackets. Without a setter, it can't be assigned: a read-only, always-correct value.
      (The `@` line is a decorator: Lesson 4.)
    - **The trap:** when you define `__eq__`, Python removes the default `__hash__`, so the objects can't go into a set or be dict keys.
      If equal products should be usable there, also define `def __hash__(self): return hash((self.name, self.seller))`. Lesson 3's dataclasses can do this for you.

??? note "Going deeper: composition, multiple parents, and @override"

    - **Composition over inheritance:** prefer "has a" when in doubt. A `Cart` has products; it isn't a product. Deep chains of inheritance
      (`Product` → `Clothing` → `Kurta` → `CottonKurta` …) get hard to follow fast.
    - A class can have several parents (`class X(A, B):`). The MRO then decides the order. It's powerful and easy to misuse; Django's "mixins" use it carefully.
    - `from typing import override` (Python 3.12+) and `@override` on a child method let tools like `mypy` warn you when the parent has no such method:
      the `needs_delivary` typo would be caught before running.
    - An **abstract base class** (`abc.ABC`, `@abstractmethod`) is a parent that **requires** children to define certain methods.

??? note "Going deeper: more special methods"

    | Special method | Makes this work |
    | --- | --- |
    | `__add__` | `cart_a + cart_b` |
    | `__contains__` | `masala in cart` |
    | `__iter__` | `for line in cart:` |
    | `__getitem__` | `cart[0]` |
    | `__bool__` | `if cart:` (empty cart is falsy) |
    | `__hash__` | sets and dict keys |

    Use them when they make the meaning obvious (`len(cart)`). Don't make `+` do something surprising.

## 6. Lab

**Lab folder:** `labs/05-advanced-python/02-inheritance-and-special-methods/`

```bash
cd labs/05-advanced-python/02-inheritance-and-special-methods
docker compose run --rm python
```

Run the examples, see two silent mistakes and one loud one in `mistakes/`, and fix the gift card that crashes because its parent's setup never ran.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Forgetting `super().__init__(...)`.** The parent's attributes are missing: `AttributeError`. **Fix:** call it first in the child's `__init__`.
2. **A typo in an override.** No error; the parent's method silently runs. **Fix:** copy the name exactly (and Going deeper's `@override`).
3. **Expecting `==` to compare data.** Without `__eq__`, two equal products are `!=`. **Fix:** define `__eq__` (and `__hash__` if they go in sets).
4. **Inheritance for "has a".** `class Cart(Product)` makes no sense. **Fix:** a cart **has** products: keep them in an attribute.
5. **Copying a class to change one method.** The copies drift apart. **Fix:** a child class that overrides just that method.

## 8. Quiz

<div class="bz-quiz" data-quiz="m05-02"></div>

## 9. What's next

Next: writing small data classes with far less code, and adding type hints that let your editor catch mistakes early: [Dataclasses and type hints](03-dataclasses-and-type-hints.md).

**In one line:** a child class reuses everything from its parent and overrides only what differs; `super().__init__` runs the parent's setup;
Python finds methods in the object's class first, then the parent; special methods make `print`, `==`, `sorted` and `len` work for your objects.

### Cheat sheet

| Task | Code |
| --- | --- |
| Build on a class | `class GiftCard(Product):` |
| Replace one method | define it again in the child: `def needs_delivery(self): return False` |
| Run the parent's setup | `super().__init__("Bazaar Gift Card", price_paise, "Bazaar")` |
| Use the parent's version | `super().needs_delivery()` |
| Is it this kind? | `isinstance(card, Product)` |
| Text for customers / developers | `__str__` / `__repr__` |
| `==`, `<` (sorting), `len()` | `__eq__`, `__lt__`, `__len__` |

> **Next in Bazaar:** `Product.__init__` is mostly boring lines: `self.name = name`, `self.price_paise = price_paise`, and so on.
> And nothing tells your editor that `price_paise` must be an `int`. Next lesson: dataclasses and type hints.

<div class="bz-complete" data-lesson="m05-02"></div>
