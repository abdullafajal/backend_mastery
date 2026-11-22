# CPU, RAM and disk

<div class="bz-meta" markdown>
**Module** 1 · How computers work
**Lesson** 1
**Reading time** 15 min (+ optional deeper parts)
**You will build** a speed race that measures RAM, disk and network on your own computer, and a test that shows the cache at work
</div>

!!! abstract "In 1 minute"
    - The **CPU** does the work. **RAM** is fast working memory, but forgets everything when the power goes off.
    - The **disk** is slower, but it **remembers**. Anything Bazaar must keep (like orders) goes to the disk.
    - The **network** (another server) is the slowest of all.
    - The gaps are huge: RAM is about 1,000 times faster than the disk.
    - So: keep busy data in RAM, save important data to disk properly, and make few network trips.

> **Previously in Bazaar:** Your computer is ready: Python, VS Code, Git and Docker all work.
> You ran your first container and checked your whole setup.

## 1. Why learn this?

Bazaar's product page reads products from a file and asks another server how many shoes are in stock.
One day it takes 300 milliseconds instead of 3. Where did the time go?

To answer that, you must know **where data lives** and **how long each trip takes**.
The gaps are not small. Fetching something from the other side of the world is about two million times
slower than fetching it from RAM. Almost every speed problem in a backend, and almost every speed fix
(caches, indexes, connection pools, CDNs), comes back to these gaps. This lesson gives you the map.

## 2. The concept

### The parts of a computer

Every computer, from your phone to Bazaar's biggest server, has the same main parts:

| Part | Job | Typical size | Keeps data without power? |
| --- | --- | --- | --- |
| **CPU** | does the work: follows instructions | — | — |
| **CPU cache** | tiny, super-fast memory inside the CPU | KB to a few MB | no |
| **RAM** | working memory for running programs | 8–64 GB (laptop), up to TBs (servers) | no |
| **Disk** (SSD or HDD) | long-term storage for files and databases | hundreds of GB to many TB | **yes** |
| **Network** | reaches other computers | — | — |

Our test machine, for example: an **Apple M1** CPU with 8 cores, 8 GB of RAM, and a 128 KB cache
(per fast core) close to each core plus a 12 MB cache shared by them.

??? note "Going deeper: The CPU: the worker"
    The **CPU** (Central Processing Unit) does the actual work. It understands only very simple
    **instructions**: "load this number", "add these two", "compare", "jump to another instruction".
    Your Python line `total = price * quantity` becomes several of these.

    The CPU runs a loop, billions of times per second:

    1. **Fetch** the next instruction from memory.
    2. **Decode** it: what does it ask for?
    3. **Execute** it: add, compare, load, store...
    4. Move on to the next instruction, and repeat.

    How fast is "billions"? CPU speed is measured in **gigahertz** (GHz): 1 GHz = one billion ticks per second.
    A 3 GHz CPU ticks 3 billion times per second, and a modern core can finish several instructions per tick.

    The CPU keeps the few values it is working on right now in **registers**: a handful of tiny storage
    spots inside the CPU, the fastest memory of all.

    A CPU has several **cores**. Each core is a full worker with its own fetch-decode-execute loop.
    8 cores can truly do 8 things at the same instant. (Some CPUs, like Apple's M1, mix fast
    "performance" cores and power-saving "efficiency" cores.)

### RAM: the working memory

**RAM** (Random Access Memory) holds the data of every running program: your variables, lists, dicts,
and the program's own instructions. "Random access" means any spot can be read just as quickly as any other,
like opening a book at any page instead of reading from the start.

RAM is a long row of numbered boxes, one **byte** each. A byte is 8 **bits**, and a bit is a single 0 or 1.
Each box's number is its **address**. When Python stores the price `999`, it really stores some bytes
at some address.

RAM is fast, but it is limited, and it **forgets everything when the power goes off**.
That is called **volatile** memory.

