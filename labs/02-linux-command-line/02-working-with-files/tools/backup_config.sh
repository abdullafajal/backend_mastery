#!/usr/bin/env bash
# backup_config.sh: copy Bazaar's config to a dated backup, and keep only the 3 newest backups.
set -euo pipefail

SRC=/srv/bazaar/config/bazaar.conf
DEST=/srv/bazaar/backups/config

mkdir -p "$DEST"                                   # -p: create parent folders too; no error if it exists
stamp=$(date +%Y%m%d-%H%M%S)                       # e.g. 20261121-111530
cp -a "$SRC" "$DEST/bazaar.conf.$stamp"            # -a: keep the original's permissions and times
echo "saved $DEST/bazaar.conf.$stamp"

# Sort by NAME, newest first (the timestamp in the name sorts correctly). Not by time with `ls -t`:
# `cp -a` copied the original's modification time, so every backup has the same time!
# Skip the 3 newest (tail -n +4) and delete the rest.
ls -1 "$DEST"/bazaar.conf.* | sort -r | tail -n +4 | while read -r old; do
  rm -- "$old"
  echo "removed old backup $old"
done
echo "backups now: $(ls "$DEST" | wc -l)"
