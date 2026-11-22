#!/usr/bin/env bash
# Automated check for Lab 01-01. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m01-01"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Starting lab..."
compose up -d --wait --wait-timeout 60 >/dev/null 2>&1

out=$(compose run --rm -T race 2>/dev/null)
echo "$out"

# turn "1,234 µs" / "51 ns" into nanoseconds
ns_of() {
  local line val unit
  line=$(echo "$out" | grep "^$1")
  val=$(echo "$line" | awk -F'|' '{print $2}' | tr -d ' ,' | sed -E 's/(ns|µs)$//')
  unit=$(echo "$line" | awk -F'|' '{print $2}' | grep -o -E 'ns|µs')
  if [[ "$unit" == "µs" ]]; then echo $((val * 1000)); else echo "$val"; fi
}
ram=$(ns_of "RAM"); read=$(ns_of "Disk read"); save=$(ns_of "Disk save"); net=$(ns_of "Network")

[[ "$ram" -gt 0 && "$ram" -lt 1000 ]] && pass "RAM lookup is under 1 µs (${ram} ns)" || fail "RAM lookup: ${ram} ns"
[[ "$read" -gt $((ram * 20)) ]] && pass "disk read is much slower than RAM" || fail "disk read ${read} ns vs RAM ${ram} ns"
[[ "$save" -gt $((ram * 100)) ]] && pass "disk save with fsync is 100x+ slower than RAM" || fail "fsync ${save} ns vs RAM ${ram} ns"
[[ "$net" -gt $((ram * 100)) ]] && pass "network trip is 100x+ slower than RAM" || fail "network ${net} ns vs RAM ${ram} ns"
[[ "$net" -lt 20000000 ]] && pass "network trip is under 20 ms (no Nagle stall)" || fail "network ${net} ns is too slow"

lines=$(compose run --rm -T race sh -c 'wc -l < /data/orders.log' 2>/dev/null | tr -d ' ')
[[ "$lines" == "300" ]] && pass "300 orders were saved on the volume" || fail "orders.log has ${lines} lines"

loc=$(compose run --rm -T race python3 locality.py 2>/dev/null)
echo "$loc"
t_in=$(echo "$loc" | awk '/^in order/ {print $3}'); t_rand=$(echo "$loc" | awk '/^random order/ {print $3}')
python3 -c "import sys; sys.exit(0 if float('$t_rand') > 1.3 * float('$t_in') else 1)" \
  && pass "random order is clearly slower than in order (${t_rand} s vs ${t_in} s)" || fail "locality: $t_in s vs $t_rand s"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
