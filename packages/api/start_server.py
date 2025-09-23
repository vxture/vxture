#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vxture Platform API 启动脚本
"""
import sys
import os
from pathlib import Path

# 获取脚本所在目录
script_dir = Path(__file__).parent.absolute()
print(f"脚本目录: {script_dir}")

# 切换到API目录
os.chdir(script_dir)
print(f"切换工作目录到: {os.getcwd()}")

# 添加当前目录到 Python 路径
sys.path.insert(0, str(script_dir))
print(f"Python 路径: {sys.path[0]}")

# 检查app目录是否存在
app_dir = script_dir / "app"
if not app_dir.exists():
    print(f"错误: app 目录不存在: {app_dir}")
    sys.exit(1)

# 检查main.py是否存在
main_file = app_dir / "main.py"
if not main_file.exists():
    print(f"错误: main.py 文件不存在: {main_file}")
    sys.exit(1)

try:
    # 导入必要的模块
    from app.main import app
    import uvicorn

    print("✅ 模块导入成功")
    print("🚀 启动 Vxture Platform API...")

    # 运行服务器
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,  # 开启热重载以便开发
        log_level="info"
    )
except ImportError as e:
    print(f"❌ 模块导入失败: {e}")
    print("请确保已安装所有依赖：pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ 启动失败: {e}")
    sys.exit(1)
