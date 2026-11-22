# Lab 03-05: Bazaar on "GitHub": push, review, merge, pull

**Goal:** share Bazaar's repository between two laptops through GitHub: clone, push a branch, review and merge it like a pull request,
pull it back, and fix a rejected push.

**Time:** about 30 minutes.

**You need:** Docker running. No GitHub account and no internet: "GitHub" is simulated inside the container.

## How this lab works

One container plays three computers:

| Path | Plays | Git commits as |
| --- | --- | --- |
| `/srv/github/bazaar-team/bazaar.git` | GitHub (the shared copy) | (nobody works here directly) |
| `/laptops/neha` | Neha's laptop | Neha Kapoor |
| `/laptops/rohan` | Rohan's laptop | Rohan Mehta |

On real GitHub the address would be `https://github.com/bazaar-team/bazaar.git`. Here it's a folder, so Git prints that folder's path.
"GitHub" already holds Bazaar's history: `3d5cfad`, `66d2406`, `7bb892c`. Commits you make will get their own hashes.

```bash
docker compose run --rm dev
```

You'll switch between the two laptops with `cd`. Everything is lost when you `exit`, so you can always start again.

## Task 1: Both developers clone

```bash
GH=/srv/github/bazaar-team/bazaar.git
cd /laptops/neha && git clone $GH
cd /laptops/rohan && git clone $GH
cd /laptops/neha/bazaar
git remote -v
git branch -a
git config user.name
```

**Expected output:**

```
Cloning into 'bazaar'...
done.
Cloning into 'bazaar'...
done.
origin	/srv/github/bazaar-team/bazaar.git (fetch)
origin	/srv/github/bazaar-team/bazaar.git (push)
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
Neha Kapoor
```

