# Installing Git and Docker

<div class="bz-meta" markdown>
**Module** 0 · Welcome and setup
**Lesson** 4
**Reading time** 15 min (+ optional deeper parts)
**You will build** your first commits, your first containers, and a script that checks your whole setup
</div>

!!! abstract "In 1 minute"
    - **Git** saves versions of your code. Each save point is a **commit**, with a message saying why.
    - Changes go: your files → `git add` (choose them) → `git commit` (save them).
    - **Docker** runs a program packed with everything it needs, the same way on every computer.
    - An **image** is the packed program; a **container** is a running copy of it. `docker run` starts one.
    - In the lab, you make your first commits, run your first containers, and check your whole setup with one script.

> **Previously in Bazaar:** You installed Python and VS Code, and learned how PATH finds programs.
> Your computer can now run Bazaar's Python code.

## 1. Why learn this?

Bazaar's code will change every day. One bad change can break checkout, and you will want to go back
to the version that worked. Two developers will change the same file on the same day.
Also, Bazaar will soon need PostgreSQL, Redis, Kafka and more. Installing all of them by hand on every
laptop gives a different result on each one.

**Git** solves the first set of problems. **Docker** solves the second.
Every professional backend team uses both, every day. In this lesson you install them, you understand
what they do inside, and you finish with a script that proves your whole setup is ready.

## 2. The concept

### Part A: Git

#### The problem Git solves

Without Git, people do this:

```
checkout.py
checkout_old.py
checkout_final.py
checkout_final_v2_REALLY_final.py
```

Which one is live? What changed between them? Who changed it, and why? Nobody knows.

**Git** is a **version control system**: a tool that records every version of your files, with who
changed what, when and why. You can see any old version, compare versions, and go back.

#### Save points: commits

Let's understand Git with a small example: a video game. Before a hard level, you save the game.
If you lose, you go back to the save point and try again.

Git gives your code save points. Each save point is called a **commit**. A commit records:

- a **snapshot** of all your tracked files at that moment;
- a **message** saying why ("Diwali sale: shoes now 899");
- the **author** (name and email) and the time;
- the **parent**: the commit that came just before it. So commits form a chain, a history.

Each commit gets a unique ID, called its **hash**: 40 letters and digits like
`af417371b222ede5408bd990df411a25d083479d`. Usually you only need the first 7: `af41737`.

**Where the analogy breaks:** a game usually has a few save slots that get overwritten.
Git keeps **every** commit, forever, and several people can each make their own commits and later combine them.

#### The three places in Git

Git uses three places. Knowing them removes most beginner confusion:

| Place | What it is | How a change moves on |
| --- | --- | --- |
| **Working folder** | your files, as you see and edit them | `git add <file>` puts the change on the stage |
| **Staging area** | the changes you have chosen for the next commit | `git commit -m "..."` saves them as a commit |
| **Repository** | the history of all commits, in a hidden `.git` folder | stays forever |

Why a staging area? Because you often change five files, but only three belong in this commit.
The stage lets you choose. A folder that Git tracks is called a **repository** (or "repo").

#### Git and GitHub

**Git** is the tool on your computer. **GitHub** is a website that stores copies of Git repositories online,
so teams can share them, review each other's changes, and run automatic checks.
GitLab and Bitbucket are similar websites. You will use GitHub in Module 3 and Module 24.

### Part B: Docker

#### The problem Docker solves

Here is a problem every team hits: "It works on my laptop!" Your code runs for you,
but fails on your friend's computer, because their Python, their database or their system libraries
are a different version. Installing the same tools on 10 laptops and 5 servers gives 15 slightly different setups.

**Docker** fixes this by packing a program **together with everything it needs**, and running that package
the same way everywhere.

#### Image and container

- An **image** is a ready-made package: a small file system with a program and all its parts inside,
  plus a note saying which command to start. `python:3.13.18-slim-trixie` is an image: a small
  Debian Linux with Python 3.13.18 installed. An image never changes.
- A **container** is a running copy of an image. When it starts, Docker gives it its own writable
  layer on top of the image, its own processes, its own network and its own file system view.

Let's understand this with a small example: a sealed tiffin box with the full meal packed inside is the
**image**. Opening a tiffin and eating is a **container**. You can open many copies of the same tiffin,
and each one is separate. Spilling dal in one doesn't touch the others, and the sealed original stays as it was.

