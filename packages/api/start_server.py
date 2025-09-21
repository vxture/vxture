#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Vxture Platform API 启动脚本
"""
import sys
import os

# 添加当前目录到 Python 路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# 导入必要的模块
from app.main import app
import uvicorn

if __name__ == "__main__":
    print("启动 Vxture Platform API...")
    print(f"工作目录: {os.getcwd()}")
    print(f"Python 路径: {sys.path[0]}")

    try:
        # 运行服务器
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8001,
            reload=False,
            log_level="info"
        )
    except Exception as e:
        print(f"启动失败: {e}")
        sys.exit(1)
