# CLAUDE.md — Backend Mastery Course

This file is the rulebook for Claude Code in this repo. Read it fully before any work.
`PLAN.md` is the full course plan (what to build). `PROGRESS.md` is the build log (what is done).
This file says **how** to build it.

---

## 0. Start-of-session and end-of-session ritual (never skip)

**At the start of every session:**

1. Read `CLAUDE.md` (this file), then `PROGRESS.md`.
2. Find the task in `PROGRESS.md` → "Next up". Do not start random work.
3. If the task touches a module, read that module's section in `PLAN.md`.

**At the end of every session (or after every finished lesson/component):**

1. Update `PROGRESS.md`:
   - tick the lesson/component in the tracker tables,
   - add a dated entry in "Session log" (what was done, what was verified, what is pending),
   - update "Next up",
   - add any new decision to "Decisions log", and any new pinned version to "Pinned versions".
2. Nothing is "done" in `PROGRESS.md` unless its checks passed (see §9).

If you change a rule in this file, also add a line to the "Decisions log" in `PROGRESS.md`.

---

## 1. What this project is

A free, static website that teaches backend engineering from zero to senior/architect level:
Python, Django, PostgreSQL, Docker, multi-server systems, and database sharding.

- Site: **our own design** (templates, CSS and JS in `theme/`), built with MkDocs as the Markdown
  engine, plus custom JavaScript diagrams. Hosted on **GitHub Pages**. No backend.
- Practice: student runs every lab on their own machine with `docker compose up`.
- Progress: saved in the browser with `localStorage` (lessons done, quiz scores).
- Curriculum: 6 levels, 38 modules (0–37). See `PLAN.md`.

## 2. THE most important rule: everything is Bazaar

There is exactly **one** app in this whole course: **Bazaar**, an online marketplace where
sellers sell products and customers place orders.

- Every lesson, code example, diagram, lab, quiz and SQL dataset uses Bazaar.
  **No** todo apps, blogs, school examples, "foo/bar", "Service A / Table X".
- Use real Bazaar names: `products`, `orders`, `order_items`, `sellers`, `checkout` view,
  `order-service`, `payment-service`, `inventory-service`.
- The course is a startup story. Bazaar starts small, users grow (1 → 1 crore users),
  and each new level brings a real problem. That problem introduces the next tool.
- Every lesson must answer three questions:
  1. What problem did Bazaar hit?
  2. Why did we choose this tool/concept?
  3. Which alternative did we not choose, and why? (Use the tool table in `PLAN.md`.)
- Code evolves in one repo, `bazaar-app/`. Each module has two git tags:
  `mNN-start` and `mNN-end`. New code always builds on the previous module's `end` tag.

### Canonical Bazaar data (keep consistent everywhere)

Reuse these names so the story feels like one world. Add to this list, never contradict it.

- Sellers: `Sharma Electronics`, `Meera Handloom`, `Patel Spices`, `Kumar Footwear`
- Customers: `Asha`, `Ravi`, `Fatima`, `John`, `Priya`
- Bazaar's developers (Git authors, team members from Module 3 on): `Neha Kapoor` (backend, the first developer),
  `Rohan Mehta` (joins later; the second author in merge conflicts). Email domain: `@bazaar.example`.
- Products: `Red Running Shoes` (₹999), `Cotton Kurta` (₹649), `Masala Box` (₹299),
  `Wireless Earbuds` (₹1,499), `Steel Water Bottle` (₹349)
- Digital product (from Module 5): `Bazaar Gift Card` (₹500), sold by Bazaar itself; no stock limit, no delivery.
- Money: always INR (₹). In code, store money as integer paise or `Decimal`, never `float`.
- Big events: "Diwali sale" is the classic traffic spike.

## 3. Writing style (for the website content)

The site content is in **simple English**, like a kind teacher explaining in class.

- Sentences under **20 words**. One idea per paragraph.
- Talk to the student as "you". Friendly tone: "Let's understand this with a small example."
- Explain **why** first, then **how**. Give one real-life analogy per concept
  (e.g. sharding = separate cupboards in a library).
- Never use a technical word without explaining it. The first time a new term appears,
  give a 1-line definition **and** add it to `docs/glossary.md` (alphabetical).
- Prefer short lists and small examples over long paragraphs.
- No Hinglish on the website. (Hinglish is fine in chat with the course owner.)

## 4. Lesson template (every lesson, exactly these 9 parts)

File name: `docs/NN-module-slug/NN-topic-name.md`, e.g. `docs/31-sharding/05-hash-sharding.md`.
Copy `templates/lesson-template.md` to start. Use these exact H2 headings, in this order:

