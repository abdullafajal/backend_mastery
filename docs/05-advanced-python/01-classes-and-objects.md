# Classes and objects

<div class="bz-meta" markdown>
**Module** 5 · Advanced Python
**Lesson** 1
**Reading time** 15 min (+ optional deeper parts)
**You will build** a `Product` class that refuses bad prices and sells from its own stock, and a `Cart` class that adds up a customer's order
</div>

!!! abstract "In 1 minute"
    - A **class** is a blueprint: `class Product:` says what every product **has** (name, price, stock) and **can do** (`sell()`).
    - Calling the class makes an **object** from the blueprint: `masala = Product("Masala Box", 29900, "Patel Spices", 40)`. Each object has its own data.
    - `__init__` runs when an object is made. It stores the data with `self.name = name`, and can **refuse** bad data, like a price of `"cheap"`.
    - A **method** is a function inside the class: `masala.sell(2)`. Python passes the object before the dot as `self`.
    - Put lists in `__init__` (`self.lines = []`), never directly on the class, or every object shares one list.

> **Previously in Bazaar:** Module 4 ended with Bazaar v0, a command-line catalog where every product is a dict.

## 1. Why learn this?

In Bazaar v0, a product is a dict. Dicts accept anything: `{"name": "Masala Box", "price_paise": "cheap"}` is a perfectly valid dict.
The mistake only shows up later, somewhere else, when the checkout tries to multiply `"cheap"` by 2.

And the code that works **on** a product (`sell()`, `price_text()`) lives far away from the product's data, in other files.

A **class** keeps a thing's data and the code that works on it **together**, and checks the data the moment the thing is made.
Django's models (Module 8), which hold Bazaar's whole database, are classes. So is almost everything in a big Python project.

## 2. The concept

### A class and its objects

```python title="product.py"
--8<-- "labs/05-advanced-python/01-classes-and-objects/examples/product.py"
```

```
Masala Box ₹299.00
Masala Box stock: 38
Earbuds stock:    8
Not sold: only 8 Wireless Earbuds left
```

Four new words, in order:

- `class Product:` defines the **class**: the blueprint. Class names use `CapitalWords`.
- `Product("Masala Box", 29900, "Patel Spices", 40)` makes an **object** (also called an **instance**) from it. `masala` and `earbuds` are two objects of the same class.
- `masala.name`, `masala.stock`: data stored on an object are its **attributes**. Each object has its own: selling Masala Box didn't touch the earbuds' stock.
- `masala.sell(2)`, `masala.price_text()`: functions defined inside the class are **methods**. You call them with a dot, on an object.

### `__init__`: setting up a new object

`__init__` (two underscores on each side; say "dunder init") runs **automatically** when you make an object.
The arguments you pass to `Product(...)` arrive here. Its job: store them on the new object.

```python
    def __init__(self, name, price_paise, seller, stock):
        self.name = name
```

Read `self.name = name` as: "on **this new object**, make an attribute `name`, holding the `name` that was passed in".
Without `self.`, `name` would just be a local name that vanishes when `__init__` ends (Module 4, Lesson 3).

### `self`: the object before the dot

Every method's first parameter is `self`. You never pass it yourself: Python does.

```python title="self_explained.py"
--8<-- "labs/05-advanced-python/01-classes-and-objects/examples/self_explained.py"
```

```
36
Product True
```

`masala.sell(2)` is just a short way to write `Product.sell(masala, 2)`. The object before the dot becomes `self`.
That's how one `sell` method, written once in the class, changes the right product's stock every time.

`isinstance(masala, Product)` checks whether an object was made from a class: `True`.

### A class can refuse bad data

This is the problem from part 1, fixed:

```python title="validate_and_repr.py"
--8<-- "labs/05-advanced-python/01-classes-and-objects/examples/validate_and_repr.py"
```

```
Product('Cotton Kurta', 64900, 'Meera Handloom')
Refused: price_paise must be a whole number of paise above 0, not 'cheap'
The dict happily holds: cheap
```

