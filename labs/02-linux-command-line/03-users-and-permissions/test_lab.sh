#!/usr/bin/env bash
# Automated check for Lab 02-03. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m02-03"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
e() { compose exec -T server bash -c "$1" 2>&1 || true; }    # failures are expected; the checks decide
as() { compose exec -T -u "$1" -w /srv/bazaar server bash -c "$2" 2>&1 || true; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Starting lab (builds the image the first time)..."
compose up -d --build >/dev/null 2>&1
for _ in $(seq 1 30); do e 'test -f /srv/bazaar/.env' >/dev/null && break; sleep 1; done

out=$(e 'id asha; id ravi')
[[ "$out" == *"uid=1000(asha)"*"(bazaar)"* && "$out" == *"uid=1001(ravi) gid=1002(ravi) groups=1002(ravi)"* ]] \
  && pass "users: asha is in bazaar; ravi is not" || fail "ids: $out"

out=$(as ravi 'cat .env')
[[ "$out" == *"DB_PASSWORD"* ]] && pass "the starting mistake: ravi can read .env (644)" || fail "644: $out"

e 'chown root:bazaar .env && chmod 640 .env' >/dev/null
r=$(as ravi 'cat .env'); a=$(as asha 'cat .env'); w=$(as www-data 'cat .env')
[[ "$r" == *"Permission denied"* && "$a" == *"DB_PASSWORD"* && "$w" == *"Permission denied"* ]] \
  && pass "after chmod 640 root:bazaar: asha reads it, ravi and www-data can't" || fail "640: ravi=$r asha=$a www=$w"

out=$(e 'touch t; chmod 644 t; chmod u+x,g+w,o-r t; stat -c "%a %A" t')
[[ "$out" == "760 -rwxrw----" ]] && pass "chmod u+x,g+w,o-r on 644 gives 760" || fail "symbolic: $out"

e 'mkdir -p vault; echo secret > vault/key.txt; chmod 711 vault' >/dev/null
out=$(as ravi 'ls vault; cat vault/key.txt')
[[ "$out" == *"cannot open directory"* && "$out" == *"secret"* ]] && pass "folder with x but no r: can't list, can open a known name" || fail "711: $out"

e 'mkdir -p shared; chmod 777 shared; echo x > shared/r.txt; chmod 444 shared/r.txt' >/dev/null
out=$(as ravi 'rm -f shared/r.txt; ls shared | wc -l')
[[ "$(echo "$out" | tail -1)" == "0" ]] && pass "deleting depends on the folder: ravi deleted root's read-only file in a 777 folder" || fail "delete: $out"
e 'echo x > /tmp/root_note' >/dev/null
out=$(as ravi 'rm -f /tmp/root_note')
[[ "$out" == *"Operation not permitted"* ]] && pass "sticky /tmp: ravi can't delete root's file" || fail "sticky: $out"

w1=$(as www-data 'echo p > media/uploads/x.jpg && echo OK'); w2=$(as www-data 'echo h >> config/bazaar.conf')
[[ "$w1" == *"OK"* && "$w2" == *"Permission denied"* ]] && pass "www-data can write uploads/, not config/" || fail "www-data: $w1 / $w2"

s1=$(as asha 'sudo whoami'); s2=$(as ravi 'echo ravi | sudo -S whoami' || true)
[[ "$s1" == "root" && "$s2" == *"ravi is not in the sudoers file"* ]] && pass "sudo: asha may, ravi may not" || fail "sudo: $s1 / $s2"

out=$(as asha 'cd ~ && umask 077 && touch b && mkdir d2 && stat -c "%a" b d2')
[[ "$out" == $'600\n700' ]] && pass "umask 077: new files 600, new folders 700" || fail "umask: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