```
# <Lesson title>
<lesson-meta box: module, lesson, time to read, what you will build>
> **Previously in Bazaar:** 2 lines recap.

## 1. Why learn this?          (a real Bazaar problem, 2–3 lines)
## 2. The concept              (simple English, why → how, one analogy)
## 3. See it in action         (interactive diagram)
## 4. Code example             (small, complete, runnable, comments on key lines)
## 5. Under the hood           (generated SQL, packets, container logs, etc.)
## 6. Lab                      (link to labs/<module>/<lesson>/ + short steps + expected output)
## 7. Common mistakes          (3–5 mistakes and their fix)
## 8. Quiz                     (5–10 MCQs, each with an explanation)
## 9. What's next              (link to next lesson + 1-line summary)

> **Next in Bazaar:** teaser of the next problem.
<lesson-complete button>
```

- One lesson = one concept, in **two layers** (see §4a): an easy core of about 10–15 minutes, plus optional
  Going-deeper boxes. If the core gets too big, split the concept into two lessons.
- Code examples: complete and runnable. **Never** use `...` or half code.
  Add comments on every important line.
- Every code example must be actually run and tested before it is published.
- Code examples live as real files in the lab folder: `labs/<module>/<lesson>/examples/`.
  The lesson **includes** the file instead of copying it, so published code = tested code:
  ````
  ```python title="bazaar_rules.py"
  --8<-- "labs/00-setup/01-what-a-backend-developer-does/examples/bazaar_rules.py"
  ```
  ````
  Program output shown in a lesson must be pasted from a real run, never written by hand.

## 4a. Two-layer standard (easy first, deep second)

Owner feedback, in order: (1) "explanation kam hai, student ko kahin aur na padhna pade"; then, after very deep
lessons: (2) "content samajh hi nahi aa raha, ye advanced walon ke liye hai" — **topics too advanced, too many
new words at once**. So every lesson has TWO layers. Depth is never deleted; it is **moved** out of the way.

### Layer 1: the core (what every beginner reads)

- **Start with "In 1 minute"**: right after the meta card, an admonition `!!! abstract "In 1 minute"` with
  3–5 short bullets: the whole lesson in plain words. A beginner who reads only this box should get the idea.
- **One idea at a time.** Each H3 in part 2 teaches ONE thing, with a Bazaar example, before the next.
- **New-word budget: at most ~5 new technical terms in the core**, each explained in an everyday sentence
  the first time (and in the glossary). If a lesson needs more, the extra ones go to Layer 2.
- **Only what the lab needs.** Ask: "does a beginner need this to do this lesson's lab?" If not → Layer 2.
- **Everyday language first, technical name second**: "the file's record card (called an *inode*)".
- **Short**: the core of part 2 should read in about 10–15 minutes. Prefer a small table or a picture over
  a long paragraph. No wall-of-text tables with 10 rows in the core; keep the 3–4 rows that matter.
- Keep: why it exists (a real Bazaar problem), one analogy, worked examples with real outputs, common
  mistakes with real error messages, the cheat sheet, "Questions you may have" (beginner questions only).

### Layer 2: going deeper (optional, collapsible)

- Everything advanced goes into `??? note "Going deeper: <topic>"` boxes: internals (kernel steps,
  fork/exec, inodes beyond the basics), rare options, special bits (setuid, ACLs), history, edge cases,
  performance details, "where the analogy breaks" when it needs technical detail.
- A Going-deeper box must never be required to do the lab or the quiz's first 5 questions.
- Quizzes: the first questions test the core; at most 2–3 may test Going-deeper material, and say so.

### Self-check before marking a lesson done

1. Read only the "In 1 minute" box and the core: would a complete beginner follow it, without googling?
2. Count the new technical terms in the core: about 5 or fewer?
3. Open every Going-deeper box: is the full depth still there for advanced readers?

## 5. Interactive diagrams

- Plain JavaScript + SVG. One diagram per file: `docs/assets/diagrams/<name>.js`.
- Every diagram uses the shared library `docs/assets/diagrams/diagram-kit.js`.
  Never draw controls, boxes, arrows or packets by hand outside the kit.
- Embed in a lesson with:
  ```html
  <div class="bz-diagram" data-diagram="<name>"></div>
  ```
  The kit lazy-loads `diagrams/<name>.js` automatically. No changes to `mkdocs.yml` needed.
  To reuse one diagram in several lessons with a different starting situation, add `data-state-<key>="value"`
  (e.g. `data-state-sit="merge"` sets `state.sit`). Don't copy a diagram file just to change its default.
- Controls (given by the kit): **Play / Pause / Back / Next / Reset** + speed slider.
- Every step has a caption shown under the diagram ("what is happening now").
- Where possible, add user input (e.g. "enter a user_id, see which shard it goes to",
  "crash a server, see what the load balancer does").
