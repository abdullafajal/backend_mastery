# Glossary

Every new word in the course is explained here in one line.
Words are in alphabetical order. The module in brackets is where you first meet the word.

**__init__** — The special method that runs when an object is made. It stores the data (`self.name = name`) and can refuse bad data. *(Module 5)*

**__name__** — A module's name. It is `"__main__"` for the file you ran, so `if __name__ == "__main__":` marks code that runs only then. *(Module 4)*

**Absolute path** — A path that starts from the root folder `/`, so it means the same thing from anywhere. *(Module 1)*

**Alias** — A shortcut name for a longer command, defined in the shell, like `ll` for `ls -l`. *(Module 2)*

**Aliasing** — Two names pointing to the same object, so a change through one is seen through the other. *(Module 1)*

**API** — Application Programming Interface: a set of URLs other programs call to get data or do work. *(Module 0)*

**API endpoint** — One URL plus one method that an app can call, like `GET /products`. *(Module 0)*

**apt** — Debian and Ubuntu's package manager: `apt-get update`, then `apt-get install -y name`. *(Module 2)*

**Argument** — A word given to a command, saying what to work on, like `logs` in `ls logs`. *(Module 2)*

**Asyncio** — Python's library for waiting on many things at once with one thread and an event loop: `async def`, `await`, `asyncio.gather`. *(Module 5)*

**Atomic** — Done in one indivisible step: other programs see it either not done at all, or completely done. *(Module 1)*

**Attribute** — Data stored on an object, read with a dot: `masala.stock`. *(Module 5)*

**authorized_keys** — The file on a server (`~/.ssh/authorized_keys`) listing the public keys allowed to log in as that user. *(Module 2)*

**Await** — Inside `async def`: pause here until this is done, and let the event loop run other tasks meanwhile. *(Module 5)*

**Backend** — The hidden part of an app that answers requests, enforces rules and stores data. *(Module 0)*

**Background job** — A command started with `&` at the end, so the shell gives you the prompt back while it runs. *(Module 2)*

**Bandwidth** — How much data a connection can carry per second, like the width of a pipe. *(Module 1)*

**Bare except** — `except:` with no error name. It catches every error, even typos in your own code, so it hides bugs. Avoid it. *(Module 4)*

**bash** — Bourne Again SHell: the usual shell on Linux servers. *(Module 2)*

**Bit** — The smallest piece of data: a single 0 or 1. 8 bits make 1 byte. *(Module 1)*

**Block** — The fixed-size piece (usually 4 KB) in which a disk stores data. Even a tiny file uses a whole block. *(Module 1)*

**Blocking call** — A normal call that waits without letting anything else run, like `time.sleep` or `requests.get`. Inside `async def` it freezes the whole event loop. *(Module 5)*

**Body** — The actual data inside a request or response, after the headers. *(Module 0)*

**Bool** — A yes/no value: `True` or `False`. *(Module 4)*

**Bottleneck** — The narrowest point in a system, which slows everything else down. *(Module 0)*

**Branch** — A name that points to one commit: the newest commit of a line of work. `main` is the first one. Making a branch copies no files. *(Module 3)*

**Branch protection** — A GitHub setting that stops direct pushes to a branch like `main`, so every change must come through a reviewed pull request. *(Module 3)*

**Break and continue** — Inside a loop: `continue` skips to the next round, `break` stops the whole loop. *(Module 4)*

**Builtin** — A command that is part of the shell itself, like `cd` or `echo`, not a separate program. *(Module 2)*

**Business rule** — A rule of how the business works, enforced by the backend, like "never sell more than the stock". *(Module 0)*

**Byte** — 8 bits. Enough to store one English letter. *(Module 1)*

**Bytecode** — Simple instructions that Python compiles your code into before running it. Saved in `__pycache__`. *(Module 0)*

**Cache** — A small, fast place that keeps a copy of data you use often. *(Module 1)*

**Cache line** — The chunk of memory (64 or 128 bytes) the CPU copies into its cache at once. *(Module 1)*

**Call stack** — The pile of frames for the function calls happening right now; newest on top. *(Module 1)*

**Class** — A blueprint for objects: what every object has (attributes) and can do (methods). `class Product:`. *(Module 5)*

**Class attribute** — A value written directly inside `class …:`, shared by every object. Safe for constants, a bug for lists. *(Module 5)*

**Client** — A program that sends requests to another program and shows you the answer. The `docker` command is a client. *(Module 0)*

**Client–server model** — A design where clients send requests and servers answer them. *(Module 1)*

**Clone** — `git clone <address>`: download your own full copy of a repository, with all its history. *(Module 3)*

**Closure** — A function that remembers names from the function it was created in, even after that function finished. *(Module 5)*

