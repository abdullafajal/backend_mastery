FROM python:3.13.18-slim-trixie
ENV PIP_DISABLE_PIP_VERSION_CHECK=1
COPY requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt
WORKDIR /lab
CMD ["bash"]
