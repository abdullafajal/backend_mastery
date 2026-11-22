# Environment variables, packages and background jobs

<div class="bz-meta" markdown>
**Module** 2 · Linux and the command line
**Lesson** 5
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar settings that come from the environment instead of the code, install a missing tool, and run a slow job in the background
</div>

!!! abstract "In 1 minute"
    - An **environment variable** is a named setting, like `DB_PASSWORD=...`, that programs can read. Bazaar's secrets go there, **not in the code**.
    - `export NAME=value` makes a setting visible to every program you start from that shell. Without `export`, only the shell sees it.
    - `apt-get update` then `apt-get install -y name` installs software on Debian/Ubuntu servers.
    - Put `&` at the end of a command to run it **in the background**, so you can keep working. `jobs` lists them, `kill %1` stops one.
    - In the lab, you start Bazaar's settings script the right way, install a JSON tool, and run a slow import in the background.

> **Previously in Bazaar:** you joined small commands with `|` and answered 20 questions about Bazaar's busiest day.

## 1. Why learn this?

Three problems land on Bazaar's team in one week:

1. A developer wrote `DB_PASSWORD = "Sh@rma2026"` **in the code**, and pushed it to GitHub. Now everyone with access to the code knows the database password.
2. The server needs a tool to read JSON files (`jq`), and it isn't installed: `jq: command not found`.
3. A product import takes 20 minutes. While it runs, the terminal is blocked, and nobody can do anything else.

Each has a simple, standard fix. This lesson shows all three.

## 2. The concept

### Environment variables: settings from outside the code

An **environment variable** is a named setting that the operating system hands to every program it starts.
You've already met two: `HOME` (your home folder) and `PATH` (where to look for programs, Module 0).

See them all with `env`, or one with `echo`:

```
$ echo "$HOME"
/root
$ env | grep -E "^(HOME|HOSTNAME)="
HOSTNAME=bazaar-server
HOME=/root
```

Why put Bazaar's settings here instead of in the code?

- **Secrets stay out of the code** (and out of Git). The code just says "read `DB_PASSWORD` from the environment".
- **The same code runs everywhere.** On your laptop, `DB_HOST=localhost`; on the real server, `DB_HOST=db.bazaar.internal`. No code change.

In Python, a program reads them with `os.environ`:

```python
DB_PASSWORD = os.environ.get("DB_PASSWORD")      # None if it isn't set
```

### Setting one: `export`

Here is the one rule that trips everyone up:

- `DB_PASSWORD=secret123` creates a **shell variable**. Only the shell itself sees it (Lesson 1).
- `export DB_PASSWORD` (or `export DB_PASSWORD=secret123`) puts it in the **environment**, so programs you start from this shell get it too.

```
$ DB_PASSWORD=secret123
$ python3 settings.py
ERROR: DB_PASSWORD is not set. Put it in the environment, never in the code.
$ export DB_PASSWORD
$ python3 settings.py
DB_HOST     = localhost
DEBUG       = False
DB_PASSWORD = se*******
```

There's also a shortcut for **one command only**: put the setting in front of it, on the same line.

```
$ DB_PASSWORD=secret123 DEBUG=true python3 settings.py
```

The setting reaches that one program, and the shell forgets it right after.

### Settings in a file: `.env`

Typing settings by hand gets old. Projects keep them in a file, often called `.env`, one per line:

```
DB_PASSWORD=lab-only-password
DEBUG=true
```

Docker Compose can load such a file for a service with `env_file:`, and set single values with `environment:`:

```yaml
services:
  app:
    environment:
      DB_HOST: db.bazaar.internal
    env_file:
      - app/bazaar.env
```

The `.env` file with **real** secrets must never go into Git. (Lesson 3 showed how to keep it readable only by the right group.)

### Installing software: `apt`

On Debian and Ubuntu servers, software comes in **packages** from an online catalogue, installed with **apt** (a **package manager**):

```bash
apt-get update               # 1. download the latest list of available packages
apt-get install -y jq        # 2. install jq (-y = "yes, don't ask me")
```

Always run `update` first. Without it, apt doesn't know what exists, and says `E: Unable to locate package jq`.
On a real server, you'll put `sudo` in front (Lesson 3). In the lab you're already root.

