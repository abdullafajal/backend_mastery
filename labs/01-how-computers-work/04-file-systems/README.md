# Lab 01-04: Files, inodes and safe saving

**Goal:** see paths, inodes and links; crash in the middle of an unsafe and a safe save; delete a file that is
still open; fill a disk's inodes while most of its space is free.
Tasks marked *optional, Going deeper* match the lesson's Going-deeper boxes; skip them on your first try.

**Time:** about 35 minutes.

**You need:** Docker running.

## What is in this folder

| File | What it does |
| --- | --- |
| `app/paths.py` | absolute vs relative paths, the current folder, `pathlib` |
| `app/crash_save.py` | saves `products.json` the unsafe way or the safe way, and "crashes" halfway |
| `app/open_and_deleted.py` | deletes a 20 MB log while it is still open |
| `app/many_files.py` | writes tiny thumbnail files until the disk says it is full |
| `docker-compose.yml` | one `python` service, a `bazaar-data` volume at `/data`, and a tiny `/thumbs` disk (10 MB, 1000 inodes) |
| `test_lab.sh` | Checks that everything works. |

Every task uses `docker compose run --rm python <command>`.

## Task 1: Paths

```bash
docker compose run --rm python python3 paths.py
```

**Expected output:**

```
1) This process's current folder: /app
2) relative path:  orders/2026/11/order_1042.json
   is absolute?    False
   resolved:       /app/orders/2026/11/order_1042.json
3) absolute path:  /data/orders/2026/11/order_1042.json
   parent folder:  /data/orders/2026/11
   file name:      order_1042.json
   stem / suffix:  order_1042 / .json
4) '..' and '.':   /data/orders/../products/shoes.json  ->  /data/products/shoes.json
5) after os.chdir('/data'), the same relative path means: /data/orders/2026/11/order_1042.json
```

## Task 2 (optional, Going deeper): Inodes and links

Open a shell inside the container, in the `/data` folder:

```bash
docker compose run --rm -w /data python bash
```

Then type these commands one by one:

```bash
echo '{"id": 1}' > product.json
ln product.json same_product.json
ln -s product.json shortcut.json
ls -li
stat -c "%n: inode %i, %h links, %s bytes, %b blocks of %B bytes" product.json
rm product.json
cat same_product.json
cat shortcut.json
```

**Expected output** (inode numbers will differ):

```
121486 -rw-r--r-- 2 root root 10 Nov 21 08:42 product.json
121486 -rw-r--r-- 2 root root 10 Nov 21 08:42 same_product.json
121485 lrwxrwxrwx 1 root root 12 Nov 21 08:42 shortcut.json -> product.json
product.json: inode 121486, 2 links, 10 bytes, 8 blocks of 512 bytes
{"id": 1}
cat: shortcut.json: No such file or directory
```

Same inode number, link count 2: two names for one file. After `rm`, the hard link still has the data; the symlink is broken.

Still in that shell, see the block size at work:

```bash
echo hi > tiny.txt
ls -l tiny.txt
du -h tiny.txt
exit
```

**Expected output:** `ls` says 3 bytes, `du` says `4.0K`.

## Task 3: Crash during an unsafe save

```bash
docker compose run --rm python python3 crash_save.py unsafe
echo "exit code: $?"
docker compose run --rm python python3 crash_save.py check
```

**Expected output:**

```
before: 54 bytes, saving with the unsafe method...
exit code: 137
products.json is BROKEN: Expecting property name enclosed in double quotes: line 1 column 528891 (char 528890)
```

Exit code 137: the program was killed with SIGKILL in the middle of writing (that's the "crash").
Yesterday's good file and today's new one are both gone.

## Task 4: Crash during a safe save

```bash
docker compose run --rm python python3 crash_save.py safe
echo "exit code: $?"
docker compose run --rm python python3 crash_save.py check
docker compose run --rm python ls -l /data
```

**Expected output:**

```
before: 54 bytes, saving with the safe method...
exit code: 137
products.json is valid: 1 product(s)
-rw-r--r-- 1 root root     54 Nov 21 08:42 products.json
-rw-r--r-- 1 root root 528890 Nov 21 08:42 products.json.tmp
```

Same crash, but `products.json` is still the good old file. Only the temporary file is half-written.

## Task 5: A deleted file that keeps its space

```bash
docker compose run --rm python python3 open_and_deleted.py
```

**Expected output** (your free space numbers will differ):

```
free space at start:          53385 MB
after writing a 20 MB log:    53365 MB
the log is file descriptor 3 of PID 7
after deleting the log:       53365 MB   <- the space did NOT come back
the file still appears as:    /data/orders.log (deleted)
after the process closed it:  53385 MB
```

## Task 6: "No space left", with free space

```bash
docker compose run --rm python python3 many_files.py
```

**Expected output:**

```
stopped after 999 files: [Errno 28] No space left on device: '/thumbs/product_999.jpg'
space used: 3996 KB of 10240 KB
inodes free: 0 of 1000
```

The disk is "full", but 60% of its space is free: every one of its 1,000 inodes is used.

## Task 7 (macOS only): upper and lower case

On your Mac, in any empty folder:

```bash
echo x > Product.py
ls product.py
```

**Expected output:** `product.py`: the Mac found the file, even though its name has a capital P.
Now the same in Linux:

```bash
docker compose run --rm python sh -c 'echo x > /tmp/Product.py; ls /tmp/product.py'
```

**Expected output:** `ls: cannot access '/tmp/product.py': No such file or directory`

## Check your work

```bash
bash test_lab.sh
```

**Expected output:**

```
PASS: paths.py: a relative path depends on the current folder
PASS: hard link keeps the data, symlink breaks
PASS: a 3-byte file takes 4096 bytes on disk
PASS: unsafe save + crash (exit 137): products.json is broken
PASS: safe save + crash (exit 137): old file intact, half .tmp left over
PASS: deleted-but-open log keeps its space until closed (53386 -> 53366 -> 53386 MB)
PASS: 1000 inodes used up: 'No space left' while most space is free
ALL CHECKS PASSED
```

## Stuck?

- **Task 3 or 4 says the file is valid after `unsafe`, and the exit code is 0**: the crash didn't happen.
  Check that `docker-compose.yml` has `init: true` (Python must not be PID 1; the lesson explains why).
- **Task 4 shows 20,000 products**: same cause as above.

## Clean up

```bash
docker compose down -v
```

`-v` also deletes the `bazaar-data` volume.
