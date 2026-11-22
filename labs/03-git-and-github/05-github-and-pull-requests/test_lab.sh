#!/usr/bin/env bash
# Automated check for Lab 03-05. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m03-05"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
CATCHUP=${CATCHUP:-"git pull --rebase"}    # the step under test (a mutation test sets it to "true", i.e. skip it)

echo "Building the lab image (the first time takes a minute)..."
docker compose -p "$PROJECT" build -q >/dev/null 2>&1

out=$(docker compose -p "$PROJECT" run --rm -T -e CATCHUP="$CATCHUP" dev bash -c '
  GH=/srv/github/bazaar-team/bazaar.git; N=/laptops/neha/bazaar; R=/laptops/rohan/bazaar
  ( cd /laptops/neha && git clone -q $GH ); ( cd /laptops/rohan && git clone -q $GH )
  echo "== clone";   git -C $N log --oneline | wc -l; git -C $N config user.name; git -C $R config user.name
  cd $N
  git switch -q -c add-payment-info
  echo "Payment: UPI, cards, or cash on delivery." >> README.md && git commit -qam "Add payment options to the README"
  echo "== push";    git push -u origin add-payment-info 2>&1; git --git-dir=$GH branch --list add-payment-info
  cd $R
  echo "== review";  git fetch -q; git diff main...origin/add-payment-info | grep "^+Payment"
  git merge -q --no-ff -m "Merge pull request #1 from bazaar-team/add-payment-info" origin/add-payment-info; git push -q
  echo "== merged";  git --git-dir=$GH log -1 --format="%s|%P" main
  cd $N; git switch -q main
  echo "== stale";   git status | sed -n 2p; git fetch -q; git status | sed -n 2p
  echo "== pull";    git pull 2>&1; tail -1 README.md
  cd $R; echo "Returns: within 7 days." >> README.md && git commit -qam "Add the returns policy to the README" && git push -q
  cd $N; sed -i "s/\"seller\": \"Patel Spices\"}/\"seller\": \"Patel Spices\", \"stock\": 40}/" products.py; git commit -qam "Add stock count for Masala Box"
  echo "== rejected"; git push 2>&1; git --git-dir=$GH log -1 --format=%s main
  echo "== catchup";  $CATCHUP >/dev/null 2>&1; git push 2>&1 | tail -1; git --git-dir=$GH log -2 --format=%s main; git --git-dir=$GH rev-list --merges --count main
  echo "== cleanup";  git push -q origin --delete add-payment-info; git --git-dir=$GH branch | tr -d " *"
  echo "== end"
' 2>&1 || true)

section() { awk -v s="== $1" '$0==s{f=1;next} /^== /{f=0} f' <<< "$out"; }

[[ "$(section clone | tr -d ' ')" == $'3\nNehaKapoor\nRohanMehta' ]] && pass "both laptops cloned Bazaar (3 commits) and commit as Neha / Rohan" || fail "clone: $(section clone)"

p=$(section push)
[[ "$p" == *"* [new branch]      add-payment-info -> add-payment-info"* && "$p" == *"set up to track 'origin/add-payment-info'"* && "$(echo "$p" | tail -1 | tr -d ' ')" == "add-payment-info" ]] \
  && pass "git push -u put Neha's branch on \"GitHub\"" || fail "push: $p"

[[ "$(section review)" == "+Payment: UPI, cards, or cash on delivery." ]] && pass "Rohan fetched the branch and reviewed the change" || fail "review: $(section review)"

mg=$(section merged)
[[ "$mg" =~ ^Merge\ pull\ request\ \#1\ from\ bazaar-team/add-payment-info\|[0-9a-f]{40}\ [0-9a-f]{40}$ ]] \
  && pass "the pull request was merged on \"GitHub\" (merge commit, two parents)" || fail "merged: $mg"

[[ "$(section stale)" == $'Your branch is up to date with \'origin/main\'.\nYour branch is behind \'origin/main\' by 2 commits, and can be fast-forwarded.' ]] \
  && pass "status only knows about GitHub after git fetch" || fail "stale: $(section stale)"

pl=$(section pull)
[[ "$pl" == *"Fast-forward"* && "$(echo "$pl" | tail -1)" == "Payment: UPI, cards, or cash on delivery." ]] && pass "git pull brought the merged work to Neha's laptop" || fail "pull: $pl"

rj=$(section rejected)
[[ "$rj" == *"! [rejected]        main -> main (fetch first)"* && "$(echo "$rj" | tail -1)" == "Add the returns policy to the README" ]] \
  && pass "a push is rejected when GitHub has commits you don't have; nothing is overwritten" || fail "rejected: $rj"

c=$(section catchup)
[[ "$c" == *"main -> main"* && "$c" == *$'Add stock count for Masala Box\nAdd the returns policy to the README\n1' ]] \
  && pass "pull --rebase, then push: both changes on GitHub, in a straight line" || fail "catchup: $c"

[[ "$(section cleanup)" == "main" ]] && pass "the merged branch was deleted on GitHub" || fail "cleanup: $(section cleanup)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
