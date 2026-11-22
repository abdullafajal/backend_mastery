#!/usr/bin/env bash
# Automated check for Lab 01-04. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m01-04"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
run() { compose run --rm -T python "$@" 2>/dev/null; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

out=$(run python3 paths.py)
[[ "$out" == *"resolved:       /app/orders/2026/11/order_1042.json"* && "$out" == *"means: /data/orders/2026/11/order_1042.json"* ]] \
  && pass "paths.py: a relative path depends on the current folder" || fail "paths: $out"

out=$(run sh -c 'cd /data && echo x > p.json && ln p.json same.json && ln -s p.json short.json && rm p.json && cat same.json && (cat short.json 2>&1 || true)')
[[ "$out" == *"x"* && "$out" == *"short.json: No such file or directory"* ]] \
  && pass "hard link keeps the data, symlink breaks" || fail "links: $out"

out=$(run sh -c 'echo hi > /data/tiny.txt && stat -c "%s %b %B" /data/tiny.txt')
read -r size blocks bsize <<< "$out"
[[ "$size" == "3" && $((blocks * bsize)) -ge 4096 ]] && pass "a 3-byte file takes $((blocks * bsize)) bytes on disk" || fail "tiny: $out"

set +e; run python3 crash_save.py unsafe >/dev/null; code=$?; set -e
out=$(run python3 crash_save.py check)
[[ $code -eq 137 && "$out" == *"BROKEN"* ]] && pass "unsafe save + crash (exit 137): products.json is broken" || fail "unsafe: exit $code, $out"

set +e; run python3 crash_save.py safe >/dev/null; code=$?; set -e
out=$(run python3 crash_save.py check)
left=$(run ls /data)
[[ $code -eq 137 && "$out" == *"valid: 1 product(s)"* && "$left" == *"products.json.tmp"* ]] \
  && pass "safe save + crash (exit 137): old file intact, half .tmp left over" || fail "safe: exit $code, $out, $left"

out=$(run python3 open_and_deleted.py)
mb_after() { echo "$out" | grep "$1" | sed -E 's/^[^:]*:[[:space:]]*([0-9]+).*/\1/'; }  # first number after the colon
start=$(mb_after "at start"); after_del=$(mb_after "after deleting"); after_close=$(mb_after "after the process closed")
if [[ "$start" =~ ^[0-9]+$ && "$after_del" =~ ^[0-9]+$ && "$after_close" =~ ^[0-9]+$ ]] \
   && (( start - after_del >= 15 && after_close - after_del >= 15 )) && [[ "$out" == *"(deleted)"* ]]; then
  pass "deleted-but-open log keeps its space until closed ($start -> $after_del -> $after_close MB)"
else
  fail "open+deleted: $start / $after_del / $after_close"
fi

out=$(run python3 many_files.py)
[[ "$out" == *"No space left on device"* && "$out" == *"inodes free: 0 of 1000"* ]] \
  && pass "1000 inodes used up: 'No space left' while most space is free" || fail "inodes: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
