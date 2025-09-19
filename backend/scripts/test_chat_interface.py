#!/usr/bin/env python
"""
聊天界面集成测试
测试前端与智能代理后端的交互
"""

import os
import sys
import json
import argparse
import logging
import requests
from pathlib import Path

# 添加项目根目录到路径
script_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(script_dir))

# 设置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("chat_test")

def test_chat_api(message, endpoint="http://localhost:3000/api/chat"):
    """测试聊天API端点"""
    try:
        logger.info(f"向API发送消息: {message}")

        # 准备请求数据
        data = {
            "message": message,
            "history": [],
            "options": {
                "stream": False,
                "use_rag": True,
                "framework": "langgraph"  # 或 'autogen'
            }
        }

        # 发送请求
        response = requests.post(
            endpoint,
            json=data,
            headers={"Content-Type": "application/json"}
        )

        # 检查响应
        if response.status_code != 200:
            logger.error(f"API返回错误: {response.status_code}")
            logger.error(response.text)
            return False

        # 解析响应
        result = response.json()
        logger.info("API响应成功!")
        print("\n结果:")
        print(json.dumps(result, indent=2, ensure_ascii=False))

        return True
    except Exception as e:
        logger.error(f"测试聊天API时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_stream_api(message, endpoint="http://localhost:3000/api/chat"):
    """测试流式聊天API端点"""
    try:
        logger.info(f"向流式API发送消息: {message}")

        # 准备请求数据
        data = {
            "message": message,
            "history": [],
            "options": {
                "stream": True,
                "use_rag": True,
                "framework": "langgraph"  # 或 'autogen'
            }
        }

        # 发送请求
        response = requests.post(
            endpoint,
            json=data,
            headers={"Content-Type": "application/json"},
            stream=True
        )

        # 检查响应
        if response.status_code != 200:
            logger.error(f"流式API返回错误: {response.status_code}")
            logger.error(response.text)
            return False

        # 解析流式响应
        print("\n流式响应:")
        full_response = ""
        for line in response.iter_lines():
            if line:
                # 解析SSE格式
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        chunk = json.loads(data)
                        chunk_text = chunk.get('text', '')
                        print(chunk_text, end='', flush=True)
                        full_response += chunk_text
                    except json.JSONDecodeError:
                        print(f"无法解析JSON: {data}")

        print("\n\n流式响应完成!")
        return True
    except Exception as e:
        logger.error(f"测试流式聊天API时出错: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def test_chat_ui(base_url="http://localhost:3000"):
    """测试聊天界面是否可访问"""
    try:
        logger.info(f"检查聊天UI是否可访问: {base_url}/chat")

        response = requests.get(f"{base_url}/chat")

        if response.status_code == 200:
            logger.info("聊天UI可访问!")
            return True
        else:
            logger.error(f"聊天UI返回错误: {response.status_code}")
            return False
    except Exception as e:
        logger.error(f"访问聊天UI时出错: {str(e)}")
        return False

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description="聊天界面集成测试")
    parser.add_argument("--api", action="store_true", help="测试聊天API")
    parser.add_argument("--stream", action="store_true", help="测试流式聊天API")
    parser.add_argument("--ui", action="store_true", help="测试聊天UI")
    parser.add_argument("--all", action="store_true", help="测试所有功能")
    parser.add_argument("--endpoint", default="http://localhost:3000/api/chat", help="API端点URL")
    parser.add_argument("--base-url", default="http://localhost:3000", help="基础URL")
    parser.add_argument("--message", default="你好，请介绍一下自己", help="测试消息")

    args = parser.parse_args()

    # 如果没有指定参数，默认测试所有
    if not (args.all or args.api or args.stream or args.ui):
        args.all = True

    results = {}

    if args.all or args.api:
        logger.info("=== 测试聊天API ===")
        results["api"] = test_chat_api(args.message, args.endpoint)

    if args.all or args.stream:
        logger.info("=== 测试流式聊天API ===")
        results["stream"] = test_stream_api(args.message, args.endpoint)

    if args.all or args.ui:
        logger.info("=== 测试聊天UI ===")
        results["ui"] = test_chat_ui(args.base_url)

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
