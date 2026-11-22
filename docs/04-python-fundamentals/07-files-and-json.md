# Files and JSON

<div class="bz-meta" markdown>
**Module** 4 · Python fundamentals
**Lesson** 7
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's order log as a text file, the catalog and carts saved as JSON, and a safe loader for missing or broken files
</div>

!!! abstract "In 1 minute"
    - Everything in a running program lives in **memory**, and memory is wiped when the program ends. To keep data, write it to a **file** on the disk.
    - `with open("data/orders.log", "w", encoding="utf-8") as f:` opens a file and closes it for you. `"w"` writes (and **empties** the file first), `"a"` adds to the end, no mode reads.
    - **JSON** is a text format for data: lists, dicts, numbers, text, `true`/`false`, `null`. Almost every web API speaks it.
    - `json.dump(data, f)` writes Python data as JSON; `json.load(f)` reads it back as Python data.
    - Expect problems: a missing file raises `FileNotFoundError`, a broken one `json.JSONDecodeError`. Catch them (Lesson 6).

> **Previously in Bazaar:** Bazaar learned to handle bad input with `try` and `except` instead of crashing.

## 1. Why learn this?

Run any Bazaar program from this module, and it builds a catalog and carts. Then the program ends, and **everything is gone**.
The next run starts from nothing. Asha's cart, today's orders, the stock counts: all lost.

A shop that forgets every sale overnight can't work. Bazaar needs to **save** its data and **load** it again. In Level 2 that will be a database.
Today, it's the simplest kind of storage there is: files. And the format: JSON, which you'll use in every API you ever build.

## 2. The concept

### Memory vs disk

Remember Module 1: **RAM** (memory) is fast but forgets everything when the program stops. The **disk** is slower but keeps files until you delete them.

| | Memory (variables) | Disk (files) |
| --- | --- | --- |
| Where | inside the running program | in a folder, like `data/` |
| Survives the program ending? | no | yes |
| How Python uses it | `catalog = [...]` | `open(...)`, `json.dump(...)` |

### Opening a file: `with open(...)`

```python title="text_file.py"
--8<-- "labs/04-python-fundamentals/07-files-and-json/examples/text_file.py"
```

```
Asha bought 2 Masala Box for ₹598
Ravi bought 1 Cotton Kurta for ₹649
Priya bought 1 Steel Water Bottle for ₹349
```

- `open(path, mode, encoding="utf-8")` opens the file. `as f` gives it a name for the indented block.
- **`with`** closes the file automatically at the end of the block, even if an error happens. Always use it.
- `encoding="utf-8"` tells Python how to store letters as bytes. UTF-8 handles `₹`, Hindi, and every other script. Always pass it.
- `f.write(text)` doesn't add a new line by itself: end each line with `\n`.

| Mode | Means | If the file exists |
| --- | --- | --- |
| `"r"` (or none) | read | read it |
| `"w"` | write | **empty it first** |
| `"a"` | append | add at the end |

### JSON: data as text

A file holds **text** (or bytes), not Python lists and dicts. To save a dict, you must turn it into text first, in a format that can be turned back.
**JSON** (JavaScript Object Notation) is that format. It looks almost like Python:

```python title="json_text.py"
--8<-- "labs/04-python-fundamentals/07-files-and-json/examples/json_text.py"
```

```
{"customer": "Ravi", "items": [["Cotton Kurta", 1]], "coupon": null, "gift": true}
str
{'customer': 'Ravi', 'items': [['Cotton Kurta', 1]], 'coupon': None, 'gift': True}
```

The small differences:

| Python | JSON |
| --- | --- |
| `{"name": "Masala Box"}` dict | `{"name": "Masala Box"}` object |
| `[1, 2]` list (and tuples) | `[1, 2]` array |
| `True` / `False` / `None` | `true` / `false` / `null` |
| `'text'` or `"text"` | only `"text"`: **double quotes** |

`json.dumps` (dump to a **s**tring) and `json.loads` (load from a **s**tring) work with text in memory. That's exactly what an API does:
Bazaar's backend will `dumps` the catalog and send the text over the network (Module 7).

### Saving and loading the catalog

To work with **files**, use `json.dump` and `json.load` (no `s`):

```python title="save_catalog.py"
--8<-- "labs/04-python-fundamentals/07-files-and-json/examples/save_catalog.py"
```

