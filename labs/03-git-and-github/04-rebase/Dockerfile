FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends git nano less \
 && rm -rf /var/lib/apt/lists/*
RUN git config --global user.name "Rohan Mehta" \
 && git config --global user.email "rohan@bazaar.example" \
 && git config --global init.defaultBranch main \
 && git config --global core.editor nano
COPY starter/ /bazaar/
COPY lab-files/ /lab-files/
COPY setup_repo.sh /usr/local/bin/setup_repo.sh
RUN bash /usr/local/bin/setup_repo.sh
WORKDIR /bazaar
CMD ["bash"]