**Code editor** — A program for writing code, like VS Code. *(Module 0)*

**Code review** — A teammate reading your change before it is merged, to catch mistakes and share knowledge. *(Module 3)*

**Command substitution** — `$(command)`: the shell replaces it with that command's output. *(Module 2)*

**Command-line arguments** — The words typed after the program's name, like `add "Masala Box" 299`. Python gives them as `sys.argv`. *(Module 4)*

**Commit** — A save point in Git: a recorded version of your code, with a message about what changed. *(Module 0)*

**Commit hash** — The unique ID of a Git commit, made from its content, like `af41737`. *(Module 0)*

**Comparison operator** — `==`, `!=`, `>`, `<`, `>=`, `<=`: they compare two values and give `True` or `False`. *(Module 4)*

**Comprehension** — A one-line way to build a list, dict or set from another collection: `[p["name"] for p in catalog if p["price_paise"] < 50000]`. *(Module 4)*

**Concurrency** — Doing several things in overlapping time, like waiting for 10 suppliers at once. Threads, processes and asyncio are three ways. *(Module 5)*

**Condition** — An expression that is `True` or `False`, like `cart_total >= 99900`. `if` and `while` use one. *(Module 4)*

**Conflict markers** — The lines `<<<<<<<`, `=======` and `>>>>>>>` Git writes into a file during a merge conflict, around your version and theirs. *(Module 3)*

**Constant** — A value that never changes while the program runs. Python's convention is UPPER_CASE names: `FREE_FROM_PAISE`. *(Module 4)*

**Container** — A running copy of an image: a small sealed box with a program and everything it needs. *(Module 0)*

**Context manager** — An object used with `with` that runs setup at the start and clean-up at the end, even after an error. `open()` is one. *(Module 5)*

**Context switch** — The kernel pausing one thread and resuming another on a CPU core. *(Module 1)*

**Control flow** — The order in which lines run. `if`, `for` and `while` change it: skip lines, or repeat them. *(Module 4)*

**Core** — One worker inside a CPU. Each core runs one thing at a time; a laptop often has 8. *(Module 1)*

**Coroutine** — A function defined with `async def`: it can pause at `await` and continue later. Calling it without `await` doesn't run it. *(Module 5)*

**CPU** — Central Processing Unit: the part of a computer that follows instructions and does the work. *(Module 1)*

**CPU-bound** — Work that keeps the CPU busy most of the time, like resizing photos. *(Module 1)*

**CPython** — The standard Python interpreter, written in C. The one you install from python.org. *(Module 0)*

**curl** — A command-line tool that sends HTTP requests, like a tiny browser with no screen. *(Module 0)*

**Current working directory** — The folder a process starts relative paths from. `os.getcwd()` shows it. *(Module 1)*

**Daemon** — A program that runs in the background, waiting for work. The Docker Engine is one. *(Module 0)*

**Data centre** — A building full of servers, with fast networks, power and cooling. *(Module 1)*

**Database** — A program that stores data safely and finds it again quickly. *(Module 0)*

**/dev/null** — A special file that throws away everything written to it. *(Module 2)*

**Dataclass** — A class made with `@dataclass`: you list typed fields, and Python writes `__init__`, `__repr__` and `__eq__` for you. *(Module 5)*

**Decorator** — A function that takes a function and returns a wrapper around it, adding behaviour before/after. `@timed` above `def f` means `f = timed(f)`. *(Module 5)*

**Default factory** — `field(default_factory=list)`: a function called for each new object, so every object gets its own fresh list. *(Module 5)*

**Default value** — A value a parameter takes when the caller doesn't pass one: `def line_total(price, quantity=1):`. *(Module 4)*

**Dependency** — A package another package needs to work. `requests` depends on `certifi`, `idna`, `urllib3` and `charset-normalizer`. *(Module 5)*

**Detached HEAD** — When Git is on a commit directly, not on a branch. New commits made there have no branch name following them. *(Module 3)*

**Dict** — Values looked up by name (a key), in `{ }`: `product["price_paise"]`. Short for dictionary. *(Module 4)*

**Diff** — A list of differences between two versions of files: `+` lines were added, `-` lines were removed. `git diff` shows one. *(Module 3)*

**Digest** — A fingerprint (`sha256:...`) of an image's exact content. Unlike a tag, it can never point to other bytes. *(Module 0)*

**Directory** — Another word for a folder: a special file that lists names and their inode numbers. *(Module 1)*

**Disk** — Storage that keeps files even when the power is off. Most computers use an SSD. *(Module 1)*

**Docker** — The tool that builds and runs containers. *(Module 0)*

**Docker Compose** — A tool that starts several containers together, described in one `docker-compose.yml` file. *(Module 0)*

