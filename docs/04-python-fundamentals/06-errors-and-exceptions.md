# Errors and exceptions

<div class="bz-meta" markdown>
**Module** 4 · Python fundamentals
**Lesson** 6
**Reading time** 15 min (+ optional deeper parts)
**You will build** a bulk-order import that skips bad lines instead of crashing, and a stock check that explains why an order can't be reserved
</div>

!!! abstract "In 1 minute"
    - When something goes wrong while a program runs, Python **raises an exception** (an error object), like `ValueError`. If nobody handles it, the program stops.
    - `try:` … `except ValueError:` says "try this; if that error happens, do this instead". The program keeps running.
    - Catch only the error you expect, by name. A bare `except:` hides every error, even your own typos.
    - Your own code can `raise ValueError("only 8 left")` when a rule is broken. The caller decides what to show the customer.
    - `else:` runs only if there was no error; `finally:` runs every time.

> **Previously in Bazaar:** you built lists, dicts and sets in one line with comprehensions.

## 1. Why learn this?

Customers type all sorts of things. In the quantity box: "three", "2.5", or nothing at all. In the search box: a product Bazaar doesn't sell.

Since Lesson 1 you've seen what happens: a traceback, and the program **stops**. On a website, that's an error page, and the customer leaves.
And in a bulk import of 1,000 lines, one bad line throws away the 999 good ones.

Errors will always happen. A good program **expects** them and answers politely.

## 2. The concept

### Exceptions: errors that happen while running

You know these already:

| Exception | When | Example |
| --- | --- | --- |
| `ValueError` | the value has the right type but makes no sense | `int("three")` |
| `KeyError` | a dict has no such key | `price_of["Gold Watch"]` |
| `IndexError` | a list has no such position | `cart[5]` |
| `TypeError` | the wrong type for an operation | `"₹" + 299` |

When one of these happens, Python **raises** it: it stops the current line and looks for code that handles it. If there is none, you get a traceback and the program ends.

