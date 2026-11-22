# Branches

<div class="bz-meta" markdown>
**Module** 3 · Git and GitHub
**Lesson** 2
**Reading time** 15 min (+ optional deeper parts)
**You will build** a `diwali-sale` branch for Bazaar's sale prices, while `main` keeps working and even gets its own fix
</div>

!!! abstract "In 1 minute"
    - A **branch** is just a **name stuck on a commit**, like a sticky note. `main` is the first one.
    - `git switch -c diwali-sale` makes a new branch and moves you to it. New commits go on the branch you're on; the other branches don't move.
    - `git switch main` takes you back, and Git **changes your files** to match that branch. Your work on the other branch is safe.
    - So you can build a big feature on its own branch, and still fix things on `main` at the same time.
    - `git log --oneline --graph --all` draws all branches. Lesson 3 joins them again with `git merge`.

> **Previously in Bazaar:** Neha put Bazaar's code in Git: two commits, a `.gitignore`, and an undo with `git restore`.

## 1. Why learn this?

Diwali is coming. Neha must build sale prices for Bazaar: ₹100 off every product of ₹500 or more. It'll take a few days, with half-finished code in between.

But `main` is the code that runs Bazaar. It must keep working **every day**. And on day two, someone asks for an urgent small fix on `main`.

If Neha works straight on `main`, the half-finished sale code is mixed into everything. Branches keep the two jobs apart.

## 2. The concept

### A branch is a name on a commit

Remember: commits form a chain, each pointing to its parent. A **branch** is simply a **name that points to one commit**: the newest commit of that line of work.

```
7bb892c ← 66d2406
             ↑
            main
```

`main` is the branch Git made for you with the first commit. Making a new branch doesn't copy any files. It just sticks a new name on a commit.

### `git branch` and `git switch -c`

```
$ git branch
* main
```

`git branch` lists the branches. The `*` marks the branch you're on now (Git calls this **HEAD**).

```
$ git switch -c diwali-sale
Switched to a new branch 'diwali-sale'
$ git branch
* diwali-sale
  main
```

`switch -c` = **c**reate a branch and switch to it. Both names are on the same commit, `66d2406`. No files changed yet.

### New commits move only your branch

Neha adds `sale.py` and commits:

```
$ git add sale.py && git commit -m "Add Diwali sale prices"
[diwali-sale a801912] Add Diwali sale prices
 1 file changed, 19 insertions(+)
 create mode 100644 sale.py
```

See `[diwali-sale a801912]`: the commit went on `diwali-sale`. That label moved forward. `main` didn't move: it still points to `66d2406`.

```
7bb892c ← 66d2406 ← a801912
             ↑          ↑
            main    diwali-sale
```

### `git switch`: your files change

```
$ git switch main
Switched to branch 'main'
$ ls
README.md
__pycache__
products.py
```

`sale.py` is **gone** from the folder! Don't panic. It is safe inside commit `a801912`. Git just made your folder match `main`, which doesn't have it.

Switch back, and it returns:

```
$ git switch diwali-sale
Switched to branch 'diwali-sale'
$ ls
README.md
__pycache__
products.py
sale.py
```

This is the big idea: **one folder, many versions**. Git swaps the files when you switch.

### Work on two things at once

While the sale is half-done, the urgent fix comes. Neha switches to `main`, adds the sellers to the README, and commits there.
Now each branch has a commit the other doesn't. The history has **split**:

```
$ git log --oneline --graph --all
* a801912 Add Diwali sale prices
| * 347935d List our sellers in the README
|/  
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

How to read it: each `*` is a commit, newest at the top. The `|/` shows where the two lines split, at `66d2406`.
`--all` means "show every branch, not only the one I'm on".

### Switch only with a clean folder

If you changed a file and didn't commit, Git may refuse to switch, so your change isn't lost:

```
$ git switch main
error: Your local changes to the following files would be overwritten by checkout:
	README.md
