# A Bazaar server that runs systemd as PID 1, like a real Linux server. (Lab only: needs privileged mode.)
FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends systemd systemd-sysv procps less \
 && rm -rf /var/lib/apt/lists/* \
 && systemctl mask getty.target console-getty.service systemd-modules-load.service   # no screens or kernel modules in a container
STOPSIGNAL SIGRTMIN+3
CMD ["/sbin/init"]
