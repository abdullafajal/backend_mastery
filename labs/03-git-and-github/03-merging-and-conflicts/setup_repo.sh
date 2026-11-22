#!/usr/bin/env bash
# Builds the starting repository for Lesson 3, with fixed dates so every student gets the same hashes:
#   main:           catalog → Steel Water Bottle → README sellers line
#   diwali-sale:    ... → sale.py (₹100 off)                        (Lesson 2)
#   rohan-discount: diwali-sale → discount raised to ₹200, by Rohan Mehta
set -euo pipefail
cd /bazaar
at() { export GIT_AUTHOR_DATE="$1" GIT_COMMITTER_DATE="$1"; }
git init -q
printf ".env\n__pycache__/\n" > .gitignore
at "2026-11-02T10:00:00+05:30"; git add . && git commit -q -m "Add product catalog with 4 products"
sed -i 's/^]/    {"name": "Steel Water Bottle", "price_paise": 34900, "seller": "Sharma Electronics"},\n]/' products.py
at "2026-11-02T10:30:00+05:30"; git commit -q -am "Add Steel Water Bottle to the catalog"
git switch -q -c diwali-sale
cp /lab-files/sale.py .
at "2026-11-03T11:00:00+05:30"; git add sale.py && git commit -q -m "Add Diwali sale prices"
git switch -q -c rohan-discount
sed -i 's/^DISCOUNT_PAISE = 10000      # ₹100 off/DISCOUNT_PAISE = 20000      # ₹200 off/' sale.py
grep -q '^DISCOUNT_PAISE = 20000' sale.py
at "2026-11-04T09:00:00+05:30"
GIT_AUTHOR_NAME="Rohan Mehta" GIT_AUTHOR_EMAIL="rohan@bazaar.example" \
GIT_COMMITTER_NAME="Rohan Mehta" GIT_COMMITTER_EMAIL="rohan@bazaar.example" \
  git commit -q -am "Raise Diwali discount to ₹200"
git switch -q main
echo "Sellers: Sharma Electronics, Meera Handloom, Patel Spices, Kumar Footwear." >> README.md
at "2026-11-03T12:00:00+05:30"; git commit -q -am "List our sellers in the README"
