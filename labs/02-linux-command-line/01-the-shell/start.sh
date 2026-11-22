#!/usr/bin/env bash
# start.sh: give every lab session a fresh copy of Bazaar's files in /srv/bazaar, then start bash there.
rm -rf /srv/bazaar && cp -r /seed /srv/bazaar
cd /srv/bazaar || exit 1
if [ $# -gt 0 ]; then
  exec bash -c "$*"      # used by test_lab.sh: run the given commands
else
  exec bash              # used by you: an interactive shell
fi