Please commit your changes or stash them before you switch branches.
Aborting
```

**Fix:** commit the change (or throw it away with `git restore README.md`), then switch.
The habit: run `git status` before `git switch`.

### Good branch names

Short, lowercase, words joined with `-`, saying what the work is: `diwali-sale`, `fix-checkout-total`, `add-seller-page`.
Not `test`, `new`, or `neha-branch-2`.

### An analogy

Think of a long **notebook** where you write Bazaar's story, page after page (the commits).

- A branch is a **bookmark ribbon** with a name on it. `main` is one ribbon, `diwali-sale` another.
- `git switch` means "open the notebook at this ribbon". You see the pages as they are on that line.
- When you write a new page (commit), only **your** ribbon moves to it.

**Where the analogy breaks:** a paper notebook can't grow two different page 3s. Git can: after a split, each ribbon has its own pages.

### Questions you may have

**Is a branch a copy of the code?** No. It's a tiny file holding one commit hash (41 bytes). That's why branches are free: make one for every task.

**`git checkout` or `git switch`?** Both work. `checkout` is the older command and does many jobs. `switch` (Git 2.23, 2019) only switches branches, so it's clearer.
`git checkout -b name` = `git switch -c name`.

**Where did `__pycache__` come from?** `sale.py` imports `products.py`, so Python saved a compiled copy. `.gitignore` keeps it out of Git.

**How do I get `sale.py` into `main`?** By **merging** the branch. That's Lesson 3.

## 3. See it in action

Press **Play** to watch Neha's branch. Then pick **Type your own commands** and try: `git switch -c my-idea`, `git commit -m "Try"`,
`git switch main`, `git commit -m "Fix"`, `git merge my-idea`.

<div class="bz-diagram" data-diagram="commit-graph"></div>

## 4. Code example

The file Neha builds on the `diwali-sale` branch. Money is in integer paise, and the rule is a simple `if`:

```python title="sale.py"
--8<-- "labs/03-git-and-github/02-branches/lab-files/sale.py"
```

Real output on the `diwali-sale` branch:

```
$ python3 sale.py
Red Running Shoes       ₹999 ->    ₹899  Diwali offer!
Cotton Kurta            ₹649 ->    ₹549  Diwali offer!
Masala Box              ₹299 ->    ₹299
Wireless Earbuds      ₹1,499 ->  ₹1,399  Diwali offer!
Steel Water Bottle      ₹349 ->    ₹349
```

The whole lesson as commands:

```bash
git switch -c diwali-sale                     # new branch, and move to it
cp /lab-files/sale.py .                       # (in the lab: the finished file is ready for you)
git add sale.py
git commit -m "Add Diwali sale prices"        # goes on diwali-sale only
git switch main                               # sale.py disappears from the folder
echo "Sellers: Sharma Electronics, Meera Handloom, Patel Spices, Kumar Footwear." >> README.md
git commit -am "List our sellers in the README"   # -a = add every changed tracked file
git log --oneline --graph --all               # see the split
git switch diwali-sale                        # sale.py is back
```

## 5. Under the hood

### Mistakes Git protects you from

Each of these is a real message from the lab:

```
$ git switch diwali
fatal: invalid reference: diwali
```

No branch with that name: a typo. `git branch` lists the real names.

```
$ git branch diwali-sale
fatal: a branch named 'diwali-sale' already exists
```

```
$ git branch -d diwali-sale
error: the branch 'diwali-sale' is not fully merged
hint: If you are sure you want to delete it, run 'git branch -D diwali-sale'
```

`-d` deletes a branch only if its commits are safe in your current branch. `diwali-sale` isn't merged yet, so Git refuses. That's a good thing.

A branch whose work is already in your branch is deleted quietly: `Deleted branch test-idea (was 347935d).`

### `git branch -v`

```
$ git branch -v
  diwali-sale a801912 Add Diwali sale prices
