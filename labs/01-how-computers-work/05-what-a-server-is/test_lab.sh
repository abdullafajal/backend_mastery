#!/usr/bin/env bash
# Automated check for Lab 01-05. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m01-05"
export BAZAAR_PORT="${BAZAAR_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')}"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

compose up -d server >/dev/null 2>&1
for _ in $(seq 1 30); do curl -s -o /dev/null "http://localhost:${BAZAAR_PORT}/" && break; sleep 0.5; done

# the first readiness probe above may already have been served, so read two fresh answers
one=$(curl -s "http://localhost:${BAZAAR_PORT}/"); two=$(curl -s "http://localhost:${BAZAAR_PORT}/orders")
n1=$(echo "$one" | sed -E 's/.*"requests_served": ([0-9]+).*/\1/'); n2=$(echo "$two" | sed -E 's/.*"requests_served": ([0-9]+).*/\1/')
[[ "$n1" =~ ^[0-9]+$ && "$n2" =~ ^[0-9]+$ && $n2 -eq $((n1 + 1)) && "$one" == *'"server_pid": 7'* ]] \
  && pass "tiny_server.py answers, and counts requests ($n1, $n2)" || fail "answers: $one / $two"

logs=$(compose logs server 2>/dev/null)
[[ "$logs" == *"listening on port 8000 (socket = fd 3)"* && "$logs" == *"new fd 4"* && "$logs" == *"request line: GET /orders HTTP/1.1"* ]] \
  && pass "logs show the listening socket (fd 3) and a connection (fd 4)" || fail "logs: $logs"

out=$(compose exec -T server python3 tiny_server.py 2>&1 || true)
[[ "$out" == *"[Errno 98] Address already in use"* ]] && pass "a second server on port 8000: Address already in use" || fail "second copy: $out"

out=$(compose exec -T server python3 server_inventory.py)
[[ "$out" =~ CPU\ cores\ +:\ [0-9]+ && "$out" == *"0.0.0.0:8000"* && "$out" == *"127.0.0.11:"* ]] \
  && pass "server_inventory.py: cores, and listening on 0.0.0.0:8000 (+ Docker DNS)" || fail "inventory: $out"

out=$(compose run --rm -T python python3 too_many_files.py 2>/dev/null)
[[ "$out" == *"opened 47 files, then: [Errno 24] Too many open files"* ]] \
  && pass "limit of 50 file descriptors: 47 opened + stdin/stdout/stderr" || fail "fds: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
