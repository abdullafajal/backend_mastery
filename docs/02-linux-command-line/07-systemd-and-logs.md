# systemd and logs

<div class="bz-meta" markdown>
**Module** 2 · Linux and the command line
**Lesson** 7
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's web backend as a real Linux service: it restarts itself after a crash, starts at boot, and keeps its logs in one place
</div>

!!! abstract "In 1 minute"
    - On a server, nobody sits at the keyboard to restart Bazaar when it crashes. **systemd** does it: it's the program that starts and watches every other program.
    - You describe your app once in a small text file, the **unit file**: what to run, as which user, and "restart it if it fails".
    - `systemctl start / stop / status / enable` controls it. `enable` means "start it at every boot".
    - Everything your app prints goes to the **journal**. Read it with `journalctl -u bazaar-web`.
    - In the lab, you crash Bazaar with `kill -9` and watch systemd bring it back in 2 seconds.

> **Previously in Bazaar:** you can log in to Bazaar's server with SSH, using a key instead of a password.

## 1. Why learn this?

Last week, Bazaar's backend crashed at 2 a.m. Nobody noticed until 9 a.m. Seven hours of "site not working" for every customer.

And after the server rebooted for an update, Bazaar didn't come back at all, because someone had started it by hand in a terminal.

A real server needs a manager that **starts** your app, **restarts** it when it crashes, starts it **after a reboot**, and **keeps its logs**.
On almost every Linux server, that manager is systemd.

## 2. The concept

### systemd: the manager of all programs

When Linux boots, the very first program it starts is **systemd**. It gets process ID 1 (PID 1, Module 1).
Then systemd starts everything else: the network, SSH, the database, and your app.

A program that systemd runs in the background, all the time, is called a **service**.
Bazaar's web backend will be the service `bazaar-web`.

### The unit file: the instructions

You tell systemd about your service with a small text file, the **unit file**. It lives in `/etc/systemd/system/` and ends in `.service`.

The most important lines:

| Line | Meaning |
| --- | --- |
| `ExecStart=/usr/local/bin/python3 /srv/bazaar/server.py` | the command to run |
| `User=www-data` | run as this user, not root (Lesson 3) |
| `EnvironmentFile=/etc/bazaar/bazaar.env` | load settings from this file (Lesson 5) |
| `Restart=on-failure` | if it crashes, start it again |

You'll see the whole file in part 4.

### systemctl: talking to systemd

`systemctl` is the command you use to give systemd orders:

```bash
systemctl start bazaar-web     # start it now
systemctl status bazaar-web    # is it running? since when? last few log lines
systemctl stop bazaar-web      # stop it now
systemctl restart bazaar-web   # stop + start, e.g. after an update
```

`status` shows a green dot `●` and `active (running)` when all is well:

```
● bazaar-web.service - Bazaar web backend
     Loaded: loaded (/etc/systemd/system/bazaar-web.service; disabled; preset: enabled)
     Active: active (running) since Sat 2026-11-21 12:09:38 UTC; 1s ago
   Main PID: 94 (python3)
```

(Real output, a few lines shortened. Part 5 shows all of it.)

### enable: start at every boot

`start` runs it **now**. It does not mean "after the next reboot too". For that, there is a separate command:

```bash
systemctl enable bazaar-web    # start it at every boot from now on
systemctl disable bazaar-web   # stop doing that
```

Look at the `Loaded:` line above: it says `disabled`. After `enable`, it says `enabled`.
On a real server you almost always want both: `start` (now) and `enable` (at boot).

### The journal: all the logs in one place

Anything your app prints (`print()` in Python) is caught by systemd and saved in the **journal**: one big, searchable log for the whole server.

```bash
journalctl -u bazaar-web           # all logs of this service (-u = "unit")
journalctl -u bazaar-web -n 20     # only the last 20 lines
journalctl -u bazaar-web -f        # follow live, like tail -f (Ctrl+C to stop)
```

You don't need to build your own log files. Print useful lines, and the journal keeps them, with the time.

### An analogy

systemd is the **manager of a shop** who opens it every morning.