(`GH` is just a shell variable, so you don't type the long path again. In `/laptops/rohan/bazaar`, `git config user.name` prints `Rohan Mehta`.)

## Task 2: Neha pushes a branch

```bash
cd /laptops/neha/bazaar
git switch -c add-payment-info
echo "Payment: UPI, cards, or cash on delivery." >> README.md
git commit -am "Add payment options to the README"
git push -u origin add-payment-info
```

**Expected output** (your hash will differ):

```
Switched to a new branch 'add-payment-info'
[add-payment-info 6a4ebce] Add payment options to the README
 1 file changed, 1 insertion(+)
To /srv/github/bazaar-team/bazaar.git
 * [new branch]      add-payment-info -> add-payment-info
branch 'add-payment-info' set up to track 'origin/add-payment-info'.
```

On real GitHub, Neha would now click **Compare & pull request** and open pull request #1.

## Task 3: Rohan reviews it

```bash
cd /laptops/rohan/bazaar
git fetch
git branch -a
git log --oneline main..origin/add-payment-info
git diff main...origin/add-payment-info
```

**Expected output:**

```
From /srv/github/bazaar-team/bazaar
 * [new branch]      add-payment-info -> origin/add-payment-info
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/add-payment-info
  remotes/origin/main
6a4ebce Add payment options to the README
diff --git a/README.md b/README.md
index a484915..55d664d 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
 # Bazaar
 
 An online marketplace. Run the catalog with `python3 products.py`.
+Payment: UPI, cards, or cash on delivery.
```

This is what the pull request's **Files changed** tab would show. Looks good: Rohan approves.

## Task 4: Merge it (what GitHub's button does)

On real GitHub, someone clicks **Merge pull request**. Here, Rohan does the same thing by hand, then pushes:

```bash
git merge --no-ff -m "Merge pull request #1 from bazaar-team/add-payment-info" origin/add-payment-info
git push
git log --oneline --graph -4
```

**Expected output:**

```
Merge made by the 'ort' strategy.
 README.md | 1 +
 1 file changed, 1 insertion(+)
To /srv/github/bazaar-team/bazaar.git
   3d5cfad..7cb3dd8  main -> main
*   7cb3dd8 Merge pull request #1 from bazaar-team/add-payment-info
|\  
| * 6a4ebce Add payment options to the README
|/  
* 3d5cfad Add Diwali sale prices
* 66d2406 Add Steel Water Bottle to the catalog
```

## Task 5: Neha's laptop doesn't know yet

```bash
cd /laptops/neha/bazaar
git switch main
git status
git fetch
git status
git pull
tail -1 README.md
```

**Expected output:**

```
Switched to branch 'main'
Your branch is up to date with 'origin/main'.
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
From /srv/github/bazaar-team/bazaar
   3d5cfad..7cb3dd8  main       -> origin/main
On branch main
Your branch is behind 'origin/main' by 2 commits, and can be fast-forwarded.
  (use "git pull" to update your local branch)

nothing to commit, working tree clean
Updating 3d5cfad..7cb3dd8
Fast-forward
 README.md | 1 +
 1 file changed, 1 insertion(+)
Payment: UPI, cards, or cash on delivery.
```

The first `status` said "up to date": it only knew what it last saw. After `fetch`, it knows it's behind.

## Task 6: Two pushes at once

Rohan pushes a small fix to `main`:

```bash
cd /laptops/rohan/bazaar
echo "Returns: within 7 days." >> README.md
git commit -am "Add the returns policy to the README"
git push
```

Neha, who hasn't pulled that yet, adds a stock count to Masala Box and pushes too. Open `nano products.py` and change the Masala Box line to:

```python
    {"name": "Masala Box", "price_paise": 29900, "seller": "Patel Spices", "stock": 40},
```

Then:

```bash
cd /laptops/neha/bazaar
git commit -am "Add stock count for Masala Box"
git push
```

**Expected output:**

```
To /srv/github/bazaar-team/bazaar.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '/srv/github/bazaar-team/bazaar.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

## Task 7: Pull, then push

```bash
git pull --rebase
git push
git log --oneline --graph -4
```

**Expected output:**

```
From /srv/github/bazaar-team/bazaar
   7cb3dd8..b8ae938  main       -> origin/main
Successfully rebased and updated refs/heads/main.
To /srv/github/bazaar-team/bazaar.git
   b8ae938..03ecf1a  main -> main
* 03ecf1a Add stock count for Masala Box
* b8ae938 Add the returns policy to the README
*   7cb3dd8 Merge pull request #1 from bazaar-team/add-payment-info
|\  
| * 6a4ebce Add payment options to the README
|/  
```

Neha's commit now sits on top of Rohan's, and both are on "GitHub".

## Task 8 (optional): Clean up the merged branch

```bash
git push origin --delete add-payment-info
git branch -d add-payment-info
git fetch --prune
git branch -a
```

**Expected output:**

```
To /srv/github/bazaar-team/bazaar.git
 - [deleted]         add-payment-info
Deleted branch add-payment-info (was 6a4ebce).
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

## Task 9 (optional, Going deeper): Real GitHub

Follow the "Do it on real GitHub" box in the lesson with your own account. `test_lab.sh` doesn't check this part.

## Check your work

On your computer:

```bash
bash test_lab.sh
```

**Expected output:**

```
Building the lab image (the first time takes a minute)...
PASS: both laptops cloned Bazaar (3 commits) and commit as Neha / Rohan
PASS: git push -u put Neha's branch on "GitHub"
PASS: Rohan fetched the branch and reviewed the change
PASS: the pull request was merged on "GitHub" (merge commit, two parents)
PASS: status only knows about GitHub after git fetch
PASS: git pull brought the merged work to Neha's laptop
PASS: a push is rejected when GitHub has commits you don't have; nothing is overwritten
PASS: pull --rebase, then push: both changes on GitHub, in a straight line
PASS: the merged branch was deleted on GitHub
ALL CHECKS PASSED
```

## Stuck?

- **`! [rejected] … (fetch first)`**: someone pushed first. `git pull --rebase`, then `git push`. Never `--force` on `main`.
- **`fatal: destination path 'bazaar' already exists and is not an empty directory.`**: you already cloned in this folder. Just `cd bazaar`.
- **Commits show the wrong author**: you're in the wrong laptop folder. `pwd` tells you where you are.
- **Rohan can't see Neha's branch**: run `git fetch` first. Laptops never update by themselves.

## Clean up

```bash
docker compose down
```
