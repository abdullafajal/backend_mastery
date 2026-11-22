#!/usr/bin/env bash
# Automated check for Lab 04-08. Exit code 0 = every check passed.
# Bazaar v0 is tested with BAZAAR_DATA=/tmp/catalog.json, so your own bazaar_v0/data/catalog.json is never touched.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m04-08"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }
# Python's own errors are joined to its output inside the container; Docker Compose's progress messages are dropped.
py() { docker compose -p "$PROJECT" run --rm -T python sh -c 'python3 "$@" 2>&1' _ "$@" 2>/dev/null || true; }

echo "Running the lab's programs in python:3.13.18-slim-trixie..."

out=$(docker compose -p "$PROJECT" run --rm -T -e BAZAAR_DATA=/tmp/catalog.json python sh -c '
  cd bazaar_v0
  r() { python3 main.py "$@" 2>&1; echo "(exit $?)"; }
  echo "== money";   python3 money.py
  echo "== empty";   r list
  echo "== add";     r add "Red Running Shoes" 999 "Kumar Footwear"; r add "Cotton Kurta" 649 "Meera Handloom"
                     r add "Masala Box" 299 "Patel Spices"; r add "Wireless Earbuds" 1,499 "Sharma Electronics"
                     r add "Steel Water Bottle" 349.00 "Sharma Electronics"
  echo "== list";    r list
  echo "== search";  r search box; r search SHARMA; r search gold
  echo "== refuse";  r add "masala box" 299 "Patel Spices"; r add "Gift Card" abc "Bazaar"; r add "Gift Card" 0 "Bazaar"
  echo "== usage";   r sell | tail -2
  echo "== elsewhere"; cd /tmp && python3 /lab/bazaar_v0/main.py search kurta
  echo "== file";    python3 -c "import json; d = json.load(open(\"/tmp/catalog.json\")); print(len(d), d[3][\"price_paise\"])"
  echo "== end"' 2>/dev/null || true)

section() { awk -v s="== $1" '$0==s{f=1;next} /^== /{f=0} f' <<< "$out"; }

[[ "$(section money)" == "₹1,531.64 29900 149950" ]] && pass "money.py run directly: its __main__ self-test runs" || fail "money: $(section money)"
[[ "$(section empty)" == $'No products.\n(exit 0)' ]] && pass "an empty catalog (no file yet) lists 'No products.'" || fail "empty: $(section empty)"
[[ "$(section add | grep -c '^Added ')" == "5" && "$(section add)" == *"Added Wireless Earbuds at ₹1,499.00."* ]] && pass "add: 5 products, prices typed as 999, 1,499 and 349.00" || fail "add: $(section add)"
[[ "$(section list | tr -s ' ')" == "Red Running Shoes ₹999.00 Kumar Footwear
Cotton Kurta ₹649.00 Meera Handloom
Masala Box ₹299.00 Patel Spices
Wireless Earbuds ₹1,499.00 Sharma Electronics
Steel Water Bottle ₹349.00 Sharma Electronics
(exit 0)" ]] && pass "list: all 5 products, loaded back from the JSON file" || fail "list: $(section list)"
[[ "$(section search | tr -s ' ')" == "Masala Box ₹299.00 Patel Spices
(exit 0)
Wireless Earbuds ₹1,499.00 Sharma Electronics
Steel Water Bottle ₹349.00 Sharma Electronics
(exit 0)
No products.
(exit 0)" ]] && pass "search: by name or seller, ignoring capitals; no match → 'No products.'" || fail "search: $(section search)"
[[ "$(section refuse)" == "Not added: 'masala box' is already in the catalog
(exit 1)
Not added: not a price: 'abc'
(exit 1)
Not added: the price must be more than ₹0
(exit 1)" ]] && pass "add refuses duplicates, bad prices and ₹0 (exit code 1)" || fail "refuse: $(section refuse)"
[[ "$(section usage)" == $'  python3 main.py search box\n(exit 2)' ]] && pass "an unknown command prints the usage (exit code 2)" || fail "usage: $(section usage)"
[[ "$(section elsewhere | tr -s ' ')" == "Cotton Kurta ₹649.00 Meera Handloom" ]] && pass "main.py works from any folder (imports and data path are next to main.py)" || fail "elsewhere: $(section elsewhere)"
[[ "$(section file)" == "5 149900" ]] && pass "the catalog file holds 5 products in paise" || fail "file: $(section file)"

[[ "$(py examples/stdlib_tour.py)" == "average price: 759 rupees
delivery by: 2026-11-06
today's lucky coupon: DIWALI150
{\"ok\": true}" ]] && pass "stdlib_tour.py: statistics, datetime, random (seeded), json" || fail "stdlib: $(py examples/stdlib_tour.py)"

[[ "$(py examples/import_it.py)" == "who_am_i.py says its __name__ is 'who_am_i'
import_it.py is '__main__'" ]] && pass "import_it.py: an imported module has its own __name__, so its __main__ part is skipped" || fail "import_it: $(py examples/import_it.py)"

[[ "$(py exercises/search.py)" == $'[]\n[]\n[\'Masala Box\']' ]] && pass "the exercise really shows the bug (\"box\" finds nothing)" || fail "exercise: $(py exercises/search.py)"
[[ "$(py solutions/search.py)" == $'[\'Masala Box\']\n[\'Steel Water Bottle\']\n[\'Masala Box\']' ]] && pass "solution: search ignores capital letters" || fail "solution: $(py solutions/search.py)"

m=$(py mistakes/typo_import.py; py mistakes/shadow/app.py)
[[ "$m" == *"ModuleNotFoundError: No module named 'mony'"* && "$m" == *"AttributeError: module 'json' has no attribute 'dumps' (consider renaming"* ]] \
  && pass "mistakes/: a typo in an import; a file named json.py hides the real json" || fail "mistakes: $m"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