??? note "Going deeper: The disk: the long-term store"
    The **disk** keeps files, even with the power off (**non-volatile**). There are two kinds:

    - An **SSD** (Solid State Drive) stores data in memory chips. No moving parts. This is what most
      laptops and servers use today.
    - An **HDD** (Hard Disk Drive) stores data on spinning metal plates, read by a moving arm. Cheaper per GB,
      but each random read waits for the arm to move and the plate to turn: several milliseconds.

    Disks read and write in fixed-size chunks called **blocks**, often 4 KB. Even to read one byte,
    the disk reads the whole block around it.

??? note "Going deeper: The network: other computers"
    The **network** connects your computer to other computers. Two different words describe it,
    and people mix them up all the time:

    - **Latency**: how long one small message takes to get there and back. Like the **length** of a pipe.
    - **Bandwidth**: how much data can flow per second. Like the **width** of a pipe.

    A wide pipe doesn't make a long pipe short. Downloading a big file is about bandwidth.
    Bazaar's many small requests are mostly about latency.

    Latency has a hard floor: the speed of light. In glass fibre, light travels about 200,000 km per second.
    Mumbai to the east coast of the USA is about 12,500 km in a straight line. Just for light, a round trip takes
    at least 125 ms. Real cables are not straight, and routers add delays, so real trips take around 200 ms.
    No amount of money makes that faster. Only being closer does. That is why big companies put servers in many countries.

??? note "Going deeper: Why the speeds are so different"
    1. **Distance.** Registers and caches are inside the CPU. RAM is a few centimetres away.
       The disk is further, and talks through a slower connection. A far server can be thousands of kilometres away.
    2. **Cost.** Fast memory is expensive per byte, so computers have only a little of it.
       Slow storage is cheap, so they have a lot. This trade-off is why there are so many levels.
    3. **Remembering.** RAM forgets when the power goes off. A disk must **really** store data,
       so it survives. That extra safety takes extra time.

    Put together, they form the **memory hierarchy**: a pyramid with small, fast, expensive memory at the top,
    and big, slow, cheap storage at the bottom.

    | Level | Typical size | One trip takes about | In human time (1 ns = 1 s) |
    | --- | --- | --- | --- |
    | CPU register | a few hundred bytes | under 1 ns | under a second |
    | CPU cache | KB to MB | 1–10 ns | seconds |
    | RAM | GB | 100 ns | about 1.5 minutes |
    | SSD | hundreds of GB to TB | 0.1 ms | about 1 day |
    | HDD | TB | 5–10 ms | months |
    | Server, same data centre | — | 0.5 ms | about 6 days |
    | Server in another country | — | 200 ms | about 6 years |

    These are typical, rounded numbers. Real ones change from computer to computer.
    The **gaps** between the levels are what matter, and they stay huge.

??? note "Going deeper: Why caches work: locality"
    If cache is so small, how does it help at all? Because programs are predictable in two ways:

    - **Temporal locality**: data used now will probably be used again soon. (The homepage products are read again and again.)
    - **Spatial locality**: data next to what you used will probably be used next. (After product 1, you read product 2.)

    So when the CPU reads one byte from RAM, it fetches a whole **cache line** around it
    (128 bytes on our M1, 64 bytes on most Intel and AMD CPUs). If the next read is nearby, it's already in the cache.
    Reading data **in order** is much faster than jumping around randomly. You will measure this in the lab.

    The same two ideas power every cache you will build later: Redis for Bazaar's homepage (Module 22),
    the database's own memory (Module 16), and CDNs for product images.

### A chef in a kitchen

Let's understand the whole hierarchy with a small example: a chef cooking Bazaar's famous Masala Box.

| Kitchen | Computer | How long to get an ingredient |
| --- | --- | --- |
| The chef | CPU | — |
| Spices already in the chef's hand | registers / CPU cache | instantly |
| The kitchen counter | RAM | a few steps |
| The store room in the basement | Disk | walk downstairs and back |
| A shop across the city | Another server, same data centre | a long trip |
| A shop in another country | A server far away | a journey |

A good chef keeps what they use most on the counter, and brings up a whole tray from the store room at once
instead of one spice per trip. A good backend keeps busy data in RAM, and fetches in batches.

**Where the analogy breaks:** the kitchen counter keeps its things overnight. RAM does not: when the power goes,
everything on it is gone. Only the store room (the disk) remembers.

