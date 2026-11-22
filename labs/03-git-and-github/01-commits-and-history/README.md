# Lab 03-01: Bazaar's first Git repository

**Goal:** turn Bazaar's code into a Git repository, keep the password file out with `.gitignore`, make two commits,
read the history, and undo a broken file.

**Time:** about 25 minutes.

**You need:** Docker running.

## How this lab works

The container is a fresh "laptop" with Git installed. Bazaar's code is in `/bazaar`, but it isn't a repository yet:

| File | What it is |
| --- | --- |
| `products.py` | Bazaar's product catalog, version 0 (4 products) |
| `README.md` | one line about the project |
| `.env` | the database password: must **never** be committed |

```bash
docker compose run --rm dev
```

Everything you do is lost when you `exit`, so you can always start again. Nothing touches your own Git setup.

## Task 1: Tell Git who you are

```bash
git config --global user.name "Neha Kapoor"
git config --global user.email "neha@bazaar.example"
git config --global init.defaultBranch main
git config --global --list
```

**Expected output:**

```
user.name=Neha Kapoor
user.email=neha@bazaar.example
init.defaultbranch=main
```

(On your own computer, use your own name and email.)

## Task 2: Make the repository

```bash
git init
git status
```

**Expected output:**

```
Initialized empty Git repository in /bazaar/.git/
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.env
	README.md
	products.py

nothing added to commit but untracked files present (use "git add" to track)
```

## Task 3: Keep `.env` out

```bash
printf ".env\n__pycache__/\n" > .gitignore
cat .gitignore
git status --short
```

**Expected output:** `.env` is no longer listed.

```
.env
__pycache__/
?? .gitignore
?? README.md
?? products.py
```

## Task 4: The first commit

```bash
git add .
git status
git commit -m "Add product catalog with 4 products"
```

**Expected output** (your hash will differ):

```
On branch main

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
	new file:   .gitignore
	new file:   README.md
	new file:   products.py

[main (root-commit) c42ea64] Add product catalog with 4 products
 3 files changed, 22 insertions(+)
 create mode 100644 .gitignore
 create mode 100644 README.md
 create mode 100644 products.py
```

## Task 5: Change the catalog and read the diff

Open `products.py` with `nano products.py`. Add this line just before the `]` line, then save (`Ctrl+O`, `Enter`, `Ctrl+X`):

```python
    {"name": "Steel Water Bottle", "price_paise": 34900, "seller": "Sharma Electronics"},
```

Check it runs, then see what changed:

```bash
python3 products.py
git diff
```

**Expected output:**

```
Red Running Shoes       ₹999  (Kumar Footwear)
Cotton Kurta            ₹649  (Meera Handloom)
Masala Box              ₹299  (Patel Spices)
Wireless Earbuds      ₹1,499  (Sharma Electronics)
Steel Water Bottle      ₹349  (Sharma Electronics)
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

## Task 6: Forget `git add` on purpose, then commit properly

```bash
git commit -m "Add Steel Water Bottle"
```

**Expected output:** nothing is saved.

```
On branch main
Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
	modified:   products.py

no changes added to commit (use "git add" and/or "git commit -a")
```

Now the right way:

```bash
git add products.py
git commit -m "Add Steel Water Bottle to the catalog"
```

```
[main e13a128] Add Steel Water Bottle to the catalog
 1 file changed, 1 insertion(+)
```

## Task 7: Read the history

```bash
git log
git log --oneline
git show HEAD~1 --stat
```

**Expected output** (your hashes and dates will differ):

```
commit e13a128b34a2408cc18275ea0d5b27404baaaa1f
Author: Neha Kapoor <neha@bazaar.example>
Date:   Sat Nov 21 12:18:08 2026 +0000

    Add Steel Water Bottle to the catalog

commit c42ea64f465c5a997b20b1487a7461866b546acf
Author: Neha Kapoor <neha@bazaar.example>
Date:   Sat Nov 21 12:18:08 2026 +0000

    Add product catalog with 4 products
e13a128 Add Steel Water Bottle to the catalog
c42ea64 Add product catalog with 4 products
commit c42ea64f465c5a997b20b1487a7461866b546acf
Author: Neha Kapoor <neha@bazaar.example>
Date:   Sat Nov 21 12:18:08 2026 +0000

    Add product catalog with 4 products

 .gitignore  |  2 ++
 README.md   |  3 +++
 products.py | 17 +++++++++++++++++
 3 files changed, 22 insertions(+)
```

If `git log` fills the screen, press `q` to leave it.

## Task 8: Break the file, then restore it

```bash
echo oops > products.py
git status --short
git diff --stat
git restore products.py
python3 products.py
git status
```

**Expected output:**

```
 M products.py
 products.py | 19 +------------------
 1 file changed, 1 insertion(+), 18 deletions(-)
Red Running Shoes       ₹999  (Kumar Footwear)
Cotton Kurta            ₹649  (Meera Handloom)
Masala Box              ₹299  (Patel Spices)
Wireless Earbuds      ₹1,499  (Sharma Electronics)
Steel Water Bottle      ₹349  (Sharma Electronics)
On branch main
nothing to commit, working tree clean
```

## Task 9 (optional, Going deeper): Look inside `.git`

```bash
ls .git
cat .git/HEAD
git ls-files
```

`git ls-files` lists the files Git tracks: `.gitignore`, `README.md`, `products.py`. No `.env`.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Building the lab image (the first time takes a minute)...
PASS: git init made a repository
PASS: .gitignore hides .env (the password file) from Git
PASS: first commit saved 3 files
PASS: git diff shows the new line with a +
PASS: git log shows 2 commits, newest first
PASS: commits carry the author from git config
PASS: git restore brought back the last committed version
PASS: the repository tracks 3 files, not .env
ALL CHECKS PASSED
```

## Stuck?

- **`Author identity unknown` … `fatal: unable to auto-detect email address`**: you skipped Task 1. Run the two `git config` lines.
- **`no changes added to commit`**: you forgot `git add`. See Task 6.
- **`.env` shows up in `git status`**: your `.gitignore` is missing or misspelled. Check with `cat .gitignore`.
- **The screen is stuck after `git log`**: you're inside the pager (`less`). Press `q`.

## Clean up

```bash
docker compose down
```
