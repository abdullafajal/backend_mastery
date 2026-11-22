#!/usr/bin/env bash
# start.sh: make Bazaar's access log, then wait.
set -e
rm -rf /srv/bazaar && mkdir -p /srv/bazaar
python3 /srv/tools/make_logs.py
exec sleep infinity
