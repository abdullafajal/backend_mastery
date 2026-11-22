# Python 3.13 + the "procps" package, which gives us ps, top and free.
FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends procps \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