- Must look right in **light and dark mode** (use kit CSS classes / CSS variables only,
  no hard-coded colors) and work on **mobile** (SVG uses `viewBox`, width 100%).
  Design tokens (`--bg`, `--text`, `--brand`, ...) live in `theme/css/site.css` on `:root` and
  `:root[data-theme="dark"]`. `course.css` maps its `--bz-*` tokens onto them.
- Use `s.narrow` in `scene()` to give phones a top-to-bottom layout (see `size()`).
  Keep text inside the SVG short on narrow layouts.
- Arrows must never cut through other boxes. When one box fans out to many, pass
  `dir: "h"` (or `"v"`) to `s.arrow()`. Prefer straight lines ("plus" layouts) over diagonals.
- If a control jumps to a step (`api.goTo(i)`), count the steps: intro + middle steps + summary.
- Lab servers built on Python's `http.server` with HTTP/1.1 keep-alive must set
  `disable_nagle_algorithm = True`, or every request stalls ~40 ms (Nagle + delayed ACK).
- Verify every diagram in a real browser (desktop-light + mobile-dark screenshots),
  not just `mkdocs build`. Look at the screenshots before marking it done.
- Labels use Bazaar names.
- API reference lives at the top of `diagram-kit.js`. Look at
  `docs/assets/diagrams/request-journey.js` as the reference example.

## 5a. The website design (`theme/`)

- `theme/main.html` = layout of every page (top bar, sidebar, lesson column, "On this page", prev/next, search).
  `theme/home.html` = the home page (`docs/index.md` sets `template: home.html`). `theme/macros.html` =
  shared macros (lesson id `mNN-LL` from the file path, sidebar tree). `theme/css/site.css` = the whole
  design system. `theme/js/site.js` = theme toggle, menu, reading progress, TOC highlight, copy buttons,
  ✓ marks, "continue where you left off", search (Ctrl/⌘+K, reads `search/search_index.json`).
- Levels and module names on the home page come from `extra.levels` in `mkdocs.yml`. A module appears
  as a link as soon as its nav section exists (title must start with `"<number>. "`).
- Lesson files must be at `docs/NN-module/NN-topic.md`: the lesson id, sidebar ✓ and progress depend on it.
- If you add a new Markdown extension or HTML element, add its styles to `site.css` (light + dark) and
  check it in a screenshot. There is no ready-made theme to style it for you.
- Every UI change: `mkdocs build --strict`, `scripts/check_site.py`, and look at desktop-light and
  mobile-dark screenshots, including the home page.

## 6. Quizzes

- 5–10 MCQs per lesson (deeper lessons get more). Every question has an explanation for the correct answer.
- Quiz data lives in `docs/assets/quizzes/<quiz-id>.json`. Quiz id = `mNN-LL`
  (e.g. `m00-01`). Embed with:
  ```html
  <div class="bz-quiz" data-quiz="m00-01"></div>
  ```
- JSON shape:
  ```json
  { "title": "...", "questions": [
      { "q": "...", "options": ["a","b","c","d"], "answer": 1, "explain": "..." } ] }
  ```
  `answer` is the 0-based index of the correct option.
- Scores are saved by `docs/assets/js/progress.js` in `localStorage`.

## 7. Labs

Path: `labs/NN-module-slug/NN-topic-name/` (mirrors the lesson path). Each lab has:

- `docker-compose.yml` — the whole lab starts with `docker compose up`.
- `app/` — the code (Bazaar code only).
- `README.md` — goal, prerequisites, step-by-step tasks, **expected output** for every step,
  "stuck?" section, cleanup command.
