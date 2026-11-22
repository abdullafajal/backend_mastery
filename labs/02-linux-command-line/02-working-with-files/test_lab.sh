#!/usr/bin/env bash
# Automated check for Lab 02-02. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m02-02"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
e() { compose exec -T server bash -c "$1" 2>&1; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Starting lab (builds the image the first time)..."
compose up -d --build >/dev/null 2>&1
for _ in $(seq 1 30); do e 'test -s /srv/bazaar/logs/live.log' >/dev/null && break; sleep 1; done

out=$(e 'which less nano vi tree')
[[ $(echo "$out" | wc -l) -eq 4 ]] && pass "tools installed: less, nano, vi, tree" || fail "tools: $out"

out=$(e 'cd logs; cd /etc; cd -; cd ~; pwd')
[[ "$out" == *"/srv/bazaar/logs"* && "$out" == *"/root"* ]] && pass "cd - goes back; cd ~ goes home (/root)" || fail "cd: $out"

out=$(e 'ls; echo ---; ls -a')
[[ "${out%%---*}" != *".env"* && "${out#*---}" == *".env"* ]] && pass "hidden .env shows only with ls -a" || fail "hidden: $out"

out=$(e 'cd config; a=$(stat -c %i bazaar.conf); cp bazaar.conf c.bak; b=$(stat -c %i c.bak); mv c.bak m.bak; c=$(stat -c %i m.bak); echo "$a $b $c"')
read -r i1 i2 i3 <<< "$out"
[[ "$i1" =~ ^[0-9]+$ && "$i1" != "$i2" && "$i2" == "$i3" ]] && pass "cp makes a new inode, mv keeps it ($i1 / $i2 / $i3)" || fail "inodes: $out"

out=$(e 'cd config; echo NEW > draft.conf; mv draft.conf bazaar.conf; cat bazaar.conf; echo X > a; echo Y > b; mv -n a b; cat b')
[[ "$out" == *"NEW"* && "$out" == *"Y"* && "$out" != *"site_name"* ]] && pass "mv overwrites silently; mv -n doesn't" || fail "mv: $out"

out=$(e 'mkdir backups/2026/11; echo "e1=$?"; mkdir -p backups/2026/11; echo "e2=$?"; rm backups; echo "e3=$?"')
[[ "$out" == *"e1=1"* && "$out" == *"e2=0"* && "$out" == *"Is a directory"* && "$out" == *"e3=1"* ]] \
  && pass "mkdir needs -p for nested folders; rm needs -r for folders" || fail "mkdir/rm: $out"

out=$(e 'timeout 5 tail -n 0 -f logs/live.log' || true)
[[ $(echo "$out" | grep -c "request=") -ge 2 ]] && pass "tail -f shows new lines as they are written" || fail "tail -f: $out"

out=$(e 'find logs -mtime +7; echo ---; find . -size +3M | wc -l')
[[ "${out%%---*}" == *"order_20261112.log"* && "${out%%---*}" != *"order_20261113.log"* && "${out#*---}" == *"3"* ]] \
  && pass "find: -mtime +7 finds only the 12th; -size +3M finds 3 photos" || fail "find: $out"

out=$(e 'du -sh * | sort -h | tail -1')
[[ "$out" == *"media"* ]] && pass "du -sh * | sort -h: media is the biggest ($out)" || fail "du: $out"

saved=$(e 'for i in 1 2 3 4 5; do /srv/tools/backup_config.sh | grep "^saved"; sleep 1; done' | awk '{print $2}')
first_saved=$(echo "$saved" | head -1); last_saved=$(echo "$saved" | tail -1)
left=$(e 'ls -1 /srv/bazaar/backups/config/bazaar.conf.*')
if [[ $(echo "$left" | wc -l | tr -d ' ') == "3" && "$left" == *"$last_saved"* && "$left" != *"$first_saved"* ]]; then
  pass "backup_config.sh keeps the 3 newest backups (the newest stays, the oldest goes)"
else
  fail "backups: saved=[$saved] left=[$left]"
fi

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
