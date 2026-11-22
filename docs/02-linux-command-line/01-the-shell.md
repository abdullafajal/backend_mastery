# The shell

<div class="bz-meta" markdown>
**Module** 2 · Linux and the command line
**Lesson** 1
**Reading time** 15 min (+ optional deeper parts)
**You will build** muscle memory on a pretend Bazaar server: commands, quotes, globs, variables, exit codes, `&&`, and your first script
</div>

!!! abstract "In 1 minute"
    - The **shell** reads your command, turns it into words, and runs the program.
    - **Quotes** keep words together: `rm "summer sale.txt"` is one file; without quotes it's two.
    - `*.log` is expanded **by the shell** into file names, before the program even starts.
    - Every command ends with an **exit code**: `0` means success. `a && b` runs `b` only if `a` worked.
    - In the lab, you see all of this on a pretend Bazaar server, and write your first script.

> **Previously in Bazaar:** Module 1 opened the machine: CPU, RAM, disk, processes, memory, files, and what a server is.
> You learned that Bazaar's server has no screen. Everything happens by typing.

## 1. Why learn this?

It's 2 a.m. on the Diwali sale. Bazaar's checkout is failing. The server has no screen, no mouse, no file explorer:
only a **shell**, over SSH. In the next ten minutes you must find the error in the logs, check the disk, restart the service,
and not make things worse. Three real mistakes from teams like Bazaar's:

1. `rm summer sale.txt` deleted two **other** files, called `summer` and `sale.txt`.
2. A deploy script ran `cd /srv/bazaar; git pull` on a server where the folder didn't exist, and pulled code into the wrong place.
3. A cleanup script ran `rm -rf "$BUILD_DIR/"` while `BUILD_DIR` was empty. That is `rm -rf /`.

Every one of these comes from not knowing **what the shell does with your line before the program even starts**.
This lesson teaches exactly that. You already used the shell in every lab; now you will understand it.

## 2. The concept

### The shell, the terminal, and the prompt

Quick recap from Module 0: the **terminal** is the window; the **shell** is the program inside it that reads your commands.
On Linux servers the shell is almost always **bash** (Bourne Again SHell). On a Mac it is usually **zsh**, which is very similar.
Everything in this module works in both, unless we say so.

The shell shows a **prompt** when it is ready for your command. On our lab server:

```
root@bazaar-server:/srv/bazaar#
```

| Part | Meaning |
| --- | --- |
| `root` | the user you are logged in as |
| `bazaar-server` | the machine's name (hostname) |
| `/srv/bazaar` | your **current working directory** (Module 1, Lesson 4). `~` would mean your home folder |
| `#` | you are the administrator (root). A normal user sees `$`. Seeing `#` should make you careful |

### The shape of a command

```
ls -l --all logs
```

| Part | Example | Meaning |
| --- | --- | --- |
| **command** | `ls` | the program (or builtin) to run |
| **short options** | `-l` | one letter after one dash; can be combined: `-la` = `-l -a` |
| **long options** | `--all` | a full word after two dashes; easier to read in scripts |
| **arguments** | `logs` | what to work on: files, folders, words |

Options change **how** a command works; arguments say **what** it works on. Some options take a value:
`head -n 5 file` or `head --lines=5 file`.

??? note "Going deeper: Where do commands come from?"
    When you type a command name, the shell looks for it in this order:

    1. an **alias** (a shortcut you defined, like `ll` for `ls -l`);
    2. a **function** (a mini-script defined in the shell);
    3. a **builtin**: a command that is part of bash itself, like `cd`, `echo`, `export`, `type`;
    4. a **program** in one of the folders in `PATH` (Module 0, Lesson 3), like `/usr/bin/ls`.

    `type <name>` tells you which one it is:

    ```
    $ type cd
    cd is a shell builtin
    $ type ls
    ls is /usr/bin/ls
    $ type python3
    python3 is /usr/local/bin/python3
    ```

    Why must `cd` be a builtin? Because it changes the shell's **own** current folder. A separate program runs in its own process
    (Module 1, Lesson 2): it could only change **its own** folder, then exit. The shell's folder would stay the same.

### What happens when you press Enter

This is the heart of the lesson. Before any program runs, bash does all of this:

1. **Read** the line.
2. **Split** it into **words** at spaces (and tabs), except where quotes or a backslash keep text together.
   Special symbols like `|`, `;`, `&&`, `>` are recognised here too.
