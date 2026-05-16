#!/usr/bin/env bash
# deploy/worker-01/scripts/01-init.sh
# 一次性服务器初始化（worker-01 / 阿里云 ECS Ubuntu 22.04）
# 运行：sudo bash 01-init.sh
# 幂等：重复运行安全
set -euo pipefail

REPO_DIR=/srv/vxture/repo
COMPOSE_DIR="$REPO_DIR/deploy/worker-01"

echo "==> [1/6] 系统更新"
apt-get update -y && apt-get upgrade -y

echo "==> [2/6] 安装 Docker CE + Compose plugin"
if ! command -v docker &>/dev/null; then
  apt-get install -y ca-certificates curl
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    -o /etc/apt/keyrings/docker.asc
  chmod a+r /etc/apt/keyrings/docker.asc
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
https://download.docker.com/linux/ubuntu \
$(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    | tee /etc/apt/sources.list.d/docker.list > /dev/null
  apt-get update -y
  apt-get install -y \
    docker-ce docker-ce-cli containerd.io \
    docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
  echo "Docker 安装完成: $(docker --version)"
else
  echo "Docker 已安装，跳过"
fi

echo "==> [3/6] 配置 UFW 防火墙"
apt-get install -y ufw
# 不执行 reset，只补充缺失规则；已有规则 ufw allow 会自动跳过重复
ufw default deny incoming  2>/dev/null || true
ufw default allow outgoing 2>/dev/null || true
ufw allow 22/tcp   comment 'SSH'
ufw allow 80/tcp   comment 'HTTP'
ufw allow 443/tcp  comment 'HTTPS'
# auth-bff:3090 仅 Tailscale 子网可达（worker-02 JWT 验证调用）
ufw allow from 100.64.0.0/10 to any port 3090 proto tcp comment 'auth-bff Tailscale only'
ufw --force enable
ufw status verbose

echo "==> [4/6] 安装 Tailscale"
if ! command -v tailscale &>/dev/null; then
  curl -fsSL https://tailscale.com/install.sh | sh
  echo ""
  echo "  !! 手动步骤：运行以下命令将此机器加入 Tailscale 网络"
  echo "     tailscale up --authkey=<your-auth-key> --hostname=worker-01"
  echo ""
else
  echo "Tailscale 已安装: $(tailscale --version | head -1)"
  tailscale status || true
fi

echo "==> [5/6] 创建数据目录"
mkdir -p /srv/vxture/data/platform-pg
mkdir -p /srv/vxture/data/platform-redis
mkdir -p /srv/vxture/data/nginx/conf/sites-enabled
mkdir -p /srv/vxture/data/nginx/conf/snippets
mkdir -p /srv/vxture/data/nginx/ssl
mkdir -p /srv/vxture/data/nginx/logs
echo "目录结构:"
find /srv/vxture -maxdepth 4 -type d | sort

echo "==> [6/6] 克隆仓库"
if [ -d "$REPO_DIR/.git" ]; then
  echo "仓库已存在，执行 git pull"
  git -C "$REPO_DIR" pull
else
  echo ""
  echo "  !! 克隆需要 GitHub SSH 访问权限。如未配置 Deploy Key，先执行："
  echo "     ssh-keygen -t ed25519 -C 'worker-01@vxture' -f ~/.ssh/id_ed25519 -N ''"
  echo "     cat ~/.ssh/id_ed25519.pub  # 添加到 GitHub → Settings → Deploy keys（Read）"
  echo ""
  git clone git@github.com:vxture/vxture.git "$REPO_DIR"
fi

# 创建 secrets 目录（内容由人工填写）
mkdir -p "$COMPOSE_DIR/secrets"
touch "$COMPOSE_DIR/secrets/.gitkeep"

echo ""
echo "======================================================"
echo "  初始化完成。下一步（手动操作）："
echo ""
echo "  A. 完成 Tailscale auth（如未完成）："
echo "     tailscale up --authkey=<key> --hostname=worker-01"
echo ""
echo "  B. 上传 SSL 证书到 /srv/vxture/data/nginx/ssl/ ："
echo "     scp vxture.com.crt vxture.com.key root@<server>:/srv/vxture/data/nginx/ssl/"
echo ""
echo "  C. 填写 compose 环境变量（在 $COMPOSE_DIR/）："
echo "     cp .env.example .env                           # PLATFORM_REDIS_PASSWORD"
echo "     cp .env.auth-bff.example .env.auth-bff"
echo "     cp .env.gateway-bff.example .env.gateway-bff"
echo "     cp .env.website-bff.example .env.website-bff"
echo "     cp .env.console-bff.example .env.console-bff"
echo "     cp .env.admin-bff.example .env.admin-bff"
echo "     # 然后逐一用 nano/vim 填写真实值"
echo ""
echo "  D. 创建 Postgres 密码文件："
echo "     echo 'your-strong-password' > $COMPOSE_DIR/secrets/platform_pg_password.txt"
echo "     chmod 600 $COMPOSE_DIR/secrets/platform_pg_password.txt"
echo ""
echo "  E. 运行 02-sync-nginx.sh 同步 Nginx 配置"
echo "  F. 等待 GitHub Actions 构建并推送镜像（push to main）"
echo "  G. 运行 03-up.sh 启动全栈"
echo "======================================================"
