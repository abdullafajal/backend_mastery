# Backend Mastery Course — Master Plan

Nov 21, 2026 · @Abdulla Fajal

## Overview

Ek free static website jo zero se production-level backend sikhati hai: Python, Django, PostgreSQL, Docker, multi-server systems aur database sharding. Saara content aur code Claude Code likhega, aur har concept ke saath ek interactive diagram aur ek runnable lab hoga.

- **Audience:** bilkul zero se shuru karne wala student, aur woh developer jo senior backend engineer ya architect level tak jaana chahta hai
- **Language:** website ka saara content simple English me, jaise ek teacher class me samjhata hai: short sentences, roz ki life ke examples, aur koi technical word bina explain kiye nahi
- **Website:** MkDocs Material + custom JavaScript diagrams, GitHub Pages par host (koi backend nahi)
- **Practice:** student apne system par `docker compose up` karke har lab chalayega
- **Progress:** browser `localStorage` me save hoga (lesson complete, quiz score)
- **Content source:** Claude Code, `CLAUDE.md` ke rules follow karte hue; har code example test hone ke baad hi publish hoga

**Final outcome:** course khatam karne par student Bazaar naam ka poora e-commerce backend khud bana chuka hoga. Isme Django API, PostgreSQL, Redis cache, Celery workers, Kafka events, Nginx load balancer, read replicas aur 3 shards honge, aur sab Docker Compose par chalega.

## Ek app, poora course: Bazaar

Poore course me sirf ek hi web app banegi: **Bazaar**, ek online marketplace jahan sellers products bechte hain aur customers order karte hain. Har lesson, har code example, har diagram, har lab aur SQL Playground ka data, sab isi app ka hoga. Koi alag todo app, blog ya school ka example nahi.

Course ek startup ki kahaani ki tarah chalta hai. Bazaar chhota shuru hota hai, users badhte hain, aur har naye level par ek real problem aati hai. Wahi problem agla topic aur agla tool laati hai. Isse student ko hamesha pata rehta hai ki koi cheez **kyun** use ho rahi hai, sirf **kaise** nahi.

&#91;embedded content: Bazaar growth story · 6 levels, har level ki agli problem\]

User counts kahaani ka hissa hain (1 se 1 crore users tak). Inse student ko feel aata hai ki kis scale par kaunsi problem aati hai.

**Bazaar me kaunsa tool kyun aata hai:**

