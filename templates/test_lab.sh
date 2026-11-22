#!/usr/bin/env bash
# Automated check for Lab NN-LL. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-mNN-LL"           # unique per lab
# Pick a free port on your laptop, so the test never clashes with anything else running.
export BAZAAR_PORT="${BAZAAR_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')}"
BASE="http://localhost:${BAZAAR_PORT}"   # compose maps "${BAZAAR_PORT:-8000}:8000"
FAILED=0

compose() { docker compose -p "$PROJECT" "$@"; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT

pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Starting lab..."
compose up -d --build --wait --wait-timeout 120 >/dev/null   # services need healthchecks

# --- checks: real output only, one pass/fail line each ---
body=$(curl -fsS "$BASE/health") && [[ "$body" == *ok* ]] \
  && pass "/health returns ok" || fail "/health returned: ${body:-nothing}"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
