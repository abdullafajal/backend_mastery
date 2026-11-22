# crash_save.py: what happens if Bazaar crashes in the middle of saving products.json?
# Run it with: python3 crash_save.py unsafe   or   python3 crash_save.py safe   or   python3 crash_save.py check

import json
import os
import signal
import sys
from pathlib import Path

DATA = Path(os.environ.get("DATA_DIR", "/data"))
TARGET = DATA / "products.json"
products = [{"id": i, "name": f"Product {i}", "price": 999} for i in range(20_000)]
text = json.dumps(products)


def crash():
    os.kill(os.getpid(), signal.SIGKILL)  # pretend the power went off, right now


def save_unsafe():
    with open(TARGET, "w") as f:          # "w" empties the old file first!
        f.write(text[: len(text) // 2])   # half of the new data is written...
        f.flush()
        crash()                            # ...and then the crash


def save_safe():
    tmp = TARGET.with_suffix(".json.tmp")  # 1. write to a temporary file in the SAME folder
    with open(tmp, "w") as f:
        f.write(text[: len(text) // 2])
        f.flush()
        crash()                            # crash while writing the temporary file
        f.write(text[len(text) // 2 :])
        f.flush()
        os.fsync(f.fileno())               # 2. make sure it is really on the disk
    os.replace(tmp, TARGET)                # 3. swap the name in one step (atomic)


def check():
    try:
        data = json.loads(TARGET.read_text())
        print(f"products.json is valid: {len(data):,} product(s)")
    except json.JSONDecodeError as e:
        print(f"products.json is BROKEN: {e}")


mode = sys.argv[1]
if mode in ("unsafe", "safe"):
    TARGET.write_text(json.dumps([{"id": 1, "name": "Red Running Shoes", "price": 999}]))  # yesterday's good file
    print(f"before: {TARGET.stat().st_size} bytes, saving with the {mode} method...", flush=True)
    save_unsafe() if mode == "unsafe" else save_safe()
else:
    check()
