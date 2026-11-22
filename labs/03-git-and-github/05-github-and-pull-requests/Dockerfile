FROM python:3.13.18-slim-trixie
RUN apt-get update \
 && apt-get install -y --no-install-recommends git nano less \
 && rm -rf /var/lib/apt/lists/*
# "GitHub" in this lab is a folder: /srv/github/bazaar-team/bazaar.git. No internet is used.
# Each laptop folder gets its own Git identity (Neha or Rohan) through includeIf.
RUN git config --global init.defaultBranch main \
 && git config --global core.editor nano \
 && git config --global pull.rebase false \
 && git config --global includeIf."gitdir:/laptops/neha/".path /etc/bazaar/neha.gitconfig \
 && git config --global includeIf."gitdir:/laptops/rohan/".path /etc/bazaar/rohan.gitconfig
COPY config/ /etc/bazaar/
COPY starter/ /seed/
COPY lab-files/ /lab-files/
COPY setup_github.sh /usr/local/bin/setup_github.sh
RUN bash /usr/local/bin/setup_github.sh
WORKDIR /laptops
CMD ["bash"]
