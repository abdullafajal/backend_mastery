# Installing Python and VS Code

<div class="bz-meta" markdown>
**Module** 0 · Welcome and setup
**Lesson** 3
**Reading time** 15 min (+ optional deeper parts)
**You will build** a setup check that tells you if your computer is ready for Bazaar
</div>

!!! abstract "In 1 minute"
    - You install two tools: **Python 3.13** (runs Bazaar's code) and **VS Code** (where you write it).
    - When you type `python3`, the shell looks for it in a list of folders called **PATH**, in order, and runs the **first** one it finds.
    - That explains the two classic problems: `command not found` (not in PATH) and the **wrong version** running (an old Python found first).
    - After installing, **open a new terminal**, then check with `python3 --version`.
    - In the lab, you break PATH on purpose (safely, in a container) and fix it.

> **Previously in Bazaar:** You saw the whole road, from 1 user to 1 crore.
> You also watched a crowd of 100 customers slow down Bazaar's one-worker backend.

## 1. Why learn this?

Until now, Bazaar's code ran only inside Docker. To write Bazaar yourself,
you need Python and a good editor on your own computer.

Most beginners lose hours here, to the same few problems: `command not found: python3`,
the wrong Python version running without any warning, VS Code using a different Python than the terminal,
or `pip` refusing to install anything. Each of these has a simple cause.
In this lesson you install both tools, and you learn **why** those problems happen, so they never stop you.

## 2. The concept

### Two tools

- **Python** is the language Bazaar is written in. The program you install is called the
  Python **interpreter**: it reads your `.py` file and runs it.
- **VS Code** (Visual Studio Code) is a **code editor**: a program for writing code.
  It is free, works on every system, understands Python (with an extension), and has a built-in terminal.

Let's understand this with a small example: a kitchen. Python is the cook who follows the recipe.
VS Code is the clean kitchen counter where you write the recipe and watch the cook work.

This course uses **Python 3.13**. Any `3.13.x` is fine; newer versions like 3.14 also work.

??? note "Going deeper: What the interpreter really does"
    When you run `python3 check_python.py`, the interpreter does three things:

    1. **Reads** your file as text.
    2. **Compiles** it into **bytecode**: small, simple instructions for Python's own virtual machine.
       (This is not the CPU's machine code. It is Python's private, simpler language.)
    3. **Runs** the bytecode, one instruction at a time.

    For example, the line `total = price * quantity` becomes these bytecode instructions:

    ```
    LOAD_NAME                0 (price)
    LOAD_NAME                1 (quantity)
    BINARY_OP                5 (*)
    STORE_NAME               2 (total)
    ```

    "Put `price` on the table, put `quantity` on the table, multiply them, store the result as `total`."
    You never write bytecode yourself. But it explains a folder you will soon see everywhere:
    when you **import** a file, Python saves its bytecode in a folder called `__pycache__`, in a file like
    `shop.cpython-313.pyc`. Next time, Python skips step 2 if the file hasn't changed.
    It is safe to delete `__pycache__`; Python just makes it again.

    The interpreter you install from python.org is called **CPython**, because it is written in C.
    It is the standard one, and it is what everybody means by "Python".

??? note "Going deeper: Python versions"
    A version number like `3.13.18` has three parts:

    | Part | Here | Meaning |
    | --- | --- | --- |
    | Major | `3` | Big, breaking changes. Python 2 ended in 2020; everything today is Python 3. |
    | Minor | `13` | A new release each October, with new features. 3.13 came out in October 2024. |
    | Patch | `18` | Bug and security fixes only. Safe to update. |

    Each minor version gets fixes for about **five years**, then it reaches its **end of life**: no more
    security fixes, even for serious problems. Python 3.9, the one that comes with every Mac, reached
    its end of life in October 2025. That is one more reason not to use it.

    This course uses **Python 3.13**. Any `3.13.x` is fine for you. Newer versions like 3.14 will also run
    the code in this course. Inside the labs, Docker always uses exactly `3.13.18`, so everyone gets the same result.

### The terminal and the shell

The **terminal** is a window where you type commands. The **shell** is the program inside it
that reads each command and runs it. On a Mac the shell is usually `zsh`. On Linux it is
usually `bash`. On Windows you will use **PowerShell**.

When you type a command and press Enter, the shell:

1. splits the line into words: `python3`, `check_python.py`;
2. finds the program for the first word (using PATH, below);
3. starts it as a new **process**, passing the other words to it;
4. waits until it ends, and remembers its **exit code**.

??? note "Going deeper: Environment variables"
    An **environment variable** is a named setting, like `HOME=/Users/asha` or `LANG=en_IN.UTF-8`.
    Every process has its own list of them, and **a new process gets a copy of its parent's list**.
    So a setting made in your shell reaches every program you start from that shell:

    ```
    $ export SALE=diwali
    $ python3 -c "import os; print('child sees SALE =', os.environ.get('SALE'))"
    child sees SALE = diwali
    ```

    Backends use environment variables everywhere: the database password, the debug mode, the port.
    You will see this in Module 20. For now, one variable matters most.

### PATH: how the shell finds programs

When you type `python3`, the shell does not search your whole computer. That would be far too slow.
It only searches a short list of folders, stored in the environment variable **PATH**.

PATH holds folder names, in order. The shell checks them one by one and runs the **first** match.

```
$ echo $PATH
/usr/local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
```

The folders are separated by `:` (on Windows by `;`).

This one rule explains the two most common install problems:

1. **`command not found`**: Python is installed, but its folder is not in PATH.
2. **The wrong version runs**: an older Python sits in an earlier PATH folder.
   Every Mac has an old Python 3.9 in `/usr/bin`, so this one is very common.

**One rule to remember:** after installing anything, **close the terminal and open a new one.**
A terminal reads PATH only when it starts, so an old terminal doesn't know about the new program.

??? note "Going deeper: Where does PATH come from, and why reopen the terminal?"
    PATH is set when your shell starts, by reading its **startup files**:

    | Shell | Startup files |
    | --- | --- |
    | zsh (Mac) | `~/.zprofile`, `~/.zshrc` |
    | bash (Linux) | `~/.bashrc`, `~/.profile` |
    | PowerShell (Windows) | Windows keeps PATH in its own settings: *System Properties → Environment Variables* |

    (`~` means your home folder.) Installers add their folder to PATH by changing these files or settings.

    But your **open** terminal already read them when it started, and it already has its own copy of PATH.
    Changing the files later doesn't change that copy. That is why the rule is always:
    **after installing, close the terminal and open a new one.** In VS Code, close the terminal panel too.

??? note "Going deeper: Several Pythons on one computer"
    It is completely normal to have several Pythons. This Mac, for example, has the old Apple Python in
    `/usr/bin` and a newer one from Homebrew. Each one has its own command name:

    | Command | Means |
    | --- | --- |
    | `python3` | whichever `python3` comes first in PATH |
    | `python3.13` | specifically Python 3.13, if installed |
    | `python` | on many Macs and Linux systems: nothing, or an old Python. Avoid it on Mac/Linux |
    | `py` (Windows) | the Python launcher; `py -3.13` picks 3.13, `py -0` lists all installed Pythons |

    The safest habit: run `python3 --version` (or `py --version`) and check before you trust it.

??? note "Going deeper: pip, and 'externally managed'"
    **pip** is Python's package installer: it downloads libraries other people wrote, like Django.
    On many systems, if you try to install a package into the system's Python, pip now refuses:

    ```
    error: externally-managed-environment

    × This environment is externally managed
    ╰─> To install Python packages system-wide, try brew install
        xyz, where xyz is the package you are trying to
        install.

        If you wish to install a Python library that isn't in Homebrew,
        use a virtual environment:

        python3 -m venv path/to/venv
        source path/to/venv/bin/activate
        python3 -m pip install xyz
    ```

    (This is the message from Homebrew's Python on our test Mac. Ubuntu and Debian show a similar one.)

    This is **protection, not a bug**. That Python belongs to your system or to Homebrew, and its tools rely on
    exact versions of its packages. If you install or upgrade packages there, you can break them.
    The answer is a **virtual environment**: a private folder with its own packages, one per project.
    You will learn them properly in Module 5. In this lesson you don't need to install any package.

??? note "Going deeper: VS Code and the Python extension"
    A plain editor only shows text. The **Python extension** (by Microsoft) teaches VS Code to understand Python:

    - **IntelliSense**: suggestions while you type, and the meaning of functions when you hover over them;
    - **error marks**: red and yellow underlines for mistakes, before you even run the code;
    - **Run** (the ▷ button) and **debugging**: pause your program at a line and look at every variable;
    - **interpreter selection**: which Python runs your code. The chosen one is shown at the bottom right
      of the VS Code window.

    VS Code's built-in terminal is a normal shell, started by VS Code. So it gets VS Code's PATH,
    which VS Code read when **it** started. If you installed Python while VS Code was open, restart VS Code.

### Questions you may have

**Why `python3` and not `python`?**
When Python 3 arrived, many systems still needed Python 2 under the name `python`. So Python 3 got the
name `python3`, and it stayed. On Windows, the launcher is `py`.

**Can I have Python 3.12 and 3.13 at the same time?**
Yes. They live in different folders and have different command names (`python3.12`, `python3.13`).
Only one of them is `python3`: whichever comes first in PATH.

**Should I install Anaconda?**
Not for this course. Anaconda is a big Python bundle aimed at data science. It brings its own Python and
changes your PATH, which makes "which Python is running?" harder. Plain Python from python.org is simpler.

**Do I need PyCharm or another IDE?**
No. An **IDE** (Integrated Development Environment) is an editor with many built-in tools.
VS Code with the Python extension does everything this course needs. If you already love another editor, use it.

**Is it safe to delete `__pycache__`?**
Yes. It only holds bytecode that Python can make again.

**Why not just use Docker for everything, and skip installing Python?**
You will use Docker a lot. But VS Code needs a local Python to give you suggestions and error marks,
and small scripts are quicker to run directly.

## 3. See it in action

Pick a situation and press **Play**. Watch the shell search PATH, folder by folder.

<div class="bz-diagram" data-diagram="path-lookup"></div>

## 4. Code example

First, install Python and VS Code. Follow the steps for your system.

### Install Python 3.13

=== "macOS"

    1. Go to [python.org/downloads](https://www.python.org/downloads/) and find **Python 3.13**.
       Download the **macOS 64-bit universal2 installer** (a `.pkg` file).
    2. Open it and click **Continue** until it is installed.
    3. **Close your terminal and open a new one.** A terminal reads PATH only when it starts.
    4. Check:

        ```bash
        python3 --version
        ```

        You should see `Python 3.13.x`. If you see `Python 3.9.6`, your terminal is still
        finding the old Mac Python. Close and reopen the terminal, then check again.

    Already use Homebrew? `brew install python@3.13` also works. Then use the command `python3.13`.

=== "Windows"

    1. Go to [python.org/downloads](https://www.python.org/downloads/) and download the
       **Windows installer (64-bit)** for **Python 3.13**.
    2. Open it. On the first screen, **tick "Add python.exe to PATH"**. This is the most important click.
    3. Click **Install Now**.
    4. Open a **new** PowerShell window and check:

        ```powershell
        py --version
        ```

        You should see `Python 3.13.x`. On Windows, `py` is the Python launcher. It always finds
        your installed Python, even when PATH is wrong.

    If typing `python` opens the Microsoft Store, just use `py` instead.

=== "Linux"

    1. First check what you already have:

        ```bash
        python3 --version
        ```

        If it says `3.13` or newer, you are done.

    2. **Ubuntu / Debian** with an older Python: add the "deadsnakes" package source, which
       has newer Pythons, then install 3.13:

        ```bash
        sudo apt update
        sudo apt install -y software-properties-common
        sudo add-apt-repository -y ppa:deadsnakes/ppa
        sudo apt update
        sudo apt install -y python3.13 python3.13-venv
        python3.13 --version
        ```

    3. **Fedora:**

        ```bash
        sudo dnf install -y python3.13
        python3.13 --version
        ```

    On Linux, keep the system's own `python3` as it is. Your system tools need it.
    Use the command `python3.13` for this course.

### Install VS Code

1. Download VS Code from [code.visualstudio.com](https://code.visualstudio.com/) and install it.
2. Open VS Code. Click the **Extensions** icon on the left (or press `Ctrl+Shift+X`, `Cmd+Shift+X` on a Mac).
3. Search for **Python** and install the one published by **Microsoft**.
   An **extension** is an add-on that teaches VS Code something new.
4. Press `Ctrl+Shift+P` (`Cmd+Shift+P` on a Mac), type **Python: Select Interpreter**,
   and pick **Python 3.13**. Now VS Code knows which Python to use.
5. Open the built-in terminal: **Terminal → New Terminal**.

On a Mac, also run **Shell Command: Install 'code' command in PATH** from the same
`Cmd+Shift+P` box. After that, typing `code .` in any terminal opens that folder in VS Code.
Yes, it works by adding a folder to PATH!

### Your first check

Now let's check that everything works. Create a file called `check_python.py` in VS Code:

```python title="check_python.py"
--8<-- "labs/00-setup/03-installing-python-and-vscode/examples/check_python.py"
```

Run it from the VS Code terminal with `python3 check_python.py` (on Windows: `py check_python.py`).
Here is the output on Python 3.13.18:

```
Python version   : 3.13.18
Python lives at  : /usr/local/bin/python3
Operating system : Linux
Asha's cart total: ₹1247
Ready to build Bazaar!
```

What each part of the script does:

- `platform.python_version()` gives the version as text, like `3.13.18`.
- `sys.executable` is the **exact file** of the Python that is running this script. When you are not sure
  which Python runs, this line is the truth.
- `sys.version_info[:2]` is a pair like `(3, 13)`. Python compares pairs item by item, so
  `(3, 9) < (3, 13)` is `True`. (Comparing the text `"3.9" < "3.13"` would wrongly say `False`!)
- `sys.exit(1)` ends the program with exit code `1`: "something went wrong".
- The cart total uses a **generator expression** inside `sum()`: it multiplies price × quantity for each
  item and adds them up. ₹299 × 2 + ₹649 × 1 = ₹1247. You will learn this syntax in Module 4.

Your path and system will be different. The last line must say `Ready to build Bazaar!`.

## 5. Under the hood

### Asking which Python runs

=== "macOS / Linux"

    ```bash
    which -a python3     # every python3 in PATH, in search order
    echo $PATH           # the folders, separated by ":"
    ```

=== "Windows"

    ```powershell
    where.exe python     # every python.exe in PATH, in search order
    py -0                # every Python the launcher knows
    $env:Path            # the folders, separated by ";"
    ```

### Breaking PATH on purpose

Here is what happens inside the lab's container when PATH is broken on purpose:

```
$ PATH=/usr/bin python3 --version
bash: line 1: python3: command not found
```

Writing `PATH=/usr/bin` before a command sets PATH **only for that one command**.
The shell searched only `/usr/bin`, found nothing, and gave up. It also set the **exit code** to `127`.
An exit code is a number every program returns when it ends.
`0` means success. Any other number means failure, and `127` means "command not found".
Scripts, and tools like `test_lab.sh`, read exit codes to know if a step worked.

The full path skips the search completely:

```
$ PATH=/usr/bin /usr/local/bin/python3 --version
Python 3.13.18
```

??? note "Going deeper: What `python3 --version` actually ran"
    On the lab container, `ls -l /usr/local/bin/python3` shows:

    ```
    lrwxrwxrwx 1 root root 10 Nov  5 08:11 /usr/local/bin/python3 -> python3.13
    ```

    `python3` is not a real program. It is a **symbolic link** (a shortcut) pointing to `python3.13`.
    The `l` at the start of `lrwxrwxrwx` means "link". This is how one system offers both names:
    `python3` for "the default" and `python3.13` for "exactly this version".

??? note "Going deeper: the shell remembers where commands are"
    To save time, `bash` and `zsh` remember where they found each command the first time. If you install a
    new Python into an earlier PATH folder while the terminal is open, the shell may keep running the old one.
    `hash -r` (bash) or `rehash` (zsh) makes it forget. Opening a new terminal does the same.

??? note "Going deeper: see the bytecode yourself"
    Python ships a module that shows bytecode:

    ```bash
    python3 -c "import dis; dis.dis('total = price * quantity')"
    ```

    The output on Python 3.13 is the `LOAD_NAME ... BINARY_OP ... STORE_NAME` list from part 2.
    Different Python versions produce slightly different bytecode, which is why `.pyc` file names contain
    the version: `shop.cpython-313.pyc`.

## 6. Lab

**Lab folder:** `labs/00-setup/03-installing-python-and-vscode/`

You will look at PATH, break it on purpose, fix it, and meet an old Python, all safely inside containers.

```bash
cd labs/00-setup/03-installing-python-and-vscode
docker compose run --rm python python3 check_python.py
```

Expected output:

```
Python version   : 3.13.18
Python lives at  : /usr/local/bin/python3
Operating system : Linux
Asha's cart total: ₹1247
Ready to build Bazaar!
```

The last task runs `check_python.py` on **your own computer**.
When you finish, run `bash test_lab.sh`. You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Not ticking "Add python.exe to PATH" on Windows.** Then `python` is "not recognized as the name of a cmdlet".
   **Fix:** run the installer again, choose **Modify**, and turn on adding Python to PATH. Or simply use `py`.
2. **Not reopening the terminal after installing.** A terminal reads PATH only when it opens.
   **Fix:** close it and open a new one. If you use VS Code's terminal, restart VS Code.
3. **Using the old Mac Python 3.9 without noticing.** It runs, so you think all is fine. It is past its end of life.
   **Fix:** always run `python3 --version` after installing.
4. **VS Code using a different Python than your terminal.** Code works in one and fails in the other.
   **Fix:** **Python: Select Interpreter**, pick 3.13, and check the version shown at the bottom right.
5. **Forcing pip past `externally-managed-environment`** (for example with `--break-system-packages`).
   You may break your system's or Homebrew's own tools. **Fix:** use a virtual environment (Module 5).
6. **Replacing the system Python on Linux.** Many Linux tools depend on it, and they can break.
   **Fix:** install 3.13 next to it and use `python3.13`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m00-03"></div>

## 9. What's next

Next: [Installing Git and Docker](04-installing-git-and-docker.md). You will install both on your own computer,
and verify your complete setup.

**In one line:** the shell finds programs by searching PATH in order, so install Python 3.13,
make sure it is first in PATH, open a new terminal, and always check with `--version`.

### Cheat sheet

| Task | macOS / Linux | Windows (PowerShell) |
| --- | --- | --- |
| Python version | `python3 --version` | `py --version` |
| Run a script | `python3 file.py` | `py file.py` |
| Which Python runs | `which -a python3` | `where.exe python`, `py -0` |
| Show PATH | `echo $PATH` | `$env:Path` |
| Set a variable for one command | `NAME=value command` | `$env:NAME="value"; command` |
| Exit code of the last command | `echo $?` | `$LASTEXITCODE` |
| Open a folder in VS Code | `code .` | `code .` |

| Fact | Value |
| --- | --- |
| Course version | Python 3.13 (labs: exactly 3.13.18) |
| Mac's built-in Python | 3.9.6 in `/usr/bin`, past end of life |
| Exit code "command not found" | `127` |
| VS Code: choose Python | `Ctrl/Cmd+Shift+P` → Python: Select Interpreter |
| Bytecode cache | `__pycache__/*.pyc`, safe to delete |

> **Next in Bazaar:** Bazaar's code will change every day. You need a way to save every version
> and undo mistakes. That tool is Git.

<div class="bz-complete" data-lesson="m00-03"></div>
