#!/usr/bin/env bash
# Automated check for Lab 02-06. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m02-06"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
L() { compose exec -T laptop bash -c "$1" 2>&1 || true; }   # failures are expected; the checks decide
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Starting lab (builds the images the first time)..."
compose up -d --build >/dev/null 2>&1
for _ in $(seq 1 30); do L 'bash -c "echo > /dev/tcp/bazaar-server/22"' | grep -q . || break; sleep 1; done

out=$(L 'sshpass -p asha-lab ssh -o StrictHostKeyChecking=accept-new asha@bazaar-server "hostname; whoami"')
[[ "$out" == *"Permanently added 'bazaar-server'"* && "$out" == *"bazaar-server"*"asha"* ]] && pass "password login works; the host key is remembered" || fail "password login: $out"

out=$(L 'sshpass -p wrong ssh -o PubkeyAuthentication=no asha@bazaar-server hostname; echo "exit=$?"')
[[ "$out" == *"Permission denied, please try again."* && "$out" == *"exit=5"* ]] && pass "wrong password is refused" || fail "wrong pw: $out"

out=$(L 'ssh-keygen -q -t ed25519 -N "" -f ~/.ssh/id_ed25519 && sshpass -p asha-lab ssh-copy-id -i ~/.ssh/id_ed25519.pub asha@bazaar-server >/dev/null 2>&1; ssh -o BatchMode=yes asha@bazaar-server whoami')
[[ "$(echo "$out" | tail -1)" == "asha" ]] && pass "key login works without a password (BatchMode)" || fail "key login: $out"

out=$(L 'chmod 644 ~/.ssh/id_ed25519; ssh -o BatchMode=yes asha@bazaar-server hostname; echo "exit=$?"; chmod 600 ~/.ssh/id_ed25519')
[[ "$out" == *"UNPROTECTED PRIVATE KEY FILE"* && "$out" == *"exit=255"* ]] && pass "a 644 private key is ignored (UNPROTECTED PRIVATE KEY FILE)" || fail "perms: $out"

out=$(L 'ssh asha@bazaar-server "grep -c failed /srv/bazaar/logs/order_20261121.log"')
[[ "$out" == "1" ]] && pass "a command runs on the server and its answer comes back" || fail "remote: $out"

out=$(L 'echo "sale = diwali" > bazaar.conf && scp -q bazaar.conf asha@bazaar-server:/home/asha/ && scp -q asha@bazaar-server:/srv/bazaar/logs/order_20261121.log . && ls; ssh asha@bazaar-server "cat /home/asha/bazaar.conf"')
[[ "$out" == *"order_20261121.log"* && "$out" == *"sale = diwali"* ]] && pass "scp copies both ways" || fail "scp: $out"

out=$(L 'printf "Host bazaar\n    HostName bazaar-server\n    User asha\n" > ~/.ssh/config && ssh bazaar hostname')
[[ "$out" == "bazaar-server" ]] && pass "~/.ssh/config: ssh bazaar is enough" || fail "config: $out"

logs=$(compose logs bazaar-server 2>&1)
[[ "$logs" == *"Accepted password for asha"* && "$logs" == *"Accepted publickey for asha"* && "$logs" == *"Failed password for asha"* ]] \
  && pass "the server's log records every login" || fail "server log"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
