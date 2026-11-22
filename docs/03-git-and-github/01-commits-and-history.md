# Commits and history

<div class="bz-meta" markdown>
**Module** 3 · Git and GitHub
**Lesson** 1
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's first Git repository: two real commits, a `.gitignore` that keeps the password file out, and an undo
</div>

!!! abstract "In 1 minute"
    - Tell Git who you are once (`git config`), then turn a folder into a repository with `git init`.
    - The daily loop: change files → `git status` (what changed?) → `git add` (choose) → `git commit -m "why"` (save).
    - `git diff` shows the exact lines you changed. `git log` shows the history, newest first.
    - A `.gitignore` file lists files Git must never save, like `.env` with Bazaar's database password.
    - `git restore <file>` throws away a bad edit and brings back the last committed version.

> **Previously in Bazaar:** Bazaar runs on its Linux server as a systemd service, and restarts itself after a crash.

## 1. Why learn this?

Bazaar's code lives in one folder on Neha's laptop. Neha Kapoor is Bazaar's first backend developer.

Last Friday she changed the catalog, broke it, and couldn't remember what it looked like before. She also nearly emailed the
whole folder to a friend, including `.env`, the file with the database password.

Git fixes both. In Module 0 you met the idea: commits are save points. Now you'll use Git for real, on Bazaar's code.

## 2. The concept

### A quick recap from Module 0

- A **commit** is a save point: a snapshot of your files, a message, an author, a time, and a link to the commit before it (its **parent**).
- Each commit has an ID, its **hash**, like `e13a128`.
- Git has three places: the **working folder** (your files), the **staging area** (changes chosen for the next commit),
  and the **repository** (all commits, inside the hidden `.git` folder).

### Step 0: tell Git who you are (once per computer)

Every commit records an author. So Git needs your name and email first:

```bash
git config --global user.name "Neha Kapoor"
git config --global user.email "neha@bazaar.example"
git config --global init.defaultBranch main
```

`--global` means "for every repository on this computer". The last line names the first branch `main` (Lesson 2 explains branches).
Without a name and email, `git commit` stops with `Author identity unknown`.

### Step 1: `git init` and `git status`

`git init` turns the current folder into a repository. It creates the hidden `.git` folder, where all history will live.

```
$ git init
Initialized empty Git repository in /bazaar/.git/
```

`git status` is the question you'll ask most often: "What's going on?"

```
$ git status
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.env
	README.md
	products.py
```

**Untracked** means "Git sees this file but isn't saving it yet". Notice `.env`. We must never save that one.

### Step 2: `.gitignore`: files Git must never save

A file named `.gitignore` lists names Git should pretend not to see. One name or pattern per line:

```
.env
__pycache__/
```

- `.env` holds secrets, like the database password. A secret in Git stays in the history forever, for everyone who copies the repository.
- `__pycache__/` holds files Python creates by itself. They are rebuilt anyway, so saving them is just noise.

Now `.env` is gone from the list:

```
$ git status --short
?? .gitignore
?? README.md
?? products.py
```

(`--short` gives one line per file. `??` means untracked.)

### Step 3: `git add` and `git commit`

```bash
git add .                                       # put every changed file on the stage (. = this folder)
git commit -m "Add product catalog with 4 products"
```

```
[main (root-commit) c42ea64] Add product catalog with 4 products
 3 files changed, 22 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
 create mode 100644 products.py
```

`root-commit` means the very first commit: it has no parent. `c42ea64` is its hash. Yours will be different.

### Step 4: change, `git diff`, commit again

Neha adds the Steel Water Bottle to the catalog. Before saving, she checks exactly what she changed:

```
$ git diff
diff --git a/products.py b/products.py
index 0b7db13..a34a9c7 100644
--- a/products.py
+++ b/products.py
@@ -5,6 +5,7 @@ PRODUCTS = [
     {"name": "Cotton Kurta", "price_paise": 64900, "seller": "Meera Handloom"},
     {"name": "Masala Box", "price_paise": 29900, "seller": "Patel Spices"},
     {"name": "Wireless Earbuds", "price_paise": 149900, "seller": "Sharma Electronics"},
+    {"name": "Steel Water Bottle", "price_paise": 34900, "seller": "Sharma Electronics"},
 ]
```

How to read a **diff** (a list of differences):

- A line starting with `+` was **added**. A line starting with `-` was **removed**.
- Lines with a space in front didn't change. They are shown only so you can see where you are.

Then: `git add products.py` and `git commit -m "Add Steel Water Bottle to the catalog"`.

### Step 5: `git log`: the history

```
$ git log --oneline
e13a128 Add Steel Water Bottle to the catalog
c42ea64 Add product catalog with 4 products
```

Newest first. Plain `git log` shows the full hash, the author and the date too.

### Step 6: `git restore`: undo a bad edit

By mistake, Neha overwrites the file: `echo oops > products.py`. The catalog is gone!

