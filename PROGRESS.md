# PROGRESS.md — Build log

Ye file batati hai ki course ka kya ban chuka hai, kya verify hua hai, aur aage kya karna hai.
**Har session ke end me update karna zaroori hai** (rules: `CLAUDE.md` §0).

Legend: ✅ done + verified · 🟡 in progress / partial · ⬜ not started · ⚠️ needs decision

---

## Next up

**✅ Two-layer conversion done (owner approved, 2026-11-21):** all 12 lessons now have an "In 1 minute" box, advanced sections in "Going deeper" boxes (via `scripts/two_layer.py` + hand-simplified dense sections: OS/process table, socket steps, resources, exit codes, scripts, names→objects, file descriptors, file system intro, HTTP, roadmap levels, refcount). Visible core ≈ 1,500–2,700 words per lesson (was 3,500–5,000). Quizzes: core questions first, ≤3 marked "(Going deeper)". Lab READMEs: deeper tasks marked "optional, Going deeper".
**✅ Module 2 complete (2026-11-21).** **✅ Module 3 complete (2026-11-22).** **✅ Module 4 complete (2026-11-22)** — Bazaar v0 (plan ka lab) bana: `labs/04-python-fundamentals/08-modules-and-bazaar-v0/bazaar_v0/`. **✅ Module 5 complete (2026-11-23)** — plan's lab done (100 supplier APIs: 10.6 s / 0.3 s / 0.2 s). **Next:** Module 6 — Data structures and algorithms for backend (plan: Big-O, arrays, hash maps, linked lists, stacks and queues, trees and B-trees, heaps, graphs; diagrams: hash map buckets and collisions, B-tree insert and search; lab: in-memory shopping cart store with expiry). Pehle Module 6 ka lesson split decide karke yahan likhna.

**Deploy (2026-11-23):** repo `abdullafajal/backend_mastery` (public), pushed. Owner must enable GitHub Pages once: Settings → Pages → Source: **GitHub Actions**. Until then the "Deploy site" job fails at `deploy-pages` (build passes). ✅ Owner enabled Pages and set the custom domain **backend.espere.in** (github.io URL redirects there); deploy of 81e0eb9 is live. `site_url` → https://backend.espere.in/. HTTPS certificate not issued yet at the time of checking (https gave no answer); when it is, tick "Enforce HTTPS" in Settings → Pages.

Module 5 split (8 lessons): 1. Classes and objects ✅ · 2. Inheritance and special methods ✅ · 3. Dataclasses and type hints ✅ · 4. Decorators ✅ · 5. Generators and context managers ✅ · 6. Virtual environments and packaging ✅ · 7. Threads and processes ✅ · 8. asyncio, and 100 supplier APIs ✅.

Module 4 split (8 lessons): 1. Variables and types ✅ · 2. Control flow ✅ · 3. Functions ✅ · 4. Lists, dicts and sets ✅ · 5. Comprehensions ✅ · 6. Errors and exceptions ✅ · 7. Files and JSON ✅ · 8. Modules, and Bazaar v0 ✅.

Module 3 split (5 lessons): 1. Commits and history ✅ · 2. Branches · 3. Merging and conflicts (plan ka lab: real merge conflict fix, Neha vs Rohan) · 4. Rebase (merge vs rebase) · 5. GitHub and pull requests (local bare repo as "GitHub" in lab; PR flow explained).

0. ✅ Depth upgrade poora: saare 6 lessons Depth standard (§4a) par hain.
0b. ⚠️ Owner se naye website design (theme/) par feedback lena.
1. ✅ Module 2 done (01–07). **Module 3: Git and GitHub** next. Module 2 ka split (reference): Planned lessons (plan ke topics ko 7 lessons me baanta):
   1. The shell: commands, arguments/options, `--help`/`man`, history, tab completion, quoting, globbing, exit codes, `&&` `||` `;`
   2. Working with files: `ls cd cp mv rm mkdir find`, viewing (`cat less head tail -f`), `nano`
   3. Users and permissions: rwx, `chmod`, `chown`, users/groups, root, `sudo`, umask, "Permission denied"
   4. Pipes and redirection: stdin/stdout/stderr, `> >> 2> |`, `grep sort uniq wc cut awk` on Bazaar logs → **plan ka "Linux playground" lab (20 tasks on Bazaar logs/files)**
   5. Environment variables, packages and background jobs: `env`, `export`, `~/.bashrc`, `apt`, `&`, `jobs`, `nohup`
   6. SSH: keys, connecting, `scp` (lab: client + SSH server containers)
   7. systemd and logs: services, `systemctl`, `journalctl`, `/var/log` (lab approach decide karna: systemd container ko privileges chahiye)
   Diagrams (plan): Linux file tree explorer, "how a pipe passes data between commands".
2. ⚠️ Owner ke manual checks: macOS/Windows installer steps (Lessons 3–4) asli machine par ek baar follow karna; Linux Docker Engine install (official docs link).
3. `bazaar-app/` repo + `m00-end` tag ka structure decide karna (⚠️ dekho Open questions).
4. `mkdocs.yml` me real `site_url` daalna jab GitHub repo ban jaye.

---

## Phase tracker

> Plan ka "build roadmap" embedded content export me nahi aaya. Neeche ke phases maine plan ke
> text se banaye hain ("Phase 1 = template + diagram-kit"). ⚠️ Owner confirm kare.

| Phase | Scope | Gate (agla phase tab shuru) | Status |
| --- | --- | --- | --- |
| 1. Foundation | CLAUDE.md, site skeleton, lesson template, `diagram-kit.js`, progress + quiz, CI, 1 pilot lesson end-to-end | Pilot lesson definition-of-done ke saare checks pass | ✅ (pilot: m00-01) |
| 2. Level 1–2 | Modules 0–13 | Har lesson DoD pass, `bazaar-app` tags m00–m13 | 🟡 started |
| 3. Level 3 + SQL Playground | Modules 14–18, PGlite playground, 20 SQL lessons | Playground 20 lessons auto-check ke saath | ⬜ |
| 4. Level 4 | Modules 19–26 | Production Compose stack chal raha | ⬜ |
| 5. Level 5–6 + Capstone | Modules 27–37 | Capstone Bazaar v1.0 chal raha | ⬜ |

---

## Infrastructure (Phase 1)

| Component | File | Status | Verified how |
| --- | --- | --- | --- |
| Rules for Claude Code | `CLAUDE.md` | ✅ | — |
| Plan copy | `PLAN.md` | ✅ | Master plan ki exact copy |
| MkDocs config | `mkdocs.yml` (theme: null + custom_dir, `search_index_only`, `extra.levels`), `requirements-docs.txt` | ✅ | `mkdocs build --strict` pass |
| **Own website design** | `theme/` (main.html, home.html, macros.html, 404.html, css/site.css, js/site.js, img/) | ✅ | Screenshots home/lesson × light/dark × desktop/mobile; Playwright: resume card, progress meter, ⌘K search + Enter, sidebar ✓, no console errors |
| Diagram/quiz styles | `docs/assets/css/course.css` | ✅ | tokens ab site.css se; rem values ×1.25 (Material ka base 20px tha, ab 16px) |
| Progress + quiz + complete button | `docs/assets/js/progress.js` | ✅ | Playwright: quiz score, best score save, done survives reload, home summary |
| Diagram library | `docs/assets/diagrams/diagram-kit.js` | ✅ | Playwright: Play/Pause/Back/Next/Reset, input resets, narrow layout, no console errors |
| Reference diagram | `docs/assets/diagrams/request-journey.js` | ✅ | Same as above |
| Lesson template | `templates/lesson-template.md` | ✅ | — |
| Lab templates | `templates/test_lab.sh`, `templates/lab-README.md` | ✅ | — |
| Run all labs | `scripts/test_all_labs.sh` | ✅ | 11/11 labs pass (before 02-03); ran-count guard |
| Browser checker (all diagrams + quizzes, 2 modes, screenshots) | `scripts/check_site.py`, `requirements-dev.txt` | ✅ | 9 pages; `wait_until=domcontentloaded` (ek baar Google Fonts ki wajah se 30 s timeout aaya tha) |
| Deploy workflow | `.github/workflows/deploy.yml` | 🟡 | Likha hai, GitHub par abhi chala nahi (repo push nahi hua) |
| Lab CI workflow | `.github/workflows/test-labs.yml` | 🟡 | Same; Python 3.13 setup step add kiya (lab 00-04 ka `verify_setup.sh` host Python check karta hai) |
| Glossary | `docs/glossary.md` | ✅ | 192 terms |
| Home / About | `docs/index.md`, `docs/about.md` | ✅ | SQLBolt credit About page par |
| SQL Playground (PGlite) | `docs/assets/playground/` | ⬜ | Phase 3 |

---

## Module tracker (38 modules)

| # | Module | Lessons done | Diagram(s) | Lab(s) | Status |
| --- | --- | --- | --- | --- | --- |
| 0 | Welcome and setup | 4 / 4 | request-journey ✅, course-roadmap ✅, path-lookup ✅, docker-run ✅ | 00-01 ✅, 00-02 ✅, 00-03 ✅, 00-04 ✅ | ✅ |
| 1 | How computers work | 5 / 5 | memory-race ✅, processes-threads ✅, stack-heap ✅, file-system ✅, server-request ✅ | 01-01 … 01-05 ✅ | ✅ |
| 2 | Linux and the command line | 7 / 7 | shell-steps ✅, file-tree ✅, permission-check ✅, pipe-flow ✅, env-inherit ✅, ssh-keys ✅, systemd-lifecycle ✅ | 02-01 … 02-07 ✅ | ✅ |
| 3 | Git and GitHub | 5 / 5 | git-three-places ✅, commit-graph ✅ (story + merge + rebase + own), github-flow ✅ | 03-01 … 03-05 ✅ | ✅ |
| 4 | Python fundamentals | 8 / 8 | name-tags ✅ (+ list), control-flow ✅, function-call ✅, comprehension ✅, try-except ✅, file-json ✅, imports ✅ | 04-01 … 04-08 ✅ | ✅ |
| 5 | Advanced Python | 8 / 8 | class-objects ✅, method-lookup ✅, dataclass-hints ✅, decorator-wrap ✅, generator-flow ✅, venv-packaging ✅, concurrency-timeline ✅, event-loop ✅ | 05-01 … 05-08 ✅ | ✅ |
| 6 | Data structures and algorithms | 0 | ⬜ | ⬜ | ⬜ |
| 7 | Networking and how the web works | 0 | ⬜ | ⬜ | ⬜ |
| 8 | Django fundamentals | 0 | ⬜ | ⬜ | ⬜ |
| 9 | Models, ORM and schema | 0 | ⬜ | ⬜ | ⬜ |
| 10 | Django in depth | 0 | ⬜ | ⬜ | ⬜ |
| 11 | API design and DRF | 0 | ⬜ | ⬜ | ⬜ |
| 12 | Authentication and authorization | 0 | ⬜ | ⬜ | ⬜ |
| 13 | Testing | 0 | ⬜ | ⬜ | ⬜ |
| 14 | SQL with PostgreSQL | 0 | ⬜ | ⬜ | ⬜ |
| 15 | Data modeling and schema design | 0 | ⬜ | ⬜ | ⬜ |
| 16 | How databases work inside | 0 | ⬜ | ⬜ | ⬜ |
| 17 | Database performance | 0 | ⬜ | ⬜ | ⬜ |
| 18 | Beyond SQL | 0 | ⬜ | ⬜ | ⬜ |
| 19 | Docker in depth | 0 | ⬜ | ⬜ | ⬜ |
| 20 | Running Django in production | 0 | ⬜ | ⬜ | ⬜ |
| 21 | Background jobs and real-time | 0 | ⬜ | ⬜ | ⬜ |
| 22 | Caching | 0 | ⬜ | ⬜ | ⬜ |
| 23 | Security | 0 | ⬜ | ⬜ | ⬜ |
| 24 | CI/CD and deployment | 0 | ⬜ | ⬜ | ⬜ |
| 25 | Observability | 0 | ⬜ | ⬜ | ⬜ |
| 26 | Cloud and Kubernetes basics | 0 | ⬜ | ⬜ | ⬜ |
| 27 | Scaling basics and load balancing | 0 | ⬜ | ⬜ | ⬜ |
| 28 | How services talk to each other | 0 | ⬜ | ⬜ | ⬜ |
| 29 | Messaging and event streaming | 0 | ⬜ | ⬜ | ⬜ |
| 30 | Replication | 0 | ⬜ | ⬜ | ⬜ |
| 31 | Partitioning and sharding | 0 | ⬜ | ⬜ | ⬜ |
| 32 | Distributed systems theory | 0 | ⬜ | ⬜ | ⬜ |
| 33 | Performance and reliability at scale | 0 | ⬜ | ⬜ | ⬜ |
| 34 | Software architecture | 0 | ⬜ | ⬜ | ⬜ |
| 35 | System design | 0 | ⬜ | ⬜ | ⬜ |
| 36 | Senior engineer skills | 0 | ⬜ | ⬜ | ⬜ |
| 37 | Capstone project | 0 | ⬜ | ⬜ | ⬜ |

### Module 0 — lesson detail

| # | Lesson | File | Diagram | Lab | Quiz | DoD |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | What a backend developer does | `docs/00-setup/01-what-a-backend-developer-does.md` | `request-journey` ✅ | `labs/00-setup/01-what-a-backend-developer-does/` ✅ (6/6 checks) | `m00-01` ✅ | ✅ |
| 02 | The full roadmap | `docs/00-setup/02-the-full-roadmap.md` | `course-roadmap` ✅ | `labs/00-setup/02-the-full-roadmap/` ✅ (3/3 checks) | `m00-02` ✅ | ✅ |
| 03 | Installing Python and VS Code | `docs/00-setup/03-installing-python-and-vscode.md` | `path-lookup` ✅ | `labs/00-setup/03-installing-python-and-vscode/` ✅ (7/7 checks) | `m00-03` ✅ | ✅ |
| 04 | Installing Git and Docker | `docs/00-setup/04-installing-git-and-docker.md` | `docker-run` ✅ | `labs/00-setup/04-installing-git-and-docker/` ✅ (5/5 checks, 9 tasks) + `verify_setup.sh` | `m00-04` ✅ (8 Q) | ✅ Depth v1 |

### Module 1 — lesson detail

| # | Lesson | File | Diagram | Lab | Quiz | DoD |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | CPU, RAM and disk | `docs/01-how-computers-work/01-cpu-ram-and-disk.md` | `memory-race` ✅ | `labs/01-how-computers-work/01-cpu-ram-and-disk/` ✅ (7/7 checks, 6 tasks) | `m01-01` ✅ (8 Q) | ✅ Depth v1 |
| 02 | Processes and threads | `docs/01-how-computers-work/02-processes-and-threads.md` | `processes-threads` ✅ | `labs/01-how-computers-work/02-processes-and-threads/` ✅ (11/11 checks) | `m01-02` ✅ (8 Q) | ✅ Depth v1 |
| 03 | Memory: stack and heap | `docs/01-how-computers-work/03-stack-and-heap.md` | `stack-heap` ✅ | `labs/01-how-computers-work/03-stack-and-heap/` ✅ (8/8 checks, 7 tasks) | `m01-03` ✅ (8 Q) | ✅ Depth v1 |
| 04 | File systems | `docs/01-how-computers-work/04-file-systems.md` | `file-system` ✅ | `labs/01-how-computers-work/04-file-systems/` ✅ (7/7 checks, 7 tasks) | `m01-04` ✅ (8 Q) | ✅ Depth v1 |
| 05 | What a server really is | `docs/01-how-computers-work/05-what-a-server-is.md` | `server-request` ✅ | `labs/01-how-computers-work/05-what-a-server-is/` ✅ (5/5 checks, 6 tasks) | `m01-05` ✅ (8 Q) | ✅ Depth v1 · Module 2 ka link pending |

### Module 2 — lesson detail