| Tool | Bazaar me kab | Kyun (kaunsi problem solve karta hai) | Alternative, aur kyun nahi |
| --- | --- | --- | --- |
| Python | Module 4 | Simple syntax, aur backend, data aur scripting teeno me chalta hai | Node.js bhi chalta, par Python beginners ke liye aasaan hai |
| Django | Module 8 | Admin, ORM, auth aur security pehle se milte hain, to Bazaar jaldi launch hota hai | FastAPI halka hai, par admin, ORM aur auth khud jodne padte |
| Django REST Framework | Module 11 | Mobile app aur frontend ko JSON API chahiye | Plain Django views me har cheez haath se likhni padti |
| PostgreSQL | Module 9 aur 14 | Orders aur payments ke liye transactions, constraints aur strong consistency | MySQL bhi theek hai, par Postgres me JSONB, full-text search aur extensions zyada hain |
| pytest | Module 13 | Har change ke baad checkout tootna nahi chahiye | Django ka built-in `unittest` zyada verbose hai |
| PgBouncer | Module 17 | Bahut saari connections se Postgres thak jaata hai | Bina pool ke har request nayi connection kholti hai |
| OpenSearch | Module 18 | "red shoes under 1000" jaisi search SQL `LIKE` se slow aur kharab hoti hai | Postgres full-text search chhote scale par kaafi hai, isliye pehle wahi |
| MinIO / S3 | Module 18 | Product images database ya server disk par nahi rakhni chahiye | Server disk par rakhne se multiple servers par images nahi milti |
| Docker | Module 19 | "Mere laptop par chal raha tha" wali problem khatam, har jagah same setup | Seedha server par install karna har baar alag result deta hai |
| Gunicorn + Nginx | Module 20 | Django ka `runserver` production ke liye nahi bana | uWSGI bhi option hai, par Gunicorn simple hai |
| Celery + Redis | Module 21 | Order email aur invoice PDF banane me user ko wait nahi karna chahiye | Request ke andar hi kaam karna page ko slow karta hai |
| Redis cache | Module 22 | Homepage ke products har request par database se laana mehenga hai | Django ka local-memory cache multiple servers me share nahi hota |
| GitHub Actions | Module 24 | Manual deploy me galti hoti hai, tests skip ho jaate hain | Jenkins powerful hai par setup bhaari hai |
| Prometheus + Grafana | Module 25 | Site slow ho to pata chalna chahiye kahan aur kyun | Sirf logs se trend aur alert nahi milte |
| Kubernetes | Module 26 | Sale ke time automatically aur servers chahiye | Docker Compose ek hi machine tak seemit hai |
| Nginx load balancer | Module 27 | Ek server Diwali sale ka traffic nahi sambhal sakta | Cloud load balancer bhi chalta, par Nginx se concept saaf dikhta hai |
| Kafka | Module 29 | Order hone par inventory, email, analytics teeno ko khabar chahiye | RabbitMQ task queues ke liye better hai, event history ke liye Kafka |
| Read replica | Module 30 | 90% traffic sirf products padhne ka hai | Primary par saara load daalna use slow karta hai |
| Sharding (by `user_id`) | Module 31 | Orders table ek machine par fit nahi hoti | Bada server lena ek had tak hi kaam karta hai |

**Code kaise evolve hoga:**

- Ek hi repo `bazaar-app/`, jo har module ke saath badhta hai
- Har module ke liye do git tags: `m09-start` aur `m09-end`. Lab me student `start` se shuru karta hai aur `end` tak pahunchta hai. Atak jaye to `end` tag dekh sakta hai
- Har lesson "Previously in Bazaar" (2 line recap) se shuru hota hai aur "Next in Bazaar" (agli problem ka teaser) par khatam
- Har diagram me Bazaar ke asli naam dikhenge (`orders` table, `checkout` view, `order-service`), generic "Service A / Table X" nahi

## Lesson template aur diagram standards

Har lesson isi 9-part format me likha jayega, taaki poore course me consistency rahe.

1. **Kyun seekhein?** Bazaar me aayi ek real problem jo ye concept solve karta hai, jaise "sale ke din checkout slow ho gaya" (2-3 lines)
2. **Concept:** simple English me, teacher ki tarah step-by-step: pehle "why", phir "how", aur ek real-life analogy (jaise sharding = library ki alag-alag almirah)
3. **Interactive diagram:** concept ko step-by-step animate karna
4. **Code example:** chhota, complete aur runnable code, har important line par comment
5. **Under the hood:** andar kya ho raha hai, jaise ORM ki generated SQL, network packets, ya container logs
6. **Lab:** `labs/<module>/<lesson>/` me docker-compose + step-by-step tasks + expected output
7. **Common mistakes:** 3-5 galtiyan jo beginners karte hain, aur unka fix
8. **Quiz:** 5 MCQ, har ek ke saath explanation
9. **Aage kya:** agle lesson ka link aur 1-line summary

**Interactive diagram ke rules:**

- Plain JavaScript + SVG (ya D3.js), har diagram ek alag file: `docs/assets/diagrams/<name>.js`
- Controls: **Play / Pause / Next step / Reset**, aur ek speed slider
- Har step ke saath neeche ek caption ho ki abhi kya ho raha hai
- User input wale diagrams jahan possible ho, jaise "user\_id daalo aur dekho kaunse shard me jaata hai", ya "ek server band karo aur dekho load balancer kya karta hai"
- Dark aur light mode dono me sahi dikhe, aur mobile par bhi chale
- Ek shared library `diagram-kit.js` banegi (boxes, arrows, packet animation, step controller), taaki saare diagrams ek jaise dikhein

