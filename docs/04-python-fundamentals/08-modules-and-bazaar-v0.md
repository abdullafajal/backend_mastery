# Modules, and Bazaar v0

<div class="bz-meta" markdown>
**Module** 4 · Python fundamentals
**Lesson** 8
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar v0: a command-line product catalog in three modules, where you can add, list and search products, saved as JSON
</div>

!!! abstract "In 1 minute"
    - Every `.py` file is a **module**. `import catalog` lets one file use the functions of another, so each piece of code lives in **one** place.
    - Python comes with a big **standard library**: ready modules like `json`, `datetime` and `random`. Just `import` them.
    - `import money` then `money.rupees(...)`, or `from money import rupees` then `rupees(...)`.
    - Importing a file **runs** it once. Code under `if __name__ == "__main__":` runs only when you run that file directly, not when it's imported.
    - Bazaar v0 puts all of Module 4 together: `money.py`, `catalog.py`, and `main.py`, which you run as `python3 main.py add "Masala Box" 299 "Patel Spices"`.

> **Previously in Bazaar:** Bazaar learned to save its catalog and carts as JSON files, so data survives a restart.

## 1. Why learn this?

Look back at this module's labs: `rupees()` was written again in almost every lab, and the catalog was copied into several files.
When the money format changes, someone has to find and fix every copy, and one will be missed (Lesson 3's lesson, at a bigger scale).

Real programs are split into files by job: one for money, one for the catalog, one for the command line. Each file is written once and **imported** where it's needed.
Every big Python project, Django included, is built this way. And the pieces you learned in this module finally become one working program: **Bazaar v0**.

## 2. The concept

### A module is just a `.py` file

`money.py` is a module named `money`. Anything defined in it (functions, constants) can be used by other files:

```python
import money                          # run money.py, and give me its names under "money."
print(money.rupees(29900))            # ₹299.00

from money import rupees              # or: bring just this name in directly
print(rupees(29900))                  # ₹299.00
```

| Form | Use it as | Good when |
| --- | --- | --- |
| `import money` | `money.rupees(...)` | you use several things, and want to see where each comes from |
| `from money import rupees` | `rupees(...)` | you use one or two names a lot |

Python looks for `money.py` **in the folder of the file you ran** first, then in the standard library.

### The standard library: modules that come with Python

You've used one already: `json`. Python ships with hundreds more, so you don't write everything yourself:

```python title="stdlib_tour.py"
--8<-- "labs/04-python-fundamentals/08-modules-and-bazaar-v0/examples/stdlib_tour.py"
```

```
average price: 759 rupees
delivery by: 2026-11-06
today's lucky coupon: DIWALI150
{"ok": true}
```

`statistics` for averages, `datetime` for dates, `random` for random choices, `json` for JSON, `pathlib` for paths, `sys` and `os` for talking to the system.
Before writing a helper, check whether the standard library already has it.

### Importing runs the file, once

When Python meets `import who_am_i`, it runs `who_am_i.py` from top to bottom. Every module also has a name in a special variable, `__name__`:

```python title="who_am_i.py"
--8<-- "labs/04-python-fundamentals/08-modules-and-bazaar-v0/examples/who_am_i.py"
```

```python title="import_it.py"
--8<-- "labs/04-python-fundamentals/08-modules-and-bazaar-v0/examples/import_it.py"
```

Run each one:

```
$ python3 examples/who_am_i.py
who_am_i.py says its __name__ is '__main__'
I was run directly, so this part runs too.

$ python3 examples/import_it.py
who_am_i.py says its __name__ is 'who_am_i'
import_it.py is '__main__'
```

- The file you **run** gets the name `"__main__"`.
- A file that is **imported** gets its own name (`"who_am_i"`).

So `if __name__ == "__main__":` means "**only if this file was run directly**". Put the code that should run when you start the program there,
and the file can also be imported safely, without that code running.

### Bazaar v0: three modules

Here's the whole program. Each file has one job.

**`money.py`**: showing and reading money. Everything is paise (Lesson 1).

```python title="bazaar_v0/money.py"
--8<-- "labs/04-python-fundamentals/08-modules-and-bazaar-v0/bazaar_v0/money.py"
```

**`catalog.py`**: the catalog's rules. A list of dicts (Lesson 4), saved as JSON (Lesson 7), with `raise` for broken rules (Lesson 6) and a comprehension for search (Lesson 5).

```python title="bazaar_v0/catalog.py"
--8<-- "labs/04-python-fundamentals/08-modules-and-bazaar-v0/bazaar_v0/catalog.py"
```

**`main.py`**: the command line. It reads what you typed, calls the other two modules, and prints the answer.

```python title="bazaar_v0/main.py"
--8<-- "labs/04-python-fundamentals/08-modules-and-bazaar-v0/bazaar_v0/main.py"
```

`sys.argv` is the list of words typed after `python3`. For `python3 main.py search box` it's `["main.py", "search", "box"]`,
so `sys.argv[1:]` is `["search", "box"]`. Quotes keep several words together: `"Masala Box"` is one argument.

### Bazaar v0 in action

```
$ python3 main.py list
No products.
$ python3 main.py add "Red Running Shoes" 999 "Kumar Footwear"
Added Red Running Shoes at ₹999.00.
$ python3 main.py add "Wireless Earbuds" 1,499 "Sharma Electronics"
Added Wireless Earbuds at ₹1,499.00.
```

After adding all five products:

```
$ python3 main.py list
Red Running Shoes       ₹999.00  Kumar Footwear
Cotton Kurta            ₹649.00  Meera Handloom
Masala Box              ₹299.00  Patel Spices
Wireless Earbuds      ₹1,499.00  Sharma Electronics
Steel Water Bottle      ₹349.00  Sharma Electronics
$ python3 main.py search sharma
Wireless Earbuds      ₹1,499.00  Sharma Electronics
Steel Water Bottle      ₹349.00  Sharma Electronics
$ python3 main.py add "masala box" 299 "Patel Spices"
Not added: 'masala box' is already in the catalog
$ python3 main.py add "Gift Card" abc "Bazaar"
Not added: not a price: 'abc'
```

Stop the program, start it again: the products are still there, because `catalog.json` is on the disk.

### An analogy

A module is a **department** in Bazaar's office. Accounts (`money.py`) handles money; Inventory (`catalog.py`) handles products;
the Front desk (`main.py`) talks to customers.

- `import` is the front desk calling a department: it doesn't need to know **how** they work, only **what** to ask for.
- The standard library is the **market outside**: ready-made services you just use, instead of building your own.
- `if __name__ == "__main__":` is the sign "**open to customers only when this office is the one they walked into**".

### Questions you may have

**Why `import catalog` but `from money import ...`?** Both work. `catalog.load()` reads clearly ("load from the catalog"); `rupees(...)` is used so often that the short form is nicer.

**Can two modules import each other?** It's possible but messy (a "circular import"). Design so imports go one way: `main` → `catalog`, `main` → `money`.

**Where do modules like Django come from?** They aren't in the standard library. You install them with a package manager. Module 5 shows `pip` and `uv`.

## 3. See it in action

Pick what you run, then press **Play**.

<div class="bz-diagram" data-diagram="imports"></div>

## 4. Code example

The lab's exercise: Bazaar v0's search, as a small module. It finds nothing for "box":

```python title="exercises/search.py"
--8<-- "labs/04-python-fundamentals/08-modules-and-bazaar-v0/exercises/search.py"
```

```
[]
[]
['Masala Box']
```

`"box" in "Masala Box"` is `False`: `b` and `B` are different letters. Make **both** sides lowercase before comparing:

```python title="solutions/search.py (lines 9-11)"
--8<-- "labs/04-python-fundamentals/08-modules-and-bazaar-v0/solutions/search.py:9:11"
```

```
['Masala Box']
['Steel Water Bottle']
['Masala Box']
```

That's exactly what `bazaar_v0/catalog.py`'s `search()` does, for names **and** sellers.

## 5. Under the hood

### A typo in an import

```
Traceback (most recent call last):
  File "/lab/mistakes/typo_import.py", line 1, in <module>
    import mony                         # typo: the module is money.py
    ^^^^^^^^^^^
ModuleNotFoundError: No module named 'mony'
```

### Naming your file like a standard module

The lab's `mistakes/shadow/` folder has a file called `json.py`. Now `import json` in that folder finds **that** file instead of Python's:

```
Traceback (most recent call last):
  File "/lab/mistakes/shadow/app.py", line 3, in <module>
    print(json.dumps({"ok": True}))
          ^^^^^^^^^^
AttributeError: module 'json' has no attribute 'dumps' (consider renaming '/lab/mistakes/shadow/json.py' since it has the same name as the standard library module named 'json' and prevents importing that standard library module)
```

Python 3.13 even tells you the fix: rename the file. Never name your files `json.py`, `random.py`, `math.py`, `test.py` and so on.

### Exit codes

`main()` returns `0` (worked), `1` (refused) or `2` (wrong command), and `sys.exit()` hands that number to the shell. That's the exit code from Module 2:
`python3 main.py add "Gift Card" abc "Bazaar"; echo $?` prints the message, then `1`. Scripts and tests can check it.

??? note "Going deeper: packages and `python -m`"

    A **package** is a folder of modules. Put `money.py` and `catalog.py` in a folder `bazaar/`, add an (often empty) `__init__.py`,
    and import them as `from bazaar import money` or `from bazaar.catalog import search`. Django apps are packages.

    `python3 -m json.tool data/catalog.json` runs a module **by its import name** (here, a JSON pretty-printer from the standard library).
    For your own package: `python3 -m bazaar.main`. Running with `-m` makes imports inside the package work the same way every time.

??? note "Going deeper: where Python looks (sys.path)"

    Python searches the folders in the list `sys.path`, in order: the folder of the script you ran, then the standard library, then installed
    third-party packages (`site-packages`). The first match wins. That's why your `json.py` beat the real one, and why Bazaar v0's `main.py`
    finds `catalog.py` no matter which folder you run it from.

    Each module is run **once** per program. A second `import catalog` just reuses the loaded module (it's kept in `sys.modules`).

??? note "Going deeper: Bazaar v0's design choices"

    - `main.py` only handles the command line: it parses, calls, prints. All rules live in `catalog.py`, which never prints. That's why the same
      `catalog.py` could later sit behind a website instead of a terminal. Module 8's Django version keeps the same idea.
    - The catalog file path is built from `Path(__file__).parent`, so it works from any folder. `BAZAAR_DATA` (an environment variable) lets the
      lab's test use a temporary file, so your own catalog is never touched.
    - `argparse` (standard library) builds a full command-line interface with `--help`. v0 keeps it simple; it's worth a look.

## 6. Lab

**Lab folder:** `labs/04-python-fundamentals/08-modules-and-bazaar-v0/`

```bash
cd labs/04-python-fundamentals/08-modules-and-bazaar-v0
docker compose run --rm python
```

Tour the standard library, see `__name__` change between running and importing, meet the two import mistakes, fix the case-sensitive search,
and then use **Bazaar v0**: add the five Bazaar products, list them, search by name and seller, see the refusals, and restart to find your data still there.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Copying a helper into every file.** The copies drift apart. **Fix:** one module, imported everywhere.
2. **Naming a file like a standard module** (`json.py`, `random.py`). Python imports yours instead. **Fix:** pick unique names, like `bazaar_json.py`.
3. **Top-level code that runs on import.** Importing `money` would print test lines. **Fix:** put it under `if __name__ == "__main__":`.
4. **Printing inside the rules module.** Then it only works in a terminal. **Fix:** rules `return` or `raise`; `main.py` prints.
5. **Case-sensitive search.** "box" doesn't find "Masala Box". **Fix:** `.lower()` both sides.

## 8. Quiz

<div class="bz-quiz" data-quiz="m04-08"></div>

## 9. What's next

Module 4 is complete! You can now write real Python: types, decisions, loops, functions, containers, errors, files and modules.
Next, in Module 5, Bazaar's Python grows up: classes, decorators, generators, type hints, packaging, and doing many things at once: [Advanced Python](../05-advanced-python/index.md).

**In one line:** each `.py` file is a module; `import` reuses its code instead of copying it; the standard library gives you `json`, `datetime` and more;
`if __name__ == "__main__":` marks the code that runs only when the file is run directly; Bazaar v0 joins it all into one program.

### Cheat sheet

| Task | Code |
| --- | --- |
| Use a whole module | `import catalog` → `catalog.load(path)` |
| Use one name from it | `from money import rupees` → `rupees(29900)` |
| Standard library examples | `import json`, `from datetime import date`, `import random`, `from pathlib import Path` |
| Run only when run directly | `if __name__ == "__main__":` |
| Words typed after `python3` | `import sys` → `sys.argv[1:]` |
| Give the shell an exit code | `sys.exit(main(sys.argv[1:]))` |

| Bazaar v0 command | Does |
| --- | --- |
| `python3 main.py list` | show every product |
| `python3 main.py add "Masala Box" 299 "Patel Spices"` | add one (prices like `299`, `1,499`, `349.00`) |
| `python3 main.py search box` | find by name or seller |

> **Next in Bazaar:** v0 works, but its products are plain dicts: nothing stops someone writing `"price": "cheap"`. And soon Bazaar must call
> 100 supplier APIs without waiting for each one in turn. Module 5: Advanced Python.

<div class="bz-complete" data-lesson="m04-08"></div>
