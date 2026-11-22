FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends git nano less \
 && rm -rf /var/lib/apt/lists/*
RUN git config --global user.name "Neha Kapoor" \
 && git config --global user.email "neha@bazaar.example" \
 && git config --global init.defaultBranch main
COPY starter/ /bazaar/
COPY lab-files/ /lab-files/
COPY setup_repo.sh /usr/local/bin/setup_repo.sh
RUN bash /usr/local/bin/setup_repo.sh
WORKDIR /bazaar
CMD ["bash"]