## Curriculum: 6 levels, 38 modules

Agar main khud zero se senior backend engineer banna chahta, to ye raasta leta: pehle computer aur network ki neev, phir ek framework ko gehraai se, phir database ko andar tak, phir production, phir scaling, aur aakhir me architecture aur senior skills. Har level pichhle level par khada hai, isliye order mat todna.

### Level 1: Foundations

Yahan woh cheezein hain jo har backend concept ke neeche chhupi hain. Jo developer ye skip karta hai, woh aage chalkar debugging me atak jaata hai.

- **0. Welcome and setup**
  - Lessons: what a backend developer does, the full roadmap, installing Python, VS Code, Git, Docker
  - Diagram: clickable course roadmap
  - Lab: run your first container and verify your setup
- **1. How computers work**
  - Lessons: CPU, RAM, disk and why their speeds differ, processes vs threads, memory (stack and heap), file systems, what a "server" really is
  - Diagram: memory hierarchy speed race (CPU cache vs RAM vs SSD vs network)
  - Lab: watch processes and memory with `top` and `ps`
- **2. Linux and the command line**
  - Lessons: shell, files and paths, permissions, users, pipes and redirection, environment variables, SSH, `systemd`, package managers, logs
  - Diagram: Linux file tree explorer, how a pipe passes data between commands
  - Lab: a Linux playground inside a Docker container with 20 small tasks on Bazaar's server logs and files
- **3. Git and GitHub**
  - Lessons: commits, branches, merge vs rebase, resolving conflicts, pull requests, good commit messages
  - Diagram: interactive commit graph (type a git command, see the graph change)
  - Lab: create the Bazaar repo and fix a real merge conflict in it
- **4. Python fundamentals**
  - Lessons: variables and types, control flow, functions, lists/dicts/sets, comprehensions, errors and exceptions, files, JSON, modules
  - Diagram: how variables point to objects in memory
  - Lab: Bazaar v0, a command-line product catalog (add, list, search products)
- **5. Advanced Python**
  - Lessons: OOP in depth, dataclasses, decorators, generators, context managers, type hints, virtual environments and packaging (`uv`, `pip`), the GIL, threading vs multiprocessing vs `asyncio`
  - Diagram: decorator wrapping, the asyncio event loop juggling tasks
  - Lab: fetch prices from 100 Bazaar supplier APIs three ways (sync, threads, async) and compare time
- **6. Data structures and algorithms for backend**
  - Lessons: Big-O, arrays, hash maps, linked lists, stacks and queues, trees and B-trees, heaps, graphs; har ek ka backend me real use (cache, index, job queue, routing)
  - Diagram: hash map buckets and collisions, B-tree insert and search
  - Lab: build Bazaar's in-memory shopping cart store with expiry (later replaced by Redis)
- **7. Networking and how the web works**
  - Lessons: IP, ports, DNS, TCP vs UDP, the 3-way handshake, HTTP/1.1, HTTP/2, HTTP/3, TLS/HTTPS, cookies, CORS, WebSockets, REST basics
  - Diagram: "what happens when you type a URL" end-to-end journey, TLS handshake step-by-step
  - Lab: serve Bazaar's product list from a mini HTTP server built with Python `socket` and call it with `curl`

### Level 2: Core backend with Django

Ek framework ko gehraai se seekhna, das frameworks ko upar-upar se seekhne se better hai. Is level ke end tak student ek complete, tested REST API bana lega.

- **8. Django fundamentals and the request lifecycle**
  - Lessons: project vs app, settings, URL routing, function and class-based views, templates, static files, forms, admin; the full journey of one request: browser → Nginx → Gunicorn (WSGI) → middleware → URL resolver → view → ORM → database → template → response
  - Diagram: request lifecycle animation that pauses at every layer, middleware "onion"
  - Lab: Bazaar moves to Django: product list and product detail pages
