#!/usr/bin/env bash
# Automated check for Lab 04-06. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m04-06"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/try_except.py)" == "'3': OK, 3 added to the cart
'three': please type a number, like 3
The shop is still running." ]] && pass "try_except.py: 'three' gives a message, not a crash" || fail "try_except: $(py examples/try_except.py)"

[[ "$(py examples/two_errors.py)" == "Masala Box x2: ₹598
Gold Watch: sorry, Bazaar doesn't sell this
Cotton Kurta: bad quantity (invalid literal for int() with base 10: 'two')" ]] && pass "two_errors.py: KeyError and ValueError get different answers" || fail "two_errors: $(py examples/two_errors.py)"

[[ "$(py examples/raise_error.py)" == "Reserved 2 Masala Box. 38 left.
Can't reserve 10 Wireless Earbuds: only 8 Wireless Earbuds left
Can't reserve 0 Masala Box: quantity must be at least 1" ]] && pass "raise_error.py: your own rules raise ValueError with a reason" || fail "raise_error: $(py examples/raise_error.py)"

[[ "$(py examples/else_finally.py)" == "'5': 5 boxes
  (line checked)
'five': not a number
  (line checked)" ]] && pass "else_finally.py: else only without error, finally always" || fail "else_finally: $(py examples/else_finally.py)"

out=$(py exercises/bulk_order.py)
[[ "$out" == "Added 2"*"ValueError: invalid literal for int() with base 10: 'three'" ]] && pass "the exercise really crashes at 'three' (the last 3 lines are lost)" || fail "exercise: $out"

[[ "$(py solutions/bulk_order.py)" == "Added 2
Skipped 'three': not a number
Added 5
Skipped '': not a number
Added 1
Total boxes: 8" ]] && pass "solution: bad lines skipped, total 8 boxes" || fail "solution: $(py solutions/bulk_order.py)"

[[ "$(py mistakes/forgot_continue.py | tail -1)" == "Total boxes: 15" ]] && pass "mistakes/forgot_continue.py: no error, but 15 boxes instead of 8" || fail "forgot_continue: $(py mistakes/forgot_continue.py)"

m1=$(py mistakes/wrong_except.py); m2=$(py mistakes/bare_except.py)
[[ "$m1" == *"ValueError: invalid literal for int() with base 10: 'three'"* && "$m2" == "please type a number" ]] \
  && pass "mistakes/: the wrong except still crashes; a bare except hides a typo" || fail "mistakes: $m1 / $m2"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
