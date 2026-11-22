#!/usr/bin/env bash
# Automated check for Lab 05-07. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m05-07"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }
num() { sed -n "s/^$1 *\([0-9][0-9]*\.[0-9]\) s.*/\1/p" <<< "$2"; }       # the seconds on the line starting with $1
le() { awk -v a="$1" -v b="$2" 'BEGIN{exit !(a<=b)}'; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

out=$(py examples/waiting.py)
a=$(num "one by one:" "$out"); b=$(num "10 threads:" "$out")
if [[ "$a" =~ ^[0-9.]+$ && "$b" =~ ^[0-9.]+$ ]] && le 1.9 "$a" && le "$a" 3.0 && le "$b" 0.5 && [[ "$out" == *"same prices? True" ]]; then
  pass "waiting.py: one by one ${a} s, 10 threads ${b} s, same prices"
else fail "waiting: $out"; fi

out=$(py examples/computing.py)
cores=$(sed -n 's/^CPU cores: \([0-9]*\)$/\1/p' <<< "$out"); s1=$(num "one by one" "$out"); s2=$(num "4 threads" "$out"); s3=$(num "4 processes" "$out")
if [[ "$cores" =~ ^[0-9]+$ && "$s1" =~ ^[0-9.]+$ && "$s2" =~ ^[0-9.]+$ && "$s3" =~ ^[0-9.]+$ && $(grep -c "(49098 primes)" <<< "$out") -eq 3 ]] \
   && awk -v a="$s1" -v t="$s2" 'BEGIN{exit !(t > a*0.7)}'; then
  if [[ "$cores" -ge 2 ]] && ! awk -v a="$s1" -v p="$s3" 'BEGIN{exit !(p < a*0.75)}'; then fail "computing: processes not faster on $cores cores: $out"
  else pass "computing.py: one by one ${s1} s, threads ${s2} s (GIL: no gain), processes ${s3} s on $cores cores"; fi
else fail "computing: $out"; fi

[[ "$(py examples/oversell.py)" == $'lock=False: 5 sold, stock now -4\nlock=True: 1 sold, stock now 0' ]] && pass "oversell.py: without a lock 5 sold from a stock of 1; with a lock, 1" || fail "oversell: $(py examples/oversell.py)"

[[ "$(py exercises/price_check.py)" == "prices received: 0" ]] && pass "the exercise really shows the bug (printed before the threads finished)" || fail "exercise: $(py exercises/price_check.py)"
[[ "$(py solutions/price_check.py)" == "prices received: 5" ]] && pass "solution: join() waits for all 5 prices" || fail "solution: $(py solutions/price_check.py)"

[[ "$(py mistakes/lambda_to_process.py)" == *"_pickle.PicklingError: Can't pickle <function <lambda> at 0x"* ]] && pass "mistakes/: a lambda can't be sent to another process" || fail "lambda: $(py mistakes/lambda_to_process.py)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