**Docker Desktop** — The app that installs and starts the Docker Engine on Mac and Windows. *(Module 0)*

**Docker Engine** — The background program that actually builds and runs containers. *(Module 0)*

**Docker Hub** — A big online library of ready-made images, like `python` and `postgres`. *(Module 0)*

**Docstring** — The text in triple quotes right under `def`, saying what the function does. *(Module 4)*

**Dotfile** — A hidden file or folder whose name starts with `.`, like `.env` or `.bashrc`. `ls -a` shows them. *(Module 2)*

**Drop-in file** — A small `.conf` file in `<name>.service.d/` that overrides some lines of a unit file without editing it. *(Module 2)*

**Dry run** — Running a command or script so it only shows what it would do, without doing it. *(Module 2)*

**Dynamic typing** — In Python the value has a type, the name doesn't: one name can point to an int now and a str later. *(Module 4)*

**ECC memory** — RAM that detects and fixes some memory errors. Common in servers. *(Module 1)*

**Enable (systemd)** — `systemctl enable`: start a service automatically at every boot. Different from `start`, which runs it only now. *(Module 2)*

**Encoding** — The rule for turning text into bytes. UTF-8 handles every script, including `₹`; always pass `encoding="utf-8"`. *(Module 4)*

**Encrypted** — Scrambled so that only the intended receiver can read it. *(Module 2)*

**End of life** — The date after which a software version gets no more fixes, not even for security problems. *(Module 0)*

**.env file** — A file of settings, one `NAME=value` per line, loaded into the environment. Never commit real secrets in it. *(Module 2)*

**Entry point** — A command a package installs, like `bazaar = "bazaar.main:run"`: typing `bazaar` calls that function. *(Module 5)*

**Environment variable** — A named setting that every program on your computer can read, like `PATH`. *(Module 0)*

**Event loop** — asyncio's scheduler: it runs one coroutine until it awaits, then switches to another that's ready. *(Module 5)*

**Exception** — An error object Python raises while a program runs, like `ValueError`. Unless handled, it stops the program. *(Module 4)*

**Exit code** — A number a program returns when it ends. `0` means success; anything else means failure. *(Module 0)*

**export** — Shell command that puts a variable into the environment, so programs started from the shell receive it. *(Module 2)*

**Expression** — Any piece of code that gives a value, like `29900 // 100` or `p["name"]`. *(Module 4)*

**Extension** — An add-on that teaches an editor something new, like the Python extension for VS Code. *(Module 0)*

**F-string** — Text with an `f` in front, where `{ }` is replaced by a value: `f"₹{price}"`. *(Module 4)*

**Fast-forward** — A merge where your branch was simply behind, so Git just moves its label forward. No new commit. *(Module 3)*

**Fetch** — `git fetch`: download new commits and branches from a remote, without changing your files or your branches. *(Module 3)*

**Field** — One piece of data in a dataclass, written as `name: str` or `stock: int = 0`. *(Module 5)*

**File descriptor** — A small number (0, 1, 2, 3, ...) a process uses to refer to a file it has open. *(Module 1)*

**File mode** — How a file is opened: `"r"` read, `"w"` write (empties the file first), `"a"` append (adds at the end). *(Module 4)*

**File system** — The part of the OS that organises a disk's blocks into files and folders, with names and records. *(Module 1)*

**FileNotFoundError** — The exception raised when you open a file (for reading) that doesn't exist. *(Module 4)*

**Finally** — The block after `try`/`except` that runs every time, error or not. Used to close files and connections. *(Module 4)*

**Fingerprint** — A short ID of a key, like `SHA256:pVFtw...`, used to check you're talking to the right server. *(Module 2)*

**Float** — A number with a decimal point, like `4.5`. Stored in binary, so it can be slightly off: never use it for money. *(Module 4)*

**Fork** — Starting a new process as a copy of the current one, memory and all. Python does this on Linux. *(Module 1)*

**Fork (GitHub)** — Your own copy of someone else's repository on GitHub, used to propose changes to projects you can't push to. *(Module 3)*

**Frame** — The space for one function call: its arguments, local names, and where to return. *(Module 1)*

**Framework** — A ready-made toolbox that does the common work, so you write only your app's own code. Django is one. *(Module 0)*

**Frontend** — The part of an app you see and touch, like buttons and the search box. *(Module 0)*

**Frozen dataclass** — `@dataclass(frozen=True)`: its objects can't be changed after they're made. *(Module 5)*

**fsync** — A request to the operating system: "put this data on the disk now, and wait until it is there". *(Module 1)*

**Function** — A piece of code with a name, defined once with `def` and run (called) whenever needed: `delivery_charge(64900)`. *(Module 4)*

