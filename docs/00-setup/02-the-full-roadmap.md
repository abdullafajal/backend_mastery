# The full roadmap

<div class="bz-meta" markdown>
**Module** 0 · Welcome and setup
**Lesson** 2
**Reading time** 15 min (+ optional deeper parts)
**You will build** a crowd of 100 pretend customers, watch Bazaar's backend slow down, and measure why
</div>

!!! abstract "In 1 minute"
    - This course follows **one app, Bazaar**, from 1 user to 1 crore users.
    - Every time Bazaar grows, something breaks, and that problem brings the next thing you learn.
    - There are **6 levels**, in order, like building a house: foundation first.
    - Every lesson has the same 9 parts: why, concept, diagram, code, under the hood, lab, mistakes, quiz, what's next.
    - In the lab, 100 pretend customers make Bazaar's one-worker backend slow, and one small change fixes it.

> **Previously in Bazaar:** You ran Bazaar's first tiny backend. It answered requests,
> hid the stock count and returned JSON. It worked perfectly, for one user.

## 1. Why learn this?

Today Bazaar has one user: you. Soon it will have a hundred, then a lakh, then a crore.
Each jump breaks something different. In this lesson's lab, just 100 customers make Bazaar's backend
take over 2 seconds to answer, and 300 customers make it take 7.

Every level of this course exists to fix a problem like that one. Before you start the journey,
you should see the whole map: where you are going, why the stops are in this order, and how to travel
so you actually arrive. That is this lesson.

## 2. The concept

### A course that follows a startup

Most courses teach tools in a list: "Now learn Docker. Now learn Redis." You learn **how**, but not **why**.
Six months later you know many tools, but you can't decide which one a problem needs.

This course is different. It follows one startup, Bazaar, as it grows. Every time Bazaar grows,
a real problem appears. That problem brings the next tool. So for every tool you will know:

1. **Which problem** it solves for Bazaar;
2. **Why** we chose it;
3. **Which alternative** we didn't choose, and why not.

That third question is what separates a senior engineer from a junior one. Juniors know tools.
Seniors know trade-offs.

### Building a house

Let's understand the order with a small example: building a house.

1. First the **foundation**. You never see it, but without it everything cracks.
2. Then the **walls and rooms**. Now people can live in it.
3. Then **plumbing and wiring**. Water and power must reach every room.
4. Then you **open the doors** to guests, with locks, alarms and a guard.
5. Then the house becomes a **hotel**, with many buildings and many guests.
6. Finally, you become the **architect** who designs the next hotel.

This course has the same six levels, in the same order. Don't skip the foundation.
Developers who skip it get stuck later, when something breaks deep inside.

**Where this analogy breaks:** a house is built once. Software is never finished. Bazaar keeps
changing while customers use it, like rebuilding the hotel while guests sleep in it.
That is why Levels 4–6 spend so much time on safe changes, monitoring and recovering from failure.

### The six levels

| Level | Bazaar has | The problem | You learn |
| --- | --- | --- | --- |
| 1. Foundations | 1 user | Bazaar is just an idea | how computers, Linux, Git, Python and networks work |
| 2. Core backend | 100 users | sellers need a website, the app needs an **API** | Django, APIs, login, testing |
| 3. Data | 10,000 users | the database gets slow | SQL, designing tables, making queries fast |
| 4. Production | 1 lakh users | Bazaar is live: it must be safe and always on | Docker, deployment, caching, security, monitoring |
| 5. Scaling | 10 lakh+ users | the Diwali sale: one server isn't enough | many servers, events, splitting the database |
| 6. Architecture | 1 crore users | big decisions, leading a team | system design, senior skills, the final project |

