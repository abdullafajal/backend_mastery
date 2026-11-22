# Functions

<div class="bz-meta" markdown>
**Module** 4 · Python fundamentals
**Lesson** 3
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's `rupees()` and `delivery_charge()` written once and reused, and Ravi's checkout rebuilt from small functions
</div>

!!! abstract "In 1 minute"
    - A **function** is a piece of code with a name. Write it once with `def`, then use (**call**) it anywhere: `delivery_charge(64900)`.
    - The values you pass in are **arguments**. Inside the function they have names, called **parameters**.
    - `return` sends an answer **back** to the caller: `charge = delivery_charge(64900)` puts 4900 into `charge`.
    - `print` only shows something on the screen. A function **without** `return` gives back `None`. This is the #1 beginner bug.
    - Names made inside a function exist only inside it, and only while it runs.

> **Previously in Bazaar:** you wrote decisions with `if` and repeated work with `for` and `while`.

## 1. Why learn this?

Bazaar's "free delivery from ₹999" rule is now written in three files: the cart page, the checkout, and the invoice.

For Diwali, the business changes it to "free from ₹799". Someone updates two files and forgets the third.
Now the cart says "free delivery", and the invoice charges ₹49. Angry customers.

The fix: write the rule **once**, give it a name, and let every file use that one copy. That's a function.

## 2. The concept

### Defining and calling a function

```python title="rupees.py"
--8<-- "labs/04-python-fundamentals/03-functions/examples/rupees.py"
```

```
₹299.00
₹1,531.64
Earbuds cost ₹1,499.00
```

Two separate things happen here:

1. **Defining** (`def rupees(paise):` and the indented block): Python **remembers** the code under the name `rupees`. Nothing runs yet.
2. **Calling** (`rupees(29900)`): **now** the code runs, with `paise` set to 29900. Each call runs it again, with its own value.

The line in triple quotes right after `def` is a **docstring**: a short note saying what the function does. Editors show it when you use the function.

### Arguments and parameters

```python
def rupees(paise):                     # paise is the PARAMETER: the name inside the function
    return f"₹{paise // 100:,}"

print(rupees(29900))                   # 29900 is the ARGUMENT: the value you pass in (prints ₹299)
```

A parameter is like a blank on a form; the argument is what you write in the blank for this call.
A function can have several, separated by commas: `def line_total(price_paise, quantity):`.

### `return`: sending the answer back

```python title="delivery.py"
--8<-- "labs/04-python-fundamentals/03-functions/examples/delivery.py"
```

```
cart 29900 paise -> delivery 4900 paise
cart 99900 paise -> delivery 0 paise
cart 159600 paise -> delivery 0 paise
```

- `charge = delivery_charge(total)` runs the function, and the **returned value** takes the place of the call. So `charge` gets 4900 or 0.
- `return` also **ends** the function at once. That's why the second `return` doesn't need an `else`: if the cart is big enough, the function already returned 0.

Now the Diwali change is one edit: `FREE_FROM_PAISE = 79900`. Every caller gets the new rule.

### `print` is not `return`

This is the bug almost every beginner hits:

```python title="print_vs_return.py"
--8<-- "labs/04-python-fundamentals/03-functions/examples/print_vs_return.py"
```

```
subtotal is 124700
a = None
b = 124700
```

`subtotal_printed` **shows** 124700 on the screen, but gives nothing back. A function that ends without `return` gives back **`None`**.
So `a` is `None`, and any maths with it crashes later.

**Rule of thumb:** functions that **calculate** should `return` the answer. Only the top-level code decides what to `print`.

### Default values and keyword arguments

A parameter can have a **default**: the value used when the caller doesn't pass one.

```python title="line_total.py"
--8<-- "labs/04-python-fundamentals/03-functions/examples/line_total.py"
```

```
64900
59800
169800
104700
```

- `line_total(64900)`: `quantity` and `discount_paise` use their defaults (1 and 0).
- `quantity=2` is a **keyword argument**: you pass it **by name**. Clearer to read, and the order doesn't matter.
- Parameters with defaults come **after** the ones without.

### Names inside a function stay inside

```python title="scope.py"
--8<-- "labs/04-python-fundamentals/03-functions/examples/scope.py"
```