```bash
git restore products.py     # bring back the version from the last commit
```

The file is back, exactly as it was in `e13a128`. `git status` says `nothing to commit, working tree clean`.

**Careful:** `restore` throws away your uncommitted changes to that file, and they can't come back. Commit often, so there's always a recent save point.

### Good commit messages

In six months, `git log` is how you (and your team) find out **why** something changed. Compare:

| Bad | Good |
| --- | --- |
| `fix` | `Fix checkout crash when the cart is empty` |
| `changes` | `Add Steel Water Bottle to the catalog` |
| `asdf` | `Show prices in rupees, not paise, in the catalog` |

The rules most teams follow:

1. Write it like an order: "**Add** …", "**Fix** …", not "Added …" or "Fixes …". Read it as "This commit will **add** …".
2. Keep the first line short: about 50 characters, at most 72.
3. One commit = one logical change. "Add bottle and fix checkout and rename files" should be three commits.

### An analogy

Git is a **shop's account book (bahi-khata)**.

- The working folder is your rough notepad on the counter: you scribble freely.
- `git add` is choosing which notes go into the book today.
- `git commit` writes them into the book, in ink, with the date and your signature.
- `git log` is reading the book backwards, page by page. `.gitignore` is the list of things that never go in the book, like the locker code.

### Questions you may have

**Do I commit after every line?** No. Commit after each small, complete step that works: "added a product", "fixed the total". Many times a day is normal.

**Is `git add .` dangerous?** Only without a good `.gitignore`. Always run `git status` before `git commit`, and read the list.

**Is my code on the internet now?** No. Everything so far is only in the `.git` folder on your computer. GitHub comes in Lesson 5.

**What if I already committed `.env`?** Change the password at once, because it's in the history now. See the Going-deeper box "Undoing things".

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="git-three-places"></div>

## 4. Code example

Bazaar's catalog, version 0: the file you'll commit in the lab. Prices are integer paise, never `float` (₹1 = 100 paise).

```python title="products.py"
--8<-- "labs/03-git-and-github/01-commits-and-history/starter/products.py"
```

The whole lesson as you'll type it in the lab:

```bash
git config --global user.name "Neha Kapoor"       # once per computer
git config --global user.email "neha@bazaar.example"
git config --global init.defaultBranch main
git init                                          # make the repository
printf ".env\n__pycache__/\n" > .gitignore        # never save secrets
git status                                        # what's going on?
git add .                                         # choose everything (except ignored files)
git commit -m "Add product catalog with 4 products"
# edit products.py: add Steel Water Bottle
git diff                                          # what exactly changed?
git add products.py
git commit -m "Add Steel Water Bottle to the catalog"
git log --oneline                                 # the history
```

## 5. Under the hood

### The full log

```
$ git log
commit e13a128b34a2408cc18275ea0d5b27404baaaa1f
Author: Neha Kapoor <neha@bazaar.example>
Date:   Sat Nov 21 12:18:08 2026 +0000

    Add Steel Water Bottle to the catalog

commit c42ea64f465c5a997b20b1487a7461866b546acf
Author: Neha Kapoor <neha@bazaar.example>
Date:   Sat Nov 21 12:18:08 2026 +0000

    Add product catalog with 4 products
```

The full hash has 40 characters. The first 7 (`e13a128`) are enough to name a commit in almost every repository.

### One commit, in detail

`git show` shows a commit. `--stat` lists only the files and how many lines changed:

```
$ git show HEAD~1 --stat
commit c42ea64f465c5a997b20b1487a7461866b546acf
Author: Neha Kapoor <neha@bazaar.example>
Date:   Sat Nov 21 12:18:08 2026 +0000

    Add product catalog with 4 products

 .gitignore  |  2 ++
 README.md   |  3 +++
 products.py | 17 +++++++++++++++++
 3 files changed, 22 insertions(+)
```

`HEAD` means "the commit you're on now" (the newest one here). `HEAD~1` means "one before it".

### Forgetting `git add`

```
$ git commit -m "Add Steel Water Bottle"
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   products.py

no changes added to commit (use "git add" and/or "git commit -a")
```

Nothing was saved. Git commits only what's on the stage. Read Git's messages: they almost always tell you the next command.

### Forgetting `git config`

```
Author identity unknown

*** Please tell me who you are.

Run

  git config --global user.email "you@example.com"
  git config --global user.name "Your Name"

to set your account's default identity.
Omit --global to set the identity only in this repository.

fatal: unable to auto-detect email address (got 'root@neha-laptop.(none)')
```

