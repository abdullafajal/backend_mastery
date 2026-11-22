#!/usr/bin/env bash
# Automated check for Lab 05-08 (the plan's lab: 100 supplier APIs, three ways). Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m05-08"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
run() { docker compose -p "$PROJECT" run --rm -T python sh -c "$1 2>&1" 2>/dev/null || true; }
le() { awk -v a="$1" -v b="$2" 'BEGIN{exit !(a<=b)}'; }

echo "Building the lab image (Python 3.13 + httpx 0.28.1) and starting the supplier server..."
docker compose -p "$PROJECT" build -q >/dev/null 2>&1
docker compose -p "$PROJECT" up -d suppliers >/dev/null 2>&1
ready=$(run 'python3 -c "
import time, httpx
for _ in range(60):
    try:
        print(httpx.get(\"http://suppliers:8080/price/7\").json()); break
    except httpx.TransportError:
        time.sleep(0.5)
"')
[[ "$ready" == "{'supplier': 7, 'price_paise': 20700}" ]] && pass "the supplier server answers: $ready" || fail "suppliers not ready: $ready"

[[ "$(run 'python3 examples/asyncio_basics.py')" =~ ^"ask   Patel Spices
ask   Meera Handloom
ask   Kumar Footwear
reply Meera Handloom
reply Kumar Footwear
reply Patel Spices
[300, 100, 200] in 0.3 s"$ ]] && pass "asyncio_basics.py: all asked first, replies in order of speed, 0.3 s total" || fail "basics: $(run 'python3 examples/asyncio_basics.py')"

out=$(run 'cd examples && python3 compare.py')
t1=$(sed -n 's/^one by one *\([0-9.]*\) s .*/\1/p' <<< "$out"); t2=$(sed -n 's/^100 threads *\([0-9.]*\) s .*/\1/p' <<< "$out"); t3=$(sed -n 's/^asyncio *\([0-9.]*\) s .*/\1/p' <<< "$out")
if [[ "$t1" =~ ^[0-9.]+$ && "$t2" =~ ^[0-9.]+$ && "$t3" =~ ^[0-9.]+$ ]] && le 9.5 "$t1" && le "$t1" 30 && le "$t2" 2.5 && le "$t3" 2.5 \
   && [[ $(grep -c "100 prices, total ₹25,050" <<< "$out") -eq 3 && "$out" == *"all three agree? True" ]]; then
  pass "compare.py: one by one ${t1} s, 100 threads ${t2} s, asyncio ${t3} s; all three got the same 100 prices"
else fail "compare: $out"; fi

ex=$(run 'python3 exercises/blocking.py'); so=$(run 'python3 solutions/blocking.py')
e=$(sed -n 's/^10 prices in \([0-9.]*\) s$/\1/p' <<< "$ex"); s=$(sed -n 's/^10 prices in \([0-9.]*\) s$/\1/p' <<< "$so")
[[ "$e" =~ ^[0-9.]+$ ]] && le 0.9 "$e" && pass "the exercise really shows the bug (time.sleep blocks: ${e} s for 10)" || fail "exercise: $ex"
[[ "$s" =~ ^[0-9.]+$ ]] && le "$s" 0.3 && pass "solution: await asyncio.sleep lets all 10 wait together (${s} s)" || fail "solution: $so"

m1=$(run 'python3 mistakes/no_await.py'); m2=$(run 'python3 mistakes/await_outside.py')
[[ "$m1" == *"RuntimeWarning: coroutine 'fetch_price' was never awaited"* && "$m1" == *"price: <coroutine object fetch_price at 0x"* \
   && "$m2" == *"SyntaxError: 'await' outside function"* ]] && pass "mistakes/: a coroutine without await; await outside async def" || fail "mistakes: $m1 / $m2"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
