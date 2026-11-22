# Lab 02-03: Users and permissions

**Goal:** see the server's users and groups, find out that the database password is readable by everyone, fix it, and test every
permission rule by **becoming** each user.
Tasks marked *optional, Going deeper* match the lesson's Going-deeper boxes; skip them on your first try.

**Time:** about 40 minutes.

**You need:** Docker running.

## How this lab works

```bash
docker compose up -d --build
```

The server has these users:

| User | Who | Groups |
| --- | --- | --- |
| `root` | the administrator | `root` |
| `asha` | Bazaar developer; may use `sudo` | `asha`, `bazaar`, `sudo` |
| `ravi` | support intern; password `ravi` (for practice only) | `ravi` |
| `www-data` | the web server (a service user, no login) | `www-data` |

Open a shell **as a given user** with `-u`:

```bash
docker compose exec -u ravi server bash      # as ravi
docker compose exec -u asha server bash      # as asha
docker compose exec server bash              # as root
```

Every shell starts in `/srv/bazaar`. Type `exit` to leave. `docker compose down` and `up -d` reset everything.

## Task 1: Who is who?

As root:

```bash
id; id asha; id ravi; id www-data
grep -E "^(root|asha|ravi|www-data):" /etc/passwd
grep -E "^(bazaar|sudo):" /etc/group
ls -la /srv/bazaar
```

Find `/usr/sbin/nologin` for `www-data`, and the owner, group and mode of `.env`.

## Task 2: The leak

As **ravi**:

```bash
cat .env
```

**Expected output:**

```
DB_PASSWORD=not-a-real-password
```

The intern can read the database password, because `.env` is `-rw-r--r--` (644).

## Task 3: Fix it, and test as everyone

As **root**:

```bash
chown root:bazaar .env
chmod 640 .env
ls -l .env
```

**Expected output:**

```
-rw-r----- 1 root bazaar 32 Nov 21 11:27 .env
```

Now `cat .env` as **ravi**, as **asha** and as **www-data** (`docker compose exec -u www-data server bash`).

**Expected output:** ravi and www-data get `cat: .env: Permission denied`; asha (group `bazaar`) sees the password.

## Task 4: The owner (or group) bits are the only ones used

As **root**: `chmod 600 .env`. As **asha**: `cat .env` → `Permission denied`, although she's in `bazaar`.
As **root**, put it back: `chmod 640 .env`.

## Task 5: chmod with letters

As **root**:

```bash
touch t; chmod 644 t
chmod u+x,g+w,o-r t
stat -c "%a %A %n" t
```

**Expected output:**

```
760 -rwxrw---- t
```

## Task 6 (optional, Going deeper): r and x on folders

As **root**:

```bash
mkdir vault; echo secret > vault/key.txt
chmod 711 vault
```

As **ravi**: `ls vault` (denied) and `cat vault/key.txt` (works: he knows the name).
As **root**: `chmod 744 vault`. As **ravi**: `ls vault` (works), `cat vault/key.txt` and `cd vault` (both denied).

## Task 7: Deleting is about the folder

As **root**:

```bash
mkdir shared; chmod 777 shared
echo important > shared/root_report.txt; chmod 444 shared/root_report.txt
echo note > /tmp/root_note
ls -l shared; ls -ld /tmp
```

As **ravi**:

```bash
rm -f shared/root_report.txt; ls shared
rm -f /tmp/root_note
```

**Expected output:**

```
rm: cannot remove '/tmp/root_note': Operation not permitted
```

The read-only file in `shared/` is gone (`ls shared` prints nothing). In `/tmp`, the sticky bit (`t` in `drwxrwxrwt`) protected root's file.

## Task 8: What can the web server do?

As **www-data** (`docker compose exec -u www-data server bash`):

```bash
whoami
echo photo > media/uploads/red_running_shoes.jpg && ls -l media/uploads
echo hacked >> config/bazaar.conf
```

**Expected output:**

```
www-data
-rw-r--r-- 1 www-data www-data 6 Nov 21 11:27 red_running_shoes.jpg
bash: config/bazaar.conf: Permission denied
```

As root, see every folder on the way to the config, with its permissions:

```bash
namei -l /srv/bazaar/config/bazaar.conf
```

## Task 9: sudo

As **asha**: `cat /etc/shadow` (denied), then `sudo head -c 20 /etc/shadow` and `sudo whoami` (works: `root`).
As **ravi**: `sudo whoami`, and type the password `ravi`.

**Expected output** (as ravi):

```
[sudo] password for ravi:
ravi is not in the sudoers file.
```

Look at why asha may: as root, `cat /etc/sudoers.d/asha`. Also look at `ls -l /usr/bin/sudo /usr/bin/passwd`: the `s` is the setuid bit.

## Task 10 (optional, Going deeper): umask

As **asha**:

```bash
cd ~
umask
touch a.txt; mkdir d; ls -l
umask 077
touch b.txt; mkdir d2; ls -l b.txt; ls -ld d2
```

**Expected output** (in part):

```
0022
-rw-r--r-- 1 asha asha    0 Nov 21 11:27 a.txt
drwxr-xr-x 2 asha asha 4096 Nov 21 11:27 d
-rw------- 1 asha asha 0 Nov 21 11:27 b.txt
drwx------ 2 asha asha 4096 Nov 21 11:27 d2
```

## Task 11: What 777 really means

As **root**: `chmod 777 config/bazaar.conf`. As **ravi**: `echo "sale = 99% off" >> config/bazaar.conf; tail -1 config/bazaar.conf`.
The intern just changed Bazaar's prices. As **root**, undo it: `chmod 644 config/bazaar.conf`, and remove that line with `nano`.

## Check your work

From your laptop:

```bash
bash test_lab.sh
```

**Expected output:**

```
Starting lab (builds the image the first time)...
PASS: users: asha is in bazaar; ravi is not
PASS: the starting mistake: ravi can read .env (644)
PASS: after chmod 640 root:bazaar: asha reads it, ravi and www-data can't
PASS: chmod u+x,g+w,o-r on 644 gives 760
PASS: folder with x but no r: can't list, can open a known name
PASS: deleting depends on the folder: ravi deleted root's read-only file in a 777 folder
PASS: sticky /tmp: ravi can't delete root's file
PASS: www-data can write uploads/, not config/
PASS: sudo: asha may, ravi may not
PASS: umask 077: new files 600, new folders 700
ALL CHECKS PASSED
```

## Stuck?

- **`Permission denied` where you expected success**: check `whoami` (are you the user you think?) and `id` (groups), then `ls -l`
  on the file and `namei -l` on its path.
- **Group changes don't apply to an open shell**: a shell gets its groups when it starts. `exit` and open a new one.

## Clean up

```bash
docker compose down
```
