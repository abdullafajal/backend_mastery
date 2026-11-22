# Lab 02-02: Working with files on a Bazaar server

**Goal:** move around, copy and move safely, back up and edit a config, read and follow logs, find files,
and find what fills the disk. Tasks marked *optional, Going deeper* match the lesson's Going-deeper boxes; skip them on your first try.

**Time:** about 40 minutes.

**You need:** Docker running.

## How this lab works

```bash
docker compose up -d --build
docker compose exec server bash
```

The first time, Docker builds a small image with `less`, `nano`, `vi` and `tree`. You land in `/srv/bazaar`:

| Path | What it is |
| --- | --- |
| `logs/order_20261112.log` … `order_20261121.log` | 10 days of order logs, with matching dates on disk |
| `logs/live.log` | grows by one line every 2 seconds, like a running backend |
| `config/bazaar.conf` | Bazaar's settings |
| `.env` | a hidden file with a (fake) password |
| `media/products/*.jpg` | three 4 MB product photos |
| `backups/products_2026-10-01.json` | an old backup |
| `/srv/tools/backup_config.sh` | the lesson's backup script |

Type `exit` to leave the shell; the server keeps running. `docker compose down` resets everything; `up -d` gives a fresh copy.

## Task 1: Move around

```bash
pwd
tree -L 2
cd logs; pwd
cd ..; pwd
cd /etc; cd -
cd ~; pwd
cd /srv/bazaar
```

**Expected output** (the `tree` part is longer):

```
/srv/bazaar
...
/srv/bazaar/logs
/srv/bazaar
/srv/bazaar
/root
```

## Task 2: Listing, and the hidden file

```bash
ls
ls -a
ls -lah
ls -lt logs | head -4
```

`ls -a` shows `.env`, `.` and `..`. In `ls -lt`, the newest file (`live.log` or today's log) comes first.

## Task 3: Back up, then edit with nano

```bash
cd config
cp -v bazaar.conf bazaar.conf.bak
nano bazaar.conf
```

In nano, change `sale = none` to `sale = diwali`. Press `Ctrl+O`, then `Enter` to save, then `Ctrl+X` to exit.

```bash
cat bazaar.conf
diff bazaar.conf.bak bazaar.conf
```

**Expected output** (the end):

```
3c3
< sale = none
---
> sale = diwali
```

`diff` shows the one line you changed: `<` the old version, `>` the new one.

## Task 4: Survive vi

```bash
vi notes.txt
```

Press `i`, type `rotate logs on Sunday`, press `Esc`, type `:wq` and press `Enter`. Then `cat notes.txt`.
Now open it again, type some nonsense **without** pressing `i` first, see what happens, then press `Esc` and type `:q!` + `Enter`.
The file is unchanged.

## Task 5 (optional, Going deeper): cp vs mv, with inodes

```bash
ls -i bazaar.conf
cp -v bazaar.conf copy.conf
mv -v copy.conf moved.conf
ls -i
```

The copy has a **new** inode number; `mv` kept it (only the name changed).

## Task 6: The silent overwrite

```bash
echo "NEW" > draft.conf
cp bazaar.conf keep.conf
mv draft.conf keep.conf
cat keep.conf
echo "X" > a.conf; echo "Y" > b.conf
mv -n a.conf b.conf
cat b.conf
cd ..
```

**Expected output:**

```
NEW
Y
```

`mv` replaced `keep.conf` without a word. `mv -n` refused to overwrite `b.conf`.

## Task 7 (optional, Going deeper): rmdir and rm on folders

```bash
mkdir backups/2026/11
mkdir -p backups/2026/11
rmdir backups/2026
rm backups
rm -r backups/2026
ls backups
```

**Expected output:**

```
mkdir: cannot create directory ‘backups/2026/11’: No such file or directory
rmdir: failed to remove 'backups/2026': Directory not empty
rm: cannot remove 'backups': Is a directory
products_2026-10-01.json
```

## Task 8: Read logs, and follow one live

```bash
head -n 2 logs/order_20261121.log
tail -n 1 logs/order_20261121.log
wc -l logs/order_20261121.log
less logs/order_20261120.log
```

In `less`: press `/`, type `failed`, `Enter`. Press `q` to quit. Now follow the live log:

```bash
tail -f logs/live.log
```

A new line appears every 2 seconds. Press `Ctrl+C` to stop.

## Task 9: Find files (the `-exec` and `-mtime` details are Going deeper)

```bash
find . -name "*.conf"
find logs -mtime +7
find . -size +3M
find . -type d
find . -name "*.json" -mtime +30 -exec ls -lh {} \;
```

**Expected output** (in part):

```
logs/order_20261112.log
./media/products/red_running_shoes.jpg
./media/products/masala_box.jpg
./media/products/cotton_kurta.jpg
-rw-r--r-- 1 root root 977K Oct  1 00:00 ./backups/products_2026-10-01.json
```

Only the 12th is "more than 7 days" old: the 13th is 7.5 days old, which `find` counts as 7. (Exact results depend on today's date.)

## Task 10: What fills the disk?

```bash
du -sh * | sort -h
df -h /srv/bazaar
```

**Expected output** (the `du` part):

```
20K	config
48K	logs
984K	backups
12M	media
```

## Task 11 (optional, Going deeper): The backup script

```bash
for i in 1 2 3 4 5; do /srv/tools/backup_config.sh; sleep 1; done
ls -l backups/config
```

The script keeps only the 3 newest backups. Read it (`less /srv/tools/backup_config.sh`) and the lesson's warning box: why
does it sort by **name** and not by time?

## Check your work

From your laptop:

```bash
bash test_lab.sh
```

**Expected output:**

```
Starting lab (builds the image the first time)...
PASS: tools installed: less, nano, vi, tree
PASS: cd - goes back; cd ~ goes home (/root)
PASS: hidden .env shows only with ls -a
PASS: cp makes a new inode, mv keeps it (121780 / 121798 / 121798)
PASS: mv overwrites silently; mv -n doesn't
PASS: mkdir needs -p for nested folders; rm needs -r for folders
PASS: tail -f shows new lines as they are written
PASS: find: -mtime +7 finds only the 12th; -size +3M finds 3 photos
PASS: du -sh * | sort -h: media is the biggest (12M	media)
PASS: backup_config.sh keeps the 3 newest backups (the newest stays, the oldest goes)
ALL CHECKS PASSED
```

## Stuck?

- **Stuck in vi**: press `Esc`, type `:q!`, press `Enter`.
- **Stuck in less or tail -f**: `q` quits `less`; `Ctrl+C` stops `tail -f`.
- **Messed up the files**: `exit`, then `docker compose down` and `docker compose up -d` for a fresh copy.

## Clean up

```bash
docker compose down
```
