#!/usr/bin/env bash
# Automated check for Lab 04-07. Exit code 0 = every check passed.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m04-07"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }
sh_() { docker compose -p "$PROJECT" run --rm -T python sh -c "$1" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

[[ "$(py examples/text_file.py)" == "Asha bought 2 Masala Box for ₹598
Ravi bought 1 Cotton Kurta for ₹649
Priya bought 1 Steel Water Bottle for ₹349" ]] && pass "text_file.py: write, append, read back (with ₹)" || fail "text_file: $(py examples/text_file.py)"

[[ "$(py examples/save_catalog.py)" == $'Wireless Earbuds False\nsame data? True' ]] && pass "save_catalog.py: json.dump then json.load gives the same data" || fail "save_catalog: $(py examples/save_catalog.py)"

f=$(sh_ 'cat data/catalog.json')
[[ "$f" == *'"in_stock": true'* && "$f" == *'"in_stock": false'* && "$f" == *'  {'* ]] && pass "data/catalog.json is real JSON text (true/false, indented)" || fail "catalog.json: $f"

[[ "$(py examples/json_text.py)" == "{\"customer\": \"Ravi\", \"items\": [[\"Cotton Kurta\", 1]], \"coupon\": null, \"gift\": true}
str
{'customer': 'Ravi', 'items': [['Cotton Kurta', 1]], 'coupon': None, 'gift': True}" ]] && pass "json_text.py: dumps/loads; None→null, True→true, tuple→list" || fail "json_text: $(py examples/json_text.py)"

[[ "$(py examples/safe_load.py)" == "{'items': []}
data/broken.json is broken (Expecting value: line 1 column 12 (char 11)); starting with an empty cart
{'items': []}" ]] && pass "safe_load.py: missing file and broken file both handled" || fail "safe_load: $(py examples/safe_load.py)"

out=$(py exercises/save_cart.py)
[[ "$out" == *"JSONDecodeError: Expecting property name enclosed in double quotes: line 1 column 2 (char 1)" ]] && pass "the exercise really crashes (str(cart) isn't JSON)" || fail "exercise: $out"

[[ "$(py solutions/save_cart.py)" == "Asha's cart: ₹1,247" ]] && pass "solution: json.dump → Asha's cart ₹1,247" || fail "solution: $(py solutions/save_cart.py)"

[[ "$(py examples/deeper.py)" == 'deeper.log True Masala Box restocked: 40
"\u20b9299" "₹299"
asha_cart_safe.json Asha False' ]] && pass "deeper.py: pathlib, ensure_ascii, safe save with os.replace" || fail "deeper: $(py examples/deeper.py)"

m=$(py mistakes/set_to_json.py; py mistakes/missing_file.py)
[[ "$m" == *"TypeError: Object of type set is not JSON serializable"* && "$m" == *"FileNotFoundError: [Errno 2] No such file or directory: 'data/old_orders.log'"* ]] \
  && pass "mistakes/: a set isn't JSON; a missing file" || fail "mistakes: $m"

[[ "$(sh_ 'python3 examples/text_file.py >/dev/null && python3 mistakes/w_erases.py')" == "''" ]] && pass "mistakes/w_erases.py: opening with \"w\" empties the file, silently" || fail "w_erases"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
