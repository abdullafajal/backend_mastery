#!/usr/bin/env bash
# Builds the starting repository for Lesson 4, with fixed dates so every student gets the same hashes:
#   main:          catalog → Steel Water Bottle → Diwali sale → support email (Neha, after Rohan started)
#   free-delivery: Diwali sale → delivery rule → delivery examples (Rohan)
#   rohan-readme:  Diwali sale → delivery line in README (Rohan; conflicts with Neha's README line, for the optional task)
set -euo pipefail
cd /bazaar
at() { export GIT_AUTHOR_DATE="$1" GIT_COMMITTER_DATE="$1"; }
neha() { GIT_AUTHOR_NAME="Neha Kapoor" GIT_AUTHOR_EMAIL="neha@bazaar.example" \
         GIT_COMMITTER_NAME="Neha Kapoor" GIT_COMMITTER_EMAIL="neha@bazaar.example" git "$@"; }
git init -q
printf ".env\n__pycache__/\n" > .gitignore
at "2026-11-02T10:00:00+05:30"; git add . && neha commit -q -m "Add product catalog with 4 products"
sed -i 's/^]/    {"name": "Steel Water Bottle", "price_paise": 34900, "seller": "Sharma Electronics"},\n]/' products.py
at "2026-11-02T10:30:00+05:30"; neha commit -q -am "Add Steel Water Bottle to the catalog"
cp /lab-files/sale.py . && sed -i 's/^DISCOUNT_PAISE = 10000      # ₹100 off/DISCOUNT_PAISE = 15000      # ₹150 off/' sale.py
at "2026-11-03T11:00:00+05:30"; git add sale.py && neha commit -q -m "Add Diwali sale prices"
git switch -q -c free-delivery
cp /lab-files/delivery_v1.py delivery.py
at "2026-11-05T10:00:00+05:30"; git add delivery.py && git commit -q -m "Add delivery charge rule"
cp /lab-files/delivery.py delivery.py
at "2026-11-05T11:00:00+05:30"; git commit -q -am "Add delivery examples"
git switch -q main
git switch -q -c rohan-readme
echo "Delivery: free from ₹999, otherwise ₹49." >> README.md
at "2026-11-05T12:00:00+05:30"; git commit -q -am "Explain delivery charges in the README"
git switch -q main
echo "Help: support@bazaar.example" >> README.md
at "2026-11-05T15:00:00+05:30"; neha commit -q -am "Add the support email to the README"
git switch -q free-delivery
rm -f delivery_v1.py