**Functools.wraps** — `@functools.wraps(func)` on a wrapper copies the original's name and docstring, so logs and tracebacks show the real name. *(Module 5)*

**Garbage collection** — Automatic freeing of objects that the program can no longer reach. *(Module 1)*

**Generator** — Something that makes values one at a time, when asked, instead of storing them all. A function with `yield` creates one. *(Module 5)*

**Generator expression** — A comprehension without brackets, inside `sum()`, `any()` or `all()`: values are made one at a time, never stored as a whole list. *(Module 4)*

**GHz** — Gigahertz: one billion ticks per second. A measure of CPU clock speed. *(Module 1)*

**GID** — Group ID: the number that names a group. *(Module 2)*

**GIL** — Global Interpreter Lock: CPython's rule that only one thread at a time runs Python code in a process. *(Module 1)*

**Git** — A tool that saves every version of your code as commits, so you can see changes and go back. *(Module 0)*

**GitHub** — A website that stores Git projects online, so you can share them and work as a team. *(Module 0)*

**Gitignore file** — A file named `.gitignore` that lists files Git must never save, like `.env` with passwords. *(Module 3)*

**Glob** — A file-name pattern like `*.log` or `order_?.log` that the shell expands into matching names. *(Module 2)*

**Golden rule of rebase** — Only rebase commits that nobody else has. Rebasing shared commits creates duplicates for your teammates. *(Module 3)*

**Group** — A named set of users, so permissions can be given to all of them at once. *(Module 2)*

**Hard link** — A second name for the same inode. The data lasts until the last name is removed. *(Module 1)*

**HDD** — Hard Disk Drive: a disk with spinning plates and a moving arm. Cheap, but slow for random reads. *(Module 1)*

**HEAD** — Git's name for "where you are now": usually the current branch, and so its newest commit. `HEAD~1` is the commit before it. *(Module 3)*

**Header** — An extra line of information sent with a request or response, like `Content-Type`. *(Module 0)*

**Headless** — Running without a screen or keyboard, managed over the network. *(Module 1)*

**Heap** — The memory area for objects that can live longer than one function call. All Python objects live here. *(Module 1)*

**Home folder** — A user's own folder: `/root` for root, `/home/<name>` for others. Written `~`. *(Module 2)*

**HTTP** — The set of rules computers use to send requests and responses on the web. *(Module 0)*

**I/O-bound** — Work that spends most of its time waiting for input/output: the disk, the network, a database. *(Module 1)*

**IDE** — Integrated Development Environment: a code editor with many built-in tools, like PyCharm. *(Module 0)*

**Image** — A ready-made package with a program and everything it needs. Containers are started from images. *(Module 0)*

**Import** — Load a module so you can use its code: `import json`, or `from money import rupees`. The module runs once. *(Module 4)*

**Indentation** — The spaces at the start of a line. In Python, 4 extra spaces mark the lines that belong to an `if` or a loop. *(Module 4)*

**Index** — A value's position in a list, counted from 0: `cart[0]` is the first, `cart[-1]` the last. *(Module 4)*

**Inheritance** — Building a class on top of another: `class GiftCard(Product):`. The child gets all the parent's methods. *(Module 5)*

**Inode** — A file's record: size, owner, permissions, times and where its data blocks are. Not its name. *(Module 1)*

**Instance** — Another word for an object made from a class: `masala` is an instance of `Product`. *(Module 5)*

**Instruction** — One tiny step the CPU understands, like "add these two numbers". *(Module 1)*

**Int** — A whole number, like `29900`. Exact; Bazaar stores money as int paise. *(Module 4)*

**Interactive rebase** — `git rebase -i`: edit a list of your commits to reword, squash, reorder or drop them before sharing. *(Module 3)*

**Interpreter** — The program that reads your code and runs it line by line. `python3` is the Python interpreter. *(Module 0)*

**Isolation** — Keeping parts apart so a problem in one can't spread to the others. Processes are isolated from each other. *(Module 1)*

**Journal** — A file system's log of changes it is about to make, so it can stay consistent after a crash. *(Module 1)*

**Journal (systemd)** — systemd's log of everything services print, with the time. Read it with `journalctl`. *(Module 2)*

**journalctl** — The command that reads the systemd journal, like `journalctl -u bazaar-web -n 20`. *(Module 2)*

**JSON** — A simple text format for data, like `{"name": "Masala Box", "price": 299}`. *(Module 0)*

**JSONDecodeError** — The exception `json.load` raises when the text isn't valid JSON, like single quotes or a half-written file. *(Module 4)*

**Kernel** — The core of the operating system: the only program allowed to touch the hardware directly. *(Module 1)*

**Key** — The name a dict uses to find a value, like `"price_paise"` in `product["price_paise"]`. *(Module 4)*

