# SSH

<div class="bz-meta" markdown>
**Module** 2 · Linux and the command line
**Lesson** 6
**Reading time** 15 min (+ optional deeper parts)
**You will build** a login from your "laptop" to Bazaar's server: first with a password, then with a key, plus copying files and a handy shortcut
</div>

!!! abstract "In 1 minute"
    - **SSH** lets you open a terminal on a server far away, over an encrypted (scrambled) connection: `ssh asha@bazaar-server`.
    - The first time, SSH asks you to trust the server's ID. Type `yes`; it remembers it in `~/.ssh/known_hosts`.
    - Better than a password: a **key pair**. `ssh-keygen` makes it, `ssh-copy-id` puts the **public** key on the server. The **private** key never leaves your laptop.
    - `scp` copies files to and from the server. `~/.ssh/config` gives a server a short name, so `ssh bazaar` is enough.
    - In the lab, you do all of this between two containers: a "laptop" and Bazaar's server.

> **Previously in Bazaar:** you learned to pass settings with environment variables, install software, and run jobs in the background.

## 1. Why learn this?

Bazaar's server lives in a data centre, hundreds of kilometres away. You can't plug in a keyboard. Everything you learned in this module
(the shell, files, permissions, pipes) happens **over SSH**.

And two things go wrong all the time:

1. Someone keeps logging in with a weak password, and attackers on the internet try thousands of passwords per hour against every server.
2. A new developer gets `Permission denied (publickey)` and has no idea why.

This lesson shows how SSH logs you in, how to switch to keys (safer and faster), and how to fix the common errors.

## 2. The concept

### Logging in to a server

```bash
ssh asha@bazaar-server
```

- `asha` is the **user** on the server (Lesson 3).
- `bazaar-server` is the server's name (or its IP address).
- SSH talks to port **22** on the server (Module 1, Lesson 5).

Everything you type travels **encrypted**: scrambled, so nobody on the network can read it, not even your password.
When you see the server's prompt, you're in. `exit` (or `Ctrl+D`) logs out.

You can also run **one** command on the server and get its answer back, without logging in:

```
$ ssh asha@bazaar-server "grep -c failed /srv/bazaar/logs/order_20261121.log"
1
```

### The first time: "Are you sure?"

