# Rebase

<div class="bz-meta" markdown>
**Module** 3 · Git and GitHub
**Lesson** 4
**Reading time** 15 min (+ optional deeper parts)
**You will build** Rohan's free-delivery branch, moved on top of the newest `main` with `git rebase`, then joined in one straight line
</div>

!!! abstract "In 1 minute"
    - Your branch started from an old `main`. Since then, `main` got new commits. **Rebase** moves your work so it starts from the **newest** `main`.
    - `git rebase main` copies your commits, one by one, on top of `main`. The copies get **new hashes**.
    - Afterwards, merging into `main` is a simple fast-forward: the history is **one straight line**, with no merge commit.
    - **Golden rule:** only rebase commits that are **only on your computer**. Never rebase commits other people already have.
    - A rebase can hit a conflict too. Fix the file, `git add`, then `git rebase --continue` (or `git rebase --abort` to cancel).

> **Previously in Bazaar:** Neha merged the Diwali sale and fixed a real conflict with Rohan. The history now has merge "bubbles".

## 1. Why learn this?

Rohan is building free delivery for Bazaar: no delivery charge on carts of ₹999 or more. He started his branch on Wednesday morning.

On Wednesday afternoon, Neha added a commit to `main`. Rohan's branch is now **out of date**: it doesn't have Neha's change.

He has two ways to catch up. Merge (Lesson 3) works, but adds another merge commit. **Rebase** gives a cleaner story. Many teams prefer it,
so you'll meet it in your first job.

## 2. The concept

### The situation, as a picture

Read each picture from left (old) to right (new). Each code is a commit.

```
                 79d769b ── f46d2ff      ← free-delivery (Rohan, 2 commits)
               /
... ── 3d5cfad
               \
                 f2939ea                 ← main (Neha's new commit)
```

Rohan's two commits start from `3d5cfad`. But `main` has moved on to `f2939ea`.

### What rebase does

```bash
git rebase main          # run this while you are ON free-delivery
```

Rebase means "**re-base**": give my commits a new starting point (a new base). Git does three things:

1. It sets Rohan's two commits aside.
2. It moves `free-delivery` to the newest `main` commit, `f2939ea`.
3. It **replays** Rohan's commits on top, one by one, as if he had written them just now.

```
... ── 3d5cfad ── f2939ea ── 96286bf ── 27ff12f      ← free-delivery
                     ↑
                    main
```

One straight line. Rohan's work now sits **after** Neha's commit.

Real output:

```
$ git rebase main
Successfully rebased and updated refs/heads/free-delivery.
```

### New hashes: rebase makes copies

Look closely: `79d769b` became `96286bf`, and `f46d2ff` became `27ff12f`.

```
$ git log --format="%h %an: %s" -4
27ff12f Rohan Mehta: Add delivery examples
96286bf Rohan Mehta: Add delivery charge rule
f2939ea Neha Kapoor: Add the support email to the README
3d5cfad Neha Kapoor: Add Diwali sale prices
```

Same message, same author, same change. But a **new hash**. Why?
A hash is made from everything in a commit, **including its parent**. The parent changed, so the hash changed.
So these are really **new commits**: copies of the old ones.

### Then: a fast-forward

Now `main` is simply behind `free-delivery`. Merging is a fast-forward (Lesson 3):

```
$ git switch main
$ git merge free-delivery
Updating f2939ea..27ff12f
Fast-forward
 delivery.py | 17 +++++++++++++++++
 1 file changed, 17 insertions(+)
 create mode 100644 delivery.py
```

```
$ git log --oneline --graph
* 27ff12f Add delivery examples
* 96286bf Add delivery charge rule
* f2939ea Add the support email to the README
* 3d5cfad Add Diwali sale prices
* 66d2406 Add Steel Water Bottle to the catalog
* 7bb892c Add product catalog with 4 products
```

