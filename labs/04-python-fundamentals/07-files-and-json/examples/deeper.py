"""Going deeper: pathlib, ensure_ascii, and saving safely (write a temp file, then swap it in)."""

import json
import os
from pathlib import Path

# pathlib: paths as objects; read_text/write_text open and close the file for you
log = Path("data") / "deeper.log"                  # / joins path parts on every OS
log.write_text("Masala Box restocked: 40\n", encoding="utf-8")
print(log.name, log.exists(), log.read_text(encoding="utf-8").strip())

# ensure_ascii: by default JSON writes ₹ as ₹ (still correct, just hard to read)
print(json.dumps("₹299"), json.dumps("₹299", ensure_ascii=False))

# Safe save: if the program dies halfway, the old file is still complete
cart = {"customer": "Asha", "items": [{"name": "Masala Box", "quantity": 2}]}
target = Path("data/asha_cart_safe.json")
temp = target.with_suffix(".tmp")
temp.write_text(json.dumps(cart, indent=2), encoding="utf-8")
os.replace(temp, target)                           # one step: the new file replaces the old one
print(target.name, json.loads(target.read_text(encoding="utf-8"))["customer"], temp.exists())
