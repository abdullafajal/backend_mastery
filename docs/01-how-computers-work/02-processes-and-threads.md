# Processes and threads

<div class="bz-meta" markdown>
**Module** 1 · How computers work
**Lesson** 2
**Reading time** 15 min (+ optional deeper parts)
**You will build** a Bazaar server with 4 processes and several threads, then watch, signal, kill and restart them with `ps`, `top` and `kill`
</div>

!!! abstract "In 1 minute"
    - A **process** is a program that is running right now. Each one gets a number (**PID**) and its **own memory**.
    - A **thread** is a worker inside a process. All threads of one process **share** its memory.
    - If one process crashes, the others keep running. If a thread breaks shared data, its whole process is affected.
    - Sharing has a danger: two threads changing the same data at once can oversell Bazaar's last earbuds (a **race condition**). A **lock** fixes it.
    - In the lab, you watch Bazaar's processes with `ps` and `top`, stop one with `kill`, and see the race happen.

> **Previously in Bazaar:** You raced RAM, the disk and the network, and saw that RAM is thousands
> of times faster. You also saw that RAM forgets, so important data must go to the disk.

## 1. Why learn this?

Bazaar's server now runs many programs at the same time: the backend, two email senders and an image cache.
Three strange things happen in one week:

1. At night, an email sender crashes. Will the whole shop go down with it?
2. During a sale, the website shows ₹899, but the order emails still say ₹999. Why?
3. Ten customers buy the last 8 Wireless Earbuds at the same moment. Bazaar sells **10**. How?

All three have the same root: **processes and threads**. Every backend tool you will meet later
(Gunicorn, PostgreSQL, Nginx, Celery, Docker) is built on these two ideas.
By the end of this lesson, you will be able to explain all three problems, and see them happen with your own eyes.

## 2. The concept

### Program vs. process

Let's start with a simple difference.

- A **program** is a file on the disk, full of instructions. `bazaar_shop.py` is a program.
  So is `python3` itself. A program on the disk does nothing. It just sits there, like a recipe book on a shelf.
- A **process** is a program that is **running right now**. The instructions are loaded into RAM,
  the CPU is following them, and the operating system is keeping notes about it.
  It is the actual cooking, not the recipe.

One program can become many processes. Bazaar starts `email_worker.py` twice, so there are
two email-worker processes, from one program file.

### The operating system: the manager

The **operating system** (OS) is the main program of a computer: Linux, macOS or Windows.
It starts other programs, shares the CPU and RAM between them, and keeps them from disturbing each other.

??? note "Going deeper: the kernel, system calls, and the OS's jobs"
    The **operating system** (OS) is the main program of a computer: Linux, macOS or Windows.
    Its core part is called the **kernel**. The kernel is the only program allowed to touch the hardware
    directly: the CPU, RAM, disk and network card.

    Every other program must **ask** the kernel for things. "Open this file." "Send this data over the network."
    "Start a new process." Each such request is called a **system call**.

    The kernel's jobs that matter for this lesson:

    1. **Start and stop processes**, and keep a list of all of them (the process table).
    2. **Share the CPU**: decide which process runs on which core, and for how long. This part is called the **scheduler**.
    3. **Give out memory**, and stop processes from touching each other's memory.
    4. **Deliver messages** (signals) to processes, like "please stop".

### What the OS gives every process

When a program starts, the OS gives it three things you'll see in the lab:

| What | Meaning | In the lab |
| --- | --- | --- |
| a **PID** (process ID) | a number that names this process | `7` for `bazaar-backend` |
| its **own memory** | a private area of RAM no other process can touch | `image-cache` keeps 110 MB of photos there |
| at least one **thread** | the worker that runs the code (next section) | the backend has 3 |