3. **Expand** each word:
    - `$NAME` → the value of the variable;
    - `~` → your home folder;
    - `$(command)` → the output of that command (**command substitution**);
    - `*`, `?`, `[...]` → matching file names (**globbing**).
4. **Find** the command (alias, function, builtin, or PATH).
5. **Run** it: for a program, start a new process (Module 1, Lesson 2) with the final words as its **arguments**, and **wait** for it.
6. Store its **exit code** in `$?`.

The program never sees your quotes, your `*` or your `$NAME`. It only sees the final list of words.
That is why the same program can behave very differently depending on how you typed the line.

### Quotes

| You type | The program gets | Why |
| --- | --- | --- |
| `rm summer sale.txt` | 2 arguments: `summer`, `sale.txt` | the space splits words |
| `rm "summer sale.txt"` | 1 argument: `summer sale.txt` | double quotes keep it together |
| `rm 'summer sale.txt'` | 1 argument: `summer sale.txt` | single quotes keep it together |
| `rm summer\ sale.txt` | 1 argument: `summer sale.txt` | a backslash protects the next character |

Double and single quotes differ in one important way:

- **Double quotes** `"..."` still expand `$VAR` and `$(...)`: `echo "sale is $SALE"` → `sale is diwali`.
- **Single quotes** `'...'` expand **nothing**: `echo 'sale is $SALE'` → `sale is $SALE`.

The rule professionals follow: **always put variables in double quotes** (`"$FILE"`), unless you have a reason not to.
An unquoted variable that contains a space, or nothing at all, splits into the wrong number of arguments.

### Globs: the shell expands `*`, not the program

| Pattern | Matches |
| --- | --- |
| `*` | any characters, any length (but not a leading `.`) |
| `?` | exactly one character |
| `[abc]`, `[0-9]` | one character from the set or range |

```
$ echo logs/*.log
logs/order_20261119.log logs/order_20261120.log logs/order_20261121.log
$ echo logs/order_2026112?.log
logs/order_20261120.log logs/order_20261121.log
```

`echo` received three (then two) file names. It had no idea a `*` was ever typed.

If **nothing** matches, bash passes the pattern unchanged, and the program gets a file literally called `*.csv`:

```
$ ls logs/*.csv
ls: cannot access 'logs/*.csv': No such file or directory
```

Globs are expanded **before** the command runs. So `rm *.log` in the wrong folder deletes every `.log` file there,
and `rm` can't warn you, because it never saw the `*`. Before a risky `rm` with a glob, run `echo` with the same glob first.

### Variables

```
SALE=diwali
echo "$SALE"
```

- **No spaces around `=`.** `SALE = diwali` means "run a command called `SALE` with arguments `=` and `diwali`":
  `bash: SALE: command not found`.
- Use `"${SALE}"` (with braces) when the name is followed by letters: `"${SALE}_banner.png"`.
- These are **shell variables**. Lesson 5 shows how to turn them into **environment variables** that programs can see.

### Exit codes and chaining commands

Every command ends with an **exit code**: `0` means success, anything else means failure. `echo $?` shows the last one.
Two you'll meet often: `127` means "command not found", `126` means "found, but not allowed to run".

You can join commands on one line:

| Operator | Meaning | Bazaar example |
| --- | --- | --- |
| `a ; b` | run `a`, then `b`, **no matter what** | `date; uptime` |
| `a && b` | run `b` **only if** `a` worked | `cd /srv/bazaar && git pull` |
| <code>a &#124;&#124; b</code> | run `b` **only if** `a` failed | <code>cd /srv/bazaar &#124;&#124; echo "folder missing!"</code> |

Mistake 2 from part 1 was `cd /srv/bazaar; git pull`. With `&&`, the pull would never have run in the wrong folder.

??? note "Going deeper: more exit codes"

    Every command ends with an **exit code** (Module 0): `0` means success, anything else means failure.
    `$?` holds the last one. Common codes you'll meet:

    | Code | Usually means |
    | --- | --- |
    | `0` | success |
    | `1` | a general failure (for `grep`: "found nothing") |
    | `2` | wrong usage, or (for `ls`) a file that doesn't exist |
    | `126` | found, but not allowed to run (not executable) |
    | `127` | command not found |
    | `128 + N` | killed by signal N: `130` = Ctrl+C (SIGINT), `137` = SIGKILL (Module 1) |

    You can join commands on one line:

    | Operator | Meaning | Bazaar example |
    | --- | --- | --- |
    | `a ; b` | run `a`, then `b`, **no matter what** | `date; uptime` |
    | `a && b` | run `b` **only if** `a` succeeded | `cd /srv/bazaar && git pull` |
    | <code>a &#124;&#124; b</code> | run `b` **only if** `a` failed | <code>cd /srv/bazaar &#124;&#124; echo "folder missing!"</code> |

    Mistake 2 from part 1 was `cd /srv/bazaar; git pull`. With `&&`, the pull would never have run in the wrong folder.