(A `SyntaxError` is different: Python finds it **before** running anything. You fix those in the code; you can't "handle" them.)

### `try` and `except`

```python title="try_except.py"
--8<-- "labs/04-python-fundamentals/06-errors-and-exceptions/examples/try_except.py"
```

```
'3': OK, 3 added to the cart
'three': please type a number, like 3
The shop is still running.
```

How it works:

1. Python runs the `try` block.
2. If no error happens, the `except` block is **skipped**.
3. If a `ValueError` happens, the rest of the `try` block is **skipped**, and the `except ValueError:` block runs instead.
4. Either way, the program continues after the whole `try`/`except`.

Keep the `try` block **small**: just the line that can fail. Then you know exactly which error you're catching.

### One `except` per error

Different problems deserve different answers:

```python title="two_errors.py"
--8<-- "labs/04-python-fundamentals/06-errors-and-exceptions/examples/two_errors.py"
```

```
Masala Box x2: ₹598
Gold Watch: sorry, Bazaar doesn't sell this
Cotton Kurta: bad quantity (invalid literal for int() with base 10: 'two')
```

- Python checks the `except` lines from top to bottom and runs the first one that matches.
- `except ValueError as error:` also gives you the error object. Printing it shows Python's message.

### `raise`: your own rules

Python raises errors for its own rules (`int("three")`). Your code can do the same for **Bazaar's** rules:

```python title="raise_error.py"
--8<-- "labs/04-python-fundamentals/06-errors-and-exceptions/examples/raise_error.py"
```

```
Reserved 2 Masala Box. 38 left.
Can't reserve 10 Wireless Earbuds: only 8 Wireless Earbuds left
Can't reserve 0 Masala Box: quantity must be at least 1
```

- `raise ValueError("…")` stops the function at once, like `return`, but with an error instead of a value.
- The function only says **what** is wrong. The caller decides **how** to show it: a message on the page, a log line, a different HTTP answer later in the course.
- Notice the stock didn't change for the refused orders: the `raise` happened before `stock[name] -= quantity`.

### `else` and `finally`

```python title="else_finally.py"
--8<-- "labs/04-python-fundamentals/06-errors-and-exceptions/examples/else_finally.py"
```

```
'5': 5 boxes
  (line checked)
'five': not a number
  (line checked)
```

- `else:` runs only when the `try` block had **no** error. It keeps the `try` block small.
- `finally:` runs **every time**, error or not. Later you'll use it to close files and database connections.

### Never catch everything blindly

A bare `except:` (with no error name) catches **every** error, even the ones that mean your code is wrong:

```python title="mistakes/bare_except.py"
--8<-- "labs/04-python-fundamentals/06-errors-and-exceptions/mistakes/bare_except.py"
```

```
please type a number
```

The customer typed "3", which is fine. The real problem is a typo in the code (`pirce_paise`), a `NameError`. The bare `except` hid it and showed a **wrong** message.
Bugs like this can hide for months. Always name the error: `except ValueError:`.

### An analogy

A shop's billing counter has a **plan for common problems**:

- `try` = "Try to scan the item."
- `except ValueError` = "If the barcode won't scan, type the price by hand." A plan for **one** known problem.
- `raise` = the cashier saying "Sorry, only 8 earbuds left." A clear reason, instead of silently selling 10.
- A bare `except` = "If **anything** goes wrong, just smile and say 'next customer'." Even when the till is on fire.

### Questions you may have

**Should I wrap my whole program in one big `try`?** No. Wrap the few lines that can fail for a reason you expect, and handle that reason.

**What if I don't know which error will happen?** Run it and look at the last line of the traceback: it names the error. Then catch that one.

**Isn't checking with `if` simpler?** Sometimes: `if name in price_of:` before looking up is fine. For things that are hard to check in advance,
like "is this text a valid number?", `try` is simpler and clearer.

## 3. See it in action

Pick a situation, type what the customer typed (try `3`, `three`, `-2`, or nothing), then press **Play**.

<div class="bz-diagram" data-diagram="try-except"></div>

## 4. Code example

The lab's exercise: Patel Spices uploads a bulk order, one quantity per line. One bad line crashes everything:

```python title="exercises/bulk_order.py"
--8<-- "labs/04-python-fundamentals/06-errors-and-exceptions/exercises/bulk_order.py"
```

```
Added 2
Traceback (most recent call last):
  File "/lab/exercises/bulk_order.py", line 9, in <module>
    quantity = int(text)
ValueError: invalid literal for int() with base 10: 'three'
```

The lines after it (`"5"`, `""` and `"1"`) never ran. The fix wraps only the line that can fail:

```python title="solutions/bulk_order.py"
--8<-- "labs/04-python-fundamentals/06-errors-and-exceptions/solutions/bulk_order.py"
```

```
Added 2
Skipped 'three': not a number
Added 5
Skipped '': not a number
Added 1
Total boxes: 8
```

**Why `continue` matters:** without it, after a bad line the loop carries on with the **old** `quantity` from the previous line:

```
Added 2
Skipped 'three': not a number
Added 2
Added 5
Skipped '': not a number
Added 5
Added 1
Total boxes: 15
```

No error, and 15 boxes instead of 8. That's `mistakes/forgot_continue.py` in the lab. Catching an error is only half the job: make sure the code after it does the right thing.

## 5. Under the hood

### Catching the wrong error

```python title="mistakes/wrong_except.py"
--8<-- "labs/04-python-fundamentals/06-errors-and-exceptions/mistakes/wrong_except.py"
```

```
Traceback (most recent call last):
  File "/lab/mistakes/wrong_except.py", line 2, in <module>
    quantity = int("three")
ValueError: invalid literal for int() with base 10: 'three'
```

`except KeyError` doesn't match a `ValueError`, so the error goes on up, uncaught, and the program stops as if there were no `try`.

### Where a raised error goes

When a function raises and doesn't catch, the error travels **up** to whoever called it, then to their caller, and so on.
The first `try` it meets with a matching `except` handles it. If none does, the traceback shows every call it passed through (Lesson 3).
That's why `reserve()` can raise, and the loop outside can catch.

??? note "Going deeper: your own exception classes"

    For bigger programs, give your errors their own names, so callers can catch exactly them:

    ```python
    class OutOfStock(Exception):
        """Raised when an order wants more items than Bazaar has."""


    try:
        raise OutOfStock("only 8 Wireless Earbuds left")
    except OutOfStock as error:
        print("Sorry:", error)              # Sorry: only 8 Wireless Earbuds left
    ```

    `class OutOfStock(Exception)` makes a new kind of exception (classes are Module 5). Django has many, like `Product.DoesNotExist` (Module 9).
    Exceptions form a family tree: `except Exception` catches almost everything, so it has the same problem as a bare `except`. Use it only at the very
    top of a program, to log the error before stopping.

??? note "Going deeper: re-raising, chaining, and EAFP"

    - Inside an `except` block, a bare `raise` re-raises the same error, after you've logged it, for example.
    - `raise ValueError("bad order line") from error` raises a new error and keeps the original as its cause; the traceback shows both.
    - Python style is often **EAFP**: "easier to ask forgiveness than permission". Try the action and catch the error, instead of checking
      everything first ("look before you leap", **LBYL**). With files and networks, checking first isn't even reliable: things can change between the check and the action.

??? note "Going deeper: errors in a web backend"

    In Bazaar's Django API (Level 2), every request runs inside the framework's own `try`. If your view raises and doesn't catch,
    the customer gets an HTTP **500 Internal Server Error**, and the traceback goes to the server's log (Module 2's `journalctl`).
    Expected problems get their own answers: a missing product becomes **404 Not Found**, bad input becomes **400 Bad Request** with a message.
    The pattern is the same as here: raise a clear error where the rule lives, handle it where you know what to show.

