FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

# 可在此处添加系统依赖，例如 libpq-dev, build-essential 等
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
  && rm -rf /var/lib/apt/lists/*

CMD ["sleep", "infinity"]
