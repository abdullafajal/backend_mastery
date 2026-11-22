# too_many_files.py: every open file AND every network connection uses one file descriptor.
# Run it with: python3 too_many_files.py   (the lab gives it a limit of 50)

import resource

soft, _ = resource.getrlimit(resource.RLIMIT_NOFILE)
print(f"this process may have {soft} open files at once")
opened = []
try:
    while True:
        opened.append(open("/app/tiny_server.py"))   # pretend each one is a customer's connection
except OSError as e:
    print(f"opened {len(opened)} files, then: {e}")
