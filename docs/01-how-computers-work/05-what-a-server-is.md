# What a server really is

<div class="bz-meta" markdown>
**Module** 1 · How computers work
**Lesson** 5
**Reading time** 15 min (+ optional deeper parts)
**You will build** a web server from raw sockets, a second one that can't start, a server "inventory" report, and a process that runs out of file descriptors
</div>

!!! abstract "In 1 minute"
    - "Server" means two things: a **program** that waits for requests, and the **machine** that runs it.
    - A server program waits on a **port** (a door number, like 8000), and answers whoever knocks.
    - Inside the machine, a request goes: network card → kernel → Bazaar's process → answer back.
    - A busy server runs out of one of four things: **CPU**, **RAM**, **disk**, or **file descriptors**. Each has its own error.
    - In the lab, you build a tiny web server and see each of its steps.

> **Previously in Bazaar:** You learned how files really work: names, inodes and blocks; why saving needs
> temp-fsync-rename; and why a disk can be "full" while it is mostly empty.

## 1. Why learn this?

Bazaar is about to go online for real. The team asks: "Which server should we get? How big? Where should it live?
And when it's slow at night, what do we even look at?"

You have already met every part of a server in this module: the CPU, RAM, the disk, processes, threads, memory and files.
This lesson puts them together. You will see what the word "server" really means (it means two things),
how a server program waits for customers, what actually happens inside the machine when Asha's request arrives,
what makes server hardware different from your laptop, and which resource runs out first when Bazaar is busy.
After this lesson, you can look at any server and know what to check.

## 2. The concept

### "Server" means two things

People use the word **server** for two different things, often in the same sentence:

1. **A server program**: a program that **waits for requests** and answers them. Bazaar's backend is a server program.
   So are PostgreSQL, Redis and Nginx.
2. **A server machine**: a computer whose job is to run server programs, usually day and night, with nobody sitting in front of it.

"The server is down" can mean either: the program crashed, or the machine is off. Good engineers say which one.

The other side is the **client**: the program that **sends** requests. Asha's Bazaar app is a client.
So is `curl`. So is Bazaar's backend when it talks to PostgreSQL: a program can be a server to some and a client to others.
This design, where clients ask and servers answer, is called the **client–server model**.

### How a server program waits for customers

A server program doesn't go looking for customers. It does three simple things:

1. **Claim a door.** It tells the operating system "I'm here, on door number 8000". That door number is a **port**.
   Only one program can listen on a port at a time.
2. **Wait.** It sleeps (using no CPU) until someone knocks.
3. **Answer, then wait again.** It reads the request, sends the response, hangs up, and goes back to waiting.

Real websites use port 80 (HTTP) and 443 (HTTPS). Bazaar's lab server uses 8000.
Every web framework you'll use (Django, Gunicorn, Nginx) does exactly this underneath. In the lab you'll build one yourself.

??? note "Going deeper: the six socket steps (socket, bind, listen, accept, recv/send, close)"
    A server program doesn't search for customers. It tells the kernel "I'm here, on this door", and sleeps until someone knocks.
    The door is a **port**: a number from 1 to 65535. One port can be owned by only one listening program at a time
    (on the same address). Bazaar's lab server uses port 8000; real websites use 80 (HTTP) and 443 (HTTPS).

    The program talks to the network through a **socket**: a kernel object, used through a file descriptor (Lesson 4), that can send and receive bytes.
    A server program does these steps:

    1. **socket()**: ask the kernel for a new socket. It gets a file descriptor, for example 3.
    2. **bind()**: claim an address and a port, for example "any network card, port 8000".
       If another program already holds that port: `Address already in use`.
    3. **listen()**: tell the kernel "queue up incoming connections for me".
    4. **accept()**: sleep until a client connects. Then the kernel hands over **a new socket, with a new file descriptor**
       (for example 4), just for this one client. The listening socket stays open for the next client.
    5. **recv() / send()**: read the request bytes, write the response bytes.
    6. **close()**: hang up, and go back to step 4.

    Every web framework you will use (Django, Gunicorn, Nginx) does exactly these steps underneath. You will build one yourself
    in the lab, in about 30 lines, and see each step in its logs. (Module 7 explains TCP, the protocol under these sockets.)

### What `0.0.0.0` and `127.0.0.1` mean

A machine can have several network addresses. When a server binds:

