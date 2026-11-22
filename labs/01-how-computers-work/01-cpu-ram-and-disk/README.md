# Lab 01-01: The speed race

**Goal:** measure, on your own computer, how long Bazaar waits for data from RAM,
the disk and the network. Then see why saving to disk is slow, and why that slowness is worth it.
Tasks marked *optional, Going deeper* match the lesson's Going-deeper boxes; skip them on your first try.

**Time:** about 30 minutes.

**You need:** Docker running.

## What is in this folder

| File | What it does |
| --- | --- |
| `app/speed_race.py` | The race: measures one trip to RAM, the disk and the network. |
| `app/products.json` | Bazaar's 5 products. |
| `app/locality.py` | Reads 10 million prices in order, then in random order. |
| `inventory/inventory_service.py` | A second Bazaar server, `inventory-service`, in its own container. |
| `docker-compose.yml` | Two services: `inventory` (always on) and `race` (runs once). One volume, `orders-data`. |
| `test_lab.sh` | Checks that everything works. |

## Task 1: Start inventory-service

```bash
docker compose up -d --wait
```

**Expected output** (the last line):

```
 Container 01-cpu-ram-and-disk-inventory-1  Healthy
```

(If you forget this task, `docker compose run` starts `inventory` for you anyway,
because `race` says `depends_on: inventory` in `docker-compose.yml`.)

## Task 2: Run the race

```bash
docker compose run --rm race
```

**Expected output** (your numbers will be different):

```
where the data comes from |   one trip | vs RAM
--------------------------+------------+-----------
RAM (dict lookup)         |      53 ns |        1x
Disk read (file)          |      83 µs |    1,563x
Disk save (fsync)         |     335 µs |    6,303x
Network (other server)    |     163 µs |    3,071x
```

Look at the units. RAM is in **ns** (nanoseconds). The rest are in **µs** (microseconds),
which are 1,000 times bigger. Run it two more times. The numbers move a little, but the gaps stay.

## Task 3: The orders are still there

Every race saves 300 orders to a file on the `orders-data` **volume**.
A volume is Docker storage that stays even after a container is removed. Count the orders:

```bash
docker compose run --rm race sh -c 'wc -l /data/orders.log; tail -1 /data/orders.log'
```

**Expected output** (after 3 races in Task 2: 900 lines; after 1 race: 300):

```
900 /data/orders.log
{"order": "Masala Box x 2", "total": 598}
```

The `race` container that wrote them is gone (`--rm`), but the orders are still on disk.
The Python `dict` it had in RAM is gone forever.

## Task 4: Remove fsync, and see the danger

1. Open `app/speed_race.py` in VS Code.
2. Find this line and put a `#` in front of it, so Python skips it:

    ```python
        # os.fsync(orders.fileno()) # ask the OS to really put it on the disk, and wait
    ```

3. Save, and run the race again:

    ```bash
    docker compose run --rm race
    ```

**Expected output** for the "Disk save" line (the label still says fsync, but it is gone now):

```
Disk save (fsync)         |     893 ns |       17x
```

From hundreds of **micro**seconds down to under one microsecond! But now the orders sit in RAM
until the operating system decides to write them. A power cut in that moment loses them.
Read "Under the hood" in the lesson again.

4. **Remove the `#` again** and save, so the automatic test passes.

## Task 5: How much CPU and RAM can Docker use?

```bash
docker compose run --rm race sh -c 'nproc; head -1 /proc/meminfo'
```

**Expected output** (your numbers will be different):

```
8
MemTotal:        4012908 kB
```

`nproc` prints the number of CPU cores. `MemTotal` is the RAM, in kilobytes (4012908 kB ≈ 4 GB).
On Mac and Windows, Docker Desktop runs a small Linux computer inside your computer,
with its own RAM limit. That is why this can be less than your laptop's real RAM.
You can change it in Docker Desktop → **Settings → Resources**.

## Task 6 (optional, Going deeper): Order matters (locality)

```bash
docker compose run --rm race python3 locality.py
```

**Expected output** (your times will differ; the gap is what matters):

```
in order      2.75 s   (total = 49,999,995,000,000)
random order  6.67 s   (total = 49,999,995,000,000)
```

Same 10 million prices, same total, same work. Only the order of reading changed, and the random order
took about 2.4 times longer. In order, every trip to RAM brings a whole **cache line** of neighbouring prices
into the CPU cache, so the next reads are almost free. In random order, nearly every read is a new trip.

Also try:

```bash
docker compose run --rm race lscpu
```

Look for `Architecture` (`aarch64` on Apple chips, `x86_64` on Intel/AMD) and `CPU(s)`.

## Check your work

```bash
bash test_lab.sh
```

**Expected output** (numbers will vary):

```
Starting lab...
where the data comes from |   one trip | vs RAM
--------------------------+------------+-----------
RAM (dict lookup)         |      53 ns |        1x
Disk read (file)          |      84 µs |    1,598x
Disk save (fsync)         |     323 µs |    6,143x
Network (other server)    |     202 µs |    3,850x
PASS: RAM lookup is under 1 µs (53 ns)
PASS: disk read is much slower than RAM
PASS: disk save with fsync is 100x+ slower than RAM
PASS: network trip is 100x+ slower than RAM
PASS: network trip is under 20 ms (no Nagle stall)
PASS: 300 orders were saved on the volume
in order      2.75 s   (total = 49,999,995,000,000)
random order  6.67 s   (total = 49,999,995,000,000)
PASS: random order is clearly slower than in order (6.67 s vs 2.75 s)
ALL CHECKS PASSED
```

The test uses its own fresh volume, so it always finds exactly 300 orders.

## Stuck?

- **Task 4 shows no change**: did you save the file? `./app` is shared live with the container,
  so no restart is needed.

## Clean up

```bash
docker compose down -v
```

`-v` also deletes the `orders-data` volume, and all the saved orders with it.
Without `-v`, the volume (and the orders) would stay for next time.
