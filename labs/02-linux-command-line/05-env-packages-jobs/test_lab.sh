#!/usr/bin/env bash
# Automated check for Lab 02-05. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m02-05"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
r() { compose run --rm -T shell -c "$1" 2>&1 || true; }   # failures are expected; the checks decide
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

out=$(r 'python3 settings.py; echo "exit=$?"')
[[ "$out" == *"DB_PASSWORD is not set"* && "$out" == *"exit=1"* ]] && pass "settings.py refuses to start without DB_PASSWORD" || fail "missing: $out"

out=$(r 'DB_PASSWORD=secret123; python3 settings.py; echo "e1=$?"; export DB_PASSWORD; python3 settings.py')
[[ "$out" == *"e1=1"* && "$out" == *"DB_PASSWORD = se*******"* ]] && pass "a shell variable reaches Python only after export" || fail "export: $out"

out=$(r 'DB_PASSWORD=secret123 DEBUG=true python3 settings.py; echo "after=[$DB_PASSWORD]"')
[[ "$out" == *"DEBUG       = True"* && "$out" == *"after=[]"* ]] && pass "VAR=value cmd sets it for that one command only" || fail "one-shot: $out"

out=$(compose run --rm -T app 2>/dev/null || true)
[[ "$out" == *"DB_HOST     = db.bazaar.internal"* && "$out" == *"DEBUG       = True"* && "$out" == *"la***"* ]] \
  && pass "compose: environment + env_file reach the app" || fail "compose: $out"

out=$(r 'jq --version; echo "e1=$?"; apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq jq >/dev/null 2>&1; echo "{\"price\": 299}" | jq .price')
[[ "$out" == *"e1=127"* && "$(echo "$out" | tail -1)" == "299" ]] && pass "apt: jq missing (127), installed, works" || fail "apt: $out"

out=$(r 'python3 import_products.py > /tmp/i.log 2>&1 & sleep 2.5; jobs; kill %1; sleep 0.5; jobs; echo "lines=$(wc -l < /tmp/i.log)"')
[[ "$out" == *"Running"* && "$out" == *"Terminated"* && "$out" != *"import finished"* ]] && pass "& runs a job in the background; kill %1 stops it" || fail "jobs: $out"

out=$(r 'python3 import_products.py > /tmp/i.log 2>&1 & wait; tail -1 /tmp/i.log')
[[ "$out" == *"import finished"* ]] && pass "wait waits for the background job" || fail "wait: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
