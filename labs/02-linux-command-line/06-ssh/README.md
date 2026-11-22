# Lab 02-06: SSH from your "laptop" to Bazaar's server

**Goal:** log in to a server with a password, then switch to a key, run a command remotely, copy files, add a shortcut,
and recognise the most common SSH errors.

**Time:** about 30 minutes.

**You need:** Docker running.

## How this lab works

Two containers play two computers:

| Container | Plays | Details |
| --- | --- | --- |
| `laptop` | your computer | has `ssh`, `scp`, `ssh-keygen` |
| `bazaar-server` | Bazaar's server | runs an SSH server; user `asha`, password **`asha-lab`** (this lab only!) |

```bash
docker compose up -d --build
docker compose exec laptop bash
```

In a **second** terminal, watch the server's log while you work:

```bash
docker compose logs -f bazaar-server
```

## Task 1: Log in with a password

On the laptop:

```bash
ssh asha@bazaar-server
```

**Expected output:**

```
The authenticity of host 'bazaar-server (172.18.0.2)' can't be established.
ED25519 key fingerprint is SHA256:pVFtw/I6UTLDNHVuEOIGKKPKSfTkUhhVAr1LHR9Txts.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])?
```

Type `yes`, then the password `asha-lab` (it won't show while you type). Your fingerprint and address will differ.
You're now on the server: try `hostname`, `whoami`, `ls /srv/bazaar/logs`. Then `exit`.

In the log terminal: `Accepted password for asha from ...`.

## Task 2: A wrong password

```bash
ssh asha@bazaar-server
```

Type a wrong password. **Expected output:** `Permission denied, please try again.` Press `Ctrl+C`.
The server's log shows `Failed password for asha from ...`.

## Task 3: Make a key pair and copy it

```bash
ssh-keygen -t ed25519
```

Press `Enter` three times (default file, no passphrase). Then:

```bash
ls -l ~/.ssh
ssh-copy-id asha@bazaar-server
```

`ssh-copy-id` asks for the password one last time. **Expected output** (the end):

```
Now try logging into the machine, with: "ssh -i /root/.ssh/id_ed25519 'asha@bazaar-server'"
and check to make sure that only the key(s) you wanted were added.
```

## Task 4: Log in with the key

```bash
ssh asha@bazaar-server "whoami; ls -la ~/.ssh"
```

**Expected output:** no password question, then `asha` and the server's `authorized_keys` file (`-rw-------`).
The log terminal shows `Accepted publickey for asha from ...`.

## Task 5: Run a command remotely

```bash
ssh asha@bazaar-server "grep -c failed /srv/bazaar/logs/order_20261121.log"
ssh asha@bazaar-server "cat /srv/bazaar/logs/order_20261121.log" | wc -l
```

**Expected output:**

```
1
3
```

In the second line, `cat` ran on the server, and `wc -l` ran on the laptop: the pipe (Lesson 4) crosses the network.

## Task 6: Copy files with scp

```bash
echo "sale = diwali" > bazaar.conf
scp bazaar.conf asha@bazaar-server:/home/asha/
scp asha@bazaar-server:/srv/bazaar/logs/order_20261121.log .
ls
ssh asha@bazaar-server "ls /home/asha"
```

**Expected output:** `bazaar.conf` and `order_20261121.log` on the laptop; `bazaar.conf` on the server.

## Task 7: A shortcut in ~/.ssh/config

```bash
printf "Host bazaar\n    HostName bazaar-server\n    User asha\n" > ~/.ssh/config
ssh bazaar "echo hello from \$(hostname) as \$(whoami)"
```

**Expected output:**

```
hello from bazaar-server as asha
```

## Task 8: A private key that's too open

```bash
chmod 644 ~/.ssh/id_ed25519
ssh bazaar hostname
```

**Expected output** (in part):

```
WARNING: UNPROTECTED PRIVATE KEY FILE!
Permissions 0644 for '/root/.ssh/id_ed25519' are too open.
```

SSH then falls back to asking for the password. Press `Ctrl+C`, and fix it:

```bash
chmod 600 ~/.ssh/id_ed25519
ssh bazaar hostname
```

## Check your work

From your laptop (the real one, not the container):

```bash
bash test_lab.sh
```

**Expected output:**

```
Starting lab (builds the images the first time)...
PASS: password login works; the host key is remembered
PASS: wrong password is refused
PASS: key login works without a password (BatchMode)
PASS: a 644 private key is ignored (UNPROTECTED PRIVATE KEY FILE)
PASS: a command runs on the server and its answer comes back
PASS: scp copies both ways
PASS: ~/.ssh/config: ssh bazaar is enough
PASS: the server's log records every login
ALL CHECKS PASSED
```

## Stuck?

- **`ssh: connect to host bazaar-server port 22: Connection refused`**: the server container is still starting. Wait a few seconds.
- **`Permission denied (publickey,password)`**: wrong user name, wrong password, or your key wasn't copied. Try `ssh -v asha@bazaar-server`.
- **`WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!`** after rebuilding the lab: the server got a new host key. In this lab only,
  remove the old one with `ssh-keygen -R bazaar-server`. On a real server, ask why it changed first.

## Clean up

```bash
docker compose down
```
