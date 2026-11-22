# A small "Bazaar server" for Module 2: Python 3.13.18 + the everyday file tools.
FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends less nano vim-tiny tree procps \
 && rm -rf /var/lib/apt/lists/*
