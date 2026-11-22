# laptop: your computer, with the SSH client. (sshpass is only for the automatic test.)
FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssh-client sshpass \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /root
CMD ["sleep", "infinity"]