- `__init__` checks the price and `raise`s (Module 4, Lesson 6). A `Product` with a price of `"cheap"` can never exist, so no other code has to worry about it.
- `__repr__` is another special method: it decides how `print()` shows the object. Without it, you'd see something like `<__main__.Product object at 0x7f…>`.

### Objects working together

```python title="cart.py"
--8<-- "labs/05-advanced-python/01-classes-and-objects/examples/cart.py"
```

```
Ravi 2 lines, total 1247 rupees
```

A `Cart` object holds `Product` objects. `cart.total_paise()` asks each line for `product.price_paise`.
Notice `self.lines = []` is **inside** `__init__`: each new cart makes its own new list. Part 4 shows what happens otherwise.

### An analogy

A class is the **printed product form** at Bazaar's seller office: boxes for Name, Price, Seller, Stock, and a rule printed at the top:
"Price must be in paise, above 0".

- Each **filled-in form** is an object. Patel Spices fills one in for Masala Box; Sharma Electronics fills another for Wireless Earbuds.
- `__init__` is the clerk who fills in the form and **refuses** it if the price says "cheap".
- A method is an **action written on the form**, like "To sell: subtract from Stock". It always applies to **this** form (`self`).

### Questions you may have

**Why `self` and not `this`, like in other languages?** It's just the convention every Python programmer uses. Always call it `self`.

