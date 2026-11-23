#!/usr/bin/env bash
# Automated check for Lab 06-01. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m06-01"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }
secs() { sed -n "s/.*took \([0-9][0-9]*\.[0-9][0-9]\) s.*/\1/p" <<< "$1" | head -1; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/count_steps.py | tr -s ' ')" == " n O(1) O(log n) O(n) O(n log n) O(n²)
 10 1 4 10 40 100
 100 1 7 100 700 10,000
 1,000 1 10 1,000 10,000 1,000,000
 10,000 1 14 10,000 140,000 100,000,000
1,000,000 1 20 1,000,000 20,000,000 1,000,000,000,000" ]] && pass "count_steps.py: the step table for O(1) … O(n²)" || fail "count_steps: $(py examples/count_steps.py)"

out=$(py examples/list_vs_set.py)
ratio=$(sed -n 's/^the set was about \([0-9,]*\) times faster$/\1/p' <<< "$out" | tr -d ,)
[[ "$out" == *"list: 200 found"* && "$out" == *"set:  200 found"* && "$ratio" =~ ^[0-9]+$ && "$ratio" -ge 100 ]] \
  && pass "list_vs_set.py: both find 200; the set is ${ratio}× faster" || fail "list_vs_set: $out"

[[ "$(py examples/binary_search.py | tr -s ' ')" == " 29,900: index 298 after 19 steps
 64,900: index 648 after 19 steps
 99,999,900: index 999,998 after 19 steps
 12,345: index -1 after 20 steps" ]] && pass "binary_search.py: 1,000,000 prices, at most 20 steps" || fail "binary: $(py examples/binary_search.py)"

ex=$(py exercises/repeat_customers.py); so=$(py solutions/repeat_customers.py)
te=$(secs "$ex"); ts=$(secs "$so")
if [[ "$ex" == "repeat customers: 386"* && "$so" == "repeat customers: 386"* && "$te" =~ ^[0-9.]+$ && "$ts" =~ ^[0-9.]+$ ]] \
   && awk -v e="$te" -v s="$ts" 'BEGIN{exit !(e >= 0.3 && s <= e / 10)}'; then
  pass "exercise ${te} s vs solution ${ts} s: same 386 repeat customers, the set version far faster"
else fail "repeat: $ex / $so"; fi

m=$(py mistakes/set_in_loop.py)
[[ "$m" =~ ^"repeat customers: 28, took "[0-9]+\.[0-9]+" s"$ ]] && pass "mistakes/set_in_loop.py: right answer, but the set is rebuilt every time" || fail "set_in_loop: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
