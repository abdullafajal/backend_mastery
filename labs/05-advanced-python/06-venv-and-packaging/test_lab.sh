#!/usr/bin/env bash
# Automated check for Lab 05-06. Exit code 0 = every check passed.
# Needs internet: packages come from PyPI. All venvs are made in /tmp inside the container, so your own .venv folders are never touched.
set -euo pipefail
cd "$(dirname "$0")"

PROJECT="bz-m05-06"
FAILED=0
trap 'docker compose -p "$PROJECT" down -v --remove-orphans >/dev/null 2>&1 || true' EXIT
pass() { echo "PASS: $1"; }
fail() { echo "FAIL: $1"; FAILED=1; }

echo "Building the lab image (Python 3.13 + uv 0.13.6; the first time takes a minute)..."
docker compose -p "$PROJECT" build -q >/dev/null 2>&1

same=1
for f in money.py catalog.py main.py __init__.py; do
  for d in exercises solutions; do cmp -s "bazaar_pkg/src/bazaar/$f" "$d/bazaar_pkg/src/bazaar/$f" || same=0; done
done
cmp -s bazaar_pkg/pyproject.toml solutions/bazaar_pkg/pyproject.toml || same=0
[[ $same -eq 1 ]] && pass "the exercise and solution packages differ from bazaar_pkg only where they should" || fail "package copies differ"

out=$(docker compose -p "$PROJECT" run --rm -T python bash -c '
  echo "== uv";        uv --version
  echo "== system";    python3 -c "import requests" 2>&1 | tail -1
  echo "== a";         python3 -m venv /tmp/a && /tmp/a/bin/pip install -q -r project-a/requirements.txt && /tmp/a/bin/python -c "import requests; print(requests.__version__)"
  echo "== freeze";    /tmp/a/bin/pip freeze
  echo "== b";         python3 -m venv /tmp/b && /tmp/b/bin/pip install -q -r project-b/requirements.txt && /tmp/b/bin/python -c "import requests; print(requests.__version__)"
  echo "== activate";  source /tmp/a/bin/activate && which python && deactivate && which python3
  echo "== stillnone"; python3 -c "import requests" 2>&1 | tail -1
  echo "== uvinstall"; uv venv -q /tmp/u && uv pip install -q --python /tmp/u -r project-a/requirements.txt && /tmp/u/bin/python -c "import requests; print(requests.__version__)"
  echo "== package";   python3 -m venv /tmp/shop && /tmp/shop/bin/pip install -q ./bazaar_pkg && /tmp/shop/bin/pip show bazaar | grep -E "^(Name|Version):"
  echo "== command";   cd /tmp && export BAZAAR_DATA=/tmp/c.json && bazaar_cmd=/tmp/shop/bin/bazaar && $bazaar_cmd list; $bazaar_cmd add "Masala Box" 299 "Patel Spices"; $bazaar_cmd search box; cd /lab
  echo "== exercise";  python3 -m venv /tmp/ex && /tmp/ex/bin/pip install -q ./exercises/bazaar_pkg && /tmp/ex/bin/bazaar list 2>&1 | tail -1
  echo "== solution";  python3 -m venv /tmp/so && /tmp/so/bin/pip install -q ./solutions/bazaar_pkg && BAZAAR_DATA=/tmp/s.json /tmp/so/bin/bazaar list
  echo "== end"' 2>/dev/null || true)

section() { awk -v s="== $1" '$0==s{f=1;next} /^== /{f=0} f' <<< "$out"; }

[[ "$(section uv)" == "uv 0.13.6"* ]] && pass "uv 0.13.6 is installed" || fail "uv: $(section uv)"
[[ "$(section system)" == "ModuleNotFoundError: No module named 'requests'" ]] && pass "the system Python has no requests" || fail "system: $(section system)"
[[ "$(section a)" == "2.34.2" && "$(section b)" == "2.33.1" ]] && pass "project-a's venv has requests 2.34.2, project-b's has 2.33.1, side by side" || fail "a/b: $(section a) / $(section b)"
[[ "$(section freeze)" == "$(grep -v '^#' project-a/requirements.txt | sort -f)" ]] && pass "pip freeze matches requirements.txt exactly (every dependency pinned)" || fail "freeze: $(section freeze)"
[[ "$(section activate)" == $'/tmp/a/bin/python\n/usr/local/bin/python3' ]] && pass "activate makes python the venv's; deactivate goes back" || fail "activate: $(section activate)"
[[ "$(section stillnone)" == "ModuleNotFoundError: No module named 'requests'" ]] && pass "installing into venvs left the system Python untouched" || fail "stillnone: $(section stillnone)"
[[ "$(section uvinstall)" == "2.34.2" ]] && pass "uv makes a venv and installs the same pins" || fail "uv install: $(section uvinstall)"
[[ "$(section package)" == $'Name: bazaar\nVersion: 0.1.0' ]] && pass "pip install ./bazaar_pkg installs bazaar 0.1.0" || fail "package: $(section package)"
[[ "$(section command | tr -s ' ')" == $'No products.\nAdded Masala Box at ₹299.00.\nMasala Box ₹299.00 Patel Spices' ]] && pass "the installed bazaar command works from any folder" || fail "command: $(section command)"
[[ "$(section exercise)" == "ImportError: cannot import name 'start' from 'bazaar.main' (/tmp/ex/lib/python3.13/site-packages/bazaar/main.py)" ]] && pass "the exercise really fails (the command points to a missing function)" || fail "exercise: $(section exercise)"
[[ "$(section solution)" == "No products." ]] && pass "solution: bazaar = \"bazaar.main:run\" works" || fail "solution: $(section solution)"

if [[ $FAILED -eq 0 ]]; then echo "ALL CHECKS PASSED"; else echo "SOME CHECKS FAILED"; exit 1; fi
