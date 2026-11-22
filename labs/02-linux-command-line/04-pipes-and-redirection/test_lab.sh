#!/usr/bin/env bash
# Automated check for Lab 02-04. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m02-04"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
e() { compose exec -T server bash -c "$1" 2>&1 || true; }   # failures are expected; the checks decide
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

compose up -d >/dev/null 2>&1
for _ in $(seq 1 30); do [[ "$(e 'wc -l < /srv/bazaar/logs/access.log')" == "2000" ]] && break; sleep 1; done

out=$(e 'wc -l < logs/access.log; md5sum logs/access.log')
[[ "$out" == 2000* ]] && pass "access.log has 2000 lines (same data for everyone)" || fail "log: $out"

out=$(e 'echo first > n.txt; echo second > n.txt; cat n.txt; echo first > m.txt; echo second >> m.txt; cat m.txt')
[[ "$out" == $'second\nfirst\nsecond' ]] && pass "> replaces, >> appends" || fail "redirect: $out"

out=$(e 'ls logs /nope > out.txt 2> err.txt; cat out.txt; echo ---; cat err.txt')
[[ "${out%%---*}" == *"access.log"* && "${out%%---*}" != *"cannot access"* && "${out#*---}" == *"cannot access"* ]] \
  && pass "stdout and stderr go to different files" || fail "streams: $out"

out=$(e 'ls logs /nope > all.txt 2>&1; cat all.txt; echo ---; ls logs /nope 2>&1 > wrong.txt; echo; cat wrong.txt')
[[ "${out%%---*}" == *"cannot access"*"access.log"* && "$(echo "${out#*---}" | tail -n 2)" != *"cannot access"* ]] \
  && pass "> file 2>&1 catches both; 2>&1 > file does not" || fail "2>&1 order: $out"

out=$(e "awk '{print \$4}' logs/access.log | uniq -c | wc -l; awk '{print \$4}' logs/access.log | sort | uniq -c | wc -l")
read -r unsorted sorted <<< "$(echo $out)"
[[ "$sorted" == "3" && "$unsorted" -gt 3 ]] && pass "uniq -c needs sort first ($unsorted groups unsorted, $sorted sorted)" || fail "uniq: $out"

out=$(e 'false | wc -l; echo "a=$?"; set -o pipefail; false | wc -l; echo "b=$?"')
[[ "$out" == *"a=0"* && "$out" == *"b=1"* ]] && pass "pipefail makes a failed pipe fail" || fail "pipefail: $out"

out=$(e 'python3 /srv/playground/check.py')
[[ "$out" == *"20/20 playground answers match"* ]] && pass "playground: all 20 reference solutions match independent answers" || fail "playground: $out"

# the five one-line answers printed in the lesson (if the lesson's numbers change, this must change too)
out=$(e 'L=logs/access.log; wc -l < $L; grep -c "POST /checkout 500" $L; grep "POST /checkout 500" $L | awk "{print \$6}" | sort | uniq -c | sort -rn | head -n 1; grep "POST /checkout 200" $L | awk -F"amount=" "{s += \$2} END {print s}"; cut -c 12-13 $L | sort | uniq -c | sort -rn | head -n 1')
[[ "$(echo $out)" == "2000 27 7 customer=asha 428291 393 20" ]] && pass "the lesson's five answers: 2000, 27, asha (7), 428291, 20:00" || fail "lesson answers: $(echo $out)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
