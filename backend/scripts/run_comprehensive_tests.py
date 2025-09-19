#!/usr/bin/env python
"""
综合测试脚本
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
        "langchain", "langgraph", "fastapi", "pydantic",
        "requests", "openai", "langchain_openai",
        "beautifulsoup4", "python-dotenv"
    ]

    # 检查是否有autogen
    try:
        importlib.import_module("autogen")
        has_autogen = True
    except ImportError:
        has_autogen = False

    if has_autogen:
        required_modules.append("autogen")

    # 检查缺失模块
    missing_modules = check_imports(required_modules)
    if missing_modules:
        logger.warning(f"缺失以下模块: {', '.join(missing_modules)}")
        if not install_missing_modules(missing_modules):
            return False

    # 检查环境变量
    required_env_vars = [
        "OPENAI_API_KEY",
        "DEFAULT_LLM_PROVIDER",
        "DEFAULT_LLM_MODEL",
        "VXTURE_ENV"
    ]

    missing_env_vars = [var for var in required_env_vars if not os.getenv(var)]
    if missing_env_vars:
        logger.warning(f"缺失以下环境变量: {', '.join(missing_env_vars)}")
        logger.warning("请确保在.env文件中设置这些环境变量，或手动设置")
        # 继续执行，不阻止测试

    return True

def run_agent_tests():
    """运行智能代理测试"""
    logger.info("运行智能代理测试")
    try:
        # 动态导入测试模块
        test_module_path = script_dir / "scripts" / "test_agents.py"
        if not test_module_path.exists():
            logger.error(f"找不到测试脚本: {test_module_path}")
            return False

        # 执行测试脚本
        logger.info("执行test_agents.py")
        result = subprocess.run(
            [sys.executable, str(test_module_path), "--all"],
            capture_output=True,
            text=True
        )

        # 打印输出
        logger.info("测试输出:")
        print(result.stdout)

        if result.stderr:
            logger.error("测试错误:")
            print(result.stderr)

        # 检查返回码
        return result.returncode == 0
    except Exception as e:
        logger.error(f"运行智能代理测试时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def run_chat_interface_tests():
    """运行聊天界面测试"""
    logger.info("运行聊天界面测试")
    try:
        # 动态导入测试模块
        test_module_path = script_dir / "scripts" / "test_chat_interface.py"
        if not test_module_path.exists():
            logger.error(f"找不到测试脚本: {test_module_path}")
            return False

        # 执行测试脚本
        logger.info("执行test_chat_interface.py")
        result = subprocess.run(
            [sys.executable, str(test_module_path), "--ui"],
            capture_output=True,
            text=True
        )

        # 打印输出
        logger.info("测试输出:")
        print(result.stdout)

        if result.stderr:
            logger.error("测试错误:")
            print(result.stderr)

        # 检查返回码
        return result.returncode == 0
    except Exception as e:
        logger.error(f"运行聊天界面测试时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

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
    parser.add_argument("--agents", action="store_true", help="测试智能代理")
    parser.add_argument("--chat", action="store_true", help="测试聊天界面")
    parser.add_argument("--frontend", action="store_true", help="检查前端应用")
    parser.add_argument("--backend", action="store_true", help="检查后端API")
    parser.add_argument("--all", action="store_true", help="运行所有测试")

    args = parser.parse_args()

    # 如果没有指定参数，默认运行所有测试
    if not (args.all or args.env or args.agents or args.chat or args.frontend or args.backend):
        args.all = True

    results = {}

    # 始终先检查环境
    if args.all or args.env:
        logger.info("=== 检查环境 ===")
        results["env"] = check_environment()

    if args.all or args.agents:
        logger.info("=== 测试智能代理 ===")
        results["agents"] = run_agent_tests()

    if args.all or args.chat:
        logger.info("=== 测试聊天界面 ===")
        results["chat"] = run_chat_interface_tests()

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
