#!/usr/bin/env bash
# Automated check for Lab 03-03. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m03-03"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Building the lab image (the first time takes a minute)..."
docker compose -p "$PROJECT" build -q >/dev/null 2>&1

# The student's steps, in one fresh container. Each step prints a marker, so the checks can find its output.
out=$(docker compose -p "$PROJECT" run --rm -T dev bash -c '
  echo "== start";     git log --oneline --all | wc -l
  git switch -q -c add-support-email
  echo "Help: support@bazaar.example" >> README.md && git commit -q -am "Add the support email to the README"
  git switch -q main
  echo "== ff";        git merge add-support-email; git branch -d add-support-email
  echo "== merge";     git merge --no-edit diwali-sale; git log -1 --format=%P | wc -w
  echo "== sale";      python3 sale.py
  sed -i "s/^DISCOUNT_PAISE = 10000      # ₹100 off/DISCOUNT_PAISE = 15000      # ₹150 off/" sale.py
  git commit -q -am "Set Diwali discount to ₹150"
  echo "== conflict";  git merge rohan-discount; git status --short
  echo "== markers";   grep -c "^<<<<<<< HEAD$" sale.py; grep -c "^>>>>>>> rohan-discount$" sale.py
  echo "== commitearly"; git commit -m "too early" 2>&1
  python3 - <<"PY"
import re
s = open("sale.py").read()
s = re.sub(r"<<<<<<< HEAD\n(.*?)=======\n.*?>>>>>>> rohan-discount\n", r"\1", s, flags=re.S)   # keep HEAD = ₹150
open("sale.py", "w").write(s)
PY
  git add sale.py
  git commit -q -m "Merge rohan-discount: keep the ₹150 discount the team agreed"
  echo "== resolved";  grep -c "^<<<<<<<\|^=======\|^>>>>>>>" sale.py || true; git log -1 --format=%P | wc -w; git status --short | wc -l
  echo "== final";     python3 sale.py
  echo "== merged";    git branch --merged | tr -d " *" | sort | tr "\n" " "; echo
  echo "== end"
' 2>&1 || true)

section() { awk -v s="== $1" '$0==s{f=1;next} /^== /{f=0} f' <<< "$out"; }

[[ "$(section start | tr -d ' ')" == "5" ]] && pass "the starting repository has 5 commits on 3 branches" || fail "start: $(section start)"

[[ "$(section ff)" == *"Fast-forward"* ]] && pass "merging a branch that is simply ahead is a fast-forward" || fail "ff: $(section ff)"

m=$(section merge)
[[ "$m" == *"Merge made by the 'ort' strategy."* && "$(echo "$m" | tail -1 | tr -d ' ')" == "2" ]] \
  && pass "merging diwali-sale made a merge commit with two parents" || fail "merge: $m"

[[ "$(section sale)" == *"Red Running Shoes       ₹999 ->    ₹899  Diwali offer!"* ]] && pass "after the merge, main has sale.py" || fail "sale: $(section sale)"

c=$(section conflict)
[[ "$c" == *"CONFLICT (content): Merge conflict in sale.py"* && "$c" == *"UU sale.py"* ]] \
  && pass "Neha's ₹150 and Rohan's ₹200 on the same line give a real conflict" || fail "conflict: $c"

[[ "$(section markers)" == $'1\n1' ]] && pass "sale.py has conflict markers (<<<<<<< HEAD ... >>>>>>> rohan-discount)" || fail "markers: $(section markers)"

[[ "$(section commitearly)" == *"Exiting because of an unresolved conflict."* ]] && pass "Git refuses to commit before the conflict is fixed" || fail "commitearly: $(section commitearly)"

r=$(section resolved | tr '\n' ' ')
[[ "$r" =~ ^0\ +2\ +0\ $ ]] && pass "resolved: no markers left, a merge commit with two parents, nothing pending" || fail "resolved: $r"

f=$(section final)
[[ "$f" == *"Red Running Shoes       ₹999 ->    ₹849  Diwali offer!"* && "$f" == *"Masala Box              ₹299 ->    ₹299"* ]] \
  && pass "the final code gives the agreed ₹150 off" || fail "final: $f"

[[ "$(section merged)" == "diwali-sale main rohan-discount " ]] && pass "both branches are now merged into main" || fail "merged: $(section merged)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