- **9. Models, ORM and schema**
  - Lessons: fields and options, `ForeignKey`, `OneToOneField`, `ManyToManyField` with `through`, how a model becomes a SQL table, migrations (`makemigrations`, `migrate`, `sqlmigrate`, data migrations, rollback), lazy QuerySets, `F()`, `Q()`, `annotate`, `aggregate`, N+1 and `select_related` / `prefetch_related`, `transaction.atomic`, custom managers
  - Diagram: model → migration → SQL → table side by side, clickable ER diagram that shows the JOIN, N+1 query counter
  - Lab: e-commerce schema (User, Product, Category, Order, OrderItem) and count queries with Debug Toolbar
- **10. Django in depth**
  - Lessons: writing your own middleware, signals and when to avoid them, custom management commands, file uploads, custom user model, settings for multiple environments, a service layer to keep views thin, async views
  - Diagram: where business logic should live (view vs model vs service)
  - Lab: refactor Bazaar's checkout, a "fat view" into a service layer
- **11. API design and Django REST Framework**
  - Lessons: REST principles, resource naming, status codes, error format, pagination (offset vs cursor), filtering, versioning, idempotency keys, webhooks; DRF serializers, ViewSets, routers, throttling, OpenAPI docs; short intro to GraphQL and gRPC (kab use karein)
  - Diagram: one API request through authentication → permission → throttle → serializer → response
  - Lab: products and orders API for the e-commerce app
- **12. Authentication and authorization**
  - Lessons: password hashing, sessions vs tokens, JWT (and its traps), OAuth 2.0 and OpenID Connect ("Login with Google"), roles and permissions (RBAC), object-level permissions, multi-tenant access
  - Diagram: OAuth 2.0 authorization code flow, JWT structure and verification
  - Lab: JWT login + Google login + role-based access
- **13. Testing**
  - Lessons: why tests, test pyramid, `pytest-django`, fixtures, `factory_boy`, API tests, mocking external services, TDD, coverage
  - Diagram: test pyramid with real examples at each layer
  - Lab: write tests for the e-commerce API until coverage crosses 85%

### Level 3: Data

Zyaadatar backend problems asal me database problems hoti hain. Is level me student SQL likhna, schema design karna, aur database ke andar kya hota hai, teeno seekhta hai.

- **14. SQL with PostgreSQL**
  - Lessons: SELECT, INSERT, UPDATE, DELETE, all JOIN types, GROUP BY and HAVING, subqueries, CTEs, window functions, views, JSONB, full-text search
  - Diagram: JOIN visualizer (rows from two tables matching live)
  - Lab: SQL Playground ke 20 interactive lessons browser me (neeche dekho), phir 50 bonus challenges
- **15. Data modeling and schema design**
  - Lessons: entities and relationships, normalization (1NF to 3NF), when to denormalize, constraints (primary, foreign, unique, check), soft delete, audit logs, money and time zones, multi-tenant designs (shared table vs schema per tenant)
  - Diagram: normalize a messy table step by step
  - Lab: design Bazaar's full schema (sellers, products, variants, inventory, orders, payments, reviews) and review it for common mistakes
- **16. How databases work inside**
  - Lessons: pages and rows on disk, B-tree indexes, composite and partial indexes, GIN, the query planner and `EXPLAIN ANALYZE`, Write-Ahead Log (WAL), ACID, MVCC and VACUUM, isolation levels, locks and deadlocks
  - Diagram: B-tree index search, MVCC row versions, isolation level simulator (two transactions side by side showing dirty, non-repeatable and phantom reads), deadlock animation
  - Lab: load 1 million rows, compare query time before and after an index, create a deadlock on purpose
