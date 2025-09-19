"""
AutoGen工具包配置模块
定义AutoGen智能体可用的工具和工具执行方法
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional, Callable, Union, TypedDict
from pathlib import Path

# 初始化日志
logger = logging.getLogger("autogen.tools")

# 基础工具类型定义
class ToolResult(TypedDict, total=False):
    """工具执行结果类型"""
    content: str
    status: str
    error: Optional[str]
    data: Optional[Any]

class ToolDefinition(TypedDict):
    """工具定义类型"""
    name: str
    description: str
    parameters: Dict[str, Any]
    required_params: List[str]
    func: Callable
    examples: Optional[List[Dict[str, Any]]]
    enabled: bool

# 工具注册表
TOOLS_REGISTRY: Dict[str, ToolDefinition] = {}

# 工具装饰器
def register_tool(
    name: str,
    description: str,
    parameters: Dict[str, Any] = None,
    required_params: List[str] = None,
    examples: List[Dict[str, Any]] = None,
    enabled: bool = True
):
    """注册工具装饰器"""
    parameters = parameters or {}
    required_params = required_params or []
    examples = examples or []

    def decorator(func: Callable):
        TOOLS_REGISTRY[name] = {
            "name": name,
            "description": description,
            "parameters": parameters,
            "required_params": required_params,
            "func": func,
            "examples": examples,
            "enabled": enabled
        }
        return func

    return decorator

# 工具执行器
class ToolExecutor:
    """工具执行器类"""

    def __init__(self,
                 tools: Optional[Dict[str, ToolDefinition]] = None,
                 timeout: int = 60):
        """初始化工具执行器"""
        self.tools = tools or TOOLS_REGISTRY
        self.timeout = timeout
        logger.info(f"初始化工具执行器，加载了 {len(self.tools)} 个工具")

    def execute(self,
                tool_name: str,
                tool_params: Dict[str, Any]) -> ToolResult:
        """执行指定工具"""
        if tool_name not in self.tools:
            return {
                "status": "error",
                "error": f"未找到工具 '{tool_name}'",
                "content": f"未找到工具 '{tool_name}'"
            }

        tool = self.tools[tool_name]

        # 检查必需参数
        missing_params = []
        for param in tool["required_params"]:
            if param not in tool_params:
                missing_params.append(param)

        if missing_params:
            return {
                "status": "error",
                "error": f"缺少必需参数: {', '.join(missing_params)}",
                "content": f"缺少必需参数: {', '.join(missing_params)}"
            }

        # 执行工具
        try:
            logger.info(f"执行工具 '{tool_name}' 参数: {tool_params}")
            result = tool["func"](**tool_params)

            # 确保结果格式正确
            if isinstance(result, dict):
                if "content" not in result:
                    result["content"] = str(result.get("data", ""))
                if "status" not in result:
                    result["status"] = "success"
                return result
            else:
                return {
                    "status": "success",
                    "content": str(result),
                    "data": result
                }

        except Exception as e:
            logger.error(f"执行工具 '{tool_name}' 时出错: {str(e)}")
            return {
                "status": "error",
                "error": str(e),
                "content": f"执行工具 '{tool_name}' 时出错: {str(e)}"
            }

# 工具示例实现

@register_tool(
    name="web_search",
    description="搜索网络获取信息",
    parameters={
        "query": {"type": "string", "description": "搜索查询"},
        "num_results": {"type": "integer", "description": "返回结果数量"}
    },
    required_params=["query"],
    examples=[
        {"query": "2023年诺贝尔物理学奖得主", "num_results": 3}
    ]
)
def web_search(query: str, num_results: int = 5) -> ToolResult:
    """模拟网络搜索工具"""
    # 实际实现应调用真实搜索API
    return {
        "content": f"关于 '{query}' 的搜索结果：\n1. 示例结果1\n2. 示例结果2\n3. 示例结果3",
        "data": [f"示例结果{i+1}" for i in range(min(num_results, 5))]
    }

@register_tool(
    name="calculate",
    description="执行数学计算",
    parameters={
        "expression": {"type": "string", "description": "要计算的数学表达式"}
    },
    required_params=["expression"],
    examples=[
        {"expression": "2 * (3 + 4)"}
    ]
)
def calculate(expression: str) -> ToolResult:
    """执行数学计算"""
    try:
        # 警告：使用eval可能存在安全风险，实际实现应使用安全的解析器
        # 这里仅作为示例
        result = eval(expression)
        return {
            "content": f"计算结果: {expression} = {result}",
            "data": result
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"计算错误: {str(e)}",
            "content": f"无法计算表达式 '{expression}': {str(e)}"
        }

@register_tool(
    name="file_read",
    description="读取文件内容",
    parameters={
        "file_path": {"type": "string", "description": "要读取的文件路径"}
    },
    required_params=["file_path"]
)
def file_read(file_path: str) -> ToolResult:
    """读取文件内容"""
    try:
        base_path = os.getenv("AGENT_FILESYSTEM_PATH", "./data/workspace")
        full_path = Path(base_path) / file_path

        # 安全检查：确保路径在允许的目录内
        if not str(full_path.resolve()).startswith(str(Path(base_path).resolve())):
            return {
                "status": "error",
                "error": "安全错误：尝试访问允许目录之外的文件",
                "content": "由于安全限制，无法访问指定路径"
            }

        if not full_path.exists():
            return {
                "status": "error",
                "error": f"文件不存在: {file_path}",
                "content": f"找不到文件: {file_path}"
            }

        content = full_path.read_text(encoding="utf-8")
        return {
            "content": f"文件 '{file_path}' 的内容:\n{content}",
            "data": content
        }
    except Exception as e:
        return {
            "status": "error",
            "error": f"读取文件时出错: {str(e)}",
            "content": f"无法读取文件 '{file_path}': {str(e)}"
        }

# 初始化默认工具执行器
default_tool_executor = ToolExecutor()

def get_tools_manifest() -> List[Dict[str, Any]]:
    """获取工具清单，用于LLM工具调用"""
    manifest = []
    for name, tool in TOOLS_REGISTRY.items():
        if tool["enabled"]:
            manifest.append({
                "name": name,
                "description": tool["description"],
                "parameters": {
                    "type": "object",
                    "properties": tool["parameters"],
                    "required": tool["required_params"]
                }
            })
    return manifest

def get_enabled_tool_names() -> List[str]:
    """获取已启用的工具名称列表"""
    return [name for name, tool in TOOLS_REGISTRY.items() if tool["enabled"]]
