"""
LangGraph配置文件
定义图结构智能体的基础设置和通用功能
"""

from typing import Any, Dict, List, Optional, TypedDict, Union, Literal
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# LLM提供商配置
LLM_PROVIDERS = {
    "default": os.getenv("DEFAULT_LLM_PROVIDER", "openai"),  # 默认提供商
    "available": os.getenv("AVAILABLE_LLM_PROVIDERS", "openai,azure,anthropic,deepseek,dashscope,ollama").split(","),
    "configs": {
        "openai": {
            "api_key": os.getenv("OPENAI_API_KEY", ""),
            "base_url": os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1"),
            "model": os.getenv("OPENAI_MODEL", "gpt-4o"),
            "organization": os.getenv("OPENAI_ORGANIZATION", ""),
        },
        "azure": {
            "api_key": os.getenv("AZURE_OPENAI_API_KEY", ""),
            "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT", ""),
            "model": os.getenv("AZURE_OPENAI_MODEL", "gpt-4"),
            "deployment_name": os.getenv("AZURE_OPENAI_DEPLOYMENT", ""),
            "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-01"),
        },
        "anthropic": {
            "api_key": os.getenv("ANTHROPIC_API_KEY", ""),
            "model": os.getenv("ANTHROPIC_MODEL", "claude-3-opus-20240229"),
        },
        "dashscope": {
            "api_key": os.getenv("DASHSCOPE_API_KEY", ""),
            "model": os.getenv("DASHSCOPE_MODEL", "qwen-max"),
        },
        "ollama": {
            "host": os.getenv("OLLAMA_HOST", "http://localhost:11434"),
            "model": os.getenv("OLLAMA_MODEL", "llama3"),
        },
    },
}

# 向量存储配置
VECTOR_STORES = {
    "default": os.getenv("DEFAULT_VECTOR_STORE", "pgvector"),
    "available": os.getenv("AVAILABLE_VECTOR_STORES", "pgvector,chroma,qdrant,faiss").split(","),
    "configs": {
        "pgvector": {
            "connection_string": os.getenv("PG_CONNECTION_STRING", "postgresql://postgres:postgres@localhost:5432/vxture"),
            "collection_name": os.getenv("PG_COLLECTION", "documents"),
            "embedding_dimension": int(os.getenv("EMBEDDING_DIMENSION", "1536")),
        },
        "chroma": {
            "persist_directory": os.getenv("CHROMA_PERSIST_DIR", "./data/chroma"),
            "collection_name": os.getenv("CHROMA_COLLECTION", "documents"),
        },
        "qdrant": {
            "url": os.getenv("QDRANT_URL", "http://localhost:6333"),
            "collection_name": os.getenv("QDRANT_COLLECTION", "documents"),
        },
        "faiss": {
            "index_path": os.getenv("FAISS_INDEX_PATH", "./data/faiss"),
            "allow_reset": os.getenv("FAISS_ALLOW_RESET", "false").lower() == "true",
        },
    },
}

# LangGraph状态持久化
LANGGRAPH_PERSISTENCE = {
    "enabled": os.getenv("LANGGRAPH_PERSISTENCE_ENABLED", "true").lower() == "true",
    "storage_type": os.getenv("LANGGRAPH_STORAGE_TYPE", "redis"),  # redis, memory, filesystem, dynamodb
    "redis_url": os.getenv("REDIS_URL", "redis://localhost:6379/0"),
    "filesystem_path": os.getenv("LANGGRAPH_FILESYSTEM_PATH", "./data/langgraph_states"),
    "cleanup_expired_sessions": os.getenv("CLEANUP_EXPIRED_SESSIONS", "true").lower() == "true",
    "session_ttl_seconds": int(os.getenv("SESSION_TTL_SECONDS", "86400")),  # 24小时
}

# 定义核心状态类型
class Message(TypedDict):
    """消息类型定义"""
    role: Literal["user", "assistant", "system", "tool"]
    content: str
    name: Optional[str]
    metadata: Optional[Dict[str, Any]]

