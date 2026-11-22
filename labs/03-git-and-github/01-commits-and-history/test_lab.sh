#!/usr/bin/env bash
# Automated check for Lab 03-01. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m03-01"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Building the lab image (the first time takes a minute)..."
docker compose -p "$PROJECT" build -q >/dev/null 2>&1

# The student's steps, in one fresh container. Each step prints a marker, so the checks can find its output.
out=$(docker compose -p "$PROJECT" run --rm -T dev bash -c '
  git config --global user.name "Neha Kapoor"
  git config --global user.email "neha@bazaar.example"
  git config --global init.defaultBranch main
  echo "== init";     git init
  echo "== ignore";   printf ".env\n__pycache__/\n" > .gitignore; git status --short
  git add .
  echo "== commit1";  git commit -m "Add product catalog with 4 products"
  sed -i "s/^]/    {\"name\": \"Steel Water Bottle\", \"price_paise\": 34900, \"seller\": \"Sharma Electronics\"},\n]/" products.py
  echo "== diff";     git diff
  echo "== commit2";  git commit -am "Add Steel Water Bottle to the catalog"
  echo "== log";      git log --oneline
  echo "== author";   git log -1 --format="%an <%ae>"
  echo "== restore";  echo oops > products.py; git restore products.py; python3 products.py; git status --short
  echo "== files";    git ls-files
  echo "== end"
' 2>&1 || true)

section() { awk -v s="== $1" '$0==s{f=1;next} /^== /{f=0} f' <<< "$out"; }

[[ "$(section init)" == "Initialized empty Git repository in /bazaar/.git/" ]] && pass "git init made a repository" || fail "init: $(section init)"

ign=$(section ignore)
[[ "$ign" != *".env"* && "$ign" == *"?? products.py"* ]] && pass ".gitignore hides .env (the password file) from Git" || fail "ignore: $ign"

[[ "$(section commit1)" == *"(root-commit)"*"3 files changed"* ]] && pass "first commit saved 3 files" || fail "commit1: $(section commit1)"

[[ "$(section diff)" == *'+    {"name": "Steel Water Bottle", "price_paise": 34900'* ]] && pass "git diff shows the new line with a +" || fail "diff: $(section diff)"

n=$(section log | wc -l | tr -d ' ')
[[ "$n" =~ ^[0-9]+$ && "$n" -eq 2 && "$(section log | head -1)" == *"Add Steel Water Bottle to the catalog" ]] \
  && pass "git log shows 2 commits, newest first" || fail "log ($n lines): $(section log)"

[[ "$(section author)" == "Neha Kapoor <neha@bazaar.example>" ]] && pass "commits carry the author from git config" || fail "author: $(section author)"

r=$(section restore)
[[ "$(echo "$r" | wc -l | tr -d ' ')" -eq 5 && "$(echo "$r" | tail -1)" == "Steel Water Bottle      ₹349  (Sharma Electronics)" ]] \
  && pass "git restore brought back the last committed version" || fail "restore: $r"

[[ "$(section files | tr '\n' ' ')" == ".gitignore README.md products.py " ]] && pass "the repository tracks 3 files, not .env" || fail "files: $(section files)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
