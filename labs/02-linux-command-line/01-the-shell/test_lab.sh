#!/usr/bin/env bash
# Automated check for Lab 02-01. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m02-01"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
sh_run() { compose run --rm -T shell "$1" 2>&1; }   # runs commands in a fresh /srv/bazaar
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

out=$(sh_run 'hostname; pwd; type cd; type ls')
[[ "$out" == *"bazaar-server"* && "$out" == *"/srv/bazaar"* && "$out" == *"cd is a shell builtin"* && "$out" == *"ls is /usr/bin/ls"* ]] \
  && pass "on bazaar-server in /srv/bazaar; cd is a builtin, ls is a program" || fail "basics: $out"

out=$(sh_run 'rm summer sale.txt; echo "exit=$?"; ls')
[[ "$out" == *"cannot remove 'summer'"* && "$out" == *"exit=1"* && "$out" == *"summer sale.txt"* ]] \
  && pass "unquoted rm: two wrong arguments, exit 1, file still there" || fail "unquoted: $out"
out=$(sh_run 'rm "summer sale.txt"; echo "exit=$?"; ls')
[[ "$out" == *"exit=0"* && "$out" != *"summer sale.txt"* ]] && pass "quoted rm: the file is gone" || fail "quoted: $out"

out=$(sh_run 'echo logs/*.log; echo logs/*.csv; ls logs/*.csv; echo "exit=$?"')
[[ "$out" == *"logs/order_20261119.log logs/order_20261120.log logs/order_20261121.log"* && "$out" == *"logs/*.csv"* && "$out" == *"exit=2"* ]] \
  && pass "globs: *.log expands to 3 files; no match stays literal" || fail "globs: $out"

out=$(sh_run 'SALE=diwali; echo "a $SALE"; echo '"'"'b $SALE'"'"'; SALE = diwali; echo "exit=$?"')
[[ "$out" == *'a diwali'* && "$out" == *'b $SALE'* && "$out" == *"SALE: command not found"* && "$out" == *"exit=127"* ]] \
  && pass "variables: double vs single quotes; spaces around = give exit 127" || fail "variables: $out"

out=$(sh_run 'cd /nope && echo DEPLOY1; cd /nope; echo DEPLOY2; cd /nope || echo FALLBACK')
[[ "$out" != *"DEPLOY1"* && "$out" == *"DEPLOY2"* && "$out" == *"FALLBACK"* ]] \
  && pass "&& stops after a failure, ; doesn't, || runs on failure" || fail "chaining: $out"

out=$(sh_run 'set -u; echo "rm -rf $DIRR/"; echo NEVER' || true)
[[ "$out" == *"DIRR: unbound variable"* && "$out" != *"NEVER"* ]] && pass "set -u stops at an unset variable" || fail "set -u: $out"

out=$(sh_run 'printf "#!/usr/bin/env bash\necho deployed\n" > deploy.sh; ./deploy.sh; echo "exit=$?"; chmod +x deploy.sh; ./deploy.sh')
[[ "$out" == *"Permission denied"* && "$out" == *"exit=126"* && "$out" == *"deployed"* ]] \
  && pass "script: Permission denied (126) until chmod +x" || fail "script: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
