# Lab 02-04: Pipes, redirection, and the Linux playground

**Goal:** save output and errors to files, then answer 20 questions about Bazaar's Diwali access log, each with one line of
small commands joined by `|`.

**Time:** about 45 minutes.

**You need:** Docker running.

## How this lab works

```bash
docker compose up -d
docker compose exec server bash
```

You land in `/srv/bazaar`. The file `logs/access.log` has 2,000 requests. It's generated with a fixed random seed,
so **every student gets exactly the same file and the same answers**. One line looks like this:

```
2026-11-21T09:09:41 POST /checkout 500 2941ms customer=sara product=masala_box qty=1 amount=0
```

Columns: `$1` time · `$2` method · `$3` path · `$4` status · `$5` milliseconds · `$6` customer · then, for checkouts,
`$7` product, `$8` qty, `$9` amount.

## Part A: Redirection

### Task A1: `>` replaces, `>>` adds

```bash
echo first > note.txt; echo second > note.txt; cat note.txt
echo first > note.txt; echo second >> note.txt; cat note.txt
```

**Expected output:**

```
second
first
second
```

### Task A2: two outputs

```bash
ls logs /nope > out.txt
cat out.txt
ls logs /nope > out.txt 2> err.txt
cat err.txt
ls /nope 2> /dev/null; echo $?
```

**Expected output:**

```
ls: cannot access '/nope': No such file or directory
logs:
access.log
ls: cannot access '/nope': No such file or directory
2
```

The first error appears on screen (only stdout went to `out.txt`). In the second command, the error went into `err.txt`.
The last command threw the error away; only the exit code `2` is left.

### Task A3 (optional, Going deeper): the order of `2>&1`

```bash
ls logs /nope > all.txt 2>&1; cat all.txt
ls logs /nope 2>&1 > wrong.txt; cat wrong.txt
```

In the first, both outputs are in `all.txt`. In the second, the error still appears on the screen. The lesson's box explains why.

## Part B: The Linux playground (20 tasks)

Try each task yourself first. Build pipelines **one step at a time**, and add `| head` while you build, so the screen doesn't flood.
The expected answer is below each task. Stuck? `bash /srv/playground/solutions.sh 9` shows one solution for task 9.

| # | Question | Expected answer |
| --- | --- | --- |
| 1 | How many requests are in the log? | `2000` |
| 2 | Show the first 3 lines. | the 3 lines starting `2026-11-21T09:00:25`, `09:01:54`, `09:02:47` |
| 3 | How many requests failed with status 500? | `137` |
| 4 | Save all the 500 lines into `errors.txt`, then count the lines in it. | `137` |
| 5 | **Add** the 404 lines to the same `errors.txt`, and count again. | `214` |
| 6 | How many requests per status code, most common first? | `1786 200`, `137 500`, `77 404` |
| 7 | The 2 most requested paths? | `1037 /products`, `327 /cart` |
| 8 | How many checkouts were there (successful or not)? | `318` |
| 9 | Which customer had the most failed checkouts? | `7 customer=asha` |
| 10 | Total revenue of successful checkouts (sum of `amount=`)? | `428291` |
| 11 | Revenue per product, biggest first? | `169387 wireless_earbuds`, `121878 red_running_shoes`, `64251 cotton_kurta`, `38390 steel_water_bottle`, `34385 masala_box` |
| 12 | How many requests in each hour? (Hint: characters 12–13 are the hour: `cut -c 12-13`) | 10 hours; they add up to 2000 |
| 13 | The busiest hour? | `393 20` (8 p.m.) |
| 14 | The slowest request (the whole line)? | `2026-11-21T20:38:08 POST /checkout 500 2988ms customer=asha …` |
| 15 | The average time of the 200 (OK) requests, in ms, one decimal? | `207.2` |
| 16 | How many different customers? | `8` |
| 17 | How many lines are **not** 200? | `214` |
| 18 | All customer names, without `customer=`, on one line, sorted? | `arjun asha fatima john meera priya ravi sara` |
| 19 | How many lines mention "shoes", in any upper/lower case? | `388` |
| 20 | Save the 500 lines into `errors_500.txt` **and** count them, in one pipeline (`tee`). | `137` |

Tasks 10, 11, 14 and 15 use `awk` and `sort` options from the lesson's Going-deeper boxes. Try them after the others.

## Check your work

From your laptop:

```bash
bash test_lab.sh
```

**Expected output:**

```
PASS: access.log has 2000 lines (same data for everyone)
PASS: > replaces, >> appends
PASS: stdout and stderr go to different files
PASS: > file 2>&1 catches both; 2>&1 > file does not
PASS: uniq -c needs sort first (400 groups unsorted, 3 sorted)
PASS: pipefail makes a failed pipe fail
PASS: playground: all 20 reference solutions match independent answers
PASS: the lesson's five answers: 2000, 27, asha (7), 428291, 20:00
ALL CHECKS PASSED
```

## Stuck?

- **The screen floods with thousands of lines**: press `Ctrl+C`, and add `| head` at the end while you build.
- **`uniq -c` shows many small counts for the same value**: you forgot `sort` before it.
- **A sum or average looks wrong**: print the column first (`awk '{print $5}' | head`) and check it holds what you think.

## Clean up

```bash
docker compose down
```
