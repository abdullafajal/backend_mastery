# Lab 00-04: Your first container, and a full setup check

**Goal:** run your first containers, see a container's whole life, look at image layers, run your first
Docker Compose service, make your first Git commits, and prove that your computer is ready for the rest of the course.
Tasks marked *optional, Going deeper* match the lesson's Going-deeper boxes; skip them on your first try.

**Time:** about 30 minutes.

**You need:** Python, VS Code, Git and Docker installed (Lessons 3 and 4). Docker Desktop running.
On Windows, use **Git Bash** for every command in this lab.

## What is in this folder

| File | What it does |
| --- | --- |
| `app/welcome.py` | A tiny Python script that runs inside a container. |
| `docker-compose.yml` | Describes one service, `welcome`, that runs `welcome.py`. |
| `verify_setup.sh` | Checks Python, Git, Docker, Docker Compose and VS Code on **your** computer. |
| `test_lab.sh` | Checks that everything works. |

## Task 1: Check the versions

```bash
git --version
docker --version
docker compose version
```

**Expected output** (your versions can be newer):

```
git version 2.38.0
Docker version 29.1.3, build f52814d
Docker Compose version v2.40.3-desktop.1
```

## Task 2: Your first container

```bash
docker run --rm python:3.13.18-slim-trixie python3 -c "print('Hello from inside a container!')"
```

**Expected output** the first time (plus some lines ending in `Pull complete`):

```
Unable to find image 'python:3.13.18-slim-trixie' locally
3.13.18-slim-trixie: Pulling from library/python
Digest: sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90
Status: Downloaded newer image for python:3.13.18-slim-trixie
Hello from inside a container!
```

If you already did Labs 00-01 to 00-03, the image is already on your laptop,
so you see only the last line. That's fine.

## Task 3: First run vs. second run

Run the same command again, but put `time` in front of it:

```bash
time docker run --rm python:3.13.18-slim-trixie python3 -c "print('Hello from inside a container!')"
```

**Expected output:**

```
Hello from inside a container!
```

followed by the time. On our test machine, `real` was about `0.2` seconds.
The first run, with the download, took about `3.5` seconds. Then list your images:

```bash
docker images python:3.13.18-slim-trixie
```

**Expected output:**

```
IMAGE                        ID             DISK USAGE   CONTENT SIZE   EXTRA
python:3.13.18-slim-trixie   1c0252262bd9        144MB             0B   U
```

## Task 4: Your first Docker Compose service

Open `docker-compose.yml` and read it. Then:

```bash
docker compose run --rm welcome
```

**Expected output:**

```
 Network 04-installing-git-and-docker_default  Creating
 Network 04-installing-git-and-docker_default  Created
Hello from inside a container!
Python 3.13.18 on Linux
Bazaar says: welcome, your setup works.
```

Notice `on Linux`. Even on a Mac or Windows laptop, the container is a small Linux system.

## Task 5: The life of a container

Run a container **without** `--rm`, and give it a name:

```bash
docker run --name bz-demo python:3.13.18-slim-trixie python3 -c "print('Hello from inside a container!')"
docker ps -a --filter name=bz-demo --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
```

**Expected output:**

```
Hello from inside a container!
NAMES     IMAGE                        STATUS
bz-demo   python:3.13.18-slim-trixie   Exited (0) Less than a second ago
```

The container finished (exit code `0`) but still exists. Remove it yourself:

```bash
docker rm bz-demo
```

That is what `--rm` does for you automatically.

## Task 6 (optional, Going deeper): Layers, and whose kernel?

See the layers of the Python image (the newest layer is at the top):

```bash
docker image history --format 'table {{.CreatedBy}}\t{{.Size}}' python:3.13.18-slim-trixie
```

Look for the big ones: about `101MB` (the Debian base, at the bottom), `3.85MB` and `39MB` (Python).
The many `0B` lines only set settings, like `ENV PATH=...`.

Now compare the kernel of your computer and of a container:

```bash
uname -sr
docker run --rm python:3.13.18-slim-trixie uname -sr
```

**Expected output on a Mac** (on Windows, the first command needs Git Bash; numbers will differ):

```
Darwin 25.0.0
Linux 6.12.54-linuxkit
```

The container sees a **Linux** kernel even on a Mac: the one inside Docker Desktop's small Linux VM.
On a Linux laptop, both lines show the same Linux kernel, because containers share the host's kernel.

## Task 7: Tell Git who you are

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global user.name
```

**Expected output:** your name, printed back to you.

## Task 8: Your first commits

Make a practice folder **outside** this course folder, and give Bazaar's product a history:

```bash
mkdir ~/bazaar-git-practice && cd ~/bazaar-git-practice
git init
echo '{"id": 1, "name": "Red Running Shoes", "price": 999}' > products.json
git status
git add products.json
git commit -m "Add Red Running Shoes"
```

Now open `products.json`, change `999` to `899`, save, and run:

```bash
git diff
git commit -am "Diwali sale: shoes now 899"
git log --oneline
```

**Expected output** of the last command (your hashes will differ):

```
af41737 Diwali sale: shoes now 899
bd0d829 Add Red Running Shoes
```

Bonus: `git cat-file -p HEAD` shows what is inside your newest commit: its `tree`, its `parent`, you as the
`author`, and the message. The lesson explains every line. Go back to the lab folder when you are done:
`cd -`.

## Task 9: Verify your whole setup

```bash
bash verify_setup.sh
```

**Expected output** (your versions and name will be different):

```
Checking your Bazaar setup...

  ✓ Python: python3 (3.13.x)
  ✓ Git: 2.38.0
  ✓ Git identity: Your Name <you@example.com>
  ✓ Docker: 29.1.3, build f52814d
  ✓ Docker Engine is running
  ✓ Docker Compose: 2.40.3-desktop.1
  ✓ A container ran: "Hello from inside a container!"
  ✓ VS Code 'code' command found

Your computer is ready to build Bazaar!
```

A line starting with `!` is only a tip. A line with `✗` is a problem, and the script tells you
how to fix it. Fix problems one by one and run the script again.

Want to see a problem on purpose? Quit Docker Desktop and run `bash verify_setup.sh` again.
You will see `✗ Docker Engine is not running`. Start Docker Desktop again afterwards.

## Check your work

```bash
bash test_lab.sh
```

**Expected output:**

```
PASS: docker run prints the hello line
PASS: compose service 'welcome' runs Python 3.13.18
PASS: without --rm, the finished container stays as Exited (0)
PASS: verify_setup.sh: ready (exit 0)
PASS: verify_setup.sh catches a stopped Docker Engine (exit 1)
ALL CHECKS PASSED
```

## Stuck?

- **`failed to connect to the docker API ... check if the path is correct and if the daemon is running`**:
  Docker Desktop is not running. Open it and wait until it says it is running.
- **`✗ Python is too old: python3 (3.9.6)`** on a Mac: your terminal finds the old Mac Python.
  Install Python 3.13 (Lesson 3) and open a new terminal.
- **`bash: verify_setup.sh: No such file or directory`**: you are in the wrong folder.
  Run `cd labs/00-setup/04-installing-git-and-docker` first.

## Clean up

```bash
docker compose down
```
