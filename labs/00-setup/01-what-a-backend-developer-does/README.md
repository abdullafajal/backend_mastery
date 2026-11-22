# Lab 00-01: Talk to Bazaar's first backend

**Goal:** run a tiny Bazaar backend in a container, send it requests, and watch it answer.

**Time:** about 15 minutes.

**You need:** Docker Desktop (or Docker Engine) running, and a terminal.
If you have not installed Docker yet, finish the setup lessons in Module 0 first.

## What is in this folder

| File | What it does |
| --- | --- |
| `app/server.py` | The Bazaar backend. About 80 lines of plain Python. |
| `app/products.json` | Bazaar's 5 products. Our "database" for now. |
| `docker-compose.yml` | Tells Docker how to run the backend. |
| `test_lab.sh` | Checks that everything works. |

## Task 1: Start the backend

Open a terminal in this folder and run:

```bash
docker compose up
```

**Expected output** (the last lines):

```
bazaar-1  | [bazaar] Bazaar backend is running on port 8000
```

Leave this terminal open. It shows the backend's logs. Open a **second** terminal for the next tasks.

## Task 2: Is the backend alive?

```bash
curl http://localhost:8000/health
```

**Expected output:**

```json
{"status": "ok"}
```

Now look at the first terminal. A new log line appeared:

```
bazaar-1  | [bazaar] 192.168.65.1 "GET /health HTTP/1.1" 200 -
```

That line is the backend saying: "Someone asked for `/health`, and I answered with `200` (OK)."
The IP address at the start may be different on your machine. That is fine.

## Task 3: Ask for products, like the app would

```bash
curl "http://localhost:8000/products?q=shoes"
```

**Expected output:**

```json
{"count": 1, "products": [{"id": 1, "name": "Red Running Shoes", "price": 999, "seller": "Kumar Footwear", "in_stock": true}]}
```

Also open <http://localhost:8000/products> in your browser. Your browser is now a "frontend".

## Task 4: See a business rule in action

The Steel Water Bottle has `"stock": 0` in `products.json`. Ask for it:

```bash
curl http://localhost:8000/products/5
```

**Expected output:**

```json
{"id": 5, "name": "Steel Water Bottle", "price": 349, "seller": "Sharma Electronics", "in_stock": false}
```

Notice: the exact stock count is **hidden**. The backend shows only `in_stock`.
This rule lives in `to_public()` in `server.py`. Customers can never see or change it.

## Task 5: See the full HTTP response

```bash
curl -i http://localhost:8000/products/99
```

**Expected output:**

```
HTTP/1.0 404 Not Found
Server: BaseHTTP/0.6 Python/3.13.18
Date: ...
Content-Type: application/json; charset=utf-8
Content-Length: 33

{"error": "Product 99 not found"}
```

The `-i` flag shows the **headers** too. `404` means "not found". You will learn all status codes in Module 7.

## Task 6: Change the data

1. Open `app/products.json` in VS Code.
2. Change the price of `Masala Box` from `299` to `279`. Save the file.
3. Run `curl http://localhost:8000/products/3` again.

**Expected output:**

```json
{"id": 3, "name": "Masala Box", "price": 279, "seller": "Patel Spices", "in_stock": true}
```

No restart needed. The backend reads the file on every request.
(Change the price back to `299` when you are done, so the automatic test passes.)

## Task 7: Try a method the backend doesn't know

Our backend only knows `GET`. Send a `POST`:

```bash
curl -i -X POST http://localhost:8000/products
```

**Expected output** (first line):

```
HTTP/1.0 501 Unsupported method ('POST')
```

`501` means "Not Implemented": the server doesn't support that method. Python sent it for us,
because `server.py` has no `do_POST` method. Bazaar will accept orders with POST in Module 11.

## Task 8: Break the backend with one comma

1. Open `app/products.json`. After the last product (the Steel Water Bottle), add a comma,
   so the end looks like this:

    ```
      {"id": 5, "name": "Steel Water Bottle", "price": 349, "seller": "Sharma Electronics", "stock": 0},
    ]
    ```

2. Save, and ask for the products:

    ```bash
    curl http://localhost:8000/products
    ```

**Expected output:**

```
curl: (52) Empty reply from server
```

3. Look at the first terminal (the logs). The last lines of the traceback say:

```
json.decoder.JSONDecodeError: Illegal trailing comma before end of array: line 6 column 100 (char 478)
```

Read it from the bottom: **what** broke (an illegal trailing comma), and **where** (line 6, column 100).
Notice that `/health` still works, because it doesn't read the file. One broken path, not a broken server.

4. **Remove the comma** and save. `curl http://localhost:8000/products` works again.

## Check your work

```bash
bash test_lab.sh
```

**Expected output:**

```
PASS: /health returns ok
PASS: /products returns 5 products
PASS: search ?q=shoes finds Red Running Shoes
PASS: product 5 shows in_stock=false and hides stock count
PASS: missing product returns 404
PASS: request appears in container logs
PASS: POST returns 501 (method not supported)
ALL CHECKS PASSED
```

You can run the test while Task 1 is still running. The test picks its own free port.

## Stuck?

- **`port is already allocated`**: something else uses port 8000. Stop it, or start the lab
  on another port: `BAZAAR_PORT=8001 docker compose up`, then use `localhost:8001`.
- **`Cannot connect to the Docker daemon`**: Docker Desktop is not running. Start it and wait a minute.
- **`curl: (7) Failed to connect`**: the backend is not running. Check the first terminal for errors.

## Clean up

```bash
docker compose down
```
