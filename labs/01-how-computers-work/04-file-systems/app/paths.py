# paths.py: absolute and relative paths, the current folder, and pathlib.
# Run it with: python3 paths.py

import os
from pathlib import Path

print(f"1) This process's current folder: {os.getcwd()}")

rel = Path("orders/2026/11/order_1042.json")       # relative: starts from the current folder
print(f"2) relative path:  {rel}")
print(f"   is absolute?    {rel.is_absolute()}")
print(f"   resolved:       {rel.resolve()}")       # joined with the current folder

absolute = Path("/data") / "orders" / "2026" / "11" / "order_1042.json"   # build paths with "/"
print(f"3) absolute path:  {absolute}")
print(f"   parent folder:  {absolute.parent}")
print(f"   file name:      {absolute.name}")
print(f"   stem / suffix:  {absolute.stem} / {absolute.suffix}")

messy = Path("/data/orders/../products/./shoes.json")
print(f"4) '..' and '.':   {messy}  ->  {Path(os.path.normpath(messy))}")

os.chdir("/data")
print(f"5) after os.chdir('/data'), the same relative path means: {rel.resolve()}")
