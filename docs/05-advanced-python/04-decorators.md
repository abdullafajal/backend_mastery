# Decorators

<div class="bz-meta" markdown>
**Module** 5 · Advanced Python
**Lesson** 4
**Reading time** 15 min (+ optional deeper parts)
**You will build** `@log_calls`, `@timed` and `@retry(times=3)` for Bazaar's supplier requests, each written once and added to any function with one line
</div>

!!! abstract "In 1 minute"
    - In Python, a function is a **value**: you can store it, pass it to another function, and return it from one.
    - A **decorator** is a function that takes a function and returns a new one, a **wrapper**, that adds something before and/or after the original.
    - `@timed` on top of `def fetch_prices(...)` means `fetch_prices = timed(fetch_prices)`. Callers don't change at all.
    - The wrapper must call the original **and return its result**. Forget the `return`, and every call gives back `None`.
    - `@retry(times=3)` is a decorator with settings. Use `functools.wraps` in every decorator so the function keeps its own name.

> **Previously in Bazaar:** products became dataclasses with type hints, checked by mypy. And you saw `@dataclass` and `@property` without knowing how `@` works.

## 1. Why learn this?

Bazaar now asks its sellers' supplier systems for prices. Some requests are slow; some fail when a supplier's server is busy.
The team wants two things on **every** such function: print how long it took, and retry it if it fails.

Copying ten lines of timing and retry code into twenty functions is Module 4's copy-paste problem, times twenty.
A decorator writes that behaviour **once**, and adds it to any function with a single line. Frameworks use them everywhere:
Django's `@login_required`, the `@dataclass` and `@property` you've already used.

## 2. The concept

### Functions are values

Before decorators, one idea: a function is a value, like a number or a list.

```python title="functions_are_values.py"
--8<-- "labs/05-advanced-python/04-decorators/examples/functions_are_values.py"
```

```
₹299
['₹299', '₹649']
89910
```

- `show = rupees` (no brackets) stores the function itself. `show(29900)` then calls it.
- `apply_to_all(rupees, …)` **passes** a function to another function.
- `make_discount(10)` **builds and returns** a new function. The inner function still remembers `percent`, even after `make_discount` has finished.

That last trick is all a decorator needs.

### A decorator: wrap, don't change

```python title="log_calls.py"
--8<-- "labs/05-advanced-python/04-decorators/examples/log_calls.py"
```

```
→ supplier_price('Patel Spices', 'Masala Box')
← supplier_price returned 21000
→ supplier_price('Meera Handloom', 'Cotton Kurta')
← supplier_price returned 48000
total cost: 69000
supplier_price - What a seller charges Bazaar for one product, in paise.
```

How it works, step by step:

1. `log_calls(func)` receives the original function.
2. It defines `wrapper`, which prints a line, **calls the original**, prints another line, and **returns the original's result**.
3. It returns `wrapper`.
4. `@log_calls` above `def supplier_price` means `supplier_price = log_calls(supplier_price)`. The name now points to the wrapper.

`supplier_price` itself never changed. Remove the `@log_calls` line, and it's back to normal.

`*args, **kwargs` ("any arguments, any keyword arguments", Module 4, Lesson 3) let one wrapper fit **any** function.
`@functools.wraps(func)` copies the original's name and docstring onto the wrapper, so `supplier_price.__name__` is still `supplier_price`.

### `@timed`: the same pattern, a useful job

```python title="timed.py"
--8<-- "labs/05-advanced-python/04-decorators/examples/timed.py"
```

```
fetch_supplier_prices took 0.3 s
build_catalog_page took 0.1 s
[21000, 23500] 14
```

Before: start a clock. Middle: call the original. After: print the time, return the result. Two functions timed, zero timing code inside them.
(`time.sleep(0.3)` pretends to be a slow network request. Your times may differ by a little.)

### A decorator with settings: `@retry(times=3)`

`@retry(times=3)` has brackets, so `retry(times=3)` runs **first** and must **return** the actual decorator. That's one extra level:

```python title="retry.py"
--8<-- "labs/05-advanced-python/04-decorators/examples/retry.py"
```

```
attempt 1 failed: supplier busy
attempt 2 failed: supplier busy
stock: 40
```

Three levels: `retry(times)` returns `decorator(func)`, which returns `wrapper(...)`. The wrapper tries the original up to 3 times,
catching `ConnectionError` (Module 4, Lesson 6), and only gives up after the last attempt.

### An analogy

A decorator is **gift wrapping** at Bazaar's packing desk.

- The product inside (the original function) doesn't change.
- The wrapping adds something around it: a "fragile" label (logging), a timer sticker (timing), "if delivery fails, try again" (retry).
- The customer (the caller) receives the same product, just wrapped. And the packer must remember to put the product **inside** the box: a wrapper
  that forgets to `return` the result delivers an empty box.

### Questions you may have

**Does the decorator run every time I call the function?** The decorator (`timed`) runs **once**, when `def` runs. The **wrapper** runs on every call.

**Can I put two decorators on one function?** Yes. The one nearest to `def` wraps first. Going deeper shows the order.

**Do I need to write decorators often?** You'll **use** them every day (Django is full of them). You'll **write** a few: timing, logging, permissions, retries.

## 3. See it in action

Pick a decorator, then press **Play**.

<div class="bz-diagram" data-diagram="decorator-wrap"></div>

## 4. Code example

The lab's exercise: a `@with_gst` decorator adds 18% GST to a price. The printed line looks right, but the customer's price is `None`:

```python title="exercises/price_with_gst.py"
--8<-- "labs/05-advanced-python/04-decorators/exercises/price_with_gst.py"
```

