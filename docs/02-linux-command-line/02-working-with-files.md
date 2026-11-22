# Working with files

<div class="bz-meta" markdown>
**Module** 2 · Linux and the command line
**Lesson** 2
**Reading time** 15 min (+ optional deeper parts)
**You will build** everyday habits on a Bazaar server: move around, copy safely, read live logs, and find what fills the disk
</div>

!!! abstract "In 1 minute"
    - `cd` moves you around. `ls -la` shows what's in a folder, including hidden files.
    - `cp` copies, `mv` moves or renames, `rm` deletes. **`cp` and `mv` replace files without asking**, and **`rm` has no undo**.
    - Before you edit an important file, make a copy: `cp bazaar.conf bazaar.conf.bak`.
    - `tail -f` shows a log **live**, line by line, as the server writes it.
    - `du -sh * | sort -h` tells you what is filling the disk.

> **Previously in Bazaar:** you learned what the shell does with your line: words, quotes, globs and exit codes.

## 1. Why learn this?

It's the Diwali sale. Bazaar's server has no screen and no file explorer: only a terminal. Tonight you must:

1. watch new orders arrive **live** in the log;
2. find out what is **filling the disk**;
3. change one setting in `bazaar.conf` **without losing the old version**.

A handful of commands do all of this. This lesson teaches them, and the one trap that catches everyone:
`mv draft.conf bazaar.conf` replaced the real config **without asking**.

## 2. The concept

### Moving around

Three commands you'll use all day:

| Command | What it does |
| --- | --- |
| `pwd` | prints where you are ("print working directory") |
| `cd logs` | goes into the folder `logs` |
| `cd ..` | goes up one folder |

Two handy extras: `cd -` jumps back to where you just were, and `cd` alone takes you to your **home folder**.

### Looking inside a folder

`ls` lists a folder. You'll almost always add some letters to it:

| Command | Shows |
| --- | --- |
| `ls` | just the names |
| `ls -l` | the **long** list: size, date, owner |
| `ls -a` | **all** files, including hidden ones |
| `ls -lah` | all of the above, with sizes like `4.0K` and `12M` instead of bytes |

**Hidden files** are files whose name starts with a dot, like `.env`. Nothing secret about them:
`ls` just skips them unless you add `-a`. On Bazaar's server, `.env` holds the database password,
so it's worth knowing it's there.

### Making folders

`mkdir backups` makes a folder. To make several levels at once, add `-p`:

```bash
mkdir -p backups/2026/11
```

Without `-p`, that fails, because `backups/2026` doesn't exist yet.

### Copy, move, delete

| Command | What it does |
| --- | --- |
| `cp bazaar.conf bazaar.conf.bak` | copy a file |
| `cp -r media media_copy` | copy a folder and everything inside (`-r` = "recursive") |
| `mv draft.conf old.conf` | rename a file (on Linux, renaming and moving are the same command) |
| `mv old.conf backups/` | move a file into a folder |
| `rm old.conf` | delete a file |
| `rm -r backups/2026` | delete a folder and **everything** inside it |

Now the trap. If the destination file already exists, `cp` and `mv` **replace it without asking**:

```
$ echo "NEW" > draft.conf
$ mv draft.conf bazaar.conf
$ cat bazaar.conf
NEW
```

Bazaar's real config is gone. No warning, and no recycle bin to get it back. Two habits protect you:

1. **Copy before you edit**: `cp bazaar.conf bazaar.conf.bak`. Takes one second.
2. **Ask first**: add `-i` (`mv -i`, `cp -i`, `rm -i`), and the command asks before replacing or deleting.

And be extra careful with `rm -r`: run `pwd` first, and `ls` the thing you're about to delete.

### Reading files

| Command | Use it for |
| --- | --- |
| `cat file` | print a small file |
| `less file` | read a big file page by page (`Space` = next page, `/word` = search, `q` = quit) |
| `head -n 5 file` | the first 5 lines |
| `tail -n 5 file` | the last 5 lines: the newest entries in a log |
| `tail -f file` | **follow** the file: show new lines as they're written, until you press `Ctrl+C` |

`tail -f` is the on-call engineer's best friend. Open it on Bazaar's log, try the failing checkout,
and watch the error appear live.

### Finding files and space

When the disk is almost full, you need to know **what** is filling it. This one line answers it:

```bash
du -sh * | sort -h
```

It lists the size of everything in the current folder, smallest first and **biggest last**.
(`du` = "disk usage"; the `|` passes the list to `sort`; Lesson 4 explains `|`.) Then `cd` into the biggest one and repeat.

To find files by name, size or age, use `find`:

```bash
find . -name "*.log"       # every .log file, here and in all folders below
find . -size +3M           # files bigger than 3 MB
find logs -mtime +7        # files last changed more than 7 days ago
```

Always put the name pattern in quotes, like `"*.log"`.

### Editing a file on the server

