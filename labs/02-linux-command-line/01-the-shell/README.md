# Lab 02-01: The shell, on a Bazaar server

**Goal:** get comfortable on a server's shell: read the prompt, find where commands come from, and see quotes,
globs and variables change what a program receives. Read exit codes, chain commands safely, avoid the empty-variable
trap, and write your first script.

**Time:** about 35 minutes.

**You need:** Docker running.

## How this lab works

```bash
docker compose run --rm shell
```

You get a bash prompt on a pretend Bazaar server:

```
root@bazaar-server:/srv/bazaar#
```

Every session starts with a **fresh copy** of Bazaar's files in `/srv/bazaar`:

| File | What it is |
| --- | --- |
| `logs/order_2026111*.log`, `logs/order_2026112*.log` | three days of order logs |
| `products.json` | two products |
| `summer sale.txt` | a file with a space in its name |
| `notes.txt` | a note |
| `show_args` | prints exactly which arguments it received |
| `safe_cleanup.sh` | a careful cleanup script (dry run by default) |

Type `exit` (or press `Ctrl+D`) to leave. Run all commands below **inside** the lab shell, unless the task says otherwise.

## Task 1: Where am I, who am I, what is this?

```bash
whoami
hostname
pwd
type cd
type ls
ls -l
```

**Expected output** (dates will differ):

```
root
bazaar-server
/srv/bazaar
cd is a shell builtin
ls is /usr/bin/ls
total 24
drwxr-xr-x 2 root root 4096 Nov 21 09:08 logs
-rw-r--r-- 1 root root   29 Nov 21 09:08 notes.txt
-rw-r--r-- 1 root root  102 Nov 21 09:08 products.json
-rwxr-xr-x 1 root root 1071 Nov 21 09:08 safe_cleanup.sh
-rwxr-xr-x 1 root root  180 Nov 21 09:08 show_args
-rw-r--r-- 1 root root   35 Nov 21 09:08 summer sale.txt
```

Try `ls --help | head -4` and `help cd | head -2` too.

## Task 2: What does the program really get?

```bash
./show_args summer sale.txt
./show_args "summer sale.txt"
./show_args logs/*.log
SALE=diwali
./show_args "$SALE sale" '$SALE sale'
```

**Expected output:**

```
2 argument(s):
  [summer]
  [sale.txt]
1 argument(s):
  [summer sale.txt]
3 argument(s):
  [logs/order_20261119.log]
  [logs/order_20261120.log]
  [logs/order_20261121.log]
2 argument(s):
  [diwali sale]
  [$SALE sale]
```

## Task 3: Quotes save files

```bash
rm summer sale.txt
echo $?
rm "summer sale.txt"
echo $?
ls
```

**Expected output:**

```
rm: cannot remove 'summer': No such file or directory
rm: cannot remove 'sale.txt': No such file or directory
1
0
logs  notes.txt  products.json  safe_cleanup.sh  show_args
```

## Task 4: Globs, and what happens when nothing matches

```bash
echo logs/*.log
echo logs/order_2026112?.log
echo logs/*.csv
ls logs/*.csv
echo $?
```

**Expected output:**

```
logs/order_20261119.log logs/order_20261120.log logs/order_20261121.log
logs/order_20261120.log logs/order_20261121.log
logs/*.csv
ls: cannot access 'logs/*.csv': No such file or directory
2
```

## Task 5: Variables and their famous mistake

```bash
SALE = diwali
echo $?
SALE=diwali
echo "sale is $SALE"
echo 'sale is $SALE'
```

**Expected output:**

```
bash: SALE: command not found
127
sale is diwali
sale is $SALE
```

## Task 6: Exit codes and chaining

```bash
grep -q paid logs/order_20261119.log; echo $?
grep -q refund logs/order_20261119.log; echo $?
nosuchcommand; echo $?
cd /nope && echo "deploying..."
cd /nope; echo "deploying anyway..."
cd /nope || echo "could not enter folder, stopping"
```

**Expected output:**

```
0
1
bash: nosuchcommand: command not found
127
bash: cd: /nope: No such file or directory
bash: cd: /nope: No such file or directory
deploying anyway...
bash: cd: /nope: No such file or directory
could not enter folder, stopping
```

`&&` stopped the "deploy". `;` ran it anyway. `||` ran the fallback.

## Task 7: The empty-variable trap (safely, with echo)

```bash
DIR=""
echo rm -rf "$DIR/"
set -u
echo rm -rf "$DIRR/"
```

**Expected output:**

```
rm -rf /
bash: DIRR: unbound variable
```

With an empty variable, the path became `/`. `set -u` stopped the misspelled one. Type `exit` and start a new session after
this task, so `set -u` doesn't surprise you later.

## Task 8: Your first script

```bash
printf '#!/usr/bin/env bash\necho "deploying Bazaar from $(pwd)"\n' > deploy.sh
cat deploy.sh
./deploy.sh
echo $?
chmod +x deploy.sh
./deploy.sh
```

**Expected output:**

```
#!/usr/bin/env bash
echo "deploying Bazaar from $(pwd)"
bash: ./deploy.sh: Permission denied
126
deploying Bazaar from /srv/bazaar
```

Then try the careful cleanup script (it only **prints** what it would delete):

```bash
bash safe_cleanup.sh
```

**Expected output:**

```
cleaning old order logs in /srv/bazaar/logs
would delete: /srv/bazaar/logs/order_20261119.log
would delete: /srv/bazaar/logs/order_20261120.log
would delete: /srv/bazaar/logs/order_20261121.log
3 file(s) would be deleted. Run with --really to delete them.
```

Bonus: `bash safe_cleanup.sh --really`, then `ls logs`. (It's a fresh copy; the next session has the logs back.)

## Task 9: History and keys

In the lab shell: press `↑` a few times, then `Ctrl+R` and type `show` to find your `show_args` commands.
Type `history | tail -5`. Start typing `./show_a` and press `Tab`.

## Check your work

From your **laptop** (not inside the lab shell):

```bash
bash test_lab.sh
```

**Expected output:**

```
PASS: on bazaar-server in /srv/bazaar; cd is a builtin, ls is a program
PASS: unquoted rm: two wrong arguments, exit 1, file still there
PASS: quoted rm: the file is gone
PASS: globs: *.log expands to 3 files; no match stays literal
PASS: variables: double vs single quotes; spaces around = give exit 127
PASS: && stops after a failure, ; doesn't, || runs on failure
PASS: set -u stops at an unset variable
PASS: script: Permission denied (126) until chmod +x
ALL CHECKS PASSED
```

## Stuck?

- **`man: command not found`**: the lab image is kept small and has no manual pages. Use `--help` or `help`.
- **A command stopped working after Task 7**: `set -u` is still on. Type `exit` and start a new session.

## Clean up

Nothing to clean: `--rm` removes the container when you exit. To remove the network too: `docker compose down`.
