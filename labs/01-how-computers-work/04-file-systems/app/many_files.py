# many_files.py: Bazaar saves one tiny thumbnail file per product... until the disk is "full".
# Run it with: python3 many_files.py

import os
import shutil

folder = "/thumbs"
made = 0
try:
    while True:
        with open(f"{folder}/product_{made}.jpg", "wb") as f:
            f.write(b"x" * 100)                  # a tiny 100-byte "thumbnail"
        made += 1
except OSError as e:
    print(f"stopped after {made:,} files: {e}")
usage = shutil.disk_usage(folder)
print(f"space used: {usage.used // 1024} KB of {usage.total // 1024} KB")
st = os.statvfs(folder)
print(f"inodes free: {st.f_ffree} of {st.f_files}")
