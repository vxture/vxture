"""
LangGraph基础类，包含智能体图的核心功能和扩展支持
"""

from typing import Any, Dict, List, Callable, Optional, Union, TypeVar, cast
import os
import logging
from langgraph.graph import StateGraph, START, END, MessageGraph
from langgraph.graph.message import MessagesState
from langgraph.checkpoint import MemorySaver, FileSystemSaver, RedisSaver
from langgraph.prebuilt import ToolNode, ToolExecutor, tools_to_tool_nodes
from langchain_core.language_models import BaseChatModel
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import JsonOutputParser, StrOutputParser
from langchain_core.pydantic_v1 import BaseModel, Field, validator
from langchain_openai import ChatOpenAI

from .config import AgentState, LLM_PROVIDERS, LANGGRAPH_PERSISTENCE, MONITORING


# 设置日志
logger = logging.getLogger("langgraph")
if MONITORING["log_to_file"]:
    handler = logging.FileHandler(MONITORING["log_file"])
    handler.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    logger.addHandler(handler)
logger.setLevel(getattr(logging, MONITORING["log_level"]))


# 结果类型
T = TypeVar('T')


class BaseAgentGraph:
    """LangGraph智能体基础类，支持复杂工作流和图操作"""

    def __init__(
        self,
        name: str,
        description: str = "",
        llm: Optional[BaseChatModel] = None,
        persistence_id: Optional[str] = None,
        checkpoint_config: Optional[Dict[str, Any]] = None,
    ):
        """初始化智能体图

        Args:
            name: 智能体图名称
            description: 智能体图描述
            llm: 语言模型，如果不提供将使用默认配置创建
            persistence_id: 持久化ID，用于状态恢复
            checkpoint_config: 检查点配置，覆盖默认设置
        """
        self.name = name
        self.description = description
        self.llm = llm or self._get_default_llm()
        self.persistence_id = persistence_id
        self.checkpoint_config = checkpoint_config or {}
        self.graph = None
        self.nodes = {}
        self.tools = {}
        self.edge_conditions = {}
        self.compiled_graph = None

        # 初始化工具执行器
        self.tool_executor = None

        # 调试和监控选项
        self.debug_mode = os.getenv("LANGGRAPH_DEBUG", "false").lower() == "true"
        self.trace_enabled = MONITORING["tracing_enabled"]

        logger.info(f"初始化LangGraph代理: {name}")

    def _get_default_llm(self) -> BaseChatModel:
        """获取默认的语言模型基于配置"""
        provider = LLM_PROVIDERS["default"]
        provider_config = LLM_PROVIDERS["configs"][provider]

        if provider == "openai":
            return ChatOpenAI(
                model=provider_config["model"],
                api_key=provider_config["api_key"],
                base_url=provider_config["base_url"],
                organization=provider_config["organization"] or None,
                temperature=0.1,
                streaming=True,
            )
        elif provider == "anthropic":
            from langchain_anthropic import ChatAnthropic
            return ChatAnthropic(
                model=provider_config["model"],
                api_key=provider_config["api_key"],
                temperature=0.1,
                streaming=True,
            )
        elif provider == "azure":
            return ChatOpenAI(
                model=provider_config["model"],
                azure_deployment=provider_config["deployment_name"],
                azure_endpoint=provider_config["endpoint"],
                api_key=provider_config["api_key"],
                api_version=provider_config["api_version"],
                temperature=0.1,
                streaming=True,
            )
        # 可以根据需要添加更多提供商

        # 默认回退到OpenAI
        logger.warning(f"未找到提供商 {provider} 的配置，使用OpenAI作为默认值")
        return ChatOpenAI(model="gpt-4o", temperature=0.1)

    def add_node(
        self,
        name: str,
        func: Callable,
        description: str = "",
        node_type: str = "standard"
    ) -> None:
        """添加节点到图中

        Args:
            name: 节点名称
            func: 节点处理函数
            description: 节点描述
            node_type: 节点类型 (standard, tool, conditional, llm)
        """
        self.nodes[name] = {
            "func": func,
            "description": description,
            "type": node_type
        }
        logger.debug(f"添加节点: {name} (类型: {node_type})")

    def add_tool_node(
        self,
        name: str,
        func: Callable,
        description: str = ""
    ) -> None:
        """添加工具节点

        Args:
            name: 工具名称
            func: 工具函数
            description: 工具描述
        """
        self.tools[name] = {
            "func": func,
            "description": description
        }

        # 如果工具执行器尚未创建，创建一个
        if not self.tool_executor:
            self.tool_executor = ToolExecutor()

        # 注册工具到执行器
        self.tool_executor.register_tool(name, func, description)

        # 创建工具节点
        tool_node = ToolNode(name=name, func=func, description=description)
        self.nodes[name] = {
            "func": tool_node,
            "description": description,
            "type": "tool"
        }
        logger.debug(f"添加工具节点: {name}")

    def add_llm_node(
        self,
        name: str,
        prompt: Union[str, ChatPromptTemplate],
        llm: Optional[BaseChatModel] = None,
        output_parser: Any = None,
        description: str = ""
    ) -> None:
        """添加LLM节点，使用提供的提示模板

        Args:
            name: 节点名称
            prompt: 字符串提示或ChatPromptTemplate
            llm: 要使用的语言模型，如果不提供则使用默认模型
            output_parser: 输出解析器，默认为None (直接返回文本)
            description: 节点描述
        """
        # 转换字符串提示为ChatPromptTemplate
        if isinstance(prompt, str):
            prompt = ChatPromptTemplate.from_messages([
                ("system", prompt),
                MessagesPlaceholder(variable_name="messages")
            ])

        # 使用提供的LLM或默认LLM
        model = llm or self.llm

        # 创建链
        if output_parser:
            chain = prompt | model | output_parser
        else:
            chain = prompt | model | StrOutputParser()

        # 添加到节点
        self.add_node(
            name=name,
            func=lambda state: {"messages": state["messages"] + [{"role": "assistant", "content": chain.invoke(state)}]},
            description=description,
            node_type="llm"
        )
        logger.debug(f"添加LLM节点: {name}")

    def add_conditional_edge(
        self,
        source: str,
        condition_func: Callable[[AgentState], str],
        description: str = ""
    ) -> None:
        """添加条件边，动态确定下一个节点

        Args:
            source: 源节点名称
            condition_func: 根据状态确定下一个节点的条件函数
            description: 条件描述
        """
        self.edge_conditions[source] = {
            "func": condition_func,
            "description": description
        }
        logger.debug(f"添加条件边: 从 {source}")

    def _setup_persistence(self) -> Any:
        """设置持久化机制"""
        if not LANGGRAPH_PERSISTENCE["enabled"]:
            return None

        storage_type = LANGGRAPH_PERSISTENCE["storage_type"]

        if storage_type == "memory":
            return MemorySaver()
        elif storage_type == "filesystem":
            path = LANGGRAPH_PERSISTENCE["filesystem_path"]
            os.makedirs(path, exist_ok=True)
            return FileSystemSaver(path)
        elif storage_type == "redis":
            redis_url = LANGGRAPH_PERSISTENCE["redis_url"]
            return RedisSaver(redis_url)
        else:
            logger.warning(f"未知的存储类型: {storage_type}，使用内存存储")
            return MemorySaver()

    def build(self) -> StateGraph:
        """构建智能体图

        需要在子类中实现具体的图构建逻辑
        """
        raise NotImplementedError("子类必须实现build方法")

    def compile(self) -> Any:
        """编译图并准备执行"""
        if not self.graph:
            self.graph = self.build()

        # 设置持久化
        saver = self._setup_persistence()

        # 编译图
        if saver and self.persistence_id:
            self.compiled_graph = self.graph.compile(checkpointer=saver, channel=self.persistence_id)
        else:
            self.compiled_graph = self.graph.compile()

        logger.info(f"编译图 {self.name} 完成")
        return self.compiled_graph

    def invoke(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """运行图处理流程"""
        if not self.compiled_graph:
            self.compile()

        logger.info(f"执行图 {self.name}")
        logger.debug(f"初始状态: {state}")

        result = self.compiled_graph.invoke(state)

        logger.debug(f"执行结果: {result}")
        return result

    def astream(self, state: Dict[str, Any]) -> Any:
        """异步流式执行图"""
        if not self.compiled_graph:
            self.compile()

        logger.info(f"流式执行图 {self.name}")
        return self.compiled_graph.astream(state)

    def get_nodes(self) -> Dict[str, Dict[str, Any]]:
        """获取所有节点信息"""
        return self.nodes

    def get_tools(self) -> Dict[str, Dict[str, Any]]:
        """获取所有工具信息"""
        return self.tools

        Returns:
            构建好的状态图
        """
        raise NotImplementedError("必须在子类中实现build方法")

    def run(self, input_data: Any) -> Dict[str, Any]:
        """运行智能体图

        Args:
            input_data: 输入数据

        Returns:
            处理结果
        """
        if self.graph is None:
            self.graph = self.build()

        # 创建图执行器
        config = {}
        if LANGGRAPH_PERSISTENCE["enabled"] and self.persistence_id:
            if LANGGRAPH_PERSISTENCE["storage_type"] == "redis":
                from langgraph.persistence import RedisPersistence
                persistence = RedisPersistence(
                    session_id=self.persistence_id,
                    url=LANGGRAPH_PERSISTENCE["redis_url"]
                )
                config["persistence"] = persistence

        # 创建可执行图
        graph_executor = self.graph.compile(**config)

        # 执行图
        result = graph_executor.invoke(input_data)
        return result

    def get_graph_visualization(self) -> str:
        """获取图的可视化表示

        Returns:
            图的可视化表示，格式由配置决定
        """
        if self.graph is None:
            self.graph = self.build()

        from langgraph.graph.graph import get_graph_json
        return get_graph_json(self.graph)
