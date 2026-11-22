# Pipes and redirection

<div class="bz-meta" markdown>
**Module** 2 · Linux and the command line
**Lesson** 4
**Reading time** 15 min (+ optional deeper parts)
**You will build** one-line answers to real questions about Bazaar's Diwali traffic, then solve 20 playground tasks on its access log
</div>

!!! abstract "In 1 minute"
    - A command prints its results to **stdout** (normal output) and its errors to **stderr**.
    - `>` saves the output to a file (replacing it). `>>` adds to the end of the file.
    - `|` (a **pipe**) sends one command's output straight into the next command.
    - Small tools joined with `|` answer big questions: `grep` (keep lines), `awk` (pick a column), `sort`, `uniq -c` (count), `head`.
    - In the lab, you answer 20 questions about Bazaar's busiest day, each in one line.

> **Previously in Bazaar:** you learned who may read, change and run each file, and locked down Bazaar's password file.

## 1. Why learn this?

The Diwali sale is over. The boss asks five questions:

1. How many requests did Bazaar get today?
2. How many checkouts failed?
3. **Which customer had the most failed checkouts?**
4. How much money did we make?
5. What was the busiest hour?

The answers are all in one file, `access.log`, with 2,000 lines. You could open it and count by hand for hours.
Or you can answer each question with **one line** in the terminal, in a second. This lesson shows you how.

## 2. The concept

### Bazaar's access log

Every request to Bazaar writes one line to `logs/access.log`:

```
2026-11-21T09:09:41 POST /checkout 500 2941ms customer=sara product=masala_box qty=1 amount=0
```

The parts are separated by spaces. Counting from the left, they are **columns** 1, 2, 3...:

| Column | Example | Meaning |
| --- | --- | --- |
| 1 | `2026-11-21T09:09:41` | when |
| 2, 3 | `POST /checkout` | what was asked |
| 4 | `500` | the status code (200 = OK, 500 = failed) |
| 5 | `2941ms` | how long it took |
| 6 | `customer=sara` | who |

### Two outputs: stdout and stderr

Every command has **two outputs**, both shown on your screen by default:

- **stdout** ("standard output"): the normal results.
- **stderr** ("standard error"): the error messages.

They look the same on screen, but they are separate, and you can send them to different places.

### Redirection: saving output to a file

| You type | What happens |
| --- | --- |
| `command > file.txt` | the output goes into `file.txt` instead of the screen. **Replaces** the file |
| `command >> file.txt` | the output is **added** to the end of `file.txt` |
| `command 2> errors.txt` | only the **error messages** go into `errors.txt` |
| `command 2> /dev/null` | the error messages are thrown away (`/dev/null` is a "black hole") |

Careful with `>`: like `mv` in Lesson 2, it replaces the file without asking.

```
$ echo first > note.txt
$ echo second > note.txt
$ cat note.txt
second
```

With `>>` instead, the file keeps both lines.

### Pipes: one command's output into the next

The `|` symbol (the **pipe**, usually above the `Enter` key) connects two commands:

```bash
grep 'checkout 500' logs/access.log | wc -l
```

`grep` finds the failed checkouts, and instead of printing them, `|` hands them to `wc -l`, which counts them.
You see only the final answer.

Think of it as an assembly line in Bazaar's warehouse: one worker picks the right boxes, passes them to the next,
who sorts them, who passes them to the next, who counts them. Each worker does **one** simple job.

### The toolbox

Five tools do most of the work:

| Tool | Job | Example |
| --- | --- | --- |
| `grep 'text'` | keep only lines containing the text | `grep 'checkout 500'` |
| `awk '{print $6}'` | keep only one column (here, column 6) | the customer |
| `sort` | put lines in order | equal lines end up together |
| `uniq -c` | count equal lines that are **next to each other** | `7 customer=asha` |
| `head -n 3` | keep only the first 3 lines | the top 3 |

Plus `wc -l` to count lines, and `sort -rn` to sort by number, **biggest first**.

### Building a pipeline, one step at a time

Question 3: which customer had the most failed checkouts? Build the answer one step at a time,
and look at the output after each step (in the lab, add `| head` while you're building, so the screen doesn't flood).

**Step 1:** keep only the failed checkouts.

```
$ grep 'POST /checkout 500' logs/access.log
2026-11-21T09:09:41 POST /checkout 500 2941ms customer=sara product=masala_box qty=1 amount=0
2026-11-21T09:55:43 POST /checkout 500 2247ms customer=meera product=red_running_shoes qty=3 amount=0
...
```

**Step 2:** keep only the customer (column 6).

```
$ grep 'POST /checkout 500' logs/access.log | awk '{print $6}'
customer=sara
customer=meera
customer=asha
...
```

**Step 3:** sort them, so equal names sit together, and count each name.

