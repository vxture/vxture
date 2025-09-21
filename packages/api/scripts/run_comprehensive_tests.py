#!/usr/bin/env python
"""
综合测试脚本（简化版）
用于测试整个系统的各个组件
"""

import os
import sys
import json
import argparse
import logging
import importlib.util
import subprocess
from pathlib import Path

# 添加项目根目录到路径
script_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(script_dir))

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("comprehensive_test")

# 简化：保留环境、前端和后端基础检查

def check_imports(modules):
    """检查必要的模块是否已安装"""
    missing_modules = []
    for module in modules:
        try:
            importlib.import_module(module)
        except ImportError:
            missing_modules.append(module)

    return missing_modules

def install_missing_modules(modules):
    """安装缺失的模块"""
    if not modules:
        return True

    logger.info(f"安装缺失模块: {', '.join(modules)}")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install"] + modules)
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"安装模块失败: {e}")
        return False

def check_environment():
    """检查环境配置"""
    # 检查Python版本
    py_version = sys.version_info
    logger.info(f"Python版本: {py_version.major}.{py_version.minor}.{py_version.micro}")

    # 检查必要的模块
    required_modules = [
        "fastapi", "pydantic", "requests", "python-dotenv"
    ]

    # 检查缺失模块并尝试安装
    missing_modules = check_imports(required_modules)
    if missing_modules:
        logger.warning(f"缺失以下模块: {', '.join(missing_modules)}")
        if not install_missing_modules(missing_modules):
            return False

    # 检查基础环境变量（非LLM相关）
    required_env_vars = [
        "VXTURE_ENV"
    ]

    missing_env_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_env_vars:
        logger.warning(f"缺失以下环境变量: {', '.join(missing_env_vars)}")
        # 继续执行，不阻止测试

    return True

def check_frontend():
    """检查前端应用是否正常运行"""
    logger.info("检查前端应用")
    try:
        import requests
        response = requests.get("http://localhost:3000")

        if response.status_code == 200:
            logger.info("前端应用运行正常")
            return True
        else:
            logger.warning(f"前端应用返回状态码: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"检查前端应用时出错: {str(e)}")
        logger.warning("前端应用可能未运行")
        return False

def check_backend():
    """检查后端API是否正常运行"""
    logger.info("检查后端API")
    try:
        # 尝试导入fastapi
        import fastapi

        # 检查是否有运行中的后端进程
        # 此处简化处理，实际应该检查特定端口
        import psutil
        running_python = False
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            if proc.info['name'] == 'python' or proc.info['name'] == 'python.exe':
                cmdline = proc.info['cmdline']
                if cmdline and any('main.py' in cmd for cmd in cmdline):
                    running_python = True
                    break

        if running_python:
            logger.info("后端API可能正在运行")
            return True
        else:
            logger.warning("未检测到运行中的后端API")
            return False
    except ImportError:
        logger.error("无法导入psutil，跳过后端进程检查")
        return False
    except Exception as e:
        logger.error(f"检查后端API时出错: {str(e)}")
        return False

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="综合测试脚本")
    parser.add_argument("--env", action="store_true", help="检查环境")
    parser.add_argument("--frontend", action="store_true", help="检查前端应用")
    parser.add_argument("--backend", action="store_true", help="检查后端API")
    parser.add_argument("--all", action="store_true", help="运行所有测试")

    args = parser.parse_args()

    # 如果没有指定参数，默认运行所有测试
    if not (args.all or args.env or args.frontend or args.backend):
        args.all = True

    results = {}

    # 始终先检查环境
    if args.all or args.env:
        logger.info("=== 检查环境 ===")
        results["env"] = check_environment()

    if args.all or args.frontend:
        logger.info("=== 检查前端应用 ===")
        results["frontend"] = check_frontend()

    if args.all or args.backend:
        logger.info("=== 检查后端API ===")
        results["backend"] = check_backend()

    # 打印汇总结果
    logger.info("=== 测试结果汇总 ===")
    for test, result in results.items():
        status = "通过" if result else "失败"
        logger.info(f"{test}: {status}")

    # 所有测试是否通过
    all_passed = all(results.values())
    exit_code = 0 if all_passed else 1

    logger.info(f"总体结果: {'通过' if all_passed else '失败'}")
    return exit_code

if __name__ == "__main__":
    sys.exit(main())
