#!/usr/bin/env bash
# start.sh: build Bazaar's files in /srv/bazaar, then keep writing to a live log (for `tail -f`).
set -e
B=/srv/bazaar
rm -rf "$B" && mkdir -p "$B"/{logs,backups,config,media/products}
cd "$B"

# config + a hidden file
printf 'site_name = Bazaar\ncurrency = INR\nsale = none\nmax_cart_items = 20\n' > config/bazaar.conf
printf 'DB_PASSWORD=not-a-real-password\n' > .env

# 10 days of order logs, with matching dates on disk
for d in 12 13 14 15 16 17 18 19 20 21; do
  f="logs/order_202611$d.log"
  for i in 1 2 3 4 5; do
    echo "2026-11-$d 10:0$i:00 order=$d$i status=$([ "$i" = 3 ] && echo failed || echo paid) total=$((i * 299))" >> "$f"
  done
  [ "$d" = 21 ] || touch -d "2026-11-$d 23:59" "$f"   # today's log keeps the current time
done

# product photos: the biggest folder (3 files of 4 MB)
for p in red_running_shoes cotton_kurta masala_box; do head -c 4000000 /dev/zero > "media/products/$p.jpg"; done

# an old backup
head -c 1000000 /dev/zero > backups/products_2026-10-01.json && touch -d "2026-10-01" backups/products_2026-10-01.json

# keep writing a live log, like a running backend
n=0
while true; do
  n=$((n + 1))
  echo "$(date '+%Y-%m-%d %H:%M:%S') request=$n path=/products status=200" >> logs/live.log
  sleep 2
done
