# Virtual environments and packaging

<div class="bz-meta" markdown>
**Module** 5 · Advanced Python
**Lesson** 6
**Reading time** 15 min (+ optional deeper parts)
**You will build** two projects with different versions of the same package, side by side, and Bazaar v0 as an installable package with its own `bazaar` command
</div>

!!! abstract "In 1 minute"
    - A **package** from PyPI (like `requests`) is code other people wrote, installed with `pip install`.
    - A **virtual environment** (venv) is a private folder of installed packages for **one** project: `python3 -m venv .venv`. Each project gets its own versions.
    - `requirements.txt` lists every package with an **exact** version (`requests==2.34.2`), so every computer installs exactly the same thing.
    - **uv** is a newer, much faster tool that does the same jobs as `venv` + `pip`.
    - A `pyproject.toml` turns your own code into an installable package. `pip install ./bazaar_pkg` gives you a `bazaar` command.

> **Previously in Bazaar:** generators let Bazaar read 200,000 orders one line at a time.

## 1. Why learn this?

Bazaar now has two small tools. The new price checker needs `requests` 2.34.2. An older stock script was written for `requests` 2.33.1 and breaks on the new one.

If both are installed into your computer's one Python, only one version can win. And when Rohan sets up his laptop next month, `pip install requests`
gives him whatever is newest **that day**: "it works on my machine" all over again (Module 0).

Virtual environments give each project its own packages. Exact pins make every install the same. Packaging makes Bazaar installable like any other tool.
Every Django project in Level 2 starts with exactly these steps.

## 2. The concept

### Packages and PyPI

**PyPI** (the Python Package Index, pypi.org) is the public library of Python packages. `pip` is the tool that downloads and installs them.
Your computer's Python doesn't have them by default:

```
$ python3 -c "import requests"
Traceback (most recent call last):
  File "<string>", line 1, in <module>
    import requests
ModuleNotFoundError: No module named 'requests'
```

### A virtual environment per project

```bash
cd project-a
python3 -m venv .venv            # make a venv in the folder .venv
```

```
$ ls .venv
bin
include
lib
lib64
pyvenv.cfg
```

`.venv` is just a folder: its own `python`, its own `pip` (in `bin/`), and its own empty place for packages (in `lib/`). Installing into it touches nothing else.

```
$ .venv/bin/pip install -q -r requirements.txt
$ .venv/bin/python -c "import requests; print(requests.__version__)"
2.34.2
```

Do the same in `project-b` (whose `requirements.txt` says `requests==2.33.1`), and it prints `2.33.1`. Two versions, side by side, no fight.
And the system Python still says `No module named 'requests'`.

### `activate`: a shortcut

Typing `.venv/bin/python` every time gets long. `source .venv/bin/activate` makes plain `python` and `pip` mean this venv's, until you `deactivate`:

```
$ source .venv/bin/activate
$ which python
/lab/project-a/.venv/bin/python
$ deactivate
$ which python3
/usr/local/bin/python3
```

