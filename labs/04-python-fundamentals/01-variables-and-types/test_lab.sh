#!/usr/bin/env bash
# Automated check for Lab 04-01. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m04-01"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/types_tour.py | tr -s ' ')" == "'Masala Box' type: str
29900 type: int
True type: bool
4.5 type: float
None type: NoneType" ]] && pass "types_tour.py: str, int, bool, float, None" || fail "types_tour: $(py examples/types_tour.py)"

out=$(py examples/money_bug.py)
[[ "$out" == "float total: 765.8199999999999
equals 765.82? False
paise total: 76582
shown to the customer: ₹765.82" ]] && pass "money_bug.py: float gives 765.8199999999999, paise give exactly ₹765.82" || fail "money_bug: $out"

out=$(py examples/cart_line.py)
[[ "$out" == "Cotton Kurta x 3 = ₹1,947
type of quantity_text: str
type of quantity:      int
'3' * 3 = 333" ]] && pass "cart_line.py: int(\"3\") converts text to a number" || fail "cart_line: $out"

out=$(py examples/names.py)
[[ "$out" == $'price:     899\nold_price: 999\nsame object? False' ]] && pass "names.py: assigning again moves the name, the old value stays" || fail "names: $out"

[[ "$(py exercises/invoice.py | tail -1)" == "Total:    1531.6399999999999" ]] && pass "the exercise really shows the float bug (1531.6399999999999)" || fail "exercise: $(py exercises/invoice.py)"

out=$(py solutions/invoice.py)
[[ "$out" == "Customer: Ravi
Subtotal: ₹1,298.00
GST 18%:  ₹233.64
Total:    ₹1,531.64" ]] && pass "solution: Ravi's invoice in paise is exactly ₹1,531.64" || fail "solution: $out"

out=$(py -c 'int("three")')
[[ "$out" == *"ValueError: invalid literal for int() with base 10: 'three'"* ]] && pass "int(\"three\") gives ValueError" || fail "ValueError: $out"

out=$(py -c '"Price: ₹" + 299')
[[ "$out" == *'TypeError: can only concatenate str (not "int") to str'* ]] && pass "str + int gives TypeError" || fail "TypeError: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
