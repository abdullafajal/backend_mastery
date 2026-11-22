#!/usr/bin/env bash
# Automated check for Lab 01-03. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m01-03"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
run() { compose run --rm -T python python3 "$@" 2>/dev/null; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

out=$(run names_and_objects.py)
[[ "$out" == *"same object? True"* && "$out" == *"same object? False"* && "$out" == *"999 ->   28 bytes"* ]] \
  && pass "names_and_objects.py: shared list, real copy, int = 28 bytes" || fail "names_and_objects: $out"

out=$(run cart_bugs.py)
[[ "$out" == *"Ravi: ['Masala Box', 'Cotton Kurta']"* && "$out" == *"fixed, Ravi: ['Cotton Kurta']"* ]] \
  && pass "cart_bugs.py: shared default list bug, and its fix" || fail "cart_bugs: $out"

out=$(run call_stack.py)
[[ "$out" == *"in price_of"* && "$out" == *"recursive: RecursionError: maximum recursion depth exceeded"* && "$out" == *"with a loop: 5000"* ]] \
  && pass "call_stack.py: stack printed, RecursionError at 5000 levels, loop works" || fail "call_stack: $out"

out=$(run who_frees.py)
step1=$(echo "$out" | sed -n '/deleted the name `order`/,/deleted the name `also`/p')
[[ "$step1" == *"order #1042 was freed"* && "$out" == *"nothing was freed"* && "$out" == *"order #1 was freed"* && "$out" == *"gc.collect() found"* ]] \
  && pass "who_frees.py: freed at the last reference; the cycle only by gc.collect()" || fail "who_frees: $out"

# RAM column for an exact request count (e.g. 50000 must not match 150000)
rss() { echo "$1" | awk -F'|' -v n="$2" '{r=$1; gsub(/[^0-9]/,"",r)} r==n {m=$2; gsub(/[^0-9]/,"",m); print m}'; }
is_num() { [[ "$1" =~ ^[0-9]+$ ]]; }

out=$(run leak.py leaky); a=$(rss "$out" 50000); b=$(rss "$out" 200000)
if is_num "$a" && is_num "$b" && (( b - a >= 30 )); then pass "leak.py leaky: RAM grows ${a} MB -> ${b} MB"; else fail "leaky: '$a' -> '$b' MB"; fi
out=$(run leak.py bounded); a=$(rss "$out" 50000); b=$(rss "$out" 200000)
if is_num "$a" && is_num "$b" && (( b - a <= 5 )) && [[ "$out" == *"| 1,000"* ]]; then
  pass "leak.py bounded: RAM stays flat (${a} MB -> ${b} MB), cache 1,000"; else fail "bounded: '$a' -> '$b' MB"; fi
out=$(run leak.py find)
first=$(echo "$out" | grep -m1 "leak.py:")
[[ "$first" == *"leak.py:27:"* ]] && pass "tracemalloc points at line 27 (the cache)" || fail "find: $first"

compose up leaky-backend >/dev/null 2>&1 || true
state=$(docker inspect "${PROJECT}-leaky-backend-1" --format '{{.State.ExitCode}} {{.State.OOMKilled}}' 2>/dev/null || echo "?")
[[ "$state" == "137 true" ]] && pass "64 MB limit: the leaky backend was OOM-killed (exit 137)" || fail "leaky-backend state: $state"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