??? note "Going deeper: what's inside .git"

    ```
    $ ls .git
    COMMIT_EDITMSG
    HEAD
    branches
    config
    description
    hooks
    index
    info
    logs
    objects
    refs
    ```

    - `objects/`: every version of every file, plus every commit, compressed. Each object is named by its hash.
    - `index`: the staging area. Yes, it's just one file.
    - `HEAD`: a tiny text file saying which branch you're on (`ref: refs/heads/main`).
    - `refs/heads/main`: a tiny text file holding the hash of `main`'s newest commit.
    - `config`: settings for this repository only (`git config` without `--global` writes here).

    The hash is a SHA-1 fingerprint of the content. Change one letter anywhere, and the hash changes. That's why history can't be
    changed silently: every commit's hash includes its parent's hash.

    Delete `.git` and the history is gone, but your files stay. That's all a "repository" is: your folder plus `.git`.

??? note "Going deeper: undoing things"

    | Situation | Command |
    | --- | --- |
    | Throw away changes to a file (not staged) | `git restore products.py` |
    | Take a file off the stage, keep the changes | `git restore --staged products.py` |
    | Fix the message of the last commit (not yet shared) | `git commit --amend -m "Better message"` |
    | Make a new commit that reverses an old one | `git revert e13a128` |
    | Stop tracking a file but keep it on disk | `git rm --cached .env`, then add it to `.gitignore` |
    | See a file as it was in an old commit | `git show c42ea64:products.py` |

    `revert` is the safe "undo" for commits other people already have: it doesn't erase history, it adds a new commit.
    `--amend` and other history-rewriting commands are only safe for commits nobody else has seen yet (Lesson 4).

    A committed secret stays in every old commit. Removing it from history needs special tools (`git filter-repo`), and every copy
    must be replaced. In practice: **change the secret first**, then clean up.

??? note "Going deeper: more ways to look at history"

    | Command | Shows |
    | --- | --- |
    | `git log -p` | every commit with its full diff |
    | `git log --stat` | every commit with its list of changed files |
    | `git log -- products.py` | only commits that touched this file |
    | `git log --author="Neha"` | only Neha's commits |
    | `git log --since="2 weeks ago"` | only recent commits |
    | `git blame products.py` | for each line: which commit and who last changed it |
    | `git diff --staged` | what is on the stage (what the next commit will contain) |
    | `git diff c42ea64 e13a128` | differences between two commits |

    A longer commit message: run `git commit` without `-m`. An editor opens. Write a short first line, a blank line, then
    a paragraph explaining **why**. Many teams use prefixes like `feat:` and `fix:` ("Conventional Commits").

## 6. Lab

**Lab folder:** `labs/03-git-and-github/01-commits-and-history/`

```bash
cd labs/03-git-and-github/01-commits-and-history
docker compose run --rm dev
```

You're in `/bazaar` inside a fresh container with Git installed: Bazaar's code, but no repository yet. Set your name and email,
run `git init`, write a `.gitignore` that keeps `.env` out, make the first commit, add the Steel Water Bottle, read `git diff`,
commit again, read `git log`, and rescue a broken file with `git restore`.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Committing secrets.** `.env` ends up in the history forever. **Fix:** write `.gitignore` **before** the first `git add .`, and read `git status`.
2. **Forgetting `git add`.** `no changes added to commit`. **Fix:** `git add <file>`, then commit again.
3. **Messages like `fix` or `wip`.** Nobody (not even you) knows later what changed or why. **Fix:** "Add …" / "Fix … when …", short and specific.
4. **One huge commit for a whole day's work.** Hard to review, hard to undo one part. **Fix:** commit each small step that works.
5. **`git restore` on work you wanted.** Uncommitted changes are gone for good. **Fix:** commit (or check `git diff`) before restoring.

## 8. Quiz

<div class="bz-quiz" data-quiz="m03-01"></div>

## 9. What's next

Next: working on a new feature without breaking `main`: [Branches](02-branches.md).

**In one line:** `git init` once; then change → `git status` → `git add` → `git commit -m "Add …"`; `git diff` shows changes,
`git log` shows history, `.gitignore` keeps secrets out, and `git restore` undoes a bad edit.

### Cheat sheet

| Task | Command |
| --- | --- |
| Who am I (once) | `git config --global user.name "…"` + `user.email "…"` |
| Start a repository | `git init` |
| What's going on? | `git status` (short: `git status --short`) |
| What exactly changed? | `git diff` |
| Choose changes | `git add products.py` (everything: `git add .`) |
| Save | `git commit -m "Add Steel Water Bottle to the catalog"` |
| History | `git log` / `git log --oneline` |
| One commit | `git show e13a128` (`--stat` for files only) |
| Undo a bad edit | `git restore products.py` |
| Never save these | list them in `.gitignore` |

| `git status --short` | Meaning |
| --- | --- |
| `??` | untracked: Git isn't saving this file yet |
| ` M` | modified, not staged |
| `M ` | modified and staged |
| `A ` | new file, staged |

> **Next in Bazaar:** Neha wants to build a Diwali discount feature. It will take a week, and the catalog must keep working the whole time.
> Working straight on `main` is risky. Time for branches.

<div class="bz-complete" data-lesson="m03-01"></div>
