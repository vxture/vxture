#!/usr/bin/env bash
set -euo pipefail

# package-offline.sh
# 打包仓库为 tar.gz，默认排除 .git 和 node_modules
# 使用： ./scripts/package-offline.sh ../vxture-offline.tar.gz --exclude-node-modules

OUT=${1:-"../vxture-offline.tar.gz"}
EXCLUDE_NODE_MODULES=false
shift || true
while [[ $# -gt 0 ]]; do
  case "$1" in
    --exclude-node-modules) EXCLUDE_NODE_MODULES=true; shift ;;
    *) shift ;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP_DIR=$(mktemp -d)

echo "Copying repository to temporary directory (excluding .git)..."
rsync -a --exclude='.git' "$ROOT_DIR/" "$TMP_DIR/"

if [ "$EXCLUDE_NODE_MODULES" = true ]; then
  echo "Removing node_modules from temporary copy..."
  rm -rf "$TMP_DIR/node_modules" || true
  rm -rf "$TMP_DIR/packages/web/node_modules" || true
fi

echo "Creating archive: $OUT"
tar -C "$TMP_DIR" -czf "$OUT" .
echo "Archive created: $OUT"

rm -rf "$TMP_DIR"
