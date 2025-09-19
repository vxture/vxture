"""
示例：简单问答智能体图实现
展示如何使用LangGraph构建基础问答系统
"""

from typing import Dict, List, Any, Tuple, Optional
from langgraph.graph import StateGraph, START, END

from .base import BaseAgentGraph
from .config import AgentState

class SimpleQAAgentGraph(BaseAgentGraph):
    """简单问答智能体图实现"""

    def __init__(self, name: str = "simple_qa", description: str = "简单问答智能体", **kwargs):
        super().__init__(name, description, **kwargs)

        # 添加基础节点
        self.add_node("parse_query", self._parse_query, "解析用户查询")
        self.add_node("retrieve_context", self._retrieve_context, "检索相关上下文")
        self.add_node("generate_answer", self._generate_answer, "生成回答")
        self.add_node("decide_next_step", self._decide_next_step, "决定下一步操作")

    def _parse_query(self, state: AgentState) -> AgentState:
        """解析用户查询"""
        # 获取最后一条用户消息
        last_message = state["messages"][-1]
        content = last_message.get("content", "")

        # 简单解析处理
        state["context"]["query"] = content
        state["context"]["parsed_intent"] = "查询"  # 简化处理，实际应该使用意图分类

        return state

    def _retrieve_context(self, state: AgentState) -> AgentState:
        """检索相关上下文"""
        query = state["context"].get("query", "")

        # 模拟从向量库检索结果
        # 实际实现应该调用向量数据库
        state["context"]["retrieved_documents"] = [
            {"content": "这是检索到的相关文档1", "score": 0.95},
            {"content": "这是检索到的相关文档2", "score": 0.85},
        ]

        return state

    def _generate_answer(self, state: AgentState) -> AgentState:
        """生成回答"""
        query = state["context"].get("query", "")
        docs = state["context"].get("retrieved_documents", [])

        # 构建上下文
        context_text = "\n".join([doc["content"] for doc in docs])

        # 使用LLM生成回答
        # 构建提示词
        prompt = f"""
        基于以下信息回答用户问题:

        用户问题: {query}

        上下文信息:
        {context_text}

        请提供准确、简洁的回答。如果无法从上下文中找到答案，请诚实地说明。
        """

        # 调用LLM
        response = self.llm.invoke(prompt)

        # 保存结果
        state["context"]["answer"] = response.content

        # 添加到消息历史
        state["messages"].append({
            "role": "assistant",
            "content": response.content
        })

        return state

    def _decide_next_step(self, state: AgentState) -> str:
        """决定下一步操作"""
        # 根据状态判断是否需要进一步处理
        # 简化版本直接返回END
        return END

    def build(self) -> StateGraph:
        """构建智能体图"""
        # 初始化状态
        def get_initial_state() -> AgentState:
            return {
                "messages": [],
                "context": {},
                "current_node": START,
                "artifacts": {},
                "metadata": {},
                "error": None
            }

        # 创建状态图
        builder = StateGraph(AgentState)
        builder.add_node("parse_query", self.nodes["parse_query"]["func"])
        builder.add_node("retrieve_context", self.nodes["retrieve_context"]["func"])
        builder.add_node("generate_answer", self.nodes["generate_answer"]["func"])

        # 设置边
        builder.add_edge(START, "parse_query")
        builder.add_edge("parse_query", "retrieve_context")
        builder.add_edge("retrieve_context", "generate_answer")
        builder.add_edge("generate_answer", self.nodes["decide_next_step"]["func"])

        # 设置初始状态
        builder.set_entry_point(get_initial_state)

        return builder.compile()