- The unit file is the **instruction card** on the wall: "Open the shutter, switch on the lights, run the till."
- `Restart=on-failure` is "if the till freezes, switch it off and on again".
- `enable` is putting the job on the **daily opening list**, so it happens even when you are on leave.
- The journal is the shop's **diary**: every event, with the time.

### Questions you may have

**Is this like running `python3 server.py &` in the background?** No. A `&` job (Lesson 5) dies with your terminal, does not restart after a crash,
and does not come back after a reboot. A service does all three.

**Do I need root?** Yes, to start, stop or enable system services. On a real server you would type `sudo systemctl ...`. In the lab you are already root.

**Does every Linux server have systemd?** Almost every one: Ubuntu, Debian, Fedora, Red Hat and more. Tiny containers usually don't, because Docker
itself plays the manager there (Module 5).

**Where are old-style log files?** In `/var/log`. Some programs still write there. The journal is stored there too, in `/var/log/journal`.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="systemd-lifecycle"></div>

## 4. Code example

This is the lab's unit file, word for word. Comments in a unit file must be on their own line, starting with `#`.

```ini title="bazaar-web.service"
--8<-- "labs/02-linux-command-line/07-systemd-and-logs/etc/bazaar-web.service"
```

What each part means:

- **`[Unit]`**: about the service. `Description` is the name `status` shows. `After=network.target` = start it after the network is up.
- **`[Service]`**: how to run it. `WorkingDirectory` is the folder it runs in. `RestartSec=2` = wait 2 seconds before restarting.
- **`[Install]`**: used by `enable`. `WantedBy=multi-user.target` means "start me during a normal boot".

And the settings file it loads:

```bash title="bazaar.env"
--8<-- "labs/02-linux-command-line/07-systemd-and-logs/etc/bazaar.env"
```

The app itself is a tiny web server. It prints one line when it starts and one per request. It reads `PORT` and `SALE` from its environment:

```python title="server.py"
--8<-- "labs/02-linux-command-line/07-systemd-and-logs/app/server.py"
```

Start it and ask it something (real output):

```
$ systemctl start bazaar-web
$ curl localhost:8000
{"service": "bazaar-web", "pid": 94, "sale": "diwali"}
```

`sale=diwali` came from `bazaar.env`. systemd loaded it for you.

## 5. Under the hood

### A crash, and the restart

Let's crash Bazaar on purpose. `kill -9` stops a program instantly, like pulling the plug (Module 1):

```bash
kill -9 $(systemctl show -p MainPID --value bazaar-web)
```

Three seconds later, `systemctl status` shows a **new** Main PID (`117` instead of `94`). The journal tells the whole story:

```
$ journalctl -u bazaar-web --no-pager -n 8
Nov 21 12:09:38 bazaar-server systemd[1]: Started bazaar-web.service - Bazaar web backend.
Nov 21 12:09:38 bazaar-server python3[94]: bazaar-web starting on port 8000, PID 94, sale=diwali
Nov 21 12:09:39 bazaar-server python3[94]: request "GET / HTTP/1.1" 200 -
Nov 21 12:09:39 bazaar-server systemd[1]: bazaar-web.service: Main process exited, code=killed, status=9/KILL
Nov 21 12:09:39 bazaar-server systemd[1]: bazaar-web.service: Failed with result 'signal'.
Nov 21 12:09:41 bazaar-server systemd[1]: bazaar-web.service: Scheduled restart job, restart counter is at 1.
Nov 21 12:09:41 bazaar-server systemd[1]: Started bazaar-web.service - Bazaar web backend.
Nov 21 12:09:42 bazaar-server python3[117]: bazaar-web starting on port 8000, PID 117, sale=diwali
```

How to read it:

- Each line: **time**, **server name**, **who wrote it** (`systemd[1]` or `python3[94]`), and the **message**.
- `python3[94]` lines are Bazaar's own `print()` output.
- `systemd[1]` lines are systemd reporting: killed (`9/KILL`) at 12:09:39, restarted 2 seconds later at 12:09:41.

`-o cat` hides the time and name, and shows only the messages:

```
$ journalctl -u bazaar-web --no-pager -o cat -n 3
Started bazaar-web.service - Bazaar web backend.
bazaar-web starting on port 8000, PID 117, sale=diwali
request "GET /products HTTP/1.1" 200 -
```

