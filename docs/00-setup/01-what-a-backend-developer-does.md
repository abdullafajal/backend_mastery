# What a backend developer does

<div class="bz-meta" markdown>
**Module** 0 · Welcome and setup
**Lesson** 1
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's first tiny backend, running in a container, and break it on purpose
</div>

!!! abstract "In 1 minute"
    - Every app has two halves: the **frontend** (what you see) and the **backend** (the hidden part on a server).
    - The backend answers requests, keeps the **rules**, and stores data in a **database**.
    - **Never trust the frontend**: anyone can change what an app sends, so the backend checks everything again.
    - The app and the backend talk with **requests** and **responses**; data travels as **JSON**.
    - In the lab, you run Bazaar's first tiny backend, talk to it with `curl`, and break it with one comma.

> **Previously in Bazaar:** Nothing yet! Today, Bazaar is just an idea.
> Some sellers want to sell online, and some customers want to buy. Let's build it.

## 1. Why learn this?

Bazaar's first customer, Asha, opens the app and searches for "shoes".
Red Running Shoes appear in less than a second. But where did they come from?
Who checked the price? Who made sure they are in stock? Who will remember her order tomorrow?

All of that invisible work is the **backend**. It is the job you are going to learn, from your
first request today to designing systems for crores of users at the end of this course.
In this lesson you will understand what a backend is, why it must exist, what it is made of,
how it talks to apps, and what backend developers actually do all day.

## 2. The concept

### Two halves of every app

Every app you use has two halves.

- The **frontend** is the part you see and touch: buttons, pictures, the search box.
  It runs on **your** device: your phone, or your browser.
- The **backend** is the part you never see. It runs on computers far away, called **servers**.
  A server is just a computer whose job is to answer requests from other computers.
  It has no screen, nobody sits in front of it, and it runs day and night.

Let's understand this with a small example: a restaurant.

| Restaurant | Bazaar |
| --- | --- |
| The menu and the table you sit at | The frontend (the app) |
| You telling the waiter your order | A **request** |
| The waiter bringing your food | A **response** |
| The kitchen, where food is really made | The backend |
| The store room with all the ingredients | The **database** |

You never walk into the kitchen. You just get your food.
In the same way, Asha never sees the backend. She just gets her shoes.

**Where this analogy breaks:** a good waiter remembers you. HTTP, the language between the app and
the backend, does **not**. Every request arrives as if from a stranger. If the backend must know
"this is Asha, she is logged in", the app has to prove it again in every single request.
You will learn how in Module 12 (cookies, sessions and tokens).

??? note "Going deeper: Why can't the app do everything itself?"
    A fair question: phones are powerful. Why not let the app talk to the database directly?

    1. **Secrets.** To open the database, you need a password. Anything inside an app can be dug out
       by anyone who downloads it. If the database password is in the app, everyone has it.
    2. **Rules.** The app runs on the customer's phone, and the customer controls their phone.
       They can change what the app sends. Rules must run somewhere the customer can't touch.
    3. **One brain, many faces.** Bazaar will have an Android app, an iPhone app, a website and a
       seller dashboard. If each had its own copy of the rules, they would soon disagree.
       The backend is the **one place** where the rules live, and every frontend asks it.
    4. **Shared data.** Asha's order must be seen by the seller, the delivery team and the accounts team.
       Data that many people share must live in one central place, not on one phone.

### What the backend actually does

A backend developer writes the code in the kitchen. That code has five main jobs:

1. **Answer requests.** The app asks "show me shoes". The backend answers with a list.
2. **Enforce rules** (also called **business rules** or business logic). For Bazaar, for example:
    - a customer can't buy more than the stock;
    - the price always comes from Bazaar's data, never from the app;
    - only the seller who owns a product can change its price;
    - a customer sees "in stock", but not the exact stock number.
3. **Store data safely.** Products, orders and payments go into a database.
   A **database** is a program that stores data and finds it again quickly, even years later.
4. **Talk to other services.** A payment company to charge the card, an email service to send
   the receipt, a delivery partner to ship the box.
