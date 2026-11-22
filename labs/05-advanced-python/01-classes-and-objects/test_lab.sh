#!/usr/bin/env bash
# Automated check for Lab 05-01. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m05-01"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/product.py)" == "Masala Box ₹299.00
Masala Box stock: 38
Earbuds stock:    8
Not sold: only 8 Wireless Earbuds left" ]] && pass "product.py: two objects, each with its own stock; sell() raises" || fail "product: $(py examples/product.py)"

[[ "$(py examples/self_explained.py)" == $'36\nProduct True' ]] && pass "self_explained.py: masala.sell(2) is Product.sell(masala, 2)" || fail "self: $(py examples/self_explained.py)"

[[ "$(py examples/validate_and_repr.py)" == "Product('Cotton Kurta', 64900, 'Meera Handloom')
Refused: price_paise must be a whole number of paise above 0, not 'cheap'
The dict happily holds: cheap" ]] && pass "validate_and_repr.py: __init__ refuses 'cheap'; __repr__ prints nicely" || fail "validate: $(py examples/validate_and_repr.py)"

[[ "$(py examples/cart.py)" == "Ravi 2 lines, total 1247 rupees" ]] && pass "cart.py: a Cart of Products adds up to ₹1,247" || fail "cart: $(py examples/cart.py)"

[[ "$(py exercises/carts.py)" == "Asha: [('Cotton Kurta', 1), ('Masala Box', 2)]
Ravi: [('Cotton Kurta', 1), ('Masala Box', 2)]" ]] && pass "the exercise really shows the bug (one list shared by both carts)" || fail "exercise: $(py exercises/carts.py)"

[[ "$(py solutions/carts.py)" == "Asha: [('Masala Box', 2)]
Ravi: [('Cotton Kurta', 1)]" ]] && pass "solution: self.lines in __init__ → each cart has its own list" || fail "solution: $(py solutions/carts.py)"

m=$(py mistakes/no_self_param.py; py mistakes/no_self_dot.py; py mistakes/missing_arg.py)
[[ "$m" == *"TypeError: Product.label() takes 0 positional arguments but 1 was given"* \
   && "$m" == *"NameError: name 'name' is not defined. Did you mean: 'self.name'?"* \
   && "$m" == *"TypeError: Product.__init__() missing 1 required positional argument: 'price_paise'"* ]] \
  && pass "mistakes/: no self parameter, no self. prefix, missing argument" || fail "mistakes: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
