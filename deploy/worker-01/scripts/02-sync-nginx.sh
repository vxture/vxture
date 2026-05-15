#!/usr/bin/env bash
# deploy/worker-01/scripts/02-sync-nginx.sh
# 将仓库 infra/nginx/ 配置同步到 /data/nginx/conf/
# 运行：sudo bash 02-sync-nginx.sh
# 幂等：重复运行安全；Nginx 容器运行中时会执行 nginx -t + reload
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../../.." && pwd)"
SRC="$REPO_DIR/infra/nginx"
DST=/data/vxtureworker01-nginx/conf

if [ ! -f "$SRC/nginx.conf" ]; then
  echo "错误：找不到 $SRC/nginx.conf，请确认仓库路径正确（当前: $REPO_DIR）"
  exit 1
fi

echo "==> 同步 Nginx 配置：$SRC → $DST"
mkdir -p "$DST/sites-enabled" "$DST/snippets"

cp -v "$SRC/nginx.conf"                     "$DST/nginx.conf"
cp -v "$SRC/snippets/"*.conf                "$DST/snippets/"
cp -v "$SRC/sites-enabled/"*.conf           "$DST/sites-enabled/"

echo ""
echo "同步完成，目录内容："
find "$DST" -type f | sort

# 如果 nginx 容器正在运行，测试配置并热重载
if docker inspect vxture-nginx &>/dev/null 2>&1; then
  echo ""
  echo "==> 检测到 vxture-nginx 容器运行中，执行配置测试..."
  docker exec vxture-nginx nginx -t
  docker exec vxture-nginx nginx -s reload
  echo "Nginx 已热重载"
else
  echo ""
  echo "  提示：vxture-nginx 容器未运行，配置将在 compose up 时生效"
fi

echo ""
echo "  !! 检查 SSL 证书是否已放置（compose up 前必须）："
echo "     ls -la /data/nginx/ssl/"