## 6. Lab

**Lab folder:** `labs/04-python-fundamentals/06-errors-and-exceptions/`

```bash
cd labs/04-python-fundamentals/06-errors-and-exceptions
docker compose run --rm python
```

Run the four examples, see how the wrong `except`, a bare `except` and a missing `continue` each go wrong in `mistakes/`,
then fix the bulk-order import so it skips bad lines and counts 8 boxes.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **A bare `except:`.** It hides real bugs (typos, wrong names) behind a friendly message. **Fix:** always name the error: `except ValueError:`.
2. **A huge `try` block.** You can't tell which line failed, or you catch errors you didn't expect. **Fix:** only the risky line(s) inside `try`.
3. **Catching, then carrying on as if nothing happened.** The old value is reused: 15 boxes instead of 8. **Fix:** `continue`, `return`, or set a safe value in the `except` block.
4. **Catching the wrong error type.** It still crashes. **Fix:** read the traceback's last line and catch that exact name.
5. **Printing an error deep inside a function.** The caller can't react. **Fix:** `raise` in the function; handle it (and print) in the caller.

## 8. Quiz

<div class="bz-quiz" data-quiz="m04-06"></div>

## 9. What's next

Next: keeping Bazaar's data when the program stops, by saving it to files, in JSON: [Files and JSON](07-files-and-json.md).

**In one line:** errors raise exceptions that stop the program unless handled; wrap the risky line in `try` and catch the exact error with
`except ValueError:`; `raise` your own errors for broken rules; `else` runs when nothing failed, `finally` always.

### Cheat sheet

| Task | Code |
| --- | --- |
| Try, and handle one error | `try:` … `except ValueError:` … |
| Handle two errors differently | `except KeyError:` … `except ValueError:` … |
| Keep the error object | `except ValueError as error: print(error)` |
| Only if no error | `else:` |
| Always, error or not | `finally:` |
| Break a rule on purpose | `raise ValueError("only 8 left")` |
| Skip a bad loop item | `except ValueError: continue` |

| Error | Typical cause |
| --- | --- |
| `ValueError` | `int("three")`, a broken business rule |
| `KeyError` | a dict key that isn't there |
| `IndexError` | a list position past the end |
| `TypeError` | wrong type, like `None >= 99900` |
| `NameError` | a name that doesn't exist (often a typo) |

> **Next in Bazaar:** every time the program stops, the catalog and every cart vanish, because they only live in memory.
> Next lesson: saving data to files, in JSON, the format web APIs speak.

<div class="bz-complete" data-lesson="m04-06"></div>
