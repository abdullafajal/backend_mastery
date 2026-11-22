# Lab 00-02: When the crowd arrives

**Goal:** send 1, 10, 50 and 100 pretend customers to Bazaar's backend at once,
see why it slows down, then fix it by changing one word.

**Time:** about 15 minutes.

**You need:** Docker running, and a terminal.

## What is in this folder

| File | What it does |
| --- | --- |
| `app/server.py` | Bazaar's backend with **one worker**. Each request "uses the database" for 20 ms. |
| `app/products.json` | Bazaar's 5 products. |
| `examples/users_arrive.py` | The crowd: sends many requests at the same moment and times them. |
| `docker-compose.yml` | Runs two services: `bazaar` (the backend) and `users` (the crowd). |
| `test_lab.sh` | Checks that everything works. |

## Task 1: Start the backend

```bash
docker compose up -d --wait
```

`-d` runs it in the background. `--wait` waits until the backend is healthy.

**Expected output** (the last line):

```
 Container 02-the-full-roadmap-bazaar-1  Healthy
```

## Task 2: Send the crowd

```bash
docker compose run --rm users
```

This starts the `users` service once, and removes it when it is done (`--rm`).

**Expected output** (your numbers will be a little different):

```
users | average wait | slowest wait
------+--------------+-------------
    1 |        47 ms |       47 ms
   10 |       131 ms |      235 ms
   50 |       566 ms |     1125 ms
  100 |      1190 ms |     2355 ms
```

Look at the last column. Every time the crowd grows, the slowest wait grows with it.
With 100 users, one customer waits more than 2 seconds just to see the product list.

Run it 2–3 more times. The pattern stays the same.

## Task 3: Give Bazaar more workers

1. Open `app/server.py` in VS Code.
2. Find this line near the bottom:

    ```python
    server = HTTPServer(("0.0.0.0", 8000), BazaarHandler)  # Task 3: change HTTPServer here
    ```

3. Change `HTTPServer` to `ThreadingHTTPServer`. Save the file.
4. Restart the backend, then send the crowd again:

    ```bash
    docker compose restart bazaar
    docker compose run --rm users
    ```

**Expected output** (your numbers will be a little different):

```
users | average wait | slowest wait
------+--------------+-------------
    1 |        39 ms |       39 ms
   10 |        22 ms |       23 ms
   50 |        22 ms |       24 ms
  100 |        39 ms |       58 ms
```

The slowest wait dropped from about 2300 ms to about 60 ms!
`ThreadingHTTPServer` starts a new worker (thread) for each request, so nobody waits in line.

**But this is not the end of the story.** Our "database" here is only a `sleep`.
A real database, a real CPU and real memory have limits too. Threads are not free.
That is why the course has whole levels on workers (Level 4) and many servers (Level 5).

5. Change `ThreadingHTTPServer` back to `HTTPServer` and save, so the automatic test passes.

## Task 4 (optional): A bigger crowd

Make sure `server.py` says `HTTPServer` again (one worker). Open `examples/users_arrive.py` and change
`[1, 10, 50, 100]` to `[300]`. Save, then:

```bash
docker compose restart bazaar
docker compose run --rm users
```

**Expected output** (your numbers will differ):

```
users | average wait | slowest wait
------+--------------+-------------
  300 |      3582 ms |     7204 ms
```

Nobody was turned away, but the last customer waited over 7 seconds. 300 requests in about 7.2 seconds
is about 42 requests per second: the **throughput** limit of one worker that needs about 23 ms per request.
Change the list back to `[1, 10, 50, 100]` when you are done.

## Check your work

```bash
bash test_lab.sh
```

**Expected output** (numbers will vary):

```
PASS: /health returns ok
users | average wait | slowest wait
------+--------------+-------------
    1 |        37 ms |       37 ms
   10 |       128 ms |      234 ms
   50 |       585 ms |     1158 ms
  100 |      1173 ms |     2333 ms
PASS: 1 user waits under 500 ms (37 ms)
PASS: with 100 users the slowest waits over 1 second (2333 ms): one worker is the bottleneck
ALL CHECKS PASSED
```

The test picks its own free port, so it works even if something else uses port 8000.

## Stuck?

- **`port is already allocated`**: something else uses port 8000. Use another port:
  `BAZAAR_PORT=8001 docker compose up -d --wait`. The crowd still works, because it talks
  to the backend inside Docker's own network.
- **The numbers in Task 3 did not change**: did you save the file and run `docker compose restart bazaar`?

## Clean up

```bash
docker compose down
```
