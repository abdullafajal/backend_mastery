#!/usr/bin/env bash
# Automated check for Lab 00-04. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m00-04"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

# Task 2: first container with plain docker run
out=$(docker run --rm python:3.13.18-slim-trixie python3 -c "print('Hello from inside a container!')" 2>/dev/null)
[[ "$out" == "Hello from inside a container!" ]] && pass "docker run prints the hello line" || fail "docker run: $out"

# Task 4: the Compose service
out=$(compose run --rm -T welcome 2>/dev/null)
[[ "$out" == *"Python 3.13.18 on Linux"* && "$out" == *"your setup works"* ]] \
  && pass "compose service 'welcome' runs Python 3.13.18" || fail "welcome: $out"

# Task 5: without --rm, a finished container stays (Exited (0))
docker rm -f bz-m00-04-demo >/dev/null 2>&1 || true
docker run --name bz-m00-04-demo python:3.13.18-slim-trixie python3 -c "print('hi')" >/dev/null 2>&1
status=$(docker ps -a --filter name=bz-m00-04-demo --format '{{.Status}}')
docker rm bz-m00-04-demo >/dev/null 2>&1 || true
[[ "$status" == "Exited (0)"* ]] && pass "without --rm, the finished container stays as Exited (0)" || fail "status: $status"

# Task 9: verify_setup.sh says ready on a good machine
set +e
out=$(bash verify_setup.sh </dev/null 2>&1); code=$?
set -e
[[ $code -eq 0 && "$out" == *"Your computer is ready to build Bazaar!"* ]] \
  && pass "verify_setup.sh: ready (exit 0)" || { fail "verify_setup.sh exit $code"; echo "$out"; }

# verify_setup.sh must catch a stopped Docker Engine
set +e
out=$(DOCKER_HOST=unix:///tmp/bz-no-docker.sock bash verify_setup.sh </dev/null 2>&1); code=$?
set -e
[[ $code -eq 1 && "$out" == *"✗ Docker Engine is not running"* ]] \
  && pass "verify_setup.sh catches a stopped Docker Engine (exit 1)" || fail "broken docker not caught (exit $code)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