### The units

Computer times are tiny, and sizes are huge, so we use special units:

| Time | Meaning |
| --- | --- |
| 1 millisecond (**ms**) | one thousandth of a second |
| 1 microsecond (**µs**) | one millionth of a second (1,000 µs = 1 ms) |
| 1 nanosecond (**ns**) | one billionth of a second (1,000 ns = 1 µs) |

| Size | Meaning |
| --- | --- |
| 1 **bit** | a single 0 or 1 |
| 1 **byte** (B) | 8 bits: enough for one English letter |
| 1 **KB** / **MB** / **GB** / **TB** | about a thousand / million / billion / trillion bytes |

Careful with the network: speeds are given in **bits** per second (Mbps), files in **bytes** (MB).
A 100 Mbps connection moves at most 100 ÷ 8 = 12.5 MB per second.

Also, some tools count 1 KB as 1,000 bytes, others as 1,024 bytes (sometimes written **KiB**).
That is why `free -m` and your laptop's settings can show slightly different numbers for the same RAM.

### What this means for Bazaar's backend

Three rules you will use in the whole course:

1. **Keep busy data in RAM.** The homepage products are read thousands of times a minute.
   Later, Bazaar keeps them in a cache called Redis (Module 22).
2. **Save important data to disk, properly.** An order must survive a power cut.
   Databases do this carefully (Module 16).
3. **Count your network trips.** One trip is fine. A hundred trips for one page is slow.
   You will meet this as the "N+1 problem" in Module 9.

### Questions you may have

**Why not build the whole computer out of cache memory?**
Cost and size. Cache memory takes much more chip space and money per byte. A computer with 8 GB of cache
would be absurdly expensive. The hierarchy gives you most of the speed for a small part of the price.

**What happens when RAM is full?**
The operating system moves some less-used memory to the disk, into an area called **swap**.
Programs keep running, but every trip to swapped memory is now a disk trip: everything becomes very slow.
If even that isn't enough, Linux kills a process to free memory (the "out of memory killer"). You will see
exit code 137 from that in Module 19.

**Is a higher GHz always faster?**
No. How much work a core does per tick, how big its caches are, and how many cores there are matter just as much.
A newer 3 GHz CPU can easily beat an older 4 GHz one.

**What does "64-bit" mean?**
The CPU works with 64-bit numbers and 64-bit addresses. That lets a program address far more RAM than
the 4 GB limit of old 32-bit computers. Our lab container reports `CPU op-mode(s): 64-bit`.

**Is "the cloud" a disk?**
Cloud storage is disks in someone else's data centre, reached over the network. So it has network latency on top
of disk latency. That is why Bazaar keeps product images in object storage (Module 18), but not its hot data.

**Why is the first request after a restart slower?**
The caches are empty ("cold"): nothing is in the CPU cache, the page cache, or Bazaar's own cache yet.
After a few requests they are "warm", and everything speeds up. Always measure more than once.

## 3. See it in action

Press **Play** to fetch the price from five places. Then switch **Show** to **human time**.
In human time, we stretch 1 nanosecond into 1 second, so the gaps become something you can feel.

<div class="bz-diagram" data-diagram="memory-race"></div>

## 4. Code example

### The speed race

This script runs the race for real. It fetches Bazaar data four ways, many times,
and prints the average time of one trip.

```python title="speed_race.py"
--8<-- "labs/01-how-computers-work/01-cpu-ram-and-disk/app/speed_race.py"
```

How it works, step by step:

1. `average_time(job, repeat)` runs a small function many times and divides the total time by the count.
   One single measurement is too noisy; the average of thousands is stable.
2. `from_ram()` looks up a product in a Python `dict` that is already in memory.
3. `read_from_disk()` opens `products.json` and reads it.
4. `save_to_disk()` appends one order to a file, then calls `flush()` and `os.fsync()` (explained in part 5).
5. `over_network()` asks `inventory-service`, a second server in another container, for the stock of product 1.
   It keeps one connection open and reuses it, like real backends do.
6. The table shows each average, and how many times slower it is than RAM.

