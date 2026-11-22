# Users and permissions

<div class="bz-meta" markdown>
**Module** 2 · Linux and the command line
**Lesson** 3
**Reading time** 15 min (+ optional deeper parts)
**You will build** a server with three users, lock down Bazaar's password file, and test every permission rule as each user
</div>

!!! abstract "In 1 minute"
    - Every program runs **as a user**. Users can be in **groups**, like `bazaar`.
    - Every file has an **owner**, a **group**, and permissions: who may **r**ead, **w**rite or e**x**ecute it.
    - `chmod 640 .env` means: owner read+write, group read, everyone else nothing.
    - Give each user only what it needs. `chmod 777` (everyone can do everything) is almost never right.
    - In the lab, you find that an intern can read Bazaar's password, fix it, and test it as each user.

> **Previously in Bazaar:** you learned to move around the server, copy, move, find and read files,
> and to edit a config file without losing the old one.

## 1. Why learn this?

Bazaar's server now has several people and programs on it: Asha (a developer), Ravi (a support intern),
and the web server, which runs as a special user called `www-data`. Then:

1. Ravi opens `/srv/bazaar/.env` and reads **the database password**. Nobody gave him access. Nobody took it away either.
2. Nginx shows "403 Forbidden" for product photos. Someone "fixes" it with `chmod -R 777`. Now **anyone** on the server can
   change Bazaar's config, and an attacker who breaks into the web server can rewrite it.
3. A cleanup job running as Ravi deletes a report owned by root, a file Ravi wasn't allowed to change at all. How?

Linux permissions are small (three users, three letters), but every security mistake on a server eventually passes through them.
This lesson explains exactly how the kernel decides "allowed" or "Permission denied", and how to set things up the safe way.

## 2. The concept

### Users and groups

Every process runs **as a user**, and every user has:

- a **name** and a number, the **UID** (user ID): `asha` is 1000;
- a **primary group** and maybe extra groups, each with a number, the **GID** (group ID).

A **group** is a named set of users, so you can give permissions to "everyone in `bazaar`" instead of to each person.

```
$ id asha
uid=1000(asha) gid=1001(asha) groups=1001(asha),27(sudo),1000(bazaar)
$ id ravi
uid=1001(ravi) gid=1002(ravi) groups=1002(ravi)
$ id www-data
uid=33(www-data) gid=33(www-data) groups=33(www-data)
```

Users are listed in `/etc/passwd`, groups in `/etc/group`:

```
asha:x:1000:1001::/home/asha:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
bazaar:x:1000:asha
```

| Field (`/etc/passwd`) | Meaning |
| --- | --- |
| `asha` | user name |
| `x` | the password is stored elsewhere, in `/etc/shadow`, which only root can read |
| `1000` / `1001` | UID / primary GID |
| `/home/asha` | home folder |
| `/bin/bash` | login shell. `/usr/sbin/nologin` means "this user can't log in": it's for a **service**, not a person |

There are three kinds of users:

- **root** (UID 0): the administrator. The kernel doesn't check read/write permissions for root at all.
- **people**: `asha`, `ravi`, usually UID 1000 and up.
- **service users**: `www-data` (web servers), `postgres` (the database), each running one program with only the access it needs.

### Every file has an owner, a group and a mode

Look again at `ls -l` (Module 1, Lesson 4):

```
-rw-r----- 1 root bazaar 32 Nov 21 11:27 .env
```

- owner: `root`; group: `bazaar`;
- the **mode**: `-rw-r-----`. The first character is the type (`-` file, `d` folder, `l` link). Then three sets of three:

| Set | Letters | Who it applies to |
| --- | --- | --- |
| 1–3 | `rw-` | the **owner** (user) |
| 4–6 | `r--` | members of the file's **group** |
| 7–9 | `---` | **others**: everyone else |

Each set has three letters, `r`, `w`, `x`, or `-` for "no".

### What r, w and x mean: files vs folders

| | On a **file** | On a **folder** |
| --- | --- | --- |
| `r` read | read the content | **list** the names inside (`ls`) |
| `w` write | change the content | **create, delete and rename** files inside |
| `x` execute | run it as a program | **enter** it (`cd`) and reach things inside by name |

