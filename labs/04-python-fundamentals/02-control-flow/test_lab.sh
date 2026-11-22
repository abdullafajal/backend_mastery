#!/usr/bin/env bash
# Automated check for Lab 04-02. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m04-02"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }
coupon() { docker compose -p "$PROJECT" run --rm -T python sh -c \
  "sed -e 's/^code = \"DIWALI150\"/code = \"$1\"/' -e 's/^cart_total = 64900 /cart_total = $2 /' examples/coupon.py | python3 - 2>&1" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

out=$(py examples/delivery.py)
[[ "$out" == $'Cart ₹299: delivery ₹49\nCart ₹998: delivery ₹49\nCart ₹999: delivery free\nCart ₹1,499: delivery free' ]] \
  && pass "delivery.py: free from exactly ₹999 (>=), ₹49 below" || fail "delivery: $out"

c=$(coupon DIWALI150 64900; coupon DIWALI150 29900; coupon FREEDELIVERY 29900; coupon "" 29900; coupon diwali150 64900)
[[ "$c" == $'₹150 off\nDIWALI150 needs a cart of ₹500 or more\nfree delivery\nno coupon\nunknown coupon' ]] \
  && pass "coupon.py: if / elif / else with and, or, not (five codes)" || fail "coupon: $c"

out=$(py examples/cart_total.py | tr -s ' ')
[[ "$out" == $'Cotton Kurta x1 ₹ 649\nMasala Box x2 ₹ 598\nSteel Water Bottle x1 ₹ 349\nTotal ₹1,596' ]] \
  && pass "cart_total.py: a for loop adds Ravi's cart to ₹1,596" || fail "cart_total: $out"

out=$(py examples/stock.py)
[[ "$out" == "Sold one Masala Box. 2 left.
Sold one Masala Box. 1 left.
Sold one Masala Box. 0 left.
Out of stock!
Sold 2. 3 left.
Wants 4, only 3 left: refused.
Sold 2. 1 left.
Sold 1. 0 left.
Sold out. Closing orders." ]] && pass "stock.py: while stops at 0; continue skips, break stops (the last order is never seen)" || fail "stock: $out"

[[ "$(py exercises/checkout.py)" == $'Subtotal: ₹349\nDelivery: ₹49\nTotal:    ₹398' ]] && pass "the exercise really shows the bug (only the last item counted)" || fail "exercise: $(py exercises/checkout.py)"

[[ "$(py solutions/checkout.py)" == $'Subtotal: ₹1,596\nDelivery: free\nTotal:    ₹1,596' ]] && pass "solution: subtotal ₹1,596 with free delivery" || fail "solution: $(py solutions/checkout.py)"

m=$(py mistakes/no_colon.py; py mistakes/no_indent.py; py mistakes/one_equals.py)
[[ "$m" == *"SyntaxError: expected ':'"* && "$m" == *"IndentationError: expected an indented block after 'if' statement on line 2"* \
   && "$m" == *"SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?"* ]] \
  && pass "mistakes/: missing colon, missing indent, = instead of ==" || fail "mistakes: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