- `0.0.0.0` means "**all** of this machine's addresses": anyone who can reach the machine can connect.
- `127.0.0.1` (**localhost**) means "only from this same machine". Nothing from outside can reach it.

That's why lab servers bind to `0.0.0.0` inside their container: otherwise your laptop, outside the container, couldn't reach them.
And it's why a database that should be private is often bound to `127.0.0.1` only.

### Inside the machine: the life of one request

Here is everything from Module 1, in the order it happens when Asha opens Bazaar's product page:

1. Asha's phone sends the request bytes over the internet.
2. The server's **network card** (NIC) receives them and signals the CPU.
3. The **kernel**'s network code puts the pieces back together and finds the **listening socket** on port 8000.
4. Bazaar's **process**, asleep in `accept()` (STAT `S` in `ps`, Lesson 2), wakes up with a new **file descriptor** for Asha's connection.
5. A **thread** runs Python code on a **CPU core** (Lesson 1).
6. It reads products from **RAM**, perhaps from a cache (Lessons 1 and 3).
7. It writes a line to the order log in a **file** on the **disk**, through the page cache (Lessons 1 and 4).
8. It sends the response back: process → kernel → network card → internet → Asha's phone.

Each of those parts has a limit. When Bazaar is busy, one of them runs out first.

### The four resources, and what running out looks like

| Resource | When it runs out | What you see |
| --- | --- | --- |
| **CPU** | more work than the cores can do | everything slow |
| **RAM** | programs need more memory than there is | the process is killed (exit code 137, Lesson 3) |
| **Disk** | no space, or no inodes | `No space left on device` (Lesson 4) |
| **File descriptors** | too many open files and connections | `Too many open files`; new customers can't connect |

??? note "Going deeper: the four resources in detail, CPU-bound vs I/O-bound"
    | Resource | When it runs out | What you see | Where you learned it |
    | --- | --- | --- | --- |
    | **CPU** | more threads want a core than there are cores | everything slow; **load average** above the core count | Lessons 1 and 2 |
    | **RAM** | programs need more memory than there is | swapping (very slow), then the **OOM killer**: exit code 137 | Lesson 3 |
    | **Disk** | no free blocks, or no free inodes | `[Errno 28] No space left on device`; saves fail | Lesson 4 |
    | **File descriptors** | a process has too many open files/connections | `[Errno 24] Too many open files`; new clients can't connect | Lesson 4 and this lesson |

    And outside the machine: the **network** (bandwidth and latency, Lesson 1).

    Work is often described by which resource it waits for most:

    - **CPU-bound** work keeps the CPU busy: resizing product photos, generating invoice PDFs.
    - **I/O-bound** work mostly waits: for the database, the disk or another server. Most of Bazaar's web requests are I/O-bound.
      ("I/O" means input/output: reading and writing data.)

    This matters, because the fixes are different (Module 0, Lesson 2 measured it: more threads helped waiting work a lot,
    and CPU work hardly at all).

??? note "Going deeper: Server machines vs your laptop"
    A server is a computer, but it's built for a different life:

    | | Your laptop | A typical server machine |
    | --- | --- | --- |
    | Screen, keyboard | yes | none: it is **headless**, managed over the network (SSH, Module 2) |
    | Runs | when you use it | 24 hours a day, for years |
    | CPU cores / RAM | a few / 8–32 GB | many / tens to hundreds of GB |
    | Memory | normal RAM | usually **ECC** RAM, which detects and fixes some memory errors |
    | Disks | one | several, often combined so that one can fail without losing data (**RAID**) |
    | Power | one supply, a battery | often two power supplies, in a building with backup power |
    | Where | on your desk | in a rack, in a **data centre** with cooling and fast networks |
    | Remote control | — | a small built-in management computer can restart it even if the OS is frozen |

    But nothing in a server is magic. It runs Linux, processes, threads and files, exactly as you have seen.
    Your laptop is a perfectly good server for one user; that's what you've been doing in every lab.

