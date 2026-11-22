#!/usr/bin/env bash
# Automated check for Lab 00-03. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m00-03"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
run() { compose run --rm -T "$@" 2>/dev/null; }   # -T: no terminal needed (CI). Compose's own messages go to stderr, hidden.
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

# Task 1: the version
out=$(run python python3 --version)
[[ "$out" == "Python 3.13.18" ]] && pass "python3 --version is 3.13.18" || fail "version: $out"

# Task 2: the check script says ready
out=$(run python python3 check_python.py)
[[ "$out" == *"Ready to build Bazaar!"* && "$out" == *"₹1247"* && "$out" == *"/usr/local/bin/python3"* ]] \
  && pass "check_python.py: ready, cart total ₹1247" || fail "check_python.py: $out"

# Task 3: where python3 lives, and PATH
out=$(run python which python3)
[[ "$out" == "/usr/local/bin/python3" ]] && pass "which python3 -> /usr/local/bin/python3" || fail "which: $out"
out=$(run python sh -c 'echo $PATH')
[[ "$out" == /usr/local/bin:* ]] && pass "PATH starts with /usr/local/bin" || fail "PATH: $out"

# Task 4: break PATH -> command not found (exit 127), full path still works
set +e
out=$(run python bash -c 'PATH=/usr/bin python3 --version 2>&1'); code=$?
set -e
[[ $code -eq 127 && "$out" == *"python3: command not found"* ]] \
  && pass "with PATH=/usr/bin: command not found (exit 127)" || fail "broken PATH gave exit $code: $out"
out=$(run python bash -c 'PATH=/usr/bin /usr/local/bin/python3 --version')
[[ "$out" == "Python 3.13.18" ]] && pass "full path works even with broken PATH" || fail "full path: $out"

# Task 5: old Python is refused
set +e
out=$(run old-python python3 check_python.py); code=$?
set -e
[[ $code -eq 1 && "$out" == *"Not ready"* ]] \
  && pass "Python 3.12 is refused with exit code 1" || fail "old python exit $code: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
