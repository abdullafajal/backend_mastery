# Lab 03-04: Rebase Rohan's free-delivery branch

**Goal:** bring Rohan's `free-delivery` branch up to date with `main` using `git rebase`, see why the hashes change,
join it into `main` as one straight line, and (optional) fix a conflict during a rebase.

**Time:** about 25 minutes.

**You need:** Docker running.

## How this lab works

This time **you are Rohan**: Git is set up as `Rohan Mehta`. `/bazaar` holds a ready repository. All its commits have fixed dates,
so these hashes are the same for everyone:

```
* f2939ea Add the support email to the README       <- main (Neha, newest)
| * 99a09b3 Explain delivery charges in the README  <- rohan-readme
|/
| * f46d2ff Add delivery examples                   <- free-delivery (you are here)
| * 79d769b Add delivery charge rule
|/
* 3d5cfad Add Diwali sale prices
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

A rebase makes **new** commits with the current time, so after Task 3 your hashes will differ from the ones below. That's normal.

```bash
docker compose run --rm dev
```

Everything is lost when you `exit`, so you can always start again.

## Task 1: Look at the split

```bash
git branch
git log --oneline --graph --all
```

**Expected output:**

```
* free-delivery
  main
  rohan-readme
* f2939ea Add the support email to the README
| * 99a09b3 Explain delivery charges in the README
|/  
| * f46d2ff Add delivery examples
| * 79d769b Add delivery charge rule
|/  
* 3d5cfad Add Diwali sale prices
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

## Task 2: Which commits are only on your branch?

```bash
git log --format="%h %an: %s" main..free-delivery
python3 delivery.py
cat README.md
```

**Expected output:** your 2 commits, the delivery rule working, and **no** support email in your README yet (that's Neha's newer commit).

```
f46d2ff Rohan Mehta: Add delivery examples
79d769b Rohan Mehta: Add delivery charge rule
Cart   ₹999 (Red Running Shoes): delivery free
Cart   ₹649 (Cotton Kurta): delivery ₹49
Cart   ₹299 (Masala Box): delivery ₹49
# Bazaar

An online marketplace. Run the catalog with `python3 products.py`.
```

## Task 3: Rebase

```bash
git rebase main
git log --oneline --graph --all
```

**Expected output:**

```
Successfully rebased and updated refs/heads/free-delivery.
* 27ff12f Add delivery examples
* 96286bf Add delivery charge rule
* f2939ea Add the support email to the README
| * 99a09b3 Explain delivery charges in the README
|/  
* 3d5cfad Add Diwali sale prices
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

Your two commits now come **after** Neha's `f2939ea`. Their hashes are new (yours will differ from `96286bf` and `27ff12f`).

## Task 4: Same work, new commits

```bash
git log --format="%h %an: %s" -4
python3 delivery.py
cat README.md
```

**Expected output:** same messages and author; the code still works; and now Neha's support email is in your branch too.

```
27ff12f Rohan Mehta: Add delivery examples
96286bf Rohan Mehta: Add delivery charge rule
f2939ea Neha Kapoor: Add the support email to the README
3d5cfad Neha Kapoor: Add Diwali sale prices
Cart   ₹999 (Red Running Shoes): delivery free
Cart   ₹649 (Cotton Kurta): delivery ₹49
Cart   ₹299 (Masala Box): delivery ₹49
# Bazaar

An online marketplace. Run the catalog with `python3 products.py`.
Help: support@bazaar.example
```

## Task 5: Join into `main`: a straight line

```bash
git switch main
git merge free-delivery
git log --oneline --graph
git branch -d free-delivery
```

**Expected output:**

```
Switched to branch 'main'
Updating f2939ea..27ff12f
Fast-forward
 delivery.py | 17 +++++++++++++++++
 1 file changed, 17 insertions(+)
 create mode 100644 delivery.py
* 27ff12f Add delivery examples
* 96286bf Add delivery charge rule
* f2939ea Add the support email to the README
* 3d5cfad Add Diwali sale prices
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
Deleted branch free-delivery (was 27ff12f).
```

## Task 6 (optional, Going deeper): The old commits still exist

```bash
git cat-file -t f46d2ff
git reflog -6
```

`git cat-file -t` prints `commit`: the old copy is still there, even though no branch shows it. The reflog lists the rebase step by step:

```
27ff12f HEAD@{0}: merge free-delivery: Fast-forward
f2939ea HEAD@{1}: checkout: moving from free-delivery to main
27ff12f HEAD@{2}: rebase (finish): returning to refs/heads/free-delivery
27ff12f HEAD@{3}: rebase (pick): Add delivery examples
96286bf HEAD@{4}: rebase (pick): Add delivery charge rule
f2939ea HEAD@{5}: rebase (start): checkout main
```

## Task 7 (optional): A conflict during a rebase

Your `rohan-readme` branch adds a line at the end of `README.md`. Neha added a different line in the same place.

```bash
git switch rohan-readme
git rebase main
```

**Expected output:**

```
Switched to branch 'rohan-readme'
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
error: could not apply 99a09b3... Explain delivery charges in the README
hint: Resolve all conflicts manually, mark them as resolved with
hint: "git add/rm <conflicted_files>", then run "git rebase --continue".
hint: You can instead skip this commit: run "git rebase --skip".
hint: To abort and get back to the state before "git rebase", run "git rebase --abort".
hint: Disable this message with "git config advice.mergeConflict false"
Could not apply 99a09b3... Explain delivery charges in the README
```

Look at the file with `cat README.md`:

```
# Bazaar

An online marketplace. Run the catalog with `python3 products.py`.
<<<<<<< HEAD
Help: support@bazaar.example
=======
Delivery: free from ₹999, otherwise ₹49.
>>>>>>> 99a09b3 (Explain delivery charges in the README)
```

Both lines should stay. Open `nano README.md`, delete the three marker lines (`<<<<<<< HEAD`, `=======`, `>>>>>>> 99a09b3 …`), and save.
The end of the file must be:

```
Help: support@bazaar.example
Delivery: free from ₹999, otherwise ₹49.
```

Then:

```bash
git add README.md
git rebase --continue
```

Nano opens with the commit message. Just close it (`Ctrl+X`). **Expected output** (your hash will differ):

```
[detached HEAD 1ef2d2e] Explain delivery charges in the README
 1 file changed, 1 insertion(+)
Successfully rebased and updated refs/heads/rohan-readme.
```

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Building the lab image (the first time takes a minute)...
PASS: free-delivery has 2 of Rohan's commits; main has 1 newer commit
PASS: git rebase main succeeded
PASS: free-delivery now sits on top of main (0 behind, 2 ahead)
PASS: same messages and author, but NEW hashes (rebase makes copies)
PASS: delivery.py works, and Neha's README change is there too
PASS: merging into main is now a fast-forward: a straight line, no merge commits
PASS: the old commit f46d2ff still exists (that's why reflog can rescue you)
PASS: a rebase can stop with a conflict, too
PASS: fixed, git add, git rebase --continue: done, on top of main
ALL CHECKS PASSED
```

## Stuck?

- **`fatal: invalid upstream 'mian'`**: a typo in the branch name. `git branch` lists the real names.
- **`Current branch main is up to date.`**: you're on the wrong branch. Rebase runs on **your** branch: `git switch free-delivery` first.
- **`git status` says `interactive rebase in progress`**: a rebase is paused at a conflict. Fix the file, `git add`, `git rebase --continue`; or `git rebase --abort`.
- **"My commits are gone!"**: they have new hashes. `git log --oneline` shows them; `git reflog` shows the old ones too.

## Clean up

```bash
docker compose down
```