### Shell scripts

A **shell script** is a text file full of commands. The first line says which program runs it:

```bash
#!/usr/bin/env bash
```

Two ways to run a script called `deploy.sh`:

- `bash deploy.sh` always works;
- `./deploy.sh` works only after `chmod +x deploy.sh` ("make it runnable"). Without it you get `Permission denied`.

??? note "Going deeper: the shebang, ./, and set -euo pipefail"

    A **shell script** is a text file of commands. Bazaar's lab tests (`test_lab.sh`) are shell scripts. The first line is the **shebang**:

    ```bash
    #!/usr/bin/env bash
    ```

    It tells the system which program should run the file. To run a script:

    - `bash deploy.sh` always works (you ask bash to read the file);
    - `./deploy.sh` works only after `chmod +x deploy.sh`, which marks the file as **executable**. Without it:
      `bash: ./deploy.sh: Permission denied` (exit code 126). Lesson 3 explains permissions.

    Why `./`? Because the current folder is (on purpose) **not** in `PATH`. `./deploy.sh` says "the file in **this** folder".

    Every `test_lab.sh` in this course starts with `set -euo pipefail`. Now you can read it:

    | Option | Meaning |
    | --- | --- |
    | `-e` | stop the script as soon as a command fails |
    | `-u` | treat using an unset variable as an error (this would have stopped mistake 3) |
    | `-o pipefail` | a pipeline fails if **any** command in it fails, not only the last one (Lesson 4) |

### Help, history and keys that save hours

Getting help:

- `command --help`: a short summary of options, built into most programs.
- `man command`: the full manual page, on most servers (our slim lab image leaves manuals out to stay small).
- `help cd`: help for bash builtins.
- `type command`: what kind of command it is, and where it lives.

Keys and history:

| Key / command | What it does |
| --- | --- |
| `Tab` | complete a command or file name (press twice to see choices). Saves typing **and** typos |
| `↑` / `↓` | previous / next command from history |
| `Ctrl+R`, then type | search your history ("reverse search") |
| `history` | list recent commands; `!!` repeats the last one |
| `Ctrl+C` | stop the running command (sends SIGINT, Module 1) |
| `Ctrl+D` | "end of input": logs out of the shell when the line is empty |
| `Ctrl+L` | clear the screen |
| `Ctrl+A` / `Ctrl+E` | jump to the start / end of the line |
| `Ctrl+U` | delete everything before the cursor |

### An analogy, and where it breaks

Think of the shell as Bazaar's **order desk clerk**. You hand over a handwritten slip (the line). Before passing it to the
warehouse (the program), the clerk:

- separates it into items wherever there's a gap, unless items are in quotes (splitting);
- replaces short forms with the real values: "today's sale" → "diwali", "all log files" → the actual list of files (expansion);
- finds the right department (builtin or a program in PATH);
- waits for the department to finish, and writes "done" or "failed" in a register (the exit code).

Where it breaks: a careful clerk would ask "did you really mean **all** log files?" The shell never asks. It expands `*` and
runs the command at once. There's no undo and no recycle bin for `rm`.

??? note "Going deeper: In the real world"
    - **Dockerfiles** (Module 19): every `RUN` line is a shell command. `RUN cd /app && pip install ...` uses exactly these rules.
    - **CI/CD** (Module 24): GitHub Actions `run:` steps are shell scripts; `set -e` decides whether a failing test stops the deploy.
    - **Deploy and backup scripts** (Modules 17 and 24) are shell scripts, where an unquoted variable can do real damage.
    - **Every lab** in this course: `docker compose ...`, `curl ...`, and `test_lab.sh`.
    - Incidents (Module 36): during an outage, the shell is often the only tool you have.

### Questions you may have

