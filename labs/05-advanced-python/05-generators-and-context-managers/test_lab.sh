#!/usr/bin/env bash
# Automated check for Lab 05-05. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m05-05"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }
run() { docker compose -p "$PROJECT" run --rm -T python sh -c "$1 2>&1" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/make_log.py)" == "wrote 200000 orders to data/orders.log" && "$(run 'wc -l < data/orders.log')" == "200000" ]] \
  && pass "make_log.py: 200,000 order lines written" || fail "make_log"

[[ "$(py examples/yield_demo.py)" == "generator
  (generator starts)
1001
  (generator resumes)
1002
  (generator resumes again)
1003
  (generator ends)" ]] && pass "yield_demo.py: a generator pauses at each yield" || fail "yield_demo: $(py examples/yield_demo.py)"

out=$(py examples/list_vs_generator.py)
lb=$(sed -n 's/^list: *\([0-9]*\) bytes$/\1/p' <<< "$out"); gb=$(sed -n 's/^generator: *\([0-9]*\) bytes$/\1/p' <<< "$out")
[[ "$lb" =~ ^[0-9]+$ && "$gb" =~ ^[0-9]+$ && "$lb" -gt 8000000 && "$gb" -lt 1000 && "$out" == *"same total? True" ]] \
  && pass "list_vs_generator.py: list $lb bytes vs generator $gb bytes, same total" || fail "list_vs_generator: $out"

# The pipeline's answer, worked out a second, independent way (awk), so the check can fail.
want=$(run "awk -F, '\$5==\"PAID\"{c++; t+=\$4} END{printf \"%d %d\", c, t/100}' data/orders.log")
got=$(py examples/pipeline.py | tr -d ',₹' | awk '/paid orders/{c=$3} /paid total/{t=$3} END{print c, t}')
[[ "$want" =~ ^[0-9]+\ [0-9]+$ && "$got" == "$want" ]] && pass "pipeline.py: $got (count, rupees) matches an independent awk count" || fail "pipeline: got '$got', want '$want'"

[[ "$(py examples/context_managers.py)" == "Neha opens the till
  sold 2 Masala Box
Neha closes the till
Rohan opens the till
  selling Wireless Earbuds...
Rohan closes the till
error: card declined" ]] && pass "context_managers.py: the clean-up runs even after an error" || fail "context: $(py examples/context_managers.py)"

[[ "$(py exercises/average_order.py)" == *"ZeroDivisionError: integer division or modulo by zero" ]] && pass "the exercise really crashes (the generator was used up by sum)" || fail "exercise: $(py exercises/average_order.py)"

avg=$(run "awk -F, '\$5==\"PAID\"{c++; t+=\$4} END{printf \"%d\", t/c/100}' data/orders.log")
[[ "$avg" =~ ^[0-9]+$ && "$(py solutions/average_order.py)" == "average paid order: ₹$avg" ]] && pass "solution: one pass gives the average, ₹$avg (matches awk)" || fail "solution: $(py solutions/average_order.py) vs awk $avg"

[[ "$(py examples/deeper.py)" == "['Priya', 'Ravi', 'Priya']
Neha opens the till
  Neha is selling
Neha closes the till (error: None)" ]] && pass "deeper.py: islice, yield from, __enter__/__exit__" || fail "deeper: $(py examples/deeper.py)"

m=$(py mistakes/stop_iteration.py; py mistakes/len_generator.py)
[[ "$m" == *$'\nStopIteration'* && "$m" == *"TypeError: object of type 'generator' has no len()"* ]] && pass "mistakes/: next() past the end; len() of a generator" || fail "mistakes: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