No `|\` bubbles. Anyone reading this history sees one clear story.

### Merge or rebase? Side by side

Both bring Neha's change into Rohan's work. The **files** end up the same. Only the **history** looks different.

| | `git merge main` | `git rebase main` |
| --- | --- | --- |
| What it does | adds a merge commit joining both lines | copies your commits on top of `main` |
| History | true record, with bubbles | one straight line |
| Your commits' hashes | stay the same | **change** (new copies) |
| Safe on shared commits? | yes, always | **no** (see the golden rule) |

Neither is "wrong". Teams pick one style. A common habit: **rebase your own branch** to bring it up to date, then **merge** it into `main`.

### The golden rule

> **Only rebase commits that nobody else has.**

Why? Rebase throws away the old commits and makes new copies. Suppose Rohan had already shared `79d769b` with Neha (on GitHub, next lesson).
Neha builds on `79d769b`. Then Rohan rebases, and `79d769b` "disappears" from his branch, replaced by `96286bf`.
Now two versions of the same work exist. Neha's next merge brings back the old copies, and the history becomes a mess of duplicates.

So: rebase **before** you share your branch, or only on a branch that is just yours. When in doubt, merge.

### An analogy

You're writing chapter 5 of a group notebook. While you write, your friend adds chapter 4.

- **Merge** = you staple your chapter after the notebook, with a note: "chapter 5 was written before chapter 4 existed". True, but messy.
- **Rebase** = you **rewrite** your chapter on fresh pages after chapter 4, as if you'd started after it. Clean, but they're **new pages**.

**Where it breaks:** if your friends already photocopied your old pages, now there are two versions going around. That's the golden rule.

### Questions you may have

**Did rebase delete Rohan's old commits?** Not right away. They still exist in `.git`, but no branch points to them, so `git log` doesn't show them.
Git cleans such commits up after some weeks. Until then, `git reflog` can find them (see Going deeper).

**Do I run `git rebase main` on `main`?** No. Stand on **your branch** (`free-delivery`) and rebase it onto `main`. Rebase changes the branch you're on.

**Does `git pull` have anything to do with this?** Yes, in the next lesson: `git pull --rebase` uses rebase to bring in other people's commits.

## 3. See it in action

Press **Play** to watch Rohan's rebase. The grey boxes are the old commits that got left behind.
Then pick **Type your own commands** and compare: `git switch -c idea`, `git commit -m "A"`, `git switch main`, `git commit -m "B"`,
`git switch idea`, then `git rebase main`.

<div class="bz-diagram" data-diagram="commit-graph" data-state-sit="rebase"></div>

## 4. Code example

The file on Rohan's branch. Money in integer paise, and one simple rule:

```python title="delivery.py"
--8<-- "labs/03-git-and-github/04-rebase/lab-files/delivery.py"
```

```
$ python3 delivery.py
Cart   ₹999 (Red Running Shoes): delivery free
Cart   ₹649 (Cotton Kurta): delivery ₹49
Cart   ₹299 (Masala Box): delivery ₹49
```

The whole lesson as commands:

```bash
git switch free-delivery          # stand on YOUR branch
git rebase main                   # copy my commits on top of the newest main
python3 delivery.py               # still works? (always test)
git switch main
git merge free-delivery           # Fast-forward: one straight line
git branch -d free-delivery
```

## 5. Under the hood

### Which commits get copied?

Before the rebase, ask Git: "which commits are on my branch but not on `main`?"

```
$ git log --format="%h %an: %s" main..free-delivery
f46d2ff Rohan Mehta: Add delivery examples
79d769b Rohan Mehta: Add delivery charge rule
```

`main..free-delivery` means "in `free-delivery`, but not in `main`". These two commits are exactly what rebase replays.

### A conflict during rebase

Rohan has a second branch, `rohan-readme`. It adds a line to the end of `README.md`. Neha also added a line there. Rebasing it:

```
$ git rebase main
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

It's the same kind of conflict as in Lesson 3, with the same markers:

```
<<<<<<< HEAD
Help: support@bazaar.example
=======
Delivery: free from ₹999, otherwise ₹49.
>>>>>>> 99a09b3 (Explain delivery charges in the README)
```

**Careful, it's flipped:** during a rebase, `HEAD` (top) is **`main`'s** version, and the bottom is **your** commit being replayed.
That's because Git is standing on `main` and adding your commit to it.

Here both lines should stay. The fix has three steps:

1. Edit `README.md`: keep both lines, delete the three marker lines.
2. `git add README.md`
3. `git rebase --continue` (Git may open the editor with the commit message: just save and close)

```
$ git rebase --continue
[detached HEAD 1ef2d2e] Explain delivery charges in the README
 1 file changed, 1 insertion(+)
Successfully rebased and updated refs/heads/rohan-readme.
```

(`detached HEAD` is normal while a rebase is running: Git builds the copies first, then moves your branch to them.)

If you have several commits, Git stops at **each one** that conflicts. Repeat: fix, `add`, `--continue`. `git rebase --abort` cancels everything.