```
Wireless Earbuds False
same data? True
```

And this is what's now on the disk, in `data/catalog.json`. Open it in VS Code:

```json
[
  {
    "name": "Masala Box",
    "price_paise": 29900,
    "seller": "Patel Spices",
    "in_stock": true
  },
  {
    "name": "Wireless Earbuds",
    "price_paise": 149900,
    "seller": "Sharma Electronics",
    "in_stock": false
  }
]
```

`indent=2` makes it readable for people. Without it, JSON is one long line: just as correct, but hard to read.

### Loading safely

Two things go wrong all the time: the file isn't there yet (a new customer has no saved cart), or it's broken (a save stopped halfway).

```python title="safe_load.py"
--8<-- "labs/04-python-fundamentals/07-files-and-json/examples/safe_load.py"
```

```
{'items': []}
data/broken.json is broken (Expecting value: line 1 column 12 (char 11)); starting with an empty cart
{'items': []}
```

Exactly Lesson 6's pattern: a small `try`, one `except` per expected problem, and a sensible answer for each.

### An analogy

Memory is the **whiteboard** at the shop counter: quick to write on, wiped every night.
A file is the **register book** in the cupboard: slower to write, but it's still there tomorrow.

JSON is the **standard form** everyone agrees on. Any shop (any program, in any language) can read a form filled in this format.

### Questions you may have

**Where is the file?** The path `data/orders.log` is **relative**: it starts from the folder you're in when you run the program (Module 1). In the lab, that's `/lab`.

**Why not just `print` into a file?** You can (`print(..., file=f)`), but `json.dump` is what makes data loadable again.

**Is a JSON file a database?** For one small program, it's enough. With many customers buying at the same moment, two saves can clash. That's one reason Level 2 brings in PostgreSQL.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="file-json"></div>

## 4. Code example

The lab's exercise saves Asha's cart and loads it back. Loading crashes:

```python title="exercises/save_cart.py"
--8<-- "labs/04-python-fundamentals/07-files-and-json/exercises/save_cart.py"
```

The traceback is long, because the error happened deep inside Python's own `json` code. Here are its first and last lines:

```
Traceback (most recent call last):
  File "/lab/exercises/save_cart.py", line 16, in <module>
    loaded = json.load(f)
(… lines from Python's own json code skipped …)
json.decoder.JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)
```

(The lines in the middle, from `/usr/local/lib/python3.13/json/`, are Python's own files. Skip them: look for **your** file's line, and the **last** line.)

Now open `data/asha_cart.json`. `str(cart)` wrote Python's way of showing a dict, with single quotes:

```
{'customer': 'Asha', 'items': [{'name': 'Masala Box', 'price_paise': 29900, 'quantity': 2}, {'name': 'Cotton Kurta', 'price_paise': 64900, 'quantity': 1}]}
```

JSON needs **double quotes**, so `json.load` stops at character 1, the first `'`. The fix is one line:

```python title="solutions/save_cart.py (lines 11-12)"
--8<-- "labs/04-python-fundamentals/07-files-and-json/solutions/save_cart.py:11:12"
```

```
Asha's cart: ₹1,247
```

Write with `json.dump`, read with `json.load`. Never build JSON by hand with `str()` or string joining.

## 5. Under the hood

### Things JSON can't hold

```
Traceback (most recent call last):
  File "/lab/mistakes/set_to_json.py", line 4, in <module>
    print(json.dumps(sellers))
          ~~~~~~~~~~^^^^^^^^^
(… lines from Python's own json code skipped …)
TypeError: Object of type set is not JSON serializable
```

JSON has no sets (and no `Decimal`, no dates). Convert first: `json.dumps(sorted(sellers))` saves a list. **Serializable** means "can be turned into text".

### A file that isn't there

```
Traceback (most recent call last):
  File "/lab/mistakes/missing_file.py", line 1, in <module>
    with open("data/old_orders.log", encoding="utf-8") as f:
         ~~~~^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
FileNotFoundError: [Errno 2] No such file or directory: 'data/old_orders.log'
```

### `"w"` empties the file, silently

```python title="mistakes/w_erases.py"
--8<-- "labs/04-python-fundamentals/07-files-and-json/mistakes/w_erases.py"
```