The very first time you connect to a server, SSH shows its **fingerprint** (a short ID of the server's key) and asks:

```
The authenticity of host 'bazaar-server (172.18.0.2)' can't be established.
ED25519 key fingerprint is SHA256:pVFtw/I6UTLDNHVuEOIGKKPKSfTkUhhVAr1LHR9Txts.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'bazaar-server' (ED25519) to the list of known hosts.
```

This protects you from an **impostor**: a machine pretending to be Bazaar's server to steal your password.
After `yes`, SSH remembers the server in `~/.ssh/known_hosts`. If that ID ever **changes**, SSH refuses loudly. Then don't just
click through: ask whoever runs the server why it changed.

### Keys: better than passwords

A **key pair** is two linked files:

| File | Where it lives | Like... |
| --- | --- | --- |
| **private key** (`~/.ssh/id_ed25519`) | only on **your laptop**, secret | your own key |
| **public key** (`~/.ssh/id_ed25519.pub`) | copied to every server you want to enter | a lock that only your key opens |

Setting it up takes two commands:

```bash
ssh-keygen -t ed25519              # 1. make the key pair (press Enter to accept the defaults)
ssh-copy-id asha@bazaar-server     # 2. put the public key on the server (asks for the password one last time)
```

From now on, `ssh asha@bazaar-server` logs you in **without a password**. On the server, your public key is now in
`/home/asha/.ssh/authorized_keys`: the list of keys allowed to log in as asha.

Why it's safer:

- An attacker can't guess a key the way they guess a password.
- Your private key is never sent to the server, so a fake server can't steal it.
- Once every developer uses keys, the server can turn password logins **off** completely (see the Going-deeper box).

The one rule: **keep the private key private.** SSH even checks: if the private key file can be read by other users, it refuses to use it.

### Copying files: `scp`

`scp` works like `cp`, but one side is on the server, written as `user@server:path`:

```bash
scp bazaar.conf asha@bazaar-server:/home/asha/                        # laptop → server
scp asha@bazaar-server:/srv/bazaar/logs/order_20261121.log .         # server → laptop (. = here)
```

### A short name: `~/.ssh/config`

Typing `asha@bazaar-server` every time gets old. Put this in `~/.ssh/config` on your laptop:

```
Host bazaar
    HostName bazaar-server
    User asha
```

Now `ssh bazaar` (and `scp file bazaar:/home/asha/`) is enough.

### An analogy

SSH with keys is like a bank locker. The bank (the server) keeps a copy of your **lock** (the public key). Only **your key** (the private key)
opens it, and you never hand your key to the bank: you just show that you can open the lock. The "Are you sure?" question is you checking the
bank's name board before walking in, so you don't hand anything to a fake bank.

### Questions you may have

**Can I use the same key for many servers?**
Yes. Copy the same public key to each one. Keep one private key per laptop, so you can remove a lost laptop's key easily.

**What is the passphrase that `ssh-keygen` asks for?**
An optional password that protects the private key file itself, in case your laptop is stolen. Recommended on real laptops.
(In the lab we leave it empty, to keep things simple.)

**Does SSH work from Windows?**
Yes: Windows 10 and 11 include the same `ssh`, `scp` and `ssh-keygen` commands, in PowerShell.

**What does `Permission denied (publickey)` mean?**
The server only accepts keys, and none of yours is in its `authorized_keys` for that user. Check the user name, and that your public key was copied.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="ssh-keys"></div>

## 4. Code example

The whole setup, from the "laptop", as you'll type it in the lab:

```bash
ssh asha@bazaar-server                          # 1. first login: answer "yes", then the password asha-lab
exit
ssh-keygen -t ed25519                           # 2. make your key pair (press Enter three times)
ssh-copy-id asha@bazaar-server                  # 3. copy the public key (password one last time)
ssh asha@bazaar-server "whoami"                 # 4. no password any more
```

Output of step 4:

```
asha
```

And the server's own log shows the difference (`docker compose logs bazaar-server`):

```
Accepted password for asha from 172.18.0.3 port 42706 ssh2
Accepted publickey for asha from 172.18.0.3 port 41726 ssh2: ED25519 SHA256:z4T2Bm1F40keaL0DcqLHKhJ3XIacNZaEkgKr1tjuZD0
```

## 5. Under the hood

### The files in ~/.ssh

On the laptop, after the steps above:

```
$ ls -l ~/.ssh
-rw------- 1 root root 399 Nov 21 11:58 id_ed25519          # private key: only you may read it (600)
-rw-r--r-- 1 root root  93 Nov 21 11:58 id_ed25519.pub      # public key: anyone may see it
-rw------- 1 root root 978 Nov 21 11:58 known_hosts         # servers you trust
```

On the server, in asha's home:

```
$ ls -la ~/.ssh
drwx------ 2 asha asha 4096 Nov 21 11:58 .
-rw------- 1 asha asha   93 Nov 21 11:58 authorized_keys
```

`authorized_keys` contains the same line as your `id_ed25519.pub`, starting with `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...`.

### When the private key is too open

```
$ chmod 644 ~/.ssh/id_ed25519
$ ssh asha@bazaar-server hostname
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
@         WARNING: UNPROTECTED PRIVATE KEY FILE!          @
@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
Permissions 0644 for '/root/.ssh/id_ed25519' are too open.
It is required that your private key files are NOT accessible by others.
This private key will be ignored.
Load key "/root/.ssh/id_ed25519": bad permissions
asha@bazaar-server: Permission denied (publickey,password).
```

The fix is Lesson 3's: `chmod 600 ~/.ssh/id_ed25519`.

### A wrong password

```
$ ssh asha@bazaar-server
asha@bazaar-server's password:
Permission denied, please try again.
```

And on the server: `Failed password for asha from 172.18.0.3 port 50250 ssh2`. On a real internet-facing server, this log fills up with
thousands of these from attackers. That's why keys, and turning passwords off, matter.

??? note "Going deeper: how the key login really works"
    1. The laptop says "I want to log in as asha, with this public key".
    2. The server looks for that public key in `/home/asha/.ssh/authorized_keys`.
    3. If it's there, the server sends a **challenge**: random data.
    4. The laptop **signs** the challenge with the private key and sends back only the signature.
    5. The server checks the signature with the public key. Only the matching private key could have made it. You're in.

    The private key is never sent anywhere. This is called **public-key cryptography**; you'll meet it again in HTTPS (Module 7) and in
    JWT tokens (Module 12). `ed25519` is the name of the key type: modern, short and fast. Older servers use `rsa` keys, which work the same way.

??? note "Going deeper: hardening a real server's SSH"
    In `/etc/ssh/sshd_config` on the server (then `sudo systemctl restart ssh`, Lesson 7):

    | Setting | Why |
    | --- | --- |
    | `PasswordAuthentication no` | only keys; password guessing becomes useless |
    | `PermitRootLogin no` | log in as yourself, then `sudo` (Lesson 3) |
    | `AllowUsers asha` | only these users may log in over SSH |

    **Before** you turn passwords off, make sure your key login works, from a second terminal that stays open, or you can lock yourself out.
    Many teams also add a firewall and a tool that blocks addresses after repeated failures (Module 23).

??? note "Going deeper: more ~/.ssh/config, and other tools"
    ```
    Host bazaar
        HostName 203.0.113.10        # an IP address works too
        User asha
        Port 2222                    # if the server's SSH isn't on port 22
        IdentityFile ~/.ssh/id_ed25519
    ```

    - `ssh -v bazaar` prints every step of the connection: the first thing to try when a login fails.
    - `rsync -av folder/ bazaar:/srv/folder/` copies only what changed, and is better than `scp` for big folders.
    - `ssh -L 5432:localhost:5432 bazaar` (a "tunnel") lets your laptop reach a database that only listens on the server's localhost (Module 17).

## 6. Lab

**Lab folder:** `labs/02-linux-command-line/06-ssh/`

```bash
cd labs/02-linux-command-line/06-ssh
docker compose up -d --build
docker compose exec laptop bash
```

You're on the "laptop". Log in to `bazaar-server` as `asha` (password `asha-lab`, for this lab only), answer the "Are you sure?" question,
make a key pair, copy it, log in without a password, run a command remotely, copy files with `scp`, add a shortcut to `~/.ssh/config`,
and see what happens when the private key is too open. Watch the server's log in a second terminal: `docker compose logs -f bazaar-server`.

When you finish, run `bash test_lab.sh` (from your laptop). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Sharing or copying the private key.** Anyone with it can log in as you. **Fix:** only the `.pub` file goes anywhere.
2. **Private key readable by others.** `UNPROTECTED PRIVATE KEY FILE`, and the key is ignored. **Fix:** `chmod 600 ~/.ssh/id_ed25519`.
3. **Answering `yes` to a changed host key without asking.** You might be talking to an impostor. **Fix:** confirm with whoever runs the server.
4. **Wrong user name.** `ssh bazaar-server` uses your **laptop's** user name, which may not exist on the server. **Fix:** `ssh asha@bazaar-server`, or `User` in `~/.ssh/config`.
5. **Turning off passwords before testing the key.** You lock yourself out. **Fix:** test key login first, keep a second session open.

## 8. Quiz

<div class="bz-quiz" data-quiz="m02-06"></div>

## 9. What's next

Next: keeping Bazaar running all the time, restarting it after crashes and reboots, and reading its logs: [systemd and logs](07-systemd-and-logs.md).

**In one line:** `ssh user@server` opens a terminal on a far-away server; use a key pair (`ssh-keygen`, `ssh-copy-id`), keep the private key private
(`600`), and use `scp` and `~/.ssh/config` to save time.

### Cheat sheet

| Task | Command |
| --- | --- |
| Log in | `ssh asha@bazaar-server` |
| Run one command remotely | `ssh asha@bazaar-server "command"` |
| Make a key pair | `ssh-keygen -t ed25519` |
| Put your public key on a server | `ssh-copy-id asha@bazaar-server` |
| Copy laptop → server / server → laptop | `scp f asha@srv:/path/` / `scp asha@srv:/path/f .` |
| Short name | `~/.ssh/config`: `Host bazaar` + `HostName` + `User` |
| See every step of a login | `ssh -v bazaar` |
| Fix key permissions | `chmod 600 ~/.ssh/id_ed25519`; `chmod 700 ~/.ssh` |
| Leave | `exit` or `Ctrl+D` |

| File | Where | Meaning |
| --- | --- | --- |
| `~/.ssh/id_ed25519` | laptop | private key: secret, `600` |
| `~/.ssh/id_ed25519.pub` | laptop → servers | public key |
| `~/.ssh/known_hosts` | laptop | servers you've trusted |
| `~/.ssh/authorized_keys` | server | public keys allowed to log in |

> **Next in Bazaar:** you can log in to the server. Now Bazaar itself must run there all the time, and come back on its own after a crash
> or a reboot. That's the job of `systemd`.

<div class="bz-complete" data-lesson="m02-06"></div>
