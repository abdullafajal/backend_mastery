# Generators and context managers

<div class="bz-meta" markdown>
**Module** 5 · Advanced Python
**Lesson** 5
**Reading time** 15 min (+ optional deeper parts)
**You will build** a pipeline that reads 200,000 Bazaar orders one line at a time, and a "till" that always closes, even after an error
</div>

!!! abstract "In 1 minute"
    - A **generator** makes values **one at a time**, when asked, instead of building a whole list first. It uses almost no memory.
    - A function with `yield` is a generator: it hands out a value, **pauses**, and carries on from there when the next value is wanted.
    - Chain generators into a **pipeline** (read → parse → filter), and only one order is in memory at any moment, even for millions.
    - A generator can be used **once**. Loop over it a second time and it's empty.
    - A **context manager** runs setup when a `with` block starts and clean-up when it ends, **even after an error**. `open()` is one; `@contextlib.contextmanager` makes your own.

> **Previously in Bazaar:** decorators added timing and retries to any function in one line.

## 1. Why learn this?

Bazaar's order log has grown to 200,000 lines (and it will be millions). The finance team wants the number and total of paid orders.

The Module 4 way, "read every line into a list, then add up", builds 200,000 objects in memory at once. On a big Diwali day, that list can be
bigger than the server's RAM, and the program dies.

But the sum only ever needs **one** order at a time. Generators let Python work like that. And context managers make sure files (and later,
database connections) are always closed, whatever happens.

## 2. The concept

### `yield`: hand out a value, then pause

```python title="yield_demo.py"
--8<-- "labs/05-advanced-python/05-generators-and-context-managers/examples/yield_demo.py"
```

```
generator
  (generator starts)
1001
  (generator resumes)
1002
  (generator resumes again)
1003
  (generator ends)
```

- A function with `yield` in it is a **generator function**. Calling it runs **nothing**: it gives you a generator object.
- `next(numbers)` runs the function **until the next `yield`**, hands out that value, and **pauses** there, remembering every local name.
- The next `next()` **carries on from the pause**. A `for` loop simply calls `next()` again and again, until the function ends.

### Why it matters: memory

```python title="list_vs_generator.py"
--8<-- "labs/05-advanced-python/05-generators-and-context-managers/examples/list_vs_generator.py"
```

```
list:      8448728 bytes
generator: 200 bytes
same total? True
```

The same million numbers: 8.4 MB as a list, 200 bytes as a generator. The generator doesn't store the numbers; it only knows how to make the next one.
Round brackets instead of square ones turn a comprehension (Module 4) into a **generator expression**.

### A pipeline of generators

```python title="pipeline.py"
--8<-- "labs/05-advanced-python/05-generators-and-context-managers/examples/pipeline.py"
```

```
paid orders: 149,894
paid total:  ₹113,711,456
```

Read the line `paid = paid_only(parse(read_lines(...)))`: three generators, plugged into each other like pipes. **Nothing is read yet.**
When the `for` loop asks for an order:

1. `paid_only` asks `parse` for an order,
2. `parse` asks `read_lines` for a line,
3. `read_lines` reads **one** line from the file and yields it, then everything pauses again.

One line travels through the whole pipeline before the next is even read. The program uses the same small amount of memory for 200 orders or 200 million.

### Used once, then empty

A generator remembers where it paused. When it reaches the end, it stays at the end. A second loop over the same generator gets **nothing**.
That's this lesson's exercise (part 4). If you need the values twice, either keep them in a list (if they fit), or do both jobs in **one** loop.

### Context managers: `with` always cleans up

You've written `with open(...) as f:` since Module 4. `with` works with any **context manager**: an object that runs setup at the start of the block
and clean-up at the end, **whatever happens inside**. You can make your own:

```python title="context_managers.py"
--8<-- "labs/05-advanced-python/05-generators-and-context-managers/examples/context_managers.py"
```

```
Neha opens the till
  sold 2 Masala Box
Neha closes the till
Rohan opens the till
  selling Wireless Earbuds...
Rohan closes the till
error: card declined
```

- `@contextlib.contextmanager` turns a generator with **one** `yield` into a context manager: code before `yield` is the setup, code after is the clean-up.
- `try`/`finally` around the `yield` makes the clean-up run **even when the block raises**: Rohan's card was declined, and the till still closed.

That's exactly why `with open(...)` closes the file even if your code crashes halfway. Module 11 uses the same idea for database transactions.

### An analogy

A list is a **printed telephone directory**: every number is printed, bound and carried, even if you only need one.

A generator is **calling enquiry** (directory assistance): you ask, they tell you **one** number, and wait for your next question. They remember where you
got to, but they don't hand you the whole book. And once you've gone through to the end, the call is over.

A context manager is the **shop shutter rule**: whoever opens the shutter in the morning must pull it down at night, even if the day goes badly.

### Questions you may have

**Is a generator slower than a list?** Barely, and often faster overall, because nothing big has to be built first. Choose by memory, not speed.

**When should I still use a list?** When the data is small and you need it more than once, or need `len()`, sorting, or `data[5]`.

**Isn't a file already a generator of lines?** Yes: `for line in f` reads one line at a time. `read_lines` just wraps it, so the pipeline reads nicely.

