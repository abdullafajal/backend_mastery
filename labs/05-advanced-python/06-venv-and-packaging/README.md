# Lab 05-06: Virtual environments, pins, and Bazaar as a package

**Goal:** give two projects their own virtual environments with different versions of `requests`, check that `pip freeze` matches the pins,
do the same with uv, install Bazaar v0 as a package with a `bazaar` command, and fix a package whose command is broken.

**Time:** about 30 minutes.

**You need:** Docker running, and **internet** (packages are downloaded from PyPI).

## How this lab works

This lab builds its own image: Python 3.13 plus **uv 0.13.6**. This lab folder is shared with it as `/lab`.

| Folder | What's inside |
| --- | --- |
| `project-a/requirements.txt` | the price checker: `requests==2.34.2` and its pinned dependencies |
| `project-b/requirements.txt` | an older tool: `requests==2.33.1` |
| `bazaar_pkg/` | Bazaar v0 as a package: `pyproject.toml` + `src/bazaar/` |
| `exercises/bazaar_pkg/` | the same package, with a broken command; you fix it |
| `solutions/bazaar_pkg/` | one correct answer (look only after you try) |

```bash
docker compose run --rm python
```

The `.venv` folders you make appear in the lab folder on your computer too. The lab's `.gitignore` keeps them out of Git.

## Task 1: No requests yet

```bash
python3 -c "import requests"
```

**Expected output** (last line):

```
ModuleNotFoundError: No module named 'requests'
```

## Task 2: A venv for project-a

```bash
cd project-a
python3 -m venv .venv
ls .venv
.venv/bin/pip install -q -r requirements.txt
.venv/bin/python -c "import requests; print(requests.__version__)"
.venv/bin/pip freeze
cd ..
```

**Expected output:**

```
bin
include
lib
lib64
pyvenv.cfg
2.34.2
certifi==2026.10.23
charset-normalizer==3.5.2
idna==3.20
requests==2.34.2
urllib3==2.8.0
```

`pip freeze` matches `requirements.txt` line for line.

## Task 3: A different version for project-b

```bash
cd project-b
python3 -m venv .venv
.venv/bin/pip install -q -r requirements.txt
.venv/bin/python -c "import requests; print(requests.__version__)"
cd ..
python3 -c "import requests"
```

**Expected output:** `2.33.1`, and the system Python still has no `requests` (`ModuleNotFoundError: No module named 'requests'`).

## Task 4: activate

```bash
cd project-a
source .venv/bin/activate
which python
python -c "import requests; print(requests.__version__)"
deactivate
which python3
cd ..
```

**Expected output:**

```
/lab/project-a/.venv/bin/python
2.34.2
/usr/local/bin/python3
```

## Task 5: The same with uv

```bash
uv venv /tmp/uvdemo
uv pip install --python /tmp/uvdemo -r project-a/requirements.txt
```

**Expected output** (times will differ):

```
Using CPython 3.13.18 interpreter at: /usr/local/bin/python
Creating virtual environment at: /tmp/uvdemo
Activate with: source /tmp/uvdemo/bin/activate
Using Python 3.13.18 environment at: /tmp/uvdemo
Resolved 5 packages in 963ms
Prepared 5 packages in 545ms
Installed 5 packages in 36ms
 + certifi==2026.10.23
 + charset-normalizer==3.5.2
 + idna==3.20
 + requests==2.34.2
 + urllib3==2.8.0
```

## Task 6: Install Bazaar as a package

```bash
python3 -m venv /tmp/shop
/tmp/shop/bin/pip install -q ./bazaar_pkg
/tmp/shop/bin/pip show bazaar | grep -E "^(Name|Version):"
cd /tmp
/tmp/shop/bin/bazaar list
/tmp/shop/bin/bazaar add "Masala Box" 299 "Patel Spices"
/tmp/shop/bin/bazaar search box
ls ~/.bazaar
cd /lab
```

**Expected output:**

```
Name: bazaar
Version: 0.1.0
No products.
Added Masala Box at ₹299.00.
Masala Box              ₹299.00  Patel Spices
catalog.json
```

The command works from `/tmp`, far from the code, and saves the catalog in your home folder (`~/.bazaar/catalog.json`).

## Task 7: Fix the broken command

```bash
python3 -m venv /tmp/ex
/tmp/ex/bin/pip install -q ./exercises/bazaar_pkg
/tmp/ex/bin/bazaar list
```

```
Traceback (most recent call last):
  File "/tmp/ex/bin/bazaar", line 3, in <module>
    from bazaar.main import start
ImportError: cannot import name 'start' from 'bazaar.main' (/tmp/ex/lib/python3.13/site-packages/bazaar/main.py)
```

Look at `cat /tmp/ex/bin/bazaar` and at `exercises/bazaar_pkg/pyproject.toml`. Fix the `[project.scripts]` line so it names the function that really
exists in `src/bazaar/main.py`. Then reinstall (`/tmp/ex/bin/pip install -q ./exercises/bazaar_pkg`) and run `/tmp/ex/bin/bazaar list`: `No products.`
Compare with `solutions/bazaar_pkg/pyproject.toml`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Building the lab image (Python 3.13 + uv 0.13.6; the first time takes a minute)...
PASS: the exercise and solution packages differ from bazaar_pkg only where they should
PASS: uv 0.13.6 is installed
PASS: the system Python has no requests
PASS: project-a's venv has requests 2.34.2, project-b's has 2.33.1, side by side
PASS: pip freeze matches requirements.txt exactly (every dependency pinned)
PASS: activate makes python the venv's; deactivate goes back
PASS: installing into venvs left the system Python untouched
PASS: uv makes a venv and installs the same pins
PASS: pip install ./bazaar_pkg installs bazaar 0.1.0
PASS: the installed bazaar command works from any folder
PASS: the exercise really fails (the command points to a missing function)
PASS: solution: bazaar = "bazaar.main:run" works
ALL CHECKS PASSED
```

The test makes all its venvs in `/tmp` inside the container, so your `.venv` folders are not touched. It doesn't grade `exercises/bazaar_pkg/`.

## Stuck?

- **`ModuleNotFoundError: No module named 'requests'`** right after installing: you ran a different Python. Use `.venv/bin/python`, or `activate` first, and check `which python`.
- **`ERROR: Could not find a version that satisfies the requirement …`**: a typo in a package name or version, or no internet.
- **`ImportError: cannot import name '…' from 'bazaar.main'`**: `[project.scripts]` names a function that doesn't exist. Fix it and reinstall.
- **`ERROR: Pipe to stdout was broken`** after `pip show … | head`: harmless. Use `grep` instead of `head`, as above.

## Clean up

```bash
docker compose down
rm -rf project-a/.venv project-b/.venv                 # optional: delete the venvs from the lab folder
docker image rm bazaar-lab-python-uv:m05-06            # optional: free the image's disk space
```