**bash, zsh, sh, PowerShell: what's the difference?**
`sh` is the old, minimal standard shell; scripts written for `sh` run almost anywhere. `bash` adds many features and is the usual
shell on Linux servers. `zsh` (default on Mac) is similar to bash with extra comforts. PowerShell is Windows' shell, with a different
design (it passes objects, not text). On Windows, use Git Bash or WSL for this course.

**Why not use a graphical file manager on servers?**
Servers usually have no screen, and you connect from far away. Typed commands are also repeatable: you can put them in a script,
review them, and run them on 100 servers.

**Is the shell a programming language?**
Yes: it has variables, `if`, loops and functions. It's great for gluing programs together, and painful for anything complex.
When a script grows past a page, write it in Python instead.

**Can I undo `rm`?**
No. There's no recycle bin. That's why we check with `echo` or `ls` first, quote variables, and use `set -u` in scripts.

**What does `sudo` do?**
It runs one command as the administrator (root). Lesson 3 explains it. In our lab containers you are already root, which is
convenient for learning and exactly why you must be careful.

## 3. See it in action

Pick a command line, then press **Play**. Watch the **arguments** box: it shows what the program really gets.

<div class="bz-diagram" data-diagram="shell-steps"></div>

## 4. Code example

There is no new Python today: the "code" is the shell. Here is a small, safe deploy-style script that uses everything above.

```bash title="safe_cleanup.sh"
--8<-- "labs/02-linux-command-line/01-the-shell/seed/safe_cleanup.sh"
```

Run it in the lab:

```
$ bash safe_cleanup.sh
cleaning old order logs in /srv/bazaar/logs
would delete: /srv/bazaar/logs/order_20261119.log
would delete: /srv/bazaar/logs/order_20261120.log
would delete: /srv/bazaar/logs/order_20261121.log
3 file(s) would be deleted. Run with --really to delete them.
```

Line by line:

- `set -euo pipefail`: stop on errors and on unset variables.
- `LOG_DIR="${LOG_DIR:-/srv/bazaar/logs}"`: use the environment's `LOG_DIR` if set, otherwise a default. `${NAME:-default}` is
  a safe way to give a variable a fallback.
- `cd "$LOG_DIR" || exit 1`: if the folder is missing, stop. Never continue in the wrong place.
- `for f in "$LOG_DIR"/order_*.log`: the glob expands to the file names; quotes protect names with spaces.
- `[ -e "$f" ] || continue`: if nothing matched, the loop gets the literal pattern; skip it.
- It only **prints** what it would delete, unless you pass `--really`. A "dry run" first is a habit that saves careers.

## 5. Under the hood

### Watching the shell split words

```
$ rm summer sale.txt
rm: cannot remove 'summer': No such file or directory
rm: cannot remove 'sale.txt': No such file or directory
$ echo $?
1
$ rm "summer sale.txt"
$ echo $?
0
```

`rm` complained about **two** files, because it received two arguments. With quotes, it received one.

### A tiny tool that shows the arguments

The lab includes `show_args`, a two-line script that prints exactly what a program receives:

```bash title="show_args"
--8<-- "labs/02-linux-command-line/01-the-shell/seed/show_args"
```

```
$ ./show_args summer sale.txt
2 argument(s):
  [summer]
  [sale.txt]
$ ./show_args "summer sale.txt"
1 argument(s):
  [summer sale.txt]
$ ./show_args logs/*.log
3 argument(s):
  [logs/order_20261119.log]
  [logs/order_20261120.log]
  [logs/order_20261121.log]
$ SALE=diwali; ./show_args "$SALE sale" '$SALE sale'
2 argument(s):
  [diwali sale]
  [$SALE sale]
```

Whenever a command behaves strangely, put `show_args` in front of it, and you'll see what the shell did to your line.

### The empty variable trap

```
$ DIR=""
$ echo rm -rf "$DIR/"
rm -rf /
$ set -u
$ echo rm -rf "$DIRR/"
bash: DIRR: unbound variable
```

With an empty `DIR`, `"$DIR/"` becomes just `/`. We used `echo` so nothing was deleted, and you can see what **would** have run.
With `set -u`, a **misspelled** name (`DIRR`) stops the script instead of turning into nothing. For values that might be empty,
add a check like `[ -n "$DIR" ] || exit 1`.

### Exit codes, measured

```
$ ls /nope; echo $?
ls: cannot access '/nope': No such file or directory
2
$ grep -q refund logs/order_20261119.log; echo $?
1
$ nosuchcommand; echo $?
bash: nosuchcommand: command not found
127
$ ./deploy.sh; echo $?
bash: ./deploy.sh: Permission denied
126
```