An **API** is a set of URLs that other programs (like Bazaar's mobile app) call to get data or do work.
Don't worry about the other new words in this table: each gets its own lesson, in simple words.

??? note "Going deeper: Each level in detail"
        The user numbers are part of Bazaar's story. They give you a feel for which problems appear at which size.

    #### Level 1: Foundations (Modules 0–7) · Bazaar has 1 user

    **The problem:** Bazaar is just an idea on your laptop.
    **You learn:** how computers work (CPU, memory, processes), Linux and the terminal, Git,
    Python from basics to advanced, data structures and algorithms, and how networks and the web work.
    **After this level you can:** write solid Python, use a Linux server comfortably, and explain exactly what
    happens when someone types a URL.
    **Bazaar milestone:** a command-line product catalog, a shopping cart in memory, and a mini HTTP server.

    #### Level 2: Core backend with Django (Modules 8–13) · 100 users

    **The problem:** sellers need a real website, and the mobile app needs an **API**.
    An API (Application Programming Interface) is a set of URLs other programs call to get data or do work.
    **You learn:** Django in depth, its ORM (a way to use the database through Python code), REST API design,
    login and permissions, and testing.
    **After this level you can:** build a complete, tested, secure REST API.
    **Bazaar milestone:** a products and orders API with login and 85%+ test coverage.

    #### Level 3: Data (Modules 14–18) · 10,000 users

    **The problem:** thousands of products and orders. A page that took 50 ms now takes 5 seconds.
    **You learn:** SQL, designing tables, how databases work inside (indexes, transactions, locks),
    making queries fast, and when to use other stores (Redis, search engines, file storage).
    **After this level you can:** design a schema, read a query plan, and fix a slow endpoint.
    **Bazaar milestone:** a full schema, an endpoint made 50x faster, product search and image uploads.

    #### Level 4: Production (Modules 19–26) · 1 lakh users

    **The problem:** Bazaar goes live on the internet. It must be safe, fast and never down.
    **You learn:** Docker in depth, running Django properly (Gunicorn, Nginx), background jobs, caching,
    security, automatic deployment, monitoring, and the basics of cloud and Kubernetes.
    **After this level you can:** deploy, secure and watch a real application.
    **Bazaar milestone:** a production stack that deploys itself on every push, with dashboards and alerts.

    #### Level 5: Scaling and distributed systems (Modules 27–33) · 10 lakh+ users

    **The problem:** the Diwali sale. One server and one database can't handle the crowd.
    **You learn:** load balancing, how services talk, event streaming with Kafka, database replication
    and sharding, the theory of distributed systems, and load testing.
    **After this level you can:** spread a system over many machines, and keep it working when some of them fail.
    **Bazaar milestone:** 3 app servers, a read replica, 3 database shards and Kafka events.

    #### Level 6: Architecture and senior skills (Modules 34–37) · 1 crore users

    **The problem:** Bazaar is big. The hard part is now design decisions and leading a team.
    **You learn:** software architecture, system design, code reviews, design docs, handling incidents,
    and interview preparation.
    **After this level you can:** design a system on a whiteboard, defend the trade-offs, and lead its build.
    **Bazaar milestone:** Bazaar v1.0, the complete capstone.

    Don't worry if many words above are new. Each one gets its own lesson, in simple words.

??? note "Going deeper: Junior, mid-level, senior: what changes?"
    | | Junior | Mid-level | Senior / architect |
    | --- | --- | --- | --- |
    | Main question | "How do I build this?" | "How do I build this well?" | "**Should** we build this, and what will it cost us later?" |
    | Scope | a task | a feature | a system, and the team around it |
    | When it breaks | asks for help | finds and fixes the bug | finds why it **could** break, before it does |
    | Tools | knows a few | knows them well | knows their trade-offs, and when **not** to use them |

    Levels 1–2 make you a solid junior. Levels 3–4 a strong mid-level engineer. Levels 5–6 take you toward senior and architect.

### Why Python and Django?

For Bazaar, we chose **Python** and the **Django** framework. A **framework** is a ready-made
toolbox that does the common work for you, so you write only your app's own code.

- **Python** has simple syntax. It is used for backends, data work and scripts.
  *Node.js* would also work, but Python is easier when you are starting.
- **Django** gives you an admin panel, database tools, login and security out of the box.
  So Bazaar can launch quickly. *FastAPI* is lighter, but you would build those parts yourself.

The ideas you learn (databases, caching, scaling) work in any language. Python is just our vehicle.

### How every lesson works

Every lesson has the same 9 parts, so you always know where you are:

1. **Why learn this?** The Bazaar problem.
2. **The concept.** The idea, explained completely, with questions you may have.
3. **See it in action.** An interactive diagram.
4. **Code example.** Small, complete code you can run.
5. **Under the hood.** What really happens inside, and how to read every output.
6. **Lab.** You build it yourself with Docker.
7. **Common mistakes.** With the real error messages, so you recognise them.
8. **Quiz.** Quick questions with explanations.
9. **What's next.** Where Bazaar goes from here, plus a cheat sheet.

Boxes called **"Going deeper"** are optional extras for curious or advanced readers.
You can skip them on your first reading.

### How to study this course

1. **Read, then do.** Read the lesson once, then do the lab. Don't only read. Backend is learned with your hands.
2. **Type, don't copy.** Typing commands and code yourself builds memory. Copy-paste builds nothing.
3. **When stuck, follow this order:**
    1. read the error message from the bottom (the last line says what went wrong);
    2. check the lab's "Stuck?" section;
    3. read the logs (`docker compose logs`);
    4. compare with the reference solution.
4. **Take the quiz the next day**, not right after reading. Remembering after a break is what makes it stick.
5. **Keep a steady pace.** A few lessons a week, every week, beats a whole weekend once a month.

### Questions you may have

**How long will the whole course take?**
It depends on your pace and on how much you already know. A lesson with its lab takes roughly one to two hours.
Studying steadily a few hours a week, plan for many months. That is normal for going from zero to senior.

**I already know Python. Can I skip Level 1?**
Take the quizzes of Modules 4–5 first. If you pass them easily, skim those lessons.
But don't skip Modules 1, 2 and 7 (computers, Linux, networks). Most self-taught developers have gaps exactly there.

**Do I have to do every lab?**
Yes, if you want the skills and not just the words. Each lab is 15–40 minutes and checks itself with `test_lab.sh`.

**What computer do I need?**
Any recent laptop that runs Docker Desktop. 8 GB of RAM works for the early levels.
Level 5 runs many containers at once (several databases, Kafka), so more RAM helps there.

**Why does every lesson use the same app?**
So you never waste time understanding a new example. You already know Bazaar's products, customers and problems.
And at the end, you have one complete project to show, not twenty toy apps.

## 3. See it in action

Press **Play** to climb the stairs. Or click any level to jump to it.
Watch Bazaar's users grow at every step.

<div class="bz-diagram" data-diagram="course-roadmap"></div>

## 4. Code example

This script pretends to be a crowd of Bazaar customers. They all open the product list
at the same moment. It measures how long each one waits.

```python title="users_arrive.py"
--8<-- "labs/00-setup/02-the-full-roadmap/examples/users_arrive.py"
```

Two new words in this code:

- A **thread** is a separate line of work inside one program. Many threads can wait at the same time.
  `ThreadPoolExecutor` starts many threads for us, one per pretend customer. (You will study threads in Module 1.)
- `time.perf_counter()` is a precise stopwatch. We read it before and after each request.

When the lab runs it against Bazaar's backend, the output looks like this:

```
users | average wait | slowest wait
------+--------------+-------------
    1 |        47 ms |       47 ms
   10 |       131 ms |      235 ms
   50 |       566 ms |     1125 ms
  100 |      1190 ms |     2355 ms
```

How to read this table:

- **users**: how many customers opened the page at the same moment.
- **average wait**: the typical customer's wait.
- **slowest wait**: the unluckiest customer, the last one in line.

One user waits 47 ms. With 100 users, the unluckiest customer waits **more than 2 seconds**.
Notice that the slowest wait grows almost exactly in step with the number of users: 10x the users, 10x the wait.
Your numbers will be a little different, but the pattern will be the same.

## 5. Under the hood

### Why does the wait grow so fast?

Look at how the lab's backend is started:

```python title="app/server.py (the line that starts the server)"
server = HTTPServer(("0.0.0.0", 8000), BazaarHandler)  # Task 3: change HTTPServer here
```

`HTTPServer` has only **one worker**. A **worker** is the part of a server that handles a request.
One worker means one request at a time. Every request also spends 20 ms on the "database"
(we fake it with `time.sleep(0.020)`), plus a few ms of other work. About 23 ms in total.

When 100 requests arrive together, they stand in a **queue**: a waiting line where the first one
in is the first one served. Think of a shop with one cashier on Diwali.

```
request   1: waits     0 ms in line + ~23 ms work =    ~23 ms
request   2: waits    23 ms in line + ~23 ms work =    ~46 ms
request   3: waits    46 ms in line + ~23 ms work =    ~69 ms
request 100: waits ~2300 ms in line + ~23 ms work =  ~2330 ms
```

That matches the lab: the slowest customer waited about 2.3 seconds.
The one worker is the **bottleneck**: the narrowest point that slows everything down, like the neck of a bottle.

??? note "Going deeper: The two numbers every backend engineer watches"
    - **Latency**: how long **one** request takes, from the customer's point of view. Here: 23 ms when alone, 2.3 s in a crowd.
    - **Throughput**: how many requests the system finishes **per second**. One worker that needs 23 ms per request
      can finish at most 1000 ÷ 23 ≈ **43 requests per second**. No matter how many customers come.

    When more customers arrive per second than the throughput allows, the queue grows, and latency grows with it.
    We tried 300 customers at once. Nobody was turned away, but the last one waited **7.2 seconds**:
    300 requests ÷ 7.2 s ≈ 42 per second. The same limit, measured.

??? note "Going deeper: Little's Law"
    Queues follow a simple rule called **Little's Law**: *L = λ × W*.
    *L* is how many requests are inside the system (waiting or being served), *λ* (lambda) is how many
    arrive per second, and *W* is how long each one stays. If 40 requests per second arrive and each stays
    0.5 seconds, about 20 are inside at any moment. Engineers use it to size worker pools and queues.
    You will use it for capacity planning in Module 33.

### Why did more workers help so much?

In Task 3, you change one word: `HTTPServer` → `ThreadingHTTPServer`. Now every request gets its own thread.
The slowest wait drops from about 2,300 ms to about 60 ms. Why?

Because the 20 ms of "database time" is **waiting**, not working. While one thread waits, the CPU is free to
start the next request. So 100 requests can all wait at the same time, and finish at about the same time.

??? note "Going deeper: Would more workers always help?"
    No. We tried a version where the 20 ms is **CPU work** (a busy loop) instead of waiting, with
    `ThreadingHTTPServer`:

    ```
    users | average wait | slowest wait
    ------+--------------+-------------
        1 |        35 ms |       35 ms
       10 |        98 ms |      118 ms
       50 |       436 ms |      736 ms
      100 |       777 ms |     1504 ms
    ```

    Still 1.5 seconds for the slowest customer. In Python, threads in one process take turns running Python code,
    so CPU work doesn't run in parallel. (This rule is called the GIL; you will meet it in Modules 1 and 5.)
    For CPU work you need more **processes**, or more **servers**.

    That is the whole roadmap in one experiment: first find **what kind** of bottleneck you have, then pick the fix.
    Level 4 adds more workers and processes. Level 5 adds more servers. Level 3 makes each request do less work.
    Making a system handle more users is called **scaling**.

## 6. Lab

**Lab folder:** `labs/00-setup/02-the-full-roadmap/`

Start Bazaar's one-worker backend, then send the crowd:

```bash
cd labs/00-setup/02-the-full-roadmap
docker compose up -d --wait
docker compose run --rm users
```

Expected output: a table like the one above. With 100 users, the slowest wait is over 1 second.

In the lab README, you will also change **one word** in `server.py` to give Bazaar
a worker for every request, and watch the 2-second wait drop to about 60 ms.
When you finish, run `bash test_lab.sh`. You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Skipping the foundations.** "I just want Django." But when a request hangs,
   you need to know about processes, networks and memory. **Fix:** do Level 1 properly.
2. **Learning ten frameworks a little.** You end up unable to go deep in any of them.
   **Fix:** know one framework deeply; the deep ideas carry over to every other framework.
3. **Reading without doing the labs.** You will forget most of a lesson within a week.
   **Fix:** do every lab, and type the commands yourself.
4. **Jumping to microservices or Kubernetes too early.** Big companies use them for big problems.
   Bazaar with 100 users doesn't need them. **Fix:** learn what problem a tool solves before you reach for it.
5. **Adding servers before finding the bottleneck.** As the experiment showed, more threads didn't help CPU work.
   **Fix:** measure first, then fix the actual bottleneck.
6. **Remembering tools instead of problems.** Tools change every few years. Problems stay.
   **Fix:** for every tool, ask "which problem does this solve?"

## 8. Quiz

<div class="bz-quiz" data-quiz="m00-02"></div>

## 9. What's next

Next: [Installing Python and VS Code](03-installing-python-and-vscode.md). You will set up your own computer,
so you can write Bazaar's code yourself.

**In one line:** the course follows Bazaar from 1 user to 1 crore users; each new problem brings the next level,
and every fix starts with finding the bottleneck.

### Cheat sheet

| Level | Modules | Bazaar users | Main problem |
| --- | --- | --- | --- |
| 1. Foundations | 0–7 | 1 | Bazaar is just an idea |
| 2. Core backend | 8–13 | 100 | needs a website and an API |
| 3. Data | 14–18 | 10,000 | the database gets slow |
| 4. Production | 19–26 | 1 lakh | live: safe, fast, always on |
| 5. Scaling | 27–33 | 10 lakh+ | the Diwali sale |
| 6. Architecture | 34–37 | 1 crore | design decisions and leading |

| Word | Meaning |
| --- | --- |
| Latency | how long one request takes |
| Throughput | how many requests per second the system finishes |
| Bottleneck | the narrowest point that limits everything |
| Queue | a waiting line, first in, first served |
| Scaling | making a system handle more users or data |

| Command | What it does |
| --- | --- |
| `docker compose up -d --wait` | start the lab in the background and wait until it is healthy |
| `docker compose run --rm users` | run the crowd once |
| `docker compose restart bazaar` | restart the backend after changing its code |

> **Next in Bazaar:** To build Bazaar, you need the right tools on your laptop.
> Let's set them up.

<div class="bz-complete" data-lesson="m00-02"></div>
