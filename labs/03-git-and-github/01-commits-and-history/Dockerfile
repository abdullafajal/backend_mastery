FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends git nano less \
 && rm -rf /var/lib/apt/lists/*
COPY starter/ /bazaar/
WORKDIR /bazaar
CMD ["bash"]
