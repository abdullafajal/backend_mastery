# Lab 03-02: A branch for the Diwali sale

**Goal:** build Bazaar's Diwali sale on its own branch, fix something on `main` at the same time, see the history split,
and meet Git's safety checks.

**Time:** about 25 minutes.

**You need:** Docker running.

## How this lab works

The container is Neha's laptop. `/bazaar` already holds Lesson 1's repository, and Git already knows Neha's name and email.
The first two commits have fixed dates, so their hashes are the same for everyone: `7bb892c` and `66d2406`.
Commits you make will get **different** hashes from the ones below. That's normal: a hash includes the time.

| Path | What it is |
| --- | --- |
| `/bazaar` | Bazaar's repository (`products.py`, `README.md`, `.gitignore`, `.env`) |
| `/lab-files/sale.py` | the finished Diwali sale code, ready to copy in |

```bash
docker compose run --rm dev
```

Everything is lost when you `exit`, so you can always start again.

## Task 1: Look around

```bash
git log --oneline
git branch
```

**Expected output:**

```
66d2406 Add Steel Water Bottle to the catalog
7bb892c Add product catalog with 4 products
* main
```

## Task 2: Make the branch

```bash
git switch -c diwali-sale
git branch
```

**Expected output:**

```
Switched to a new branch 'diwali-sale'
* diwali-sale
  main
```

## Task 3: Build the sale on the branch

```bash
cp /lab-files/sale.py .
python3 sale.py
git add sale.py
git commit -m "Add Diwali sale prices"
git log --oneline --graph --all
```

**Expected output:**

```
Red Running Shoes       ₹999 ->    ₹899  Diwali offer!
Cotton Kurta            ₹649 ->    ₹549  Diwali offer!
Masala Box              ₹299 ->    ₹299
Wireless Earbuds      ₹1,499 ->  ₹1,399  Diwali offer!
Steel Water Bottle      ₹349 ->    ₹349
[diwali-sale a801912] Add Diwali sale prices
 1 file changed, 19 insertions(+)
 create mode 100644 sale.py
* a801912 Add Diwali sale prices
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

Check where each branch points: `git branch -v`. `main` is still on `66d2406`.

## Task 4: Go back to `main`

```bash
git switch main
ls
python3 sale.py
```

**Expected output:** `sale.py` isn't here.

```
Switched to branch 'main'
README.md
__pycache__
products.py
python3: can't open file '/bazaar/sale.py': [Errno 2] No such file or directory
```

## Task 5: An urgent fix on `main`

```bash
echo "Sellers: Sharma Electronics, Meera Handloom, Patel Spices, Kumar Footwear." >> README.md
git commit -am "List our sellers in the README"
git log --oneline --graph --all
```

**Expected output:** the history splits at `66d2406`.

```
[main 347935d] List our sellers in the README
 1 file changed, 1 insertion(+)
* a801912 Add Diwali sale prices
| * 347935d List our sellers in the README
|/  
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

## Task 6: Back to the sale

```bash
git switch diwali-sale
ls
cat README.md
```

**Expected output:** `sale.py` is back, and this branch's README has no sellers line.

```
Switched to branch 'diwali-sale'
README.md
__pycache__
products.py
sale.py
# Bazaar

An online marketplace. Run the catalog with `python3 products.py`.
```

## Task 7: Git protects uncommitted work

```bash
echo "Diwali sale: 1-5 November" >> README.md
git switch main
```

**Expected output:**

```
error: Your local changes to the following files would be overwritten by checkout:
	README.md
Please commit your changes or stash them before you switch branches.
Aborting
```

You're still on `diwali-sale`. Throw the change away, then switch:

```bash
git restore README.md
git switch main
```

## Task 8: Git protects unmerged branches

```bash
git branch -d diwali-sale
```

**Expected output:**

```
error: the branch 'diwali-sale' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D diwali-sale'
hint: Disable this message with "git config advice.forceDeleteBranch false"
```

Don't use `-D`! The sale isn't in `main` yet. Lesson 3 merges it.

## Task 9 (optional, Going deeper): Branches on disk

```bash
cat .git/HEAD
cat .git/refs/heads/main .git/refs/heads/diwali-sale
```

**Expected output** (your two hashes will differ):

```
ref: refs/heads/main
347935db215a2562b5cda632ed6634f3207d4190
a80191260a426ce73895b833c56591ca5dd1d4f9
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Building the lab image (the first time takes a minute)...
PASS: the starting repository has Lesson 1's two commits
PASS: git switch -c made the branch and moved to it
PASS: a commit on diwali-sale leaves main where it was
PASS: on main, sale.py is not in the folder
PASS: main and diwali-sale split at 66d2406, one commit each
PASS: back on diwali-sale, sale.py is there and gives ₹100 off from ₹500
PASS: Git refuses to switch when uncommitted changes would be lost
PASS: git branch -d refuses to delete unmerged work
ALL CHECKS PASSED
```

## Stuck?

- **`fatal: invalid reference: diwali`**: a typo in the branch name. `git branch` lists the real names.
- **`fatal: a branch named 'diwali-sale' already exists`**: you made it already. Use `git switch diwali-sale` (without `-c`).
- **"`sale.py` is gone!"**: you're on `main`. `git branch` shows the `*`; `git switch diwali-sale` brings it back.
- **The screen is stuck after `git log`**: you're inside the pager. Press `q`.

## Clean up

```bash
docker compose down
```