## 3. See it in action

Pick a list or a generator, then press **Play**. Watch the MEMORY box.

<div class="bz-diagram" data-diagram="generator-flow"></div>

## 4. Code example

The lab's exercise: the average paid order value. It crashes:

```python title="exercises/average_order.py"
--8<-- "labs/05-advanced-python/05-generators-and-context-managers/exercises/average_order.py"
```

```
Traceback (most recent call last):
  File "/lab/exercises/average_order.py", line 16, in <module>
    print(f"average paid order: ₹{total // count // 100:,}")
                                  ~~~~~~^^~~~~~~
ZeroDivisionError: integer division or modulo by zero
```

`sum(amounts)` walked the generator **to the end**. The second walk, `sum(1 for _ in amounts)`, found nothing left: `count` is 0.
The fix does both jobs in **one** pass:

```python title="solutions/average_order.py (lines 12-17)"
--8<-- "labs/05-advanced-python/05-generators-and-context-managers/solutions/average_order.py:12:17"
```

```
average paid order: ₹758
```

Still one order in memory at a time, and the file is read only once.

## 5. Under the hood

### Asking past the end

```
Traceback (most recent call last):
  File "/lab/mistakes/stop_iteration.py", line 8, in <module>
    print(next(numbers))                 # nothing left
          ~~~~^^^^^^^^^
StopIteration
```

`StopIteration` is how a generator says "no more". A `for` loop catches it for you and simply stops; `next()` by hand doesn't.

### Generators have no length

```
TypeError: object of type 'generator' has no len()
```

A generator doesn't know how many values it will make until it has made them. Count while looping (`count += 1`), or use a list if it's small.

??? note "Going deeper: islice, yield from, and __enter__/__exit__"

    ```python title="deeper.py"
    --8<-- "labs/05-advanced-python/05-generators-and-context-managers/examples/deeper.py"
    ```

    ```
    ['Priya', 'Ravi', 'Priya']
    Neha opens the till
      Neha is selling
    Neha closes the till (error: None)
    ```

    - `itertools.islice(gen, 3)` takes the first 3 values and stops: the rest of the 200,000-line file is **never read**. `itertools` has many generator tools
      (`chain`, `groupby`, `batched` in 3.12+).
    - `yield from f` yields every value of another iterable: a short way to write `for line in f: yield line`.
    - A context manager class has `__enter__` (setup; its return value is what `as` gets) and `__exit__` (clean-up; it receives the error, if any).
      Returning `True` from `__exit__` would **swallow** the error. Almost never do that.

??? note "Going deeper: generators that receive values, and where else you'll meet them"

    - `value = yield x` lets the caller **send** a value in with `gen.send(...)`. This is how Python's `asyncio` (Lesson 8) began.
    - Django's `QuerySet.iterator()` streams database rows one by one instead of loading them all (Module 10).
    - A web server can stream a big CSV export as a generator, so the download starts before the whole file exists.

## 6. Lab

**Lab folder:** `labs/05-advanced-python/05-generators-and-context-managers/`

```bash
cd labs/05-advanced-python/05-generators-and-context-managers
docker compose run --rm python
```

Generate the 200,000-line order log, watch a generator pause at each `yield`, compare a list's memory with a generator's, sum the paid orders through a pipeline,
see a till close even after an error, and fix the average that crashes because a generator was used twice.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Looping over a generator twice.** The second loop is empty (here, a `ZeroDivisionError`). **Fix:** one pass, or a list if the data is small.
2. **`[ … ]` when you meant `( … )`.** A million-item list instead of a generator. **Fix:** round brackets inside `sum()`, `any()`, a `for`.
3. **`len()` or `[0]` on a generator.** `TypeError`. **Fix:** count while looping, or `list(...)` small data first.
4. **Opening files without `with`.** An error halfway leaves them open. **Fix:** always `with open(...)`.
5. **Clean-up without `finally` in a `@contextmanager`.** An error skips it. **Fix:** `try: yield` / `finally:` clean-up.

## 8. Quiz

<div class="bz-quiz" data-quiz="m05-05"></div>

## 9. What's next

Next: giving each project its own set of installed packages, and turning Bazaar into an installable package: [Virtual environments and packaging](06-venv-and-packaging.md).

**In one line:** a generator yields values one at a time and pauses in between, so pipelines over millions of lines use almost no memory;
it can be used only once; a context manager (`with`) always runs its clean-up, even after an error.

### Cheat sheet

| Task | Code |
| --- | --- |
| A generator function | `def read_lines(path): … yield line` |
| A generator expression | `(o["price_paise"] for o in orders)` |
| Next value by hand | `next(gen)` (`StopIteration` at the end) |
| A pipeline | `paid_only(parse(read_lines(path)))` |
| Only the first N | `itertools.islice(gen, 3)` |
| Your own context manager | `@contextlib.contextmanager` + `try: yield` / `finally: …` |
| Use it | `with till_open("Neha"): …` |

> **Next in Bazaar:** Bazaar's code now needs mypy, and soon Django and more. Install them all into your computer's one Python, and two projects
> will fight over versions. Next lesson: virtual environments, and packaging Bazaar properly.

<div class="bz-complete" data-lesson="m05-05"></div>