??? note "Going deeper: Where Bazaar's servers can live"
    | Option | What it means | Good for |
    | --- | --- | --- |
    | **Own hardware (on-premises)** | you buy machines and run them in your own building | big companies with special needs |
    | **Colocation** | your machines, in someone else's data centre (they give space, power, network) | owning hardware without owning a building |
    | **VPS / cloud VM** | you rent a **virtual machine**: a slice of a bigger physical machine, created in minutes | most startups, and Bazaar in Module 24 |
    | **Managed services** | the provider runs the whole thing (a database, a cache), you just use it | less work, more cost (Module 26) |

    A VPS is the same idea as Docker Desktop's Linux VM from Module 0, Lesson 4: one physical machine runs several virtual ones,
    each with its own kernel. That's why you saw `st` ("stolen" time) in `top` in Lesson 2: on a busy physical host,
    other VMs can take CPU time from yours.

??? note "Going deeper: How much downtime is '99.9%'?"
    Servers are judged by **uptime**: the share of time they work. The numbers look close, but they are very different:

    | Uptime | Down per year | Down per month (30 days) |
    | --- | --- | --- |
    | 99% | about 3.65 days | about 7.2 hours |
    | 99.9% ("three nines") | about 8.8 hours | about 43 minutes |
    | 99.99% ("four nines") | about 53 minutes | about 4.3 minutes |
    | 99.999% ("five nines") | about 5.3 minutes | about 26 seconds |

    One machine can fail at any time: a disk dies, a power supply breaks, a kernel needs a restart. So high uptime is never
    about one perfect machine; it comes from **several** machines, so one can fail while the others keep serving (Module 27 onwards).
    You will turn these numbers into goals (SLOs and error budgets) in Module 25.

### An analogy, and where it breaks

Think of Bazaar's customer care desk:

- The **server program** is the agent waiting at the desk, and the **port** is the counter number on the sign.
  `accept()` is the agent saying "next, please".
- The **kernel** is the receptionist who directs people to counter 8000, and keeps them in line when the agent is busy.
- Each customer at the counter gets a **token number**: the file descriptor. The agent can only hand out so many tokens.
- The **server machine** is the building: rooms (RAM), filing cabinets (disk), staff (CPU cores).

Where it breaks: one agent can't really talk to two customers at once, but a server program with threads or async code
(Module 5) can serve thousands at once. And a real building doesn't kill its busiest employee when it runs out of space;
the OOM killer does exactly that.

??? note "Going deeper: In the real world"
    - **Nginx** (Module 20) listens on ports 80 and 443 and passes requests to **Gunicorn** on another port, which runs Django.
    - **PostgreSQL** listens on port 5432, **Redis** on 6379: you'll see these numbers in every lab of Level 3 and 4.
    - **File descriptor limits** matter for Nginx and databases with thousands of connections; production configs raise them.
    - **Health checks** (Module 25) ask a server program "are you alive?" every few seconds, exactly like the `healthcheck` in
      your Compose files.
    - Big systems put many server machines behind a **load balancer** (Module 27), so one failing machine doesn't take Bazaar down.

### Questions you may have

**Can I use my laptop as Bazaar's real server?**
Technically yes: it's what you do in every lab. But it sleeps, travels, has one disk, and your home internet connection
isn't built for customers. That's why real servers live in data centres.

**Why do the lab servers use port 8000 and not 80?**
On Linux, ports below 1024 traditionally need administrator rights to bind. Development servers use high ports like 8000;
in production, Nginx (with the right permissions) takes 80 and 443.

**What is "serverless", then?**
There are still servers; you just don't manage them. You give the provider a function, and it runs it on its servers when a
request comes. Good for small, spiky jobs. Bazaar's main backend uses regular servers, which teaches you far more.

**Is one big server or many small servers better?**
Making one server bigger is called **vertical scaling**; adding more servers is **horizontal scaling**. One big server is
simpler, until it isn't big enough or it fails. Module 27 compares them properly.

**What's the difference between a server and a container?**
A container is a group of processes with walls around them (Module 0, Lesson 4). Many containers can run on one server machine.
In the lab, your "server" is a container on your laptop.

**What does "the server is slow" usually mean?**
One of the four resources is running out, or the server is waiting for something else (often the database). The first
questions are always: what's the load average, how much RAM is available, is the disk full, and what's it waiting for?

## 3. See it in action

Choose what runs out (or nothing), then press **Play**.

<div class="bz-diagram" data-diagram="server-request"></div>

## 4. Code example

### A web server from raw sockets

This is a complete (tiny) web server. It does the steps from part 2, one by one, and prints each one.

```python title="tiny_server.py"
--8<-- "labs/01-how-computers-work/05-what-a-server-is/app/tiny_server.py"
```

In the lab it runs in a container. Send it two requests:

