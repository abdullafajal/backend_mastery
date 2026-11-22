# Lab 02-07: Keep Bazaar running with systemd

**Goal:** run Bazaar's web backend as a systemd service, watch systemd restart it after a crash, read its logs
with `journalctl`, make it start at boot, and fix a broken service by reading the journal.

**Time:** about 30 minutes.

**You need:** Docker running.

## How this lab works

One container plays Bazaar's Linux server. Inside it, **systemd** runs as PID 1, just like on a real server.

| File | What it is |
| --- | --- |
| `app/server.py` | Bazaar's small web backend (answers on port 8000) |
| `etc/bazaar-web.service` | the **unit file**: tells systemd how to run the backend |
| `etc/bazaar.env` | its settings (`PORT`, `SALE`) |

The container runs in `privileged` mode, because systemd needs to manage the whole "machine".
That is fine for a lab on your own computer. Never run real apps like this.

```bash
docker compose up -d --build
docker compose exec server bash
```

You are now `root` on `bazaar-server`. Every command below runs there, unless it says "on your computer".

## Task 1: Look at the unit file and start the service

```bash
systemctl cat bazaar-web
```

**Expected output:**

```
# /etc/systemd/system/bazaar-web.service
# /etc/systemd/system/bazaar-web.service: how systemd runs Bazaar's web backend.
[Unit]
Description=Bazaar web backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/srv/bazaar
EnvironmentFile=/etc/bazaar/bazaar.env
ExecStart=/usr/local/bin/python3 /srv/bazaar/server.py
Restart=on-failure
RestartSec=2

[Install]
WantedBy=multi-user.target
```

It is not running yet:

```bash
systemctl status bazaar-web --no-pager
```

```
○ bazaar-web.service - Bazaar web backend
     Loaded: loaded (/etc/systemd/system/bazaar-web.service; disabled; preset: enabled)
     Active: inactive (dead)
```

Start it, then check again:

```bash
systemctl start bazaar-web
systemctl status bazaar-web --no-pager
```

**Expected output** (your times, PIDs and IDs will differ):

```
● bazaar-web.service - Bazaar web backend
     Loaded: loaded (/etc/systemd/system/bazaar-web.service; disabled; preset: enabled)
     Active: active (running) since Sat 2026-11-21 12:09:38 UTC; 1s ago
 Invocation: c1c3699931724027b06b414e89091e85
   Main PID: 94 (python3)
      Tasks: 1 (limit: 4695)
     Memory: 13M (peak: 14.2M)
        CPU: 252ms
     CGroup: /docker/87dedd0760061f46aa347b8f0df9388a4ae6effbfb90f67961c051df55b8e3d6/system.slice/bazaar-web.service
             └─94 /usr/local/bin/python3 /srv/bazaar/server.py

Nov 21 12:09:38 bazaar-server systemd[1]: Started bazaar-web.service - Bazaar web backend.
Nov 21 12:09:38 bazaar-server python3[94]: bazaar-web starting on port 8000, PID 94, sale=diwali
```

On your computer, in another terminal:

```bash
curl localhost:8000
```

```
{"service": "bazaar-web", "pid": 94, "sale": "diwali"}
```

`sale=diwali` came from `bazaar.env`, through the `EnvironmentFile=` line.

## Task 2: Crash it, and watch systemd bring it back

Kill the backend the hard way, as if it crashed:

```bash
kill -9 $(systemctl show -p MainPID --value bazaar-web)
sleep 3
systemctl status bazaar-web --no-pager | head -5
```

**Expected output:** a **new** Main PID.

```
● bazaar-web.service - Bazaar web backend
     Loaded: loaded (/etc/systemd/system/bazaar-web.service; disabled; preset: enabled)
     Active: active (running) since Sat 2026-11-21 12:09:41 UTC; 843ms ago
 Invocation: 8ece34e824664080803a8e9db63eb61e
   Main PID: 117 (python3)
```

## Task 3: Read what happened in the journal

```bash
journalctl -u bazaar-web --no-pager -n 8
```

**Expected output:**

```
Nov 21 12:09:38 bazaar-server systemd[1]: Started bazaar-web.service - Bazaar web backend.
Nov 21 12:09:38 bazaar-server python3[94]: bazaar-web starting on port 8000, PID 94, sale=diwali
Nov 21 12:09:39 bazaar-server python3[94]: request "GET / HTTP/1.1" 200 -
Nov 21 12:09:39 bazaar-server systemd[1]: bazaar-web.service: Main process exited, code=killed, status=9/KILL
Nov 21 12:09:39 bazaar-server systemd[1]: bazaar-web.service: Failed with result 'signal'.
Nov 21 12:09:41 bazaar-server systemd[1]: bazaar-web.service: Scheduled restart job, restart counter is at 1.
Nov 21 12:09:41 bazaar-server systemd[1]: Started bazaar-web.service - Bazaar web backend.
Nov 21 12:09:42 bazaar-server python3[117]: bazaar-web starting on port 8000, PID 117, sale=diwali
```