??? note "Going deeper: everything the OS gives a process (the full list)"
    When a process starts, the kernel gives it:

    | What | What it means | Example from the lab |
    | --- | --- | --- |
    | **PID** | Process ID: a number that names this process | `7` for `bazaar-backend` |
    | **PPID** | Parent process ID: who started it | email-workers have PPID `7` |
    | **Its own memory** | A private area of RAM. No other process can read or change it | `image-cache` keeps 110 MB of photos there |
    | **At least one thread** | The worker that actually runs the code | the backend has 3 |
    | **A user** | Which user it runs as; decides what it is allowed to do | `root` inside the container |
    | **A state** | Running, sleeping, stopped... (more below) | `S`, `R`, `Z` |
    | **An exit code**, at the end | `0` = success, anything else = failure | `-15` when killed with SIGTERM |

??? note "Going deeper: The process family tree"
    Every process is started by another process, its **parent**. So all processes form a tree.
    At the top is **PID 1**, the first process. On a normal Linux server, PID 1 is `systemd`.
    On a Mac it is `launchd`. Inside our lab container, it is `docker-init`.

    Here is Bazaar's family tree in the lab:

    ```
    docker-init (PID 1)
    └── python3 bazaar_shop.py (PID 7)      ← bazaar-backend
        ├── python3 email_worker.py (PID 8)
        ├── python3 email_worker.py (PID 9)
        └── python3 image_cache.py (PID 10)
    ```

    How does a parent start a child? On Linux, it takes two steps:

    1. **fork**: the parent asks the kernel to make a copy of itself. Now there are two identical processes.
    2. **exec**: the copy replaces its own program with a new one, for example `email_worker.py`.

    Python's `subprocess.Popen(["python3", "email_worker.py"])` does both for you.

??? note "Going deeper: The life of a process"
    A process goes through these stages:

    1. **Created.** The kernel gives it a PID, memory and one thread.
    2. **Ready.** It wants the CPU and waits for its turn.
    3. **Running.** A CPU core is following its instructions right now.
    4. **Sleeping.** It is waiting for something: a timer (`time.sleep`), a network reply, the disk.
       It uses no CPU while it sleeps. Most processes sleep most of the time.
    5. Steps 2–4 repeat many times a second.
    6. **Exits.** It finishes, or crashes, or is killed. It leaves behind an **exit code**.
    7. **Collected.** The parent reads the exit code (this is called **waiting** for the child).
       Only now is the process completely gone.

    Two special cases come from steps 6 and 7:

    - A **zombie** is a process that has exited, but its parent has not collected its exit code yet.
      It uses no CPU and almost no memory. It is just a line in the process table, waiting.
      A few for a moment are normal. Thousands mean the parent has a bug.
    - An **orphan** is a process whose parent died first. The kernel gives it a new parent: PID 1.
      That is one reason PID 1 is special. It must collect orphans when they exit.

    You will create a real zombie in the lab.