```
$ curl http://localhost:8000/
{"server_pid": 7, "requests_served": 1}
$ curl http://localhost:8000/orders
{"server_pid": 7, "requests_served": 2}
```

Its logs:

```
[server] PID 7 is listening on port 8000 (socket = fd 3)
[server] connection from 192.168.65.1:20742, new fd 4
[server] request line: GET / HTTP/1.1
[server] connection from 192.168.65.1:58483, new fd 4
[server] request line: GET /orders HTTP/1.1
```

Read them with Lesson 4 in mind:

- The listening socket is **fd 3**: the first file descriptor after stdin, stdout and stderr.
- Each connection gets a **new** socket, **fd 4**. After `close()`, the number 4 is free again, so the next connection gets 4 too.
- `192.168.65.1:20742` is the client: Docker's address for your laptop, and a random **source port** your laptop chose for this
  one connection. Every connection has a pair of address:port on each end.
- `GET / HTTP/1.1` is the request line from Module 0, Lesson 1.

Notice what this server does **not** do: it serves one client at a time, has no threads, doesn't check the request, and ignores
most of HTTP. That's what real servers like Gunicorn add. But the core is exactly this loop.

### Two servers, one port

Start a second copy while the first one is running:

```
$ python3 tiny_server.py
OSError: [Errno 98] Address already in use
```

`bind()` failed: port 8000 already has a listener. You will see this error often in your career, usually because an old copy of
your server is still running. The fix is to find and stop it, or use another port.

## 5. Under the hood

### A server's inventory

`server_inventory.py` reads everything Module 1 covered, from the kernel's files in `/proc`:

```
name (hostname)   : f4151932b771
operating system  : Linux 6.12.54-linuxkit (aarch64)
CPU cores         : 8
load average      : 0.23 0.30 0.28  (1, 5, 15 minutes)
RAM               : 3918 MB total, 3414 MB available
disk /            : 58 GB total, 52 GB free
inodes /          : 3,907,584 total, 3,786,050 free
open files limit  : 1048576 per process (hard limit 1048576)
up for            : 0.5 hours
listening on      : 127.0.0.11:35165, 0.0.0.0:8000
```

| Line | What it tells you |
| --- | --- |
| hostname | the machine's name. In a container, Docker sets it to the container's short ID |
| operating system | the kernel: here the Linux kernel of Docker Desktop's VM (Module 0) |
| CPU cores, load average | compare them: a load of 0.3 on 8 cores means "almost idle" |
| RAM available | how much more memory programs can get without swapping. More useful than "free" |
| disk, inodes | both kinds of "full" from Lesson 4 |
| open files limit | how many file descriptors one process may have. The **soft** limit is the current one; a process may raise it up to the **hard** limit |
| up for | time since the (virtual) machine started |
| listening on | every socket in LISTEN state. `0.0.0.0:8000` is our server. `127.0.0.11:<random port>` is Docker's built-in DNS server, which turns service names like `inventory` into addresses (you used it in Lesson 1) |

??? note "Going deeper: Reading the kernel's socket table"
    The "listening on" line comes from `/proc/net/tcp`, the kernel's table of TCP sockets. It is written in hexadecimal
    (base 16, digits 0–9 and A–F):

    ```
    00000000:1F40      (state 0A = LISTEN)
    0B00007F:979F      (state 0A = LISTEN)
    ```

    - `1F40` in hexadecimal is 8000. `00000000` is the address 0.0.0.0.
    - `0B00007F` is an IPv4 address with its four bytes stored in reverse order: `7F.00.00.0B` = 127.0.0.11.

    Tools like `ss -ltn` (Linux) and `netstat` read this same table and print it nicely. Module 7 goes deeper.

### Too many open files

The lab runs `too_many_files.py` with a limit of 50 file descriptors (`ulimits: nofile: 50` in Compose):

```
this process may have 50 open files at once
opened 47 files, then: [Errno 24] Too many open files: '/app/tiny_server.py'
```

47, not 50, because file descriptors 0, 1 and 2 (stdin, stdout, stderr) were already open. A server with thousands of
customers needs thousands of descriptors, one per connection, plus its files and database connections. Real servers raise this limit,
and must **close** what they open: a program that forgets to close connections "leaks" descriptors until it hits this wall.

