###############################################################################
# .devcontainer/Dockerfile
#
# 目的：
#   - 为 VS Code Dev Container 提供一个轻量且可重复的开发镜像。
#   - 基于 Microsoft 官方的 devcontainer Node.js 模板镜像，预装 Node.js 与常用调试工具，
#     便于在容器中打开工作区并进行开发、调试与构建。
#
# 设计要点：
#   - 保持镜像尽可能小（仅在需要时安装额外依赖）。
#   - 注释说明每个区块的目的，便于后续维护（例如添加数据库客户端库或系统构建依赖）。
#   - 使用非交互式、无推荐包安装（--no-install-recommends）以减少体积与意外依赖。
#
# 注意：
#   - devcontainer.json 会控制容器的挂载、端口转发和 postCreateCommand；本 Dockerfile 仅负责构建镜像层。
#   - 若需要 PostgreSQL 客户端 (libpq) 或构建工具 (build-essential)，在 RUN 区块中添加对应包。
###############################################################################

# 基础镜像：Microsoft 提供的 devcontainer Node 模板
# 选择带有 Node 18 的镜像，包含常用开发工具，方便直接在容器中进行 Node/TypeScript 开发
FROM mcr.microsoft.com/devcontainers/javascript-node:0-18

###############################################################################
# 系统依赖安装区块
# - 这里示例安装了 ca-certificates（在某些环境下确保 HTTPS 请求能正常进行）。
# - 如果项目需要编译原生模块（例如使用 pg-native、sharp），可以在此添加 build-essential、libpq-dev、python3 等包。
# - 为了减小镜像体积，安装完成后清理 apt 缓存（/var/lib/apt/lists/*）。
###############################################################################
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    # 常见构建/数据库客户端依赖（如果需要编译本地模块或使用 PostgreSQL 客户端，取消注释以下行）
    libpq-dev \
    build-essential \
    python3-dev \
  && rm -rf /var/lib/apt/lists/*

###############################################################################
# 默认命令：保持容器运行以便 VS Code 可以附加到容器。
# 使用 sleep infinity 是一种简单的方式，使容器保持运行状态；
# 注意：devcontainer.json 通常会覆盖容器启动行为（通过 postStart/postCreate 命令运行安装或构建任务）。
###############################################################################
CMD ["sleep", "infinity"]