??? note "Going deeper: Signals: messages to a process"
    A **signal** is a short message the kernel delivers to a process. The `kill` command sends signals.
    (The name is old. Most signals don't kill anything.) The ones a backend developer must know:

    | Signal | Number | Who sends it | What it means |
    | --- | --- | --- | --- |
    | `SIGTERM` | 15 | `kill <pid>`, `docker stop` | "Please stop." The program can clean up first, or even ignore it. |
    | `SIGKILL` | 9 | `kill -9 <pid>` | "Stop now." The kernel ends it at once. It can't be caught or ignored. |
    | `SIGINT` | 2 | pressing `Ctrl+C` | "The user wants to stop." Python turns it into `KeyboardInterrupt`. |
    | `SIGHUP` | 1 | closing a terminal; some tools use it for "reload settings" | Nginx reloads its config on SIGHUP. |
    | `SIGCHLD` | 17 | the kernel | "One of your children stopped." Tells the parent to collect it. |

    When a signal ends a process, you see it in the exit code. Different tools show it differently:

    | Killed by | Python's `Popen.returncode` | A shell (`$?`) and Docker |
    | --- | --- | --- |
    | SIGTERM (15) | `-15` | `143` (128 + 15) |
    | SIGKILL (9) | `-9` | `137` (128 + 9) |

    Remember **137**. When a container dies with "exit code 137", something sent it SIGKILL.
    Very often that something is the kernel itself, because the container used too much memory.

### Threads: workers inside a process

A process starts with one thread. A **thread** is one line of work: the thing that actually
follows the instructions. A process can start more threads, so it can do several things at once.

What each thread has **of its own**:

- its own **position in the code** (which line it is running now);
- its own **stack**: the list of function calls it is inside right now (you will study it in the next lesson);
- its own copy of the CPU's working values (registers) while it runs.

What all threads of a process **share**:

- all the **memory**: global variables, objects, dicts, lists;
- the open files and network connections;
- the PID.

Why start more threads? Because most backend work is **waiting**: for the database, the network or the disk.
While one thread waits for the database, another thread can answer a different customer.
That is why Bazaar's backend gives **every web request its own thread**. You will see that thread appear in the lab.

??? note "Going deeper: Sharing one CPU: the scheduler and context switches"
    A laptop has maybe 8 cores. It runs hundreds of processes and thousands of threads. How?

    The scheduler gives each ready thread a short turn on a core, called a **time slice** (a few milliseconds).
    When the turn ends, or the thread starts waiting, the kernel does a **context switch**:

    1. It stops the current thread (a timer fires, or the thread itself starts waiting).
    2. It saves that thread's position in the code and its register values.
    3. It picks the next ready thread.
    4. It loads that thread's saved position and registers.
    5. The new thread continues exactly where it stopped last time, as if nothing happened.

    This happens thousands of times per second, so everything **seems** to run at the same time.

    Two words for this, often mixed up:

    - **Concurrency**: many tasks are *in progress* at once, taking turns. One cook stirring two pots.
    - **Parallelism**: many tasks *run* at the very same instant, on different cores. Two cooks, one pot each.

    In Python, only **one thread at a time** can run Python code inside one process.
    This rule is called the **GIL** (Global Interpreter Lock), and you will study it in Module 5.
    So Python threads give you concurrency (great for waiting) but not much parallelism for heavy calculations.
    For heavy calculations, Python backends use several **processes**.

### The food court analogy, and where it breaks

Think of Bazaar's food court:

- Each **restaurant** is a **process**. It has its own kitchen and its own fridge (memory).
  A fire in one restaurant doesn't burn the one next door.
- Each **cook** in a restaurant is a **thread**. All cooks share one kitchen and one fridge.
  Passing things around is quick. But if one cook spills oil, everyone in that kitchen slips.
- To send food to another restaurant, someone must carry it over (a network call, a database, a message).

Where the analogy breaks: real cooks can **see** each other and say "wait, I'm using the last tomato".
Threads can't. Each one runs blindly, and the scheduler can pause it at any moment, even in the middle of a job.
That leads to the most famous bug of shared memory.

### The danger of sharing: race conditions

Bazaar has 1 pair of Wireless Earbuds left. Asha and Ravi press "Buy" at the same moment.
Each request runs in its own thread, and each does three steps: **read** the stock, **check** it, **write** the new stock.
Here is one possible order, with the scheduler switching between them:

| Time | Asha's thread | Ravi's thread | Stock in memory |
| --- | --- | --- | --- |
| 1 | reads stock: 1 | | 1 |
| 2 | | reads stock: 1 | 1 |
| 3 | 1 > 0, OK, sells | | 1 |
| 4 | | 1 > 0, OK, sells | 1 |
| 5 | writes 1 − 1 = 0 | | 0 |
| 6 | | writes 1 − 1 = 0 | 0 |

Both got a "pair". Bazaar sold 2 earbuds but had only 1. The stock still says 0, so nobody even notices.

When the result depends on the exact timing of threads, it is called a **race condition**.
It may work 999 times and fail on the 1000th, on the busiest day of the year.

The fix is a **lock**: a token that only one thread can hold at a time. A thread takes the lock,
does all three steps, then gives the lock back. The next thread waits for its turn.
Now the three steps can never be mixed up.

Databases face the same problem with orders. You will use database locks and transactions
for exactly this in Module 9 and Module 16.

### Processes or threads?

| | Processes | Threads |
| --- | --- | --- |
| Memory | Each has its own | Share one memory |
| Sharing data | Slower: must send it (database, network, files) | Fast: just read the same variable |
| Danger | Little: they can't touch each other | Race conditions; a bad thread can corrupt shared data |
| If one crashes | Only that one stops | It can take the whole process down |
| Cost to start | Heavier: new memory, new PID | Lighter |
| In Python | Real parallel work on many cores | Great for waiting; one runs Python code at a time (GIL) |

??? note "Going deeper: In the real world"
    You will meet these designs again and again in this course:

    - **Gunicorn** (Module 20) runs Bazaar's Django code: one **master process** that starts several
      **worker processes** and restarts any that die. Exactly like the supervisor you run today.
    - **PostgreSQL** (Modules 14–17) starts **one process for every connection**. That is why too many
      connections tire it out, and why Bazaar adds PgBouncer in Module 17.
    - **Nginx** (Modules 20 and 27) has a master process and a few worker processes, and reloads its settings on `SIGHUP`.
    - **Celery** (Module 21) runs background jobs, like order emails, in worker processes.
    - **Redis** (Module 22) runs its commands on one main thread, so commands never race each other.
    - **Your web browser** usually runs each tab in its own process, so one broken page can't crash the whole browser.
    - A **Docker container** is simply a group of processes with walls around them (Module 19).

### Questions you may have

**Is a container a process?**
A container is one or more ordinary processes. The kernel puts walls around them: they get their own
PID numbers (starting at 1), their own file system and their own network. From your computer,
`docker compose top` shows the same processes with the computer's real PIDs (like `6650` instead of `7`).

**Why does my laptop run hundreds of processes?**
Every app, background helper and system service is a process. Our test Mac was running **611** at the
moment we counted. Almost all of them were sleeping, using no CPU.

**How many threads can one process have?**
Thousands. But each thread needs its own stack memory, and the scheduler has more to juggle.
Real servers use a fixed group of threads (a **thread pool**) instead of creating them without limit.

**If processes can't share memory, how do Bazaar's servers share data?**
Through something they can all reach: a database (PostgreSQL), a cache (Redis), files, or messages
(Kafka in Module 29). That is a big part of what backend engineering is about.

**Does `kill` always kill?**
No. Plain `kill` sends SIGTERM, which a program may catch to clean up, or ignore.
`kill -9` sends SIGKILL, which can't be caught. Use `kill -9` only when SIGTERM didn't work,
because the program gets no chance to save its work.

**Why is PID 1 special?**
It adopts orphans and must collect them. Also, the Linux kernel protects PID 1: signals that
PID 1 has no handler for are simply ignored. A plain Python program doesn't handle SIGTERM.
So if Python is PID 1 in a container, `docker stop`'s SIGTERM does nothing, and Docker must use SIGKILL.
That is why the lab uses `init: true`: `docker-init` becomes PID 1 and passes signals on properly.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="processes-threads"></div>

## 4. Code example

### Threads share memory, processes don't

This script adds a Masala Box to Asha's cart three times with **threads**, then three times with
**processes**, and checks what the main program sees.

```python title="share_or_not.py"
--8<-- "labs/01-how-computers-work/02-processes-and-threads/examples/share_or_not.py"
```

Output inside the lab container (Linux):

```
Main program, PID 40
1) Three THREADS add to the cart:
  inside PID 40: the cart has 1 item(s)
  inside PID 40: the cart has 2 item(s)
  inside PID 40: the cart has 3 item(s)
   After the threads, the main program sees 3 item(s).
2) Three PROCESSES add to the cart:
  inside PID 49: the cart has 4 item(s)
  inside PID 50: the cart has 4 item(s)
  inside PID 51: the cart has 4 item(s)
   After the processes, the main program sees 3 item(s).
```

Let's read it line by line:

- All three threads print the **same** PID, 40. They are inside one process.
- They change the **same** cart, so it grows: 1, 2, 3.
- Each process has its **own** PID: 49, 50, 51.
- Each one adds an item to **its own copy** of the cart (why it starts at 3 is explained in part 5).
- The main program still sees **3**. The processes' changes never reached it.

### A race condition, for real

This script lets 10 customers buy the last 8 Wireless Earbuds at the same moment, first without a lock, then with one.

```python title="last_earbuds.py"
--8<-- "labs/01-how-computers-work/02-processes-and-threads/examples/last_earbuds.py"
```

Output on our test machine (the "stock now says" number can change from run to run):

```
Without a lock:
  sold 10 pairs, stock now says 7
With a lock:
  sold 8 pairs, stock now says 0
```

Without a lock, Bazaar sold **10 pairs while having only 8**, and the stock number is wrong too (7, not 0).
The `time.sleep(0.001)` stands for a short wait, like a database call. During that wait, the scheduler lets
the other threads run, and they all read the old stock. With the lock, only one thread at a time can be
between "read" and "write", so exactly 8 pairs are sold.

## 5. Under the hood

??? note "Going deeper: Why '4 items' on Linux, but '1 item' on a Mac?"
    Run `share_or_not.py` on a Mac and the processes print `the cart has 1 item(s)`. On Linux they print `4`.

    - On **Linux**, Python starts the new process with **fork**: a **copy** of the parent, memory and all.
      The copy already has 3 items, then adds 1 → 4.
    - On **macOS and Windows**, Python uses **spawn**: a **fresh** Python process that reads the file again.
      Its cart starts empty, then adds 1 → 1.

    Either way, the new process works on its own copy. That is also why the script needs
    `if __name__ == "__main__":`. With spawn, the new process re-reads the file, and that line stops it
    from trying to start even more processes.

??? note "Going deeper: copy-on-write"
    If fork copied all memory, starting a process with 2 GB of data would copy 2 GB. It doesn't.
    The kernel uses **copy-on-write**: parent and child share the same memory pages, marked read-only.
    Only when one of them **writes** to a page does the kernel copy that one page.
    Gunicorn uses this with its `--preload` option, so many workers share one copy of Django's loaded code.

### Reading `ps`, column by column

In the lab, you run `ps -eo pid,ppid,stat,nlwp,rss,cmd` inside the container:

```
  PID  PPID STAT NLWP   RSS CMD
    1     0 Ss      1   464 /sbin/docker-init -- python3 -u bazaar_shop.py
    7     1 Sl      3 22848 python3 -u bazaar_shop.py
    8     7 S       1  7736 python3 email_worker.py
    9     7 S       1  7740 python3 email_worker.py
   10     7 S       1 110232 python3 image_cache.py
   27     0 Rs      1  3132 ps -eo pid,ppid,stat,nlwp,cmd
```

| Column | Meaning |
| --- | --- |
| `PID` | The process's number. |
| `PPID` | Its parent's number. The workers' parent is 7, the backend. `ps` has PPID 0 because it was started from outside the container. |
| `STAT` | Its state. The first letter is the main state; the letters after it are extra notes (table below). |
| `NLWP` | Number of threads ("light-weight processes", the kernel's name for threads). The backend has 3. |
| `RSS` | RAM really used right now, in KB. `image-cache` uses about 110,000 KB = about 110 MB. |
| `CMD` | The command that started it. |

The `STAT` letters:

| Letter | Meaning |
| --- | --- |
| `R` | Running, or ready to run |
| `S` | Sleeping: waiting for something (a timer, the network...) |
| `D` | Waiting for the disk, and can't be interrupted. Many `D` processes often mean a slow disk |
| `Z` | Zombie: finished, but not yet collected by its parent |
| `T` | Stopped (paused), for example with `Ctrl+Z` |
| `s` (2nd letter) | Session leader: the first process of a group, like PID 1 |
| `l` (2nd letter) | Has several threads (`Sl` = sleeping, multi-threaded) |

So `Sl` for PID 7 means: "sleeping right now, and it has several threads". `Rs` for `ps` means:
"running" (of course, it's the one printing this) "and a session leader".

??? note "Going deeper: Reading `top`"
    `top` refreshes every few seconds. Its header looks like this:

    ```
    top - 07:41:50 up 0 min,  0 users,  load average: 0.50, 0.12, 0.04
    Tasks:   6 total,   1 running,   5 sleeping,   0 stopped,   0 zombie
    %Cpu(s): 13.1 us,  0.2 sy,  0.0 ni, 86.6 id,  0.0 wa,  0.0 hi,  0.1 si,  0.0 st
    MiB Mem :   3918.9 total,   3178.0 free,    587.5 used,    286.4 buff/cache
    MiB Swap:   1024.0 total,   1024.0 free,      0.0 used.   3331.3 avail Mem
    ```

    - **load average**: on average, how many threads were running or waiting for a CPU,
      over the last 1, 5 and 15 minutes. Compare it with your number of cores:
      a load of 8 on 8 cores means "fully busy"; 16 means "threads are queuing".
    - **Tasks**: how many processes, and in which state. Note the `zombie` count.
    - **%Cpu(s)**: where all the CPU time went, in percent of the whole machine:
      `us` = your programs' code, `sy` = the kernel's work (system calls), `id` = idle (free),
      `wa` = waiting for the disk, `st` = time "stolen" by the machine hosting this virtual machine.
      `ni`, `hi`, `si` are low-priority programs and hardware/software interrupts; usually near 0.
    - **Mem / Swap**: RAM in MiB. `buff/cache` is the page cache from Lesson 1. **Swap** is disk space
      used as emergency RAM; much slower, so a lot of swap use means the computer is short of RAM.

    And the process lines:

    ```
      PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
        7 root      20   0  328944  22864   8816 S 100.0   0.6   0:02.46 python3
       10 root      20   0  114468 110216   4860 S   0.0   2.7   0:00.05 python3
    ```

    | Column | Meaning |
    | --- | --- |
    | `PR`, `NI` | Priority and "niceness". A higher NI makes a process more polite: it gets less CPU. |
    | `VIRT` | All memory the process has **reserved**, in KB, including parts it never really used. Usually much bigger than RES. Don't panic about it. |
    | `RES` | Memory really in RAM right now (the same as RSS in `ps`). **This is the number to watch.** |
    | `SHR` | The part of RES that other processes can share too (like Python's own code libraries). |
    | `S` | State, as in `ps`. |
    | `%CPU` | Share of **one** core, measured **just now**. 100% = one full core. With 8 cores the max is 800%. |
    | `%MEM` | RES as a percentage of total RAM. |
    | `TIME+` | Total CPU time used since the process started. |

    Note: `ps` also has a `%CPU` column, but it is the average over the process's **whole life**.
    For "what is busy right now", always use `top`.

??? note "Going deeper: Everything is in /proc"
    On Linux, the kernel shows every process as a folder of text files: `/proc/<PID>/`. Tools like `ps`
    and `top` simply read these files. Try it in the lab:

    ```
    $ grep -E "Threads|VmRSS|ctxt" /proc/7/status
    VmRSS:	   22856 kB
    Threads:	3
    voluntary_ctxt_switches:	43
    nonvoluntary_ctxt_switches:	12
    ```

    `voluntary` context switches happened because the thread itself started waiting (like `time.sleep`).
    `nonvoluntary` ones happened because the scheduler took the CPU away when the time slice ended.
    These two numbers are for the process's main thread.

??? note "Going deeper: What `docker stop` really does"
    1. Docker sends **SIGTERM** to PID 1 in the container.
    2. It waits a **grace period** for the program to clean up and exit.
    3. If it is still running, Docker sends **SIGKILL**.

    The grace period depends on your Docker version and settings. On our test machine (Docker 29) it was
    1 second; many setups use 10 seconds. In `docker-compose.yml` you can set it per service with `stop_grace_period`.

    We tested Python as PID 1 **without** `init: true`: SIGTERM was ignored (PID 1 protection), Docker had to use
    SIGKILL, and the container ended with exit code **137**. **With** `init: true`, `docker-init` passed SIGTERM to
    Python, which stopped at once, with exit code **143**. Bazaar's real servers will catch SIGTERM and finish
    their current requests first. That is called a **graceful shutdown** (Module 20).

??? note "Going deeper: the kernel's view of threads"
    To the Linux kernel, a thread and a process are almost the same thing: both are a "task" it can schedule.
    The difference is only what they share. Threads are tasks that share memory, open files and a PID.
    That is why `ps -T` shows each thread with its own ID (`SPID`), and why `ps` calls threads "light-weight
    processes" (`NLWP`).

## 6. Lab

**Lab folder:** `labs/01-how-computers-work/02-processes-and-threads/`

```bash
cd labs/01-how-computers-work/02-processes-and-threads
docker compose up -d --build --wait
docker compose exec bazaar ps -eo pid,ppid,stat,nlwp,rss,cmd
```

Expected output: the process table from part 5. In the lab you will:

1. read the process tree with `ps`, and the threads with `ps -T`;
2. watch a new thread appear for one web request, and burn a CPU core in `top`;
3. send `SIGTERM` and `SIGKILL`, and watch the supervisor report them and restart the worker;
4. create a real zombie;
5. run both code examples, including the earbuds race condition;
6. peek into `/proc`.

When you finish, run `bash test_lab.sh`. You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Sharing data between processes with a normal variable.** Each process has its own copy,
   so changes are silently lost (like the ₹999 in the order emails).
   **Fix:** keep shared data in a database or a cache like Redis.
2. **Read, check, then write, from several threads without a lock.** Works in testing, oversells on sale day.
   **Fix:** use a lock in Python, or let the database do it (Module 9 and 16).
3. **Using `kill -9` first.** The program gets no chance to finish its work or close files cleanly.
   **Fix:** send plain `kill` (SIGTERM) first. Use `kill -9` only if it doesn't stop.
4. **"My container exited with code 137" and no idea why.** 137 = 128 + 9: it got SIGKILL.
   **Fix:** check if it ran out of memory (`docker inspect <container>` shows `"OOMKilled": true`), or if it ignored SIGTERM.
5. **Forgetting `if __name__ == "__main__":`** when starting processes. On Mac and Windows,
   Python stops with a long `RuntimeError` about the "bootstrapping phase".
   **Fix:** put the code that starts processes under that line.
6. **Reading `%CPU` wrong.** In `top`, 100% means one **core** is fully busy, not the whole computer.
   And `%CPU` in `ps` is a lifetime average. **Fix:** use `top` for "now", and compare with your core count.
7. **Expecting Python threads to speed up heavy calculations.** Because of the GIL, they take turns.
   **Fix:** threads for waiting work; several processes for heavy CPU work (Module 5).

## 8. Quiz

<div class="bz-quiz" data-quiz="m01-02"></div>

## 9. What's next

Next: [Memory: stack and heap](03-stack-and-heap.md). You will look inside a process's memory.

**In one line:** a process is a running program with its own memory and PID; threads are workers inside it
that share that memory, which is fast, but needs locks to stay correct.

### Cheat sheet

| Task | Linux (and inside the lab container) | macOS | Windows |
| --- | --- | --- | --- |
| List all processes | `ps -eo pid,ppid,stat,nlwp,rss,cmd` | `ps -eo pid,ppid,stat,rss,command` | `tasklist` |
| Live view of CPU and RAM | `top` (press `q` to quit) | `top` or Activity Monitor | Task Manager |
| Threads of one process | `ps -T -p <pid>` | Activity Monitor → Threads column | Task Manager → Details |
| Find a PID by name | `pgrep -f email_worker` | `pgrep -f email_worker` | `tasklist /fi "imagename eq python.exe"` |
| Ask a process to stop | `kill <pid>` (SIGTERM) | `kill <pid>` | `taskkill /pid <pid>` |
| Force it to stop | `kill -9 <pid>` (SIGKILL) | `kill -9 <pid>` | `taskkill /pid <pid> /f` |
| RAM overview | `free -m` | Activity Monitor → Memory | Task Manager → Performance |
| Processes of a container, from outside | `docker compose top` | same | same |

| Fact | Value |
| --- | --- |
| Exit code for success | `0` |
| Killed by SIGTERM | Python `-15`, shell/Docker `143` |
| Killed by SIGKILL | Python `-9`, shell/Docker `137` |
| Zombie in `ps` | `STAT` = `Z`, command shows `<defunct>` |
| `top` 100% CPU | one full core |

> **Next in Bazaar:** `image-cache` uses 110 MB of RAM, and every thread has "its own stack".
> Where exactly does a program keep its data, and how does Python clean it up? Let's look inside memory.

<div class="bz-complete" data-lesson="m01-02"></div>