class AgentState(TypedDict):
    """LangGraph智能体基础状态类型"""
    messages: List[Message]
    context: Dict[str, Any]
    current_node: str
    artifacts: Dict[str, Any]
    metadata: Dict[str, Any]
    next_steps: Optional[List[str]]
    error: Optional[str]
    status: Optional[str]

# 高级RAG配置
RAG_CONFIG = {
    "enabled": os.getenv("RAG_ENABLED", "true").lower() == "true",
    "embedding_model": os.getenv("EMBEDDING_MODEL", "BAAI/bge-large-en-v1.5"),
    "chunk_size": int(os.getenv("CHUNK_SIZE", "1000")),
    "chunk_overlap": int(os.getenv("CHUNK_OVERLAP", "200")),
    "retrieval_k": int(os.getenv("RETRIEVAL_K", "5")),
    "rerank_enabled": os.getenv("RERANK_ENABLED", "true").lower() == "true",
    "rerank_model": os.getenv("RERANK_MODEL", "BAAI/bge-reranker-large"),
    "rerank_top_n": int(os.getenv("RERANK_TOP_N", "3")),
    "default_sources": os.getenv("DEFAULT_SOURCES", "docs,kb").split(","),
    "sources_config": {
        "docs": {
            "path": os.getenv("DOCS_PATH", "./data/docs"),
            "extensions": os.getenv("DOCS_EXTENSIONS", ".pdf,.docx,.txt").split(","),
        },
        "kb": {
            "path": os.getenv("KB_PATH", "./data/kb"),
            "extensions": os.getenv("KB_EXTENSIONS", ".md,.txt").split(","),
        },
    },
}

# 工具和外部集成
TOOLS_CONFIG = {
    "enabled": os.getenv("TOOLS_ENABLED", "true").lower() == "true",
    "available_tools": os.getenv("AVAILABLE_TOOLS", "web_search,calculator,python_repl,shell").split(","),
    "default_tools": os.getenv("DEFAULT_TOOLS", "calculator,python_repl").split(","),
    "custom_tools_path": os.getenv("CUSTOM_TOOLS_PATH", "./app/agents/tools"),
    "web_search": {
        "enabled": os.getenv("WEB_SEARCH_ENABLED", "true").lower() == "true",
        "search_engine": os.getenv("SEARCH_ENGINE", "serpapi"),  # serpapi, google, bing
        "serpapi_key": os.getenv("SERPAPI_API_KEY", ""),
        "google_api_key": os.getenv("GOOGLE_API_KEY", ""),
        "google_cse_id": os.getenv("GOOGLE_CSE_ID", ""),
    },
}

# 监控和调试
MONITORING = {
    "tracing_enabled": os.getenv("TRACING_ENABLED", "true").lower() == "true",
    "tracing_type": os.getenv("TRACING_TYPE", "langsmith"),  # langsmith, opentelemetry, custom
    "langsmith": {
        "api_key": os.getenv("LANGSMITH_API_KEY", ""),
        "project": os.getenv("LANGSMITH_PROJECT", "vxture"),
    },
    "log_level": os.getenv("LOG_LEVEL", "INFO"),
    "log_to_file": os.getenv("LOG_TO_FILE", "true").lower() == "true",
    "log_file": os.getenv("LOG_FILE", "./logs/langgraph.log"),
}

# 图可视化
GRAPH_VISUALIZATION = {
    "enabled": os.getenv("GRAPH_VIZ_ENABLED", "true").lower() == "true",
    "format": os.getenv("GRAPH_VIZ_FORMAT", "html"),  # html, json, mermaid
    "output_dir": os.getenv("GRAPH_VIZ_DIR", "./data/graph_visualizations"),
    "include_edges": os.getenv("GRAPH_INCLUDE_EDGES", "true").lower() == "true",
    "include_state": os.getenv("GRAPH_INCLUDE_STATE", "true").lower() == "true",
}
