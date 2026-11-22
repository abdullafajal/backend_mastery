#!/usr/bin/env bash
# Automated check for Lab 00-02. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m00-02"
# Pick a free port on your laptop, so the test never clashes with anything else running.
export BAZAAR_PORT="${BAZAAR_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')}"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Starting lab..."
compose up -d --wait --wait-timeout 60 >/dev/null

body=$(curl -fsS http://localhost:${BAZAAR_PORT}/health) && [[ "$body" == '{"status": "ok"}' ]] \
  && pass "/health returns ok" || fail "/health returned: ${body:-nothing}"

out=$(compose run --rm -T users 2>/dev/null)
echo "$out"
# columns: users | average | slowest
slow_1=$(echo "$out"   | awk -F'|' '$1+0==1   {gsub(/[^0-9]/,"",$3); print $3}')
slow_100=$(echo "$out" | awk -F'|' '$1+0==100 {gsub(/[^0-9]/,"",$3); print $3}')

[[ -n "$slow_1" && "$slow_1" -lt 500 ]] \
  && pass "1 user waits under 500 ms (${slow_1} ms)" || fail "1 user waited ${slow_1:-?} ms"
[[ -n "$slow_100" && "$slow_100" -gt 1000 ]] \
  && pass "with 100 users the slowest waits over 1 second (${slow_100} ms): one worker is the bottleneck" \
  || fail "100 users slowest was ${slow_100:-?} ms (expected > 1000)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