```
''
```

No error. The order log is simply gone, the moment `open(..., "w")` ran. To read, open with no mode (or `"r"`). To add, use `"a"`.

??? note "Going deeper: pathlib, ensure_ascii, and saving safely"

    ```python title="deeper.py"
    --8<-- "labs/04-python-fundamentals/07-files-and-json/examples/deeper.py"
    ```

    ```
    deeper.log True Masala Box restocked: 40
    "₹299" "₹299"
    asha_cart_safe.json Asha False
    ```

    - `pathlib.Path` treats paths as objects: `Path("data") / "deeper.log"` works on Linux, Mac and Windows. `.read_text()` and `.write_text()` open and close for you.
    - By default `json.dumps` writes non-English characters as codes like `₹` (that's `₹`). Both are valid JSON; `ensure_ascii=False` keeps them readable.
    - **Safe save:** if the program crashes halfway through writing, the file is left broken (like `broken.json`). Writing to a temporary file and then
      `os.replace()`-ing it over the real one means the real file is always either the old version or the new one, never half of each.

??? note "Going deeper: other formats you'll meet"

    | Format | Looks like | Used for |
    | --- | --- | --- |
    | CSV | `Masala Box,29900,Patel Spices` | spreadsheets, seller bulk uploads (Python's `csv` module) |
    | JSON Lines | one JSON object per line | big logs and exports, read line by line |
    | YAML / TOML | `name: Masala Box` | config files (Docker Compose uses YAML) |
    | Binary (pickle) | not readable text | Python-only; **never** load a pickle you didn't make: it can run code |

    Big files: `for line in f:` reads one line at a time, so even a 10 GB log never has to fit in memory. `f.read()` loads the whole file at once.

## 6. Lab

**Lab folder:** `labs/04-python-fundamentals/07-files-and-json/`

```bash
cd labs/04-python-fundamentals/07-files-and-json
docker compose run --rm python
```

The programs write into the lab's `data/` folder, so you can open every file they make in VS Code. Write and read the order log, save the catalog
as JSON and look at the file, load a missing and a broken cart safely, meet three file mistakes, and fix Asha's cart so it saves real JSON.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Opening with `"w"` to read.** The file is emptied before you read a byte. **Fix:** no mode (read) or `"a"` (add).
2. **Saving with `str(data)`.** Single quotes, `True`, `None`: not JSON, and `json.load` fails. **Fix:** `json.dump(data, f)`.
3. **Forgetting `encoding="utf-8"`.** On some computers, `₹` becomes garbage or an error. **Fix:** always pass it.
4. **Not handling a missing or broken file.** The first new customer crashes the shop. **Fix:** catch `FileNotFoundError` and `json.JSONDecodeError`.
5. **Running from the wrong folder.** `data/...` is relative, so `FileNotFoundError`. **Fix:** run from the lab folder (`/lab`), or build paths with `pathlib`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m04-07"></div>

## 9. What's next

Next: splitting Bazaar into files that import each other, and building Bazaar v0, a command-line catalog: [Modules, and Bazaar v0](08-modules-and-bazaar-v0.md).

**In one line:** memory forgets and files remember; open files with `with open(path, mode, encoding="utf-8")`; save data as JSON with `json.dump`,
read it with `json.load`, and handle `FileNotFoundError` and `JSONDecodeError`.

### Cheat sheet

| Task | Code |
| --- | --- |
| Write text (empties the file!) | `with open("data/x.log", "w", encoding="utf-8") as f: f.write("…\n")` |
| Add to the end | `open(path, "a", encoding="utf-8")` |
| Read line by line | `with open(path, encoding="utf-8") as f: for line in f: …` |
| Save data as JSON | `json.dump(data, f, indent=2, ensure_ascii=False)` |
| Load JSON | `data = json.load(f)` |
| Data ↔ JSON text (no file) | `json.dumps(data)` / `json.loads(text)` |
| No file yet | `except FileNotFoundError:` |
| Broken JSON | `except json.JSONDecodeError:` |

> **Next in Bazaar:** Bazaar's code is spread across many little files, each copying `rupees()` and the catalog. Next lesson: modules,
> so one file can `import` another, and then all of Module 4 comes together in Bazaar v0.

<div class="bz-complete" data-lesson="m04-07"></div>
