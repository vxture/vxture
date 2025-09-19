# LangGraph 智能代理示例配置
from typing import Dict, List, Any, Optional, TypedDict, Annotated
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolExecutor, tools_to_tool_nodes

# 定义状态类型
class AgentState(TypedDict):
    messages: List[Dict[str, str]]
    next_steps: Optional[List[Dict[str, Any]]]
    tool_calls: Optional[List[Dict[str, Any]]]
    tool_results: Optional[List[Dict[str, Any]]]
    current_step: Optional[str]
    context: Optional[Dict[str, Any]]

# 定义默认LLM
def get_default_llm():
    """获取默认的LLM模型实例"""
    return ChatOpenAI(
        model="gpt-3.5-turbo-0125",
        temperature=0.3,
        streaming=False,
    )

# 定义系统提示
SYSTEM_PROMPT = """你是一个友好、专业的助手，擅长回答用户问题并提供帮助。

当用户提问时，请遵循以下指导：
1. 简洁明了地回答问题
2. 如果需要额外信息，礼貌地请求
3. 当不确定时，坦诚表明自己的局限性
4. 使用友好的语气与用户交流
"""

# 创建提示模板
prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("placeholder", "{messages}"),
])

# 定义助手节点
def assistant(state: AgentState):
    """处理用户输入并生成响应"""
    llm = get_default_llm()
    messages = state["messages"]

    # 运行LLM
    result = llm.invoke([
        {"role": msg["role"], "content": msg["content"]}
        for msg in messages
    ])

    # 更新消息历史
    return {
        "messages": messages + [{"role": "assistant", "content": result.content}]
    }

# 创建图
def create_agent_graph():
    """创建智能代理处理流程图"""
    workflow = StateGraph(AgentState)

    # 添加节点
    workflow.add_node("assistant", assistant)

    # 设置入口
    workflow.set_entry_point("assistant")

    # 设置边 - 目前这是一个简单图，仅有一个助手节点
    workflow.add_edge("assistant", END)

    # 编译
    return workflow.compile()

# 创建API处理函数
def process_chat_request(messages: List[Dict[str, str]]):
    """处理聊天请求并返回回复"""
    graph = create_agent_graph()

    # 初始化状态
    state = {"messages": messages}

    # 运行图
    result = graph.invoke(state)

    # 返回最终结果
    return {
        "response": result["messages"][-1],
        "conversation_id": "langgraph-" + str(hash(str(messages)))
    }