(`which` shows which program a command really runs: Module 0's PATH, at work.)

### `requirements.txt`: exact pins

```text title="project-a/requirements.txt"
--8<-- "labs/05-advanced-python/06-venv-and-packaging/project-a/requirements.txt"
```

- `==` pins an **exact** version. Bazaar's rule since Module 0: never "latest".
- `requests` itself needs four other packages (its **dependencies**). They're pinned too.
- `pip freeze` lists exactly what's installed. In the lab it matches this file line for line.

Why pin the dependencies as well? The lab's test proves it: remove the pin from `certifi`, and pip quietly installs `certifi==2026.11.20`, a version
released two days earlier. Today it works; next month, a new version might not. Exact pins make installs **repeatable**.

### uv: the same jobs, faster

**uv** is a newer tool (written in Rust) that replaces `venv` + `pip` with one fast command:

```
$ uv venv /tmp/uvdemo
Using CPython 3.13.18 interpreter at: /usr/local/bin/python
Creating virtual environment at: /tmp/uvdemo
Activate with: source /tmp/uvdemo/bin/activate
$ uv pip install --python /tmp/uvdemo -r project-a/requirements.txt
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

Same result as pip, same pins. This course's own website tooling uses uv (see `CLAUDE.md`). Use whichever your team uses; the ideas are identical.

### Your own package: `pyproject.toml`

Bazaar v0 (Module 4) only ran with `python3 main.py` from its own folder. A `pyproject.toml` describes it as a package:

```toml title="bazaar_pkg/pyproject.toml"
--8<-- "labs/05-advanced-python/06-venv-and-packaging/bazaar_pkg/pyproject.toml"
```

The code moves into `src/bazaar/` (a **package** folder, with an `__init__.py`), and imports use the package name: `from bazaar import catalog`.
Then:

```
$ pip install ./bazaar_pkg
$ pip show bazaar
Name: bazaar
Version: 0.1.0
Summary: Bazaar v0: a command-line product catalog
$ bazaar list
No products.
$ bazaar add "Masala Box" 299 "Patel Spices"
Added Masala Box at ₹299.00.
```

`[project.scripts]` made pip write a small `bazaar` command into the venv's `bin/`. It works from **any** folder. And because an installed program
mustn't write into its own install folder, the catalog now lives in your home folder (`~/.bazaar/catalog.json`), or wherever `BAZAAR_DATA` points.

### An analogy

Your computer's Python is the **shared office kitchen**: if every team keeps its spices there, someone's "chilli powder" gets swapped for another brand.

- A venv is each team's **own spice box**, labelled with their project's name.
- `requirements.txt` is the **shopping list with exact brands and pack sizes**: anyone who shops from it fills an identical box.
- A package with `pyproject.toml` is a **sealed, labelled product** (name, version, contents) that anyone can put on their own shelf.

### Questions you may have

**Should `.venv` go into Git?** Never. It's big and machine-specific. Commit `requirements.txt` (or `pyproject.toml` + a lock file); anyone can rebuild the venv from it.
The lab's `.gitignore` already lists `.venv/`.

**Do I need a venv inside Docker?** Less so: a container is already its own isolated machine (Module 19). Many teams still use one there, for the same habits everywhere.

**How do I find a good version to pin?** Use a recent release that has been out for a while. This course picks versions at least two weeks old.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="venv-packaging"></div>

## 4. Code example

The lab's exercise: a copy of Bazaar's package whose command is broken. It installs fine, then:

```
$ bazaar list
Traceback (most recent call last):
  File "/tmp/ex/bin/bazaar", line 3, in <module>
    from bazaar.main import start
ImportError: cannot import name 'start' from 'bazaar.main' (/tmp/ex/lib/python3.13/site-packages/bazaar/main.py)
```

Look at the script pip wrote (`cat .venv/bin/bazaar`):

```
#!/tmp/ex/bin/python3
import sys
from bazaar.main import start
if __name__ == '__main__':
    sys.argv[0] = sys.argv[0].removesuffix('.exe')
    sys.exit(start())
```

It imports `start`, because `pyproject.toml` says `bazaar = "bazaar.main:start"`. But `main.py`'s entry function is called `run`. The fix is in `pyproject.toml`:

```toml title="solutions/bazaar_pkg/pyproject.toml (lines 13-14)"
--8<-- "labs/05-advanced-python/06-venv-and-packaging/solutions/bazaar_pkg/pyproject.toml:13:14"
```

Reinstall (`pip install ./exercises/bazaar_pkg` again), and `bazaar list` prints `No products.`

## 5. Under the hood

### A version that doesn't exist

```
$ pip install requests==9.9.9
ERROR: Ignored the following yanked versions: 2.32.0, 2.32.1
ERROR: Could not find a version that satisfies the requirement requests==9.9.9 (from versions: 0.2.0, 0.2.1, … 2.34.0, 2.34.1, 2.34.2)
ERROR: No matching distribution found for requests==9.9.9
```

(The real list of versions is much longer.) pip lists every version that does exist; "yanked" versions were withdrawn by their authors.

### Where things are installed

- Inside a venv: `.venv/lib/python3.13/site-packages/` holds the packages, and `.venv/bin/` holds commands like `pip`, `bazaar`.
- `import requests` searches `sys.path` (Module 4), which, in a venv, includes **that** venv's `site-packages` and not the others'.
- `activate` only changes your shell's `PATH` (Module 2), putting `.venv/bin` first. That's all it does.

??? note "Going deeper: uv projects and lock files"

    For a whole project, uv can manage everything from `pyproject.toml`:

    - `uv init` creates a `pyproject.toml`; `uv add requests==2.34.2` adds a dependency to it.
    - `uv lock` writes **`uv.lock`**: the exact version (and file hash) of **every** package, dependencies included. Commit it.
    - `uv sync` makes `.venv` match the lock file exactly; `uv run bazaar list` runs a command inside it.

    A lock file is `requirements.txt`'s grown-up form: you write the few top-level packages you want; the tool works out and records the rest.
    `pip-tools` (`pip-compile`) does the same for pip users. Level 2's Django project will use this.

??? note "Going deeper: building and publishing"

    - `python3 -m build` (or `uv build`) makes two files in `dist/`: a **wheel** (`bazaar-0.1.0-py3-none-any.whl`, ready to install) and an **sdist** (the source).
    - `pip install -e ./bazaar_pkg` is an **editable** install: the venv points at your source folder, so code changes apply without reinstalling.
    - `twine upload dist/*` (or `uv publish`) puts a package on PyPI. Bazaar won't; it's a private app.
    - Version numbers usually follow **semantic versioning**: `MAJOR.MINOR.PATCH`. A major bump (2.x → 3.0) may break your code; that's why you pin.

??? note "Going deeper: supply-chain safety"

    Installing a package runs other people's code on your machine. Real teams: pin exact versions (and hashes, which lock files record),
    wait a little before adopting brand-new releases (this course uses a two-week rule), watch out for typo-named lookalike packages (`reqeusts`),
    and scan dependencies for known security problems (`pip-audit`). Module 24's CI can run these checks on every pull request.

## 6. Lab

**Lab folder:** `labs/05-advanced-python/06-venv-and-packaging/`

```bash
cd labs/05-advanced-python/06-venv-and-packaging
docker compose run --rm python
```

This lab needs **internet** (packages come from PyPI). Make a venv in each of two projects and install different `requests` versions side by side,
compare `pip freeze` with `requirements.txt`, try `activate`, do the same with uv, install Bazaar as a package and use its `bazaar` command,
and fix the package whose command points to a function that doesn't exist.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`pip install` into the system Python.** Projects fight over versions. **Fix:** a venv per project; check `which python` (or `which pip`).
2. **Unpinned requirements.** Next month's install is different. **Fix:** `==` for every package, dependencies included (or a lock file).
3. **Committing `.venv`.** Huge, and useless on another machine. **Fix:** `.gitignore` it; commit the requirements.
4. **Forgetting to activate (or using the wrong venv).** `ModuleNotFoundError` for a package you just installed. **Fix:** `.venv/bin/python …` or `source .venv/bin/activate`.
5. **An entry point that doesn't match the code.** `ImportError: cannot import name …`. **Fix:** `module:function` in `[project.scripts]` must name a real function; reinstall after fixing.

## 8. Quiz

<div class="bz-quiz" data-quiz="m05-06"></div>

## 9. What's next

Next: making Bazaar do several things at once with threads and processes, and why Python's GIL matters: [Threads and processes](07-threads-and-processes.md).

**In one line:** a venv gives each project its own packages; `requirements.txt` pins every version exactly; uv does the same jobs faster;
and `pyproject.toml` turns your code into an installable package with its own command.

### Cheat sheet

| Task | pip | uv |
| --- | --- | --- |
| Make a venv | `python3 -m venv .venv` | `uv venv` |
| Install pinned packages | `.venv/bin/pip install -r requirements.txt` | `uv pip install -r requirements.txt` |
| What's installed? | `pip freeze` | `uv pip freeze` |
| Install your package | `pip install ./bazaar_pkg` | `uv pip install ./bazaar_pkg` |
| Use the venv in this shell | `source .venv/bin/activate` (`deactivate` to leave) | same |

| File | Holds |
| --- | --- |
| `requirements.txt` | exact versions to install (`requests==2.34.2`) |
| `pyproject.toml` | your package's name, version, dependencies, commands |
| `uv.lock` | every package's exact version and hash (generated) |

> **Next in Bazaar:** the price checker now has to ask 100 suppliers for prices, and it asks them one after another: 100 waits in a row.
> Next lesson: threads and processes, and why Python sometimes can't use all your CPU cores at once.

<div class="bz-complete" data-lesson="m05-06"></div>
