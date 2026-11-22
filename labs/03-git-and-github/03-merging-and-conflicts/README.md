# Lab 03-03: Merge the Diwali sale, and fix a real conflict

**Goal:** make a fast-forward merge, merge the Diwali sale into `main` with a merge commit, then fix a real merge conflict
between Neha's ₹150 discount and Rohan's ₹200 discount.

**Time:** about 30 minutes.

**You need:** Docker running.

## How this lab works

The container is Neha's laptop. `/bazaar` holds a ready repository. All commits in it have fixed dates, so these hashes are the
same for everyone:

```
* 0ae5e66 Raise Diwali discount to ₹200        <- rohan-discount (by Rohan Mehta)
* 7ceaef0 Add Diwali sale prices              <- diwali-sale
| * e99e154 List our sellers in the README    <- main
|/
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

Commits **you** make get the time of your computer, so their hashes will differ from the ones below. That's normal.

```bash
docker compose run --rm dev
```

Everything is lost when you `exit`, so you can always start again.

## Task 1: Look at the branches

```bash
git log --oneline --graph --all
git log rohan-discount -1 --format="%h %an: %s"
```

**Expected output:**

```
* 0ae5e66 Raise Diwali discount to ₹200
* 7ceaef0 Add Diwali sale prices
| * e99e154 List our sellers in the README
|/  
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
0ae5e66 Rohan Mehta: Raise Diwali discount to ₹200
```

## Task 2: A fast-forward

A tiny branch, one commit, merged straight back:

```bash
git switch -c add-support-email
echo "Help: support@bazaar.example" >> README.md
git commit -am "Add the support email to the README"
git switch main
git merge add-support-email
git branch -d add-support-email
```

**Expected output** (last part):

```
Switched to branch 'main'
Updating e99e154..7434337
Fast-forward
 README.md | 1 +
 1 file changed, 1 insertion(+)
Deleted branch add-support-email (was 7434337).
```

## Task 3: Merge the Diwali sale

```bash
git merge --no-edit diwali-sale
git log --oneline --graph
python3 sale.py
```

**Expected output:**

```
Merge made by the 'ort' strategy.
 sale.py | 19 +++++++++++++++++++
 1 file changed, 19 insertions(+)
 create mode 100644 sale.py
*   398c299 Merge branch 'diwali-sale'
|\  
| * 7ceaef0 Add Diwali sale prices
* | 7434337 Add the support email to the README
* | e99e154 List our sellers in the README
|/  
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
Red Running Shoes       ₹999 ->    ₹899  Diwali offer!
Cotton Kurta            ₹649 ->    ₹549  Diwali offer!
Masala Box              ₹299 ->    ₹299
Wireless Earbuds      ₹1,499 ->  ₹1,399  Diwali offer!
Steel Water Bottle      ₹349 ->    ₹349
```

## Task 4: The team decides ₹150

Open `sale.py` with `nano sale.py`. Change the `DISCOUNT_PAISE` line to:

```python
DISCOUNT_PAISE = 15000      # ₹150 off, in paise (never float for money)
```

Save (`Ctrl+O`, `Enter`, `Ctrl+X`), check, and commit:

```bash
git diff
git commit -am "Set Diwali discount to ₹150"
```

**Expected output:**

```
-DISCOUNT_PAISE = 10000      # ₹100 off, in paise (never float for money)
+DISCOUNT_PAISE = 15000      # ₹150 off, in paise (never float for money)
```

(plus the diff header lines), then `[main 4b961a1] Set Diwali discount to ₹150`.

## Task 5: Merge Rohan's branch: a conflict

```bash
git merge rohan-discount
git status
```

**Expected output:**

```
Auto-merging sale.py
CONFLICT (content): Merge conflict in sale.py
Automatic merge failed; fix conflicts and then commit the result.
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   sale.py

no changes added to commit (use "git add" and/or "git commit -a")
```

Look at the file:

```bash
head -10 sale.py
```

```
"""Diwali sale prices for Bazaar. Rule: a fixed discount on every product of ₹500 or more."""

from products import PRODUCTS, rupees

