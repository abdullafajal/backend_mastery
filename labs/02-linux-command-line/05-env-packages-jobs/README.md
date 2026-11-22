# Lab 02-05: Environment variables, packages and background jobs

**Goal:** start Bazaar's settings script with its secret coming from the environment, pass settings with Docker Compose,
install a missing tool with apt, and run a slow import in the background.
Tasks marked *optional, Going deeper* match the lesson's Going-deeper boxes; skip them on your first try.

**Time:** about 30 minutes.

**You need:** Docker running, and an internet connection (Task 6 downloads a package).

## What is in this folder

| File | What it does |
| --- | --- |
| `app/settings.py` | reads `DB_HOST`, `DEBUG` and `DB_PASSWORD` from the environment |
| `app/import_products.py` | a slow job: imports 10 sellers, one per second |
| `app/bazaar.env` | settings for the `app` service (a lab-only, fake password) |
| `docker-compose.yml` | `shell` (a server shell) and `app` (runs `settings.py` with Compose settings) |
| `test_lab.sh` | Checks that everything works. |

Open the server shell (you land in `/srv/bazaar`):

```bash
docker compose run --rm shell
```

## Task 1: Look at the environment

```bash
echo "$HOME"
env | grep -E "^(HOME|HOSTNAME)="
```

**Expected output:**

```
/root
HOSTNAME=bazaar-server
HOME=/root
```

## Task 2: No password, no start

```bash
python3 settings.py
echo $?
```

**Expected output:**

```
ERROR: DB_PASSWORD is not set. Put it in the environment, never in the code.
1
```

## Task 3: export makes the difference

```bash
DB_PASSWORD=secret123
echo "the shell sees: $DB_PASSWORD"
python3 settings.py
export DB_PASSWORD
python3 settings.py
```

**Expected output:**

```
the shell sees: secret123
ERROR: DB_PASSWORD is not set. Put it in the environment, never in the code.
DB_HOST     = localhost
DEBUG       = False
DB_PASSWORD = se*******
```

## Task 4: For one command only

Type `exit` and open a **new** shell (`docker compose run --rm shell`), so nothing is exported. Then:

```bash
DB_PASSWORD=secret123 DEBUG=true python3 settings.py
echo "after: [$DB_PASSWORD]"
```

**Expected output:**

```
DB_HOST     = localhost
DEBUG       = True
DB_PASSWORD = se*******
after: []
```

## Task 5: Settings from Docker Compose

Type `exit`. From your laptop:

```bash
docker compose run --rm app
docker compose run --rm -e DEBUG=false app
```

**Expected output:**

```
DB_HOST     = db.bazaar.internal
DEBUG       = True
DB_PASSWORD = la***************
```

and in the second run, `DEBUG       = False`: `-e` overrides one setting for this run. Open `docker-compose.yml` and `app/bazaar.env`
to see where each value came from.

## Task 6: Install a missing tool

In a new shell (`docker compose run --rm shell`):

```bash
jq --version
apt-get install -y jq
apt-get update && apt-get install -y jq
jq --version
echo '{"name": "Masala Box", "price": 299}' | jq .price
```

**Expected output** (in part):

```
bash: jq: command not found
E: Unable to locate package jq
jq-1.7
299
```

## Task 7: A job in the background

```bash
python3 import_products.py > /tmp/import.log 2>&1 &
jobs
cat /tmp/import.log
```

Wait a few seconds, `cat /tmp/import.log` again: it grows by one line per second. Now stop it:

```bash
kill %1
jobs
```

**Expected output** (at the end):

```
[1]+  Terminated              python3 import_products.py > /tmp/import.log 2>&1
```

Start it again, and this time **wait** for it:

```bash
python3 import_products.py > /tmp/import.log 2>&1 &
echo "doing other work..."
wait
tail -1 /tmp/import.log
```

**Expected output:**

```
doing other work...
import finished
```

## Task 8 (optional, Going deeper): load a .env file by hand

```bash
set -a; source bazaar.env; set +a
python3 settings.py
```

**Expected output:**

```
DB_HOST     = localhost
DEBUG       = True
DB_PASSWORD = la***************
```

## Check your work

From your laptop:

```bash
bash test_lab.sh
```

**Expected output:**

```
PASS: settings.py refuses to start without DB_PASSWORD
PASS: a shell variable reaches Python only after export
PASS: VAR=value cmd sets it for that one command only
PASS: compose: environment + env_file reach the app
PASS: apt: jq missing (127), installed, works
PASS: & runs a job in the background; kill %1 stops it
PASS: wait waits for the background job
ALL CHECKS PASSED
```

## Stuck?

- **`apt-get update` fails**: the container needs internet access. Check your connection, then try again.
- **Task 4 shows the password was already set**: you're still in the shell from Task 3. `exit` and start a new one.

## Clean up

```bash
docker compose down
```
