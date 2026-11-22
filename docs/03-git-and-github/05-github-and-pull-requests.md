# GitHub and pull requests

<div class="bz-meta" markdown>
**Module** 3 · Git and GitHub
**Lesson** 5
**Reading time** 15 min (+ optional deeper parts)
**You will build** Bazaar's shared repository with two laptops (Neha and Rohan): clone, push a branch, review and merge it like a pull request, and fix a rejected push
</div>

!!! abstract "In 1 minute"
    - **GitHub** keeps one shared copy of Bazaar's repository online. Each developer has their own full copy on their laptop.
    - `git clone` downloads it. `git push` uploads your commits. `git pull` downloads other people's commits.
    - Git calls the online copy **`origin`**. `origin/main` is "`main` as it was on GitHub, the last time I checked".
    - A **pull request** (PR) is a request on GitHub: "please merge my branch into `main`". A teammate reviews it first, then it's merged.
    - If someone pushed before you, your push is **rejected**. Fix: `git pull --rebase`, then `git push` again.

> **Previously in Bazaar:** Rohan rebased his free-delivery branch, so it joined `main` in one straight line.

## 1. Why learn this?

Until now, Neha and Rohan worked on one laptop each and passed code around by copying folders. Three problems:

1. If a laptop is lost, its work is gone.
2. Nobody knows which copy is the "real" Bazaar.
3. Changes reach `main` without anyone else looking at them. A typo in a price could go straight to customers.

GitHub solves all three: one shared home for the code, and **pull requests** so every change is reviewed before it reaches `main`.

## 2. The concept

### One online copy, many laptop copies

```
              GitHub  (bazaar-team/bazaar)
             ↗  ↙                     ↘  ↖
     push  pull                     pull  push
        Neha's laptop            Rohan's laptop
```

- Every laptop has the **full** repository: all commits, all history. You can work offline.
- GitHub's copy is the **meeting point**. You send your commits there, and collect everyone else's from there.
- A copy of a repository somewhere else is called a **remote**. The main remote is named **`origin`** by default.

### `git clone`: get your own copy

```bash
git clone https://github.com/bazaar-team/bazaar.git
```

This downloads everything and sets up `origin`, pointing to that address.

(In the lab, "GitHub" is a folder in the container, so the address there is `/srv/github/bazaar-team/bazaar.git`. Everything else works the same.)

### `git push`: send your branch

Neha makes a branch and commits, exactly like Lesson 2. The commit is **only on her laptop** until she pushes:

```
$ git push -u origin add-payment-info
To /srv/github/bazaar-team/bazaar.git
 * [new branch]      add-payment-info -> add-payment-info
branch 'add-payment-info' set up to track 'origin/add-payment-info'.
```

- `origin` = where to push. `add-payment-info` = which branch.
- `-u` remembers this pair. Next time, a plain `git push` is enough.

### Pull request: "please merge my branch"

On GitHub's website, Neha opens a **pull request** from `add-payment-info` into `main`. A pull request page shows:

- the **commits** and the exact **diff** (the "Files changed" tab);
- a **conversation**: teammates comment on any line ("Is cash on delivery available for every seller?");
- **reviews**: a teammate approves, or asks for changes;
- later in the course, **automatic checks** (tests run by GitHub, Module 24).

Neha can keep pushing new commits to the same branch. The pull request updates by itself.

When it's approved, someone clicks **Merge pull request**. GitHub merges the branch into `main` on GitHub, with a message like
`Merge pull request #1 from bazaar-team/add-payment-info`.

### `git fetch` and `git pull`: get other people's work

Your laptop **never updates by itself**. Look at Neha's laptop right after the merge on GitHub:

```
$ git status
On branch main
Your branch is up to date with 'origin/main'.
```

"Up to date" here means "up to date with what I **last saw** of GitHub". She hasn't looked yet. `git fetch` looks:

```
$ git fetch
From /srv/github/bazaar-team/bazaar
   3d5cfad..7cb3dd8  main       -> origin/main
$ git status
On branch main
Your branch is behind 'origin/main' by 2 commits, and can be fast-forwarded.
  (use "git pull" to update your local branch)
```

- **`git fetch`** downloads new commits and updates `origin/main`, but doesn't touch your files or your `main`.
- **`git pull`** = fetch + merge them into your branch. Here it's a fast-forward:

```
$ git pull
Updating 3d5cfad..7cb3dd8
Fast-forward
 README.md | 1 +
 1 file changed, 1 insertion(+)
```

### When your push is rejected

Rohan pushed a commit to `main`. Then Neha, who hadn't pulled it yet, pushes hers:

```
$ git push
To /srv/github/bazaar-team/bazaar.git
 ! [rejected]        main -> main (fetch first)
error: failed to push some refs to '/srv/github/bazaar-team/bazaar.git'
hint: Updates were rejected because the remote contains work that you do not
hint: have locally. This is usually caused by another repository pushing to
hint: the same ref. If you want to integrate the remote changes, use
hint: 'git pull' before pushing again.
hint: See the 'Note about fast-forwards' in 'git push --help' for details.
```

This is Git **protecting Rohan's work**. If Neha's push went through, Rohan's commit would be lost. So:

```bash
git pull --rebase      # get Rohan's commit, put mine on top of it (Lesson 4)
git push               # now it works
```

`--rebase` keeps the history a straight line. Plain `git pull` also works, but adds a merge commit.

(This was a small direct commit to `main`, which some small teams allow. In most teams, `main` is protected and **every** change goes through a pull request.
The same rejection happens when two people push to the same branch.)

### The everyday team workflow

1. `git switch main` and `git pull`: start from the newest `main`.
2. `git switch -c <feature>`: one branch per task.
3. Commit as you work. `git push -u origin <feature>`.
4. Open a pull request. Answer review comments with more commits.
5. When approved: **Merge pull request** on GitHub.
6. Back to step 1. Delete the old branch.

This is often called the **GitHub flow**.

### An analogy

GitHub is the **shop's main ledger at the head office**. Each shopkeeper keeps a full copy of the ledger at their own counter.

- `push` = sending your new pages to head office. `pull` = collecting the pages others sent.
- A pull request = putting your pages in the manager's tray with a note: "please add these to the main ledger".
  The manager checks them (review), then files them (merge).
- A rejected push = head office saying "someone sent pages after your last visit. Collect those first, then send yours."

### Questions you may have

**Is GitHub the same as Git?** No. Git is the tool on your laptop. GitHub is a website that hosts Git repositories, plus pull requests and team features.
GitLab and Bitbucket do the same job.

**Is a pull request a Git command?** No. It's a GitHub feature, on the website. (GitHub's `gh` tool can open one from the terminal: `gh pr create`.)

**Why "pull" request, if I pushed?** You're asking the project to **pull** your branch into `main`. GitLab calls the same thing a "merge request".

**Public or private?** A GitHub repository can be **public** (anyone can read it) or **private** (only people you invite). Bazaar's real code would be private.

## 3. See it in action

Pick a situation, then press **Play**.

<div class="bz-diagram" data-diagram="github-flow"></div>

## 4. Code example

The whole lesson, laptop by laptop. In the lab, `GH=/srv/github/bazaar-team/bazaar.git`. On real GitHub you'd use the `https://` or `git@github.com:` address instead.

```bash
# Neha's laptop: a branch, pushed for review
git clone $GH && cd bazaar
git switch -c add-payment-info
echo "Payment: UPI, cards, or cash on delivery." >> README.md
git commit -am "Add payment options to the README"
git push -u origin add-payment-info                  # then open a pull request on GitHub

# Rohan's laptop: review the branch
git fetch                                            # download new branches and commits
git log --oneline main..origin/add-payment-info      # which commits?
git diff main...origin/add-payment-info              # what changed? (the PR's "Files changed")

# In the lab only: do what GitHub's "Merge pull request" button does
git merge --no-ff -m "Merge pull request #1 from bazaar-team/add-payment-info" origin/add-payment-info
git push

# Neha's laptop again: get the merged main
git switch main
git pull
```

