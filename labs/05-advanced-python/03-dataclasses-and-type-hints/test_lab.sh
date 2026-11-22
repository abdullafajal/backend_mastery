#!/usr/bin/env bash
# Automated check for Lab 05-03. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m05-03"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Errors are joined to the output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }
run() { docker compose -p "$PROJECT" run --rm -T python sh -c "$1 2>&1" 2>/dev/null || true; }

echo "Building the lab image (Python 3.13 + mypy 2.4.1; the first time takes a minute)..."
docker compose -p "$PROJECT" build -q >/dev/null 2>&1

[[ "$(run 'mypy --version')" == "mypy 2.4.1"* ]] && pass "mypy 2.4.1 is installed" || fail "mypy: $(run 'mypy --version')"

[[ "$(py examples/before_after.py)" == "ProductByHand(name='Masala Box', price_paise=29900, seller='Patel Spices')
Product(name='Masala Box', price_paise=29900, seller='Patel Spices')
True" ]] && pass "before_after.py: @dataclass writes the same __init__/__repr__/__eq__" || fail "before_after: $(py examples/before_after.py)"

[[ "$(py examples/dataclass_features.py)" == "Product(name='Cotton Kurta', price_paise=64900, seller='Meera Handloom', stock=0)
[] ['Cotton Kurta']
Refused: price_paise must be a whole number above 0, not 'cheap'
Coupon(code='DIWALI150', discount_paise=15000)" ]] && pass "dataclass_features.py: default, default_factory, __post_init__, frozen" || fail "features: $(py examples/dataclass_features.py)"

[[ "$(py examples/type_hints.py)" == $'59800\n299299' ]] && pass "type_hints.py: Python ignores hints while running ('299' * 2 = '299299')" || fail "type_hints: $(py examples/type_hints.py)"

out=$(run 'mypy examples/type_hints.py')
[[ "$out" == *'examples/type_hints.py:9: error: Argument 1 to "line_total" has incompatible type "str"; expected "int"  [arg-type]'* ]] \
  && pass "mypy catches the wrong type before running" || fail "mypy hints: $out"

out=$(py exercises/cart.py)
[[ "$out" == *"ValueError: mutable default <class 'list'> for field lines is not allowed: use default_factory" ]] && pass "the exercise really fails (a list as a default)" || fail "exercise: $out"

[[ "$(py solutions/cart.py)" == $'Asha: []\nRavi: [(\'Cotton Kurta\', 1)]' ]] && pass "solution: default_factory=list gives each cart its own list" || fail "solution: $(py solutions/cart.py)"

[[ "$(run 'mypy solutions/cart.py')" == "Success: no issues found in 1 source file" ]] && pass "mypy: the solution has no type errors" || fail "mypy solution: $(run 'mypy solutions/cart.py')"

[[ "$(run 'python3 examples/deeper.py && mypy examples/deeper.py')" == "['Masala Box', 'Wireless Earbuds']
Product(price_paise=29900, name='Masala Box', tags=['spices'])
None
25
Success: no issues found in 1 source file" ]] && pass "deeper.py: order=True, list[str], Product | None; mypy clean" || fail "deeper: $(run 'python3 examples/deeper.py && mypy examples/deeper.py')"

m=$(py mistakes/frozen_change.py; py mistakes/default_order.py)
[[ "$m" == *"dataclasses.FrozenInstanceError: cannot assign to field 'discount_paise'"* && "$m" == *"TypeError: non-default argument 'seller' follows default argument 'stock'"* ]] \
  && pass "mistakes/: changing a frozen coupon; a field without default after one with" || fail "mistakes: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
