# Merging and conflicts

<div class="bz-meta" markdown>
**Module** 3 · Git and GitHub
**Lesson** 3
**Reading time** 15 min (+ optional deeper parts)
**You will build** the Diwali sale merged into `main`, plus a real conflict between Neha and Rohan, fixed by hand
</div>

!!! abstract "In 1 minute"
    - `git merge diwali-sale` brings that branch's commits into the branch you're on. Stand on `main`, merge the feature in.
    - If `main` hasn't moved since the branch split, Git just moves the label forward: a **fast-forward**. Otherwise it makes a **merge commit** with two parents.
    - If both branches changed **the same line** differently, Git can't choose. It stops with a **conflict** and marks the spot with `<<<<<<<`, `=======`, `>>>>>>>`.
    - You fix it: edit the file to the right final version, delete the markers, `git add` the file, `git commit`.
    - Choosing the right version is a **team decision**, not a Git one. Talk first, then edit.

> **Previously in Bazaar:** Neha built the Diwali sale on its own branch, while `main` got a small fix. The history split in two.

## 1. Why learn this?

The Diwali sale starts on Friday. The code is ready on `diwali-sale`, but Bazaar runs `main`. The two must be joined.

And Bazaar now has a second developer, Rohan Mehta. He changed the discount to ₹200 on his branch. The team then decided ₹150, and Neha put ₹150 on `main`.
Same line, two different values. Git will stop and ask. You need to know what to do when it does.

## 2. The concept

### Merging: bring a branch into yours

You always merge **into the branch you're on**. To bring the sale into `main`:

```bash
git switch main
git merge diwali-sale
```

Read it as: "into `main`, merge `diwali-sale`". The other branch doesn't change.

### Case 1: fast-forward

Neha makes a tiny branch for the support email, commits, and merges it back. `main` hadn't moved in the meantime:

```
$ git merge add-support-email
Updating e99e154..7434337
Fast-forward
 README.md | 1 +
 1 file changed, 1 insertion(+)
```

**Fast-forward** = `main` was simply behind. Git moves the `main` label forward to the branch's commit. No new commit is needed.

### Case 2: a merge commit

`main` and `diwali-sale` have **both** moved since they split. Git combines them and records a new commit:

```
$ git merge --no-edit diwali-sale
Merge made by the 'ort' strategy.
 sale.py | 19 +++++++++++++++++++
 1 file changed, 19 insertions(+)
 create mode 100644 sale.py
```

