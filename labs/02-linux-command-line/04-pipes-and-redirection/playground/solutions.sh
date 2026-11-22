#!/usr/bin/env bash
# solutions.sh: one reference answer for each of the 20 playground tasks. (Spoilers! Try first.)
# Run one:  bash /srv/playground/solutions.sh 9        Run all:  bash /srv/playground/solutions.sh all
cd /srv/bazaar
L=logs/access.log

t1()  { wc -l < "$L"; }                                                    # requests in the whole day
t2()  { head -n 3 "$L"; }                                                  # the first 3 lines
t3()  { grep -c ' 500 ' "$L"; }                                            # requests that failed with 500
t4()  { grep ' 500 ' "$L" > errors.txt; wc -l < errors.txt; }              # save them to a file (>)
t5()  { grep ' 404 ' "$L" >> errors.txt; wc -l < errors.txt; }             # add the 404s (>>)
t6()  { awk '{print $4}' "$L" | sort | uniq -c | sort -rn; }               # requests per status code
t7()  { awk '{print $3}' "$L" | sort | uniq -c | sort -rn | head -n 2; }   # top 2 paths
t8()  { grep -c 'POST /checkout' "$L"; }                                   # how many checkouts
t9()  { grep 'POST /checkout 500' "$L" | awk '{print $6}' | sort | uniq -c | sort -rn | head -n 1; }  # most failed checkouts
t10() { grep 'POST /checkout 200' "$L" | awk -F'amount=' '{s += $2} END {print s}'; }                # total revenue
t11() { grep 'POST /checkout 200' "$L" \
          | awk '{split($7, p, "="); split($9, a, "="); r[p[2]] += a[2]} END {for (k in r) print r[k], k}' \
          | sort -rn; }                                                    # revenue per product
t12() { cut -c 12-13 "$L" | sort | uniq -c; }                              # requests per hour
t13() { cut -c 12-13 "$L" | sort | uniq -c | sort -rn | head -n 1; }       # the busiest hour
t14() { sort -k5,5n "$L" | tail -n 1; }                                    # the slowest request
t15() { grep ' 200 ' "$L" | awk '{gsub("ms", "", $5); s += $5; n++} END {printf "%.1f\n", s / n}'; }  # average ms of 200s
t16() { awk '{print $6}' "$L" | sort -u | wc -l; }                         # how many different customers
t17() { grep -vc ' 200 ' "$L"; }                                           # lines that are NOT 200
t18() { awk '{print $6}' "$L" | sed 's/customer=//' | sort -u | tr '\n' ' '; echo; }  # customer names, one line
t19() { grep -ci 'SHOES' "$L"; }                                           # mentions of shoes, any case
t20() { grep ' 500 ' "$L" | tee errors_500.txt | wc -l; }                  # save AND count, in one go

if [ "${1:-}" = "all" ]; then
  for n in $(seq 1 20); do echo "== task $n"; "t$n"; done
else
  "t${1:?give a task number, 1-20, or all}"
fi