Two other package managers you'll meet: `pip` installs **Python** libraries (Module 5), and Docker images often install their tools with
`apt-get` in a `RUN` line (you saw it in this module's lab Dockerfiles).

### Background jobs: `&`

Normally the shell waits for a command to finish before you can type the next one. Add `&` at the end, and it runs **in the background**:

```
$ python3 import_products.py > /tmp/import.log 2>&1 &
[1] 8
$ jobs
[1]+  Running                 python3 import_products.py > /tmp/import.log 2>&1 &
```

`[1]` is the **job number**, `8` is the process ID (Module 1). You get your prompt back at once.
Redirect the job's output to a file (Lesson 4), or it will print over whatever you're typing.

| Command | Does |
| --- | --- |
| `jobs` | list the background jobs of this shell |
| `kill %1` | stop job 1 |
| `wait` | wait until all background jobs have finished |
| `tail -f /tmp/import.log` | watch the job's progress (Lesson 2) |

One warning: jobs started with `&` belong to your terminal session. If you log out, they can be stopped too.
For jobs that must keep running, see the Going-deeper box on `nohup`, and Lesson 7 (services).

### Questions you may have

**Are environment variables secure?**
Better than code, because they don't end up in Git. But any program running as the same user can read them, and they can show up in
error reports. Lesson 3's permissions, and later a secrets manager (Module 23), add more protection.

**Why does `DEBUG=true` need `.lower() == "true"` in Python?**
Environment values are always **text**. The text `"false"` is not empty, so Python would treat it as true. Compare the text.

**What's the difference between `apt` and `apt-get`?**
Same tool family. `apt` is nicer for people typing; `apt-get` has a stable output that's better for scripts and Dockerfiles.

**Do I have to `export` again after closing the terminal?**
Yes: a new terminal starts with a fresh environment. For permanent settings, see the Going-deeper box on `~/.bashrc`.

## 3. See it in action

Pick how you set `DB_PASSWORD`, then press **Play**.

<div class="bz-diagram" data-diagram="env-inherit"></div>

## 4. Code example

Bazaar's settings script reads everything from the environment, with defaults for harmless settings, and **no** default for the secret:

```python title="settings.py"
--8<-- "labs/02-linux-command-line/05-env-packages-jobs/app/settings.py"
```

Line by line:

- `os.environ.get("DB_HOST", "localhost")`: read `DB_HOST`; if it's not set, use `"localhost"`.
- `== "true"`: environment values are text, so compare them as text.
- No default for `DB_PASSWORD`: if it's missing, the program **stops** with a clear message, instead of starting with a wrong password.
- It prints only the first 2 characters of the secret. Never print or log a whole secret.

Started by Docker Compose, with `environment:` and `env_file:`:

```
$ docker compose run --rm app
DB_HOST     = db.bazaar.internal
DEBUG       = True
DB_PASSWORD = la***************
```

## 5. Under the hood

### Installing a missing tool

```
$ jq --version
bash: jq: command not found
$ apt-get install -y jq
E: Unable to locate package jq
$ apt-get update && apt-get install -y jq
...
$ jq --version
jq-1.7
$ echo '{"name": "Masala Box", "price": 299}' | jq .price
299
```

### A background job, stopped halfway

```
$ python3 import_products.py > /tmp/import.log 2>&1 &
started, PID 8
$ cat /tmp/import.log
imported seller 1/10
imported seller 2/10
imported seller 3/10
$ kill %1
[1]+  Terminated              python3 import_products.py > /tmp/import.log 2>&1
```

The import was stopped after seller 3; it never printed `import finished`. With `wait` instead of `kill`, the shell waits, and the log ends with `import finished`.

??? note "Going deeper: how programs inherit the environment"
    When the shell starts a program, it creates a new process (Module 1, Lesson 2), and that process gets a **copy** of the shell's
    environment. Two consequences:

    - A program can change its own copy, but that never changes the shell's. That's why a script that runs `export X=1` doesn't change
      your terminal. To change the current shell from a file, you `source` it: `source bazaar.env` (or `. bazaar.env`) runs the file's
      lines **inside** the current shell.
    - `set -a; source bazaar.env; set +a` exports every variable the file sets (`-a` = "export all"). That's a quick way to load a `.env`
      file by hand:

    ```
    $ set -a; source bazaar.env; set +a
    $ python3 settings.py
    DB_HOST     = localhost
    DEBUG       = True
    DB_PASSWORD = la***************
    ```

??? note "Going deeper: making settings permanent with ~/.bashrc"
    Every new interactive bash runs `~/.bashrc` (your home folder's `.bashrc` file). Put `export EDITOR=nano` or `alias ll='ls -lah'` there,
    and every new terminal has it. Login shells (like an SSH login) also read `~/.profile` (or `~/.bash_profile`). After editing,
    `source ~/.bashrc` applies it to the current terminal. **Don't** put real secrets in `.bashrc`: they'd be visible in every program you start.

??? note "Going deeper: more about apt"
    | Command | Does |
    | --- | --- |
    | `apt-get update` | refresh the package list (do this first) |
    | `apt-get install -y pkg` | install a package and what it needs |
    | `apt-get upgrade` | update all installed packages to newer versions |
    | `apt-get remove pkg` | uninstall |
    | `apt-cache search json` | search the catalogue |
    | `dpkg -l jq` | is it installed, and which version? |

    `dpkg -l jq` in the lab shows `ii  jq  1.7.1-6+deb13u4 arm64  lightweight and flexible command-line JSON processor`:
    `ii` = installed, then the exact version and the CPU type. Other Linux families use other managers: `dnf` (Fedora), `apk` (Alpine).

??? note "Going deeper: Ctrl+Z, bg, fg, and nohup"
    - `Ctrl+Z` **pauses** the command running in front of you. `bg` lets it continue in the background; `fg` brings it back to the front.
    - When you close a terminal, the shell sends its jobs a "hang up" signal (SIGHUP, Module 1). `nohup command > file.log 2>&1 &`
      makes the command ignore it, so it keeps running after you log out. Always give it an output file yourself.
    - For anything that must run for days and restart after a crash or reboot, use a **service** instead (Lesson 7, `systemd`).

## 6. Lab

**Lab folder:** `labs/02-linux-command-line/05-env-packages-jobs/`

```bash
cd labs/02-linux-command-line/05-env-packages-jobs
docker compose run --rm shell
```

You'll look at the environment, start `settings.py` without and with `DB_PASSWORD` (plain, exported, and for one command), start it through
Docker Compose with `environment:` and `env_file:`, install `jq` with apt, and run, watch, stop and wait for a background import.

When you finish, run `bash test_lab.sh` (from your laptop). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Secrets in the code.** They end up in Git, forever. **Fix:** read them from environment variables; keep `.env` files out of Git.
2. **Forgetting `export`.** The shell has the value; your program doesn't. **Fix:** `export NAME=value`, or `NAME=value command`.
3. **Spaces around `=`.** `export DB_HOST = x` fails (Lesson 1). **Fix:** `export DB_HOST=x`.
4. **`apt-get install` without `apt-get update`.** `E: Unable to locate package`. **Fix:** update first.
5. **A background job without an output file.** Its output is mixed into your typing. **Fix:** `command > job.log 2>&1 &`.
6. **Expecting `&` jobs to survive logout.** They can be stopped when you leave. **Fix:** `nohup`, or better, a service (Lesson 7).

## 8. Quiz

<div class="bz-quiz" data-quiz="m02-05"></div>

## 9. What's next

Next: [SSH](06-ssh.md). You'll connect to a server far away, safely, with keys instead of passwords.

**In one line:** settings and secrets come from environment variables (`export`, `.env`, Compose `environment:`), software comes from apt
(`update` first), and `&` runs slow jobs in the background while you keep working.

### Cheat sheet

| Task | Command |
| --- | --- |
| Show all environment variables / one | `env` / `echo "$HOME"` |
| Set for programs started from here | `export NAME=value` |
| Set for one command only | `NAME=value command` |
| Read one in Python | `os.environ.get("NAME", "default")` |
| Load a `.env` file into this shell | `set -a; source .env; set +a` |
| Compose: pass settings | `environment:` / `env_file:` |
| Install a package | `apt-get update && apt-get install -y name` |
| Is it installed? | `which name`, `dpkg -l name` |
| Run in the background | `command > job.log 2>&1 &` |
| List / stop / wait for jobs | `jobs` / `kill %1` / `wait` |
| Keep running after logout | `nohup command > job.log 2>&1 &` |

> **Next in Bazaar:** Bazaar's server lives in a data centre. You need to log in to it from your laptop, safely. That's what SSH is for.

<div class="bz-complete" data-lesson="m02-05"></div>
