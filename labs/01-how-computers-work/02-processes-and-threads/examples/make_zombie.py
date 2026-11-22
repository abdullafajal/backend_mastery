# make_zombie.py: a parent that forgets to collect its finished child, for 15 seconds.
# Run it with: python3 make_zombie.py   (then look at `ps` in another terminal)

import os
import subprocess
import time

child = subprocess.Popen(["sleep", "1"])  # the child finishes after 1 second
print(f"parent PID {os.getpid()} started child PID {child.pid}, and is NOT collecting it...", flush=True)
time.sleep(15)                           # meanwhile, the finished child is a zombie
child.wait()                             # wait() collects the child's exit code
print("parent collected the child. The zombie is gone.", flush=True)