## 5. Under the hood

### What `clone` set up

```
$ git remote -v
origin	/srv/github/bazaar-team/bazaar.git (fetch)
origin	/srv/github/bazaar-team/bazaar.git (push)
$ git branch -a
* main
  remotes/origin/HEAD -> origin/main
  remotes/origin/main
```

`remotes/origin/main` is a **remote-tracking branch**: your laptop's memory of GitHub's `main`. Only `fetch` and `pull` update it.
`git branch -a` (all) shows them next to your own branches.

### Reviewing on the command line

After `git fetch`, Rohan sees Neha's branch, and the exact change the pull request shows:

```
$ git log --oneline main..origin/add-payment-info
6a4ebce Add payment options to the README
$ git diff main...origin/add-payment-info
diff --git a/README.md b/README.md
index a484915..55d664d 100644
--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
 # Bazaar
 
 An online marketplace. Run the catalog with `python3 products.py`.
+Payment: UPI, cards, or cash on delivery.
```

(Three dots in `main...origin/add-payment-info` = "what the branch changed since it split from `main`". That's what a pull request shows.)

### The merged history

```
$ git log --oneline --graph -4
*   7cb3dd8 Merge pull request #1 from bazaar-team/add-payment-info
|\  
| * 6a4ebce Add payment options to the README
|/  
* 3d5cfad Add Diwali sale prices
* 66d2406 Add Steel Water Bottle to the catalog
```

### Cleaning up a merged branch

```
$ git push origin --delete add-payment-info
To /srv/github/bazaar-team/bazaar.git
 - [deleted]         add-payment-info
$ git branch -d add-payment-info
Deleted branch add-payment-info (was 6a4ebce).
```

The first command deletes it on GitHub (the website also has a "Delete branch" button after merging). The second deletes your laptop's copy.

??? note "Going deeper: do it on real GitHub (optional, not checked by the lab test)"

    You need a free account at [github.com](https://github.com) and the SSH key from Module 2, Lesson 6.

    1. **Add your SSH key:** on GitHub, open Settings → **SSH and GPG keys** → **New SSH key**, and paste your **public** key (`~/.ssh/id_ed25519.pub`).
       Test it: `ssh -T git@github.com`. GitHub greets you by your user name.
    2. **Create a repository:** the **+** menu → **New repository**, name it `bazaar`, choose **Private**, and don't add a README (your repo already has one).
    3. **Connect and push** your Bazaar repository from Lesson 1:
       ```bash
       git remote add origin git@github.com:<your-user-name>/bazaar.git
       git push -u origin main
       ```
    4. **Open a pull request:** make a branch, commit, `git push -u origin <branch>`. GitHub shows a **Compare & pull request** button.
       Write a title and a short description (what and why), then **Create pull request**.
    5. **Review and merge:** the **Files changed** tab shows the diff. Then **Merge pull request**.

    GitHub's interface changes from time to time, so button names may differ a little. The steps stay the same.

??? note "Going deeper: the three merge buttons"

    The **Merge pull request** button has a menu with three choices. You know all three from Lessons 3 and 4:

    | Button | What GitHub does | History on `main` |
    | --- | --- | --- |
    | Create a merge commit | `git merge --no-ff` | the branch's commits + a merge commit |
    | Squash and merge | squashes all the branch's commits into one | one commit per pull request |
    | Rebase and merge | replays the commits on top of `main` | straight line, commits kept separately |

    Many teams use **Squash and merge**: `main` gets one clean commit per pull request, whatever happened on the branch.
    The repository settings can allow only the styles the team wants.

??? note "Going deeper: protecting main, forks, and more"

    - **Branch protection** (repository Settings): forbid direct pushes to `main`, require a pull request, require 1–2 approvals,
      require automatic checks to pass. This makes the GitHub flow a rule, not just a habit.
    - **Forks:** for projects where you can't push (most open-source projects), you **fork** the repository (your own copy on GitHub),
      push to your fork, and open a pull request from there. The original is usually added as a second remote, often named `upstream`.
    - **HTTPS vs SSH addresses:** `https://github.com/...` asks for a token (GitHub doesn't accept account passwords for Git);
      `git@github.com:...` uses your SSH key. Change it later with `git remote set-url origin <address>`.
    - **`git pull` settings:** `git config --global pull.rebase true` makes every `git pull` rebase. Without any setting,
      newer Git versions ask you to choose when your branch and GitHub's have both moved.
    - **Good pull requests are small.** 50–300 changed lines get a careful review. 3,000 lines get "looks good to me".

## 6. Lab

**Lab folder:** `labs/03-git-and-github/05-github-and-pull-requests/`

```bash
cd labs/03-git-and-github/05-github-and-pull-requests
docker compose run --rm dev
```

One container plays three computers: "GitHub" (`/srv/github/bazaar-team/bazaar.git`), Neha's laptop (`/laptops/neha`) and Rohan's laptop
(`/laptops/rohan`). Git commits as Neha or Rohan depending on the folder you're in. You'll clone on both laptops, push Neha's branch,
review it as Rohan, merge it the way GitHub's button does, pull it back, and then cause and fix a rejected push.

When you finish, run `bash test_lab.sh` (from your computer). You should see `ALL CHECKS PASSED`.

## 7. Common mistakes

1. **Committing and forgetting to push.** The work is only on your laptop; nobody sees it, and a lost laptop loses it. **Fix:** `git push` at the end of every work session.
2. **Starting work on an old `main`.** You get conflicts later. **Fix:** `git switch main` and `git pull` before making a new branch.
3. **Trusting `git status` without fetching.** "Up to date" only means "with what I last saw". **Fix:** `git fetch` first (or just `git pull`).
4. **"Fixing" a rejected push with `--force`.** It deletes your teammate's commits on GitHub. **Fix:** `git pull --rebase`, then `git push`.
5. **Huge pull requests.** Nobody can review 3,000 lines properly. **Fix:** small branches, one task each, merged often.

## 8. Quiz

<div class="bz-quiz" data-quiz="m03-05"></div>

## 9. What's next

Module 3 is complete! Next, in Module 4, Bazaar's code itself grows up: [Python fundamentals](../04-python-fundamentals/index.md).

**In one line:** `git clone` gets your copy, `git push` sends your branch to GitHub (`origin`), a pull request gets it reviewed and merged into `main`,
`git pull` brings everyone's work back, and a rejected push means "pull first".

### Cheat sheet

| Task | Command |
| --- | --- |
| Get a copy of a repository | `git clone <address>` |
| See the remotes | `git remote -v` |
| Send a new branch (first time) | `git push -u origin add-payment-info` |
| Send more commits (later) | `git push` |
| Download news, don't change my files | `git fetch` |
| Download and merge into my branch | `git pull` (`git pull --rebase` for a straight line) |
| See all branches, including GitHub's | `git branch -a` |
| What a branch changed (like a PR) | `git diff main...origin/<branch>` |
| Delete a branch on GitHub | `git push origin --delete <branch>` |
| Push was rejected | `git pull --rebase`, then `git push` |

| Word | Means |
| --- | --- |
| remote / `origin` | another copy of the repository; `origin` = the one you cloned from |
| `origin/main` | your laptop's memory of GitHub's `main` (updated by `fetch`/`pull`) |
| pull request | "please merge my branch into `main`", with review, on GitHub |

> **Next in Bazaar:** the code is safe, shared and reviewed. Now it needs to grow: products, carts and orders, written in clean Python.
> Module 4 starts Bazaar v0: a command-line product catalog.

<div class="bz-complete" data-lesson="m03-05"></div>
