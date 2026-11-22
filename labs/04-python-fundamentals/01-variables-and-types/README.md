# Lab 04-01: Variables, types, and money in paise

**Goal:** try Python's basic types in the REPL, run Bazaar examples, see the float money bug for yourself,
and fix Ravi's invoice so the total is exactly `₹1,531.64`.

**Time:** about 25 minutes.

**You need:** Docker running. VS Code (Module 0) to edit files is handy, but `nano` inside the container works too.

## How this lab works

The container runs Python 3.13 (`python:3.13.18-slim-trixie`). This lab folder is shared with it as `/lab`:
change a file in VS Code on your computer, and the container sees the change at once.

| Folder | What's inside |
| --- | --- |
| `examples/` | four small programs from the lesson |
| `exercises/invoice.py` | Ravi's invoice, with a money bug for you to fix |
| `solutions/invoice.py` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

You get a shell in `/lab`. Type `exit` to leave.

## Task 1: The REPL

```bash
python3
```

At the `>>>` prompt, type each line and press Enter:

```python
type(29900)
0.1 + 0.2
int("3")
29900 // 100
29900 % 100
```

**Expected output:**

```
<class 'int'>
0.30000000000000004
3
299
0
```

Now three mistakes, on purpose:

```python
int("three")
"Price: ₹" + 299
price = 999
Price
```

**Expected output** (the most important part is the last line of each error):

```
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    int("three")
    ~~~^^^^^^^^^
ValueError: invalid literal for int() with base 10: 'three'
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    "Price: ₹" + 299
    ~~~~~~~~~~~^~~~~
TypeError: can only concatenate str (not "int") to str
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    Price
NameError: name 'Price' is not defined. Did you mean: 'price'?
```

Fix the second one: `"Price: ₹" + str(299)` gives `'Price: ₹299'`. Leave the REPL with `exit()`.

## Task 2: Five types

```bash
python3 examples/types_tour.py
```

**Expected output:**

```
'Masala Box'   type: str
29900          type: int
True           type: bool
4.5            type: float
None           type: NoneType
```

## Task 3: Names move, objects stay

```bash
python3 examples/names.py
```

**Expected output:**

```
price:     899
old_price: 999
same object? False
```

## Task 4: Text from a customer

```bash
python3 examples/cart_line.py
```

**Expected output:**

```
Cotton Kurta x 3 = ₹1,947
type of quantity_text: str
type of quantity:      int
'3' * 3 = 333
```

## Task 5: The money bug

```bash
python3 examples/money_bug.py
```

**Expected output:**

```
float total: 765.8199999999999
equals 765.82? False
paise total: 76582
shown to the customer: ₹765.82
```

## Task 6: Fix Ravi's invoice

Run the buggy version:

```bash
python3 exercises/invoice.py
```

```
Customer: Ravi
Subtotal: 1298.0
GST 18%:  233.64
Total:    1531.6399999999999
```

Open `exercises/invoice.py` in VS Code (or `nano exercises/invoice.py`). Change it so that:

1. every price is an `int` number of paise (`99900`, `29900`);
2. GST is `subtotal * 18 // 100`;
3. every amount is printed as rupees with two paise digits, using `//`, `%` and an f-string.

When it's right, it prints **exactly**:

```
Customer: Ravi
Subtotal: ₹1,298.00
GST 18%:  ₹233.64
Total:    ₹1,531.64
```

Compare with `python3 solutions/invoice.py`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Running the lab's programs in python:3.13.18-slim-trixie...
PASS: types_tour.py: str, int, bool, float, None
PASS: money_bug.py: float gives 765.8199999999999, paise give exactly ₹765.82
PASS: cart_line.py: int("3") converts text to a number
PASS: names.py: assigning again moves the name, the old value stays
PASS: the exercise really shows the float bug (1531.6399999999999)
PASS: solution: Ravi's invoice in paise is exactly ₹1,531.64
PASS: int("three") gives ValueError
PASS: str + int gives TypeError
ALL CHECKS PASSED
```

`test_lab.sh` checks the lab's own files. It does not grade your `exercises/invoice.py`: compare your output with the expected output above.

## Stuck?

- **`TypeError: can only concatenate str (not "int") to str`**: you joined text and a number with `+`. Use an f-string: `f"Total: ₹{total}"`.
- **`ValueError: Unknown format code 'd' for object of type 'float'`**: an amount is still a float, so `:02d` can't format it.
  Did you write `* 0.18` or `/ 100`? Use `* 18 // 100` and `// 100`.
- **An amount like `₹1,531.5` when it should be `₹1,531.05`**: pad the paise to two digits: `{p % 100:02d}`, not `{p % 100}`.
- **`python3: can't open file`**: you're not in `/lab`. Run `cd /lab`.

## Clean up

```bash
docker compose down
```
