#!/usr/bin/env bash
# Automated check for Lab 05-04. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m05-04"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/functions_are_values.py)" == $'₹299\n[\'₹299\', \'₹649\']\n89910' ]] && pass "functions_are_values.py: store, pass and return functions" || fail "values: $(py examples/functions_are_values.py)"

[[ "$(py examples/log_calls.py)" == "→ supplier_price('Patel Spices', 'Masala Box')
← supplier_price returned 21000
→ supplier_price('Meera Handloom', 'Cotton Kurta')
← supplier_price returned 48000
total cost: 69000
supplier_price - What a seller charges Bazaar for one product, in paise." ]] && pass "log_calls.py: before/after lines around each call; wraps keeps the name" || fail "log_calls: $(py examples/log_calls.py)"

out=$(py examples/timed.py)
t1=$(sed -n 's/^fetch_supplier_prices took \([0-9.]*\) s$/\1/p' <<< "$out"); t2=$(sed -n 's/^build_catalog_page took \([0-9.]*\) s$/\1/p' <<< "$out")
if [[ "$t1" =~ ^[0-9]+\.[0-9]$ && "$t2" =~ ^[0-9]+\.[0-9]$ ]] && awk -v a="$t1" -v b="$t2" 'BEGIN{exit !(a>=0.3 && a<=0.5 && b>=0.1 && b<=0.3)}' \
   && [[ "$(tail -1 <<< "$out")" == "[21000, 23500] 14" ]]; then
  pass "timed.py: @timed measures 0.3 s and 0.1 s, and the results still come back"
else fail "timed: $out"; fi

[[ "$(py examples/retry.py)" == $'attempt 1 failed: supplier busy\nattempt 2 failed: supplier busy\nstock: 40' ]] && pass "retry.py: @retry(times=3) survives two failures" || fail "retry: $(py examples/retry.py)"

[[ "$(py exercises/price_with_gst.py)" == $'kurta_price: 64900 + 18% GST = 76582\nCustomer pays (paise): None' ]] && pass "the exercise really shows the bug (the wrapper returns None)" || fail "exercise: $(py exercises/price_with_gst.py)"
[[ "$(py solutions/price_with_gst.py)" == $'kurta_price: 64900 + 18% GST = 76582\nCustomer pays (paise): 76582' ]] && pass "solution: the wrapper returns the new price (76582 paise)" || fail "solution: $(py solutions/price_with_gst.py)"

[[ "$(py examples/deeper.py)" == "outer before
inner before
  checkout runs
inner after
outer after
2 2 5
slow lookups done: ['110001', '400001']" ]] && pass "deeper.py: stacking order; lru_cache skips the repeated lookup" || fail "deeper: $(py examples/deeper.py)"

[[ "$(py mistakes/no_wraps.py)" == "wrapper None" ]] && pass "mistakes/no_wraps.py: without functools.wraps the name becomes 'wrapper'" || fail "no_wraps: $(py mistakes/no_wraps.py)"
[[ "$(py mistakes/retry_no_args.py)" == "<function retry.<locals>.decorator.<locals>.wrapper at 0x"* ]] && pass "mistakes/retry_no_args.py: @retry without (times=3) silently returns a function" || fail "retry_no_args: $(py mistakes/retry_no_args.py)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