**When should I make a class instead of using a dict?** When a thing has **rules** (valid prices, stock can't go below 0) or **actions** (sell, add to cart). For a quick bag of data, a dict is fine. Lesson 3's dataclasses sit in between.

**Is a class the same as a module?** No. A module is a file (Module 4). A file can hold several classes, and you `import` them like functions: `from catalog import Product`.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="class-objects"></div>

## 4. Code example

The lab's exercise: two customers, two carts. Ravi adds a kurta; Asha adds two Masala Boxes:

```python title="exercises/carts.py"
--8<-- "labs/05-advanced-python/01-classes-and-objects/exercises/carts.py"
```

```
Asha: [('Cotton Kurta', 1), ('Masala Box', 2)]
Ravi: [('Cotton Kurta', 1), ('Masala Box', 2)]
```

Both carts show both items. `lines = []` written directly inside `class Cart:` is a **class attribute**: it belongs to the class,
and there is **one** of it. Neither cart has its own `lines`, so `self.lines` finds the class's list, and both carts append to it.
It's Module 4's "two names, one list" bug again.

The fix creates the list **inside `__init__`**, once per new cart:

```python title="solutions/carts.py (lines 4-7)"
--8<-- "labs/05-advanced-python/01-classes-and-objects/solutions/carts.py:4:7"
```

```
Asha: [('Masala Box', 2)]
Ravi: [('Cotton Kurta', 1)]
```

## 5. Under the hood

### Three errors you'll meet

**A method without `self`:**

```
Traceback (most recent call last):
  File "/lab/mistakes/no_self_param.py", line 9, in <module>
    print(Product("Masala Box").label())
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~^^
TypeError: Product.label() takes 0 positional arguments but 1 was given
```

"But 1 was given": Python passed the object as `self`, and `label()` had no place for it.

**Forgetting `self.` in front of an attribute:**

```
Traceback (most recent call last):
  File "/lab/mistakes/no_self_dot.py", line 9, in <module>
    print(Product("Masala Box").label())
          ~~~~~~~~~~~~~~~~~~~~~~~~~~~^^
  File "/lab/mistakes/no_self_dot.py", line 6, in label
    return name.upper()          # forgot self. in front of name
           ^^^^
NameError: name 'name' is not defined. Did you mean: 'self.name'?
```

**Making an object without a required value:**

```
Traceback (most recent call last):
  File "/lab/mistakes/missing_arg.py", line 7, in <module>
    masala = Product("Masala Box")      # forgot the price
TypeError: Product.__init__() missing 1 required positional argument: 'price_paise'
```

`Product(...)` passes its arguments to `__init__`, so the error names `__init__`.

??? note "Going deeper: class attributes, on purpose"

    A class attribute isn't always a bug. It's right for values that **should** be shared by every object, and never changed through one of them:

    ```python
    class Product:
        CURRENCY = "INR"              # one value for every product

        def __init__(self, name):
            self.name = name
    ```

    Reading `masala.CURRENCY` finds it on the class. The danger is only **changeable** values (lists, dicts) on the class, because a change through
    one object (`self.lines.append`) changes the one shared object. Assigning (`self.CURRENCY = "USD"`) would instead create a new attribute on that one object.

??? note "Going deeper: where attributes live (`__dict__`)"

    Every object keeps its attributes in a dict, `obj.__dict__`. `vars(masala)` shows it:
    `{'name': 'Masala Box', 'price_paise': 29900, 'seller': 'Patel Spices', 'stock': 38}`.
    When you read `masala.x`, Python looks in the object's dict first, then in the class. That's exactly why `self.lines` found the class's list in the exercise.

    So under the hood, an object is "a dict with a class attached". The class adds the rules and the methods.

??? note "Going deeper: object-oriented design in one paragraph"

    **Object-oriented programming** (OOP) means modelling a program as objects that hold data and offer actions. Two habits matter most:
    **encapsulation** (an object guards its own data: `sell()` checks stock, so nobody else edits `stock` directly) and **one job per class**
    (`Product` doesn't print receipts; that's someone else's job). Lesson 2 adds **inheritance**: a class built on top of another.

## 6. Lab

**Lab folder:** `labs/05-advanced-python/01-classes-and-objects/`

```bash
cd labs/05-advanced-python/01-classes-and-objects
docker compose run --rm python
```

Run the four examples, see a class refuse `"cheap"` where a dict accepts it, meet the three classic errors in `mistakes/`,
and fix the two carts that share one list.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **A changeable value on the class.** `lines = []` under `class Cart:` is shared by every cart. **Fix:** `self.lines = []` inside `__init__`.
2. **Forgetting `self` as the first parameter.** `takes 0 positional arguments but 1 was given`. **Fix:** `def label(self):`.
3. **Forgetting `self.` when using an attribute.** `NameError`. **Fix:** `self.name`, not `name`.
4. **Changing attributes from outside.** `masala.stock -= 5` skips `sell()`'s check. **Fix:** call the method that enforces the rule.
5. **A class for everything.** A class with only `__init__` and no rules may as well be a dict (or a dataclass, Lesson 3).

## 8. Quiz

<div class="bz-quiz" data-quiz="m05-01"></div>

## 9. What's next

Next: building one class on top of another (a gift card is a product, but with no delivery), and special methods that let objects work with `==`, `len()` and `sorted()`: [Inheritance and special methods](02-inheritance-and-special-methods.md).

**In one line:** a class is a blueprint, objects are made from it with their own data; `__init__` sets them up (and can refuse bad data),
methods act on `self`, and changeable attributes belong in `__init__`.

### Cheat sheet

| Task | Code |
| --- | --- |
| Define a class | `class Product:` |
| Set up a new object | `def __init__(self, name, price_paise): self.name = name` |
| Make an object | `masala = Product("Masala Box", 29900)` |
| Read / change an attribute | `masala.stock`, `masala.stock = 38` |
| Define a method | `def sell(self, quantity):` |
| Call a method | `masala.sell(2)` (= `Product.sell(masala, 2)`) |
| How `print()` shows it | `def __repr__(self): return f"Product({self.name!r})"` |
| Was it made from this class? | `isinstance(masala, Product)` |

| Word | Means |
| --- | --- |
| class | the blueprint (`Product`) |
| object / instance | one thing made from it (`masala`) |
| attribute | data on an object (`masala.stock`) |
| method | a function in the class (`masala.sell(2)`) |
| `self` | the object the method is working on |

> **Next in Bazaar:** Bazaar starts selling **gift cards**. A gift card is a product (name, price), but it has no stock and no delivery.
> Copying the whole `Product` class would be Module 4's copy-paste mistake again. Next lesson: inheritance.

<div class="bz-complete" data-lesson="m05-01"></div>