```
$ git log --oneline --graph
*   398c299 Merge branch 'diwali-sale'
|\  
| * 7ceaef0 Add Diwali sale prices
* | 7434337 Add the support email to the README
* | e99e154 List our sellers in the README
|/  
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

A **merge commit** (`398c299`) has **two parents**: the last commit of `main` and the last commit of `diwali-sale`. The graph joins again.

(`--no-edit` accepts Git's ready message, `Merge branch 'diwali-sale'`. Without it, Git opens an editor so you can change the message.
`ort` is the name of Git's merging method. You don't need to choose it.)

### How Git combines changes

Git looks at three versions of each file: the **common starting point** (where the branches split), `main`'s version, and the branch's version.

- Only one side changed a line? Git takes that change.
- Both sides changed **different** lines? Git takes both.
- Both sides changed **the same line**, differently? Git can't know which is right. That's a **conflict**.

So most merges just work. Conflicts happen only when two people edit the same lines.

### Case 3: a conflict

Neha set ₹150 on `main`. Rohan set ₹200 on `rohan-discount`. Same line:

```
$ git merge rohan-discount
Auto-merging sale.py
CONFLICT (content): Merge conflict in sale.py
Automatic merge failed; fix conflicts and then commit the result.
```

Git stopped in the middle of the merge. `git status` tells you where:

```
$ git status
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   sale.py
```

### Reading the conflict markers

Git wrote **both** versions into `sale.py`, with markers around them:

```
<<<<<<< HEAD
DISCOUNT_PAISE = 15000      # ₹150 off, in paise (never float for money)
=======
DISCOUNT_PAISE = 20000      # ₹200 off, in paise (never float for money)
>>>>>>> rohan-discount
```

| Part | Means |
| --- | --- |
| `<<<<<<< HEAD` to `=======` | **your** version: the branch you're on (`main`) |
| `=======` to `>>>>>>> rohan-discount` | **their** version: the branch you're merging in |

The rest of the file is already merged. Only this block needs you.

### Fixing it: four steps

1. **Decide** the right result. Here the team agreed on ₹150. (It could also be a mix of both. Ask if you're not sure!)
2. **Edit** the file: keep the right line, delete the other line and **all three marker lines**. It must be normal Python again:
   ```python
   DISCOUNT_PAISE = 15000      # ₹150 off, in paise (never float for money)
   ```
3. **`git add sale.py`**: tells Git "this file is fixed". `git status` now says `All conflicts fixed but you are still merging.`
4. **`git commit`** finishes the merge, with a message that explains the decision:
   ```
   $ git commit -m "Merge rohan-discount: keep the ₹150 discount the team agreed"
   [main a3f7248] Merge rohan-discount: keep the ₹150 discount the team agreed
   ```

Then **test it**. A merge can be "fixed" for Git and still be wrong for Bazaar:

```
$ python3 sale.py
Red Running Shoes       ₹999 ->    ₹849  Diwali offer!
Cotton Kurta            ₹649 ->    ₹499  Diwali offer!
Masala Box              ₹299 ->    ₹299
Wireless Earbuds      ₹1,499 ->  ₹1,349  Diwali offer!
Steel Water Bottle      ₹349 ->    ₹349
```

### Changed your mind? `git merge --abort`

Before you commit, `git merge --abort` cancels the whole merge. Everything goes back to how it was before `git merge`. Handy when you need to ask someone first.

### An analogy

Two editors fix the same newspaper article.

- One fixed a spelling in paragraph 2, the other added a sentence to paragraph 5. The chief editor simply takes both: a normal merge.
- Both rewrote **the same sentence**, differently. The chief editor can't guess. She circles both versions in red (the markers) and calls the two editors.
  They agree, she writes the final sentence, and signs it off (`git add`, `git commit`).

### Questions you may have

**Are conflicts a sign that someone made a mistake?** No. They're normal when two people work on the same code. Small branches, merged often, keep them small.

**Which one is "ours" and which "theirs"?** `HEAD` (top) is the branch you're on. The bottom part is the branch named after `>>>>>>>`.

**Can I just delete the other person's version?** Only if that's the right result. Removing someone's work silently is the classic merge bug. Ask.

**What if the conflict is in many files?** Same steps for each file. `git status` lists them all under `Unmerged paths`. `git add` each one when it's fixed.

## 3. See it in action

Press **Play** to watch the merges from this lesson. Then pick **Type your own commands** and try making a fast-forward yourself:
`git switch -c tiny`, `git commit -m "Small fix"`, `git switch main`, `git merge tiny`.

<div class="bz-diagram" data-diagram="commit-graph" data-state-sit="merge"></div>

## 4. Code example

The whole lesson as commands, on `main`:

```bash
git merge add-support-email                       # Fast-forward: main was just behind
git branch -d add-support-email                   # merged, so -d works now
git merge --no-edit diwali-sale                   # merge commit with two parents
# set DISCOUNT_PAISE = 15000 in sale.py, then:
git commit -am "Set Diwali discount to ₹150"
git merge rohan-discount                          # CONFLICT (content): Merge conflict in sale.py
git status                                        # both modified: sale.py
nano sale.py                                      # keep ₹150, delete the other line and the 3 marker lines
git add sale.py                                   # "fixed"
git commit -m "Merge rohan-discount: keep the ₹150 discount the team agreed"
python3 sale.py                                   # always test after a merge
```

## 5. Under the hood

### Committing too early

If you try to commit before fixing the file and running `git add`:

```
$ git commit -m "too early"
error: Committing is not possible because you have unmerged files.
hint: Fix them up in the work tree, and then use 'git add/rm <file>'
hint: as appropriate to mark resolution and make a commit.
fatal: Exiting because of an unresolved conflict.
U	sale.py
```

`U` = unmerged. In `git status --short` the file shows as `UU sale.py` (changed on both sides).

### Who changed what?

During a conflict, `git log --merge` lists only the commits that touched the conflicting lines, from both sides:

```
$ git log --merge --format="%h %an: %s"
4b961a1 Neha Kapoor: Set Diwali discount to ₹150
0ae5e66 Rohan Mehta: Raise Diwali discount to ₹200
```

Now you know exactly whom to talk to.

### The finished history

```
$ git log --oneline --graph
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

```
$ git show HEAD --stat | head -6
commit a3f7248f5dfcaa8180dd8add1de32b11ba6c4e39
Merge: 4b961a1 0ae5e66
Author: Neha Kapoor <neha@bazaar.example>
```

`Merge: 4b961a1 0ae5e66`: the two parents. Both branches are now merged, so `-d` deletes them without complaint:

```
$ git branch -d diwali-sale rohan-discount
Deleted branch diwali-sale (was 7ceaef0).
Deleted branch rohan-discount (was 0ae5e66).
```