The folder column surprises everyone, and it explains Bazaar's problem 3:

- **Deleting a file needs `w` on its folder, not on the file.** A file is just a name in a folder (Module 1, Lesson 4).
  Removing the name changes the **folder**. So in a folder where Ravi has `w`, he can delete a file owned by root, even a
  read-only one.
- A folder with `x` but not `r`: you can open a file inside **if you know its name**, but you can't list the folder.
- A folder with `r` but not `x`: you can see the names, but can't open anything or `cd` in.
- To reach `/srv/bazaar/config/bazaar.conf`, you need `x` on **every** folder on the way: `/`, `/srv`, `/srv/bazaar`, `config`.

### How the kernel decides

When a process tries to read, write or run something, the kernel checks, in this order:

1. Is the process **root** (UID 0)? → allowed (for read/write; to run a file, at least one `x` must be set).
2. Is the process's user the file's **owner**? → use the **owner** bits, and **only** those.
3. Is one of the process's groups the file's **group**? → use the **group** bits, and only those.
4. Otherwise → use the **others** bits.

It picks **exactly one** set. If the owner bits say no, it doesn't "fall through" to the more generous group or others bits.
You'll see this in the lab: with `.env` at `600` (owner only), Asha, who is in the `bazaar` group, is denied, because the group
bits are now `---`.

### Numbers: 644, 640, 755, 600

Each set of `rwx` is also written as one digit: `r` = 4, `w` = 2, `x` = 1, added up.

| Digit | Letters | Meaning |
| --- | --- | --- |
| 7 | `rwx` | everything |
| 6 | `rw-` | read and write |
| 5 | `r-x` | read and run / list and enter |
| 4 | `r--` | read only |
| 0 | `---` | nothing |

Three digits = owner, group, others. The ones you'll use every week:

| Mode | Letters | Typical use |
| --- | --- | --- |
| `644` | `rw-r--r--` | normal files: config, code |
| `640` | `rw-r-----` | secrets for one group: `.env` readable by the `bazaar` group |
| `600` | `rw-------` | private files: SSH keys (Lesson 6) |
| `755` | `rwxr-xr-x` | folders, and scripts everyone may run |
| `750` | `rwxr-x---` | folders only the group may enter |
| `700` | `rwx------` | private folders |
| `777` | `rwxrwxrwx` | **everyone can do everything**. Almost never right |

### Changing permissions: `chmod`, `chown`, `chgrp`

- `chmod 640 .env`: set the mode with numbers.
- `chmod u+x deploy.sh`, `chmod g+w file`, `chmod o-r file`, `chmod a-x file`: change one part with letters:
  `u` user (owner), `g` group, `o` others, `a` all; `+` add, `-` remove, `=` set exactly.
- `chown root:bazaar .env`: change the owner and group (only root can give files away).
- `chgrp bazaar file`: change only the group.
- `-R` does it to a folder and everything inside. Be careful: `chmod -R 644` on a folder also removes `x` from the folders inside,
  and then nobody can enter them.

??? note "Going deeper: Default permissions: umask"
    New files don't start with random permissions. The **umask** says which bits to **remove** from the maximum
    (666 for files, 777 for folders). The usual umask is `022`:

    - files: 666 − 022 = **644**;
    - folders: 777 − 022 = **755**.

    With `umask 077`, new files are `600` and new folders `700`: private by default. Services that handle secrets often run that way.

### Becoming someone else: `sudo` and `su`

- `sudo command` runs **one** command as root, if `/etc/sudoers` (or a file in `/etc/sudoers.d/`) allows your user. It usually asks
  for **your own** password, and it records who ran what.
- `su ravi` switches to another user's shell (it asks for **that** user's password).

```
$ sudo whoami            # as asha, who is allowed
root
$ sudo whoami            # as ravi, who isn't
[sudo] password for ravi:
ravi is not in the sudoers file.
```

The rule that keeps servers safe is the **principle of least privilege**: every user and every program gets only the access it needs,
and nothing more. Day-to-day work happens as a normal user; `sudo` is for the few commands that need root.

