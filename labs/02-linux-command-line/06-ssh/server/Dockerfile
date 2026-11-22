# bazaar-server: a server you log in to over SSH. User asha, password "asha-lab" (lab only!).
FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssh-server \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /run/sshd \
 && useradd --create-home --shell /bin/bash asha \
 && echo 'asha:asha-lab' | chpasswd \
 && mkdir -p /srv/bazaar/logs \
 && printf '2026-11-21 10:01:00 order=211 status=paid\n2026-11-21 10:03:00 order=213 status=failed\n2026-11-21 10:05:00 order=215 status=paid\n' > /srv/bazaar/logs/order_20261121.log
# -D: stay in the foreground (so the container keeps running); -e: log to the container's output
CMD ["/usr/sbin/sshd", "-D", "-e"]
