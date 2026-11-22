# Lab 00-03: Python, PATH and "command not found"

**Goal:** see where Python lives, how PATH finds it, break PATH on purpose, fix it,
and check that the Python on **your own computer** is ready for Bazaar.

**Time:** about 15 minutes.

**You need:** Docker running. For Task 6, Python installed on your computer (see the lesson).

Tasks 1–5 run inside containers, so you can't break anything on your computer.

## What is in this folder

| File | What it does |
| --- | --- |
| `examples/check_python.py` | Checks your Python version and adds up Asha's cart. |
| `docker-compose.yml` | Two services: `python` (Python 3.13) and `old-python` (Python 3.12). |
| `test_lab.sh` | Checks that everything works. |

Every command below has the same shape:

```
docker compose run --rm <service> <command>
```

It starts a fresh container, runs one command in it, and removes the container (`--rm`).

## Task 1: Which Python is this?

```bash
docker compose run --rm python python3 --version
```

**Expected output:**

```
Python 3.13.18
```

The first time, Docker may also print a line like `Network ..._default  Created`. That is normal.

## Task 2: Run the check script

```bash
docker compose run --rm python python3 check_python.py
```

**Expected output:**

```
Python version   : 3.13.18
Python lives at  : /usr/local/bin/python3
Operating system : Linux
Asha's cart total: ₹1247
Ready to build Bazaar!
```

`Python lives at` shows the exact file that ran your script. Remember `/usr/local/bin`.

## Task 3: Look at PATH

Ask where `python3` is, and print PATH:

```bash
docker compose run --rm python which python3
docker compose run --rm python sh -c 'echo $PATH'
```

**Expected output:**

```
/usr/local/bin/python3
/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

`which` searches PATH just like the shell does, and prints what it finds.
PATH is a list of folders, separated by `:`. The first folder is `/usr/local/bin`,
and that is where `python3` lives.

## Task 4: Break PATH on purpose

Now run `python3` with a PATH that has **only** `/usr/bin`:

```bash
docker compose run --rm python bash -c 'PATH=/usr/bin python3 --version'
```

**Expected output:**

```
bash: line 1: python3: command not found
```

Python is still installed! The shell just doesn't look in `/usr/local/bin` any more.
This is exactly what happens on a computer where the installer did not add Python to PATH.

Now use the **full path**. The shell does not need PATH when you give it the exact file:

```bash
docker compose run --rm python bash -c 'PATH=/usr/bin /usr/local/bin/python3 --version'
```

**Expected output:**

```
Python 3.13.18
```

## Task 5: What an old Python looks like

```bash
docker compose run --rm old-python python3 check_python.py
```

**Expected output:**

```
Python version   : 3.12.16
Python lives at  : /usr/local/bin/python3
Operating system : Linux
Not ready: please install Python 3.13 or newer.
```

The script also ends with exit code `1`, which means "something went wrong".
Programs and scripts use exit codes to tell each other if they worked.

## Task 6: Check YOUR computer

Install Python and VS Code using the lesson. Then open this lab folder in VS Code,
open its terminal (**Terminal → New Terminal**), and run:

On **macOS / Linux**:

```bash
python3 examples/check_python.py
```

On **Windows** (PowerShell):

```powershell
py examples\check_python.py
```

**Expected output:** the same lines as Task 2, but with your own version, path and system.
For example, `Operating system` will say `Darwin` on a Mac and `Windows` on Windows.
The last line must be `Ready to build Bazaar!`. If it says `Not ready`, go back to the lesson.

## Check your work

```bash
bash test_lab.sh
```

**Expected output:**

```
PASS: python3 --version is 3.13.18
PASS: check_python.py: ready, cart total ₹1247
PASS: which python3 -> /usr/local/bin/python3
PASS: PATH starts with /usr/local/bin
PASS: with PATH=/usr/bin: command not found (exit 127)
PASS: full path works even with broken PATH
PASS: Python 3.12 is refused with exit code 1
ALL CHECKS PASSED
```

## Stuck?

- **Task 6 says `Python version : 3.9.6` on a Mac**: you are running the old Python that comes
  with macOS. Install Python 3.13 from python.org, then **close and reopen** the terminal.
- **`command not found: python3`** (or `'python3' is not recognized` on Windows) in Task 6:
  Python is not on your PATH. See "Common mistakes" in the lesson.
- **Typing `python` on Windows opens the Microsoft Store**: use `py` instead, or install from python.org.

## Clean up

```bash
docker compose down
```