??? note "Going deeper: Two special bits you will see"
    - **The sticky bit** (`t` at the end, like `drwxrwxrwt` on `/tmp`): in a folder everyone can write to, you may only delete or rename
      **your own** files. Without it, anyone could delete anyone's files in `/tmp`.
    - **The setuid bit** (`s` in the owner's `x` place, like `-rwsr-xr-x` on `/usr/bin/passwd` and `/usr/bin/sudo`): the program runs as
      its **owner** (root), not as the user who started it. That's how a normal user's `passwd` can update `/etc/shadow`. Few programs
      should have it, and attackers look for them.

### Bazaar's fixes

| Problem | Fix |
| --- | --- |
| `.env` was `644`: everyone could read the password | `chown root:bazaar .env` and `chmod 640 .env` |
| `chmod -R 777` to fix "403 Forbidden" | give `www-data` exactly what it needs: read on photos (`644`), `x` on the folders on the way (`755`) |
| The web server could change the config | config owned by root, `644`; the only folder `www-data` may write is `media/uploads` |
| Everyone used root | personal accounts + `sudo` for the few admin commands |

### An analogy, and where it breaks

Think of Bazaar's office building:

- The **owner** of a room has their own key, the **group** (the `bazaar` team) shares a team key, and **others** are visitors.
- `r` lets you look through the glass door, `w` lets you rearrange the room, and `x` lets you walk in.
- The **security guard** (the kernel) checks one thing: which key do you have, owner, team or visitor? He doesn't try your other keys.
- **root** has the master key, and the guard doesn't even check it.

Where it breaks: in a real building, throwing away someone's document needs permission for **the document**. On Linux, deleting needs
permission for the **folder** (the room), not the file. And the "visitor" set really means **everyone else on the machine**, including
programs an attacker might be running.

??? note "Going deeper: In the real world"
    - **Nginx and Gunicorn** (Module 20) run as unprivileged users like `www-data`; Bazaar gives them access to exactly the files they serve.
    - **PostgreSQL** (Module 14) refuses to start if its data folder is readable by others; its files belong to the `postgres` user.
    - **SSH** (Lesson 6) refuses a private key with permissions wider than `600`.
    - **Docker** (Module 19): containers run as root by default; good Dockerfiles create a user and switch to it with `USER`.
    - **Security** (Module 23): "least privilege", secrets with narrow permissions, and no world-writable files are on every security checklist.

### Questions you may have

**Why does `ls -l` show my file as owned by a number instead of a name?**
The file stores only the UID. If no user with that number exists on this machine (for example after copying files between servers or
containers), `ls` can only show the number.

**Can root be denied anything?**
Root bypasses read/write checks. A file needs at least one `x` bit for even root to run it. And security systems beyond basic permissions
(like SELinux or AppArmor, or container limits) can restrict root too.

**What's the difference between `sudo` and logging in as root?**
`sudo` runs one command, asks for your own password, and logs who did it. Logging in as root gives an all-powerful shell with no record
of which person did what. Most servers disable root login over SSH.

**Is `chmod 777` ever OK?**
Practically never on a server. If something says "Permission denied", find **which** user needs **which** permission on **which** file or
folder, and give exactly that.

**Why does deleting need `w` on the folder?**
Because a file's name lives in the folder (Module 1, Lesson 4). Deleting removes that name, which changes the folder.

**What does a capital `S` or `T` mean in `ls -l`?**
The setuid/sticky bit is set, but the `x` under it is not. It's usually a mistake.

## 3. See it in action

Choose who and what, then press **Play**. Try `ravi` and `asha` on `.env`, then `www-data` on the uploads folder.

<div class="bz-diagram" data-diagram="permission-check"></div>

## 4. Code example

There's no new program today: permissions are set with commands. Here are Bazaar's three fixes, in order, as you'll run them in the lab:

```bash
# 1. The password file: readable only by root and the bazaar group.
chown root:bazaar /srv/bazaar/.env
chmod 640 /srv/bazaar/.env

# 2. The config: root may change it, everyone may read it. Nobody else may write.
chown -R root:bazaar /srv/bazaar/config
chmod 644 /srv/bazaar/config/bazaar.conf

# 3. Uploads: the web server's only writable folder.
chown www-data:www-data /srv/bazaar/media/uploads
chmod 755 /srv/bazaar/media/uploads
```

The result, tested as each user:

```
$ ls -l .env
-rw-r----- 1 root bazaar 32 Nov 21 11:27 .env
$ cat .env          # as ravi
cat: .env: Permission denied
$ cat .env          # as asha (in the bazaar group)
DB_PASSWORD=not-a-real-password
$ cat .env          # as www-data
cat: .env: Permission denied
```

## 5. Under the hood

### Checking as each user

In the lab, `docker compose exec -u ravi server bash` opens a shell **as Ravi**. The kernel then checks every file access against Ravi's UID
and groups. That's the fastest way to test permissions: become the user, and try.

### Owner bits win, even when they say no

```
$ chmod 600 .env
$ ls -l .env
-rw------- 1 root bazaar 32 Nov 21 11:27 .env
$ cat .env          # as asha
cat: .env: Permission denied
```

Asha is in the `bazaar` group, but the group bits are now `---`. The kernel used them, and only them.

### Letters and numbers

```
$ ls -l t
-rw-r--r-- 1 root root 0 Nov 21 11:27 t
$ chmod u+x,g+w,o-r t
$ ls -l t
-rwxrw---- 1 root root 0 Nov 21 11:27 t
$ stat -c "%a %A %n" t
760 -rwxrw---- t
```

`u+x` made the owner `rwx` (7), `g+w` made the group `rw-` (6), `o-r` left others with nothing (0): 760.

??? note "Going deeper: Folders: r and x are different"
    ```
    $ chmod 711 vault      # as root: rwx--x--x
    $ ls vault             # as ravi
    ls: cannot open directory 'vault': Permission denied
    $ cat vault/key.txt    # as ravi, who knows the name
    secret
    $ chmod 744 vault      # as root: rwxr--r--
    $ ls vault             # as ravi
    key.txt
    $ cat vault/key.txt
    cat: vault/key.txt: Permission denied
    $ cd vault
    bash: cd: vault: Permission denied
    ```

### Deleting needs the folder's w

```
$ ls -l shared                  # shared/ is 777, the file is root's and read-only
-r--r--r-- 1 root root 10 Nov 21 11:27 root_report.txt
$ rm -f shared/root_report.txt  # as ravi
$ ls shared                     # empty: it's gone
$ rm -f /tmp/root_note          # as ravi, in /tmp (drwxrwxrwt)
rm: cannot remove '/tmp/root_note': Operation not permitted
```

In the `777` folder, Ravi deleted root's read-only file. In `/tmp`, the sticky bit stopped him.

### The web server's limits

```
$ whoami
www-data
$ echo photo > media/uploads/red_running_shoes.jpg && ls -l media/uploads
-rw-r--r-- 1 www-data www-data 6 Nov 21 11:27 red_running_shoes.jpg
$ echo hacked >> config/bazaar.conf
bash: config/bazaar.conf: Permission denied
```

??? note "Going deeper: umask in action"
    ```
    $ umask
    0022
    $ touch a.txt; mkdir d; ls -l
    -rw-r--r-- 1 asha asha    0 Nov 21 11:27 a.txt
    drwxr-xr-x 2 asha asha 4096 Nov 21 11:27 d
    $ umask 077; touch b.txt; mkdir d2
    -rw------- 1 asha asha 0 Nov 21 11:27 b.txt
    drwx------ 2 asha asha 4096 Nov 21 11:27 d2
    ```

### The 777 "fix"

```
$ chmod 777 config/bazaar.conf
$ echo "sale = 99% off" >> config/bazaar.conf    # as ravi
$ tail -1 config/bazaar.conf
sale = 99% off
```

That's what `777` means: anyone who can run anything on this server can change Bazaar's prices.

??? note "Going deeper: the shadow file"
    Passwords used to be stored (hashed) in `/etc/passwd`, which everyone can read, so attackers could copy the hashes and try to
    crack them offline. Today `/etc/passwd` has an `x` and the hashes live in `/etc/shadow`, readable only by root.
    In the lab, `cat /etc/shadow` as Asha says `Permission denied`; `sudo head /etc/shadow` works. Module 12 explains password hashing.

??? note "Going deeper: ACLs, when three sets aren't enough"
    Sometimes you need "the bazaar group may read, **and** the support group may read too". Basic permissions have only one group per file.
    **Access Control Lists** (ACLs) add extra entries: `setfacl -m g:support:r file`, and `getfacl file` shows them. A `+` at the end of
    the mode in `ls -l` (like `-rw-r-----+`) means an ACL is present. Use them sparingly; plain groups are easier to reason about.

## 6. Lab

**Lab folder:** `labs/02-linux-command-line/03-users-and-permissions/`

```bash
cd labs/02-linux-command-line/03-users-and-permissions
docker compose up -d --build
docker compose exec -u ravi server bash
```

You're Ravi, in `/srv/bazaar`, and the first thing you can do is read the database password. In the lab you'll then fix `.env` as root and
test it as Ravi, Asha and `www-data`; see the owner bits win; use letters and numbers with `chmod`; see `r` and `x` on folders; delete a file
you can't write (and fail in `/tmp`); see what `www-data` can and can't do; use `sudo` as Asha and fail as Ravi; change the umask; and see
what `777` really allows.

When you finish, run `bash test_lab.sh` (from your laptop). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Secrets readable by everyone** (`644` on `.env`, keys, backups). **Fix:** `640` with a group, or `600`.
2. **`chmod -R 777` to "fix" Permission denied.** It fixes nothing and opens everything. **Fix:** find which user needs which permission
   (`ls -l` on the file **and** each folder on the way) and grant exactly that.
3. **`chmod -R 644` on a folder.** The subfolders lose `x`, so nobody can enter them. **Fix:** set folders and files separately:
   `find dir -type d -exec chmod 755 {} +` and `find dir -type f -exec chmod 644 {} +`.
4. **Forgetting `x` on a parent folder.** The file is `644`, but a folder on the way is `700`, so `www-data` gets "403 Forbidden". **Fix:** check every
   folder on the path (`namei -l path` shows them all, where available).
5. **Running everything as root.** One bug or one attacker gets everything. **Fix:** service users, and `sudo` for admin commands only.
6. **Expecting a read-only file to be safe from deletion.** Deletion is controlled by the folder. **Fix:** restrict `w` on the folder, or use the sticky bit.
7. **`sudo` in front of everything "just in case".** Files then end up owned by root, and the app can't write them. **Fix:** use `sudo` only when the
   command really needs root.

## 8. Quiz

<div class="bz-quiz" data-quiz="m02-03"></div>

## 9. What's next

Next: [Pipes and redirection](04-pipes-and-redirection.md). You'll make commands work together, and search Bazaar's logs like a pro.

**In one line:** every file has an owner, a group and three sets of `rwx`; the kernel picks one set (owner, group or others) and checks only that,
so give each user and program exactly the access it needs, and never `777`.

### Cheat sheet

| Task | Command |
| --- | --- |
| Who am I, which groups? | `whoami`, `id`, `id asha` |
| Owner, group, mode | `ls -l file`, `stat -c "%a %A %U:%G %n" file` |
| Set mode with numbers / letters | `chmod 640 f` / `chmod u+x,g-w,o= f` |
| Change owner and group | `chown user:group f` (`-R` for folders) |
| Change group only | `chgrp group f` |
| Folders 755, files 644, everywhere | `find d -type d -exec chmod 755 {} +; find d -type f -exec chmod 644 {} +` |
| Default permissions | `umask` (usually `022`) |
| Run one command as root | `sudo command` |
| Open a shell as another user | `su - name` (or `sudo -u name bash`) |
| In a Compose lab, as a user | `docker compose exec -u name service bash` |

| Mode | Meaning |
| --- | --- |
| `644` / `640` / `600` | file: everyone reads / group reads / owner only |
| `755` / `750` / `700` | folder or script: everyone / group / owner only |
| `777` | everyone can do everything: don't |
| `t` on a folder | sticky: only delete your own files |

> **Next in Bazaar:** the logs are full of orders. How many failed today? Which customer failed most? Which product sells best?
> A few small commands, joined with `|`, answer all of it in one line.

<div class="bz-complete" data-lesson="m02-03"></div>
