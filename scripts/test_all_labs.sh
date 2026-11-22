#!/usr/bin/env bash
# Runs every labs/**/test_lab.sh one by one and prints a summary.
# Usage: bash scripts/test_all_labs.sh [filter]   e.g. filter "00-setup"
set -uo pipefail
cd "$(dirname "$0")/.."
filter="${1:-}"

tests=()
while IFS= read -r t; do
  [[ -n "$filter" && "$t" != *"$filter"* ]] && continue
  tests+=("$t")
done < <(find labs -name test_lab.sh | sort)

passed=0; failed=0; failed_list=()
for t in "${tests[@]}"; do
  echo "=== $t"
  # </dev/null: a lab (e.g. `docker compose run`) must never read our stdin
  if bash "$t" </dev/null; then
    passed=$((passed + 1))
  else
    failed=$((failed + 1))
    failed_list+=("$t")
    # On GitHub Actions, also print an annotation: it shows on the run's page even to people who can't open the logs.
    [[ "${GITHUB_ACTIONS:-}" == "true" ]] && echo "::error title=Lab test failed::$t"
  fi
done

echo
echo "Labs passed: $passed, failed: $failed (found: ${#tests[@]})"
for f in "${failed_list[@]:-}"; do [[ -n "$f" ]] && echo "  FAILED: $f"; done
if [[ $((passed + failed)) -ne ${#tests[@]} ]]; then
  echo "ERROR: some labs did not run"
  exit 1
fi
[[ $failed -eq 0 && ${#tests[@]} -gt 0 ]]
