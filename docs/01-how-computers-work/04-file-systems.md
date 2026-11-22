# File systems

<div class="bz-meta" markdown>
**Module** 1 · How computers work
**Lesson** 4
**Reading time** 15 min (+ optional deeper parts)
**You will build** a crash in the middle of a save (and the safe way that survives it), a deleted file that won't let go of its space, and a "full" disk that is mostly empty
</div>

!!! abstract "In 1 minute"
    - A **path** like `/data/orders/order_1042.json` is the address of a file.
    - A file is a **name** in a folder, pointing to a **record card** (an *inode*), pointing to the data. Deleting removes only the name.
    - A disk can be "full" in two ways: out of **space**, or out of **inodes** (too many small files).
    - Save important files safely: write a **temporary file**, then **rename** it over the old one.
    - In the lab, you crash in the middle of a save, and see which way survives.

> **Previously in Bazaar:** You found and fixed a memory leak, and watched the OOM killer end a process
> that used too much RAM. RAM forgets; anything Bazaar must keep has to go to the disk.

## 1. Why learn this?

Bazaar keeps more and more on disk: order logs, invoices, product photos, and `products.json`.
Then four strange things happen:

1. **"No space left on device"**, while `df -h` says the disk is only 40% used.
2. **The server crashed while saving `products.json`.** After the restart, the file is half-written,
   the JSON is broken, and yesterday's good version is gone too.
3. **Someone deleted a 2 GB log file to free space. The space didn't come back.**
4. **The code works on a developer's Mac, and fails on the Linux server** with "file not found".

Each one makes perfect sense once you know how a **file system** works. Every database, log tool and web server
you will use in this course stands on top of one, and relies on the exact rules you will learn here.

## 2. The concept

### What a file system does

A disk is just a long row of numbered **blocks** (usually 4 KB each). It has no idea what a file is.
The **file system** is the part of the operating system that turns those blocks into **files** and **folders**, with names.

??? note "Going deeper: what a file system keeps track of"

    A disk is just a very long row of numbered **blocks** (usually 4 KB each). It has no idea what a "file"
    or a "folder" is. The **file system** is the part of the operating system that turns that row of blocks into:

    - **files** with names, sizes, owners and dates;
    - **folders** (also called **directories**) that hold files and other folders;
    - a record of which blocks are free and which belong to which file.

    Common file systems: **ext4** and **XFS** on Linux servers, **APFS** on Macs, **NTFS** on Windows.
    They differ in details, but the ideas below are the same everywhere.

### Paths: the address of a file

A **path** says where a file is. On Linux and macOS, everything hangs from one **root** folder, written `/`:

```
/data/orders/2026/11/order_1042.json
```

Read it left to right: from the root `/`, into `data`, into `orders`, into `2026`, into `11`, the file `order_1042.json`.

- An **absolute path** starts with `/`. It means the same thing no matter where you are.
- A **relative path** doesn't start with `/`, like `orders/2026/11/order_1042.json`. It is read starting from the
  process's **current working directory** (every process has one; `os.getcwd()` shows it).
  The same relative path means different files in different folders.
- `.` means "this folder", `..` means "the folder above". `~` means your home folder (in the shell).

