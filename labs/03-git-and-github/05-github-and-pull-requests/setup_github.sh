#!/usr/bin/env bash
# Builds the pretend GitHub: a bare repository at /srv/github/bazaar-team/bazaar.git with Bazaar's history
# (fixed dates, so the hashes are the same for everyone). Laptops: /laptops/neha and /laptops/rohan.
set -euo pipefail
at() { export GIT_AUTHOR_DATE="$1" GIT_COMMITTER_DATE="$1"; }
export GIT_AUTHOR_NAME="Neha Kapoor" GIT_AUTHOR_EMAIL="neha@bazaar.example" GIT_COMMITTER_NAME="Neha Kapoor" GIT_COMMITTER_EMAIL="neha@bazaar.example"
mkdir -p /srv/github/bazaar-team /laptops/neha /laptops/rohan
git init -q --bare -b main /srv/github/bazaar-team/bazaar.git
work=$(mktemp -d) && cp -a /seed/. "$work" && cd "$work"
git init -q -b main
printf ".env\n__pycache__/\n" > .gitignore
at "2026-11-02T10:00:00+05:30"; git add . && git commit -q -m "Add product catalog with 4 products"
sed -i 's/^]/    {"name": "Steel Water Bottle", "price_paise": 34900, "seller": "Sharma Electronics"},\n]/' products.py
at "2026-11-02T10:30:00+05:30"; git commit -q -am "Add Steel Water Bottle to the catalog"
cp /lab-files/sale.py . && sed -i 's/^DISCOUNT_PAISE = 10000      # ₹100 off/DISCOUNT_PAISE = 15000      # ₹150 off/' sale.py
at "2026-11-03T11:00:00+05:30"; git add sale.py && git commit -q -m "Add Diwali sale prices"
git push -q /srv/github/bazaar-team/bazaar.git main
cd / && rm -rf "$work"