- `test_lab.sh` — automated check. Contract:
  - `#!/usr/bin/env bash` + `set -euo pipefail`, runs from any directory (`cd "$(dirname "$0")"`).
  - Starts the lab, waits for it with a timeout (no blind `sleep`), checks real output,
    prints `PASS: ...` / `FAIL: ...`, exits `0` only if every check passed.
  - Always cleans up (`trap 'docker compose down -v' EXIT`).
  - Uses a unique compose project name: `-p bz-mNN-LL`.
  - Docker Compose prints progress ("Network … Creating") on stderr the first time. Never let it into output you compare:
    join the program's own stderr **inside** the container (`sh -c 'python3 "$@" 2>&1'`) and drop compose's stderr.
  - Always `docker compose run --rm -T ...` inside tests (`-T` = no TTY, and it does not
    read stdin; without it, one lab can swallow the runner's list and others silently skip).
  - Lab READMEs are read on GitHub too: no MkDocs-only syntax (`===` tabs, admonitions) in them.
  - When a check parses numbers from output, match the exact row (e.g. `50000` must not also match `150000`)
    and verify the value is a number before comparing. A broken parse must FAIL, never be skipped silently.
  - Helpers that run commands which are EXPECTED to fail must not stop the script: with `set -e`,
    `out=$(failing_cmd)` exits immediately. End such helpers with `|| true` and let the checks decide.
  - A check must be able to fail. For any check of real logic, break the code once on purpose and confirm
    the check FAILS (then restore it). "oldest < newest"-style checks that are always true are not checks.
- A lesson is **not done** until `test_lab.sh` was run by Claude Code and passed.
- Host ports always come from env vars with a default: `"${BAZAAR_PORT:-8000}:8000"`
  (later `POSTGRES_PORT`, `REDIS_PORT`, same pattern). `test_lab.sh` picks a free port itself
  (see `templates/test_lab.sh`), so tests never hit something else running on 8000
  (e.g. `mkdocs serve`). Record ports in the lab table in `PROGRESS.md`.
- Walk through the README tasks yourself, exactly as a student would, and paste real output.
  Never invent error messages for "Stuck?"; only list errors you actually reproduced or know for sure.

## 8. Versions (pinned, never "latest")

- Python **3.13**, Django **5.2 LTS**, DRF (pin exact version when first used),
  PostgreSQL **17**, Redis **7**.
- Docker images always use exact tags (e.g. `python:3.13-slim`, `postgres:17.6`),
  never `:latest`. Python packages pinned with `==` in `requirements.txt`.
- When a new tool/version is first used, add it to "Pinned versions" in `PROGRESS.md`
  and reuse that exact version everywhere after.

## 9. Definition of done (check before marking anything done)

- [ ] All 9 template parts present, in order, with the exact headings.
- [ ] Two-layer standard (§4a) met: "In 1 minute" box, ~5 new terms max in the core, advanced material
      only in "Going deeper" boxes, cheat sheet.
- [ ] Every code example was run and tested.
- [ ] Lab `test_lab.sh` passed; README has expected output.
- [ ] Diagram works on desktop and mobile, light and dark mode; uses `diagram-kit.js`.
      (`scripts/check_site.py` passes AND you looked at the screenshots.)
- [ ] Quiz has 5–10 questions, each with an explanation.
- [ ] New terms added to `docs/glossary.md`.
- [ ] Lesson added to `nav` in `mkdocs.yml`.
- [ ] `mkdocs build --strict` passes with no warnings.
- [ ] Read once with a beginner's eyes: no term used without explanation.
- [ ] `PROGRESS.md` updated.

## 10. Commands

```bash
# one-time setup (website tooling)
uv venv .venv && uv pip install -r requirements-docs.txt

# preview the site at http://127.0.0.1:8000/backend_mastery/
.venv/bin/mkdocs serve

# strict build (must pass before any lesson is done)
.venv/bin/mkdocs build --strict

# run one lab test
bash labs/00-setup/01-what-a-backend-developer-does/test_lab.sh

# run all lab tests
bash scripts/test_all_labs.sh

# browser check: every diagram + quiz, desktop-light and mobile-dark, + screenshots
uv venv .venv-dev --python 3.13 && uv pip install -r requirements-dev.txt --python .venv-dev/bin/python  # once
.venv/bin/mkdocs build --strict && .venv-dev/bin/python scripts/check_site.py [url-filter]
# then LOOK at site-screens/*.png before marking a diagram done
```

## 11. Repo map

```
CLAUDE.md                 rules (this file)
PLAN.md                   full course plan (source of truth for content)
PROGRESS.md               build log + trackers (update every session)
mkdocs.yml                site config + nav + extra.levels (home page data)
requirements-docs.txt     pinned MkDocs + Markdown extensions
theme/                    OUR website design: main.html, home.html, macros.html, 404.html,
                          css/site.css, js/site.js, img/
templates/                lesson, lab README and test_lab.sh templates
docs/
  index.md, glossary.md, about.md
  NN-module-slug/NN-topic.md       lessons
  assets/css/course.css            all custom styles (theme-aware)
  assets/js/progress.js            localStorage progress + quizzes
  assets/diagrams/diagram-kit.js   shared diagram library
  assets/diagrams/<name>.js        one file per diagram
  assets/quizzes/<quiz-id>.json    quiz data
  assets/playground/               SQL Playground (Module 14)
labs/NN-module-slug/NN-topic/      runnable labs
scripts/                           helper scripts (test_all_labs.sh)
.github/workflows/                 deploy.yml, test-labs.yml
```

## 12. Do not

- Do not copy content from SQLBolt or any other site. It is only inspiration (credit on site).
- Do not add a backend to the website. Everything must work as static files.
- Do not add a new JS/CSS library without pinning its version and logging it in `PROGRESS.md`.
- Do not mark anything done without running its checks.
- Do not invent new Bazaar characters/products if a canonical one fits (§2).