| # | Lesson | File | Diagram | Lab | Quiz | DoD |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | The shell | `docs/02-linux-command-line/01-the-shell.md` | `shell-steps` ✅ | `labs/02-linux-command-line/01-the-shell/` ✅ (8/8 checks, 9 tasks) | `m02-01` ✅ (8 Q) | ✅ Depth v1 |
| 02 | Working with files | `docs/02-linux-command-line/02-working-with-files.md` | `file-tree` ✅ (plan ka "file tree explorer") | `labs/02-linux-command-line/02-working-with-files/` ✅ (10/10 checks, 11 tasks; deeper tasks marked optional) | `m02-02` ✅ (8 Q: 6 core + 2 deeper) | ✅ **Two-layer v1 (sample)** |
| 03 | Users and permissions | `docs/02-linux-command-line/03-users-and-permissions.md` | `permission-check` ✅ | `labs/02-linux-command-line/03-users-and-permissions/` ✅ (10/10 checks, 11 tasks) | `m02-03` ✅ (8 Q) | ✅ Depth v1 · Lesson 4 ka link pending |
| 04 | Pipes and redirection (+ 20-task playground) | `docs/02-linux-command-line/04-pipes-and-redirection.md` | `pipe-flow` ✅ (plan ka pipe diagram) | `labs/02-linux-command-line/04-pipes-and-redirection/` ✅ (8/8 checks; playground 20 tasks verified vs independent Python) | `m02-04` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 (written in two layers from the start) |
| 05 | Environment variables, packages, background jobs | `docs/02-linux-command-line/05-env-packages-jobs.md` | `env-inherit` ✅ | `labs/02-linux-command-line/05-env-packages-jobs/` ✅ (7/7 checks, 8 tasks; Task 6 needs internet for apt) | `m02-05` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 06 | SSH | `docs/02-linux-command-line/06-ssh.md` | `ssh-keys` ✅ | `labs/02-linux-command-line/06-ssh/` ✅ (8/8 checks, 8 tasks; laptop + bazaar-server containers) | `m02-06` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 07 | systemd and logs | `docs/02-linux-command-line/07-systemd-and-logs.md` | `systemd-lifecycle` ✅ | `labs/02-linux-command-line/07-systemd-and-logs/` ✅ (7/7 checks, 7 tasks; systemd as PID 1 in a privileged container) | `m02-07` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |

### Module 3 — lesson detail

| # | Lesson | File | Diagram | Lab | Quiz | DoD |
| --- | --- | --- | --- | --- | --- | --- |
| 01 | Commits and history | `docs/03-git-and-github/01-commits-and-history.md` | `git-three-places` ✅ | `labs/03-git-and-github/01-commits-and-history/` ✅ (8/8 checks, 9 tasks; starter Bazaar code baked into image) | `m03-01` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 02 | Branches | `docs/03-git-and-github/02-branches.md` | `commit-graph` ✅ (plan ka interactive graph: story + type-your-own) | `labs/03-git-and-github/02-branches/` ✅ (8/8 checks, 9 tasks; repo pre-built with fixed dates → hashes 7bb892c, 66d2406) | `m03-02` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 03 | Merging and conflicts | `docs/03-git-and-github/03-merging-and-conflicts.md` | `commit-graph` (`data-state-sit="merge"`) ✅ | `labs/03-git-and-github/03-merging-and-conflicts/` ✅ (10/10 checks, 10 tasks; repo pre-built: main, diwali-sale, rohan-discount by Rohan Mehta; real conflict ₹150 vs ₹200) | `m03-03` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 04 | Rebase | `docs/03-git-and-github/04-rebase.md` | `commit-graph` (`data-state-sit="rebase"`) ✅ | `labs/03-git-and-github/04-rebase/` ✅ (9/9 checks, 7 tasks; student = Rohan; repo pre-built with free-delivery + rohan-readme) | `m03-04` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 05 | GitHub and pull requests | `docs/03-git-and-github/05-github-and-pull-requests.md` | `github-flow` ✅ (PR flow / rejected push) | `labs/03-git-and-github/05-github-and-pull-requests/` ✅ (9/9 checks, 9 tasks; bare repo = "GitHub", `/laptops/neha` + `/laptops/rohan` with includeIf identities; real GitHub = optional, not auto-checked) | `m03-05` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |

### Module 4 — lesson detail

| # | Lesson | File | Diagram | Lab | Quiz | DoD |
| --- | --- | --- | --- | --- | --- | --- |
| 08 | Modules, and Bazaar v0 | `docs/04-python-fundamentals/08-modules-and-bazaar-v0.md` | `imports` ✅ (run main.py / run money.py directly) | `labs/04-python-fundamentals/08-modules-and-bazaar-v0/` ✅ (14/14 checks, 7 tasks; **Bazaar v0** = main.py + catalog.py + money.py, JSON in `bazaar_v0/data/`, test uses `BAZAAR_DATA=/tmp/...`) | `m04-08` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 07 | Files and JSON | `docs/04-python-fundamentals/07-files-and-json.md` | `file-json` ✅ (save + restart + load / restart without saving) | `labs/04-python-fundamentals/07-files-and-json/` ✅ (11/11 checks, 7 tasks; programs write to `data/` (gitignored); exercise = `str(cart)` not JSON) | `m04-07` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 06 | Errors and exceptions | `docs/04-python-fundamentals/06-errors-and-exceptions.md` | `try-except` ✅ (typed input with Python-like int rules; try / crash) | `labs/04-python-fundamentals/06-errors-and-exceptions/` ✅ (9/9 checks, 6 tasks; mistakes: wrong except, bare except hiding a typo, forgot continue → 15 boxes) | `m04-06` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 05 | Comprehensions | `docs/04-python-fundamentals/05-comprehensions.md` | `comprehension` ✅ (filter with typed limit / dict) | `labs/04-python-fundamentals/05-comprehensions/` ✅ (9/9 checks, 6 tasks; `catalog_data.py` copied per folder, test checks copies identical) | `m04-05` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 04 | Lists, dicts and sets | `docs/04-python-fundamentals/04-lists-dicts-sets.md` | `name-tags` (`data-state-sit="list"`) ✅ | `labs/04-python-fundamentals/04-lists-dicts-sets/` ✅ (8/8 checks, 7 tasks; exercise = shared starter cart aliasing bug) | `m04-04` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 03 | Functions | `docs/04-python-fundamentals/03-functions.md` | `function-call` ✅ (call with typed total / forgot return → None → TypeError) | `labs/04-python-fundamentals/03-functions/` ✅ (8/8 checks, 7 tasks; 5 examples, 3 mistakes, exercise crashes with real TypeError) | `m04-03` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 02 | Control flow | `docs/04-python-fundamentals/02-control-flow.md` | `control-flow` ✅ (if/else with typed cart total; for-loop running total) | `labs/04-python-fundamentals/02-control-flow/` ✅ (7/7 checks, 6 tasks; `mistakes/` with 3 real syntax errors) | `m04-02` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 01 | Variables and types | `docs/04-python-fundamentals/01-variables-and-types.md` | `name-tags` ✅ (plan: "how variables point to objects"; rebind / types) | `labs/04-python-fundamentals/01-variables-and-types/` ✅ (8/8 checks, 6 tasks; lab folder mounted at /lab; exercise + solution) | `m04-01` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |

### Module 5 — lesson detail