```
$ grep 'POST /checkout 500' logs/access.log | awk '{print $6}' | sort | uniq -c
      1 customer=arjun
      7 customer=asha
      2 customer=john
      5 customer=meera
      2 customer=priya
      5 customer=ravi
      5 customer=sara
```

**Step 4:** biggest first, top 3.

```
$ grep 'POST /checkout 500' logs/access.log | awk '{print $6}' | sort | uniq -c | sort -rn | head -n 3
      7 customer=asha
      5 customer=sara
      5 customer=ravi
```

The answer: **Asha**, with 7 failed checkouts. Bazaar's support team should call her.

That's the whole method: start small, look at the output, add one more `|` step, look again.

### Why `sort` must come before `uniq -c`

`uniq -c` only merges lines that are **next to each other**. Without `sort`, it counts little runs, not totals:

```
$ awk '{print $4}' logs/access.log | uniq -c | head -n 4
      7 200
      1 500
      8 200
      1 500
```

That's "7 OKs in a row, then 1 failure, then 8 OKs..." Not what we wanted. With `sort` first, all the 200s are together,
and `uniq -c` gives real totals.

### Questions you may have

**Where is the `|` key?**
On most keyboards it's above `Enter`, with `\`. Press it with `Shift`.

**Why not just write a Python script?**
For a quick question, one line in the terminal is faster to write than a script. When the logic gets complicated, switch to Python.

**Does the pipe make a temporary file?**
No. The data flows directly from one command to the next, in memory.

**My pipeline printed nothing. Why?**
Usually an early step matched nothing. Remove steps from the end until you see output again; that shows you which step went wrong.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="pipe-flow"></div>

## 4. Code example

Here are the boss's five questions, each answered with one line, with the real answers from the lab:

```bash
# 1. How many requests today?
wc -l < logs/access.log                                              # 2000

# 2. How many checkouts failed?
grep -c 'POST /checkout 500' logs/access.log                         # 27

# 3. Which customer had the most failed checkouts?
grep 'POST /checkout 500' logs/access.log | awk '{print $6}' | sort | uniq -c | sort -rn | head -n 1
                                                                     #  7 customer=asha
# 4. How much money did we make? (amount= from successful checkouts)
grep 'POST /checkout 200' logs/access.log | awk -F'amount=' '{s += $2} END {print s}'
                                                                     # 428291
# 5. What was the busiest hour? (characters 12-13 of each line are the hour)
cut -c 12-13 logs/access.log | sort | uniq -c | sort -rn | head -n 1 #  393 20
```

So: 2,000 requests, 27 failed checkouts, Asha was hit most often, ₹4,28,291 in sales, and 8 p.m. was the rush hour.

`wc -l < file` uses `<`, the opposite of `>`: it feeds the file **into** the command. Question 4's `awk` adds up numbers;
the Going-deeper box below explains it.

## 5. Under the hood

### Where the two outputs go

```
$ ls logs /nope > out.txt
ls: cannot access '/nope': No such file or directory
$ cat out.txt
logs:
access.log
```

The list went into the file. The error still appeared on the screen, because `>` only redirects stdout.

```
$ ls logs /nope > out.txt 2> err.txt
$ cat err.txt
ls: cannot access '/nope': No such file or directory
```

Now each output has its own file, and the screen stays clean.

??? note "Going deeper: 2>&1, and why the order matters"
    `2>&1` means "send stream 2 (stderr) to wherever stream 1 (stdout) is going **right now**".
    So the order of the redirections matters:

    ```
    $ ls logs /nope > all.txt 2>&1        # stdout → file, then stderr → (the file)
    $ cat all.txt
    ls: cannot access '/nope': No such file or directory
    logs:
    access.log
    $ ls logs /nope 2>&1 > wrong.txt      # stderr → (the screen, where stdout is now), then stdout → file
    ls: cannot access '/nope': No such file or directory
    $ cat wrong.txt
    logs:
    access.log
    ```

    In the second line, `2>&1` copied stdout's destination **before** stdout was moved to the file, so stderr stayed on the screen.
    The usual form is `> file 2>&1`. Bash also has a shortcut for "both into one file": `&> file`.

??? note "Going deeper: awk beyond one column"
    `awk` is a small programming language for columns of text.

    - `awk '{print $6}'`: print column 6. `$0` is the whole line, `NF` the number of columns, `$NF` the last one.
    - `awk -F'amount=' '{print $2}'`: split at `amount=` instead of at spaces, so `$2` is the number after it.
    - `awk '{s += $5} END {print s}'`: add column 5 of every line into `s`, and print `s` once at the END.
    - `awk '$4 == 500 {print $6}'`: only lines where column 4 is 500.
    - Arrays: `awk '{n[$6]++} END {for (c in n) print n[c], c}'` counts each customer in one step, without `sort | uniq -c`.

    Bazaar's revenue per product (task 11 in the lab) uses `split()` to pull the number out of `amount=1298`.

