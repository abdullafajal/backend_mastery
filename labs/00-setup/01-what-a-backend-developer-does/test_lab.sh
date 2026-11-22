#!/usr/bin/env bash
# Automated check for Lab 00-01. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m00-01"
# Pick a free port on your laptop, so the test never clashes with anything else running.
export BAZAAR_PORT="${BAZAAR_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')}"
BASE="http://localhost:${BAZAAR_PORT}"
FAILED=0

compose() { docker compose -p "$PROJECT" "$@"; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT

pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Starting lab..."
compose up -d --wait --wait-timeout 60 >/dev/null

# 1. health endpoint
body=$(curl -fsS "$BASE/health") && [[ "$body" == '{"status": "ok"}' ]] \
  && pass "/health returns ok" || fail "/health returned: ${body:-nothing}"

# 2. all products
body=$(curl -fsS "$BASE/products")
[[ "$body" == *'"count": 5'* ]] && pass "/products returns 5 products" || fail "/products: $body"

# 3. search
body=$(curl -fsS "$BASE/products?q=shoes")
[[ "$body" == *'"count": 1'* && "$body" == *'Red Running Shoes'* ]] \
  && pass "search ?q=shoes finds Red Running Shoes" || fail "search: $body"

# 4. business rule: stock count is hidden, in_stock is shown
body=$(curl -fsS "$BASE/products/5")
[[ "$body" == *'"in_stock": false'* && "$body" != *'"stock"'* ]] \
  && pass "product 5 shows in_stock=false and hides stock count" || fail "product 5: $body"

# 5. missing product gives a real 404
code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE/products/99")
[[ "$code" == "404" ]] && pass "missing product returns 404" || fail "missing product returned $code"

# 6. requests show up in the logs
logs=$(compose logs bazaar 2>&1)
[[ "$logs" == *'"GET /products?q=shoes HTTP/1.1" 200'* ]] \
  && pass "request appears in container logs" || fail "log line not found"

# 7. an unknown method gets 501
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$BASE/products")
[[ "$code" == "501" ]] && pass "POST returns 501 (method not supported)" || fail "POST returned $code"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
