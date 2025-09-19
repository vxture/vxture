#!/usr/bin/env python
"""
测试脚本，用于验证智能代理集成
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path

# 添加项目根目录到路径
script_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(script_dir))

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("agent_test")

def test_langgraph():
    """测试LangGraph集成"""
    try:
        from app.agents.langgraph.examples.simple_qa import SimpleQAAgentGraph
        from app.agents.langgraph.config import AgentState

        logger.info("创建SimpleQAAgentGraph实例...")
        graph = SimpleQAAgentGraph()

        logger.info("编译图...")
        compiled_graph = graph.compile()

        logger.info("执行图...")
        result = compiled_graph.invoke({
            "messages": [{"role": "user", "content": "你好，请介绍一下自己"}],
            "context": {},
            "current_node": "start",
            "artifacts": {},
            "metadata": {},
            "error": None
        })

        logger.info("执行成功!")
        print("\n结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))

        return True
    except Exception as e:
        logger.error(f"测试LangGraph时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_autogen():
    """测试AutoGen集成"""
    try:
        # 导入可能会失败，因为可能没有安装autogen
        try:
            import autogen
        except ImportError:
            logger.warning("未安装AutoGen，跳过测试")
            return False

        from app.agents.autogen_config import AUTOGEN_CONFIG

        logger.info("检查AutoGen配置...")

        if not AUTOGEN_CONFIG["enabled"]:
            logger.warning("AutoGen未启用，跳过测试")
            return False

        logger.info("AutoGen配置正常")

        # 导入示例
        try:
            from app.agents.autogen.examples.multi_agent_chat import run_task_solving_agents

            logger.info("执行简单任务...")
            result = run_task_solving_agents(
                "设计一个简单的网站结构，包括首页、产品页和联系页。",
                ["user_proxy", "assistant", "planner"]
            )

            logger.info("执行成功!")
            return True
        except ImportError:
            logger.warning("未找到AutoGen示例，跳过任务执行")
            return False
    except Exception as e:
        logger.error(f"测试AutoGen时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_tools():
    """测试智能代理工具"""
    try:
        from app.agents.tools.implementation import get_available_tools, execute_tool

        logger.info("获取可用工具...")
        tools = get_available_tools()
        logger.info(f"可用工具: {tools}")

        logger.info("测试Python代码执行工具...")
        result = execute_tool("execute_python", code="print('Hello from Python!'); result = 42; print(f'Result: {result}')")

        logger.info("执行结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))

        return True
    except Exception as e:
        logger.error(f"测试工具时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="智能代理集成测试")
    parser.add_argument("--all", action="store_true", help="测试所有集成")
    parser.add_argument("--langgraph", action="store_true", help="测试LangGraph集成")
    parser.add_argument("--autogen", action="store_true", help="测试AutoGen集成")
    parser.add_argument("--tools", action="store_true", help="测试智能代理工具")

    args = parser.parse_args()

    # 如果没有指定参数，默认测试所有
    if not (args.all or args.langgraph or args.autogen or args.tools):
        args.all = True

    results = {}

    if args.all or args.langgraph:
        logger.info("=== 测试LangGraph集成 ===")
        results["langgraph"] = test_langgraph()

    if args.all or args.autogen:
        logger.info("=== 测试AutoGen集成 ===")
        results["autogen"] = test_autogen()

    if args.all or args.tools:
        logger.info("=== 测试智能代理工具 ===")
        results["tools"] = test_tools()

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