??? note "Going deeper: reflog, your safety net"

    `git reflog` lists every place `HEAD` has been, even commits no branch points to any more:

    ```
    $ git reflog -6
    27ff12f HEAD@{0}: merge free-delivery: Fast-forward
    f2939ea HEAD@{1}: checkout: moving from free-delivery to main
    27ff12f HEAD@{2}: rebase (finish): returning to refs/heads/free-delivery
    27ff12f HEAD@{3}: rebase (pick): Add delivery examples
    96286bf HEAD@{4}: rebase (pick): Add delivery charge rule
    f2939ea HEAD@{5}: rebase (start): checkout main
    ```

    Read it bottom-up: the rebase started from `main`, **picked** (replayed) each commit, and finished. The old commits still exist:
    `git cat-file -t f46d2ff` prints `commit`.

    A rebase went wrong and you want the old branch back? Find the old hash in the reflog, then:
    `git switch -c rescue f46d2ff`. The reflog is only on your computer. By default it keeps entries for 90 days (30 days for commits no branch can reach).

??? note "Going deeper: interactive rebase (cleaning up your own commits)"

    `git rebase -i main` opens a list of your commits in the editor, one per line, each starting with `pick`:

    ```
    pick 79d769b Add delivery charge rule
    pick f46d2ff Add delivery examples
    ```

    Change the word in front to tell Git what to do with each commit, then save:

    | Word | Effect |
    | --- | --- |
    | `pick` | keep it as it is |
    | `reword` | keep it, but change the message |
    | `squash` | join it into the commit above (both messages kept, for you to edit) |
    | `fixup` | join it into the commit above, drop its message |
    | `drop` | remove it |

    You can also reorder lines. It's the tool for turning "WIP", "typo", "fix again" into a few clean commits **before** you share them.
    Same golden rule: only on commits nobody else has.

??? note "Going deeper: rebase options and force-push"

    - `git rebase --onto main old-base my-branch`: move only part of a branch.
    - `git pull --rebase`: fetch other people's commits, then replay yours on top (Lesson 5). `git config --global pull.rebase true` makes it the default.
    - `git rebase --autostash`: put uncommitted changes aside before the rebase and bring them back after.
    - If you rebase a branch you already pushed to GitHub, a normal push is refused, because the history changed.
      `git push --force-with-lease` overwrites it, but only if nobody else pushed in the meantime. Use it only on your own branch,
      never on `main`. (Plain `--force` doesn't check, and can delete a teammate's work.)

## 6. Lab

**Lab folder:** `labs/03-git-and-github/04-rebase/`

```bash
cd labs/03-git-and-github/04-rebase
docker compose run --rm dev
```

This time you're **Rohan**, on his laptop. The repository is ready, with the same hashes for everyone: `main` (Neha's newest commit `f2939ea`),
your `free-delivery` branch (2 commits), and `rohan-readme`. Look at the split, rebase `free-delivery` onto `main`, notice the new hashes,
test `delivery.py`, fast-forward `main`, and then (optional) fix a conflict during a rebase.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Rebasing a branch others already have.** Duplicate commits and confused teammates. **Fix:** rebase only commits that are just yours; otherwise merge.
2. **Running `git rebase main` while on `main`.** Rebase changes the branch you're **on**. **Fix:** `git switch free-delivery` first.
3. **Forgetting `--continue`.** After fixing a conflict and `git add`, the rebase is still paused. **Fix:** `git status` says `rebase in progress`; run `git rebase --continue`.
4. **Using `git commit` in the middle of a rebase.** It makes an extra commit. **Fix:** after `git add`, use `git rebase --continue`.
5. **Panicking because "my commits are gone".** They have new hashes, or they're in the reflog. **Fix:** `git log`, then `git reflog`.

## 8. Quiz

<div class="bz-quiz" data-quiz="m03-04"></div>

## 9. What's next

Next: putting Bazaar's repository on GitHub, sharing branches with `push` and `pull`, and reviewing work with pull requests: [GitHub and pull requests](05-github-and-pull-requests.md).

**In one line:** on your branch, `git rebase main` copies your commits (with new hashes) on top of the newest `main`, so the history stays
one straight line; never rebase commits other people already have.

### Cheat sheet

| Task | Command |
| --- | --- |
| Bring my branch up to date with `main` | `git switch my-branch` then `git rebase main` |
| Which commits will be replayed? | `git log --oneline main..my-branch` |
| After fixing a conflict | `git add <file>` then `git rebase --continue` |
| Skip the commit that conflicts | `git rebase --skip` |
| Cancel the whole rebase | `git rebase --abort` |
| Find "lost" commits | `git reflog` |
| Clean up my commits before sharing | `git rebase -i main` |

| | Merge | Rebase |
| --- | --- | --- |
| History | true record, with bubbles | straight line |
| Hashes | unchanged | new copies |
| On shared commits | safe | **never** |

> **Next in Bazaar:** Neha and Rohan swap code by copying folders around. Each laptop has a different history, and nobody reviews anything.
> Bazaar's code needs one shared home online, and a way to review changes before they reach `main`: GitHub and pull requests.

<div class="bz-complete" data-lesson="m03-04"></div>