**KeyError** — The exception for a dict key that doesn't exist. *(Module 4)*

**Keyword argument** — An argument passed by name: `line_total(99900, quantity=2)`. *(Module 4)*

**known_hosts** — The file on your laptop (`~/.ssh/known_hosts`) remembering the servers you've trusted. *(Module 2)*

**Latency** — How long one request takes, from start to finish. *(Module 0)*

**Layer** — One slice of a Docker image that adds or changes some files. Images are stacks of layers. *(Module 0)*

**Least privilege** — Give every user and program only the access it needs, nothing more. *(Module 2)*

**List** — Many values in order, in `[ ]`: `cart = ["Masala Box", "Cotton Kurta"]`. Can change. *(Module 4)*

**Load average** — The average number of threads running or waiting for a CPU, over 1, 5 and 15 minutes. Compare it with the core count. *(Module 1)*

**Local name** — A name made inside a function. It exists only inside, while the function runs. *(Module 4)*

**localhost** — A name that always means "this same computer". Its address is `127.0.0.1`. *(Module 0)*

**Locality** — Programs tend to reuse the same data soon (temporal) and use nearby data next (spatial). Caches rely on it. *(Module 1)*

**Lock** — A token only one thread can hold at a time, used so threads don't mix up their steps. *(Module 1)*

**Lock file** — A generated file (like `uv.lock`) recording the exact version and hash of every package, so installs are repeatable. *(Module 5)*

**Logs** — The lines a program writes about what it is doing. The backend's diary. *(Module 0)*

**Loop** — Code that repeats. `for` runs once per item in a collection; `while` runs as long as a condition is True. *(Module 4)*

**Main branch** — The first, default branch (`main`). In most teams it holds the code that really runs. *(Module 3)*

**Memory hierarchy** — The levels of storage from small-fast-expensive (registers, cache) to big-slow-cheap (disk, network). *(Module 1)*

**Memory leak** — Memory a program keeps but will never use again, so its RAM keeps growing. *(Module 1)*

**Merge** — Bringing another branch's commits into the branch you are on: `git merge diwali-sale`. *(Module 3)*

**Merge base** — The newest commit two branches share: the point where they split. Git compares both sides against it. *(Module 3)*

**Merge commit** — A commit with two parents that joins two branches together. *(Module 3)*

**Merge conflict** — When both branches changed the same lines differently, so Git stops and asks you to choose the final version. *(Module 3)*

**Method** — A function defined inside a class, called on an object: `masala.sell(2)`. *(Module 5)*

**Microsecond (µs)** — One millionth of a second. 1,000 µs = 1 ms. *(Module 1)*

**Millisecond (ms)** — One thousandth of a second. *(Module 1)*

**Mode** — A file's permission bits, like `rw-r-----` or `640`: read, write and execute for owner, group and others. *(Module 2)*

**Module** — A `.py` file whose functions and names other files can use with `import`. *(Module 4)*

**Mutable** — Can be changed after it is created, like a list or dict. Ints, strings and tuples are immutable. *(Module 1)*

**Mypy** — A tool that reads type hints and reports type mistakes before the program runs. *(Module 5)*

**nano** — A simple terminal text editor. `Ctrl+O` saves, `Ctrl+X` exits. *(Module 2)*

**Nanosecond (ns)** — One billionth of a second. 1,000 ns = 1 µs. *(Module 1)*

**None** — Python's value for "nothing yet", like a discount code that isn't set. *(Module 4)*

**Object** — One thing made from a class, with its own data: `masala = Product("Masala Box", 29900, "Patel Spices", 40)`. Also called an instance. *(Module 5)*

**Object-oriented programming** — Building a program from objects that hold data and offer actions. OOP for short. *(Module 5)*

**Off-by-one error** — A mistake at a border value, like using `>` where `>=` was meant, so exactly ₹999 is treated wrong. *(Module 4)*

**OOM killer** — The Linux kernel's out-of-memory killer: it ends a process with SIGKILL when memory runs out. *(Module 1)*

**Operating system** — The main program of a computer (Linux, macOS, Windows) that runs other programs and shares the CPU and RAM between them. *(Module 1)*

**Option** — A word that changes how a command works, like `-l` or `--all`. *(Module 2)*

**Origin** — The default name Git gives the remote you cloned from, usually the repository on GitHub. *(Module 3)*

**Orphan** — A process whose parent died first. PID 1 adopts it. *(Module 1)*

**Override** — Writing a method in a child class with the same name as the parent's, so the child's version is used instead. *(Module 5)*

**Package** — A ready-to-install piece of software from an online catalogue. *(Module 2)*

**Package (Python)** — A folder of Python modules (with an `__init__.py`), imported like `from bazaar import money`. Django apps are packages. *(Module 4)*

