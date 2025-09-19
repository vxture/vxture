"""
智能代理工具实现
提供各种工具函数，用于智能代理集成
"""

import os
import json
import logging
import requests
from typing import Dict, List, Any, Optional, Union
from pathlib import Path

logger = logging.getLogger("agents.tools")

# Web搜索工具
def web_search(query: str, num_results: int = 5, search_engine: str = "serpapi") -> Dict[str, Any]:
    """
    执行网络搜索

    Args:
        query: 搜索查询
        num_results: 返回结果数量
        search_engine: 搜索引擎 ("serpapi", "google", "bing")

    Returns:
        搜索结果
    """
    logger.info(f"执行Web搜索: {query} (引擎: {search_engine}, 结果数: {num_results})")

    # 模拟搜索结果
    mock_results = [
        {
            "title": f"搜索结果 {i+1} 关于 '{query}'",
            "link": f"https://example.com/result{i+1}",
            "snippet": f"这是关于 '{query}' 的示例搜索结果内容 {i+1}..."
        }
        for i in range(num_results)
    ]

    # 实际实现应调用真实搜索API
    # 例如 SerpAPI、Google自定义搜索或Bing搜索API

    return {
        "query": query,
        "engine": search_engine,
        "results": mock_results,
        "total_results": len(mock_results)
    }

# 文件操作工具
def read_file(file_path: str, workspace_path: Optional[str] = None) -> Dict[str, Any]:
    """
    读取文件内容

    Args:
        file_path: 相对于工作区的文件路径
        workspace_path: 工作区路径，默认使用环境变量AGENT_WORKSPACE

    Returns:
        文件内容
    """
    workspace = workspace_path or os.getenv("AGENT_WORKSPACE", "./data/workspace")
    full_path = Path(workspace) / file_path

    logger.info(f"读取文件: {full_path}")

    try:
        if not full_path.exists():
            return {
                "success": False,
                "error": f"文件不存在: {file_path}",
                "content": None
            }

        content = full_path.read_text(encoding="utf-8")
        return {
            "success": True,
            "path": str(file_path),
            "content": content,
            "size": len(content)
        }
    except Exception as e:
        logger.error(f"读取文件时出错: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "content": None
        }

def write_file(file_path: str, content: str, workspace_path: Optional[str] = None) -> Dict[str, Any]:
    """
    写入文件内容

    Args:
        file_path: 相对于工作区的文件路径
        content: 要写入的内容
        workspace_path: 工作区路径，默认使用环境变量AGENT_WORKSPACE

    Returns:
        操作结果
    """
    workspace = workspace_path or os.getenv("AGENT_WORKSPACE", "./data/workspace")
    full_path = Path(workspace) / file_path

    logger.info(f"写入文件: {full_path}")

    try:
        # 确保目录存在
        full_path.parent.mkdir(parents=True, exist_ok=True)

        # 写入文件
        full_path.write_text(content, encoding="utf-8")

        return {
            "success": True,
            "path": str(file_path),
            "size": len(content)
        }
    except Exception as e:
        logger.error(f"写入文件时出错: {str(e)}")
        return {
            "success": False,
            "error": str(e)
        }

# 代码执行工具
def execute_python(code: str, env_vars: Optional[Dict[str, str]] = None) -> Dict[str, Any]:
    """
    执行Python代码

    Args:
        code: 要执行的Python代码
        env_vars: 环境变量

    Returns:
        执行结果
    """
    import sys
    import io
    from contextlib import redirect_stdout, redirect_stderr

    logger.info("执行Python代码")

    # 设置环境变量
    old_env = {}
    if env_vars:
        for key, value in env_vars.items():
            old_env[key] = os.environ.get(key)
            os.environ[key] = value

    # 捕获输出
    stdout = io.StringIO()
    stderr = io.StringIO()

    try:
        with redirect_stdout(stdout), redirect_stderr(stderr):
            # 执行代码
            exec_globals = {}
            exec(code, exec_globals)

        return {
            "success": True,
            "stdout": stdout.getvalue(),
            "stderr": stderr.getvalue(),
            "variables": {
                k: str(v) for k, v in exec_globals.items()
                if not k.startswith("__") and k != "exec_globals"
            }
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "stderr": stderr.getvalue(),
            "stdout": stdout.getvalue()
        }
    finally:
        # 恢复环境变量
        if env_vars:
            for key, value in old_env.items():
                if value is None:
                    del os.environ[key]
                else:
                    os.environ[key] = value

# 数据处理工具
def parse_json(text: str) -> Dict[str, Any]:
    """
    解析JSON文本

    Args:
        text: JSON文本

    Returns:
        解析结果
    """
    try:
        data = json.loads(text)
        return {
            "success": True,
            "data": data
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def extract_text(html: str) -> Dict[str, Any]:
    """
    从HTML中提取文本

    Args:
        html: HTML文本

    Returns:
        提取的文本
    """
    try:
        from bs4 import BeautifulSoup
        soup = BeautifulSoup(html, 'html.parser')

        # 移除脚本和样式元素
        for script in soup(["script", "style"]):
            script.extract()

        # 获取文本
        text = soup.get_text()

        # 处理空白
        lines = (line.strip() for line in text.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = '\n'.join(chunk for chunk in chunks if chunk)

        return {
            "success": True,
            "text": text,
            "length": len(text)
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

# 工具注册表
TOOLS = {
    "web_search": web_search,
    "read_file": read_file,
    "write_file": write_file,
    "execute_python": execute_python,
    "parse_json": parse_json,
    "extract_text": extract_text
}

def get_available_tools() -> List[str]:
    """获取可用工具列表"""
    return list(TOOLS.keys())

def execute_tool(tool_name: str, **kwargs) -> Dict[str, Any]:
    """执行指定工具"""
    if tool_name not in TOOLS:
        return {
            "success": False,
            "error": f"未知工具: {tool_name}"
        }

    try:
        return TOOLS[tool_name](**kwargs)
    except Exception as e:
        return {
            "success": False,
            "error": f"执行工具时出错: {str(e)}"
        }