Windows is different: it has one root per drive (`C:\`, `D:\`) and uses backslashes: `C:\bazaar\orders\order_1042.json`.
Python's `pathlib` hides the difference: build paths with `/` (`Path("/data") / "orders" / "order_1042.json"`),
and it does the right thing on every system.

??? note "Going deeper: The Linux folder tree"
    On every Linux server (and inside your containers) you will find the same main folders:

    | Folder | What lives there |
    | --- | --- |
    | `/etc` | settings files (Nginx, PostgreSQL, system config) |
    | `/var` | data that changes: `/var/log` (logs), `/var/lib` (databases like PostgreSQL) |
    | `/home` | users' home folders (`/root` for the root user) |
    | `/tmp` | temporary files, often cleared on restart |
    | `/usr` | installed programs and libraries (`/usr/bin`, `/usr/local/bin` from Module 0) |
    | `/proc`, `/sys` | not real files: windows into the kernel (you used `/proc` in Lessons 1–3) |
    | `/dev` | devices, shown as files (disks, the terminal, `/dev/null`) |

### Inodes: the file behind the name

Here is the idea that explains three of Bazaar's four problems. A file has **three separate parts**:

1. **The data blocks**: the actual bytes, somewhere on the disk.
2. **The inode** (index node): the file's record. It holds the size, the owner, the permissions, the times,
   and **which blocks hold the data**. Each inode has a number.
3. **The name**: an entry in a folder that says "the name `order_1042.json` means inode 1042".

**The name is not inside the inode.** A folder is simply a special file containing a list of
"name → inode number" pairs. Finding `/data/orders/order_1042.json` means: read the root folder, find `data`;
read that folder, find `orders`; read that, find `order_1042.json` and its inode number; read the inode; read the blocks.

Three things follow directly from this design:

- **Several names can point to the same inode.** That is a **hard link**. The inode keeps a **link count**.
- **Deleting a file only removes a name.** The inode and its blocks are freed only when **no name and no open
  program** points to it any more.
- **Renaming within the same file system only changes a name entry.** No data is copied. And the kernel does it
  in one indivisible step (it is **atomic**). This is the basis of safe saving.

A **symbolic link** (symlink) is different from a hard link: it is a tiny file whose content is **another path**,
like the `python3 -> python3.13` shortcut from Module 0. If the target is deleted, the symlink is left pointing at nothing.

### Every file system has a limited number of inodes

A file system is created with a fixed number of inodes. Every file and folder uses one, even a tiny one.
So there are **two** ways for a disk to be full:

- out of **space** (blocks): `df -h` shows it;
- out of **inodes**: `df -i` shows it.

Millions of tiny files (thumbnails, session files, cache files) can use up all the inodes while most of the space is free.
The error message is the same for both: `No space left on device`. That is Bazaar's problem 1.

And even a tiny file uses a **whole block** of disk space. A 3-byte file takes 4 KB on disk: `ls -l` shows 3 bytes,
`du` shows `4.0K`.

### Open files and file descriptors

When a program opens a file, it **holds on to it** until it closes it.
Deleting a file only removes its **name**. If a program is still holding the file open, the data stays on the disk,
and the space is **not** freed until that program closes the file (or stops). That's Bazaar's problem 3.

The fix: restart the program so it lets go of the file, or empty the file instead of deleting it (`truncate -s 0 orders.log`).

??? note "Going deeper: file descriptors, and finding deleted-but-open files"

    When a process opens a file, the kernel gives it a small number: a **file descriptor** (fd).
    The process then reads and writes "fd 3", not the name. Every process starts with three already open:

    | fd | Name | Usually |
    | --- | --- | --- |
    | 0 | standard input (stdin) | the keyboard / data piped in |
    | 1 | standard output (stdout) | the screen / `print()` |
    | 2 | standard error (stderr) | the screen / error messages |

    The next file opened gets fd 3. On Linux you can see a process's open files in `/proc/<pid>/fd/`.

    An open file descriptor points at the **inode**, not at the name. So if someone deletes the name while a program still
    has the file open, the program keeps writing happily, and the space stays used until the program closes it or stops.
    In `/proc/<pid>/fd/` the file shows up as `/data/orders.log (deleted)`. That is Bazaar's problem 3. The fix: restart
    or signal the program so it closes the file, or empty the file instead of deleting it (`truncate -s 0 orders.log`).
    Log tools like `logrotate` exist for exactly this reason (Module 25).

### Writing safely

Remember from Lesson 1: writing goes to the page cache in RAM first, and `fsync` forces it onto the disk.
But there is a second danger: a crash **in the middle** of writing.

Opening a file with `open(path, "w")` **empties it immediately**. If the program crashes after writing half the
new content, the old content is gone and the new content is incomplete. That is Bazaar's problem 2.

The safe recipe, used by databases, editors and package managers everywhere:

1. Write the new content to a **temporary file in the same folder** (for example `products.json.tmp`).
2. `flush()` and `fsync()` it, so it is really on the disk.
3. **Rename** it over the real name with `os.replace(tmp, path)`. This is atomic: anyone opening the file sees either
   the complete old version or the complete new one, never half of one.

If the crash happens in step 1 or 2, the real file is untouched; only a half-written `.tmp` is left to clean up.
The temporary file must be in the same folder (the same file system), because a rename across file systems is really
a copy, and is not atomic.

### Case sensitivity

On Linux, `Product.py` and `product.py` are two different files. On macOS (by default) and Windows,
they are the **same** file: the file system ignores upper and lower case when looking up names.
So `import product` works on a Mac even if the file is `Product.py`, and fails on the Linux server. That is Bazaar's problem 4.
The rule: always write file names exactly as they are, and test in Linux containers (which this course does).

??? note "Going deeper: Permissions, in one paragraph"
    Every inode also records an **owner**, a **group**, and **permissions**: who may read (`r`), write (`w`) or
    execute (`x`) the file. You see them in `ls -l` as `-rw-r--r--`. Module 2 covers them properly. For now, know that
    "Permission denied" comes from here, not from the file's content.

### An analogy, and where it breaks

Think of Bazaar's warehouse again:

- The **data blocks** are the shelves where boxes physically sit.
- The **inode** is the box's **inventory card**: what's inside, how big, who owns it, which shelves.
- The **name** is a **label on a list at the front desk**: "Order 1042 → card #1042".
  The desk can have two labels pointing to the same card (a hard link).
- **Deleting** removes a label from the desk. The card and the boxes are thrown away only when no label points to the card
  and nobody is currently carrying it around (an open file).

Where it breaks: in a real warehouse, someone could notice a box with no label and still find it.
On a disk, once nothing points to an inode, its blocks are simply marked free and will be reused.
And a real front desk has no "atomic" relabelling; the kernel truly swaps a name in one step.

??? note "Going deeper: In the real world"
    - **PostgreSQL** (Modules 14–17) keeps its data in files under `/var/lib/postgresql`, and relies on `fsync`
      and careful file writes (its Write-Ahead Log) to survive crashes.
    - **Logs** (Module 25): `logrotate` and Docker's log settings rotate and remove logs without the "deleted but open" trap.
    - **Product images** (Module 18): millions of image files on a server's disk run into inode limits and backup pain,
      and don't work across many servers. Bazaar moves them to object storage (MinIO/S3).
    - **Docker** (Module 19): image layers are folders stacked by a special file system (overlay);
      **volumes** keep data outside the container's own layer (you used one in Lesson 1).
    - **Nginx** (Module 20) serves Bazaar's static files straight from disk, very efficiently.

### Questions you may have

**Is a folder really a file?**
In the sense that matters, yes: it is stored like a file, and its content is a list of names and inode numbers.
That is why a folder has an inode too, and why `ls -li` shows inode numbers for folders.

**Why does Linux say "everything is a file"?**
Because the kernel shows many things through the same file interface: real files, folders, devices (`/dev`),
running processes (`/proc`), and even network connections. The same `open/read/write/close` works on all of them.

**Does deleting a file erase its data?**
No. It frees the blocks for reuse; the old bytes stay there until something overwrites them.
That's why deleted files can sometimes be recovered, and why secure erasing needs special tools.

**Why must the temporary file be in the same folder?**
A rename is atomic only within one file system. `/tmp` is often a different file system, and "renaming" from there
is really copy-then-delete, which can be interrupted halfway.

**How many inodes does a disk have?**
It depends on how the file system was created; ext4 typically creates one inode per 16 KB of space.
`df -i` tells you the total and how many are free.

**Is `os.replace` the same as `os.rename`?**
Almost. `os.replace` overwrites the target if it exists, on every operating system. `os.rename` fails on Windows if
the target exists. Use `os.replace` for safe saves.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="file-system"></div>

## 4. Code example

### Paths

```python title="paths.py"
--8<-- "labs/01-how-computers-work/04-file-systems/app/paths.py"
```

Output in the lab container:

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

Lines 2 and 5 are the key: the **same** relative path pointed to `/app/...` and then to `/data/...`, only because the
current folder changed. That is why backend code should build paths from a known absolute starting point
(like `Path(__file__).parent`, the folder of the code file itself), not from "wherever the program was started".

### Saving safely, and crashing

```python title="crash_save.py"
--8<-- "labs/01-how-computers-work/04-file-systems/app/crash_save.py"
```

`crash()` sends SIGKILL to its own process, exactly like a power cut from the program's point of view:
no cleanup, no `finally`, nothing. Results in the lab:

```
$ python3 crash_save.py unsafe        # exits with code 137
before: 54 bytes, saving with the unsafe method...
$ python3 crash_save.py check
products.json is BROKEN: Expecting property name enclosed in double quotes: line 1 column 528891 (char 528890)

$ python3 crash_save.py safe          # exits with code 137
before: 54 bytes, saving with the safe method...
$ python3 crash_save.py check
products.json is valid: 1 product(s)
$ ls -l /data
-rw-r--r-- 1 root root     54 Nov 21 08:42 products.json
-rw-r--r-- 1 root root 528890 Nov 21 08:42 products.json.tmp
```

The unsafe save destroyed both the old and the new data. The safe save crashed at the same moment, but `products.json`
is still yesterday's good file (1 product, 54 bytes). The half-written data is only in `products.json.tmp`, which Bazaar
can delete at startup.

!!! note "A real surprise while building this lab"
    Our first version of this lab **didn't crash**: the "safe" save finished and reported 20,000 valid products.
    The reason was Lesson 2's PID 1 rule. Python was PID 1 in the container, and the kernel protects PID 1 from signals
    it has no handler for, even SIGKILL sent from inside the container. Adding `init: true` (so Python is not PID 1)
    made the crash real. Always check that a test really tested what you think it did.

## 5. Under the hood

??? note "Going deeper: Inodes and links, in `ls -li`"
    ```
    $ echo '{"id": 1}' > product.json
    $ ln product.json same_product.json       # a hard link: a second name for the same inode
    $ ln -s product.json shortcut.json        # a symbolic link: a file containing a path
    $ ls -li
    121486 -rw-r--r-- 2 root root 10 Nov 21 08:42 product.json
    121486 -rw-r--r-- 2 root root 10 Nov 21 08:42 same_product.json
    121485 lrwxrwxrwx 1 root root 12 Nov 21 08:42 shortcut.json -> product.json
    ```

    | Column | Meaning |
    | --- | --- |
    | `121486` | the **inode number** (`-i`). Both names show the same one: they are the same file. |
    | `-rw-r--r--` | the type (`-` file, `d` folder, `l` symlink) and the permissions |
    | `2` | the **link count**: how many names point to this inode |
    | `root root` | owner and group |
    | `10` | size in bytes |
    | `shortcut.json -> product.json` | a symlink and the path it contains (12 bytes: the length of "product.json") |

    Now delete the original name:

    ```
    $ rm product.json
    $ cat same_product.json
    {"id": 1}
    $ cat shortcut.json
    cat: shortcut.json: No such file or directory
    ```

    The data survived through the hard link (link count went from 2 to 1). The symlink still contains the path
    `product.json`, which no longer exists.

    `stat` shows the inode's record directly:

    ```
    product.json: inode 121486, 2 links, 10 bytes, 8 blocks of 512 bytes
    ```

    8 × 512 = 4,096 bytes on disk, for 10 bytes of data: one whole 4 KB block.

### The deleted-but-open file

`open_and_deleted.py` writes a 20 MB log, deletes it while it's still open, then closes it:

```
free space at start:          53385 MB
after writing a 20 MB log:    53365 MB
the log is file descriptor 3 of PID 7
after deleting the log:       53365 MB   <- the space did NOT come back
the file still appears as:    /data/orders.log (deleted)
after the process closed it:  53385 MB
```

The space returned only when the last user, the process's fd 3, let go. On a real server, `ls -l /proc/*/fd 2>/dev/null | grep deleted`
(or the `lsof` tool, where installed) finds the culprits.

### A "full" disk that is mostly empty

The lab gives `/thumbs` a tiny file system: 10 MB, but only 1,000 inodes. `many_files.py` writes 100-byte thumbnails:

```
stopped after 999 files: [Errno 28] No space left on device: '/thumbs/product_999.jpg'
space used: 3996 KB of 10240 KB
inodes free: 0 of 1000
```

Out of inodes, with 60% of the space still free. (999, not 1,000: the folder itself uses one inode.)
Notice also 3996 KB used for 999 files of 100 bytes: about 4 KB each, one block per file.

??? note "Going deeper: journaling"
    What if the power fails while the file system is updating its own records, say halfway through creating a file
    (inode written, folder entry not yet)? Modern file systems like ext4, XFS, APFS and NTFS keep a **journal**: before
    changing their records, they write down what they are about to do. After a crash, they replay or undo the journal,
    so the file system's structure stays consistent. Note what this protects: the file system's **own** records, not the
    content of your files. Your data still needs `fsync` and the safe-save recipe. Databases use the same idea for their
    data, called a Write-Ahead Log (Module 16).

??? note "Going deeper: why `fsync` the folder too"
    After `os.replace()`, the new name entry lives in the folder, which is itself a file with its own blocks in the page cache.
    For the very strictest crash safety, programs also `fsync` the folder (open it with `os.open(dir, os.O_RDONLY)` and `os.fsync` it).
    Databases do this; for most application files, the three-step recipe in this lesson is enough.

## 6. Lab

**Lab folder:** `labs/01-how-computers-work/04-file-systems/`

```bash
cd labs/01-how-computers-work/04-file-systems
docker compose run --rm python python3 paths.py
```

Expected output: the paths output above. In the lab you will also:

1. look at inodes, hard links and symlinks with `ls -li` and `stat`, and see a 3-byte file take 4 KB;
2. crash in the middle of an unsafe save and a safe save, and compare the results;
3. delete a log file that is still open and watch the space stay used until it is closed;
4. fill a disk's inodes while most of its space is free;
5. (on a Mac) see that `Product.py` and `product.py` are the same file, while Linux disagrees.

When you finish, run `bash test_lab.sh`. You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`open(path, "w")` on an important file.** It empties the file first; a crash leaves it broken.
   **Fix:** write a temp file in the same folder, `fsync`, then `os.replace`.
2. **The temporary file in `/tmp`.** It may be another file system, so the final "rename" is not atomic.
   **Fix:** put it next to the real file.
3. **Deleting a big log that a program still writes to.** `rm` succeeds, but the space doesn't come back.
   **Fix:** `truncate -s 0 file`, or restart the program; better, use log rotation (Module 25).
4. **`No space left on device` with free space.** You are out of inodes. **Fix:** check `df -i`; store fewer, bigger files,
   or move many small files to object storage (Module 18).
5. **Relative paths in backend code.** They depend on the folder the program was started from.
   **Fix:** build paths from `Path(__file__).parent` or a configured absolute folder.
6. **Building paths by gluing strings** (`folder + "/" + name`). Breaks on Windows and with stray slashes.
   **Fix:** `pathlib.Path` and the `/` operator.
7. **Wrong upper/lower case in file names.** Works on Mac, fails on Linux: `FileNotFoundError` or `ModuleNotFoundError`.
   **Fix:** match names exactly; test in Linux containers.

## 8. Quiz

<div class="bz-quiz" data-quiz="m01-04"></div>

## 9. What's next

Next: [What a server really is](05-what-a-server-is.md). You will put all of Module 1 together.

**In one line:** a file is a name pointing to an inode pointing to data blocks; deleting removes a name, renaming is atomic,
and both space and inodes can run out, so save with temp-fsync-rename and watch `df -h` **and** `df -i`.

### Cheat sheet

| Task | Linux / macOS | Windows (PowerShell) |
| --- | --- | --- |
| Current folder | `pwd` | `Get-Location` |
| List with inodes, sizes, links | `ls -li` | `Get-ChildItem` (no inodes) |
| A file's full record | `stat file` (macOS: `stat -x file`) | `Get-Item file \| Format-List *` |
| Free space / free inodes | `df -h` / `df -i` | `Get-PSDrive` |
| Space a file really uses | `du -h file` | (Explorer → Properties → "Size on disk") |
| Hard link / symlink | `ln a b` / `ln -s a b` | `New-Item -ItemType HardLink/SymbolicLink` |
| Empty a file without deleting it | `truncate -s 0 file` | `Clear-Content file` |
| Open files of a process (Linux) | `ls -l /proc/<pid>/fd` | Resource Monitor → CPU → Associated Handles |

| Python | Use |
| --- | --- |
| `Path("/data") / "orders" / "x.json"` | build a path |
| `Path(__file__).parent` | the folder of this code file |
| `p.resolve()`, `p.parent`, `p.name`, `p.suffix` | work with paths |
| `os.replace(tmp, path)` | atomic rename (overwrites) |
| `f.flush(); os.fsync(f.fileno())` | really put it on the disk |
| `shutil.disk_usage(path)`, `os.statvfs(path)` | free space, free inodes |

> **Next in Bazaar:** you now know the CPU, memory, processes and files. Put them together, add a network card,
> and you have Bazaar's server. What is a server, really? Let's finish Module 1.

<div class="bz-complete" data-lesson="m01-04"></div>