### enable, and a reboot

```
$ systemctl enable bazaar-web
Created symlink '/etc/systemd/system/multi-user.target.wants/bazaar-web.service' → '/etc/systemd/system/bazaar-web.service'.
```

`enable` just makes a **symlink** (a shortcut file, Module 1) in a folder systemd reads at boot. In the lab, after a "reboot"
(`docker compose restart`), `systemctl is-active bazaar-web` prints `active`, and nobody started it by hand.

### A stop is not a failure

```
$ systemctl stop bazaar-web
$ systemctl is-active bazaar-web
inactive
$ journalctl -u bazaar-web --no-pager -n 2 -o cat
bazaar-web.service: Deactivated successfully.
Stopped bazaar-web.service - Bazaar web backend.
```

`Restart=on-failure` doesn't fire here: you stopped it on purpose, so it stays stopped.

??? note "Going deeper: when the service won't start"

    In the lab's optional task, you break `ExecStart` with a typo (`serverr.py`). Now `systemctl is-active` says `activating`:
    the program dies at once, systemd restarts it, it dies again, in a loop. The journal says exactly why:

    ```
    $ journalctl -u bazaar-web --no-pager -n 4 -o cat
    Started bazaar-web.service - Bazaar web backend.
    /usr/local/bin/python3: can't open file '/srv/bazaar/serverr.py': [Errno 2] No such file or directory
    bazaar-web.service: Main process exited, code=exited, status=2/INVALIDARGUMENT
    bazaar-web.service: Failed with result 'exit-code'.
    ```

    The habit to build: **service broken → `journalctl -u <name> -n 50` first.** The answer is almost always in the last lines.

    After you fix the file, you always need two more commands:

    - `systemctl daemon-reload`: systemd re-reads unit files from disk. Without it, it keeps using the old version.
    - `systemctl reset-failed bazaar-web`: clears the "failed" mark and the restart counter.

    If a program crashes too often in a short time (by default, 5 starts in 10 seconds), systemd gives up and marks it `failed`.
    The settings `StartLimitBurst=` and `StartLimitIntervalSec=` in `[Unit]` change this.

??? note "Going deeper: drop-in files and systemctl edit"

    You should not edit a unit file that a package installed (in `/lib/systemd/system/`): the next update overwrites it.
    Instead, add a **drop-in**: a small file in `/etc/systemd/system/<name>.service.d/*.conf` that overrides only some lines.

    `sudo systemctl edit bazaar-web` creates one for you and runs `daemon-reload` when you save.
    `systemctl cat bazaar-web` shows the unit file plus all its drop-ins, in order.

    To replace `ExecStart`, a drop-in must first clear it with an empty `ExecStart=` line, because a service may have
    a list of them. That's why the lab's broken drop-in has two `ExecStart` lines.

??? note "Going deeper: more journalctl"

    | Command | Shows |
    | --- | --- |
    | `journalctl -u bazaar-web --since "10 min ago"` | only recent lines (also `--since today`, `--since "2026-11-21 12:00"`) |
    | `journalctl -u bazaar-web -p err` | only errors and worse (priority levels: `emerg` … `err`, `warning`, `info`, `debug`) |
    | `journalctl -b` | everything since this boot (`-b -1` = the boot before) |
    | `journalctl -u bazaar-web -o json-pretty -n 1` | one entry with all its hidden fields |
    | `journalctl --disk-usage` | how much space the journal takes |

    In a container, `journalctl -p err` may also show lines from the **host's** kernel, because containers share the kernel (Module 5).
    They have nothing to do with Bazaar.

    The journal is stored in binary files in `/var/log/journal/`, so you can't `cat` it: always use `journalctl`.
    Old entries are deleted automatically when the journal gets too big (`SystemMaxUse=` in `/etc/systemd/journald.conf`).