5. **Stay fast, safe and up.** It must work for 1 user today, for 1 crore users during the Diwali sale,
   and it must keep working when a server breaks at 3 a.m.

### Never trust the frontend

This is the most important idea in this lesson, so let's be precise about it.

The app runs on Asha's phone. Anyone can change what an app sends: with special tools, or by writing
their own little program that pretends to be the app. A clever user could send "price: ₹1" for
Red Running Shoes. So the backend **checks everything again, using its own data**, on every request.
The frontend may also check things (to show a nice message quickly), but that is only for comfort.
The real check is always in the backend.

### How they talk: requests and responses

The app and the backend talk using **HTTP**: the set of rules for sending messages on the web.
Every conversation has two parts:

- a **request**, from the app: "`GET /products?q=shoes`", which means "give me the products, and the search word is shoes";
- a **response**, from the backend: a short **status code** saying how it went, plus the data.

You only need three status codes for now:

| Code | Means |
| --- | --- |
| `200` | OK, here's your answer |
| `404` | not found (product 99 doesn't exist) |
| `500` | the **backend** broke |

You'll study HTTP properly in Module 7.

??? note "Going deeper: the parts of a request, methods, and status code families"
    A **request** has four parts:

    | Part | Example | Meaning |
    | --- | --- | --- |
    | **Method** | `GET` | What kind of action. `GET` = "give me something". |
    | **Path** | `/products?q=shoes` | What you want. The part after `?` is the **query string**: extra details. |
    | **Headers** | `Host: localhost:8000` | Extra information, one per line, as `Name: value`. |
    | **Body** | *(empty for GET)* | Data you send, for example a new order. |

    The common methods:

    | Method | Meaning | Bazaar example |
    | --- | --- | --- |
    | `GET` | Read something | show the product list |
    | `POST` | Create something new | place an order |
    | `PUT` / `PATCH` | Change something (all of it / part of it) | a seller updates a price |
    | `DELETE` | Remove something | a seller removes a product |

    Status codes come in families:

    | Family | Meaning | Common ones |
    | --- | --- | --- |
    | `2xx` | Success | `200 OK`, `201 Created` |
    | `3xx` | Look somewhere else | `301 Moved Permanently` |
    | `4xx` | **The client** made a mistake | `400 Bad Request`, `401 Unauthorized`, `404 Not Found` |
    | `5xx` | **The server** made a mistake | `500 Internal Server Error`, `501 Not Implemented` |

    A 4xx means "you asked wrongly". A 5xx means "we broke". When Bazaar sends a 5xx, a backend developer should be worried.

### JSON: the language of the data

Most backends send data as **JSON** (JavaScript Object Notation): a simple text format that every
programming language can read. Here is one Bazaar product:

```json
{
  "id": 1,
  "name": "Red Running Shoes",
  "price": 999,
  "seller": "Kumar Footwear",
  "in_stock": true,
  "tags": ["shoes", "sports"],
  "discount": null
}
```

JSON has only six kinds of values. Each one matches a Python type:

| JSON | Example | Python |
| --- | --- | --- |
| object | `{"name": "Masala Box"}` | `dict` |
| array | `["shoes", "sports"]` | `list` |
| string | `"Kumar Footwear"` (double quotes only) | `str` |
| number | `999`, `4.5` | `int`, `float` |
| `true` / `false` | `true` | `True` / `False` |
| `null` | `null` | `None` |

JSON is strict. Keys need double quotes, and a comma after the last item is an error.
In the lab, one extra comma will break Bazaar. On purpose.

??? note "Going deeper: What does a backend developer do all day?"
    On a normal week, a backend developer at a company like Bazaar might:

    - build a new **API endpoint** (one URL + method the app can call), like "apply a coupon";
    - design new database tables for a feature, like product reviews;
    - find out why the orders page became slow, and fix it;
    - write tests, so tomorrow's change doesn't break today's checkout;
    - review a teammate's code;
    - look at graphs and alerts to see if everything is healthy;
    - join a call at night when payments fail, find the cause, fix it, and write what happened.

    Some related roles you will hear about:

    | Role | Focus |
    | --- | --- |
    | Frontend developer | the app and the website the customer sees |
    | **Backend developer** | APIs, data, rules, performance, reliability |
    | Full-stack developer | both frontend and backend |
    | DevOps / SRE (Site Reliability Engineer) | servers, deployment, monitoring, keeping things up |
    | Data engineer | moving and preparing large amounts of data for reports and analysis |
    | Backend architect | designs how all the pieces fit together, and makes the big trade-offs |

    This course takes you through the backend developer path, all the way to the architect's level.

### Questions you may have

**Is the server always far away?**
No. "Server" is a role, not a special machine. In the lab, **your laptop** is the server.
In production, servers usually live in a data centre or a cloud like AWS.

**What is `localhost`?**
A special name that always means "this same computer". In the lab, `curl` and the backend run on
the same laptop, so `curl` talks to `localhost`. Its address is `127.0.0.1`.

**What is the `8000` in `localhost:8000`?**
A **port**: a door number on a computer. One computer can run many servers, each listening at a
different door. Bazaar's lab backend listens at door 8000. You will learn ports in Module 7.

**Do backends only send JSON?**
No. They can send HTML pages, images, PDFs (like invoices), or files. But APIs for apps almost always use JSON.

**Which language are backends written in?**
Many: Python, Java, Go, JavaScript (Node.js), C#, Ruby, PHP and more. The ideas in this course
(HTTP, databases, caching, scaling) are the same in all of them. We use Python with Django.

**Do I need to learn frontend too?**
Not for this course. But knowing a little helps you design APIs that are pleasant for frontends to use.

## 3. See it in action

Pick what Asha wants to do. Then press **Play**, or click **Next** to go one step at a time.

<div class="bz-diagram" data-diagram="request-journey"></div>

Notice that the dashed **BACKEND** box holds two things: the backend code and the database.
In this course, you will build everything inside that box.

## 4. Code example

This small script shows the kind of rules a backend developer writes.
It checks an order the way Bazaar would. Save it as `bazaar_rules.py`.

```python title="bazaar_rules.py"
--8<-- "labs/00-setup/01-what-a-backend-developer-does/examples/bazaar_rules.py"
```

Run it:

```bash
python3 bazaar_rules.py
```

Output:

```
Accepted: 2 x Masala Box = ₹598
Rejected: only 0 Steel Water Bottle left
  (warning: phone said ₹1, real price is ₹999)
Accepted: 1 x Red Running Shoes = ₹999
Rejected: product not found
```

Let's read the output line by line:

1. A normal order: 2 Masala Boxes at ₹299 = ₹598. All four rules pass.
2. The Steel Water Bottle has stock 0. Rule 3 rejects it, before any money is taken.
3. Someone changed the app to send ₹1. Rule 4 notices. The backend charges its **own** price, ₹999.
   That one line, `total = product["price"] * quantity`, protects Bazaar's money.
4. Product 42 doesn't exist. Rule 1 rejects it.

Notice the order of the checks: cheap, simple checks first, and the change to the stock **last**,
only when everything is fine. If you changed the stock first and then rejected the order,
Bazaar would "lose" items that were never sold.

!!! tip "Don't have Python yet?"
    That's fine. You will install it in Lesson 3 of this module.
    The lab below runs Python inside Docker, so you can try everything even before that.

## 5. Under the hood

### What a request really looks like

A request is just text. Here is the exact text that travels when you search for shoes.
Lines starting with `>` go **to** the backend. Lines starting with `<` come **back**.

```
> GET /products?q=shoes HTTP/1.1
> Host: localhost:8000
> User-Agent: curl/7.85.0
> Accept: */*
>
< HTTP/1.0 200 OK
< Server: BaseHTTP/0.6 Python/3.13.18
< Content-Type: application/json; charset=utf-8
< Content-Length: 126
<
{"count": 1, "products": [{"id": 1, "name": "Red Running Shoes", "price": 999, "seller": "Kumar Footwear", "in_stock": true}]}
```

Line by line:

| Line | Meaning |
| --- | --- |
| `GET /products?q=shoes HTTP/1.1` | The **request line**: method, path, and the HTTP version the client speaks. |
| `Host: localhost:8000` | Which website we want. One server can host many sites, so this is required. |
| `User-Agent: curl/7.85.0` | Which program is asking. A browser would say Chrome or Safari here. |
| `Accept: */*` | "I accept any kind of answer." |
| empty line | "Headers are finished." A GET has no body, so the request ends here. |
| `HTTP/1.0 200 OK` | The **status line**: HTTP version, status code, and a short reason. |
| `Server: BaseHTTP/0.6 Python/3.13.18` | Which server program answered. |
| `Content-Type: application/json; charset=utf-8` | "The body is JSON, written in UTF-8." UTF-8 is the text encoding that supports ₹ and every language. |
| `Content-Length: 126` | The body is exactly 126 bytes, so the client knows when it has received everything. |
| empty line, then the body | The actual data. |

??? note "Going deeper: The backend's code, step by step"
    Open `app/server.py` in the lab. When a request arrives, this happens:

    1. `ThreadingHTTPServer` is listening on port 8000. A connection arrives.
    2. It reads the request text and creates a `BazaarHandler` object for this one request.
    3. The request line says `GET`, so it calls the method named `do_GET`.
    4. `do_GET` splits `self.path` into the path (`/products`) and the query (`q=shoes`).
    5. It matches the path, and reads `products.json` (our "database" for now).
    6. Each product goes through `to_public()`: the business rule that hides the stock number.
    7. It filters the list by the search word.
    8. `send_json()` writes the status line, the headers, the empty line and the JSON body.
    9. `log_message()` prints one line to the logs.

    What if the method is `POST`? There is no `do_POST` method, so Python answers by itself with
    `501 Unsupported method ('POST')`. You will try it in the lab.

### Reading a log line

Every request leaves one line in the **logs**. Logs are the backend's diary: when something goes wrong,
developers read them first.

```
[bazaar] 192.168.65.1 "GET /products?q=shoes HTTP/1.1" 200 -
```

| Part | Meaning |
| --- | --- |
| `[bazaar]` | Our own label, so we can find our lines among others. |
| `192.168.65.1` | Who sent the request. Here it is Docker's address for your laptop. |
| `"GET /products?q=shoes HTTP/1.1"` | The request line, exactly as it arrived. |
| `200` | The status code we answered with. |
| `-` | The response size. This simple server doesn't record it, so it prints `-`. |

### When the backend breaks

In the lab you will add one wrong comma to `products.json`. Then this happens:

1. `json.load()` can't read the file and raises an error.
2. Our code doesn't catch it, so the handler stops in the middle, before sending any answer.
3. The server prints the full error (a **traceback**) to the logs, ending with:
   ```
   json.decoder.JSONDecodeError: Illegal trailing comma before end of array: line 6 column 100 (char 478)
   ```
4. It closes the connection. `curl` received nothing at all, and says:
   ```
   curl: (52) Empty reply from server
   ```

A **traceback** is Python's report of where an error happened, function by function. Read it from the
bottom: the last line says **what** went wrong, the lines above say **where**.

Notice that the error message tells you the exact line and column. Good error messages are a gift.
Notice also that the customer got **nothing**, not even a polite error. A real backend catches errors
and answers with a proper `500` and a JSON error message. You will build that in Module 11.

??? note "Going deeper: why does the response say HTTP/1.0?"
    curl asked in HTTP/1.1, but the answer says `HTTP/1.0`. Python's simple `BaseHTTPRequestHandler`
    answers in HTTP/1.0 unless you set `protocol_version = "HTTP/1.1"`. The main difference: with 1.0,
    the connection closes after every response. With 1.1, it can stay open for the next request,
    which saves time. Lab 01-01 sets 1.1 for exactly that reason. Real servers like Gunicorn and Nginx
    speak HTTP/1.1, and Nginx also speaks HTTP/2 and HTTP/3 (Module 7).

??? note "Going deeper: the Server header gives away information"
    `Server: BaseHTTP/0.6 Python/3.13.18` tells the whole world which software and version Bazaar runs.
    An attacker can look up known problems for that exact version. Production servers usually hide
    or shorten this header. You will see this in the security module (Module 23).

## 6. Lab

Now you will run Bazaar's first real backend, talk to it, and break it.

Three new words first:

- A **container** is a small sealed box that holds a program and everything it needs to run.
  **Docker** is the tool that runs containers. You will learn it deeply in Module 19.
- **curl** is a command-line tool that sends HTTP requests, like a tiny browser with no screen.
- **Docker Compose** starts the containers described in a `docker-compose.yml` file.

**Lab folder:** `labs/00-setup/01-what-a-backend-developer-does/`

```bash
cd labs/00-setup/01-what-a-backend-developer-does
docker compose up
```

In a second terminal:

```bash
curl "http://localhost:8000/products?q=shoes"
```

Expected output:

```json
{"count": 1, "products": [{"id": 1, "name": "Red Running Shoes", "price": 999, "seller": "Kumar Footwear", "in_stock": true}]}
```

The lab's `README.md` has 8 tasks. You will send requests, see a business rule, read status codes,
try a method the server doesn't know, change Bazaar's data, and break the backend with one comma.
When you finish, run `bash test_lab.sh`. You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **"The frontend already checks it, so the backend doesn't need to."**
   Anyone can change what an app sends. **Fix:** always check again in the backend, with your own data.
2. **Mixing up the backend and the database.**
   The backend is your code with the rules. The database only stores data.
   **Fix:** remember the chain: app → backend → database. The app never talks to the database directly.
3. **`curl: (7) Failed to connect to localhost port 8000 ... Connection refused`.**
   Nothing is listening on that port: the backend isn't running, or it uses another port.
   **Fix:** check the terminal where you ran `docker compose up`, and the port in `docker-compose.yml`.
4. **`curl: (52) Empty reply from server`.**
   The backend accepted the connection but crashed before answering. **Fix:** read the logs
   (`docker compose logs`). The last line of the traceback says what went wrong.
5. **Broken JSON: single quotes, or a comma after the last item.**
   Python dicts allow both; JSON allows neither. **Fix:** use double quotes, no trailing comma.
   The error message gives the line and column.
6. **Ignoring the status code.** A `501`, `404` or `500` is the backend telling you something.
   **Fix:** use `curl -i` to see the status line, and look up the code's family (2xx/4xx/5xx).

## 8. Quiz

<div class="bz-quiz" data-quiz="m00-01"></div>

## 9. What's next

Next: [The full roadmap](02-the-full-roadmap.md). You will see the whole course: 6 levels, 38 modules,
and how Bazaar grows at each step.

**In one line:** the backend is the hidden kitchen of an app: it answers HTTP requests, enforces the rules
the customer can't touch, stores shared data safely, and must stay fast and up.

### Cheat sheet

| Command | What it does |
| --- | --- |
| `curl http://localhost:8000/health` | Send a GET request, print the body |
| `curl -i <url>` | Also print the status line and response headers |
| `curl -v <url>` | Print everything: the request (`>`) and the response (`<`) |
| `curl -X POST <url>` | Use another method |
| `docker compose up` | Start the lab and show its logs (stop with `Ctrl+C`) |
| `docker compose logs` | Show the logs of a lab running in the background |
| `docker compose down` | Stop and remove the lab's containers |

| Status code | Meaning |
| --- | --- |
| `200 OK` | Success |
| `201 Created` | Success, something new was created |
| `400 Bad Request` | The request itself is wrong |
| `401 Unauthorized` | You are not logged in |
| `404 Not Found` | That thing doesn't exist |
| `500 Internal Server Error` | The backend broke |
| `501 Not Implemented` | The backend doesn't support that method |

| curl error | Meaning |
| --- | --- |
| `(7) Failed to connect ... Connection refused` | Nothing listens on that port |
| `(52) Empty reply from server` | Connected, but the backend crashed before answering |

> **Next in Bazaar:** Our tiny backend works on one laptop for one user.
> But what happens when a thousand customers arrive at once? Let's look at the road ahead.

<div class="bz-complete" data-lesson="m00-01"></div>