??? note "Going deeper: Containers are not virtual machines"
    A **virtual machine** (VM) pretends to be a whole computer, with its own operating system and its own
    **kernel** (the core of the OS, from Module 1). A **container** is much lighter: it is just ordinary processes,
    with walls around them, that **share the kernel** of the machine they run on. That is why a container starts
    in a fraction of a second, while a VM takes far longer to boot.

    But a Linux container needs a **Linux** kernel. So on a Mac or Windows laptop, Docker Desktop quietly runs
    one small Linux VM, and all your containers live inside it. You can see it:

    ```
    $ uname -sr                                             # on the Mac
    Darwin 25.0.0
    $ docker run --rm python:3.13.18-slim-trixie uname -sr  # inside a container
    Linux 6.12.54-linuxkit
    ```

    The Mac's kernel is called Darwin. The container sees a Linux kernel: the one inside Docker Desktop's VM.

??? note "Going deeper: Layers"
    An image is built in **layers**, stacked like transparent sheets. Each layer adds or changes some files.
    The Python image used in this course has 4 layers with real content:

    | Layer | Size | What it adds |
    | --- | --- | --- |
    | Debian "trixie" base | 101 MB | a minimal Linux file system |
    | system packages | 3.85 MB | a few tools Python needs |
    | Python 3.13.18 | 39 MB | Python itself |
    | `python3` shortcuts | 36 B | links like `python3 → python3.13` |

    Total: about 144 MB. Layers are shared: if two images use the same Debian layer, Docker stores
    and downloads it only once. You will build your own images, layer by layer, in Module 19.

??? note "Going deeper: The Docker family of words"
    | Word | Meaning |
    | --- | --- |
    | **Docker Engine** | the background program (a **daemon**) that builds images and runs containers |
    | **docker** (the command) | a **client**: it only sends your request to the Engine |
    | **Docker Desktop** | the app that installs and starts the Engine (and its Linux VM) on Mac and Windows |
    | **Docker Hub** | a big online library (a **registry**) of images, like `python`, `postgres`, `redis` |
    | **tag** | the version label after the colon: `python:3.13.18-slim-trixie` |
    | **Docker Compose** | describes several containers in one file, `docker-compose.yml`, and starts them together |

Two more names you'll see while installing: **Docker Desktop** is the app that runs Docker on Mac and Windows,
and **Docker Hub** is the online library where images like `python` are downloaded from.

#### Why Docker for Bazaar?

Installing tools straight onto each computer gives a different result every time.
With Docker, every student gets exactly `python:3.13.18-slim-trixie`, byte for byte.
So when the lab README shows an output, you see the same output.
Later, Bazaar's servers run the very same images, so "it works on my laptop" means "it works in production".

### Questions you may have

**Do I need a GitHub or Docker Hub account now?**
No. Git works without any account. Docker Hub lets anyone download public images without logging in
(with a limit on how many downloads per hour). You will create a GitHub account in Module 3.

**Is Docker free?**
Docker Engine is free and open source. Docker Desktop is free for personal use and learning;
large companies need a paid plan. Check Docker's website for the exact current terms.

**Does Docker make my code slower?**
On Linux, a container runs about as fast as a normal process: it **is** a normal process.
On Mac and Windows there is the small Linux VM, and sharing folders between your laptop and the VM is slower.
You measured that in Module 1, Lesson 1 (74 µs vs 4 µs to read a file).

**Where do images and containers live?**
Inside Docker's storage: on Mac and Windows, on the virtual disk of Docker Desktop's VM.
`docker images` lists images; `docker ps -a` lists containers.

**Why "slim"? Why not the smallest image possible?**
`python:3.13.18` (full) includes many extra tools and is much bigger. `slim` keeps what Python needs.
There are even smaller images (like `alpine`), but they use different system libraries, which sometimes
breaks Python packages. `slim` is a good balance. Module 19 compares them.

**What happens to files I create inside a container?**
They go into that container's own writable layer. When the container is removed, they are gone.
To keep data, you use a **volume** (you used one in Module 1) or share a folder from your laptop.

## 3. See it in action

Pick a situation and press **Play**. Watch your command travel from the terminal to a container.

<div class="bz-diagram" data-diagram="docker-run"></div>

## 4. Code example

First, install Git and Docker. Follow the steps for your system.

### Install Git

=== "macOS"

    Open the Terminal app and type:

    ```bash
    git --version
    ```

    If Git is missing, macOS offers to install the **Command Line Tools**. Click **Install**,
    wait for it to finish, then run `git --version` again.

