#!/usr/bin/env bash
# Automated check for Lab 04-03. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m04-03"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/rupees.py)" == $'₹299.00\n₹1,531.64\nEarbuds cost ₹1,499.00' ]] && pass "rupees(): one function, three calls" || fail "rupees: $(py examples/rupees.py)"

out=$(py examples/delivery.py)
[[ "$out" == $'cart 29900 paise -> delivery 4900 paise\ncart 99900 paise -> delivery 0 paise\ncart 159600 paise -> delivery 0 paise' ]] \
  && pass "delivery_charge(): returns 4900 below ₹999, 0 from ₹999" || fail "delivery: $out"

[[ "$(py examples/line_total.py)" == $'64900\n59800\n169800\n104700' ]] && pass "line_total(): default quantity=1 and keyword arguments" || fail "line_total: $(py examples/line_total.py)"

[[ "$(py examples/print_vs_return.py)" == $'subtotal is 124700\na = None\nb = 124700' ]] && pass "print is not return: a function without return gives back None" || fail "print_vs_return: $(py examples/print_vs_return.py)"

out=$(py examples/scope.py)
[[ "$out" == "11682"*"NameError: name 'tax' is not defined"* ]] && pass "scope.py: a local name doesn't exist outside its function" || fail "scope: $out"

out=$(py exercises/checkout.py)
[[ "$out" == *"TypeError: '>=' not supported between instances of 'NoneType' and 'int'"* ]] && pass "the exercise really crashes (cart_subtotal gives back None)" || fail "exercise: $out"

[[ "$(py solutions/checkout.py)" == $'Subtotal: ₹1,596.00\nDelivery: ₹0.00\nTotal:    ₹1,596.00' ]] && pass "solution: return subtotal → ₹1,596.00, free delivery" || fail "solution: $(py solutions/checkout.py)"

m=$(py mistakes/no_colon.py; py mistakes/missing_argument.py; py mistakes/call_before_def.py)
[[ "$m" == *"SyntaxError: expected ':'"* && "$m" == *"TypeError: delivery_charge() missing 1 required positional argument: 'total'"* \
   && "$m" == *"NameError: name 'rupees' is not defined"* ]] && pass "mistakes/: no colon, missing argument, call before def" || fail "mistakes: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