In the lab, it runs in one container and talks to `inventory-service` in another.
Here is the output from our test machine:

```
where the data comes from |   one trip | vs RAM
--------------------------+------------+-----------
RAM (dict lookup)         |      53 ns |        1x
Disk read (file)          |      83 µs |    1,563x
Disk save (fsync)         |     335 µs |    6,303x
Network (other server)    |     163 µs |    3,071x
```

Reading one product from RAM took 53 **nano**seconds. Saving one order safely took 335 **micro**seconds.
That is about 6,000 times slower. Your numbers will be different, but the gaps will be big.

(Why is "RAM" 53 ns and not 100? Because the dict was used a million times in a row, so it sits in the
CPU cache. Most of the 53 ns is Python's own work for one lookup.)

??? note "Going deeper: Locality: order matters"
    This second script reads 10 million prices twice: once in order, once in a random order.
    Same data, same number of reads, same additions.

    ```python title="locality.py"
    --8<-- "labs/01-how-computers-work/01-cpu-ram-and-disk/app/locality.py"
    ```

    Output on our test machine:

    ```
    in order      2.75 s   (total = 49,999,995,000,000)
    random order  6.67 s   (total = 49,999,995,000,000)
    ```

    The same total, but the random order took about **2.4 times longer**. In order, each cache line brings
    the next several prices along for free. In random order, almost every read is a new trip to RAM.
    Across our runs the gap stayed between about 2.3x and 2.8x.

## 5. Under the hood

### What does fsync do?

When Python writes to a file, the operating system does **not** go to the disk straight away.
It keeps the text in RAM and writes it to the disk a little later, in bigger batches. That is faster.

`orders.flush()` moves the text from Python's own buffer to the operating system.
`os.fsync()` then says: "Put it on the disk **now**, and wait until it is really there."
In the lab you will remove that one line. Saving then takes about **900 ns** instead of about **335 µs**.

So why not remove it in Bazaar? Because until the OS writes it, the order lives only in RAM.
If the power goes off in that moment, Asha's order is **lost**, even though Bazaar told her "Order placed!".
Databases call `fsync` every time an order is saved. You will see how in Module 16.

### Why was the network so fast here?

In the lab, both containers run on **your** computer. Their "network" never leaves the machine.
That is the best case. In a real data centre, one trip to another server takes about 0.5 ms.
To another country, about 200 ms.

??? note "Going deeper: the 40 ms bug we hit while building this lab"
    Our first version of `inventory-service` took **43 ms** per network trip, not 0.15 ms. The cause was a classic
    TCP problem: the server sent the headers and the body as two small pieces. TCP's **Nagle algorithm** held back
    the second piece, waiting to bundle it; the client's **delayed ACK** waited too. Each waited for the other,
    for about 40 ms. One line, `disable_nagle_algorithm = True`, fixed it. You will meet TCP properly in Module 7,
    and this exact bug again in Module 17.

??? note "Going deeper: Why was 'disk read' faster than writing?"
    The operating system keeps files you read recently in spare RAM. This is called the **page cache**.
    So after the first read, `products.json` mostly comes from RAM, not from the disk.

    Then why 83 µs? Most of it is Docker's **shared folder** between your laptop and the container.
    We measured the same file in three ways on our test machine:

    | How the file was read | One read |
    | --- | --- |
    | From the shared folder (`./app` on your laptop) | about 74 µs |
    | From a folder inside the container | about 4 µs |
    | From a file that was already open | about 2 µs |

    You will study files and folders in Lesson 4 of this module.

??? note "Going deeper: Seeing your own hardware"
    In the lab container:

    ```
    $ nproc
    8
    $ head -1 /proc/meminfo
    MemTotal:        4012908 kB
    $ lscpu | head -5
    Architecture:                            aarch64
    CPU op-mode(s):                          64-bit
    Byte Order:                              Little Endian
    CPU(s):                                  8
    On-line CPU(s) list:                     0-7
    ```

    - `nproc`: how many cores this container may use.
    - `MemTotal`: RAM in KB. About 4 GB here: Docker Desktop's Linux VM has its own limit, smaller than the laptop's 8 GB.
    - `aarch64`: the CPU family. `aarch64` (also called ARM64) is used by Apple's M chips and many phones and servers.
      Most Windows laptops and many servers use `x86_64` instead (Intel and AMD).
    - `Byte Order: Little Endian`: the order in which a number's bytes are stored in memory. Almost all computers today are little endian.

??? note "Going deeper: where the famous latency numbers come from"
    The "every programmer should know these latency numbers" list was popularised by engineers at Google
    (Jeff Dean and Peter Norvig) in the 2000s. The exact values have improved since (SSDs especially), but the
    *shape* has not changed: each level is many times slower than the one above. That's why this lesson gives
    rounded "about" numbers, and asks you to measure your own.

## 6. Lab

**Lab folder:** `labs/01-how-computers-work/01-cpu-ram-and-disk/`

```bash
cd labs/01-how-computers-work/01-cpu-ram-and-disk
docker compose up -d --wait
docker compose run --rm race
```

Expected output: a table like the one above. RAM is in **ns**; the other three are in **µs**.

In the lab README, you will also see your saved orders survive after the container is gone,
remove `fsync` to see the speed and the danger, check how many CPUs and how much RAM Docker can use,
and run the locality test. When you finish, run `bash test_lab.sh`. You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **"The disk is just slow RAM."** No. The disk **keeps** data when the power goes off. RAM does not.
   **Fix:** anything that must survive (orders, payments) goes to the disk, through a database.
2. **Loading everything into RAM.** RAM is small. Bazaar's 1 crore orders will not fit, and a full RAM
   means swapping, or a killed process. **Fix:** keep only busy data in RAM; keep the rest in a database.
3. **Network calls inside a loop.** 100 products × one trip each = 100 trips.
   **Fix:** ask for all 100 in **one** trip.
4. **Thinking "write" means "saved".** Without `fsync`, the data may still be in RAM.
   **Fix:** let a database handle saving. Don't build your own.
5. **Measuring only once, or only cold.** The first run includes cold caches and setup; one run can be unlucky.
   **Fix:** repeat many times, and look at the average, like `speed_race.py` does.
6. **Mixing up Mbps and MB/s.** A "100 Mbps" connection is 12.5 MB/s, not 100.
   **Fix:** bits (small b) for networks, bytes (big B) for files; divide by 8.
7. **Thinking more bandwidth fixes slow small requests.** Small requests are slow because of latency.
   **Fix:** fewer trips, or servers closer to the users.

## 8. Quiz

<div class="bz-quiz" data-quiz="m01-01"></div>

## 9. What's next

Next: [Processes and threads](02-processes-and-threads.md). You will see how one computer runs many programs at the same time.

**In one line:** the CPU does the work, caches and RAM are fast but forget, the disk is slow but remembers,
and the network is the slowest of all, so keep busy data close, read it in order, and save what matters properly.

### Cheat sheet

| Question | Linux (and the lab container) | macOS | Windows |
| --- | --- | --- | --- |
| How many cores? | `nproc` | `sysctl -n hw.ncpu` | Task Manager → Performance → CPU |
| CPU details | `lscpu` | `sysctl -n machdep.cpu.brand_string` | `systeminfo` |
| How much RAM? | `head -1 /proc/meminfo` (or `free -m`, if the `procps` package is installed) | `sysctl -n hw.memsize` (bytes) | Task Manager → Performance → Memory |
| Disk space | `df -h` | `df -h` | File Explorer → This PC |

| Fact | Value |
| --- | --- |
| RAM trip | about 100 ns |
| SSD trip | about 0.1 ms |
| Same data centre | about 0.5 ms |
| Another continent | about 200 ms (light alone needs ~125 ms Mumbai ↔ US) |
| 1 byte | 8 bits |
| 100 Mbps | 12.5 MB/s |
| `fsync` | "put it on the disk now, and wait" |

> **Next in Bazaar:** Bazaar's backend, the database and the inventory service all run on one server.
> How does one CPU juggle all of them? Let's look at processes.

<div class="bz-complete" data-lesson="m01-01"></div>
