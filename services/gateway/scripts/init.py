#!/usr/bin/env python
"""
初始化脚本
用于设置项目开发/运行所需的本地环境与目录
"""

import sys
import shutil
import logging
import argparse
import subprocess
from pathlib import Path

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("init")

def setup_env():
    """设置环境变量文件"""
    root_dir = Path(__file__).resolve().parent.parent
    env_example = root_dir / ".env.example"
    env_file = root_dir / ".env"

    if not env_example.exists():
        logger.error(f"找不到环境变量示例文件: {env_example}")
        return False

    if env_file.exists():
        logger.warning(f"环境变量文件已存在: {env_file}")
        overwrite = input("是否覆盖现有.env文件? [y/N]: ").lower() == 'y'
        if not overwrite:
            logger.info("保留现有环境变量文件")
            return True

    # 复制示例文件
    shutil.copy(env_example, env_file)
    logger.info(f"已创建环境变量文件: {env_file}")
    logger.info("请编辑.env文件，设置必要的API密钥和配置")

    return True

def setup_directories():
    """创建必要的目录结构"""
    root_dir = Path(__file__).resolve().parent.parent

    # 数据目录
    data_dirs = [
        "data/workspace",
        "data/vectorstore",
        "data/uploads",
        "data/tmp",
        "logs"
    ]

    for dir_path in data_dirs:
        full_path = root_dir / dir_path
        if not full_path.exists():
            full_path.mkdir(parents=True, exist_ok=True)
            logger.info(f"已创建目录: {full_path}")

    return True

def check_dependencies():
    """检查必要的依赖项"""
    required_packages = [
        "fastapi", "uvicorn", "pydantic", "python-dotenv"
    ]

    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)

    if missing_packages:
        logger.warning(f"缺少以下依赖项: {', '.join(missing_packages)}")
        install = input("是否安装缺失的依赖项? [Y/n]: ").lower() != 'n'
        if install:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing_packages)
                logger.info("依赖项安装完成")
            except subprocess.CalledProcessError as e:
                logger.error(f"安装依赖项失败: {e}")
                return False
        else:
            logger.warning("跳过依赖项安装，请手动安装")

    return True

def setup_dev_env():
    """设置开发环境"""
    # 检查是否安装了开发依赖
    dev_packages = [
        "pytest", "pytest-asyncio", "black", "isort",
        "flake8", "mypy", "pre-commit"
    ]

    missing_dev_packages = []
    for package in dev_packages:
        try:
            __import__(package)
        except ImportError:
            missing_dev_packages.append(package)

    if missing_dev_packages:
        logger.info(f"缺少以下开发依赖项: {', '.join(missing_dev_packages)}")
        install_dev = input("是否安装开发依赖项? [Y/n]: ").lower() != 'n'
        if install_dev:
            try:
                subprocess.check_call([sys.executable, "-m", "pip", "install"] + missing_dev_packages)
                logger.info("开发依赖项安装完成")
            except subprocess.CalledProcessError as e:
                logger.error(f"安装开发依赖项失败: {e}")
                return False
        else:
            logger.warning("跳过开发依赖项安装")

    # 设置pre-commit
    root_dir = Path(__file__).resolve().parent.parent
    pre_commit_config = root_dir / ".pre-commit-config.yaml"

    if not pre_commit_config.exists():
        logger.warning("未找到pre-commit配置文件，跳过pre-commit设置")
    else:
        try:
            logger.info("设置pre-commit hooks")
            subprocess.check_call(["pre-commit", "install"], cwd=root_dir)
            logger.info("pre-commit hooks设置完成")
        except (subprocess.CalledProcessError, FileNotFoundError) as e:
            logger.error(f"设置pre-commit hooks失败: {e}")
            return False

    return True

def verify_setup():
    """验证环境设置"""
    root_dir = Path(__file__).resolve().parent.parent

    # 检查环境变量文件
    env_file = root_dir / ".env"
    if not env_file.exists():
        logger.warning("找不到.env文件，环境配置可能不完整")
        return False

    # 检查必要的目录
    required_dirs = [
        "data/workspace",
        "logs"
    ]

    for dir_path in required_dirs:
        full_path = root_dir / dir_path
        if not full_path.exists():
            logger.warning(f"找不到必要的目录: {full_path}")
            return False

    # 测试导入主要模块
    try:
        import importlib.util
        if importlib.util.find_spec("fastapi") is None:
            raise ImportError("fastapi not found")
    except ImportError as e:
        logger.error(f"导入核心模块失败: {e}")
        return False

    logger.info("环境设置验证通过")
    return True

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="项目初始化脚本：创建目录、检查依赖并配置开发环境")
    parser.add_argument("--env", action="store_true", help="设置环境变量文件")
    parser.add_argument("--dirs", action="store_true", help="创建必要的目录结构")
    parser.add_argument("--deps", action="store_true", help="检查依赖项")
    parser.add_argument("--dev", action="store_true", help="设置开发环境")
    parser.add_argument("--verify", action="store_true", help="验证环境设置")
    parser.add_argument("--all", action="store_true", help="执行所有设置步骤")

    args = parser.parse_args()

    # 如果没有指定参数，默认执行所有步骤
    if not (args.all or args.env or args.dirs or args.deps or args.dev or args.verify):
        args.all = True

    results = {}

    if args.all or args.env:
        logger.info("=== 设置环境变量文件 ===")
        results["env"] = setup_env()

    if args.all or args.dirs:
        logger.info("=== 创建必要的目录结构 ===")
        results["dirs"] = setup_directories()

    if args.all or args.deps:
        logger.info("=== 检查依赖项 ===")
        results["deps"] = check_dependencies()

    if args.all or args.dev:
        logger.info("=== 设置开发环境 ===")
        results["dev"] = setup_dev_env()

    if args.all or args.verify:
        logger.info("=== 验证环境设置 ===")
        results["verify"] = verify_setup()

    # 打印汇总结果
    logger.info("=== 设置结果汇总 ===")
    for step, result in results.items():
        status = "成功" if result else "失败"
        logger.info(f"{step}: {status}")

    # 所有步骤是否成功
    all_success = all(results.values())
    if all_success:
        logger.info("初始化完成！系统已准备就绪。")
        logger.info("请确保在.env文件中设置了正确的API密钥和配置。")
        logger.info("启动后端: python -m app.main")
        logger.info("运行测试: python -m scripts.run_comprehensive_tests")
    else:
        logger.warning("初始化未完全成功，请检查上述错误并手动修复。")

    return 0 if all_success else 1

if __name__ == "__main__":
    sys.exit(main())