| # | Lesson | File | Diagram | Lab | Quiz | DoD |
| --- | --- | --- | --- | --- | --- | --- |
| 08 | asyncio, and 100 supplier APIs | `docs/05-advanced-python/08-asyncio-and-100-supplier-apis.md` | `event-loop` ✅ (plan: event loop juggling tasks; await / block) | `labs/05-advanced-python/08-asyncio-and-100-supplier-apis/` ✅ (6/6 checks, 5 tasks; **plan's lab**: `suppliers` server (stdlib, 0.1 s per request) + client image with httpx; compare.py one by one / threads / asyncio) | `m05-08` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 07 | Threads and processes | `docs/05-advanced-python/07-threads-and-processes.md` | `concurrency-timeline` ✅ (waiting / computing) | `labs/05-advanced-python/07-threads-and-processes/` ✅ (6/6 checks, 5 tasks; timing checks use ranges; exercise = threads not joined) | `m05-07` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 06 | Virtual environments and packaging | `docs/05-advanced-python/06-venv-and-packaging.md` | `venv-packaging` ✅ (two venvs / installing Bazaar) | `labs/05-advanced-python/06-venv-and-packaging/` ✅ (12/12 checks, 7 tasks; own image with uv 0.13.6; needs internet; `bazaar_pkg/` with pyproject + `bazaar` entry point; exercise = entry point names a missing function) | `m05-06` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 05 | Generators and context managers | `docs/05-advanced-python/05-generators-and-context-managers.md` | `generator-flow` ✅ (list vs generator, memory box) | `labs/05-advanced-python/05-generators-and-context-managers/` ✅ (9/9 checks, 8 tasks; 200,000-line seeded log in `data/`; pipeline + average checked against independent awk) | `m05-05` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 04 | Decorators | `docs/05-advanced-python/04-decorators.md` | `decorator-wrap` ✅ (plan: decorator wrapping; @timed / @retry) | `labs/05-advanced-python/04-decorators/` ✅ (9/9 checks, 7 tasks; exercise = wrapper without return → None) | `m05-04` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 03 | Dataclasses and type hints | `docs/05-advanced-python/03-dataclasses-and-type-hints.md` | `dataclass-hints` ✅ (what @dataclass writes / mypy vs Python) | `labs/05-advanced-python/03-dataclasses-and-type-hints/` ✅ (10/10 checks, 7 tasks; own image with mypy 2.4.1; exercise = list default refused) | `m05-03` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 02 | Inheritance and special methods | `docs/05-advanced-python/02-inheritance-and-special-methods.md` | `method-lookup` ✅ (pick object + method; override vs inherited) | `labs/05-advanced-python/02-inheritance-and-special-methods/` ✅ (8/8 checks, 5 tasks; exercise = GiftCard without super().__init__) | `m05-02` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |
| 01 | Classes and objects | `docs/05-advanced-python/01-classes-and-objects.md` | `class-objects` ✅ (blueprint / shared class list) | `labs/05-advanced-python/01-classes-and-objects/` ✅ (7/7 checks, 6 tasks; exercise = `lines = []` on the class) | `m05-01` ✅ (6 core + 2 deeper) | ✅ Two-layer v1 |

---

## Registries

### Diagrams

| Name | File | Used in | Interactive input | Status |
| --- | --- | --- | --- | --- |
| request-journey | `docs/assets/diagrams/request-journey.js` | m00-01 | Select: search vs order | ✅ |
| course-roadmap | `docs/assets/diagrams/course-roadmap.js` | m00-02 | Click / Enter on any level to jump | ✅ |
| path-lookup | `docs/assets/diagrams/path-lookup.js` | m00-03 | Select: installed / old Mac Python / nothing | ✅ |
| docker-run | `docs/assets/diagrams/docker-run.js` | m00-04 | Select: first run (pull) / second run (cached) / Docker not running | ✅ |
| memory-race | `docs/assets/diagrams/memory-race.js` | m01-01 | Select: real time / human time (1 ns = 1 s) | ✅ |
| processes-threads | `docs/assets/diagrams/processes-threads.js` | m01-02 | Select: sharing memory / something goes wrong | ✅ |
| stack-heap | `docs/assets/diagrams/stack-heap.js` | m01-03 | Select: normal checkout / memory leak / recursion too deep | ✅ |
| file-system | `docs/assets/diagrams/file-system.js` | m01-04 | Select: find by path / delete while open / safe save | ✅ |
| server-request | `docs/assets/diagrams/server-request.js` | m01-05 | Select: nothing / CPU / RAM / disk / file descriptors runs out | ✅ |
| shell-steps | `docs/assets/diagrams/shell-steps.js` | m02-01 | Select: 4 command lines (quoted / unquoted / glob / cd && deploy) | ✅ |
| file-tree | `docs/assets/diagrams/file-tree.js` | m02-02 | Select: cd around / tour; click any folder | ✅ |
| ssh-keys | `docs/assets/diagrams/ssh-keys.js` | m02-06 | Select: key login / first connection (known_hosts) | ✅ |
| systemd-lifecycle | `docs/assets/diagrams/systemd-lifecycle.js` | m02-07 | Select: start + crash/restart / enable + reboot / stop | ✅ |
| event-loop | `docs/assets/diagrams/event-loop.js` | m05-08 | Select await / block; loop + 3 tasks with clock | ✅ |
| concurrency-timeline | `docs/assets/diagrams/concurrency-timeline.js` | m05-07 | Select wait / cpu; time-bar boxes | ✅ |
| venv-packaging | `docs/assets/diagrams/venv-packaging.js` | m05-06 | Select venv / package | ✅ |
| generator-flow | `docs/assets/diagrams/generator-flow.js` | m05-05 | Select list / gen; orders are the first 5 PAID lines of the lab's real log | ✅ |
| decorator-wrap | `docs/assets/diagrams/decorator-wrap.js` | m05-04 | Select @timed / @retry(times=3); caller → wrapper (before) → original → wrapper (after) → caller | ✅ |
| dataclass-hints | `docs/assets/diagrams/dataclass-hints.js` | m05-03 | Select dataclass / hints | ✅ |
| method-lookup | `docs/assets/diagrams/method-lookup.js` | m05-02 | Two selects: object (card/masala) × method (needs_delivery/price_text/describe) | ✅ |
| class-objects | `docs/assets/diagrams/class-objects.js` | m05-01 | Select blueprint / shared | ✅ |
| imports | `docs/assets/diagrams/imports.js` | m04-08 | Select run main.py / run money.py; shows `__name__` per module | ✅ |
| file-json | `docs/assets/diagrams/file-json.js` | m04-07 | Select save / nosave; memory vs disk zones | ✅ |
| try-except | `docs/assets/diagrams/try-except.js` | m04-06 | Select try / crash; text input "Customer typed:" (max 20 chars, escaped) | ✅ |
| comprehension | `docs/assets/diagrams/comprehension.js` | m04-05 | Select filter / dict; number input "Under ₹" (filter only) | ✅ |
| function-call | `docs/assets/diagrams/function-call.js` | m04-03 | Select call / noreturn; number input (call mode only); phone arrows use the left gutter | ✅ |
| control-flow | `docs/assets/diagrams/control-flow.js` | m04-02 | Select decision / loop; number input "Cart total ₹" (hidden in loop mode) | ✅ |
| name-tags | `docs/assets/diagrams/name-tags.js` | m04-01, m04-04 (`list`) | Select: rebind / types / list (steps can relabel objects: `labels`, `changed`); one Python line per step, name→object arrows | ✅ |
| github-flow | `docs/assets/diagrams/github-flow.js` | m03-05 | Select: PR start to finish / rejected push | ✅ |
| git-three-places | `docs/assets/diagrams/git-three-places.js` | m03-01 | Select: save (add + commit) / undo (restore) | ✅ |
| commit-graph | `docs/assets/diagrams/commit-graph.js` | m03-02 (+ later m03-03/04) | Select story / own; text input `$ git …` + Run/Clear; mini Git simulator (commit, branch, -d, switch/checkout, merge ff + merge commit), max 8 commits, 3 lanes; errors via `textContent` (no HTML from user input) | ✅ |
| env-inherit | `docs/assets/diagrams/env-inherit.js` | m02-05 | Select: plain variable / export / one command | ✅ |
| pipe-flow | `docs/assets/diagrams/pipe-flow.js` | m02-04 | Select: pipeline (5 stages with real data) / redirection (> 2> 2>&1) | ✅ |
| permission-check | `docs/assets/diagrams/permission-check.js` | m02-03 | Two selects: who (asha/ravi/www-data/root) × what (.env / bazaar.conf / uploads) | ✅ |

### Quizzes

| Id | File | Questions | Status |
| --- | --- | --- | --- |
| m00-01 | `docs/assets/quizzes/m00-01.json` | 8 | ✅ |
| m00-02 | `docs/assets/quizzes/m00-02.json` | 8 | ✅ |
| m00-03 | `docs/assets/quizzes/m00-03.json` | 8 | ✅ |
| m00-04 | `docs/assets/quizzes/m00-04.json` | 8 | ✅ |
| m01-01 | `docs/assets/quizzes/m01-01.json` | 8 | ✅ |
| m01-02 | `docs/assets/quizzes/m01-02.json` | 8 | ✅ |
| m01-03 | `docs/assets/quizzes/m01-03.json` | 8 | ✅ |
| m01-04 | `docs/assets/quizzes/m01-04.json` | 8 | ✅ |
| m01-05 | `docs/assets/quizzes/m01-05.json` | 8 | ✅ |
| m02-01 | `docs/assets/quizzes/m02-01.json` | 8 | ✅ |
| m02-02 | `docs/assets/quizzes/m02-02.json` | 8 | ✅ |
| m02-03 | `docs/assets/quizzes/m02-03.json` | 8 | ✅ |
| m02-04 | `docs/assets/quizzes/m02-04.json` | 8 | ✅ |
| m02-05 | `docs/assets/quizzes/m02-05.json` | 8 | ✅ |
| m02-06 | `docs/assets/quizzes/m02-06.json` | 8 | ✅ |
| m02-07 | `docs/assets/quizzes/m02-07.json` | 8 | ✅ |
| m03-01 | `docs/assets/quizzes/m03-01.json` | 8 | ✅ |
| m03-02 | `docs/assets/quizzes/m03-02.json` | 8 | ✅ |
| m03-03 | `docs/assets/quizzes/m03-03.json` | 8 | ✅ |
| m03-04 | `docs/assets/quizzes/m03-04.json` | 8 | ✅ |
| m03-05 | `docs/assets/quizzes/m03-05.json` | 8 | ✅ |
| m04-01 | `docs/assets/quizzes/m04-01.json` | 8 | ✅ |
| m04-02 | `docs/assets/quizzes/m04-02.json` | 8 | ✅ |
| m04-03 | `docs/assets/quizzes/m04-03.json` | 8 | ✅ |
| m04-04 | `docs/assets/quizzes/m04-04.json` | 8 | ✅ |
| m04-05 | `docs/assets/quizzes/m04-05.json` | 8 | ✅ |
| m04-06 | `docs/assets/quizzes/m04-06.json` | 8 | ✅ |
| m04-07 | `docs/assets/quizzes/m04-07.json` | 8 | ✅ |
| m04-08 | `docs/assets/quizzes/m04-08.json` | 8 | ✅ |
| m05-01 | `docs/assets/quizzes/m05-01.json` | 8 | ✅ |
| m05-02 | `docs/assets/quizzes/m05-02.json` | 8 | ✅ |
| m05-03 | `docs/assets/quizzes/m05-03.json` | 8 | ✅ |
| m05-04 | `docs/assets/quizzes/m05-04.json` | 8 | ✅ |
| m05-05 | `docs/assets/quizzes/m05-05.json` | 8 | ✅ |
| m05-06 | `docs/assets/quizzes/m05-06.json` | 8 | ✅ |
| m05-07 | `docs/assets/quizzes/m05-07.json` | 8 | ✅ |
| m05-08 | `docs/assets/quizzes/m05-08.json` | 8 | ✅ |

### Labs + host port map

| Lab | Compose project | Host ports | Test | Status |
| --- | --- | --- | --- | --- |
| `labs/00-setup/01-what-a-backend-developer-does` | `bz-m00-01` | `${BAZAAR_PORT:-8000}` | `test_lab.sh` 6/6 | ✅ |
| `labs/00-setup/02-the-full-roadmap` | `bz-m00-02` | `${BAZAAR_PORT:-8000}` (+ `users` service, profile `crowd`) | `test_lab.sh` 3/3 | ✅ |
| `labs/00-setup/03-installing-python-and-vscode` | `bz-m00-03` | none (only `run` commands) | `test_lab.sh` 7/7 | ✅ |
| `labs/00-setup/04-installing-git-and-docker` | `bz-m00-04` (+ `bz-verify` inside `verify_setup.sh`, container `bz-m00-04-demo`) | none | `test_lab.sh` 5/5 | ✅ |
| `labs/01-how-computers-work/01-cpu-ram-and-disk` | `bz-m01-01` | none (inventory on internal port 9000) | `test_lab.sh` 7/7 (incl. locality) | ✅ |
| `labs/01-how-computers-work/02-processes-and-threads` | `bz-m01-02` | `${BAZAAR_PORT:-8000}` | `test_lab.sh` 11/11 (builds `bazaar-lab-procs:m01-02`) | ✅ |
| `labs/01-how-computers-work/03-stack-and-heap` | `bz-m01-03` | none | `test_lab.sh` 8/8 (incl. OOM kill at `mem_limit: 64m`) | ✅ |
| `labs/01-how-computers-work/04-file-systems` | `bz-m01-04` | none (volume `bazaar-data`, tmpfs `/thumbs` 10 MB / 1000 inodes) | `test_lab.sh` 7/7 | ✅ |
| `labs/01-how-computers-work/05-what-a-server-is` | `bz-m01-05` | `${BAZAAR_PORT:-8000}` | `test_lab.sh` 5/5 (tools service `ulimits: nofile: 50`) | ✅ |
| `labs/02-linux-command-line/01-the-shell` | `bz-m02-01` | none (`run --rm shell`, fresh `/srv/bazaar` each session) | `test_lab.sh` 8/8 | ✅ |
| `labs/02-linux-command-line/02-working-with-files` | `bz-m02-02` | none (builds `bazaar-lab-files:m02-02`: less, nano, vim-tiny, tree, procps) | `test_lab.sh` 10/10 | ✅ |
| `labs/05-advanced-python/08-asyncio-and-100-supplier-apis` | `bz-m05-08` | none (services `suppliers` (official Python image) + `python` (builds `bazaar-lab-python-httpx:m05-08`); internal port 8080 only) | `test_lab.sh` 6/6 | ✅ |
| `labs/05-advanced-python/07-threads-and-processes` | `bz-m05-07` | none (official Python image, `./:/lab`) | `test_lab.sh` 6/6 | ✅ |
| `labs/05-advanced-python/06-venv-and-packaging` | `bz-m05-06` | none (builds `bazaar-lab-python-uv:m05-06`; **needs internet** for PyPI; test venvs in /tmp) | `test_lab.sh` 12/12 | ✅ |
| `labs/05-advanced-python/05-generators-and-context-managers` | `bz-m05-05` | none (official Python image, `./:/lab`; writes `data/orders.log`) | `test_lab.sh` 9/9 | ✅ |
| `labs/05-advanced-python/04-decorators` | `bz-m05-04` | none (official Python image, `./:/lab`) | `test_lab.sh` 9/9 | ✅ |
| `labs/05-advanced-python/03-dataclasses-and-type-hints` | `bz-m05-03` | none (builds `bazaar-lab-python-mypy:m05-03`: python:3.13.18-slim-trixie + mypy==2.4.1) | `test_lab.sh` 10/10 | ✅ |
| `labs/05-advanced-python/02-inheritance-and-special-methods` | `bz-m05-02` | none (official Python image, `./:/lab`) | `test_lab.sh` 8/8 | ✅ |
| `labs/05-advanced-python/01-classes-and-objects` | `bz-m05-01` | none (official Python image, `./:/lab`) | `test_lab.sh` 7/7 | ✅ |
| `labs/04-python-fundamentals/08-modules-and-bazaar-v0` | `bz-m04-08` | none (official Python image, `./:/lab`; `BAZAAR_DATA` env var for the test) | `test_lab.sh` 14/14 | ✅ |
| `labs/04-python-fundamentals/07-files-and-json` | `bz-m04-07` | none (official Python image, `./:/lab`; writes `data/`) | `test_lab.sh` 11/11 | ✅ |
| `labs/04-python-fundamentals/06-errors-and-exceptions` | `bz-m04-06` | none (official Python image, `./:/lab`) | `test_lab.sh` 9/9 | ✅ |
| `labs/04-python-fundamentals/05-comprehensions` | `bz-m04-05` | none (official Python image, `./:/lab`) | `test_lab.sh` 9/9 | ✅ |
| `labs/04-python-fundamentals/04-lists-dicts-sets` | `bz-m04-04` | none (official Python image, `./:/lab`) | `test_lab.sh` 8/8 | ✅ |
| `labs/04-python-fundamentals/03-functions` | `bz-m04-03` | none (official Python image, `./:/lab`) | `test_lab.sh` 8/8 | ✅ |
| `labs/04-python-fundamentals/02-control-flow` | `bz-m04-02` | none (official Python image, `./:/lab`) | `test_lab.sh` 7/7 | ✅ |
| `labs/04-python-fundamentals/01-variables-and-types` | `bz-m04-01` | none (official `python:3.13.18-slim-trixie`, `./:/lab`) | `test_lab.sh` 8/8 | ✅ |
| `labs/03-git-and-github/05-github-and-pull-requests` | `bz-m03-05` | none (image `bazaar-lab-git:m03-05`, no internet) | `test_lab.sh` 9/9 | ✅ |
| `labs/03-git-and-github/04-rebase` | `bz-m03-04` | none (image `bazaar-lab-git:m03-04`, git user Rohan, `core.editor nano`) | `test_lab.sh` 9/9 | ✅ |
| `labs/03-git-and-github/03-merging-and-conflicts` | `bz-m03-03` | none (image `bazaar-lab-git:m03-03`) | `test_lab.sh` 10/10 | ✅ |
| `labs/03-git-and-github/02-branches` | `bz-m03-02` | none (image `bazaar-lab-git:m03-02`, repo built by `setup_repo.sh` at build time) | `test_lab.sh` 8/8 | ✅ |
| `labs/03-git-and-github/01-commits-and-history` | `bz-m03-01` | none (image `bazaar-lab-git:m03-01`, git 2.47.3 from Debian trixie) | `test_lab.sh` 8/8 | ✅ |
| `labs/02-linux-command-line/07-systemd-and-logs` | `bz-m02-07` | `BAZAAR_PORT` (default 8000) | `test_lab.sh` 7/7 (privileged, `cgroup: host`, image `bazaar-lab-systemd:m02-07`) | ✅ |
| `labs/02-linux-command-line/06-ssh` | `bz-m02-06` | none (two images: `bazaar-lab-sshd:m02-06`, `bazaar-lab-sshclient:m02-06`) | `test_lab.sh` 8/8 | ✅ |
| `labs/02-linux-command-line/05-env-packages-jobs` | `bz-m02-05` | none (`shell` + `app` with `environment:`/`env_file:`) | `test_lab.sh` 7/7 (apt needs internet) | ✅ |
| `labs/02-linux-command-line/04-pipes-and-redirection` | `bz-m02-04` | none (access.log generated with seed 2026) | `test_lab.sh` 8/8 | ✅ |
| `labs/02-linux-command-line/03-users-and-permissions` | `bz-m02-03` | none (builds `bazaar-lab-perms:m02-03`: users asha/ravi, group bazaar, sudo) | `test_lab.sh` 10/10 | ✅ |

Port rule: har lab ka host port env var se aata hai (`"${BAZAAR_PORT:-8000}:8000"`; aage `POSTGRES_PORT`, `REDIS_PORT` isi pattern par). Student ke liye default 8000 rehta hai. `test_lab.sh` khud ek free port chunta hai, isliye test kabhi kisi chalti cheez (jaise `mkdocs serve`) se nahi takrata.

---

## Pinned versions

| Tool | Version | Where | Since |
| --- | --- | --- | --- |
| Python (labs) | `python:3.13.18-slim-trixie` | lab images | 2026-11-21 |
| Python (site tooling) | 3.13 | `.venv`, CI | 2026-11-21 |
| less, nano, vim-tiny, tree, procps (lab 02-02 image) | Debian trixie packages, unpinned | `labs/02-linux-command-line/02-working-with-files/Dockerfile` | 2026-11-21 |
| systemd, systemd-sysv, procps, less (lab 02-07 image) | Debian trixie packages, unpinned | `labs/02-linux-command-line/07-systemd-and-logs/Dockerfile` | 2026-11-21 |
| git, nano, less (lab 03-01 image) | Debian trixie packages, unpinned (git 2.47.3 at build time) | `labs/03-git-and-github/01-commits-and-history/Dockerfile` | 2026-11-21 |
| procps (lab 01-02 image) | Debian trixie package, unpinned (`apt-get install procps`) | `labs/01-how-computers-work/02-processes-and-threads/Dockerfile` | 2026-11-21 |
| Python 3.12 (lab 00-03 only, "old Python" demo) | `python:3.12.16-slim-trixie` | lab 00-03 | 2026-11-21 |
| mkdocs | 1.6.1 | `requirements-docs.txt` | 2026-11-21 |
| ~~mkdocs-material~~ | hata diya (own theme) | — | 2026-11-21 |
| pymdown-extensions | 10.21.3 | `requirements-docs.txt` | 2026-11-21 |
| Pygments | 2.21.0 | `requirements-docs.txt` | 2026-11-21 |
| Google Fonts | Plus Jakarta Sans, JetBrains Mono | `theme/main.html` | 2026-11-21 |
| Django | 5.2 LTS (exact patch pin when Module 8 starts) | — | — |
| PostgreSQL | 17 (exact tag pin when first used) | — | — |
| Redis | 7 (exact tag pin when first used) | — | — |
| Playwright (dev only) | 1.65.2 | `requirements-dev.txt` | 2026-11-21 |
| httpx + deps (lab 05-08 image) | httpx 0.28.1, anyio 4.16.0, httpcore 1.0.9, h11 0.16.0, certifi 2026.10.23, idna 3.20, typing_extensions 4.16.0 | `labs/05-advanced-python/08-asyncio-and-100-supplier-apis/requirements.txt` | 2026-11-23 |
| uv (lab 05-06 image) | 0.13.6 (released 2026-10-27) | `labs/05-advanced-python/06-venv-and-packaging/Dockerfile` | 2026-11-22 |
| requests + deps (lab 05-06) | requests 2.34.2 / 2.33.1, certifi 2026.10.23, charset-normalizer 3.5.2, idna 3.20, urllib3 2.8.0 | `project-a/`, `project-b/requirements.txt` | 2026-11-22 |
| setuptools (build backend, lab 05-06) | 84.2.1 (released 2026-10-20) | `bazaar_pkg/pyproject.toml` | 2026-11-22 |
| mypy (lab 05-03 image) | 2.4.1 (released 2026-10-28; transitive deps unpinned) | `labs/05-advanced-python/03-dataclasses-and-type-hints/Dockerfile` | 2026-11-22 |
| GitHub Actions | checkout@v4, setup-python@v5, upload-pages-artifact@v3, deploy-pages@v4 | workflows | 2026-11-21 |

---

## Decisions log

| Date | Decision | Why |
| --- | --- | --- |
| 2026-11-23 | GitHub repo `abdullafajal/backend_mastery`, site on GitHub Pages at `https://abdullafajal.github.io/backend_mastery/` (`site_url` set; CLAUDE.md §10 preview path updated); deploy via the existing `deploy.yml` (Pages source: GitHub Actions). `.gitignore` expanded; `.env` ignored only at the repo root | Owner ne repo diya (Open question 3 / (a)). Labs ki teaching `.env` / seed `.log` files commit hone chahiye, isliye global `.env`/`*.log` ignore nahi kiya |
| 2026-11-21 | **Two-layer standard** replaces the Depth standard: easy core ("In 1 minute" box, ≤~5 new terms, only what the lab needs) + optional "Going deeper" boxes; quizzes core-first, ≤2–3 deeper questions marked "(Going deeper)" | Owner: content too advanced, too many new words at once; chose "do layer" fix. Depth is moved, not deleted |
| 2026-11-22 | CLAUDE.md §2 canon: digital product `Bazaar Gift Card` (₹500, seller Bazaar, no stock limit, no delivery) | Inheritance needs a product that is "a product, but different"; no canonical product fit |
| 2026-11-22 | Bazaar v0 lives inside lab 04-08 (`bazaar_v0/`), not in a separate `bazaar-app` repo yet | Owner hasn't decided the `bazaar-app` location (Open question b); the lab is self-contained and tested, and can be copied into `bazaar-app` as `m04-end` later |
| 2026-11-22 | Code font ligatures OFF site-wide (`code, pre, kbd, samp, .term__body, .bz-diagram__note, .bz-svg text`) | JetBrains Mono drew `>=` as `≥` and `!=` as `≠`: beginners would type symbols Python rejects. Seen in a mobile screenshot of m04-03 |
| 2026-11-22 | Module 4 labs mount the lab folder (`./:/lab`): students edit in VS Code, run in the container; each lab has `examples/`, `exercises/` (with a visible bug or TODO) and `solutions/`; `test_lab.sh` checks examples + solutions, not the student's own edits | Python module: real editing workflow; published code = tested code |
| 2026-11-22 | Tests drop Docker Compose's own stderr and join the program's stderr inside the container (CLAUDE.md §7) | Lab 04-01 test was flaky: "Network … Creating" lines landed in compared output on the first run |
| 2026-11-23 | `site_url` = https://backend.espere.in/ (owner's custom domain); local preview now at `/` | Pages redirects the github.io URL to the custom domain; canonical links and sitemap must use it |
| 2026-11-22 | Lab 03-05 simulates GitHub with a local bare repo and shows its real path; no `insteadOf` URL trick | With `insteadOf`, `git remote -v` and push output still print the local path, so faking `https://github.com/...` would show outputs that don't match; honest path + a note about the real address is clearer |
| 2026-11-21 | diagram-kit: `data-state-<key>` on the embed sets the starting state (CLAUDE.md §5 updated) | One diagram (`commit-graph`) serves Lessons 2–4 with a different default story; no copies of diagram code |
| 2026-11-21 | Merge commits in labs use `-m "Merge …: why"` instead of `--no-edit` after a conflict | `git commit --no-edit` keeps the `# Conflicts:` comment lines in the message (seen in a real run) |
| 2026-11-21 | CLAUDE.md §2 canon: developers `Neha Kapoor` and `Rohan Mehta` (`@bazaar.example`) added | Git lessons need commit authors; Asha etc. are customers, so a developer named Asha would contradict the canon |
| 2026-11-21 | Lab 02-07 runs real systemd as PID 1 in a `privileged: true`, `cgroup: host` container (tmpfs /run, getty + modules-load masked, `STOPSIGNAL SIGRTMIN+3`); README + lesson warn it's lab-only | systemd ko sach me chalte dekhna zaruri tha (crash → restart, enable → reboot); fake simulation se student ko asli output nahi milta |
| 2026-11-21 | `CLAUDE.md` is in English; site content in simple English; PROGRESS.md Hinglish me | Claude ke rules saaf rahein; owner ke liye log padhna aasaan |
| 2026-11-21 | Project ka apna git repo `backend_path/` me init kiya (`main` branch) | `/Users/aqib` home folder khud ek git repo hai; course ka kaam usme mix nahi hona chahiye |
| 2026-11-21 | Diagrams lazy-load hote hain: `<div class="bz-diagram" data-diagram="x">` → `assets/diagrams/x.js` | Naya diagram add karne par `mkdocs.yml` nahi chhedna padta; har page par sirf zaroori JS load hota hai |
| 2026-11-21 | Diagram steps cumulative replay se chalte hain (redraw + steps 0..i-1 instantly + step i animate) | Back / resize / input change hamesha sahi state dikhate hain; diagram likhna simple |
| 2026-11-21 | Diagram controls me **Back** button bhi add kiya (plan me Play/Pause/Next/Reset tha) | Student ek step peeche jaakar dobara padh sake |
| 2026-11-21 | Phones par diagrams `s.narrow` se vertical layout lete hain (< 560px) | 840px wide SVG phone par chhota hokar padhne layak nahi rehta |
| 2026-11-21 | CSS tokens `[data-md-color-scheme]` par, `:root` par nahi | `:root` par dark mode toot raha tha (screenshot se pakda) |
| 2026-11-21 | Quiz data alag JSON files me (`assets/quizzes/<id>.json`) | Lesson Markdown saaf rahe; quiz data reusable |
| 2026-11-21 | Lesson code `pymdownx.snippets` se lab ki `examples/` file se include hota hai | Published code = tested code; copy-paste drift nahi |
| 2026-11-21 | Module 0 ka pehla lab: stdlib-only Python HTTP server (no Django yet) | Student ko pehle din hi "backend answer karta hai" dikhe, bina koi framework seekhe |
| 2026-11-21 | Money abhi whole rupees (int) me; Module 9+ me `Decimal`/paise | Beginner ke liye simple; float kabhi nahi |
| 2026-11-21 | Phases 1–5 ka scope maine assume kiya (dekho Phase tracker) | Plan export me roadmap embed missing tha |
| 2026-11-21 | Lab host ports env var se (`BAZAAR_PORT`), `test_lab.sh` free port chunta hai | `mkdocs serve` port 8000 par chal raha tha aur lab test galti se usse baat kar raha tha (session 2 me pakda) |
| 2026-11-21 | Bazaar users per level (assumed): L1 1 · L2 100 · L3 10,000 · L4 1 lakh · L5 10 lakh+ · L6 1 crore | Plan me "1 se 1 crore" likha tha par per-level growth story embed missing thi. ⚠️ Owner confirm kare |
| 2026-11-21 | Module 2 labs: ek "Bazaar server" container (hostname `bazaar-server`, `/srv/bazaar`), har session/`up` fresh seed | Student bina darr ke `rm`/`mv` aazma sake; `docker compose down` = reset |
| 2026-11-21 | CLAUDE.md rule: "a check must be able to fail" — zaroori checks ko jaan-boojhkar galat code par chalakar FAIL hote dekhna | backup_config.sh ka pehla check hamesha sach tha; mutation se pakda |
| 2026-11-21 | Crash-test wale lab containers me `init: true` zaroori | Lab 01-04 me Python PID 1 tha; kernel ne usi namespace se bheja SIGKILL ignore kiya → "safe save" galat wajah se pass ho raha tha. Lesson me "real surprise" box ke roop me |
| 2026-11-21 | Module 2 ko 7 lessons me baanta (shell, files, permissions, pipes+playground, env/packages/jobs, SSH, systemd+logs) | Plan ke topic list ko depth standard ke saath 25–40 min ke lessons me fit karne ke liye |
| 2026-11-21 | Lab 01-03 me OOM demo: `mem_limit: 64m` + `memswap_limit: 64m` (bina swap ke) | Exit 137 + `OOMKilled true` aankhon se dikhe; swap allowed hota to container dheema hota par marta nahi |
| 2026-11-21 | `leak.py` me `tracemalloc` sirf `find` mode me | tracemalloc khud RAM khata hai (84 → 172 MB); RSS ke numbers saaf rakhne ke liye |
| 2026-11-21 | Lesson me "Python freed memory OS ko wapas nahi deta" wali aam baat NAHI likhi | Naapa: 500k-entry dict clear karne par RSS 137 → 12 MB. Sirf "kuch memory reuse ke liye rakh sakta hai" likha |
| 2026-11-21 | **Material theme hata kar apna design** (`theme/`); MkDocs sirf Markdown engine | Owner: "custom web par banao instead of docs, UI behtar banao". Content (Markdown, snippets, strict build, link checks) waisa hi raha; sirf HTML/CSS/JS humara |
| 2026-11-21 | Design: warm paper background + saffron brand (#e8701a), Plus Jakarta Sans, light/dark toggle (localStorage `bz-theme`) | "Bazaar" marketplace ka mood; docs-site jaisa nahi, course platform jaisa |
| 2026-11-21 | Search: MkDocs search plugin sirf index banata hai (`search_index_only: true`), UI humara (`site.js`) | Plugin ki apni `main.js` `base_url is not defined` error de rahi thi |
| 2026-11-21 | Lesson meta (`<div class="bz-meta">`) Markdown me same; `site.js` use card grid banata hai | Saare lessons ka Markdown badalna nahi pada |
| 2026-11-21 | **Depth standard** (CLAUDE.md §4a): har lesson akela kaafi ho; 25–40 min OK; "Questions you may have", "Going deeper" boxes, har output column explain, cheat sheet (Linux/Mac/Windows). Quiz 5–10 sawaal | Owner feedback: "content me explanation ki kami... main nahi chahta user kahin aur jaakar phir se padhe" |
| 2026-11-21 | "Docker stop grace period" ko fixed 10 s nahi likha | Is machine (Docker 29) par `StopTimeout=1` mila (busybox par bhi), yaani ye Docker ki setting hai, image ki nahi. Lesson me "version/settings par depend karta hai; `stop_grace_period`" likha |
| 2026-11-21 | Lab 01-02 ke liye pehli custom `Dockerfile` (python:3.13.18-slim-trixie + procps) | Slim image me `ps`/`top`/`free` nahi hote, aur plan ka Module 1 lab inhi par hai. `procps` apt version pin nahi kiya (Debian stable me sirf security updates aate hain); base image exact pinned hai |
| 2026-11-21 | Worker processes `subprocess.Popen(["python3", "<file>"])` se, `multiprocessing` se nahi | `ps` me har process ka apna naam (`email_worker.py`, `image_cache.py`) dikhe; fork ke saath sab "bazaar_shop.py" dikhte |
| 2026-11-21 | `init: true` (docker-init PID 1) compose me | Mare hue child processes zombie na banein; `ps` me PID 1 ko samjhana bhi lesson ka hissa |
| 2026-11-21 | Diagram ke timing numbers "typical, rounded" (1 ns / 100 ns / 0.1 ms / 0.5 ms / 200 ms) aur lab me student ke apne measured numbers | Hardware ke saath asli numbers badalte hain; gaps samjhana asli maqsad hai |
| 2026-11-21 | Lab servers (http.server, HTTP/1.1 keep-alive) me `disable_nagle_algorithm = True` | Iske bina har request par ~43 ms ka stall aata tha (Nagle + delayed ACK). Student galat seekhta ki local network 43 ms leta hai. **Note:** ye Module 7 (TCP) / Module 17 (performance) me ek achha "real gotcha" example banega |
| 2026-11-21 | Kit: `s.arrow(..., {dir: "h" | "v"})` | Ek box se kai boxes tak arrows mobile par doosre boxes ke beech se guzar rahe the |
| 2026-11-21 | `verify_setup.sh` bash me (Mac, Linux, Windows Git Bash); Python/Git/Docker/Engine/Compose/container = ✗ (fail), Git identity aur `code` command = ! (sirf tip) | Ek hi script teeno OS par; CI machine par Git identity/VS Code nahi hote |
| 2026-11-21 | Linux Docker install ke liye official docs ka link, `get.docker.com` command nahi | Script ko container me verify karne ki permission nahi mili; jo verify nahi hua wo command lesson me nahi daalna |
| 2026-11-21 | Kit: box ka label sub-text ke hisaab se khud upar/neeche hota hai (`setBoxSub`) | Khaali sub ke saath bane box par baad me sub set karne se text overlap ho raha tha (screenshot se pakda) |
| 2026-11-21 | Lesson m00-03 ka focus PATH par (diagram + lab) | Install ke time "command not found" aur galat version sabse common problem hai; PATH samajh gaye to dono khud fix kar lenge |
| 2026-11-21 | Mac: python.org installer recommend; Windows: python.org + "Add python.exe to PATH" + `py` launcher; Linux: Ubuntu deadsnakes / Fedora dnf, aur `python3.13` command | Beginner ke liye sabse kam steps; Linux system Python ko chhedna nahi |
| 2026-11-21 | `test_all_labs.sh` har lab ko `</dev/null` ke saath chalata hai, aur check karta hai ki jitne labs mile utne chale | Lab 2 ka `docker compose run` runner ka stdin kha gaya tha, aur lab 3 chupchap skip ho gaya tha |
| 2026-11-21 | Lesson m00-02 ka lab: one-worker backend + 100-user crowd (2.3 s wait), phir `ThreadingHTTPServer` (~60 ms) | Roadmap lesson ko hands-on banana; "har level ek real problem solve karta hai" khud mehsoos ho |

---

## Open questions (owner se poochna)

**2026-11-22 owner ko list di (Session 24) — jawab ka intezaar:** (a) pehla git commit + GitHub repo naam / `site_url` (repo me abhi ek bhi commit nahi!); (b) `bazaar-app` alag repo (rec.) — Module 4 se relevant; (c) theme/ design feedback; (d) build-roadmap 5 phases + per-level user counts; (e) Module 0 install steps asli Mac/Windows par check; (e2) Linux Docker Engine install; (f) Neha Kapoor / Rohan Mehta characters OK?


1. ⚠️ **Build roadmap ke 5 phases** ka asli content kya tha? (Embedded content export me nahi aaya.) Phase tracker abhi assumed hai.
2. ⚠️ **`bazaar-app/` kahan rahe?** Option A: isi repo me sub-folder (simple, par `mNN-start/end` git tags poore course repo par lagenge). Option B: alag GitHub repo `bazaar-app` (tags saaf, student fork kar sake). Recommendation: **B**.
3. ~~GitHub repo ka naam / Pages URL (`site_url` ke liye).~~ ✅ 2026-11-23: `abdullafajal/backend_mastery` → `https://abdullafajal.github.io/backend_mastery/`
4. Plan me Bazaar growth story ka embed (6 levels, har level ki agli problem) bhi missing tha. Abhi home page par maine plan ke text se ek table banaya hai; asli user counts per level confirm karne hain.

---

## Session log

### 2026-11-23 — Session 39: Module 5, Lesson 8 "asyncio, and 100 supplier APIs" (Module 5 complete) + GitHub deploy

**Kiya:** lesson (core: async def/await/event loop/gather with `asyncio_basics` (asks first, replies by speed, 0.3 s), threads vs asyncio table, the plan's lab: same 100 calls with httpx three ways (10.6 s / 0.3 s / 0.2 s, ₹25,050 each), one-waiter analogy; code example = time.sleep inside async → 1.0 s → `await asyncio.sleep` 0.1 s; under the hood: no await (RuntimeWarning + coroutine object), await outside function; deeper: tasks/timeouts/Semaphore/return_exceptions/limits, epoll + generators, async DB drivers/ASGI/to_thread). Plan diagram `event-loop.js`. Lab: `suppliers` stdlib server (keep-alive, Nagle off, queue 256) + client image with httpx pins; readiness via a retry loop (no blind sleep); timing checks parse numbers and use ranges. Quiz m05-08. Glossary +5 (Asyncio, Await, Blocking call, Coroutine, Event loop).
**Verify kiya:** all outputs real; httpx default `Limits(max_connections=100, …)` checked (a guessed claim in the draft was replaced); cheat-sheet code run against the server (100 prices, 2,505,000 paise); "Stuck?" ConnectError reproduced. Mutation: `gather` → sequential awaits → compare FAIL.
**Deploy:** owner asked to push to `github.com/abdullafajal/backend_mastery` and deploy on Pages. Owner had already made the first commit (11a9ffd) and set `origin`; `.gitignore` already covered venvs, `site/`, `site-screens/`, caches. Pushed commits 61b3a97, 7ee4af1 (+ this one). Public API showed `has_pages: false` → Deploy job fails at `actions/deploy-pages` (build OK) until the owner selects Source = GitHub Actions. Test labs job failed on the first commit; logs need login → `test_all_labs.sh` now prints `::error title=Lab test failed::<lab>` annotations (public).
**Checks:** build strict, check_site (8 Module 5 pages) PASS, lab 6/6, screenshots dekhe (desktop-light await, mobile-dark block).


### 2026-11-23 — Session 38: Module 5, Lesson 7 "Threads and processes" (+ module-reference audit)

**Kiya:** lesson (core: waiting work with ThreadPoolExecutor (2.0 s → 0.2 s), computing work (threads 1.3 s = one by one; processes 0.5 s on 8 cores), the GIL, processes + cost, I/O vs CPU table, oversell race (5 sold from stock 1) + Lock, packing-desk analogy; code example = threads not joined → 0 prices; under the hood: lambda PicklingError, timing ranges; deeper: free-threaded 3.13t, more tools, DB locking in Module 16, why the sleep makes the race reliable). Diagram `concurrency-timeline.js`. Lab: 3 examples, 1 mistake, 6 checks (number parsing + ranges; processes must beat one-by-one only when cores ≥ 2). Quiz m05-07. Glossary +4 (Concurrency, Pickling, Process pool, Thread pool; GIL/Lock/I/O-bound/CPU-bound existed).
**Module-reference audit (against PLAN.md):** fixed 7 wrong "Module N" pointers in Modules 4–5 (Decimal/DoesNotExist/models → 9, API JSON → 11, transactions → 16, web-server processes → 20, Docker → 19). Modules 0–3 references checked: OK.
**Verify kiya:** README claims run (max_workers=2 → 1.0 s; named function → [299, 649]). Mutation: max_workers=1 → waiting FAIL.
**Checks:** build strict, check_site PASS, lab 6/6, screenshots dekhe (desktop-light cpu, mobile-dark wait; phone label shortened).


### 2026-11-23 — Session 38: First commit + GitHub Pages deploy

**Kiya:** `.gitignore` poora kiya (Python tooling caches, editors, root-level `.env`; labs ki teaching `.env`/seed logs jaan-boojhkar commit). `site_url` = `https://abdullafajal.github.io/backend_mastery/`. Pehla commit, remote `origin` = `https://github.com/abdullafajal/backend_mastery.git`, `main` push. Deploy `.github/workflows/deploy.yml` se (GitHub Actions).
**Checks:** secrets scan (koi asli key nahi; lab `.env` me sirf dummy passwords), `mkdocs build --strict` local.
**Pending:** owner ko repo Settings → Pages → Source = "GitHub Actions" set karna hai (ek baar), phir workflow re-run; live URL check.

### 2026-11-22 — Session 37: Module 5, Lesson 6 "Virtual environments and packaging"

**Kiya:** lesson (core: PyPI + pip, `python3 -m venv .venv` per project (2.34.2 vs 2.33.1 side by side), activate/deactivate + `which`, exact pins incl. dependencies (test proves: unpinned certifi pulls a 2-day-old release), uv venv/pip install, `pyproject.toml` + `[project.scripts]` → `bazaar` command, data moves to `~/.bazaar`, spice-box analogy; code example = entry point `bazaar.main:start` → real ImportError + the generated script; under the hood: requests==9.9.9 error, site-packages/sys.path/PATH; deeper: uv init/add/lock/sync, build/wheel/editable/publish/semver, supply-chain safety). Diagram `venv-packaging.js`. Lab: own image with uv, project-a/b, `bazaar_pkg/` (src layout, Bazaar v0 adapted to package imports + home-folder data), exercise/solution copies (test verifies they differ only in pyproject), 12 checks. Quiz m05-06. Glossary +8 (Dependency, Entry point, Lock file, Pip, PyPI, Pyproject.toml, Requirements file, Uv; Virtual environment existed).
**Pins chosen by PyPI upload date (≥2 weeks):** uv 0.13.6, requests 2.34.2/2.33.1, certifi 2026.10.23 (2026.11.20 was too new), setuptools 84.2.1.
**Bug pakda:** walkthrough helper let `cd` leak between commands (eval in the same shell) → subshells; `pip show | head` "Pipe to stdout was broken" → grep; mobile diagram text too long.
**Checks:** build strict, check_site PASS, lab 12/12, screenshots dekhe (desktop-light package, mobile-dark venv).


### 2026-11-22 — Session 36: Module 5, Lesson 5 "Generators and context managers"

**Kiya:** lesson (core: yield pauses/resumes (`yield_demo`), list 8,448,728 bytes vs generator 200 bytes, a read→parse→filter pipeline over 200,000 orders (149,894 paid, ₹113,711,456), used-once rule, `@contextlib.contextmanager` with try/finally (till closes after "card declined"), telephone-directory vs enquiry analogy; code example = generator used twice → ZeroDivisionError → one pass (₹758); under the hood: StopIteration, no len(); deeper: `deeper.py` (islice, yield from, `__enter__`/`__exit__`), send()/QuerySet.iterator/streaming). Diagram `generator-flow.js`. Lab: seeded 200,000-line log, 6 examples, 2 mistakes, 9 checks (pipeline and average compared with independent awk). Quiz m05-05. Glossary +4 (Context manager, Generator, StopIteration, Yield; Pipeline existed).
**Verify kiya:** all outputs real. Mutation: pipeline filter changed → got 119889 vs awk 149894 → FAIL.
**Bug pakda:** diagram first used invented order numbers (#4 Asha Kurta…) → replaced with the log's real first 5 PAID orders; include range started one line late (→ 12-17).
**Checks:** build strict, check_site PASS, lab 9/9, screenshots dekhe (desktop-light list step 3, mobile-dark generator step 3).


### 2026-11-22 — Session 35: Module 5, Lesson 4 "Decorators"

**Kiya:** lesson (core: functions are values (store/pass/return, make_discount), a decorator step by step with `@log_calls`, `@timed`, `@retry(times=3)` (3 levels), gift-wrapping analogy; code example = `@with_gst` wrapper without `return` → `None`; under the hood: no `functools.wraps` → name 'wrapper' (silent), `@retry` without brackets → returns a function (silent); deeper: `deeper.py` (stacking order outer/inner, `functools.lru_cache`), closures (`__closure__`), class decorators). Plan diagram `decorator-wrap.js`. Lab: 5 examples (sleep/counter make outputs deterministic; timing rounded to 0.1 s), 2 mistakes, 9 checks (timing check parses numbers and checks ranges). Quiz m05-04. Glossary +4 (Closure, Decorator, Functools.wraps, Wrapper; Cache existed).
**Verify kiya:** all outputs real; `@retry(times=2)` → `ConnectionError: gave up after 2 attempts`; `__closure__[0].cell_contents` → 10. Two mutations: `times=2` → retry FAIL; `sleep(0.0)` → timed FAIL.
**Bug pakda:** diagram showed an invented clock value ("start = 12.000 s") → "clock started"; include range missed `def with_gst` (→ 7-14).
**Checks:** build strict, check_site (4 Module 5 pages) PASS, lab 9/9, screenshots dekhe (desktop-light timed, mobile-dark retry).


### 2026-11-22 — Session 34: Module 5, Lesson 3 "Dataclasses and type hints"

**Kiya:** lesson (core: by-hand vs `@dataclass`, fields, defaults/default_factory/__post_init__/frozen table, type hints, Python ignores hints (`"299" * 2` → `'299299'`), mypy catches it before running, pre-printed-form + clerk analogy; code example = `lines: list = []` refused by dataclasses ("use default_factory"); under the hood: FrozenInstanceError, default order TypeError, "no hint, no check"; deeper: `deeper.py` (order=True, `list[str]`, `dict[str, int]`, `Product | None`; mypy clean), run-time checks (pydantic/DRF serializers), mypy strict + CI). Diagram `dataclass-hints.js`. Lab builds its own image with **mypy 2.4.1** (chosen ≥2 weeks old via PyPI upload dates), 10 checks incl. mypy error + mypy clean on the solution. Quiz m05-03. Glossary +6 (Dataclass, Default factory, Field, Frozen dataclass, Mypy, Type hint).
**Verify kiya:** all outputs real (python + mypy). Mutation: remove the hints from `line_total` → mypy says Success → check FAIL (and became lesson text: "no hint, no check").
**Bug pakda:** `\|` in markdown table code spans rendered a literal backslash → plain `|` inside backticks works in Python-Markdown tables (no other lesson affected); desktop arrow direction fields→@dataclass; README cleanup wording.
**Checks:** build strict, check_site PASS, lab 10/10, screenshots dekhe (desktop-light dataclass, mobile-dark hints).


### 2026-11-22 — Session 33: Module 5, Lesson 2 "Inheritance and special methods"

**Kiya:** lesson (core: `class GiftCard(Product)`, inherit vs override, `super().__init__`, method lookup order, polymorphism via one `describe()`, special methods table (`__str__`/`__repr__`/`__eq__`/`__lt__`/`__len__`), rule-book-chapters analogy; code example = GiftCard without `super().__init__` → real AttributeError; under the hood: override typo (silent), no `__eq__` (silent False), no `__lt__` (TypeError); deeper: `deeper.py` (`__mro__`, `@property` read-only, `__eq__` removes `__hash__` → unhashable), composition/multiple parents/`@override`/ABC, more special methods). Diagram `method-lookup.js`. Lab: 3 examples, 3 mistakes, 8 checks. Quiz m05-02. Glossary +7 (Inheritance, Override, Parent class, Polymorphism, Property, Special method, Super()). Canon: Bazaar Gift Card.
**Verify kiya:** all outputs real; `typing.override` exists in 3.13. Mutation: remove GiftCard's override → inheritance check FAIL.
**Bug pakda:** include range started at `super()` line, missing `class`/`def` (→ 18-21); diagram step 4 showed GiftCard dim+active (unmark first).
**Checks:** build strict, check_site (2 Module 5 pages) PASS, lab 8/8, screenshots dekhe (desktop-light card.describe 4 steps, mobile-dark card.price_text + masala.needs_delivery).


### 2026-11-22 — Session 32: Module 5 split + Lesson 1 "Classes and objects"

**Kiya:** Module 5 index + nav + 8-lesson split. Lesson (core: class/object/attribute/method in 4 words, `__init__` + `self.name = name`, `self` = object before the dot (`Product.sell(masala, 2)`), a class refuses `"cheap"` (vs a dict), `__repr__`, Cart of Products, product-form analogy; code example = `lines = []` on the class shared by both carts; under the hood: 3 real errors; deeper: class attributes on purpose (CURRENCY), `__dict__`/vars, OOP in one paragraph). Diagram `class-objects.js`. Lab: 4 examples, 3 mistakes, exercise + solution, 7 checks. Quiz m05-01. Glossary +9 (Attribute, Class, Class attribute, Instance, Method, Object, Object-oriented programming, Self, __init__).
**Verify kiya:** all outputs real; vars(), default repr, class-attribute assignment run. Mutation: `sell()` without `self.stock -= quantity` → product check FAIL.
**Bug pakda:** phone layout of the shared situation would overlap the two lists in the fix step → first list in the left half.
**Checks:** build strict, check_site PASS, lab 7/7, screenshots dekhe (desktop-light blueprint, mobile-dark shared fix).


### 2026-11-22 — Session 31: Module 4, Lesson 8 "Modules, and Bazaar v0" (Module 4 complete)

**Kiya:** lesson (core: a module is a .py file, two import forms table, standard library tour, importing runs the file once + `__name__`, Bazaar v0's three modules included in full with "which lesson each part comes from", sys.argv, a real v0 session, departments analogy; under the hood: typo import, shadowing json.py (Python 3.13 hint), exit codes; deeper: packages + `python -m`, sys.path + sys.modules, v0 design choices (rules never print, Path(__file__), BAZAAR_DATA, argparse)). **Bazaar v0** (plan's Module 4 lab): money.py (rupees, parse_rupees "299"/"1,499"/"349.00"), catalog.py (load/save/add with ValueError rules/search by name or seller), main.py (list/add/search, exit codes 0/1/2). Diagram `imports.js`. Lab: 7 tasks incl. "it remembers" after restart; 14 checks; examples stdlib_tour/who_am_i/import_it; exercise = case-sensitive search. Quiz m04-08. Glossary +5 (Command-line arguments, Import, Module, Package (Python), Standard library, __name__).
**Verify kiya:** all 15 v0 commands run for real (incl. from another folder, duplicate/abc/₹0 refusals, usage exit 2); inline import snippet, `echo $?` → 1, `python3 -m json.tool` run. Mutation: search without `.lower()` → search + elsewhere checks FAIL. Student's `bazaar_v0/data/` untouched by the test.
**Bug pakda:** README "Stuck?" claimed an unquoted name gets split into the price → really prints the usage (exit 2) → corrected from a real run; solution include range missed the `def` line → computed with grep.
**Checks:** build strict, check_site PASS, lab 14/14, screenshots dekhe (desktop-light run, mobile-dark direct).


### 2026-11-22 — Session 30: Module 4, Lesson 7 "Files and JSON"

**Kiya:** lesson (core: memory vs disk table, `with open(..., encoding="utf-8")`, modes table (w empties!), JSON vs Python table, dumps/loads vs dump/load, the real catalog.json, safe loading (FileNotFoundError, JSONDecodeError), whiteboard/register-book analogy; code example = `str(cart)` single quotes → JSONDecodeError, reading long tracebacks (skip Python's own lines); under the hood: set not serializable, missing file, "w" erases silently; deeper: `deeper.py` (pathlib, ensure_ascii, safe save with os.replace) + other formats (CSV, JSON Lines, YAML/TOML, never unpickle untrusted data)). Diagram `file-json.js`. Lab: programs write to `data/` (own .gitignore), 5 examples, 3 mistakes, 11 checks (incl. the JSON file on disk). Quiz m04-07. Glossary +6 (Encoding, File mode, FileNotFoundError, JSONDecodeError, Serialize, With statement; JSON existed).
**Verify kiya:** all outputs real; README's `2>&1 | tail -1` commands re-run; mutation `json.dump` → `str(cart)` → solution check FAIL.
**Bug pakda:** trimmed tracebacks used a bare `...` → now say "(… lines from Python's own json code skipped …)"; include range was off by one (computed with grep); diagram: dump/load arrows on one line (offset ±12), red+dim on one box (unmark first), arrows hidden in the nosave story.
**Checks:** build strict, check_site PASS, lab 11/11, screenshots dekhe (desktop-light save, mobile-dark nosave).


### 2026-11-22 — Session 29: Module 4, Lesson 6 "Errors and exceptions"

**Kiya:** lesson (core: exceptions table (ValueError/KeyError/IndexError/TypeError) + SyntaxError difference, try/except steps, small try blocks, one except per error + `as error`, raise for Bazaar rules (reserve stock), else/finally, why never a bare except (real hidden-typo demo), billing-counter analogy; code example incl. the forgot-`continue` 15-boxes output; under the hood: wrong except still crashes, where a raised error travels; deeper: own exception class OutOfStock, re-raise/`from`/EAFP vs LBYL, errors in a web backend (500/404/400)). Diagram `try-except.js` (typed input; JS follows Python's int() rules). Lab: 4 examples, 3 mistakes, exercise = bulk import crashing at "three" → skip bad lines, 8 boxes; 9 checks. Quiz m04-06. Glossary +7 (Bare except, Exception, Finally, KeyError, Raise, Try and except, ValueError).
**Verify kiya:** all outputs real; `int(" 3 ")`, `int("+3")`, `int("1_000")`, `int("-2")` checked so the diagram matches Python; OutOfStock + `raise … from` run.
**Mutation found a teaching point:** removing `continue` from the solution → no error but `Total boxes: 15` (old quantity reused) → became `mistakes/forgot_continue.py` + its own check + lesson text.
**Checks:** build strict, check_site PASS, lab 9/9, screenshots dekhe (desktop-light try with "three", mobile-dark crash).


### 2026-11-22 — Session 28: Module 4, Lesson 5 "Comprehensions"

**Kiya:** lesson (core: loop vs comprehension side by side with a part-by-part table, "what you keep comes first", any expression, dict/set brackets table, when a normal loop is better, order-slip analogy; under the hood: if/else placement error, loop name stays inside (vs a for loop where it survives); deeper: `deeper.py` (if/else before for, generator expressions in sum/any/all, two fors) + real-Bazaar shapes). Diagram `comprehension.js`. Lab: `catalog_data.py` imported by every program (copies in 4 folders, test verifies identical), 4 examples, 2 mistakes, exercise = unit bug `< 500` → empty shelf, 9 checks. Quiz m04-05. Glossary +3 (Comprehension, Expression, Generator expression).
**Verify kiya:** all outputs real; for-loop name survives (`Steel Water Bottle`), stock worth ₹73,105; README's `ModuleNotFoundError: No module named 'catalog_data'` reproduced.
**Bug pakda:** first mutation (`<= 34900`) gave the same answer, so it tested nothing → used `< 5000` (another unit slip) → FAIL. Deeper snippets moved into a real file (`deeper.py`) and tested instead of copy-pasted.
**Checks:** build strict, check_site PASS, lab 9/9, screenshots dekhe (desktop-light filter ₹500, mobile-dark dict).


### 2026-11-22 — Session 27: Module 4, Lesson 4 "Lists, dicts and sets"

**Kiya:** lesson (core: list + index from 0, dict + key + .get, catalog = list of dicts, set (unique, no order), tuple + unpacking, "which one when?" table, two names one list + .copy(), queue/label/guest-list/shared-basket analogies; deeper: slices + list tools, hash tables + hashable + dict order, shallow vs deep copy). Canonical catalog with stock (Shoes 12, Kurta 25, Masala Box 40, Earbuds 8, Bottle 60). Diagram: `name-tags` gained the plan's "list" situation (objects relabel per step). Lab: 5 examples, 3 mistakes (KeyError, IndexError, tuple assignment), exercise = shared starter cart (Priya's kurta in Asha's cart), 8 checks. Quiz m04-04. Glossary +7 (Dict, Index, Key, List, Set, Tuple, Unpacking; Mutable already existed).
**Verify kiya:** all outputs real; deeper snippets run (slices, join, unhashable list, `{}` vs `set()`, shallow/deep copy).
**Bug pakda:** (1) first mutation removed Asha's `.copy()` and the test still passed — correct, since only Priya's list is appended to; mutating Priya's line → FAIL (good: the check tests the real bug); (2) hand-typed double space in an output line → fixed to the real output; (3) deep-copy snippet used an undefined `catalog` → made self-contained.
**Checks:** build strict, check_site (4 Module 4 pages) PASS, lab 8/8, screenshots dekhe (desktop-light + mobile-dark list situation).


### 2026-11-22 — Session 26: Module 4, Lesson 3 "Functions"

**Kiya:** lesson (core: define vs call, docstring, parameter vs argument, return (and how it ends the function), print vs return → None, defaults + keyword args, local names + constants, good-function rules, recipe-card analogy; code example = reading a 2-frame traceback bottom-up; under the hood: 3 errors + "a traceback is a list of calls"; deeper: *args/**kwargs/keyword-only + mutable default trap, global/functions as values/lambda, type hints). Diagram `function-call.js`. Lab: 5 examples (scope.py crashes on purpose), 3 mistakes, exercise = cart_subtotal without return → real `TypeError: '>=' not supported between instances of 'NoneType' and 'int'`, 8 checks. Quiz m04-03. Glossary +8 (Constant, Default value, Docstring, Function, Keyword argument, Local name, Parameter, Return value; "Argument" already existed).
**Verify kiya:** all outputs real; deeper snippets run (order_summary, mutable default, keyword-only TypeError, tuple return). Mutation: remove `return subtotal` → solution check FAIL.
**Bug pakda:** (1) three snippets with `...` (rule: never half code) → complete, run; (2) line-range include started one line late → computed with grep; (3) **site-wide:** code ligatures turned `>=` into `≥` → disabled; full check_site 24/24 PASS.
**Checks:** build strict, check_site 24 pages PASS, lab 8/8, screenshots dekhe (desktop-light call 998, mobile-dark noreturn, ligature fix on m04-02 table).


### 2026-11-22 — Session 25: Module 4, Lesson 2 "Control flow"

**Kiya:** lesson (core: if/else with the ₹999 border, comparison table, = vs ==, elif order with a 5-row coupon table, and/or/not, for over Ravi's cart (list explained in one line), while, continue/break, billing-counter analogy; under the hood: 3 real syntax errors; deeper: truthiness + short-circuit, range/enumerate/loop-else/match, one-line if). Snippets include files by line range (`stock.py:4:8`, `:11:20`, `checkout.py:11:11`) instead of copies. Diagram `control-flow.js` (typed cart total → path; loop running total). Lab: 4 examples, `mistakes/` (no colon, no indent, = vs ==), exercise with a one-character `=`/`+=` bug (₹349/₹49/₹398 → ₹1,596/free), 7 checks. Quiz m04-02. Glossary +8 (Break and continue, Comparison operator, Condition, Control flow, Indentation, Loop, Off-by-one error, Truthy and falsy).
**Simplified after first draft:** coupon example used `def` (Lesson 3) → plain variables; stock example used indexes/len → while countdown + for with continue/break; exercise f-string with nested quotes → plain if/else.
**Verify kiya:** all outputs real (coupon variants via sed in the test); deeper snippets run. Mutation: `>=` → `>` in delivery.py → delivery check FAIL.
**Bug pakda:** solution generated by sed lost the closing docstring quotes (SyntaxError) → rebuilt; mobile loop arrows would cross items → items left, total right, `dir: "h"`; `toLocaleString("en-IN")` would print lakh-style commas unlike Python → own formatter.
**Checks:** build strict, check_site PASS, lab 7/7, screenshots dekhe (desktop-light 998 path, mobile-dark loop mid-step + end).


### 2026-11-22 — Session 24: Owner asks + Module 4, Lesson 1 "Variables and types"

**Owner ne poocha "mujhse kya chahiye":** list di (Open questions me upar). Default: labs self-contained, `bazaar-app` decision pending, nothing committed.
**Kiya:** Module 4 index + nav + 8-lesson split. Lesson (core: REPL, variables, 5 types table, type decides what works, conversions + errors, f-strings, money never float with the real `649 * 1.18 = 765.8199999999999` GST bug, int paise with `//` and `%`; deeper: Decimal + ROUND_HALF_UP + `round(2.675, 2)`, dynamic typing + type hints, is vs ==, immutability, small-int cache). Diagram `name-tags.js` (plan diagram). Lab: official Python image, folder mounted, 4 examples + Ravi's invoice exercise (float total `1531.6399999999999`) + solution (`₹1,531.64`), 8 checks. Quiz m04-01. Glossary +10 (Bool, Dynamic typing, F-string, Float, Int, None, Paise, REPL, String (str), Type, Variable).
**Verify kiya:** every example run in `python:3.13.18-slim-trixie`; REPL errors (ValueError, TypeError, NameError "Did you mean"); Decimal/round snippets; "Stuck?" errors reproduced (`Unknown format code 'd' for object of type 'float'`, `₹1,531.5`). Mutation: solution with `* 0.18` → solution check FAIL.
**Bug pakda:** (1) first exercise didn't show the bug (1824.28 printed fine) → searched real combos, used Shoes + Masala Box; (2) flaky test from compose stderr → fixed + CLAUDE.md §7 rule; (3) README "Stuck?" had a guessed message (`₹233.0.64`) → replaced by the real ValueError; (4) rebind diagram arrows crossed → names reordered.
**Checks:** build strict, check_site PASS, lab 8/8 (twice, stable), screenshots dekhe (desktop-light rebind, mobile-dark types).


### 2026-11-22 — Session 23: Module 3, Lesson 5 "GitHub and pull requests" (Module 3 complete)

**Kiya:** lesson (core: one online copy + laptop copies picture, remote/origin, clone, push -u, pull request (what the page shows), fetch vs pull with the "stale up to date" example, rejected push + pull --rebase, everyday GitHub flow, head-office-ledger analogy; under the hood: remote -v / branch -a, CLI review with `main..` and `main...`, merged history, deleting branches; deeper: real GitHub steps (optional, unverified by tests), three merge buttons, branch protection/forks/HTTPS vs SSH/pull.rebase/small PRs). Diagram `github-flow.js`. Lab: bare repo "GitHub" with Bazaar history (same hashes as other labs), two laptop folders with includeIf identities, 9 tasks, 9 checks; `CATCHUP` env for mutation. Quiz m03-05. Glossary +11 (Branch protection, Clone, Code review, Fetch, Fork (GitHub), Origin, Pull, Pull request, Push, Remote, Remote-tracking branch).
**Verify kiya:** real outputs: clone, remote -v, branch -a, `* [new branch]` + tracking line, fetch, `main..`/`main...` diff, `--no-ff` "Merge pull request #1…" + push, stale status → "behind by 2 commits", pull ff, rejected push text, pull --rebase + push, `--delete` + prune, `destination path … already exists and is not an empty directory.` Mutation: skip the pull → catchup check FAIL.
**Bug pakda:** push/pull arrows overlapped (same offset) → ±12; README had a confusing "second terminal" line → removed; glossary "Fork" already existed (Module 1, process) → "Fork (GitHub)".
**Checks:** build strict, check_site (5 Module 3 pages) PASS, lab 9/9, screenshots dekhe (desktop-light PR last step, mobile-dark both).


### 2026-11-22 — Session 22: Module 3, Lesson 4 "Rebase"

**Owner feedback:** "content aisa rakhna ke koi bhi user achhe se samjhe" → extra-simple core: before/after ASCII pictures, one idea per H3, merge-vs-rebase table, notebook-chapter analogy, golden rule explained with a concrete Neha/Rohan story.
**Kiya:** lesson (core: situation picture, what rebase does in 3 steps, new hashes = copies (parent in hash), fast-forward after, merge vs rebase table, golden rule; under the hood: `main..branch`, conflict during rebase (HEAD flipped!) + --continue; deeper: reflog, `rebase -i` words, --onto/pull --rebase/autostash/--force-with-lease). `delivery.py` (free from ₹999, else ₹49; paise ints) via snippet. Diagram: `commit-graph` + `git rebase` (old commits dimmed, copies on the target's lane, preset head = free-delivery). Lab: student = Rohan, 7 tasks (2 optional), 9 checks; `JOIN` env lets the mutation test swap rebase for merge. Quiz m03-04. Glossary +4 (Golden rule of rebase, Interactive rebase, Rebase, Reflog).
**Verify kiya:** real outputs: rebase success, new hashes with same author, ff, straight graph, reflog, `cat-file -t` old commit, rebase conflict text + flipped markers, `--continue` (`[detached HEAD …]`), `invalid upstream`, `Current branch main is up to date.`, `rebase -i` todo format (`pick <hash> <msg>`, git 2.47.3). Mutation: merge instead of rebase → 4 checks FAIL.
**Checks:** build strict, check_site (4 Module 3 pages) PASS, lab 9/9, screenshots dekhe.


### 2026-11-21 — Session 21: Module 3, Lesson 3 "Merging and conflicts"

**Kiya:** two-layer lesson (core: merge into the branch you're on, fast-forward, merge commit with two parents, how Git combines (3 cases), real conflict, reading markers, 4-step fix, test after merge, --abort, newspaper-editors analogy; deeper: three-way merge table + merge base + zdiff3 + VS Code buttons, --no-ff/--ff-only/--squash/--ours/--theirs, non-line conflicts + semantic conflicts). `commit-graph.js` rewritten with PRESETS (story / merge / own), start states with several branches, pending-merge state (`git add`, `git merge --abort`, commit finishes merge), conflict marks in red, MAX 10 commits. Kit: `data-state-*`. `sale.py` docstring generic in both labs (no stale "₹100"). Lab: repo pre-built with fixed dates incl. Rohan's commit (author Rohan Mehta), 10 tasks, 10 checks. Quiz m03-03. Glossary +6 (Conflict markers, Fast-forward, Merge, Merge base, Merge commit, Merge conflict).
**Verify kiya:** saare outputs asli run: Fast-forward, `Merge made by the 'ort' strategy.`, CONFLICT + status (`both modified`, `UU`), markers, `Committing is not possible…`/`Exiting because of an unresolved conflict.`, --abort, `git log --merge` (Neha vs Rohan), resolved status, final ₹849/₹499/₹1,349, `--merged`, -d both. `There is no merge to abort (MERGE_HEAD missing).` and `not something we can merge` checked in container. Mutation: keeping ₹200 → final check FAIL (₹799). Lesson 2 lab re-run after docstring change: PASS.
**Bug pakda:** test ka "commit too early" check sirf 2 lines dekh raha tha; test me `branch -d add-support-email` step missing tha (README me tha) → dono fix.
**Checks:** build strict, check_site (3 Module 3 pages) PASS, lab 10/10, screenshots: desktop-light + mobile-dark final step, desktop-dark conflict step.


### 2026-11-21 — Session 20: Module 3, Lesson 2 "Branches"

**Kiya:** two-layer lesson (core: branch = name on a commit, git branch / switch -c, commit moves only current branch, switch changes files, split history + log --graph --all, "would be overwritten" rule, branch names, notebook-ribbon analogy; deeper: refs on disk, detached HEAD, stash/rename/-D/--merged). `sale.py` (₹100 off from ₹500, paise ints) included via snippet. Diagram `commit-graph.js` = plan ka interactive commit graph (story with real hashes + type your own commands; merge already supported for Lesson 3). New CSS: `.bz-diagram__note` (error line, light+dark via tokens). Lab: image pre-builds Lesson 1's repo with fixed dates (same hashes for everyone), 9 tasks, 8 checks. Quiz m03-02. Glossary +4 (Branch, Detached HEAD, Main branch, Stash); HEAD definition corrected (usually the current branch).
**Verify kiya:** saare outputs asli run se: switch -c, commit on branch, sale.py gone on main (+ `can't open file`), split graph, "would be overwritten by checkout", `invalid reference`, `already exists`, `not fully merged` + hints, `cannot delete branch 'main' used by worktree`, branch -v, refs files, `git swich` typo message. Mutation: DISCOUNT 5000 → "back" check FAIL. Diagram typing tested in Playwright (6 commands + 1 typo, no page errors, no horizontal scroll).
**Bug pakda:** mobile me merge arrow box ke upar se jaata tha → cross-lane arrows side-to-side (`dir: "h"`); rows thode door kiye.
**Checks:** build strict, check_site PASS, lab 8/8, screenshots dekhe (desktop-light + mobile-dark, story + own).


### 2026-11-21 — Session 19: Module 3, Lesson 1 "Commits and history"

**Kiya:** Module 3 index + nav + 5-lesson split. Two-layer lesson (core: recap from Module 0, git config, init/status, .gitignore for .env, add/commit, reading a diff, log, restore, good commit messages, bahi-khata analogy; deeper: inside .git, undoing things table (amend/revert/rm --cached/committed secret), more log/diff/blame). Diagram `git-three-places.js` (save / undo). Lab: Bazaar catalog v0 (`starter/products.py`, paise ints) + `.env`; 9 tasks, 8 checks. Quiz m03-01. Glossary +5 (Diff, Gitignore file, HEAD, Parent commit, Untracked file). CLAUDE.md canon: developers Neha Kapoor + Rohan Mehta (Kabir already a customer in a Module 1 example, so not used).
**Verify kiya:** saare outputs asli run (git 2.47.3): Author identity unknown error, init, status (untracked + after .gitignore), root-commit, diff, "no changes added to commit", log/oneline/show --stat, restore → clean. Mutation: .gitignore bina .env → 3 checks FAIL. Note: `cat .git/HEAD` = `ref: refs/heads/main` sirf `init.defaultBranch main` ke baad (bina config ke `master`).
**Checks:** build strict, check_site (page) PASS, lab 8/8, screenshots dekhe (desktop-light save, mobile-dark undo).


### 2026-11-21 — Session 18: Module 2, Lesson 7 "systemd and logs" (Module 2 complete)

**Kiya:** two-layer lesson (core: systemd = PID 1 manager, service, unit file (4 key lines), systemctl start/stop/status/restart, enable vs start, journal + journalctl -u/-n/-f, shop-manager analogy; deeper: broken service + daemon-reload/reset-failed + start limits, drop-ins/systemctl edit, more journalctl, Restart= options + SIGTERM→SIGKILL, why privileged). Unit file, env file and server.py included via snippets. Diagram `systemd-lifecycle.js` (3 situations). Lab: 7 tasks (2 optional), 7 checks. Quiz m02-07 (6 core + 2 deeper). Glossary +8 (Drop-in file, Enable, Journal (systemd), journalctl, Service, systemctl, systemd, Unit file).
**Verify kiya:** saare outputs asli run se (status, kill -9 → PID 94→117 + journal lines, -o cat, enable symlink, `docker compose restart` ke baad active, stop → Deactivated/Stopped, typo drop-in → `can't open file` + `status=2/INVALIDARGUMENT`, /var/log listing). Mutation test: `Restart=no` → restart check FAIL ("96 0"), phir restore.
**Bug pakda:** test me `)` quote ke andar tha (bash syntax error) → fix. Mobile diagram me server.py→journal arrow bahut chhota → gap badhaya. Cross-refs galat the (symlink/signals Lesson 2/5 me nahi, Module 1 me hain) → fix. Teaser me "Asha's laptop" hataya (Asha canonical customer hai).
**Note:** journalctl -p err container me host kernel ke lines dikha sakta hai (OOM from another lab); lesson me Going-deeper note hai, Bazaar ka nahi.
**Checks:** build strict, check_site (page 07) all PASS, lab 7/7, screenshots dekhe (desktop-light + mobile-dark, teeno situations ka last step).


### 2026-11-21 — Session 17: Module 2, Lesson 6 "SSH"

**Kiya:** two-layer lesson (core: ssh user@host, remote command, first-connection fingerprint + known_hosts, key pair table, ssh-keygen + ssh-copy-id, scp, ~/.ssh/config, bank-locker analogy; deeper: challenge/signature steps, sshd hardening, more config/rsync/tunnels). Diagram `ssh-keys.js`. Lab: 2 images (openssh-server with asha/`asha-lab`; client with sshpass for tests), 8 tasks, 8 checks incl. server log lines.
**Verify kiya:** exact first-connect prompt captured via a Python pty (non-TTY ssh exits 6 instead of asking); keygen/copy-id output; `Accepted password` → `Accepted publickey`; `UNPROTECTED PRIVATE KEY FILE` (exit 255); wrong password exit 5 + `Failed password`; remote `grep -c` = 1; scp both ways; config alias.
**Bug pakda:** mobile page was 385px wide on a 375px screen → a quiz option with a long path (no spaces) → `overflow-wrap: anywhere` for quiz options, questions, explanations and diagram captions (all lessons).
**Checks:** build strict, check_site 15/15 pages, lab 8/8.

### 2026-11-21 — Session 16: Module 2, Lesson 5 "Environment variables, packages and background jobs"

**Kiya:** two-layer lesson (core: env vars + why, `os.environ`, export vs shell var, one-command form, `.env` + Compose `environment:`/`env_file:`, apt update+install, `&`/jobs/kill %1/wait; deeper: inheritance + source/`set -a`, `~/.bashrc`, apt table + dpkg, Ctrl+Z/bg/fg/nohup). Diagram `env-inherit.js`. Lab: `settings.py` (no default for the secret, masked print), `import_products.py`, `bazaar.env`, compose `shell` + `app`; 8 tasks, 7 checks.
**Verify kiya:** export vs not (exit 1 vs masked password), one-shot var gone after, compose env + `-e` override, jq 127 → `E: Unable to locate package jq` (exit 100) → update+install → `jq-1.7`, `299`; jobs Running/Terminated, wait → `import finished`; interactive `[1] 8` via `bash -i`.
**Bugs/claims fixed:** `nohup` did NOT create `nohup.out` (output wasn't a terminal) → lesson never claims it; always `nohup cmd > file 2>&1 &`. Diagram: select overflow on phones (CSS for all diagrams), empty space.
**Checks:** build strict, check_site (Module 2: 5/5), lab 7/7.

### 2026-11-21 — Session 15: Module 2, Lesson 4 "Pipes and redirection" (+ Linux playground)

**Kiya:** lesson in two layers from the start (core: columns of the log, stdout/stderr, > >> 2> /dev/null, |, 5-tool toolbox, **pipeline built step by step with real output**, why sort before uniq -c; deeper: 2>&1 order, awk, cut/tr/sed/tee/xargs, how pipes work, pipefail). Diagram `pipe-flow.js`. Lab: deterministic `access.log` (seed 2026), Part A redirection, **Part B playground: 20 tasks with answers**; `solutions.sh`, `expected.py` (independent Python), `check.py`; test 8/8.
**Bugs pakde:** (1) task 7 tie (318 = 318) → "top 2"; (2) **lesson example said 31 failed checkouts; real answer 27** (I had typed a number instead of pasting it) → fixed, and the lesson's five answers are now checked by `test_lab.sh`; (3) "5 after 31" sort claim unverified → replaced with a real `9 / 10` example; (4) `check_site.py` read "Step 5/5" + "5. sort…" as "5/55" → reads only the `.bz-diagram__step` label now; (5) data box text overflow → short samples.
**Mutation test:** broke solution 10 on purpose → playground check FAILED (19/20) → restored.
**Checks:** build strict, check_site 13/13 pages, lab 8/8.

### 2026-11-21 — Session 14: Two-layer conversion of all lessons

**Owner feedback:** "content samajh nahi aa raha, advanced walon ke liye hai" → chose: topics too advanced + too many new terms; fix = two layers. Then: "haan theek hai, baaki lessons bhi badlo aur aage badho".
**Kiya:** CLAUDE.md §4a → Two-layer standard; memory updated; `site.css` style for `!!! abstract` ("In 1 minute"); m02-02 rewritten by hand as the sample; `scripts/two_layer.py` (collapse chosen `###`/`####` sections in place, level-aware; insert "In 1 minute"; set reading time; quotes in titles made safe) applied to the other 11; dense core sections hand-simplified with the full original kept in a Going-deeper box right below; quizzes reordered/marked; lab READMEs marked.
**Bugs pakde:** (1) helper stopped at the first `####` inside a `####` box (roadmap levels) → level-aware end; (2) nested `"` in box titles cut the title → replaced with `'`; (3) screenshot showed the core still dense (kernel/system call/scheduler in one section) → measured bold-term counts per lesson, then simplified the worst sections by hand.
**Checks:** `mkdocs build --strict`; `check_site.py` 12/12 pages; snippet includes inside boxes verified in built HTML.

### 2026-11-21 — Session 13: Module 2, Lesson 3 "Users and permissions"

**Kiya:** lesson (~5,000 words): 3 incidents (.env readable, 777 "fix", ravi deletes root's file), users/UID/GID, /etc/passwd fields, service users + nologin, owner/group/mode, **r/w/x on files vs folders** (delete = folder's w), kernel ka 4-step faisla (sirf ek set), octal table, chmod letters/numbers, chown/chgrp, `-R` trap, umask, sudo/su + least privilege, sticky + setuid, Bazaar fixes table, analogy + kahan tootti hai, real world, 6 questions, 2 Going deeper (shadow, ACLs), 7 mistakes, cheat sheet. Diagram `permission-check.js` (who × what, 6 combos checked). Lab: Dockerfile (asha in bazaar+sudo NOPASSWD, ravi pw "ravi", www-data), `-u` se user ban kar test, 11 tasks, 10 checks.
**Verify kiya:** ids/passwd/group lines, ravi reads .env (644) → 640 root:bazaar ke baad sirf asha; 600 → asha denied; `u+x,g+w,o-r` on 644 = 760; vault 711/744 behaviour; 777 folder me root ki read-only file ravi ne delete ki; /tmp sticky → Operation not permitted; www-data uploads OK, config denied; asha `sudo` OK; ravi → `ravi is not in the sudoers file.` (password set karke exact message); umask 022/077; 777 config → ravi ne price badla; setuid on passwd/sudo; `namei -l`.
**Bugs pakde:** (1) test ka `out=$(failing_cmd)` + `set -e` → script chupchaap ruka → helpers me `|| true` + CLAUDE.md rule; (2) ravi ka password na hone se asli sudo message nahi dikhta tha → practice password.
**Checks:** build strict, check_site, lab 10/10; background `test_all_labs.sh` → 11/11 (02-03 se pehle).

### 2026-11-21 — Session 12: Module 2 Lessons 1 + 2

**m02-01 The shell** (~4,800 words): 3 incidents (unquoted rm, `;` deploy, empty var → `rm -rf /`); prompt anatomy; command/option/argument; alias/function/builtin/PATH + `type`; **6 steps of Enter** (read, split, expand, find, run+wait, `$?`); quotes table (double vs single), globs (no-match literal), variables (no spaces), exit codes table (0/1/2/126/127/128+N), `;` `&&` `||`, scripts (shebang, chmod +x, `./`), `set -euo pipefail` explained; help/history/keys; analogy; real world; 5 questions; 2 Going deeper. Diagram `shell-steps.js`. Lab: fresh `/srv/bazaar` per session, `show_args`, `safe_cleanup.sh` (dry run), 9 tasks, 8 checks.
**m02-02 Working with files** (~5,000 words): cd/ls options, dotfiles, mkdir -p/touch, cp/mv (inode view; **silent overwrite**; -i/-n/-v/-b), rm/rmdir/no bin, cat/less/head/tail/**tail -f**/wc, find (tests, -exec, -delete, `-mtime` rounding), du/df (`du -sh * | sort -h`), nano + vi survival, analogy, real world, 6 questions, 2 Going deeper. Diagram `file-tree.js` (plan ka explorer: cd mode + clickable tour). Lab: Dockerfile (less/nano/vi/tree), live log every 2 s, 11 tasks, 10 checks; `backup_config.sh`.

**Verify kiya:** har output real run se (type, quotes, globs, 127/126/2/1, set -u, `;` vs `&&`, prompt via `bash -i`, show_args, safe_cleanup dry-run + `--really` + `LOG_DIR=/nope`; cd -, inodes cp vs mv, mv overwrite, mkdir -p, rmdir, tail -f, find -mtime/size/-exec, du sort, diff `3c3`). README ke andaze wale outputs (ls -l sizes) asli se badle; mkdir ke unicode quotes.
**Bugs pakde:** (1) **backup_config.sh ne sabse NAYA backup delete kiya** — `cp -a` mtime copy karta hai → sab same time → `ls -t` bekaar; naam se sort; lesson me warning box. (2) Pehla rotation check hamesha sach tha → mutation test se pakda, check majboot kiya, CLAUDE.md rule. (3) Aaj wale log ka "future" mtime → ls saal dikha raha tha. (4) diagram text overflow (args box, prompt label) → layouts/short texts.
**Checks:** build strict, check_site Module 2 (2/2), labs 02-01 8/8, 02-02 10/10; poora `test_all_labs.sh` background me.

### 2026-11-21 — Session 11: Module 1 Lessons 4 + 5 (Module 1 complete)

**m01-04 File systems** (~5,000 words): 4 Bazaar problems (inodes full, half-written JSON, deleted-but-open log, Mac/Linux case); blocks, paths (absolute/relative/cwd/pathlib), Linux tree, **inode = record, name = folder entry**, hard vs symlink, inode limits, block size, file descriptors (0/1/2), deleted-but-open, **safe save (temp + fsync + os.replace)**, case sensitivity, permissions preview, warehouse analogy, real world, 6 questions, 2 Going deeper (journaling, fsync the folder), 7 mistakes, cheat sheet (Linux/Mac/Windows + Python). Diagram `file-system.js` (3 situations; mobile layout me side-by-side boxes). Lab: 7 tasks, 7 checks.
**m01-05 What a server really is** (~4,800 words): server = program + machine, client–server, socket steps (socket/bind/listen/accept/recv/send/close), 0.0.0.0 vs 127.0.0.1, ek request ka poora safar, 4 resources table, CPU- vs I/O-bound, server vs laptop, on-prem/colo/VPS/managed, uptime nines table, analogy, real world, 6 questions, 2 Going deeper (backlog, ports per network namespace), 6 mistakes, cheat sheet. Diagram `server-request.js` (5 situations). Lab: raw-socket server, Address already in use, inventory, `/proc/net/tcp`, Too many open files (5 checks).

**Verify kiya:** unsafe crash → BROKEN JSON (exit 137); safe crash → old file valid + `.tmp` left; deleted-open 53385 → 53365 → 53385 MB + `(deleted)`; tmpfs 1000 inodes → 999 files, "No space left" with 3996/10240 KB used; hard link survives rm, symlink breaks; 3-byte file = 4096 B on disk; Mac finds `product.py` for `Product.py`, Linux doesn't; tiny server fd 3 / fd 4; `[Errno 98] Address already in use`; `127.0.0.11` = Docker DNS (`0B00007F`, resolv.conf); `[Errno 24]` after 47 files at limit 50; README exit code via `$?` = 137.
**Bugs pakde:** (1) PID 1 ignores self-SIGKILL → `init: true` (lesson me box); (2) test parser 4th-field galti → numeric guard ne sahi fail kiya; (3) diagram: dim + active border saath; mobile me arrows boxes kaat rahe the (2 diagrams) → layouts badle; sub-text overflow; (4) check_site ka ek flaky timeout → `domcontentloaded`.
**Checks:** `mkdocs build --strict`, `check_site.py` 9/9 pages, `test_all_labs.sh` 9/9. Glossary 145.

### 2026-11-21 — Session 10: Module 1, Lesson 3 "Memory: stack and heap" (Depth standard se)

**Kiya:**
- Lesson `03-stack-and-heap.md` (~5,000 words): 3 Bazaar incidents (3 a.m. exit 137, RecursionError, Ravi ke cart me Asha ka item); process memory map + virtual addresses + pages (VIRT/RES se jodkar); stack (frames, push/pop steps, per thread, `ulimit -s` 8 MB, traceback = stack); Python recursion limit; heap; stack vs heap table; **names → objects** (aliasing, `id`, `is` vs `==`, mutable/immutable, asli object sizes); manual vs automatic memory; reference counting (steps) + cycle collector; Python me leak kaise; leak sources (unbounded cache, DEBUG=True, listeners) + fixes (lru_cache, Redis maxmemory, Gunicorn max_requests); leak dhoondhna (RSS staircase, tracemalloc, limits); OOM killer; warehouse analogy + kahan tootti hai; real world; 6 questions; 2 Going deeper (stack pointer / 3.11 frames, generational GC); 7 mistakes; cheat sheet.
- Diagram `stack-heap.js`: 3 situations (normal checkout 7 steps, memory leak 6, recursion too deep 5).
- Lab `labs/01-how-computers-work/03-stack-and-heap/`: `names_and_objects.py`, `cart_bugs.py`, `call_stack.py`, `who_frees.py`, `leak.py` (leaky/bounded/find/forever), `leaky-backend` service with 64 MB limit. 7 tasks, 8 checks. Quiz 8. Glossary +13 (123).

**Verify kiya:** object sizes (int 28 B, `{'id': 1}` 184 B...); traceback ordering bug pakda (stderr vs stdout) → `print_stack(file=sys.stdout)`; recursion limit 1000, 5000 levels → RecursionError, loop OK; refcount 1 → 2 → freed at `del also`; cycle sirf `gc.collect()` se; leaky 31 → 84 MB, bounded 14 MB flat; tracemalloc ne line 27/25 pakdi aur RSS double kiya (isliye alag mode); **OOM: exit 137, OOMKilled true** (student ki tarah default project naam se bhi); `ulimit -s` 8192; page size 4096 (container) / 16384 (M1); mutable default bug; shallow vs deep copy; dict clear ke baad RSS 137 → 12 MB.
- **Test bug pakda:** awk pattern `50,000` "150,000" se bhi match hua → arithmetic error → check na pass na fail, phir bhi ALL PASSED chhapa. Exact row match + numeric guard. CLAUDE.md me rule add kiya.
- **Diagram bug pakda:** deep recursion me saare arrows ek point par (mobile par bhadda, arth me galat) → sirf naye frame ka arrow.
- `mkdocs build --strict`, `check_site.py`, lab 8/8, screenshots (3 situations × 2 modes).

### 2026-11-21 — Session 9: Depth upgrade m00-04 + m01-01 (saare 6 lessons done)

**m00-04 Git and Docker** (~4,000 words): Git kyun (final_v2 files), commit kya record karta hai, hash, 3 jagah (working folder / staging / repository), Git vs GitHub; Docker kyun, image vs container, **container ≠ VM** (Mac `Darwin 25.0.0` vs container `Linux 6.12.54-linuxkit`), layers table (101 MB + 3.85 MB + 39 MB + 36 B), Docker shabdon ki table, 6 questions; pehle commits (status/diff/log ke asli outputs), `docker run` ka output line-by-line; under the hood: `git cat-file -p HEAD`, `.git`, `docker run` chain (client → Engine → containerd → runc), container lifecycle (`Exited (0)`), compose file line-by-line; 2 Going deeper (tags vs digests, namespaces + cgroups); 8 mistakes; cheat sheet. Lab: Tasks 5 (lifecycle), 6 (layers + kernel), 8 (pehle commits) naye; test me `Exited (0)` check. Quiz 8.

**m01-01 CPU, RAM and disk** (~3,750 words): parts table, fetch-decode-execute, GHz, registers, cores (M1 P/E cores), RAM (bytes, addresses, volatile), SSD vs HDD + blocks, **latency vs bandwidth** + speed-of-light floor (Mumbai ↔ US ≥ 125 ms), memory hierarchy table, **locality + cache lines**, analogy aur kahan tootti hai, units (bits vs bytes, Mbps → MB/s, KB vs KiB), 6 questions; code: speed_race step-by-step + naya `locality.py`; under the hood: fsync, `lscpu`/`nproc`/meminfo columns; 2 Going deeper (40 ms Nagle bug, latency numbers ka itihaas); 7 mistakes; cheat sheet. Lab Task 6 (locality + lscpu); test me locality check. Quiz 8.

**Verify kiya:** Git demo scratch folder me placeholder identity se (owner ki identity output me nahi); bina identity commit → `Author identity unknown / *** Please tell me who you are.` (debian container); `uname -sr` host vs container; `docker ps -a` → `Exited (0)`; `docker image history` + 4 layers; Engine components (containerd v2.2.0, runc 1.3.4, docker-init 0.19.0); image sizes; Mac: Apple M1, 8 cores (4P+4E), 8 GB, L1d 128 KB, L2 12 MB, cache line 128 B; container `lscpu`; locality 1.6 s vs 3.7 s aur 2.75 s vs 6.67 s (ratio 2.3–2.8x). Cheat sheet galti pakdi: lab image me `free` nahi hai → text theek kiya.
**Checks:** `mkdocs build --strict`, `check_site.py` 6/6 pages, `test_all_labs.sh` 6/6. Glossary 90 → 110.

### 2026-11-21 — Session 8: Depth upgrade (m00-01, m00-02, m00-03) + apna website design

**Depth upgrade (owner ne approve kiya):**
- **m00-01** (~30 min): app DB se seedha kyun nahi, 5 backend jobs + Bazaar business rules, HTTP request/response anatomy, methods table, status code families, JSON ke 6 types, backend dev ka din + roles, 6 questions, server.py step-by-step, log line ke columns, "jab backend tootta hai" (traceback), 2 Going deeper, cheat sheet. Lab: Task 7 (POST → 501), Task 8 (trailing comma → JSONDecodeError + curl 52). Test me POST check. Quiz 8.
- **m00-02** (~30 min): har level ka "after this level you can" + milestone, junior/mid/senior table, how to study, 5 questions, latency vs throughput (43 req/s), Little's Law (Going deeper), **CPU-bound + threads experiment**, 300 users optional task. Quiz 8. "cart" milestone galti theek ki (plan me nahi tha).
- **m00-03** (~30 min): interpreter → bytecode (`dis`), `__pycache__`, version life cycle / end of life, shell kya karta hai, environment variables + inheritance, PATH ke startup files aur "naya terminal kyun", multiple Pythons, pip `externally-managed-environment`, VS Code extension, 6 questions, symlink, 2 Going deeper, cheat sheet (Mac/Linux/Windows). Quiz 8.
- Glossary 64 → 90 terms.

**Verify kiya:** POST → `501 Unsupported method ('POST')`; trailing comma → `JSONDecodeError: Illegal trailing comma before end of array: line 6 column 100 (char 478)` + `curl: (52) Empty reply from server`; server band → `curl: (7) ... Connection refused`; CPU work + ThreadingHTTPServer → 100 users slowest 1504 ms; 300 users / 1 worker → slowest 7204 ms, koi refuse nahi; `dis` output 3.13; `__pycache__/shop.cpython-313.pyc`; Homebrew pip ka externally-managed message; env inheritance. Lab 1 test 7/7.

**Naya website design (owner request):**
- Material hataya; `theme/` me apna layout: sticky top bar (Course/Glossary/About, ⌘K search, light/dark), sidebar (levels → modules → lessons, ✓ marks), reading progress bar, lesson meta card, story blocks, code blocks + Copy, tables, tabs, "Going deeper" boxes, "On this page" scrollspy, prev/next cards, footer; home: hero + terminal card, "Continue where you left off" + progress meter, 6-level journey timeline (built modules link, baaki "Coming soon"), "How this course works"; 404 page; logo/favicon.
- **Bugs pakde/fix:** macros import bina context (`KeyError: 'page'`) → `with context`; search plugin ki `main.js` → `search_index_only`; course.css ke rem sizes 20% chhote → ×1.25; meta chips bikhre → card grid; module names "Coming soon" se dab rahe the → meta naam ke neeche; search box ka browser "✕".
- **Verify:** `mkdocs build --strict`, `check_site.py` 6/6 pages, Playwright (lesson complete → home par "Continue learning", "1 of 6 lessons done", ⌘K "zombie" → 6 results → Enter → sahi page, sidebar ✓), koi console error nahi, koi horizontal scroll nahi (390px), screenshots dekhe.

### 2026-11-21 — Session 7: Depth upgrade (owner feedback) — m01-02 sample

**Owner feedback:** explanation kam hai, topics chhote hain; student ko kahin aur na padhna pade.

**Kiya:**
- CLAUDE.md me **§4a Depth standard** (10 zaroori cheezein + self-check); reading time 25–40 min; quiz 5–10; DoD me depth check. `check_site.py` ab 5–10 quiz questions maanta hai.
- Memory me owner ki preference save ki (`course-content-depth`).
- **m01-02 dobara likha** (~5,100 words): program vs process, kernel + system calls, OS kya deta hai (table), family tree + fork/exec, process lifecycle (zombie, orphan), signals (table + exit codes −15/−9 vs 143/137), threads ka apna vs shared, scheduler + context switch steps, concurrency vs parallelism, GIL, analogy aur wo kahan fail hoti hai, **race condition** (timeline table + lock), real world (Gunicorn, PostgreSQL, Nginx, Celery, Redis, browser, Docker), 6 "Questions you may have", `ps`/`STAT`/`top` header/`VIRT RES SHR` column-by-column, `/proc`, `docker stop` internals, 2 "Going deeper" boxes, 7 common mistakes, cheat sheet (Linux/Mac/Windows).
- Lab 11 checks / 10 tasks: supervisor ab signal ka naam log karta hai, `kill` vs `kill -9`, request ka 4th thread, zombie (`make_zombie.py`), race condition (`last_earbuds.py`), `/proc`. Quiz 8 sawaal.

**Verify kiya (har naya claim chalakar):**
- `last_earbuds.py`: bina lock "sold 10 pairs" har baar (stock 6–7), lock ke saath 8/0. Host aur container dono.
- Supervisor logs: `died (signal SIGTERM)` / `died (signal SIGKILL)`.
- Shell exit codes 143 / 137. Python PID 1 bina init: `docker stop` → SIGKILL, exit 137 (events: kill 15 → kill 9); `--init` ke saath exit 143 turant.
- `StopTimeout=1` is Docker 29 par (python aur busybox dono) → lesson me fixed "10 s" nahi likha.
- Zombie: `Z [sleep] <defunct>`; `/report` ke dauraan `ps -T` me 4th thread `Rl 99%`; `/proc/7/status` numbers; `docker compose top`; Mac par `ps -eo ...command` aur PID 1 = launchd; is Mac par 611 processes.
- `mkdocs build --strict`, `check_site.py` (6 pages), `test_all_labs.sh` 6/6, page screenshots (Going deeper box, tables, cheat sheet).

### 2026-11-21 — Session 6: Module 1, Lesson 2 "Processes and threads"

**Kiya:**
- Lesson `02-processes-and-threads.md` (9 parts): OS, process (PID, own memory, PPID), thread (shared memory), food-court analogy, processes vs threads table, Gunicorn ki jhalak; under the hood: fork vs spawn, `ps` columns, cores vs threads, GIL ka zikr.
- Diagram `processes-threads.js`: 2 situations (sharing memory / something goes wrong: kill → supervisor restart, bad thread → ₹-1).
- Lab `labs/01-how-computers-work/02-processes-and-threads/`: `bazaar_shop.py` (3 threads + supervisor jo dead workers restart karta hai), 2 `email_worker.py`, `image_cache.py` (100 MB), Dockerfile (procps). Tasks: `ps`, `ps -T`, `curl` (threads: 4), `kill`, `top` during `/report`, `share_or_not.py`, `free -m`.
- Code example `share_or_not.py`. Quiz `m01-02`. Glossary me 9 naye terms (64 total); "Thread" ki definition update.

**Verify kiya:**
- `ps`: PID 7 ke 3 children (PPID 7), NLWP 3, image-cache RSS ~110 MB.
- Worker kill → supervisor ne naya PID (44 / 58 / 69) start kiya, baaki processes chalte rahe.
- `/report` ke dauraan `top`: PID 7 ~100% CPU (ek core); total `%Cpu(s)` ~13%.
- `share_or_not.py`: Linux (fork) me processes "4 items", Mac host (spawn) par "1 item"; dono me main = 3. Lesson me dono samjhaye.
- Common mistake #4 ka claim test kiya: guard ke bina Mac par `RuntimeError` aata hai (infinite loop nahi). Text theek kiya.
- README ka `kill` error message asli run se match kiya (`kill: (999): No such process`).
- `test_all_labs.sh` → 6/6; `check_site.py` → 6 pages; diagram ki dono situations dono modes me (5/5 steps), screenshots dekhe.

### 2026-11-21 — Session 5: Module 1, Lesson 1 "CPU, RAM and disk"

**Kiya:**
- Module 1 shuru: `docs/01-how-computers-work/index.md` (5 lessons ki list), nav me Module 1.
- Lesson `01-cpu-ram-and-disk.md` (9 parts): CPU/cores, RAM, SSD, network, cache; chef analogy; speeds alag kyun (distance, cost, remembering); time units; Bazaar ke 3 rules (busy data RAM me, important data disk par, network trips gino).
- Diagram `memory-race.js`: 5 jagah se price laana, real time ↔ human time (1 ns = 1 s).
- Lab `labs/01-how-computers-work/01-cpu-ram-and-disk/`: `speed_race.py` (RAM dict, disk read, fsync save, network to `inventory-service`), volume par orders, fsync hatane ka experiment, `nproc` / `MemTotal`.
- Quiz `m01-01`, glossary me 13 naye terms (55 total). Module 0 Lesson 4 → Module 1 link.
- Kit: `dir` option for arrows.

**Verify kiya:**
- Race 3+ baar chalayi; numbers stable (RAM ~53 ns, disk read ~83 µs, fsync ~335 µs, network ~150 µs).
- **Bug pakda:** pehle network 43 ms aa raha tha (Nagle + delayed ACK). `disable_nagle_algorithm` se ~150 µs.
- fsync hata kar: ~893 ns. Volume par orders 300 → 600 (container hatne ke baad bhi).
- Lesson ka claim "disk read ka zyada time shared folder ka hai" naapkar verify kiya: bind mount 74 µs, container ka apna folder 4.4 µs, khuli file 1.7 µs. Lesson me yahi table hai.
- README ka "Stuck?" item galat nikla (`compose run` `depends_on` khud start karta hai), use hata diya.
- **Diagram bugs pakde:** human-time toggle galat step par ja raha tha (off-by-one); mobile par arrows boxes ke beech se. Dono fix karke screenshots dobara dekhe.
- `test_all_labs.sh` → 5/5; `check_site.py` → 5 pages pass.

### 2026-11-21 — Session 4: Lesson m00-04 "Installing Git and Docker" (Module 0 complete)

**Kiya:**
- Lesson `docs/00-setup/04-installing-git-and-docker.md` (9 parts): Git = save points (commit), GitHub; Docker image/container (tiffin analogy), Engine, Desktop, Hub, Compose; Docker kyun ("works on my laptop"); install tabs Mac/Windows/Linux; pehla container; `docker version` client/server; daemon.
- Diagram `docker-run.js`: 3 situations (first run → pull, second run → cached, Docker not running).
- Lab `labs/00-setup/04-installing-git-and-docker/`: `docker run`, `time` se fast second run, `docker images`, pehli Compose service (`welcome`), git identity, aur **`verify_setup.sh`** (Python ≥ 3.13, Git, identity, Docker, Engine, Compose, real container, `code` command).
- Quiz `m00-04`, glossary me 12 naye terms (42 total). Lesson 3 → 4 link, nav, Module 0 index final.
- CI `test-labs.yml` me Python 3.13 setup.
- **Kit fix:** `setBoxSub`, jisse label aur sub-text overlap nahi karte. Docker diagram ka desktop layout "plus" shape me kiya (seedhe arrows).

**Verify kiya:**
- Real outputs: pehla `docker run` (pull, 3.51 s), doosra (0.21 s), `docker images`, Docker band hone ka error (`DOCKER_HOST` ko galat socket par point karke), versions, `docker compose run welcome`.
- `verify_setup.sh` teen haalat me: sab theek (exit 0), Docker band (2 ✗, exit 1), sirf purana Mac Python 3.9.6 PATH me (`✗ Python is too old`).
- `test_all_labs.sh` → 4/4 (found: 4). `check_site.py` → 4 pages pass (kit change ke baad sab dobara). Docker diagram ki teeno situations dono modes me chalaye (7/6/3 steps), screenshots dekhe.

**Verify nahi hua:**
- Linux par `get.docker.com` install container me chalane ki permission nahi mili (auto-mode classifier ne roka). Lesson me official docs ka link diya hai.
- Mac/Windows Docker Desktop, Git for Windows aur WSL ke GUI steps automate nahi ho sakte.

### 2026-11-21 — Session 3: Lesson m00-03 "Installing Python and VS Code"

**Kiya:**
- Lesson `docs/00-setup/03-installing-python-and-vscode.md` (9 parts): interpreter, editor, terminal/shell, PATH, version numbers; macOS / Windows / Linux install tabs; VS Code + Python extension + Select Interpreter + `code` command.
- Diagram `path-lookup.js`: shell PATH folders me order se search karta hai; 3 situations (installed / old Mac Python 3.9 / nothing).
- Lab `labs/00-setup/03-installing-python-and-vscode/`: `python` (3.13.18) aur `old-python` (3.12.16) services; `which`, `echo $PATH`, PATH todna (exit 127), full path, purana Python reject; Task 6 student ke apne computer par.
- Code example `check_python.py` (version check + Asha's cart total ₹1247, exit code 1 agar Python < 3.13).
- Quiz `m00-03`, glossary me 8 naye terms (30 total). Lesson 2 → Lesson 3 link, nav, Module 0 index.
- **Bug fix:** `scripts/test_all_labs.sh` lab 3 ko skip kar raha tha (lab 2 ka `compose run` stdin kha gaya). Runner dobara likha (`</dev/null`, aur ran-count guard). Lab 2 ke test me `-T` add kiya. CLAUDE.md me rule add kiya.

**Verify kiya:**
- `check_python.py`: host (3.14.7, Ready), Docker 3.13.18 (Ready), Docker 3.12 (Not ready, exit 1).
- Lab ke saare commands TTY ke saath student ki tarah chalaye; README me wahi real output hai.
- `test_all_labs.sh` → 3/3 pass (found: 3).
- `check_site.py` pass; teeno diagram situations dono modes me Playwright se chalaye (5/6/6 steps, sahi result), screenshots dekhe.
- Is Mac par `/usr/bin/python3 --version` = 3.9.6 (macOS 26.0.1), jo diagram ke claim se match karta hai.
- Linux commands containers me chalaye: Ubuntu 24.04 + deadsnakes → Python 3.13.18 ✅; Fedora 43 + `dnf install python3.13` → Python 3.13.18 ✅.

**Verify nahi ho sakta (honestly):**
- macOS/Windows python.org installer aur VS Code ke GUI steps yahan se automate nahi ho sakte. Ye official installers ke known flow par likhe hain; kisi asli Windows machine par ek baar manually check karna chahiye.

### 2026-11-21 — Session 2: Lesson m00-02 "The full roadmap"

**Kiya:**
- Lesson `docs/00-setup/02-the-full-roadmap.md` (9 parts): startup-story approach, house analogy, 6-level table, Python/Django kyun (aur Node.js/FastAPI kyun nahi), lesson format.
- Diagram `course-roadmap.js`: 6 levels ki staircase, har step par users + problem + tools; level par click/Enter se jump; phone par vertical layout.
- Lab `labs/00-setup/02-the-full-roadmap/`: one-worker backend (20 ms fake DB) + `users` crowd service (1/10/50/100 users). Task 3: `ThreadingHTTPServer` par switch karke fark dekhna.
- Quiz `m00-02`, glossary me 7 naye terms (API, Bottleneck, Framework, Queue, Scaling, Thread, Worker).
- Lesson 1 ka "What's next" ab Lesson 2 se link hai; Module 0 index + nav updated.
- **Bug fix (dono labs):** host port ab `BAZAAR_PORT` se aata hai, aur test free port chunta hai. Lab 1 README ka "Stuck?" section bhi isi hisaab se update kiya.

**Verify kiya:**
- `mkdocs build --strict` pass.
- `scripts/test_all_labs.sh`: 2/2 labs pass (`mkdocs serve` port 8000 par chalte hue bhi).
- Lab 2 ke tasks student ki tarah asli folder me chalaye: Task 1 output match, Task 2 me 100 users par ~2380 ms, Task 3 (threaded) me ~65 ms. Har run me yahi pattern aaya.
- `scripts/check_site.py 00-setup`: dono lessons, desktop-light + mobile-dark, sab pass; screenshots dekhe.
- Click aur keyboard (Enter) se level jump Playwright se check kiya; console me koi error nahi.
- README ka ek "Stuck?" item galat nikla (`docker compose up users` asal me chalta hai), isliye use hata diya.

**Pending:**
- Lesson 2 → Lesson 3 link (Lesson 3 bante hi).
- Per-level user counts owner se confirm karne hain.

### 2026-11-21 — Session 1: Phase 1 foundation + pilot lesson

**Kiya:**
- `CLAUDE.md` banaya (rules, Bazaar canon, 9-part template, diagram/quiz/lab contracts, versions, DoD, commands).
- `PLAN.md` (master plan copy), `PROGRESS.md` (ye file).
- MkDocs Material site: `mkdocs.yml` (strict, dark/light toggle), home, About, Glossary, Module 0 index.
- `course.css`, `progress.js` (localStorage progress, quiz renderer, lesson-complete button, home summary).
- `diagram-kit.js` (boxes, arrows, zones, packets, step controller, inputs, narrow layout, lazy loading).
- Pilot lesson **m00-01 "What a backend developer does"**: 9 parts, `request-journey` diagram (search vs order), quiz, lab.
- Lab `00-setup/01`: tiny Bazaar backend (stdlib Python) in Docker + README with real outputs + `test_lab.sh`.
- Templates (`templates/`), `scripts/test_all_labs.sh`, GitHub workflows, `.gitignore`.

**Verify kiya:**
- `mkdocs build --strict` → pass, 0 warnings.
- `bash scripts/test_all_labs.sh` → 1/1 labs pass (6/6 checks).
- Code example `bazaar_rules.py` host Python 3.14 aur `python:3.13.18-slim-trixie` dono me chalaya, output lesson me real run se.
- Playwright (Chrome headless): 33/33 checks (desktop-light + mobile-dark): diagram steps, Back, Play/Pause, input reset, narrow layout, quiz score, best score save, complete button reload, home summary, no horizontal scroll, 0 console errors.
- Screenshots dekhe: dark mode bug pakda aur fix kiya (CSS tokens `:root` → `[data-md-color-scheme]`), mobile par text overlap fix (SVG text halo).

**Pending / notes:**
- Git commit abhi nahi kiya (owner ki permission ka intezaar).
- Workflows GitHub par push ke baad hi verify honge.
- Browser test ko generic bana kar `scripts/check_site.py` me daala (har page ke har diagram/quiz ko desktop-light + mobile-dark me check karta hai, screenshots `site-screens/` me). Playwright 1.65.2 pinned (`requirements-dev.txt`), system Chrome use karta hai.
