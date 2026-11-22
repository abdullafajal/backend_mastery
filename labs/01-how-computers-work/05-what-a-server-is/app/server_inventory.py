# server_inventory.py: what does this "server" have? Everything Module 1 talked about, in one place.
# Run it with: python3 server_inventory.py   (Linux only: it reads /proc)

import os
import platform
import resource
import shutil
import socket


def meminfo(key):
    for line in open("/proc/meminfo"):
        if line.startswith(key + ":"):
            return int(line.split()[1]) // 1024          # kB -> MB


def listening_sockets():
    """Read the kernel's table of TCP sockets and keep the ones in LISTEN state."""
    found = []
    for path in ("/proc/net/tcp", "/proc/net/tcp6"):
        try:
            lines = open(path).read().splitlines()[1:]
        except FileNotFoundError:
            continue
        for line in lines:
            parts = line.split()
            if parts[3] != "0A":                          # state 0A = LISTEN
                continue
            ip_hex, port_hex = parts[1].rsplit(":", 1)    # both written in hexadecimal
            if len(ip_hex) == 8:                          # IPv4, bytes stored in reverse order
                ip = ".".join(str(int(ip_hex[i:i + 2], 16)) for i in (6, 4, 2, 0))
            else:
                ip = "IPv6"
            found.append(f"{ip}:{int(port_hex, 16)}")
    return found


uptime_s = float(open("/proc/uptime").read().split()[0])
load1, load5, load15 = os.getloadavg()
disk = shutil.disk_usage("/")
soft, hard = resource.getrlimit(resource.RLIMIT_NOFILE)
st = os.statvfs("/")

print(f"name (hostname)   : {socket.gethostname()}")
print(f"operating system  : {platform.system()} {platform.release()} ({platform.machine()})")
print(f"CPU cores         : {os.cpu_count()}")
print(f"load average      : {load1:.2f} {load5:.2f} {load15:.2f}  (1, 5, 15 minutes)")
print(f"RAM               : {meminfo('MemTotal')} MB total, {meminfo('MemAvailable')} MB available")
print(f"disk /            : {disk.total // 2**30} GB total, {disk.free // 2**30} GB free")
print(f"inodes /          : {st.f_files:,} total, {st.f_ffree:,} free")
print(f"open files limit  : {soft} per process (hard limit {hard})")
print(f"up for            : {uptime_s / 3600:.1f} hours")
print(f"listening on      : {', '.join(listening_sockets()) or 'nothing'}")