* main        347935d List our sellers in the README
```

Each branch, its newest commit, and that commit's message.

??? note "Going deeper: what a branch really is, on disk"

    ```
    $ cat .git/HEAD
    ref: refs/heads/main
    $ cat .git/refs/heads/main .git/refs/heads/diwali-sale
    347935db215a2562b5cda632ed6634f3207d4190
    a80191260a426ce73895b833c56591ca5dd1d4f9
    ```

    - A branch is a text file in `.git/refs/heads/` holding one full commit hash: 40 characters plus a newline (41 bytes).
    - `HEAD` is a file saying which branch you're on. `git switch` changes this file, then updates your folder.
    - `git commit` writes the new commit, then overwrites your branch's file with the new hash. That's "the label moves forward".

    (Git sometimes packs these files into one, `.git/packed-refs`, but the idea is the same.)

??? note "Going deeper: detached HEAD"

    You can switch to a **commit** instead of a branch: `git switch --detach 7bb892c` (or `git checkout 7bb892c`).
    Now `HEAD` points straight at a commit, with no branch label. Git calls this **detached HEAD**.

    It's handy for looking at old code. But if you commit here, no branch label follows your new commits.
    When you switch away, they're hard to find. If you want to keep them: `git switch -c rescue-work` while you're still there.

??? note "Going deeper: stash, rename, force-delete"

    | Task | Command |
    | --- | --- |
    | Put uncommitted changes aside, to switch branches | `git stash` (bring them back: `git stash pop`) |
    | List stashed changes | `git stash list` |
    | Rename the current branch | `git branch -m new-name` |
    | Delete a branch even if not merged (work is lost!) | `git branch -D name` |
    | See which branches are already merged into this one | `git branch --merged` |
    | Make a branch from an older commit | `git switch -c hotfix 66d2406` |

    `git stash` is the answer to "commit or stash" in the error message. Use it for a short break. For anything longer, a commit
    on your branch is safer and easier to find.

## 6. Lab

**Lab folder:** `labs/03-git-and-github/02-branches/`

```bash
cd labs/03-git-and-github/02-branches
docker compose run --rm dev
```

You're in `/bazaar`: Lesson 1's repository is ready, with the same two commits for everyone (`7bb892c`, `66d2406`), and Git already knows you're Neha.
Make the `diwali-sale` branch, commit `sale.py` on it, watch the file disappear on `main`, make a fix on `main`, draw the split with
`git log --oneline --graph --all`, and meet the "would be overwritten" and "not fully merged" protections.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Working on `main` "just this once".** Half-done code ends up in the version that runs Bazaar. **Fix:** `git switch -c <name>` before you start any change.
2. **"My file disappeared!"** after `git switch`. It's on the other branch. **Fix:** `git branch` to see where you are; switch back.
3. **`git branch name` and then committing.** `git branch` only makes the label; you're still on the old branch. **Fix:** use `git switch -c name` (make + move).
4. **Switching with uncommitted changes.** `would be overwritten by checkout`. **Fix:** commit (or `git stash`) first. Make `git status` a habit.
5. **`git branch -D` to "make the error go away".** The unmerged work is gone. **Fix:** read the message: merge first (Lesson 3), then `-d`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m03-02"></div>

## 9. What's next

Next: bringing the Diwali sale into `main`, and fixing the conflict when two people change the same line: [Merging and conflicts](03-merging-and-conflicts.md).

**In one line:** a branch is a name on a commit; `git switch -c` makes one and moves you there, commits move only your branch,
`git switch` swaps the files, and `git log --oneline --graph --all` shows the split.

### Cheat sheet

| Task | Command |
| --- | --- |
| List branches (`*` = you are here) | `git branch` (with last commit: `git branch -v`) |
| Make a branch and move to it | `git switch -c diwali-sale` |
| Move to a branch | `git switch main` |
| Make a branch without moving | `git branch diwali-sale` |
| See all branches as a graph | `git log --oneline --graph --all` |
| Which branch am I on? | `git branch --show-current` (or `git status`) |
| Delete a merged branch | `git branch -d diwali-sale` |
| Put changes aside for a moment | `git stash` / `git stash pop` |

> **Next in Bazaar:** the Diwali sale is ready. It must go into `main` before the sale starts. And Rohan, Bazaar's second developer,
> has just changed the same line of `products.py`. Time to merge, and to fix a conflict.

<div class="bz-complete" data-lesson="m03-02"></div>
