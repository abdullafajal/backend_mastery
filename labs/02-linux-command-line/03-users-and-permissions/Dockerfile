# "Bazaar server" for the permissions lab: real users and groups, and sudo.
FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends sudo less nano \
 && rm -rf /var/lib/apt/lists/*
# Two people: asha (Bazaar developer, may use sudo) and ravi (a seller-support intern, password "ravi").
# A group "bazaar" for people who may read Bazaar's secrets. www-data already exists (web server user).
RUN groupadd bazaar \
 && useradd --create-home --shell /bin/bash --groups bazaar,sudo asha \
 && useradd --create-home --shell /bin/bash ravi \
 && echo 'ravi:ravi' | chpasswd \
 && echo 'asha ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/asha \
 && chmod 440 /etc/sudoers.d/asha
