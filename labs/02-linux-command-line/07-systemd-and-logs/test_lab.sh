#!/usr/bin/env bash
# Automated check for Lab 02-07. Exit code 0 = every check passed.
# Note: systemd needs a privileged container. This is fine for a local lab, never for real apps.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m02-07"
export BAZAAR_PORT="${BAZAAR_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')}"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
S() { compose exec -T server bash -c "$1" 2>&1 || true; }   # failures are expected; the checks decide
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
wait_running() { for _ in $(seq 1 40); do [[ "$(S 'systemctl is-system-running')" =~ running|degraded ]] && return 0; sleep 1; done; }

echo "Starting lab (builds the image the first time)..."
compose up -d --build >/dev/null 2>&1
wait_running

out=$(S 'ps -p 1 -o comm=; systemctl is-system-running')
[[ "$out" == $'systemd\nrunning' ]] && pass "systemd is PID 1 and the system is running" || fail "boot: $out"

out=$(S 'systemctl is-enabled bazaar-web; systemctl start bazaar-web; sleep 1; systemctl is-active bazaar-web')
body=$(curl -s "http://localhost:${BAZAAR_PORT}/" || true)
[[ "$out" == $'disabled\nactive' && "$body" == *'"sale": "diwali"'* ]] && pass "systemctl start runs Bazaar; settings come from the EnvironmentFile" || fail "start: $out / $body"

out=$(S 'P=$(systemctl show -p MainPID --value bazaar-web); kill -9 $P; sleep 4; Q=$(systemctl show -p MainPID --value bazaar-web); echo "$P $Q"; systemctl is-active bazaar-web; journalctl -u bazaar-web --no-pager -o cat | grep -c "Scheduled restart job"')
read -r p q <<< "$(echo "$out" | head -1)"
[[ "$p" =~ ^[0-9]+$ && "$q" =~ ^[0-9]+$ && "$p" != "$q" && "$out" == *"active"* && "$(echo "$out" | tail -1)" -ge 1 ]] \
  && pass "after kill -9, systemd restarted it (PID $p -> $q)" || fail "restart: $out"

curl -s "http://localhost:${BAZAAR_PORT}/products" >/dev/null || true
out=$(S 'journalctl -u bazaar-web --no-pager -o cat | tail -n 5')
[[ "$out" == *'request "GET /products HTTP/1.1" 200'* ]] && pass "the app's output is in the journal (journalctl -u)" || fail "journal: $out"

out=$(S 'systemctl stop bazaar-web; sleep 4; systemctl is-active bazaar-web')
[[ "$out" == "inactive" ]] && pass "systemctl stop stops it, and it stays stopped" || fail "stop: $out"

S 'systemctl enable bazaar-web' >/dev/null
compose restart >/dev/null 2>&1
wait_running
out=$(S 'systemctl is-enabled bazaar-web; systemctl is-active bazaar-web')
[[ "$out" == $'enabled\nactive' ]] && pass "enabled: it starts again after a reboot" || fail "enable: $out"

out=$(S 'mkdir -p /etc/systemd/system/bazaar-web.service.d; printf "[Service]\nExecStart=\nExecStart=/usr/local/bin/python3 /srv/bazaar/serverr.py\n" > /etc/systemd/system/bazaar-web.service.d/typo.conf; systemctl daemon-reload; systemctl restart bazaar-web; sleep 3; journalctl -u bazaar-web --no-pager -o cat | grep -c "can.t open file"')
[[ "$out" =~ ^[0-9]+$ && "$out" -ge 1 ]] && pass "a broken service: the journal says exactly what's wrong" || fail "broken: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
