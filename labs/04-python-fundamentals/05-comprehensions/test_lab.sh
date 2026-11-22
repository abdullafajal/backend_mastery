#!/usr/bin/env bash
# Automated check for Lab 04-05. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m04-05"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

same=1
for d in exercises solutions mistakes; do cmp -s examples/catalog_data.py "$d/catalog_data.py" || same=0; done
[[ $same -eq 1 ]] && pass "all four copies of catalog_data.py are identical" || fail "catalog_data.py copies differ"

[[ "$(py examples/loop_vs_comprehension.py)" == $'[\'Masala Box\', \'Steel Water Bottle\']\n[\'Masala Box\', \'Steel Water Bottle\']' ]] \
  && pass "the loop and the comprehension build the same list" || fail "loop_vs: $(py examples/loop_vs_comprehension.py)"

out=$(py examples/list_comprehensions.py)
[[ "$out" == "['Red Running Shoes', 'Cotton Kurta', 'Masala Box', 'Wireless Earbuds', 'Steel Water Bottle']
[999, 649, 299, 1499, 349]
Reorder soon: ['Red Running Shoes', 'Wireless Earbuds']" ]] && pass "list comprehensions: names, rupees, low stock" || fail "list_comp: $out"

out=$(py examples/dict_and_set.py)
[[ "$out" == "29900
['Kumar Footwear', 'Meera Handloom', 'Patel Spices', 'Sharma Electronics']
{'Cotton Kurta': 16225, 'Masala Box': 11960, 'Steel Water Bottle': 20940}" ]] && pass "dict and set comprehensions: price_of, sellers, stock value" || fail "dict_and_set: $out"

[[ "$(py exercises/under_500.py)" == "Under ₹500: []" ]] && pass "the exercise really shows the bug (empty shelf: 500 is not ₹500)" || fail "exercise: $(py exercises/under_500.py)"

[[ "$(py solutions/under_500.py)" == "Under ₹500: ['Masala Box', 'Steel Water Bottle']" ]] && pass "solution: 50000 paise gives Masala Box and Steel Water Bottle" || fail "solution: $(py solutions/under_500.py)"

out=$(py examples/deeper.py)
[[ "$out" == "['too costly', 'too costly', 'Masala Box', 'too costly', 'Steel Water Bottle']
stock worth ₹ 73105
anything sold out? False
every price set?   True
['Masala Box', 'Masala Box', 'Cotton Kurta']" ]] && pass "deeper.py: if/else inside, sum/any/all, two fors" || fail "deeper: $out"

m=$(py mistakes/if_else_order.py; py mistakes/loop_name_outside.py)
[[ "$m" == *"SyntaxError: invalid syntax"* && "$m" == *"NameError: name 'p' is not defined"* ]] \
  && pass "mistakes/: if/else in the wrong place; the loop name doesn't exist outside" || fail "mistakes: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