=== "Windows"

    1. Download **Git for Windows** from [git-scm.com](https://git-scm.com/downloads).
    2. Run the installer. The default choices are fine. Click **Next** until it is installed.
    3. It also installs **Git Bash**, a terminal that understands the same commands as Mac and Linux.
       You will use it to run `.sh` scripts in this course.

=== "Linux"

    ```bash
    sudo apt install -y git      # Ubuntu / Debian
    sudo dnf install -y git      # Fedora
    ```

Then tell Git who you are. Git writes this name and email into every commit you make:

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
```

`--global` saves it for every repository on your computer, in a file called `~/.gitconfig`.

### Install Docker

=== "macOS"

    1. Download **Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/).
       Pick **Apple silicon** or **Intel chip** to match your Mac ( → About This Mac).
    2. Open the file, drag Docker to **Applications**, and open Docker from there.
    3. Accept the terms. Wait until Docker Desktop says the Engine is **running**.

=== "Windows"

    1. Download **Docker Desktop** from [docker.com](https://www.docker.com/products/docker-desktop/).
    2. Run the installer and keep **Use WSL 2** turned on.
       **WSL 2** (Windows Subsystem for Linux) is a real Linux that runs inside Windows. Docker uses it.
    3. Restart your computer if the installer asks. Open Docker Desktop and wait until it is **running**.

    If Docker says WSL is missing, open PowerShell **as Administrator**, run `wsl --install`, and restart.

=== "Linux"

    On Linux you install **Docker Engine** directly (no Desktop app or VM needed).
    Follow the official steps for your distribution:
    [docs.docker.com/engine/install](https://docs.docker.com/engine/install/).
    Make sure the **Docker Compose plugin** is installed too.

    Then let your user run Docker without `sudo`, and **log out and back in**:

    ```bash
    sudo usermod -aG docker $USER
    ```

Check both tools in a **new** terminal:

```bash
git --version
docker --version
docker compose version
```

Example output (your versions can be newer):

```
git version 2.38.0
Docker version 29.1.3, build f52814d
Docker Compose version v2.40.3-desktop.1
```

### Your first commits

Let's give Bazaar's product list a history. In an empty folder:

```bash
git init
echo '{"id": 1, "name": "Red Running Shoes", "price": 999}' > products.json
git status
```

```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	products.json
```

**Untracked** means "Git sees this file, but isn't saving its history yet". Put it on the stage and commit:

```bash
git add products.json
git commit -m "Add Red Running Shoes"
```

Now the Diwali sale starts. Change the price from 999 to 899 in the file, then ask Git what changed:

```bash
git diff
```

```
diff --git a/products.json b/products.json
index 8372321..144f458 100644
--- a/products.json
+++ b/products.json
@@ -1 +1 @@
-{"id": 1, "name": "Red Running Shoes", "price": 999}
+{"id": 1, "name": "Red Running Shoes", "price": 899}
```

The line starting with `-` was removed; the line with `+` was added. Commit it and look at the history:

```bash
git commit -am "Diwali sale: shoes now 899"
git log --oneline
```

```
af41737 Diwali sale: shoes now 899
bd0d829 Add Red Running Shoes
```

Newest first. Your hashes will be different, because they depend on the time and your name.
(`-a` in `commit -am` stages every changed tracked file for you, so you can skip `git add` for them.)

### Your first container

Now run Python **inside** a container. You don't even need Python on your laptop for this:

```bash
docker run --rm python:3.13.18-slim-trixie python3 -c "print('Hello from inside a container!')"
```

The first time, the output looks like this:

```
Unable to find image 'python:3.13.18-slim-trixie' locally
3.13.18-slim-trixie: Pulling from library/python
Digest: sha256:e48f59cdba69a3cbd9ed2cf0f348d90d45a8d350d98134cf1070bc106ee9ed90
Status: Downloaded newer image for python:3.13.18-slim-trixie
Hello from inside a container!
```

Line by line:

1. `Unable to find image ... locally`: the Engine looked in its own storage first, and didn't find it.
2. `Pulling from library/python`: it downloads (**pulls**) the image from Docker Hub. `library/` means
   an official image, maintained with Docker. You will also see a few lines ending in `Pull complete`: one per layer.
3. `Digest: sha256:...`: a fingerprint of the exact image content. Even if someone moved the tag,
   the digest would prove which bytes you got.
4. `Status: Downloaded newer image`: the image is now stored on your computer.
5. `Hello from inside a container!`: your Python line ran inside the container.

Run the same command again. This time you see only the last line, and it is much faster.
On our test machine, the first run took **3.5 seconds** (download included). The second took **0.2 seconds**.

| Part of the command | Meaning |
| --- | --- |
| `docker run` | Create a container from an image and start it. |
| `--rm` | Remove the container when it stops, so old ones don't pile up. |
| `python:3.13.18-slim-trixie` | The image: Python 3.13.18, small ("slim") version, on Debian "trixie" Linux. |
| `python3 -c "..."` | The command to run inside the container, instead of the image's default (`python3`). |

## 5. Under the hood

??? note "Going deeper: What is inside a commit?"
    Git stores a commit as a small text object. You can print the latest one:

    ```
    $ git cat-file -p HEAD
    tree b45a2341b4fb3ca4be8b20d6603a2d7fea332680
    parent bd0d8296111589a65ccbba1911deea32ef98cb07
    author Asha Sharma <asha@example.com> 1795249042 +0530
    committer Asha Sharma <asha@example.com> 1795249042 +0530

    Diwali sale: shoes now 899
    ```

    - `HEAD` means "the commit you are on now".
    - `tree` points to a snapshot of the folder: which files, with which contents.
    - `parent` is the commit before, `bd0d829`: this is how the history chain is made.
    - `author` has the name, email, time (seconds since 1 January 1970) and time zone (`+0530` = India).

    The hash is computed from all of this content. Change one letter anywhere, and the hash changes.
    That is how Git notices if history was changed or damaged.

    Everything lives in the hidden `.git` folder of the project: `objects` holds all the snapshots,
    `refs` holds branch names, `HEAD` says where you are. **Never delete `.git`**, or the history is gone.

??? note "Going deeper: The journey of `docker run`"
    The `docker` command you type is only a **client**: a program that sends requests to another program.
    Here is the whole chain:

    1. `docker` (the client) sends your request to the **Docker Engine** through a socket file.
       A socket is a "door" that two programs use to talk.
    2. The Engine checks its image storage, and pulls the image from the registry if it's missing.
    3. The Engine asks **containerd**, a helper that manages container lifecycles, to create a container.
    4. containerd uses **runc**, a tiny tool that asks the Linux kernel to build the walls
       (own processes, own network, own file system view) and start your command inside them.
    5. Your program's output flows back the same way, to your terminal.

    You can see these parts:

    ```
    $ docker version --format '{{range .Server.Components}}{{.Name}} {{.Version}}{{"\n"}}{{end}}'
    Engine 29.1.3
    containerd v2.2.0
    runc 1.3.4
    docker-init 0.19.0
    ```

    `docker-init` is the tiny PID 1 you met in Module 1, used when a service has `init: true`.

    When Docker Desktop is closed, the client has nobody to talk to, and you get this error:

    ```
    failed to connect to the docker API at unix:///...docker.sock; check if the path is correct and if the daemon is running
    ```

    A **daemon** is a program that runs in the background, waiting for work. The Docker Engine is one.
    The `.sock` file is the door the client knocks on.

### The life of a container

Without `--rm`, a finished container is not deleted. It just stops:

```
$ docker run --name bz-demo python:3.13.18-slim-trixie python3 -c "print('Hello from inside a container!')"
Hello from inside a container!
$ docker ps -a --filter name=bz-demo --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
NAMES     IMAGE                        STATUS
bz-demo   python:3.13.18-slim-trixie   Exited (0) Less than a second ago
```

A container goes: **created** → **running** → **exited** (with an exit code, `0` here) → **removed**.
`docker ps` shows only running containers. `docker ps -a` shows all of them, also the exited ones.
`docker rm bz-demo` removes it. That is exactly what `--rm` does for you automatically.

### Reading docker-compose.yml

The lab's Compose file, line by line:

```yaml title="docker-compose.yml"
--8<-- "labs/00-setup/04-installing-git-and-docker/docker-compose.yml"
```

| Line | Meaning |
| --- | --- |
| `services:` | the list of containers this project runs |
| `welcome:` | the name of one service; you use it in commands like `docker compose run welcome` |
| `image:` | which image to start it from |
| `working_dir:` | the folder inside the container where the command runs |
| `command:` | what to run, instead of the image's default |
| `volumes: - ./app:/app:ro` | share your laptop's `./app` folder as `/app` inside the container, read-only (`ro`) |

??? note "Going deeper: tags can move, digests can't"
    A tag like `python:3.13` is just a name. When Python 3.13.19 comes out, the maintainers move that tag to
    the new image. That is why this course uses the more exact `3.13.18-slim-trixie`. For total certainty,
    production systems pin the **digest** instead: `python@sha256:e48f59cd...`. A digest is computed from the
    image content, so it can never point to different bytes.

??? note "Going deeper: the walls are called namespaces and cgroups"
    runc builds a container's walls from two Linux kernel features. **Namespaces** give a process its own view
    of something: its own PID numbers (that's why your program was PID 7 inside the container), its own network,
    its own file system tree, its own hostname. **Cgroups** (control groups) limit how much CPU and RAM a group of
    processes may use. A container is "processes + namespaces + cgroups". You will use both in Module 19.

## 6. Lab

**Lab folder:** `labs/00-setup/04-installing-git-and-docker/`

You will run your first containers, see a container's whole life, look at image layers, run your
first Docker Compose service, make your first commits, and then run a script that checks your **whole**
setup: Python, Git, Docker, Docker Compose and VS Code.

```bash
cd labs/00-setup/04-installing-git-and-docker
bash verify_setup.sh
```

Expected output (your versions and name will be different):

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

On Windows, run it inside **Git Bash**. When you finish, run `bash test_lab.sh`.
You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Docker Desktop is installed but not started.** Every Docker command fails with
   `failed to connect to the docker API`. **Fix:** open Docker Desktop and wait until it says it is running.
2. **Linux: `permission denied` on `/var/run/docker.sock`.** Your user is not in the `docker` group.
   **Fix:** `sudo usermod -aG docker $USER`, then log out and back in.
3. **Typing `docker-compose` with a hyphen.** That is the old version 1, which is no longer updated.
   **Fix:** use `docker compose` with a space.
4. **Using the `:latest` tag.** `latest` moves over time, so your result can change without warning.
   **Fix:** always use an exact tag, like `python:3.13.18-slim-trixie`. Every lab in this course does.
5. **Forgetting `--rm`, and filling the disk with old containers.** `docker ps -a` shows a long list of `Exited` ones.
   **Fix:** use `--rm` for one-off commands; clean up with `docker container prune` (it asks before deleting).
6. **Saving important data inside a container.** It disappears when the container is removed.
   **Fix:** use a volume or a shared folder (Module 1 and Module 19).
7. **Skipping `git config` for your name and email.** On a fresh computer, `git commit` stops with
   `Author identity unknown` and `*** Please tell me who you are.` **Fix:** set both now, as shown above.
8. **Committing passwords or `.env` files.** Once a secret is in Git history, deleting the file later doesn't
   remove it from older commits. **Fix:** never commit secrets; Module 3 shows `.gitignore`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m00-04"></div>

## 9. What's next

**Module 0 is complete!** Your computer has Python, VS Code, Git and Docker, and you ran your first container.

Next comes Module 1: [How computers work](../01-how-computers-work/01-cpu-ram-and-disk.md).
You will see what really happens inside the machine that runs Bazaar's backend: CPU, memory, disk, and processes.

**In one line:** Git saves every version of your code as commits, and Docker runs any program, packed with
everything it needs, the same way on every computer.

### Cheat sheet

| Git command | What it does |
| --- | --- |
| `git init` | start tracking this folder (creates `.git`) |
| `git status` | what changed, what is staged |
| `git add <file>` | put a change on the stage |
| `git commit -m "why"` | save the staged changes as a commit |
| `git diff` | show changes not yet staged |
| `git log --oneline` | the history, one line per commit |
| `git config --global user.name "..."` | set your name for every repository |

| Docker command | What it does |
| --- | --- |
| `docker run --rm <image> <cmd>` | run a command in a new container, delete it after |
| `docker ps` / `docker ps -a` | running containers / all containers |
| `docker images` | images stored on this computer |
| `docker image history <image>` | the layers of an image |
| `docker rm <name>` | remove a stopped container |
| `docker compose up -d --wait` | start a Compose project in the background, wait until healthy |
| `docker compose run --rm <service>` | run one service once |
| `docker compose logs` / `down` | show logs / stop and remove the project |

| Exit code / error | Meaning |
| --- | --- |
| `Exited (0)` | the container's program ended successfully |
| `Exited (137)` | it was killed with SIGKILL (Module 1) |
| `failed to connect to the docker API` | Docker Desktop / the Engine isn't running |

> **Next in Bazaar:** Bazaar's backend runs on a server. But what is a server, really?
> Why is memory fast and disk slow? Let's open the box.

<div class="bz-complete" data-lesson="m00-04"></div>