Lines from `systemd[1]` are systemd talking. Lines from `python3[...]` are Bazaar's own `print()` output.

Now visit `http://localhost:8000/products` on your computer, then show just the messages:

```bash
journalctl -u bazaar-web --no-pager -o cat -n 3
```

```
Started bazaar-web.service - Bazaar web backend.
bazaar-web starting on port 8000, PID 117, sale=diwali
request "GET /products HTTP/1.1" 200 -
```

Try `journalctl -u bazaar-web -f` too (follow live, like `tail -f`). Press `Ctrl+C` to stop.

## Task 4: Start at boot with `enable`

```bash
systemctl enable bazaar-web
```

**Expected output:**

```
Created symlink '/etc/systemd/system/multi-user.target.wants/bazaar-web.service' → '/etc/systemd/system/bazaar-web.service'.
```

Now "reboot" the server. Type `exit`, then on your computer:

```bash
docker compose restart
docker compose exec server systemctl is-active bazaar-web
```

**Expected output:** `active`. Nobody started it by hand: systemd did it at boot.

## Task 5: Stop it

```bash
docker compose exec server bash
systemctl stop bazaar-web
systemctl is-active bazaar-web
journalctl -u bazaar-web --no-pager -n 2 -o cat
```

**Expected output:**

```
inactive
bazaar-web.service: Deactivated successfully.
Stopped bazaar-web.service - Bazaar web backend.
```

`Restart=on-failure` does not bring it back, because you stopped it on purpose.

## Task 6 (optional, Going deeper): Fix a broken service

Make a typo on purpose with a **drop-in** file (a small file that overrides part of the unit):

```bash
mkdir -p /etc/systemd/system/bazaar-web.service.d
printf "[Service]\nExecStart=\nExecStart=/usr/local/bin/python3 /srv/bazaar/serverr.py\n" > /etc/systemd/system/bazaar-web.service.d/typo.conf
systemctl daemon-reload
systemctl start bazaar-web
sleep 1
systemctl is-active bazaar-web
```

**Expected output:** `activating` (it keeps crashing and restarting). Ask the journal why:

```bash
journalctl -u bazaar-web --no-pager -n 4 -o cat
```

```
Started bazaar-web.service - Bazaar web backend.
/usr/local/bin/python3: can't open file '/srv/bazaar/serverr.py': [Errno 2] No such file or directory
bazaar-web.service: Main process exited, code=exited, status=2/INVALIDARGUMENT
bazaar-web.service: Failed with result 'exit-code'.
```

Fix it:

```bash
rm -r /etc/systemd/system/bazaar-web.service.d
systemctl daemon-reload
systemctl reset-failed bazaar-web
systemctl restart bazaar-web
sleep 1
systemctl is-active bazaar-web
```

**Expected output:** `active`.

## Task 7 (optional): Old-style log files

Not every program writes to the journal. Some still write plain files in `/var/log`:

```bash
ls /var/log
```

```
README
alternatives.log
apt
btmp
dpkg.log
journal
lastlog
private
wtmp
```

`dpkg.log` records every package installed. `journal/` is where the journal itself is stored.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output** (the PIDs will differ):

```
Starting lab (builds the image the first time)...
PASS: systemd is PID 1 and the system is running
PASS: systemctl start runs Bazaar; settings come from the EnvironmentFile
PASS: after kill -9, systemd restarted it (PID 95 -> 107)
PASS: the app's output is in the journal (journalctl -u)
PASS: systemctl stop stops it, and it stays stopped
PASS: enabled: it starts again after a reboot
PASS: a broken service: the journal says exactly what's wrong
ALL CHECKS PASSED
```

## Stuck?

- **`systemctl status` shows `activating (auto-restart)`**: the program keeps crashing. Read the reason with
  `journalctl -u bazaar-web -n 20`.
- **You edited the unit file but nothing changed**: run `systemctl daemon-reload`, then `systemctl restart bazaar-web`.
- **`curl: (7) Failed to connect`**: the service is stopped, or port 8000 is taken on your computer. Start the lab
  on another port: `BAZAAR_PORT=8080 docker compose up -d`, then `curl localhost:8080`.

## Clean up

```bash
docker compose down
```
