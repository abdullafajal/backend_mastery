#!/usr/bin/env bash
# Automated check for Lab 03-04. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m03-04"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
JOIN=${JOIN:-"git rebase main"}     # the step under test (a mutation test sets this to "git merge --no-edit main")

echo "Building the lab image (the first time takes a minute)..."
docker compose -p "$PROJECT" build -q >/dev/null 2>&1

# The student's steps, in one fresh container. Each step prints a marker, so the checks can find its output.
out=$(docker compose -p "$PROJECT" run --rm -T -e JOIN="$JOIN" dev bash -c '
  echo "== start";   git branch --show-current; git rev-list --count main..free-delivery; git rev-list --count free-delivery..main
  echo "== rebase";  $JOIN 2>&1 | tr "\r" "\n" | tail -1
  echo "== after";   git rev-list --count free-delivery..main; git rev-list --count main..free-delivery
  echo "== newids";  git log --format="%h|%an|%s" -2
  echo "== works";   python3 delivery.py; grep -c "support@bazaar.example" README.md
  git switch -q main
  echo "== ff";      git merge free-delivery; git rev-list --merges --count main
  echo "== old";     git cat-file -t f46d2ff
  git switch -q rohan-readme
  echo "== conflict"; git rebase main 2>&1 | tr "\r" "\n"; git status | head -1
  printf "# Bazaar\n\nAn online marketplace. Run the catalog with \`python3 products.py\`.\nHelp: support@bazaar.example\nDelivery: free from ₹999, otherwise ₹49.\n" > README.md
  git add README.md
  echo "== continue"; GIT_EDITOR=true git rebase --continue 2>&1 | tail -1; grep -c "^<<<<<<<\|^>>>>>>>" README.md || true
  git rev-list --count rohan-readme..main; git log -1 --format=%s
  echo "== end"
' 2>&1 || true)

section() { awk -v s="== $1" '$0==s{f=1;next} /^== /{f=0} f' <<< "$out"; }

[[ "$(section start)" == $'free-delivery\n2\n1' ]] && pass "free-delivery has 2 of Rohan's commits; main has 1 newer commit" || fail "start: $(section start)"

[[ "$(section rebase)" == "Successfully rebased and updated refs/heads/free-delivery." ]] && pass "git rebase main succeeded" || fail "rebase: $(section rebase)"

[[ "$(section after)" == $'0\n2' ]] && pass "free-delivery now sits on top of main (0 behind, 2 ahead)" || fail "after: $(section after)"

ids=$(section newids)
[[ "$ids" == *"|Rohan Mehta|Add delivery examples"* && "$ids" == *"|Rohan Mehta|Add delivery charge rule"* && "$ids" != *f46d2ff* && "$ids" != *79d769b* ]] \
  && pass "same messages and author, but NEW hashes (rebase makes copies)" || fail "newids: $ids"

w=$(section works)
[[ "$w" == *"Cart   ₹999 (Red Running Shoes): delivery free"* && "$w" == *"Cart   ₹299 (Masala Box): delivery ₹49"* && "$(echo "$w" | tail -1)" == "1" ]] \
  && pass "delivery.py works, and Neha's README change is there too" || fail "works: $w"

f=$(section ff)
[[ "$f" == *"Fast-forward"* && "$(echo "$f" | tail -1)" == "0" ]] && pass "merging into main is now a fast-forward: a straight line, no merge commits" || fail "ff: $f"

[[ "$(section old)" == "commit" ]] && pass "the old commit f46d2ff still exists (that's why reflog can rescue you)" || fail "old: $(section old)"

c=$(section conflict)
[[ "$c" == *"CONFLICT (content): Merge conflict in README.md"* && "$c" == *"could not apply 99a09b3"* && "$c" == *"rebase in progress"* ]] \
  && pass "a rebase can stop with a conflict, too" || fail "conflict: $c"

[[ "$(section continue)" == $'Successfully rebased and updated refs/heads/rohan-readme.\n0\n0\nExplain delivery charges in the README' ]] \
  && pass "fixed, git add, git rebase --continue: done, on top of main" || fail "continue: $(section continue)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