??? note "Going deeper: Restart= options, and how stop really works"

    | `Restart=` | Restarts when… |
    | --- | --- |
    | `no` (default) | never |
    | `on-failure` | it exits with an error code, is killed by a signal, or times out |
    | `always` | it exits for any reason, even a clean exit (but not `systemctl stop`) |

    `systemctl stop` first sends `SIGTERM` (the polite "please finish and exit", Module 1). If the program is still alive after
    `TimeoutStopSec=` (90 s by default), systemd sends `SIGKILL`. A good backend catches `SIGTERM`, finishes the requests it is
    serving, and exits. That matters a lot during a Diwali sale, when every request is an order.

    Other useful lines: `Type=` (how systemd knows the app is "ready"), `MemoryMax=` (a memory limit), and timers
    (`.timer` units, the modern way to run a job on a schedule, like cron).

??? note "Going deeper: why this lab uses a privileged container"

    systemd expects to be PID 1 of a whole machine and to manage cgroups (Linux's way of grouping processes and limiting their resources).
    A normal container can't do that, so the lab runs with `privileged: true` and `cgroup: host`, with `/sbin/init` as its command.

    That gives the container almost full power over your computer. It's fine for a lab, but never run real apps like this.
    In Module 5 you'll see the normal way: one app per container, and Docker (not systemd) restarts it.

## 6. Lab

**Lab folder:** `labs/02-linux-command-line/07-systemd-and-logs/`

```bash
cd labs/02-linux-command-line/07-systemd-and-logs
docker compose up -d --build
docker compose exec server bash
```

You're root on a pretend Bazaar server where systemd is PID 1. Look at the unit file with `systemctl cat bazaar-web`, start the service,
and `curl localhost:8000` from your computer. Then crash it with `kill -9` and watch it come back, read the story in `journalctl`,
`enable` it and survive a "reboot" (`docker compose restart`), and stop it. The optional last task breaks the service on purpose,
so you can practise reading the journal to fix it.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Running the backend by hand in a terminal on the server.** It dies when you log out, and never comes back after a crash. **Fix:** make it a service.
2. **`start` without `enable`.** It works today, and is gone after the next reboot. **Fix:** `systemctl enable bazaar-web` too (`enable --now` does both).
3. **Editing the unit file and forgetting `daemon-reload`.** systemd keeps using the old version. **Fix:** `systemctl daemon-reload`, then `systemctl restart bazaar-web`.
4. **Guessing why a service fails.** **Fix:** read `journalctl -u bazaar-web -n 50` first. The reason is almost always there.
5. **Running the service as root.** A bug in the app now has full power over the server. **Fix:** `User=www-data` (or a user just for Bazaar).

## 8. Quiz

<div class="bz-quiz" data-quiz="m02-07"></div>

## 9. What's next

Module 2 is complete! Next, in Module 3, Bazaar's code gets a history and a home: [Git and GitHub](../03-git-and-github/index.md).

**In one line:** systemd runs your app as a service from a unit file; `systemctl start/stop/status/enable` controls it,
`Restart=on-failure` brings it back after a crash, and `journalctl -u` reads its logs.

### Cheat sheet

| Task | Command |
| --- | --- |
| Start / stop / restart | `systemctl start bazaar-web` / `stop` / `restart` |
| Is it running? | `systemctl status bazaar-web` (or `is-active`) |
| Start at every boot | `systemctl enable bazaar-web` (`enable --now` = enable + start) |
| Show the unit file | `systemctl cat bazaar-web` |
| After editing a unit file | `systemctl daemon-reload` |
| All logs of a service | `journalctl -u bazaar-web` |
| Last 50 lines / follow live | `journalctl -u bazaar-web -n 50` / `-f` |
| Only messages | `journalctl -u bazaar-web -o cat` |
| Old-style log files | `ls /var/log` |

| Unit file line | Meaning |
| --- | --- |
| `ExecStart=` | the command to run |
| `User=` | run as this user |
| `EnvironmentFile=` | load settings from a file |
| `Restart=on-failure` + `RestartSec=2` | restart after a crash, 2 s later |
| `WantedBy=multi-user.target` | what `enable` hooks into: a normal boot |

> **Next in Bazaar:** Bazaar now runs safely on its server. But its code lives only on one developer's laptop. One spilled cup of chai and it's gone.
> Time to give the code a history and a backup: Git.

<div class="bz-complete" data-lesson="m02-07"></div>
