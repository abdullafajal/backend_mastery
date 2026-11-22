FROM python:3.13.18-slim-trixie
# uv: a fast installer and project manager (pinned, like every tool in this course).
RUN pip install --no-cache-dir uv==0.13.6
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
WORKDIR /lab
CMD ["bash"]