??? note "Going deeper: the three-way merge"

    The "common starting point" is called the **merge base**: the newest commit both branches share. `git merge-base main rohan-discount` prints it.

    For each piece of each file, Git compares base → ours and base → theirs:

    | Base | Ours (`main`) | Theirs | Result |
    | --- | --- | --- | --- |
    | ₹100 | ₹100 | ₹200 | ₹200 (only they changed it) |
    | ₹100 | ₹150 | ₹100 | ₹150 (only we changed it) |
    | ₹100 | ₹150 | ₹150 | ₹150 (same change on both sides) |
    | ₹100 | ₹150 | ₹200 | **conflict** |

    Changes on lines that are right next to each other can also conflict, because Git can't be sure they don't depend on each other.

    `git diff` during a conflict shows a "combined diff" with two columns of `+`/`-`, one per side. Many people find the markers in the
    file easier to read. Editors like VS Code show buttons over the markers: "Accept Current Change", "Accept Incoming Change", "Accept Both Changes".

??? note "Going deeper: options that change how merge works"

    | Command | What it does |
    | --- | --- |
    | `git merge --no-ff feature` | always make a merge commit, even when a fast-forward is possible (keeps a visible "feature was merged here" point) |
    | `git merge --ff-only feature` | only fast-forward; refuse if a merge commit would be needed |
    | `git merge --squash feature` | put all the branch's changes on the stage as **one** change; you then commit it as a single normal commit |
    | `git checkout --ours sale.py` / `--theirs` | during a conflict, take one whole side's version of the file |
    | `git config --global merge.conflictStyle zdiff3` | markers also show the **base** version, so you can see what each side changed |

    Teams often pick one style for `main` (for example "squash merge every pull request"). Lesson 5 shows how GitHub offers these.

??? note "Going deeper: conflicts that aren't about lines"

    - **Modify/delete:** one side edited a file, the other deleted it. `CONFLICT (modify/delete)`. Decide: `git add` the file to keep it, or `git rm` it.
    - **Both added:** both sides created a file with the same name and different content.
    - **Binary files** (images, PDFs): Git can't put markers inside. You pick one: `git checkout --ours logo.png` or `--theirs`.
    - **Semantic conflicts:** Git merges cleanly, but the code is wrong. Rohan renamed a function, Neha called the old name on her branch.
      No markers, but the program crashes. Only tests catch this. That's why you always run the code (and later, automatic tests) after a merge.

## 6. Lab

**Lab folder:** `labs/03-git-and-github/03-merging-and-conflicts/`

```bash
cd labs/03-git-and-github/03-merging-and-conflicts
docker compose run --rm dev
```

The repository is ready, with the same hashes for everyone: `main`, `diwali-sale` (Lesson 2's sale), and `rohan-discount` (Rohan's ₹200, made by
"Rohan Mehta"). You'll make a fast-forward, merge the sale with a merge commit, set ₹150 on `main`, hit a real conflict with Rohan's branch,
read the markers, abort once, merge again, fix it with `nano`, and finish the merge.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Leaving markers in the file.** `<<<<<<< HEAD` is a Python syntax error, and it gets committed. **Fix:** search the file for `<<<<<<<` before `git add`.
2. **Keeping only "my" side without asking.** Rohan's work vanishes silently. **Fix:** read both sides, use `git log --merge`, and agree on the result.
3. **Merging in the wrong direction.** `git merge main` while on `diwali-sale` brings `main` into the feature, not the other way. **Fix:** `git switch main` first, then `git merge diwali-sale`.
4. **Not testing after a merge.** It merged, but the code is broken. **Fix:** run the program (and later the tests) every time.
5. **Panicking in the middle of a merge.** **Fix:** `git status` tells you exactly where you are; `git merge --abort` gets you out safely.

## 8. Quiz

<div class="bz-quiz" data-quiz="m03-03"></div>

## 9. What's next

Next: another way to join branches, which rewrites history into one straight line: [Rebase](04-rebase.md).

**In one line:** on `main`, `git merge <branch>`: a fast-forward if `main` was just behind, a merge commit otherwise; on a conflict,
decide with the team, edit out the markers, `git add`, `git commit`, and test.

### Cheat sheet

| Task | Command |
| --- | --- |
| Merge a branch into the one you're on | `git switch main` then `git merge diwali-sale` |
| Accept the ready merge message | `git merge --no-edit diwali-sale` |
| Where am I in a conflict? | `git status` (`UU` = both modified) |
| Who changed the conflicting lines? | `git log --merge` |
| Mark a file as fixed | `git add sale.py` |
| Finish the merge | `git commit -m "Merge …: why you chose this"` |
| Cancel the merge | `git merge --abort` |
| Delete merged branches | `git branch -d diwali-sale` |

| Marker | Means |
| --- | --- |
| `<<<<<<< HEAD` | start of **your** version (branch you're on) |
| `=======` | divider |
| `>>>>>>> rohan-discount` | end of **their** version (branch being merged in) |

> **Next in Bazaar:** the history now has merge "bubbles" everywhere. Some teams prefer one clean, straight line of commits.
> Rebase does that, but it rewrites history, so it comes with one golden rule.

<div class="bz-complete" data-lesson="m03-03"></div>
