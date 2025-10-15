#!/usr/bin/env bash
set -euo pipefail

# setup-dev.sh
# 一键在 Unix-like 系统上初始化开发环境：
# - 检查 Volta 并安装 Node/pnpm（如需）
# - 创建 Python venv 并安装 requirements.txt
# - 运行 pnpm install
# - 可选：调用 install-vscode-extensions.ps1 （需要 PowerShell Core）

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$SCRIPT_DIR/.."

echo "== vxture: 初始化开发环境 (Unix) =="

if command -v volta >/dev/null 2>&1; then
  echo "Volta 已安装: $(volta --version)"
else
  echo "未检测到 Volta，尝试安装..."
  curl https://get.volta.sh | bash
  export PATH="$HOME/.volta/bin:$PATH"
fi

echo "确保 Node (18) 与 pnpm 已通过 Volta 安装"
volta install node@18 || true
volta install pnpm || true

cd "$REPO_ROOT"
if [ ! -f package.json ]; then
  echo "警告：当前目录似乎不是一个 Node 项目 (缺少 package.json)"
fi

echo "运行 pnpm install..."
pnpm install

if [ -f requirements.txt ]; then
  echo "设置 Python 虚拟环境 .venv"
  python -m venv .venv
  . .venv/bin/activate
  pip install -r requirements.txt
fi

if [ -f "$SCRIPT_DIR/install-vscode-extensions.ps1" ]; then
  if command -v pwsh >/dev/null 2>&1; then
    echo "通过 PowerShell Core 安装 VS Code 扩展"
    pwsh -c "$SCRIPT_DIR/install-vscode-extensions.ps1"
  else
    echo "注意：未检测到 pwsh，跳过 VS Code 扩展批量安装"
  fi
fi

echo "初始化完成。请重启终端以确保 Volta 环境变量生效。"