Servers have no VS Code. The easiest editor is **nano**:

```bash
nano config/bazaar.conf
```

Type normally. The shortcuts are listed at the bottom of the screen (`^` means the `Ctrl` key):
`Ctrl+O` then `Enter` saves, `Ctrl+X` exits.

Some servers only have **vi**. It's tricky the first time, because you can't just start typing. Learn these four, and you'll survive:

| Press | It does |
| --- | --- |
| `i` | start typing |
| `Esc` | stop typing |
| `:wq` then `Enter` | save and quit |
| `:q!` then `Enter` | quit **without** saving (when you've made a mess) |

### An analogy

Bazaar's server is a warehouse with labelled shelves (folders). `cd` walks you to a shelf, `ls` reads the labels,
`cp` makes a photocopy, `mv` moves or relabels a document, `rm` throws it away, and `find` is a helper who walks
every aisle with a checklist. The difference from a real warehouse: nobody asks "are you sure?" before replacing or throwing things away.

### Questions you may have

**Can I get back a file I deleted with `rm`?**
Usually not. There's no recycle bin. That's why backups (and `.bak` copies) exist.

**Why is `less` better than `cat` for logs?**
A log can be gigabytes. `cat` prints all of it at once; `less` shows one screen at a time and lets you search.

**What's the difference between `cp -r` and `cp -a`?**
Both copy folders. `-a` also keeps the original's dates and permissions exactly. Use `-a` for backups.

**Why learn `vi` at all?**
Because one day you'll be on a server where it's the only editor, and you'll need to change one line.

## 3. See it in action

Pick a situation, then press **Play**. In the tour, click any folder to see what it's for.

<div class="bz-diagram" data-diagram="file-tree"></div>

## 4. Code example

A safe way to change Bazaar's config, step by step. You'll do exactly this in the lab:

```bash
cd /srv/bazaar/config
cp bazaar.conf bazaar.conf.bak      # 1. keep the old version
nano bazaar.conf                    # 2. change "sale = none" to "sale = diwali", save, exit
diff bazaar.conf.bak bazaar.conf    # 3. check exactly what changed
```

The output of step 3:

```
3c3
< sale = none
---
> sale = diwali
```

`diff` shows the one changed line: `<` is the old version, `>` is the new one. If something goes wrong,
step 1 saves you: `cp bazaar.conf.bak bazaar.conf` puts the old version back.

## 5. Under the hood

### Real outputs from the lab

Moving around:

```
$ cd logs; pwd
/srv/bazaar/logs
$ cd ..; pwd
/srv/bazaar
$ cd ~; pwd
/root
```

(You're the `root` user in the lab, so your home folder is `/root`.)

Reading a log, and following a live one:

```
$ tail -n 1 logs/order_20261121.log
2026-11-21 10:05:00 order=215 status=paid total=1495
$ tail -f logs/live.log
2026-11-21 11:19:56 request=6 path=/products status=200
2026-11-21 11:19:58 request=7 path=/products status=200
2026-11-21 11:20:00 request=8 path=/products status=200
```

With `-f`, a new line appeared every 2 seconds, as the backend wrote it.

What fills the disk:

```
$ du -sh * | sort -h
20K	config
48K	logs
984K	backups
12M	media
```

The product photos (`media`) are the biggest folder.

??? note "Going deeper: more `ls` options"
    | Option | Shows |
    | --- | --- |
    | `-t` | newest first (by the time the file was last changed) |
    | `-S` | biggest first |
    | `-r` | reverse the order |
    | `-1` | one name per line (handy in scripts) |

    They combine: `ls -lahtr` = long, all, human sizes, by time, oldest first, so the newest file is at the bottom, right above
    your prompt. `tree -L 2` (when installed) draws the folder and two levels below it.

??? note "Going deeper: what `cp` and `mv` do on the disk"
    Remember from Module 1, Lesson 4: a file is a **name** pointing to a **record card** (an *inode*) pointing to the **data**.

    - `cp` makes a new record card and a full copy of the data. That's why copying a 10 GB file takes time.
    - `mv` within the same disk only changes the **name**. The record card and the data don't move. That's why it's instant.

    You can see it with `ls -i` (it shows the record card's number):

    ```
    $ ls -i bazaar.conf
    121614 bazaar.conf
    $ cp -v bazaar.conf bazaar.conf.bak
    'bazaar.conf' -> 'bazaar.conf.bak'
    $ ls -i
    121614 bazaar.conf
    121741 bazaar.conf.bak            # the copy: a new number
    $ mv -v bazaar.conf.bak bazaar.conf.old
    renamed 'bazaar.conf.bak' -> 'bazaar.conf.old'
    $ ls -i
    121614 bazaar.conf
    121741 bazaar.conf.old            # the move: same number, new name
    ```

    Moving to a **different** disk is really "copy, then delete", which is slow for big files and can leave a half copy if it's interrupted.

??? note "Going deeper: more safety options for `cp`, `mv` and `rm`"
    | Option | Meaning |
    | --- | --- |
    | `-n` | never overwrite: skip instead (`mv -n a b` does nothing if `b` exists) |
    | `-v` | print what it did |
    | `-b` | keep a backup (`file~`) of anything it would overwrite |
    | `-f` | force: never ask, ignore missing files. With `rm -rf`, the most dangerous command on a server |

    `rmdir folder` deletes a folder only if it's **empty**: a safe way to clean up. `rm folder` (without `-r`) refuses:
    `rm: cannot remove 'backups': Is a directory`.

??? note "Going deeper: `find` in detail"
    - `-type f` / `-type d`: only files / only folders. `-iname`: name, ignoring upper/lower case.
    - `-size -10k`: smaller than 10 KB. `-mtime -1`: changed within the last day.
    - `-exec ls -lh {} \;` runs a command for each match (`{}` becomes the path). `-delete` deletes the matches.
      **Always run without `-delete` first**, and read the list.
    - How `-mtime` counts: it drops the part of a day. `+7` means "at least 8 whole days ago". In the lab, on the 21st, the log from the
      13th (7.5 days old, counted as 7) isn't matched; the 12th is.
    - Why the quotes matter: without them, the **shell** expands `*.log` first (Lesson 1). If the current folder has `a.log`, find gets
      `-name a.log` and looks only for that.
    - For thousands of files, `-exec cmd {} +` (with `+`) runs the command once for many files, much faster than `\;`.

??? note "Going deeper: a backup script, and a real bug we hit"
    This script backs up the config with the date and time in the name, and keeps only the 3 newest backups:

    ```bash title="backup_config.sh"
    --8<-- "labs/02-linux-command-line/02-working-with-files/tools/backup_config.sh"
    ```

    Our first version sorted the backups with `ls -t` (by time). It deleted the **newest** backup, not the oldest! The reason:
    `cp -a` copies the original's date, so every backup had exactly the same time, and sorting by time was meaningless.
    Sorting by the timestamp **in the name** fixed it. Test cleanup scripts on throw-away copies before trusting them with real backups.

## 6. Lab

**Lab folder:** `labs/02-linux-command-line/02-working-with-files/`

```bash
cd labs/02-linux-command-line/02-working-with-files
docker compose up -d --build
docker compose exec server bash
```

You land in `/srv/bazaar` on a pretend server that writes a new line to `logs/live.log` every 2 seconds.
You'll move around, find the hidden `.env`, back up and edit `bazaar.conf` with nano (and survive vi), see `mv` replace a file without asking,
read and follow logs, and find the biggest folder. The lab README also has a few optional tasks for the Going-deeper parts.

When you finish, run `bash test_lab.sh` (from your laptop). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`mv` or `cp` onto an existing file.** It's replaced silently. **Fix:** `cp file file.bak` before editing; use `-i`.
2. **`rm -r` in the wrong folder.** **Fix:** `pwd` and `ls` first.
3. **`mkdir a/b/c` says `No such file or directory`.** **Fix:** `mkdir -p a/b/c`.
4. **`cat` on a huge log** floods your screen for minutes. **Fix:** `less` or `tail -n 100`.
5. **Stuck in vi.** **Fix:** `Esc`, then `:q!` and `Enter`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m02-02"></div>

## 9. What's next

Next: [Users and permissions](03-users-and-permissions.md). You'll learn who is allowed to read, change and run each file.

**In one line:** `cd`, `ls -la`, `cp`, `mv`, `rm`, `less`, `tail -f` and `du` cover most daily file work, as long as you remember that
`cp` and `mv` replace files without asking and `rm` has no undo.

### Cheat sheet

| Task | Command |
| --- | --- |
| Where am I? | `pwd` |
| Go into / up / back / home | `cd logs` / `cd ..` / `cd -` / `cd` |
| List everything, readable sizes | `ls -lah` |
| Make nested folders | `mkdir -p a/b/c` |
| Copy a file / a folder | `cp a b` / `cp -r dir dir2` |
| Move or rename (ask first) | `mv -i a b` |
| Delete a file / a folder | `rm f` / `rm -r dir` |
| Back up before editing | `cp file file.bak` |
| Read a big file | `less file` (`q` to quit) |
| Last lines / follow live | `tail -n 20 f` / `tail -f f` |
| What fills this folder? | `du -sh * \| sort -h` |
| Find by name / size / age | `find . -name "*.log"` / `-size +100M` / `-mtime +7` |
| Edit | `nano f` (`Ctrl+O` save, `Ctrl+X` exit) |
| Escape vi | `Esc`, then `:q!` |

> **Next in Bazaar:** the `.env` file holds the database password, and right now **everyone** on the server can read it.
> Time to learn users and permissions.

<div class="bz-complete" data-lesson="m02-02"></div>