- **17. Database performance**
  - Lessons: finding slow queries (`pg_stat_statements`), fixing N+1, bulk inserts and updates, keyset pagination, connection pooling with PgBouncer, safe migrations on big tables, backups and point-in-time recovery
  - Diagram: connection pool vs no pool under load
  - Lab: make a 5-second API endpoint respond in under 100 ms
- **18. Beyond SQL: choosing the right store**
  - Lessons: Redis deep dive (data types, persistence), document stores (MongoDB) and when they fit, search engines (OpenSearch/Elasticsearch, inverted index), object storage (S3, MinIO) for files, time-series basics, B-tree vs LSM-tree storage engines
  - Diagram: inverted index building, "which database for which job" decision tree
  - Lab: add product search with OpenSearch and image uploads to MinIO

#### SQL Playground: SQLBolt jaisa interactive practice

Database section ka sabse important hissa ek in-browser SQL Playground hoga, jo [SQLBolt](https://sqlbolt.com/) se inspired hai. Student lesson padhta hai, usi page par SQL likhta hai, Run dabata hai, aur turant dekhta hai ki answer sahi hai ya nahi. Kuch install karne ki zaroorat nahi.

**Ye kaise chalega (bina backend ke):**

- Engine: [PGlite](https://github.com/electric-sql/pglite), yaani asli PostgreSQL jo WebAssembly ban kar browser me chalta hai. Isliye GitHub Pages par bhi kaam karega, aur student wahi Postgres seekhega jo course me aage use hoga
- Har exercise ke liye page load par ek chhota dataset (CREATE TABLE + INSERT) browser ke andar ban jayega
- Editor: CodeMirror, SQL syntax highlighting aur autocomplete ke saath
- Progress `localStorage` me save hoga

**Har exercise ka layout:**

1. Upar 2-3 line ka concept, simple English me
2. Table ka preview, taaki student ko data dikhe
3. Task list, jaise "Find all products cheaper than 500"
4. SQL editor + Run button + result table
5. Auto-check: student ka result expected result se compare hoga (order matter karta hai ya nahi, ye har task me set hoga). Sahi hone par green tick aur agla task khulega
6. Hint button, aur 3 galat try ke baad "Show solution"
7. "Reset database" button, taaki UPDATE/DELETE ke baad data wapas aa jaye

**20 interactive lessons (har lesson me 3-5 tasks):**

| # | Lesson | # | Lesson |
| --- | --- | --- | --- |
| 1 | SELECT basics | 11 | Order of query execution |
| 2 | Filtering with WHERE | 12 | Subqueries |
| 3 | Text filters (LIKE, IN) | 13 | CTEs (WITH) |
| 4 | Sorting and LIMIT | 14 | Window functions |
| 5 | Review: simple queries | 15 | INSERT |
| 6 | INNER JOIN | 16 | UPDATE and DELETE |
| 7 | LEFT and FULL JOIN | 17 | CREATE TABLE and constraints |
| 8 | Working with NULL | 18 | ALTER and DROP |
| 9 | Expressions and aliases | 19 | Indexes and EXPLAIN |
| 10 | Aggregates, GROUP BY, HAVING | 20 | Transactions (BEGIN, COMMIT, ROLLBACK) |

**Datasets:** sirf Bazaar ka data (users, sellers, products, orders, reviews), taaki SQL practice bhi usi app par ho jo student bana raha hai.

**Aur jagah bhi reuse hoga:** Module 15 me schema design exercises, Module 16 me `EXPLAIN` aur index ka asar, aur Module 9 me "Django ORM query vs uski SQL" side by side. Isolation levels aur deadlocks ke liye do alag connections chahiye, isliye wo Docker lab me hi rahenge.

**Files:** `docs/assets/playground/sql-playground.js` (reusable component) aur har lesson ki exercises `docs/assets/playground/exercises/<lesson>.json` me (dataset, tasks, expected results, hints). Saare lessons, tasks aur datasets Claude Code apne se likhega. SQLBolt sirf idea ke liye inspiration hai, uska content copy nahi karna, aur site par ek "Inspired by SQLBolt" credit dena.

### Level 4: Production and infrastructure

Code laptop par chalna aur production me lakhon users ke liye chalna, do alag duniya hain. Is level me student apna app sach me deploy, secure aur monitor karna seekhta hai.

- **19. Docker in depth**
  - Lessons: containers vs VMs, images and layers, a production Dockerfile for Django (multi-stage, non-root user, small image), volumes, networks, Docker Compose, environment variables and secrets, healthchecks, debugging containers
  - Diagram: image layers stacking up line by line, container network with Docker DNS
  - Lab: the full e-commerce app (Django + Postgres + Redis) on Compose
- **20. Running Django in production**
  - Lessons: the twelve-factor app, WSGI vs ASGI, Gunicorn and Uvicorn workers, Nginx as reverse proxy, static and media files, settings per environment, structured logging, graceful shutdown
  - Diagram: Nginx → Gunicorn workers → Django, what changes when you add workers
  - Lab: production-style Compose stack with Nginx
- **21. Background jobs and real-time**
  - Lessons: why some work should not happen inside a request, Celery with Redis or RabbitMQ, retries with backoff, scheduled tasks (Celery Beat), idempotent tasks, WebSockets with Django Channels
  - Diagram: producer → broker → workers, task retry flow
  - Lab: send order emails in the background, add a live order-status page
- **22. Caching**
  - Lessons: cache-aside, write-through, TTL, Django cache framework, cache invalidation, cache stampede, HTTP caching headers (`ETag`, `Cache-Control`), CDNs
  - Diagram: cache hit vs miss with response times
  - Lab: make the product list 20x faster with Redis
- **23. Security**
  - Lessons: OWASP Top 10, SQL injection, XSS, CSRF, SSRF, secrets management, HTTPS everywhere, security headers, rate limiting, dependency scanning
  - Diagram: CSRF attack and how the token stops it, SQL injection (raw query vs ORM)
  - Lab: find and fix 8 bugs in a deliberately vulnerable app
- **24. CI/CD and deployment**
  - Lessons: GitHub Actions, building and pushing Docker images, deploying to a VPS, domains, DNS and free SSL, zero-downtime deploys, safe database migrations, rollbacks, feature flags
  - Diagram: git push → tests → image → server pipeline
  - Lab: automatic deploy on every push to `main`
- **25. Observability**
  - Lessons: logs, metrics and traces, Prometheus and Grafana, OpenTelemetry tracing, health checks, alerts, SLIs, SLOs and error budgets
  - Diagram: trace waterfall showing time spent in each service
  - Lab: Grafana dashboard for request rate, errors and latency
- **26. Cloud and Kubernetes basics**
  - Lessons: cloud building blocks (compute, managed database, object storage, VPC, IAM) using AWS as the example, Kubernetes pods, deployments, services, ingress and autoscaling, infrastructure as code with Terraform
  - Diagram: a Django app on Kubernetes, pods scaling up under load
  - Lab: run the app on a local Kubernetes cluster (`kind`)

### Level 5: Scaling and distributed systems

Yahan se ek server kaafi nahi rehta. Student seekhta hai ki multiple servers ek dusre se kaise baat karte hain, data kai machines par kaise baant'te hain, aur cheezein fail hone par system kaise chalta rehta hai.

- **27. Scaling basics and load balancing**
  - Lessons: vertical vs horizontal scaling, stateless servers, sessions in Redis, load balancing algorithms (round robin, least connections, IP hash), health checks, sticky sessions
  - Diagram: load balancer simulator (add servers, crash one, watch traffic move)
  - Lab: 3 Django containers behind Nginx; every response shows which server answered
- **28. How services talk to each other**
  - Lessons: monolith vs microservices, sync (REST, gRPC) vs async (messages), service discovery, API gateway, timeouts, retries with exponential backoff and jitter, circuit breakers, bulkheads
  - Diagram: order → payment → inventory call chain, circuit breaker states (closed, open, half-open)
  - Lab: split payments into its own service and survive when it goes down
- **29. Messaging and event streaming**
  - Lessons: queues vs pub/sub vs event logs, RabbitMQ vs Kafka, consumer groups and partitions, ordering, at-least-once delivery and idempotent consumers, the outbox pattern, dead-letter queues
  - Diagram: Kafka topic with partitions and consumer groups, outbox pattern flow
  - Lab: publish "order placed" events to Kafka and consume them in two services
- **30. Replication**
  - Lessons: primary and replicas, synchronous vs asynchronous replication, replication lag, read-your-own-writes, failover and promotion, Django database routers for read/write split
  - Diagram: write on primary, stale read on replica (lag made visible)
  - Lab: PostgreSQL primary + replica with a Django router
- **31. Partitioning and sharding**
  - Lessons: partitioning inside one database (range, list, hash), sharding across databases, range vs hash vs directory sharding, choosing a shard key, hot shards, consistent hashing, resharding without downtime, cross-shard queries, Citus
  - Diagram: sharding simulator (enter a `user_id`, see its shard; add a shard, watch data move), consistent hashing ring
  - Lab: 3 PostgreSQL shards with a Django router that picks the shard by `user_id`
- **32. Distributed systems theory**
  - Lessons: why distributed is hard (network failures, partial failures), CAP and PACELC, consistency models, clocks and ordering, leader election, consensus with Raft, distributed locks, two-phase commit vs the Saga pattern
  - Diagram: Raft leader election and log replication you can play with (kill the leader, watch a new one win)
  - Lab: build an order Saga with compensating actions
- **33. Performance and reliability at scale**
  - Lessons: load testing with Locust or k6, profiling Python, rate limiting algorithms (token bucket, sliding window), backpressure, graceful degradation, capacity planning, chaos testing
  - Diagram: token bucket filling and draining, latency percentiles (p50, p95, p99)
  - Lab: load test the e-commerce stack, find the bottleneck, fix it

### Level 6: Architecture and senior skills

Senior engineer sirf code nahi likhta, woh trade-offs chunta hai, system design karta hai, aur team ko aage le jaata hai. Ye level student ko wahan tak pahunchata hai.

- **34. Software architecture**
  - Lessons: layered and clean architecture, domain-driven design basics (bounded contexts, aggregates), modular monolith, when microservices are worth it, CQRS, event sourcing, architecture decision records (ADRs)
  - Diagram: the same app as a monolith, a modular monolith and microservices, side by side
  - Lab: turn the e-commerce monolith into clean modules with clear boundaries
- **35. System design**
  - Lessons: a repeatable method (requirements → estimates → API → data model → high-level design → deep dives → trade-offs), back-of-the-envelope maths; case studies, each one a new Bazaar feature: share-link URL shortener, API rate limiter, buyer-seller chat, personalized home feed, order notifications, payments, Diwali flash sale, product image storage
  - Diagram: each case study's architecture building up step by step
  - Lab: a design doc for one case study, plus a working mini version of the URL shortener
- **36. Senior engineer skills**
  - Lessons: reading large codebases, code reviews, writing design docs, estimating work, handling production incidents and writing postmortems, technical debt, mentoring, contributing to open source, backend interview preparation
  - Diagram: incident timeline from alert to postmortem
  - Lab: run a mock incident on the capstone and write the postmortem
- **37. Capstone project**
  - Student finishes Bazaar v1.0, the complete backend: Django REST API, PostgreSQL (primary + replica + 3 shards), Redis cache, Celery workers, Kafka events, 3 app servers behind Nginx, Prometheus + Grafana, CI/CD, all on Docker Compose (and optionally Kubernetes)
  - Har milestone ke saath ek checklist, tests aur reference solution hoga

## Repo structure aur Claude Code ke rules

Ek hi GitHub repo me website, diagrams aur labs teeno rahenge.

```
backend-mastery/
├── CLAUDE.md                  # Claude Code ke liye rules (neeche)
├── PLAN.md                    # ye plan (export karke)
├── mkdocs.yml
├── docs/
│   ├── index.md
│   ├── 00-setup/
│   ├── 01-python/
│   ├── ...
│   ├── 31-sharding/
│   │   ├── 01-replication.md
│   │   └── 05-hash-sharding.md
│   └── assets/
│       ├── diagrams/          # har interactive diagram ki JS file
│       │   ├── diagram-kit.js # shared boxes, arrows, step controller
│       │   └── sharding-simulator.js
│       └── progress.js        # localStorage progress tracking
├── labs/
│   └── 31-sharding/05-hash-sharding/
│       ├── docker-compose.yml
│       ├── app/
│       ├── README.md          # tasks + expected output
│       └── test_lab.sh        # lab chalakar verify karne ka script
└── .github/workflows/
    ├── deploy.yml             # MkDocs build → GitHub Pages
    └── test-labs.yml          # har lab ka test_lab.sh chalana
```

**`CLAUDE.md` me ye rules hone chahiye:**

1. Har lesson "Lesson template" ke 9 parts follow kare, file naam `NN-topic-name.md`
2. Saara content simple English me, friendly teacher wali tone ("Let's understand this with a small example"). Sentences 20 words se chhote, ek paragraph me ek idea, aur student ko "you" bolkar address karo
3. Har code example complete aur runnable ho, koi `...` ya adhoora code nahi
4. Har lab ke saath `test_lab.sh` ho; lesson tab tak complete nahi jab tak Claude Code ne lab chalakar test pass na kiya ho
5. Versions fix rahein: Python 3.13, Django 5.2 LTS, DRF latest, PostgreSQL 17, Redis 7; Docker images me exact tags
6. Har interactive diagram `diagram-kit.js` use kare aur Play/Next/Reset controls de
7. Ek lesson ek concept: 10-15 minute me padhne layak
8. Naya term pehli baar aaye to uski 1-line definition do aur glossary page me add karo
9. Lesson likhne ke baad `mkdocs build --strict` chalao, koi broken link nahi hona chahiye

**Sabse important rule:** har example, diagram, lab aur SQL exercise sirf Bazaar app ka hoga. Har lesson batayega ki Bazaar me kaunsi problem aayi, ye tool ya concept kyun chuna gaya, aur kaunsa alternative kyun nahi chuna. Naya code hamesha pichhle module ke `end` tag ke upar banega.

**Claude Code ko prompt aise do:**

> Module 31, Lesson 5: Hash sharding. CLAUDE.md ke rules follow karo. `docs/31-sharding/05-hash-sharding.md` likho, `sharding-simulator.js` diagram banao, aur `labs/31-sharding/05-hash-sharding/` me 3 Postgres shards + Django router wala lab banao. `test_lab.sh` chalakar verify karo, phir mkdocs build check karo.

## Build roadmap aur quality checklist

Course 5 phases me banega. Agla phase tabhi shuru ho jab pichhle phase ka gate pass ho jaye.

&#91;embedded content: build roadmap · 5 phases, har phase ka gate\]

Phase 1 sabse important hai: template aur `diagram-kit.js` ek baar sahi ban gaye, to baaki saare lessons Claude Code isi pattern par jaldi likh dega.

**Har lesson publish karne se pehle ye check karo:**

- [ ] Lesson template ke saare 9 parts maujood hain
- [ ] Har code example chalakar test kiya gaya
- [ ] Lab ka `test_lab.sh` pass hua, aur README me expected output likha hai
- [ ] Interactive diagram desktop aur mobile dono par chalta hai, dark mode me bhi
- [ ] Quiz ke har answer ki explanation hai
- [ ] `mkdocs build --strict` bina error ke chala
- [ ] Khud ek baar beginner ki nazar se padha: koi term bina explain kiye to nahi aaya?
