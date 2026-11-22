#!/usr/bin/env bash
# Builds the starting repository: the two commits from Lesson 1, with fixed dates,
# so every student gets the same commit hashes.
set -euo pipefail
cd /bazaar
git init -q
printf ".env\n__pycache__/\n" > .gitignore
export GIT_AUTHOR_DATE="2026-11-02T10:00:00+05:30" GIT_COMMITTER_DATE="2026-11-02T10:00:00+05:30"
git add . && git commit -q -m "Add product catalog with 4 products"
sed -i 's/^]/    {"name": "Steel Water Bottle", "price_paise": 34900, "seller": "Sharma Electronics"},\n]/' products.py
export GIT_AUTHOR_DATE="2026-11-02T10:30:00+05:30" GIT_COMMITTER_DATE="2026-11-02T10:30:00+05:30"
git commit -q -am "Add Steel Water Bottle to the catalog"