??? note "Going deeper: the shell is just a program, and so are its children"
    When bash runs `ls`, it **forks** a copy of itself and the copy **execs** `/usr/bin/ls` (Module 1, Lesson 2). The child inherits
    the shell's current folder, its environment variables and its open file descriptors 0, 1 and 2, which is why `ls` prints to your
    terminal. When the child exits, bash collects its exit code with `wait()` and puts it in `$?`. Builtins like `cd` skip all this:
    they run inside bash itself. You can see the difference with `type`.

??? note "Going deeper: `[` is a command too"
    In `if [ -e "$f" ]`, the `[` is actually a command (a builtin version of `/usr/bin/[`, also called `test`), and `]` is its last
    argument. That's why the spaces around it are required: `[-e "$f"]` would look for a command called `[-e`. `if` simply runs a
    command and checks whether its exit code is 0. Bash also has `[[ ... ]]`, a smarter built-in test that our lab scripts use.

## 6. Lab

**Lab folder:** `labs/02-linux-command-line/01-the-shell/`

```bash
cd labs/02-linux-command-line/01-the-shell
docker compose run --rm shell
```

You land on a pretend Bazaar server, in a fresh copy of `/srv/bazaar` with order logs, `products.json` and a file called
`summer sale.txt`. Every new session starts fresh, so you can't break anything for good.

In the lab you will read the prompt and find where commands come from, use options and `--help`, see quotes and globs change the
arguments (with `show_args`), set variables, read exit codes, chain commands with `&&`, `||` and `;`, see the empty-variable trap,
and write and run your first script.

When you finish, run `bash test_lab.sh` (from your laptop, not inside the lab shell). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Unquoted names and variables.** `rm summer sale.txt`, `cp $FILE /backup`. **Fix:** quote: `"summer sale.txt"`, `"$FILE"`.
2. **Spaces around `=`.** `SALE = diwali` → `SALE: command not found`. **Fix:** `SALE=diwali`.
3. **`;` between steps that depend on each other.** The next step runs even after a failure. **Fix:** `&&`, or `set -e` in scripts.
4. **A glob in the wrong folder.** `rm *.log` deletes whatever matches **here**. **Fix:** `pwd` first; `echo` the glob first;
   or use a full path: `rm /srv/bazaar/logs/*.log`.
5. **An empty or misspelled variable in a path.** `rm -rf "$DIR/"` with an empty `DIR`. **Fix:** `set -u`, and check
   `[ -n "$DIR" ]` before destructive commands.
6. **`./script.sh: Permission denied`.** The file isn't executable. **Fix:** `chmod +x script.sh`, or run `bash script.sh`.
7. **Single quotes around a variable.** `echo '$SALE'` prints `$SALE`. **Fix:** double quotes when you want the value.

## 8. Quiz

<div class="bz-quiz" data-quiz="m02-01"></div>

## 9. What's next

Next: [Working with files](02-working-with-files.md). You will move around the server's files and folders, view logs, and find files.

**In one line:** before any program runs, the shell splits your line into words, expands variables and globs, finds the command,
runs it, and saves its exit code, so quote your names, check with `echo`, and chain with `&&`.

### Cheat sheet

| Task | Command |
| --- | --- |
| Where am I / who am I / which machine | `pwd` / `whoami` / `hostname` |
| What kind of command is it? | `type name` |
| Help | `name --help`, `man name`, `help builtin` |
| Last exit code | `echo $?` |
| Run b only if a worked / failed | `a && b` / <code>a &#124;&#124; b</code> |
| See what a glob matches | `echo logs/*.log` |
| Variable with a default | `"${NAME:-default}"` |
| Output of a command, inline | `"$(command)"` |
| Make a script executable | `chmod +x script.sh` |
| Safe script header | `#!/usr/bin/env bash` + `set -euo pipefail` |

| Key | Does |
| --- | --- |
| `Tab` | complete |
| `↑` / `Ctrl+R` | history / search history |
| `Ctrl+C` | stop the running command |
| `Ctrl+A` / `Ctrl+E` / `Ctrl+U` | start / end of line / delete to start |

> **Next in Bazaar:** the logs are in `/srv/bazaar/logs`, the config in `/etc`, the data in `/var/lib`. Time to move around
> the server's files like you own the place.

<div class="bz-complete" data-lesson="m02-01"></div>