```
11682
Traceback (most recent call last):
  File "/lab/examples/scope.py", line 12, in <module>
    print(tax)                                # NameError: there is no `tax` out here
          ^^^
NameError: name 'tax' is not defined. Did you mean: 'max'?
```

This crash is on purpose. `tax` was made **inside** `gst()`, so it exists only inside, and only while the function runs.
When the function returns, its names disappear; only the returned value comes out. (Python's guess "Did you mean: 'max'?" is just a similar name it knows.)

Names made **outside** any function, like `GST_PERCENT`, can be read inside. Names in `UPPER_CASE` are a convention for **constants**: values that never change while the program runs.

### Good functions

- **One job each**: `delivery_charge()` decides delivery, `rupees()` formats money. Small functions are easy to test and reuse.
- **A name that says what it gives back**: `cart_subtotal(cart)`, not `do_stuff(x)`. Lowercase, with `_`, like variables.
- **Inputs as parameters, output with `return`**: then the same function works for every cart, not just Ravi's.

### An analogy

A function is a **recipe card** in the kitchen of Bazaar's cafeteria.

- `def` = writing the recipe card. Nothing gets cooked yet.
- Calling it = a cook following the card, with today's ingredients (the arguments).
- `return` = the dish handed out through the window. `print` = the cook just shouting "it's ready!", without handing over any plate.
- The cook's chopping board (local names) is cleaned after every dish. Nobody outside sees it.

### Questions you may have

**Must I define a function before calling it?** Yes: Python must have run the `def` line before the call. That's why functions go at the top of a file.

**Can a function return more than one value?** Yes: `return subtotal, delivery`. The caller writes `s, d = checkout(cart)`. (Lesson 4 explains why this works.)

**Can a function call another function?** Yes, and good programs do it all the time: `checkout()` calls `cart_subtotal()` and `delivery_charge()`.

## 3. See it in action

Pick a situation, then press **Play**. In the first one, type a cart total (try 998 and 999).

<div class="bz-diagram" data-diagram="function-call"></div>

## 4. Code example

Ravi's checkout, built from three small functions: the exercise you'll fix in the lab. It crashes:

```python title="exercises/checkout.py"
--8<-- "labs/04-python-fundamentals/03-functions/exercises/checkout.py"
```

```
Traceback (most recent call last):
  File "/lab/exercises/checkout.py", line 23, in <module>
    delivery = delivery_charge(subtotal)
  File "/lab/exercises/checkout.py", line 16, in delivery_charge
    if subtotal >= 99900:
       ^^^^^^^^^^^^^^^^^
TypeError: '>=' not supported between instances of 'NoneType' and 'int'
```

How to read it, from the bottom:

1. **Last line:** something was `None` (type `NoneType`) where a number was expected.
2. **Just above:** it happened in `delivery_charge`, on `if subtotal >= 99900`. So `subtotal` was `None`.
3. **Above that:** the caller passed in the `subtotal` it got from `cart_subtotal(cart)`. So `cart_subtotal` gave back `None`: it has no `return`.

The fix is one line at the end of `cart_subtotal`:

```python title="solutions/checkout.py (lines 8-12)"
--8<-- "labs/04-python-fundamentals/03-functions/solutions/checkout.py:8:12"
```

```
Subtotal: ₹1,596.00
Delivery: ₹0.00
Total:    ₹1,596.00
```

## 5. Under the hood

### Three more errors you'll meet

**Forgot the colon** after `def`:

```
  File "/lab/mistakes/no_colon.py", line 1
    def rupees(paise)
                     ^
SyntaxError: expected ':'
```

**Called without the argument** it needs:

```
Traceback (most recent call last):
  File "/lab/mistakes/missing_argument.py", line 7, in <module>
    print(delivery_charge())
          ~~~~~~~~~~~~~~~^^
TypeError: delivery_charge() missing 1 required positional argument: 'total'
```

**Called before the `def` line ran:**

```
Traceback (most recent call last):
  File "/lab/mistakes/call_before_def.py", line 1, in <module>
    print(rupees(29900))
          ^^^^^^
NameError: name 'rupees' is not defined
```

### A traceback is a list of calls

In the exercise's traceback there were **two** `File …` lines: the call on line 23, and inside `delivery_charge` on line 16.
A traceback lists every function that was running when the error happened, outermost first. The bottom one is where it broke.
(This list of running calls is the **call stack** from Module 1.)

??? note "Going deeper: more ways to pass arguments"

    ```python
    def order_summary(customer, *items, **options):
        return f"{customer}: {items} {options}"

    print(order_summary("Ravi", "Cotton Kurta", "Masala Box", gift_wrap=True))
    # Ravi: ('Cotton Kurta', 'Masala Box') {'gift_wrap': True}
    ```

    - `*items` collects any number of extra positional arguments into a tuple: `("Cotton Kurta", "Masala Box")`.
    - `**options` collects extra keyword arguments into a dict: `{"gift_wrap": True}`.
    - A `*` alone in the parameter list makes everything after it **keyword-only**: `def line_total(price, *, quantity=1)` forces `quantity=2`, never a bare `2`.

    **Never use a list or dict as a default value** (`def add(item, cart=[])`). The default is created **once**, when `def` runs, and shared by
    every call, so items pile up between calls. Use `cart=None`, then `if cart is None: cart = []` inside.

??? note "Going deeper: global and functions as values"

    - To **change** (not just read) an outside name from inside a function, Python needs `global name`. Avoid it: pass values in and
      `return` results instead. Functions that depend on outside names are hard to test.
    - A function is an object too. You can store it in a variable or pass it to another function: `sorted(cart, key=line_total_of)`.
      Module 5's decorators build on this.
    - `lambda price: price * 2` makes a tiny unnamed function in one line. Handy as a `key=`; for anything bigger, use `def`.

??? note "Going deeper: type hints for functions"

    ```python
    def delivery_charge(cart_total_paise: int) -> int:
        if cart_total_paise >= 99900:
            return 0
        return 4900
    ```

    `: int` says what each parameter should be, and `-> int` what it returns. Python ignores them at run time; editors and tools like
    `mypy` use them to warn you early (for example, if you pass `"999"` as text). Module 5 covers them properly.

## 6. Lab

**Lab folder:** `labs/04-python-fundamentals/03-functions/`

```bash
cd labs/04-python-fundamentals/03-functions
docker compose run --rm python
```

Run the five examples, change the free-delivery limit in one place and watch every cart follow, meet three errors in `mistakes/`,
and fix Ravi's checkout so it prints `₹1,596.00` instead of crashing.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`print` instead of `return`.** The caller gets `None`. **Fix:** calculating functions `return`; print at the top level.
2. **Forgetting `return` at the end.** Same `None`, often crashing much later, in another function. **Fix:** read the traceback from the bottom to find where `None` came from.
3. **Forgetting the brackets.** `charge = delivery_charge` stores the function itself, it doesn't call it. **Fix:** `delivery_charge(total)`.
4. **Copy-pasting a rule instead of calling it.** The copies drift apart. **Fix:** one function, many callers.
5. **Expecting a local name outside.** `NameError`. **Fix:** `return` the value and store it: `tax = gst(64900)`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m04-03"></div>

## 9. What's next

Next: holding many values together, the way Bazaar really stores carts and products: [Lists, dicts and sets](04-lists-dicts-sets.md).

**In one line:** `def` gives a piece of code a name; calling it runs it with arguments; `return` hands the answer back (no `return` means `None`);
and names inside a function stay inside.

### Cheat sheet

| Task | Code |
| --- | --- |
| Define | `def delivery_charge(cart_total_paise):` + indented block |
| Explain it | `"""Return the delivery charge in paise."""` (first line inside) |
| Give back an answer | `return 4900` |
| Call and keep the answer | `charge = delivery_charge(64900)` |
| Optional parameter | `def line_total(price_paise, quantity=1):` |
| Pass by name | `line_total(99900, quantity=2)` |
| Return two values | `return subtotal, delivery` → `s, d = checkout(cart)` |

| Word | Means |
| --- | --- |
| parameter | the name inside the function (`paise`) |
| argument | the value you pass in (`29900`) |
| return value | what the call gives back (`None` if there's no `return`) |
| local name | made inside a function; gone when it returns |

> **Next in Bazaar:** so far a cart has been a few hand-written lines. A real Bazaar cart has a list of products, each with a name,
> a price and a seller. Next lesson: lists, dicts and sets, the containers every Python program is built on.

<div class="bz-complete" data-lesson="m04-03"></div>
