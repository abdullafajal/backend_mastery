# expected.py: compute the 20 answers with plain Python, independently of the shell solutions.
from collections import Counter, defaultdict

rows = [l.split() for l in open("/srv/bazaar/logs/access.log")]
kv = lambda r: dict(x.split("=", 1) for x in r[5:])
status = Counter(r[3] for r in rows)
paths = Counter(r[2] for r in rows)
co = [r for r in rows if r[1] == "POST" and r[2] == "/checkout"]
ok = [r for r in co if r[3] == "200"]
failed = Counter(kv(r)["customer"] for r in co if r[3] == "500")
rev = defaultdict(int)
for r in ok:
    rev[kv(r)["product"]] += int(kv(r)["amount"])
hours = Counter(r[0][11:13] for r in rows)
slow = max(rows, key=lambda r: int(r[4][:-2]))
ms200 = [int(r[4][:-2]) for r in rows if r[3] == "200"]
custs = sorted({kv(r)["customer"] for r in rows})
shoes = sum(1 for r in rows if "shoes" in " ".join(r).lower())

print("t1", len(rows))
print("t3", status["500"])
print("t5", status["500"] + status["404"])
print("t6", " ".join(f"{c}:{s}" for s, c in status.most_common()))
print("t7", " ".join(f"{c}:{p}" for p, c in paths.most_common(2)))
print("t8", len(co))
print("t9", " ".join(f"{c}:{n}" for n, c in failed.most_common(1)))
print("t10", sum(int(kv(r)["amount"]) for r in ok))
print("t11", " ".join(f"{v}:{k}" for k, v in sorted(rev.items(), key=lambda x: -x[1])))
print("t13", " ".join(f"{c}:{h}" for h, c in hours.most_common(1)))
print("t14", " ".join(slow))
print("t15", f"{sum(ms200) / len(ms200):.1f}")
print("t16", len(custs))
print("t17", len(rows) - status["200"])
print("t18", " ".join(custs))
print("t19", shoes)
