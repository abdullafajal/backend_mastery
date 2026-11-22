#!/usr/bin/env bash
# safe_cleanup.sh: delete old order logs, safely. Dry run by default.
set -euo pipefail                            # stop on errors, unset variables, and failed pipes

LOG_DIR="${LOG_DIR:-/srv/bazaar/logs}"       # use $LOG_DIR if it is set, otherwise this default
REALLY="${1:-}"                              # first argument, or empty

cd "$LOG_DIR" || exit 1                      # never continue in the wrong folder
echo "cleaning old order logs in $LOG_DIR"

count=0
for f in "$LOG_DIR"/order_*.log; do          # the shell expands the glob into file names
  [ -e "$f" ] || continue                    # no match? the pattern itself comes through; skip it
  if [ "$REALLY" = "--really" ]; then
    rm -- "$f"                               # "--" means: no more options, even if a name starts with "-"
    echo "deleted: $f"
  else
    echo "would delete: $f"
  fi
  count=$((count + 1))
done

if [ "$REALLY" = "--really" ]; then
  echo "$count file(s) deleted."
else
  echo "$count file(s) would be deleted. Run with --really to delete them."
fi
