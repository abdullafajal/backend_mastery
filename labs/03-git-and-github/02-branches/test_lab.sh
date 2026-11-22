#!/usr/bin/env bash
# Automated check for Lab 03-02. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m03-02"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Building the lab image (the first time takes a minute)..."
docker compose -p "$PROJECT" build -q >/dev/null 2>&1

# The student's steps, in one fresh container. Each step prints a marker, so the checks can find its output.
out=$(docker compose -p "$PROJECT" run --rm -T dev bash -c '
  echo "== start";    git log --oneline
  git switch -q -c diwali-sale
  echo "== current";  git branch --show-current
  cp /lab-files/sale.py . && git add sale.py && git commit -q -m "Add Diwali sale prices"
  echo "== ahead";    git rev-parse --short main; git rev-list --count main..diwali-sale
  git switch -q main
  echo "== onmain";   ls
  echo "Sellers: Sharma Electronics, Meera Handloom, Patel Spices, Kumar Footwear." >> README.md
  git commit -q -am "List our sellers in the README"
  echo "== diverged"; git rev-parse --short "$(git merge-base main diwali-sale)"
  git rev-list --count diwali-sale..main; git rev-list --count main..diwali-sale
  git switch -q diwali-sale
  echo "== back";     python3 sale.py
  echo "== dirty";    echo "Diwali sale: 1-5 November" >> README.md; git switch main 2>&1; git branch --show-current
  git restore README.md
  echo "== delete";   git switch -q main; git branch -d diwali-sale 2>&1; git branch --list diwali-sale
  echo "== end"
' 2>&1 || true)

section() { awk -v s="== $1" '$0==s{f=1;next} /^== /{f=0} f' <<< "$out"; }

[[ "$(section start)" == $'66d2406 Add Steel Water Bottle to the catalog\n7bb892c Add product catalog with 4 products' ]] \
  && pass "the starting repository has Lesson 1's two commits" || fail "start: $(section start)"

[[ "$(section current)" == "diwali-sale" ]] && pass "git switch -c made the branch and moved to it" || fail "current: $(section current)"

[[ "$(section ahead)" == $'66d2406\n1' ]] && pass "a commit on diwali-sale leaves main where it was" || fail "ahead: $(section ahead)"

on=$(section onmain)
[[ "$on" == *products.py* && "$on" != *sale.py* ]] && pass "on main, sale.py is not in the folder" || fail "onmain: $on"

d=$(section diverged | tail -3 | tr '\n' ' ')
[[ "$d" == "66d2406 1 1 " ]] && pass "main and diwali-sale split at 66d2406, one commit each" || fail "diverged: $d"

b=$(section back)
[[ "$b" == *"Red Running Shoes       ₹999 ->    ₹899  Diwali offer!"* && "$b" == *"Masala Box              ₹299 ->    ₹299"* ]] \
  && pass "back on diwali-sale, sale.py is there and gives ₹100 off from ₹500" || fail "back: $b"

dt=$(section dirty)
[[ "$dt" == *"would be overwritten by checkout"* && "$(echo "$dt" | tail -1)" == "diwali-sale" ]] \
  && pass "Git refuses to switch when uncommitted changes would be lost" || fail "dirty: $dt"

del=$(section delete)
[[ "$del" == *"is not fully merged"* && "$del" == *"diwali-sale"* ]] && pass "git branch -d refuses to delete unmerged work" || fail "delete: $del"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
