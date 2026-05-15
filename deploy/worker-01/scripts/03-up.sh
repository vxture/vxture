#!/usr/bin/env bash
# deploy/worker-01/scripts/03-up.sh
# 首次（或更新）启动 worker-01 平台栈
# 运行：sudo bash 03-up.sh
# 用途：首次部署 OR docker compose pull + up -d（滚动更新同样适用）
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
COMPOSE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE_FILE="$COMPOSE_DIR/compose.platform.yml"
GHCR_ORG=vxture

# ── 前置检查 ─────────────────────────────────────────────────────────────────

check_file() {
  if [ ! -f "$1" ]; then
    echo "  [缺失] $1"
    MISSING=1
  else
    echo "  [OK]   $1"
  fi
}

echo "==> [1/5] 前置检查"
MISSING=0

echo "  compose 文件:"
check_file "$COMPOSE_FILE"

echo "  环境变量文件:"
check_file "$COMPOSE_DIR/.env"
check_file "$COMPOSE_DIR/.env.auth-bff"
check_file "$COMPOSE_DIR/.env.gateway-bff"
check_file "$COMPOSE_DIR/.env.website-bff"
check_file "$COMPOSE_DIR/.env.console-bff"
check_file "$COMPOSE_DIR/.env.admin-bff"

echo "  密钥文件:"
check_file "$COMPOSE_DIR/secrets/platform_pg_password.txt"

echo "  SSL 证书:"
check_file /data/nginx/ssl/vxture.com.crt
check_file /data/nginx/ssl/vxture.com.key

echo "  Nginx 配置:"
check_file /data/nginx/conf/nginx.conf

if [ "${MISSING:-0}" -eq 1 ]; then
  echo ""
  echo "错误：存在缺失文件，请按 01-init.sh 结尾的提示补全后重试。"
  exit 1
fi

echo "  Tailscale 状态:"
tailscale status || echo "  !! Tailscale 未连接，vela BFF（/vela/*）将不可用"

# ── GHCR 登录 ────────────────────────────────────────────────────────────────

echo ""
echo "==> [2/5] 登录 GHCR（ghcr.io/$GHCR_ORG）"
echo "  需要 GitHub PAT（权限：read:packages）"
echo "  如已登录可跳过（输入 Ctrl+C 并手动运行 docker login ghcr.io）"
read -r -p "  GitHub 用户名: " GH_USER
read -r -s -p "  GitHub PAT: " GH_PAT
echo ""
echo "$GH_PAT" | docker login ghcr.io -u "$GH_USER" --password-stdin
echo "  登录成功"

# ── 拉取最新镜像 ──────────────────────────────────────────────────────────────

echo ""
echo "==> [3/5] 拉取镜像（docker compose pull）"
cd "$COMPOSE_DIR"
docker compose -f compose.platform.yml pull

# ── 启动 ─────────────────────────────────────────────────────────────────────

echo ""
echo "==> [4/5] 启动平台栈（docker compose up -d）"
docker compose -f compose.platform.yml up -d

# ── 状态检查 ──────────────────────────────────────────────────────────────────

echo ""
echo "==> [5/5] 服务状态"
docker compose -f compose.platform.yml ps

echo ""
echo "  等待健康检查（最多 60s）..."
sleep 10
docker compose -f compose.platform.yml ps --format "table {{.Name}}\t{{.Status}}"

echo ""
echo "  快速接口验证:"
echo -n "  gateway /healthz → "
curl -sf http://localhost:8000/healthz 2>/dev/null && echo "OK" || echo "FAIL（容器可能仍在启动中，稍候重试）"

echo ""
echo "======================================================"
echo "  平台栈已启动。"
echo ""
echo "  Nginx 访问验证（需 DNS / /etc/hosts 指向此服务器）："
echo "    curl -I https://vxture.com"
echo "    curl -I https://api.vxture.com/healthz"
echo ""
echo "  查看实时日志："
echo "    docker compose -f $COMPOSE_FILE logs -f --tail=50"
echo ""
echo "  下一步：在 worker-02 上执行任务 #6（vela/ruyin 业务服务部署）"
echo "======================================================"
