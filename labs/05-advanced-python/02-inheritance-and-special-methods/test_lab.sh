#!/usr/bin/env bash
# Automated check for Lab 05-02. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m05-02"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/inheritance.py)" == "Masala Box (₹299), delivered
Bazaar Gift Card (₹500), sent by email
True True
₹500" ]] && pass "inheritance.py: GiftCard overrides needs_delivery, inherits the rest" || fail "inheritance: $(py examples/inheritance.py)"

[[ "$(py examples/special_methods.py)" == "Masala Box - ₹299
[Product('Masala Box', 29900), Product('Steel Water Bottle', 34900)]
True
[Product('Masala Box', 29900), Product('Steel Water Bottle', 34900), Product('Wireless Earbuds', 149900)]
items in cart: 3" ]] && pass "special_methods.py: __str__, __repr__, __eq__, __lt__ (sorted), __len__" || fail "special: $(py examples/special_methods.py)"

out=$(py exercises/gift_card.py)
[[ "$out" == *"AttributeError: 'GiftCard' object has no attribute 'name'" ]] && pass "the exercise really crashes (no super().__init__, so no name)" || fail "exercise: $out"

[[ "$(py solutions/gift_card.py)" == $'Bazaar Gift Card (₹500) from Bazaar, sent by email\nto: priya@example.com' ]] && pass "solution: super().__init__ sets the shared parts" || fail "solution: $(py solutions/gift_card.py)"

[[ "$(py examples/deeper.py)" == "['GiftCard', 'Product', 'object']
299
AttributeError: property 'price_rupees' of 'Product' object has no setter
TypeError: unhashable type: 'Product'" ]] && pass "deeper.py: __mro__, a read-only property, __eq__ removes __hash__" || fail "deeper: $(py examples/deeper.py)"

[[ "$(py mistakes/override_typo.py)" == "gift card needs delivery? True" ]] && pass "mistakes/override_typo.py: a misspelled override silently keeps the parent's method" || fail "override_typo: $(py mistakes/override_typo.py)"
[[ "$(py mistakes/no_eq.py)" == "False" ]] && pass "mistakes/no_eq.py: without __eq__, two equal products aren't ==" || fail "no_eq: $(py mistakes/no_eq.py)"
[[ "$(py mistakes/no_lt.py)" == *"TypeError: '<' not supported between instances of 'Product' and 'Product'" ]] && pass "mistakes/no_lt.py: without __lt__, sorted() fails" || fail "no_lt: $(py mistakes/no_lt.py)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
