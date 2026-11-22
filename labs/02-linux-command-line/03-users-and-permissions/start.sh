#!/usr/bin/env bash
# start.sh: build Bazaar's files with realistic owners and permissions, then wait.
set -e
B=/srv/bazaar
rm -rf "$B" && mkdir -p "$B"/{config,logs,media/uploads}
printf 'DB_PASSWORD=not-a-real-password\n' > "$B/.env"
printf 'site_name = Bazaar\nsale = none\n' > "$B/config/bazaar.conf"
echo "2026-11-21 10:01:00 order=211 status=paid" > "$B/logs/order_20261121.log"
chmod 644 "$B/.env"                               # the mistake we will fix: everyone can read it
chown -R root:bazaar "$B/config" "$B/logs"
chown www-data:www-data "$B/media/uploads"        # the web server saves product photos here
exec sleep infinity