```
kurta_price: 64900 + 18% GST = 76582
Customer pays (paise): None
```

The wrapper calculates `price_with_tax`, prints it, and then simply ends. A function that ends without `return` gives back `None` (Module 4, Lesson 3),
and the wrapper **is** what `kurta_price()` now calls. The fix is one line at the end of the wrapper:

```python title="solutions/price_with_gst.py (lines 7-14)"
--8<-- "labs/05-advanced-python/04-decorators/solutions/price_with_gst.py:7:14"
```

```
kurta_price: 64900 + 18% GST = 76582
Customer pays (paise): 76582
```

## 5. Under the hood

### Two silent mistakes

**Forgetting `functools.wraps`:**

```python title="mistakes/no_wraps.py"
--8<-- "labs/05-advanced-python/04-decorators/mistakes/no_wraps.py"
```

```
wrapper None
```

Everything still runs, but error messages, logs and tools now say `wrapper` instead of `supplier_price`. Debugging a traceback full of "wrapper" is no fun.

**Forgetting a decorator's settings:**

```python title="mistakes/retry_no_args.py"
--8<-- "labs/05-advanced-python/04-decorators/mistakes/retry_no_args.py"
```

The output is a function, not `40`:

```
<function retry.<locals>.decorator.<locals>.wrapper at 0xffff8b26c720>
```

(The `0x…` address will differ.) Plain `@retry` passed `fetch_stock` in as `times`, and the result was the inner `decorator`. Calling it with
`"Masala Box"` built a wrapper and returned it. **Fix:** `@retry(times=3)`.

??? note "Going deeper: stacking, and ready-made decorators"

    ```python title="deeper.py"
    --8<-- "labs/05-advanced-python/04-decorators/examples/deeper.py"
    ```

    ```
    outer before
    inner before
      checkout runs
    inner after
    outer after
    2 2 5
    slow lookups done: ['110001', '400001']
    ```

    - **Stacking:** the decorator closest to `def` wraps first; the top one wraps everything. So the top one's "before" runs first and its "after" runs last,
      like layers of an onion. In Django, the order of `@login_required` and `@cache_page` matters for exactly this reason.
    - **`functools.lru_cache`** remembers each answer by its arguments. The second `delivery_days("110001")` didn't run the function at all.
      Great for slow lookups whose answers don't change; wrong for things that do (stock, prices).
    - You've used others: `@dataclass` and `@property` (Lessons 2–3), and soon `@pytest.fixture` (Module 13) and Django's view decorators.

??? note "Going deeper: closures"

    The inner function in `make_discount` remembers `percent` after `make_discount` returned. A function that keeps names from the function
    it was created in is called a **closure**. Every decorator relies on it: `wrapper` remembers `func` (and `retry`'s wrapper also remembers `times`).
    `make_discount(10).__closure__[0].cell_contents` shows the remembered `10`.

??? note "Going deeper: decorating classes"

    A decorator can take a **class** too: `@dataclass` receives your class, adds `__init__`, `__repr__` and `__eq__` to it, and returns it.
    Writing class decorators is rare; knowing that `@dataclass` is "just a function that changes a class" is enough.

## 6. Lab

**Lab folder:** `labs/05-advanced-python/04-decorators/`

```bash
cd labs/05-advanced-python/04-decorators
docker compose run --rm python
```

Pass functions around, wrap a supplier lookup with `@log_calls`, time two slow functions with `@timed`, survive two failures with `@retry(times=3)`,
meet two silent decorator mistakes, and fix the GST decorator whose wrapper returns `None`.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **The wrapper doesn't return the result.** Every decorated call gives `None`. **Fix:** `result = func(*args, **kwargs)` … `return result`.
2. **The wrapper doesn't call the original.** The function silently never runs. **Fix:** make sure `func(...)` is called inside.
3. **No `functools.wraps`.** Tracebacks and logs say `wrapper`. **Fix:** `@functools.wraps(func)` on every wrapper.
4. **`@retry` instead of `@retry(times=3)`.** No error, strange results. **Fix:** decorators with settings always need their brackets.
5. **Caching things that change.** `@lru_cache` on a stock lookup shows old stock forever. **Fix:** only cache answers that never change.

## 8. Quiz

<div class="bz-quiz" data-quiz="m05-04"></div>

## 9. What's next

Next: handling a million orders without loading them all into memory, and making sure files and connections are always closed: [Generators and context managers](05-generators-and-context-managers.md).

**In one line:** a decorator takes a function and returns a wrapper that adds behaviour before and after the original; `@timed` means
`f = timed(f)`; the wrapper must call the original and return its result; use `functools.wraps`, and brackets for decorators with settings.

### Cheat sheet

```python
import functools

def timed(func):                          # a decorator
    @functools.wraps(func)                # keep func's name and docstring
    def wrapper(*args, **kwargs):         # fits any function
        result = func(*args, **kwargs)    # call the original
        return result                     # and hand back its result
    return wrapper

def retry(times):                         # a decorator with settings: one more level
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            return func(*args, **kwargs)
        return wrapper
    return decorator
```

| You write | Means |
| --- | --- |
| `@timed` above `def f` | `f = timed(f)` |
| `@retry(times=3)` above `def f` | `f = retry(times=3)(f)` |
| two decorators | the one nearest `def` wraps first |

> **Next in Bazaar:** Bazaar's order log has grown to millions of lines. Loading it into one list would fill the server's memory.
> Next lesson: generators, which hand out one item at a time, and context managers, the idea behind `with`.

<div class="bz-complete" data-lesson="m05-04"></div>