**Package manager** — A tool that installs, updates and removes packages, like `apt` (or `pip` for Python libraries). *(Module 2)*

**Page** — A small fixed-size piece of memory (often 4 KB) that the kernel maps between virtual addresses and RAM. *(Module 1)*

**Page cache** — Spare RAM where the operating system keeps recently used files, so reading them again is fast. *(Module 1)*

**Paise** — One hundredth of a rupee (₹1 = 100 paise). Bazaar keeps every amount as a whole number of paise. *(Module 4)*

**Parameter** — The name a function uses for an input, like `paise` in `def rupees(paise):`. *(Module 4)*

**Parent class** — The class another class is built on (`Product` for `GiftCard`). Also called the base class or superclass. *(Module 5)*

**Parent commit** — The commit that came just before a commit. Each commit points to its parent, so commits form a history. *(Module 3)*

**PATH** — The list of folders the shell searches, in order, when you type a command. *(Module 0)*

**Path** — The address of a file, like `/data/orders/order_1042.json`. *(Module 1)*

**Pickling** — Turning a Python object into bytes (Python's own format) so it can be saved or sent to another process. *(Module 5)*

**PID** — Process ID: the number the operating system gives every running process. *(Module 1)*

**pip** — Python's package installer: it downloads libraries other people wrote, like Django. *(Module 0)*

**Pip** — Python's standard tool for installing packages: `pip install -r requirements.txt`. *(Module 5)*

**Pipe** — The `|` symbol: it sends one command's output straight into the next command. *(Module 2)*

**Pipeline** — Several commands joined with `|`, each doing one small job. *(Module 2)*

**Polymorphism** — The same call doing the right thing for each kind of object: `item.describe()` for a product or a gift card. *(Module 5)*

**Port** — A door number on a computer. Each server program listens at its own port, like 8000. *(Module 0)*

**PPID** — Parent process ID: the PID of the process that started this one. *(Module 1)*

**Private key** — The secret half of a key pair. It stays on your laptop and is never sent anywhere. *(Module 2)*

**Process** — A program that is running right now, with its own PID and its own memory. *(Module 1)*

**Process pool** — A ready set of worker processes for CPU-heavy tasks: `ProcessPoolExecutor()`. *(Module 5)*

**Prompt** — The text the shell shows when it is ready for a command, like `root@bazaar-server:/srv/bazaar#`. *(Module 2)*

**Property** — A method used like an attribute (`masala.price_rupees`), made with `@property`. Without a setter, it's read-only. *(Module 5)*

**Protocol** — A set of rules two sides agree on to talk to each other, like HTTP. *(Module 0)*

**Public key** — The shareable half of a key pair, copied to servers you want to log in to. *(Module 2)*

**Pull** — `git pull`: fetch from the remote, then merge (or rebase) the new commits into your branch. *(Module 3)*

**Pull request** — A request on GitHub to merge one branch into another, with the diff, comments and reviews. GitLab calls it a merge request. *(Module 3)*

**Push** — `git push`: upload your branch's new commits to a remote, like GitHub. *(Module 3)*

**PyPI** — The Python Package Index (pypi.org): the public library of Python packages that `pip` and `uv` install from. *(Module 5)*

**Pyproject.toml** — The file that describes your Python package: name, version, dependencies and commands. *(Module 5)*

**Query string** — The part of a URL after `?`, with extra details, like `?q=shoes`. *(Module 0)*

**Queue** — A waiting line where the first one in is the first one served. *(Module 0)*

**Race condition** — A bug where the result depends on the exact timing of threads, like selling the last item twice. *(Module 1)*

**RAID** — Combining several disks so that data survives when one of them fails. *(Module 1)*

**Raise** — Start an exception on purpose: `raise ValueError("only 8 left")`. Stops the function, like `return`, but with an error. *(Module 4)*

**RAM** — Random Access Memory: the fast working memory of a computer. It forgets everything when the power goes off. *(Module 1)*

**Rebase** — `git rebase main`: copy your branch's commits on top of the newest `main`, so history stays one straight line. The copies get new hashes. *(Module 3)*

**Recursion** — A function that calls itself. Each call adds a frame to the stack. *(Module 1)*

**Redirection** — Sending a command's output to a file (`>`, `>>`) or its errors somewhere else (`2>`). *(Module 2)*

**Reference counting** — Counting how many names and objects point to an object, and freeing it when the count reaches zero. *(Module 1)*

**Reflog** — Git's local diary of everywhere `HEAD` has been. `git reflog` finds commits that no branch points to any more. *(Module 3)*

**Register** — A tiny storage spot inside the CPU for the values it is working on right now. The fastest memory. *(Module 1)*

**Registry** — An online library of Docker images, like Docker Hub. *(Module 0)*

**Relative path** — A path that starts from the current working directory, like `orders/order_1042.json`. *(Module 1)*

**Remote** — Another copy of your repository somewhere else, usually on GitHub. `git remote -v` lists them. *(Module 3)*

**Remote-tracking branch** — Your laptop's memory of a branch on the remote, like `origin/main`. Only `fetch` and `pull` update it. *(Module 3)*

**REPL** — Python's interactive prompt (`>>>`), started with `python3`: type one line, get the answer at once. *(Module 4)*

**Repository** — A folder whose history Git tracks, with all its commits in a hidden `.git` folder. *(Module 0)*

**Request** — A message from a frontend asking the backend to do something. *(Module 0)*

**Requirements file** — `requirements.txt`: the list of packages to install, each with an exact version (`requests==2.34.2`). *(Module 5)*

**Response** — The backend's answer to a request. *(Module 0)*

**Return value** — What a function call gives back with `return`. A function without `return` gives back `None`. *(Module 4)*

**Root** — The administrator user (UID 0). The kernel doesn't check read/write permissions for root. *(Module 2)*

**RSS** — Resident Set Size: how much RAM a process is really using right now. Shown by `ps` and `top`. *(Module 1)*

**Scaling** — Making a system handle more users or more data. *(Module 0)*

**Scheduler** — The part of the kernel that decides which thread runs on which CPU core, and for how long. *(Module 1)*

**scp** — Copies files between your computer and a server over SSH: `scp file user@server:/path/`. *(Module 2)*

**Self** — A method's first parameter: the object the method was called on (the one before the dot). *(Module 5)*

**Serialize** — Turn data into text or bytes so it can be saved or sent, like `json.dumps(cart)`. Deserialize is the reverse. *(Module 4)*

**Server** — A computer whose job is to answer requests from other computers. *(Module 0)*

**Service (systemd)** — A program that systemd runs in the background all the time, like `bazaar-web`. *(Module 2)*

**Service user** — A user that runs one program (like `www-data` for the web server), usually with no login. *(Module 2)*

**Set** — A collection that keeps each value only once, with fast `in` checks: `{"Patel Spices", "Meera Handloom"}`. *(Module 4)*

**Setuid** — A permission bit that makes a program run as its owner (often root), like `sudo` and `passwd`. *(Module 2)*

**Shebang** — The first line of a script, like `#!/usr/bin/env bash`, saying which program should run it. *(Module 2)*

**Shell** — The program inside a terminal that reads your commands and runs them, like `zsh`, `bash` or PowerShell. *(Module 0)*

**Shell script** — A text file of shell commands that runs as one program. *(Module 2)*

**Signal** — A short message the kernel delivers to a process, like SIGTERM ("please stop") or SIGKILL ("stop now"). *(Module 1)*

**Socket** — A kernel object, used through a file descriptor, for sending and receiving data over the network. *(Module 1)*

**Spawn** — Starting a new process fresh, so it reads the program file again. Python does this on macOS and Windows. *(Module 1)*

**Special method** — A method with double underscores on both sides (`__str__`, `__eq__`, `__len__`) that Python calls for `print`, `==`, `len()` and so on. Also called a dunder method. *(Module 5)*

**SSD** — Solid State Drive: the usual kind of disk today. Big and lasting, but much slower than RAM. *(Module 1)*

**SSH** — Secure Shell: an encrypted way to open a terminal on another computer. Uses port 22. *(Module 2)*

**Stack overflow** — Running out of stack space because calls go too deep. Python stops earlier with RecursionError. *(Module 1)*

**Staging area** — Git's list of changes chosen for the next commit. `git add` puts changes there. *(Module 0)*

**Standard library** — The modules that come with Python, ready to import: `json`, `datetime`, `random`, `pathlib`, `sys` and many more. *(Module 4)*

**Stash** — `git stash`: put uncommitted changes aside for a moment, for example to switch branches. `git stash pop` brings them back. *(Module 3)*

**Status code** — A number in a response that says how it went. `200` = success, `404` = not found. *(Module 0)*

**stderr** — Standard error: where a command prints its error messages (stream 2). *(Module 2)*

**stdin** — Standard input: where a command reads its input from (stream 0), like the keyboard or a pipe. *(Module 2)*

**stdout** — Standard output: where a command prints its normal results (stream 1). *(Module 2)*

**Sticky bit** — On a folder like `/tmp`: users may only delete or rename their own files. Shown as `t`. *(Module 2)*

**StopIteration** — The exception a generator raises when it has no more values. A `for` loop catches it for you. *(Module 5)*

**String (str)** — Text, written in quotes: `"Masala Box"`. *(Module 4)*

**sudo** — Runs one command as root, if your user is allowed in `/etc/sudoers`, and records who ran it. *(Module 2)*

**Super()** — "My parent class": `super().__init__(...)` runs the parent's setup from inside the child. *(Module 5)*

**Supervisor** — A process (or thread) that starts other processes and restarts them if they die. *(Module 1)*

**Swap** — Disk space the OS uses as emergency RAM when real RAM is full. Much slower. *(Module 1)*

**Symbolic link** — A shortcut file that points to another file, like `python3 -> python3.13`. *(Module 0)*

**System call** — A request from a program to the kernel, like "open this file" or "start a process". *(Module 1)*

**systemctl** — The command that gives systemd orders: `start`, `stop`, `restart`, `status`, `enable`. *(Module 2)*

**systemd** — The first program Linux starts (PID 1). It starts, watches and restarts all other programs. *(Module 2)*

**Tag** — The version label of an image, after the colon: `python:3.13.18-slim-trixie`. *(Module 0)*

**Terminal** — A window where you type commands for your computer. *(Module 0)*

**Thread** — A worker inside a process. All threads of one process share the same memory. *(Module 0)*

**Thread pool** — A ready set of threads that runs tasks for you: `ThreadPoolExecutor(max_workers=10)`. *(Module 5)*

**Throughput** — How many requests a system finishes per second. *(Module 0)*

**Traceback** — Python's report of where an error happened. Read it from the bottom: the last line says what went wrong. *(Module 0)*

**Truthy and falsy** — Values that count as True or False in a condition. `0`, `""`, `None` and empty collections are falsy; the rest are truthy. *(Module 4)*

**Try and except** — `try:` runs code that may fail; `except ValueError:` runs instead if that error happens, so the program keeps going. *(Module 4)*

**Tuple** — A small fixed group of values in `( )`, like `("Masala Box", 29900, 2)`. Can't be changed. *(Module 4)*

**Type** — The kind of a value, which decides what you can do with it: `str`, `int`, `float`, `bool`, `None`, and more. *(Module 4)*

**Type hint** — A note saying what type a value should be: `price_paise: int`, `-> int`. Python ignores it while running; tools like mypy check it. *(Module 5)*

**UID** — User ID: the number that names a user. root is 0. *(Module 2)*

**umask** — The bits removed from new files' and folders' permissions. With `022`, files get `644` and folders `755`. *(Module 2)*

**Unit file** — A text file that tells systemd how to run something, like `bazaar-web.service`. *(Module 2)*

**Unpacking** — Giving each value of a tuple or list its own name at once: `name, price, quantity = line`. *(Module 4)*

**Untracked file** — A file Git can see in your folder but isn't saving yet. `git status` lists it; `git add` starts tracking it. *(Module 3)*

**Uptime** — The share of time a system works, like 99.9%. *(Module 1)*

**Uv** — A fast tool that does the jobs of `venv` and `pip` (and more): `uv venv`, `uv pip install`. *(Module 5)*

**ValueError** — The exception for a value of the right type that makes no sense, like `int("three")`. *(Module 4)*

**Variable** — A name stuck on a value, like `price_paise = 29900`. Using the name later means that value. *(Module 4)*

**Version control system** — A tool that records every version of your files, with who changed what, when and why. Git is one. *(Module 0)*

**vi** — A terminal text editor found on almost every server. `i` to type, `Esc`, then `:wq` to save or `:q!` to quit without saving. *(Module 2)*

**Virtual address** — The private address a process uses for its memory; the kernel maps it to real RAM. *(Module 1)*

**Virtual environment** — A private folder of Python packages for one project, so projects don't break each other. *(Module 0)*

**Virtual machine** — Software that pretends to be a whole computer, with its own operating system and kernel. *(Module 0)*

**Volatile** — Memory that forgets everything when the power goes off, like RAM. *(Module 1)*

**Volume** — A Docker storage area that keeps data even after a container is removed. *(Module 1)*

**VPS** — Virtual Private Server: a rented virtual machine, a slice of a bigger physical machine. *(Module 1)*

**With statement** — `with open(...) as f:` opens something and closes it automatically when the block ends, even after an error. *(Module 4)*

**Worker** — The part of a server that handles a request. One worker handles one request at a time. *(Module 0)*

**Wrapper** — The new function a decorator returns. It calls the original and adds something around it. *(Module 5)*

**WSL 2** — Windows Subsystem for Linux: a real Linux that runs inside Windows. Docker Desktop uses it. *(Module 0)*

**Yield** — Inside a function: hand out one value, pause, and carry on from here when the next value is asked for. *(Module 5)*

**Zombie** — A process that has finished, but whose parent has not yet collected its exit code. *(Module 1)*
