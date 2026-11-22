# check.py: run every reference solution and compare it with answers computed independently in Python.
import re
import subprocess

expected = {}
for line in subprocess.run(["python3", "/srv/playground/expected.py"], capture_output=True, text=True).stdout.splitlines():
    k, v = line.split(" ", 1)
    expected[k] = v


def run(n):
    return subprocess.run(["bash", "/srv/playground/solutions.sh", str(n)], capture_output=True, text=True).stdout.strip()


def counted(text):
    """'   7 customer=asha' lines -> '7:asha' (also for 'value name' lines)."""
    out = []
    for line in text.splitlines():
        c, name = line.split(None, 1)
        out.append(f"{c}:{name.replace('customer=', '')}")
    return " ".join(out)


ok = 0
lines = open("/srv/bazaar/logs/access.log").read().splitlines()
checks = {
    1: lambda o: o == expected["t1"],
    2: lambda o: o.splitlines() == lines[:3],
    3: lambda o: o == expected["t3"],
    4: lambda o: o == expected["t3"],
    5: lambda o: o == expected["t5"],
    6: lambda o: counted(o) == expected["t6"],
    7: lambda o: counted(o) == expected["t7"],
    8: lambda o: o == expected["t8"],
    9: lambda o: counted(o) == expected["t9"],
    10: lambda o: o == expected["t10"],
    11: lambda o: counted(o) == expected["t11"],
    12: lambda o: sum(int(x.split()[0]) for x in o.splitlines()) == int(expected["t1"]),
    13: lambda o: counted(o) == expected["t13"],
    14: lambda o: o == expected["t14"],
    15: lambda o: o == expected["t15"],
    16: lambda o: o == expected["t16"],
    17: lambda o: o == expected["t17"],
    18: lambda o: o == expected["t18"],
    19: lambda o: o == expected["t19"],
    20: lambda o: o == expected["t3"],
}
for n in range(1, 21):
    out = run(n)
    good = checks[n](out)
    ok += good
    if not good:
        print(f"task {n}: MISMATCH\n  shell:  {out!r}")
print(f"{ok}/20 playground answers match")