??? note "Going deeper: the listen queue (backlog)"
    Between "the kernel received a connection" and "the program called `accept()`", connections wait in a queue inside the kernel.
    `listen(n)` sets its size (the **backlog**). In Module 0, Lesson 2, 300 customers arrived at a one-worker server at once, and
    none were refused: they waited in this queue (and in TCP's retries) until the worker got to them. When the queue overflows,
    new connections are dropped or refused. Web servers let you tune it; Module 33 shows when it matters.

??? note "Going deeper: why the same port works in many containers"
    Every container has its own network namespace (Module 0, Lesson 4, Going deeper): its own network cards, addresses and ports.
    So ten containers can each listen on port 8000 without "Address already in use". Docker's `ports: "8000:8000"` then connects one
    port on your laptop to one container's port. That's also why two labs can't both publish port 8000 on your laptop at the same time,
    and why our tests pick a free port with `BAZAAR_PORT`.

## 6. Lab

**Lab folder:** `labs/01-how-computers-work/05-what-a-server-is/`

```bash
cd labs/01-how-computers-work/05-what-a-server-is
docker compose up -d server
curl http://localhost:8000/
```

Expected output: `{"server_pid": 7, "requests_served": 1}` (the number may be higher if you called it before).
In the lab you will also read the server's logs step by step, start a second server on the same port, print the server's inventory,
read the kernel's socket table, and run a process out of file descriptors.

When you finish, run `bash test_lab.sh`. You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **`OSError: [Errno 98] Address already in use`.** Another program (often an old copy of yours) holds the port.
   **Fix:** stop it, or use another port. Inside Docker, check what is published on your laptop with `docker ps`.
2. **A server bound to `127.0.0.1` inside a container.** It works inside, but nothing outside can reach it.
   **Fix:** bind to `0.0.0.0` in containers.
3. **`[Errno 24] Too many open files`.** The process hit its file descriptor limit, usually because it forgets to close files
   or connections. **Fix:** close them (use `with open(...)`), and raise the limit for servers that truly need many.
4. **Saying "the server is down" without checking which part.** **Fix:** is the machine reachable? Is the process running?
   Is it listening on the right port? Is it out of a resource?
5. **Reading load average without knowing the core count.** A load of 4 is idle for 16 cores and overloaded for 2.
   **Fix:** always compare with `nproc`.
6. **Hoping one perfect machine gives 99.99% uptime.** Every machine fails sometimes. **Fix:** plan for several machines (Level 5).

## 8. Quiz

<div class="bz-quiz" data-quiz="m01-05"></div>

## 9. What's next

**Module 1 is complete!** You know what's inside the machine that runs Bazaar: the CPU and its caches, RAM, the disk and its
file system, processes and threads, memory, and how a server program waits for and answers a request.

Next comes Module 2: [Linux and the command line](../02-linux-command-line/01-the-shell.md), where you learn to drive a server without a screen: the shell, files,
permissions, users, pipes, SSH, `systemd` and logs.

**In one line:** a server is a program that listens on a port (and the machine that runs it); every request travels
network card → kernel → socket → process, and uses CPU, RAM, disk and file descriptors, any of which can run out first.

### Cheat sheet

| Question | Linux | macOS |
| --- | --- | --- |
| What is listening, on which port? | `ss -ltnp` (or read `/proc/net/tcp`) | `lsof -nP -iTCP -sTCP:LISTEN` |
| How busy is the CPU? | `uptime` / `top` (load average vs `nproc`) | `uptime` / `top` |
| How much RAM is available? | `free -m` / `MemAvailable` in `/proc/meminfo` | Activity Monitor → Memory |
| Is the disk full? | `df -h` and `df -i` | `df -h` |
| File descriptor limit | `ulimit -n` | `ulimit -n` |
| Who is the machine? | `hostname`, `uname -a` | `hostname`, `uname -a` |

| Port | Usually |
| --- | --- |
| 22 | SSH (Module 2) |
| 80 / 443 | HTTP / HTTPS (Nginx) |
| 5432 | PostgreSQL |
| 6379 | Redis |
| 8000 | development servers (Django, our labs) |

| Uptime | Down per year |
| --- | --- |
| 99.9% | about 8.8 hours |
| 99.99% | about 53 minutes |

> **Next in Bazaar:** Bazaar's server has no screen. Everything happens in the terminal, over SSH. Time to become fluent
> in Linux and the command line.

<div class="bz-complete" data-lesson="m01-05"></div>