<<<<<<< HEAD
DISCOUNT_PAISE = 15000      # ₹150 off, in paise (never float for money)
=======
DISCOUNT_PAISE = 20000      # ₹200 off, in paise (never float for money)
>>>>>>> rohan-discount
MIN_PRICE_PAISE = 50000     # only for products of ₹500 or more
```

Who changed these lines?

```bash
git log --merge --format="%h %an: %s"
```

```
4b961a1 Neha Kapoor: Set Diwali discount to ₹150
0ae5e66 Rohan Mehta: Raise Diwali discount to ₹200
```

## Task 6: Try to commit too early

```bash
git commit -m "too early"
```

**Expected output:**

```
error: Committing is not possible because you have unmerged files.
hint: Fix them up in the work tree, and then use 'git add/rm <file>'
hint: as appropriate to mark resolution and make a commit.
fatal: Exiting because of an unresolved conflict.
U	sale.py
```

## Task 7: Abort, then merge again

```bash
git merge --abort
git status --short
git log --oneline -1
git merge rohan-discount
```

After `--abort`, `git status --short` prints nothing and the last commit is your ₹150 commit. The second `git merge` gives the same conflict again.

## Task 8: Fix the conflict

The team agreed on ₹150. Open the file:

```bash
nano sale.py
```

Delete these four lines: `<<<<<<< HEAD`, `=======`, the ₹200 line, and `>>>>>>> rohan-discount`. Keep the ₹150 line. Save, then check:

```bash
head -7 sale.py
grep -c "<<<<<<<" sale.py
```

**Expected output:**

```
"""Diwali sale prices for Bazaar. Rule: a fixed discount on every product of ₹500 or more."""

from products import PRODUCTS, rupees

DISCOUNT_PAISE = 15000      # ₹150 off, in paise (never float for money)
MIN_PRICE_PAISE = 50000     # only for products of ₹500 or more

0
```

`0` means no markers are left.

## Task 9: Finish the merge, and test

```bash
git add sale.py
git status
git commit -m "Merge rohan-discount: keep the ₹150 discount the team agreed"
python3 sale.py
git log --oneline --graph
```

**Expected output:**

```
On branch main
All conflicts fixed but you are still merging.
  (use "git commit" to conclude merge)

[main a3f7248] Merge rohan-discount: keep the ₹150 discount the team agreed
Red Running Shoes       ₹999 ->    ₹849  Diwali offer!
Cotton Kurta            ₹649 ->    ₹499  Diwali offer!
Masala Box              ₹299 ->    ₹299
Wireless Earbuds      ₹1,499 ->  ₹1,349  Diwali offer!
Steel Water Bottle      ₹349 ->    ₹349
*   a3f7248 Merge rohan-discount: keep the ₹150 discount the team agreed
|\  
| * 0ae5e66 Raise Diwali discount to ₹200
* | 4b961a1 Set Diwali discount to ₹150
* | 398c299 Merge branch 'diwali-sale'
|\| 
| * 7ceaef0 Add Diwali sale prices
* | 7434337 Add the support email to the README
* | e99e154 List our sellers in the README
|/  
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

## Task 10 (optional): Clean up the branches

```bash
git branch --merged
git branch -d diwali-sale rohan-discount
```

```
  diwali-sale
* main
  rohan-discount
Deleted branch diwali-sale (was 7ceaef0).
Deleted branch rohan-discount (was 0ae5e66).
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Building the lab image (the first time takes a minute)...
PASS: the starting repository has 5 commits on 3 branches
PASS: merging a branch that is simply ahead is a fast-forward
PASS: merging diwali-sale made a merge commit with two parents
PASS: after the merge, main has sale.py
PASS: Neha's ₹150 and Rohan's ₹200 on the same line give a real conflict
PASS: sale.py has conflict markers (<<<<<<< HEAD ... >>>>>>> rohan-discount)
PASS: Git refuses to commit before the conflict is fixed
PASS: resolved: no markers left, a merge commit with two parents, nothing pending
PASS: the final code gives the agreed ₹150 off
PASS: both branches are now merged into main
ALL CHECKS PASSED
```

## Stuck?

- **An editor opened after `git merge`**: you left out `--no-edit`. Save and close (`Ctrl+O`, `Enter`, `Ctrl+X` in nano) to accept the message.
- **`Committing is not possible because you have unmerged files`**: fix the file, then `git add sale.py` first.
- **`python3 sale.py` gives `SyntaxError`**: a marker line is still in the file. `grep -n "<<<<<<<\|=======\|>>>>>>>" sale.py` shows where.
- **You made a mess**: `git merge --abort` (before you commit) takes you back to Task 5.

## Clean up

```bash
docker compose down
```
