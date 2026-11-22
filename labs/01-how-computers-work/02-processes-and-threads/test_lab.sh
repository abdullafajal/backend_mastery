#!/usr/bin/env bash
# Automated check for Lab 01-02. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m01-02"
export BAZAAR_PORT="${BAZAAR_PORT:-$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')}"
FAILED=0
compose() { docker compose -p "$PROJECT" "$@"; }
in_box() { compose exec -T bazaar "$@"; }
trap 'compose down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Starting lab (builds the image the first time)..."
compose up -d --build --wait --wait-timeout 180 >/dev/null 2>&1
sleep 2  # give the child processes a moment to start

backend=$(in_box pgrep -f '^python3 -u bazaar_shop.py')
children=$(in_box ps -o pid= --ppid "$backend" | wc -l | tr -d ' ')
[[ "$children" == "3" ]] && pass "bazaar-backend (PID $backend) has 3 child processes" || fail "children: $children"

nlwp=$(in_box ps -o nlwp= -p "$backend" | tr -d ' ')
[[ "$nlwp" == "3" ]] && pass "bazaar-backend runs 3 threads" || fail "threads: $nlwp"

rss=$(in_box ps -o rss= -p "$(in_box pgrep -f image_cache.py)" | tr -d ' ')
[[ "$rss" -gt 100000 ]] && pass "image-cache holds over 100 MB of RAM (${rss} KB)" || fail "image-cache RSS ${rss} KB"

old=$(in_box pgrep -f email_worker.py | head -1)
in_box kill "$old"                       # SIGTERM
sleep 3
workers=$(in_box pgrep -f email_worker.py | tr '\n' ' ')
if [[ " $workers " != *" $old "* && $(echo "$workers" | wc -w | tr -d ' ') == "2" ]]; then
  pass "killed email-worker $old; the supervisor started a new one (now: $workers)"
else
  fail "after kill: workers = $workers"
fi
compose logs bazaar 2>/dev/null | grep -q "(PID $old) died (signal SIGTERM)" \
  && pass "supervisor reports SIGTERM for PID $old" || fail "no SIGTERM line in the logs"

old9=$(in_box pgrep -f email_worker.py | head -1)
in_box kill -9 "$old9"                   # SIGKILL
sleep 3
compose logs bazaar 2>/dev/null | grep -q "(PID $old9) died (signal SIGKILL)" \
  && pass "supervisor reports SIGKILL for PID $old9" || fail "no SIGKILL line in the logs"

compose exec -T -d bazaar python3 /examples/make_zombie.py
sleep 4
zombies=$(in_box ps -eo stat,cmd | grep -c '^Z.*<defunct>' || true)
[[ "$zombies" -ge 1 ]] && pass "make_zombie.py created a zombie (STAT Z, <defunct>)" || fail "no zombie found"

threads=$(in_box grep '^Threads:' "/proc/$backend/status" | awk '{print $2}')
[[ "$threads" == "3" ]] && pass "/proc/$backend/status says Threads: 3" || fail "/proc threads: $threads"

(curl -s "http://localhost:${BAZAAR_PORT}/report" >/dev/null &)
sleep 1
cpu=$(in_box top -b -n 2 -d 1 | awk -v p="$backend" '/^top -/{n++} n==2 && $1==p {print int($9)}')
[[ "${cpu:-0}" -ge 50 ]] && pass "/report keeps bazaar-backend busy (${cpu}% CPU in top)" || fail "backend CPU during report: ${cpu:-?}%"

out=$(in_box python3 /examples/share_or_not.py)
[[ "$out" == *"After the threads, the main program sees 3 item(s)."* && "$out" == *"After the processes, the main program sees 3 item(s)."* ]] \
  && pass "share_or_not.py: threads share the cart, processes don't" || fail "share_or_not: $out"

out=$(in_box python3 /examples/last_earbuds.py)
without=$(echo "$out" | sed -n 2p); with=$(echo "$out" | sed -n 4p)
[[ "$without" == *"sold 10 pairs"* && "$with" == *"sold 8 pairs, stock now says 0"* ]] \
  && pass "last_earbuds.py: oversells without a lock, exactly 8 with a lock" || fail "last_earbuds: $out"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
