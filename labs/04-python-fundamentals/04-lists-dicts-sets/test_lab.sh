#!/usr/bin/env bash
# Automated check for Lab 04-04. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m04-04"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

out=$(py examples/lists.py)
[[ "$out" == "['Masala Box', 'Cotton Kurta', 'Steel Water Bottle']
items: 3
first: Masala Box
last:  Steel Water Bottle
Masala Box in cart? True
['Masala Box', 'Steel Water Bottle']
- Masala Box
- Steel Water Bottle" ]] && pass "lists.py: append, len, [0], [-1], in, remove, for" || fail "lists: $out"

out=$(py examples/dicts.py | tr -s ' ')
[[ "$out" == "Masala Box
{'name': 'Masala Box', 'price_paise': 27900, 'seller': 'Patel Spices', 'stock': 40}
rating: None
rating: no ratings yet
has a seller? True
name Masala Box
price_paise 27900
seller Patel Spices
stock 40" ]] && pass "dicts.py: look up, change, add, .get, in, .items()" || fail "dicts: $out"

out=$(py examples/catalog.py | tr -s ' ')
[[ "$out" == "Red Running Shoes ₹ 999 stock 12
Cotton Kurta ₹ 649 stock 25
Masala Box ₹ 299 stock 40
Wireless Earbuds ₹ 1,499 stock 8
Steel Water Bottle ₹ 349 stock 60
Cheapest: Masala Box
Search 'bottle' -> Steel Water Bottle" ]] && pass "catalog.py: a list of dicts; cheapest product; search" || fail "catalog: $out"

out=$(py examples/sets_and_tuples.py)
[[ "$out" == "4 sellers
['Kumar Footwear', 'Meera Handloom', 'Patel Spices', 'Sharma Electronics']
Patel Spices sells here? True
Masala Box 59800" ]] && pass "sets_and_tuples.py: 5 names → 4 unique sellers; tuple unpacking" || fail "sets: $out"

out=$(py examples/aliasing.py)
[[ "$out" == "ashas_cart: ['Masala Box', 'Cotton Kurta']
ashas_cart: ['Masala Box', 'Cotton Kurta']
own_cart:   ['Masala Box', 'Cotton Kurta', 'Steel Water Bottle']" ]] && pass "aliasing.py: two names, one list; .copy() makes a new one" || fail "aliasing: $out"

out=$(py exercises/starter_cart.py)
[[ "$out" == *"Asha:    ['Masala Box sample', 'Cotton Kurta']"* ]] && pass "the exercise really shows the bug (Asha got Priya's kurta)" || fail "exercise: $out"

out=$(py solutions/starter_cart.py)
[[ "$out" == "Starter: ['Masala Box sample']
Asha:    ['Masala Box sample']
Priya:   ['Masala Box sample', 'Cotton Kurta']" ]] && pass "solution: with .copy(), only Priya's cart changes" || fail "solution: $out"

m=$(py mistakes/key_error.py; py mistakes/index_error.py; py mistakes/tuple_change.py)
[[ "$m" == *"KeyError: 'prize_paise'"* && "$m" == *"IndexError: list index out of range"* \
   && "$m" == *"TypeError: 'tuple' object does not support item assignment"* ]] && pass "mistakes/: KeyError, IndexError, changing a tuple" || fail "mistakes: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
