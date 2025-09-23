#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
开发环境启动脚本 - 专为 pnpm dev:api 优化
"""
import sys
import os
import subprocess
from pathlib import Path

def main():
    # 获取API目录
    api_dir = Path(__file__).parent.absolute()
    venv_python = api_dir / ".venv" / "Scripts" / "python.exe"

    print(f"🔍 API目录: {api_dir}")
    print(f"🐍 Python解释器: {venv_python}")

    # 检查虚拟环境是否存在
    if not venv_python.exists():
        print(f"❌ 虚拟环境不存在: {venv_python}")
        print("请先创建虚拟环境：python -m venv .venv")
        sys.exit(1)

    # 检查app目录
    app_dir = api_dir / "app"
    if not app_dir.exists():
        print(f"❌ app目录不存在: {app_dir}")
        sys.exit(1)

    # 构建启动命令
    cmd = [
        str(venv_python),
        "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ]

    print(f"🚀 启动命令: {' '.join(cmd)}")
    print(f"📂 工作目录: {api_dir}")
    print("=" * 50)

    try:
        # 切换到API目录并启动服务器
        os.chdir(api_dir)
        subprocess.run(cmd, check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ 启动失败: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n👋 服务器已停止")
        sys.exit(0)

if __name__ == "__main__":
    main()
