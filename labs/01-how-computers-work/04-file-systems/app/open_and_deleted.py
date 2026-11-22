# open_and_deleted.py: a big log file is deleted while a process still has it open.
# Run it with: python3 open_and_deleted.py

import os
import shutil
import time

LOG = "/data/orders.log"


def free_mb():
    return shutil.disk_usage("/data").free // (1024 * 1024)


print(f"free space at start:          {free_mb()} MB")
log = open(LOG, "wb")                        # the "backend" opens its log file...
log.write(os.urandom(20 * 1024 * 1024))      # ...and writes 20 MB of order logs
log.flush()
os.fsync(log.fileno())
print(f"after writing a 20 MB log:    {free_mb()} MB")
print(f"the log is file descriptor {log.fileno()} of PID {os.getpid()}")

os.remove(LOG)                               # someone deletes the log to free space
print(f"after deleting the log:       {free_mb()} MB   <- the space did NOT come back")
print(f"the file still appears as:    {os.readlink(f'/proc/self/fd/{log.fileno()}')}")

log.close()                                  # only now does the last user let go
time.sleep(0.2)
print(f"after the process closed it:  {free_mb()} MB")