??? note "Going deeper: more tools — cut, tr, sed, tee, xargs"
    | Tool | Job | Example |
    | --- | --- | --- |
    | `cut -c 12-13` | keep characters 12 to 13 | the hour from a timestamp |
    | `cut -d= -f2` | split at `=`, keep part 2 | `customer=asha` → `asha` |
    | `tr '\n' ' '` | replace characters (here: newlines with spaces) | join lines into one |
    | `sed 's/customer=//'` | search and replace in every line | remove the `customer=` prefix |
    | `tee file` | save a copy to a file **and** pass the data on | `grep 500 log \| tee errors.txt \| wc -l` |
    | `xargs cmd` | turn input lines into **arguments** of `cmd` | `find . -name "*.tmp" \| xargs rm` |

??? note "Going deeper: how pipes really work"
    When you run `a | b`, the shell starts **both** programs at the same time, as two processes (Module 1, Lesson 2). The kernel connects
    `a`'s stdout to `b`'s stdin (standard **input**, stream 0) through a small buffer in memory (a few tens of KB on Linux). `a` writes into it,
    `b` reads from it. If `b` is slower and the buffer fills up, the kernel pauses `a` until there's room. That's why pipelines can process
    files much bigger than your RAM: the data streams through, a little at a time.

    And when `head -n 3` has its 3 lines, it simply exits. The next write by the command before it fails, and that command stops too. So
    `sort -rn | head -3` doesn't waste time printing millions of lines nobody will read.

??? note "Going deeper: exit codes of a pipeline, and pipefail"
    A pipeline's exit code is the exit code of its **last** command. So a failure early in the pipe is hidden:

    ```
    $ false | wc -l; echo $?
    0
    0
    $ set -o pipefail; false | wc -l; echo $?
    0
    1
    ```

    With `pipefail`, the pipeline fails if **any** command in it failed. That's the `-o pipefail` in every `test_lab.sh`'s
    `set -euo pipefail` (Lesson 1).

## 6. Lab

**Lab folder:** `labs/02-linux-command-line/04-pipes-and-redirection/`

```bash
cd labs/02-linux-command-line/04-pipes-and-redirection
docker compose up -d
docker compose exec server bash
```

You land in `/srv/bazaar`, with `logs/access.log`: 2,000 requests from Bazaar's Diwali day (the same file for every student).
First you'll try redirection (`>`, `>>`, `2>`), then the **Linux playground**: 20 small questions about the log, from "how many lines?"
to "revenue per product". Each task has its answer in the README, so you can check yourself. If you're stuck,
`bash /srv/playground/solutions.sh <number>` shows one possible solution.

When you finish, run `bash test_lab.sh` (from your laptop). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`>` instead of `>>`.** The file is replaced, not added to. **Fix:** `>>` to add.
2. **`uniq -c` without `sort` first.** You get small runs instead of totals. **Fix:** `sort | uniq -c`.
3. **Sorting numbers as text.** `printf "9\n10\n" | sort -r` puts `9` before `10`, because as text "9" > "1". **Fix:** `sort -rn` (`-n` = as numbers, `-r` = biggest first).
4. **Building a long pipeline in one go.** When it's wrong, you can't see where. **Fix:** add one `|` step at a time, and look at the output.
5. **Expecting `>` to also catch errors.** It only redirects stdout. **Fix:** `2>` for errors, or `> file 2>&1` for both.

## 8. Quiz

<div class="bz-quiz" data-quiz="m02-04"></div>

## 9. What's next

Next: [Environment variables, packages and background jobs](05-env-packages-jobs.md). Settings every program can read, installing software, and running commands in the background.

**In one line:** `>` and `>>` save output to files, `2>` saves the errors, and `|` joins small tools (`grep`, `awk`, `sort`, `uniq -c`, `head`)
into one-line answers, built one step at a time.

### Cheat sheet

| Task | Command |
| --- | --- |
| Save output / add to a file | `cmd > f` / `cmd >> f` |
| Save errors / hide errors | `cmd 2> f` / `cmd 2> /dev/null` |
| Output and errors into one file | `cmd > f 2>&1` |
| Feed a file into a command | `cmd < f` |
| Count lines | `wc -l` |
| Lines containing text / not containing / count them | `grep 'x'` / `grep -v 'x'` / `grep -c 'x'` |
| Ignore upper/lower case | `grep -i 'x'` |
| Column 6 | `awk '{print $6}'` |
| Count each value | `sort \| uniq -c \| sort -rn` |
| Top 5 | `... \| head -n 5` |
| Sum a column | `awk '{s += $5} END {print s}'` |
| Save and pass on | `... \| tee f \| ...` |

> **Next in Bazaar:** the database password must reach Bazaar's code without being written in the code. Programs read their
> settings from **environment variables**. Let's see how.

<div class="bz-complete" data-lesson="m02-04"></div>
