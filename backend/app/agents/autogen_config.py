"""
AutoGen多智能体框架配置
"""

from typing import Dict, List, Any, Optional
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

# AutoGen基础配置
AUTOGEN_CONFIG = {
    "enabled": True,  # 启用AutoGen
    "llm_config": {
        "provider": os.getenv("DEFAULT_LLM_PROVIDER", "openai"),
        "config_list": [
            {
                "model": os.getenv("DEFAULT_AUTOGEN_MODEL", "gpt-4o"),
                "api_key": os.getenv("OPENAI_API_KEY", ""),
                "base_url": os.getenv("OPENAI_API_BASE", "https://api.openai.com/v1"),
            }
        ],
        "temperature": float(os.getenv("AUTOGEN_TEMPERATURE", "0.1")),
        "timeout": int(os.getenv("AUTOGEN_TIMEOUT", "300")),
        "cache_seed": 42,
        "use_cache": os.getenv("AUTOGEN_USE_CACHE", "true").lower() == "true",
    },
    "agent_workflow": os.getenv("AUTOGEN_WORKFLOW", "groupchat"),  # groupchat, sequential, custom
    "persistent_state": os.getenv("AUTOGEN_PERSISTENT_STATE", "true").lower() == "true",
    "default_max_rounds": int(os.getenv("AUTOGEN_DEFAULT_MAX_ROUNDS", "15")),
    "default_human_input_mode": os.getenv("AUTOGEN_HUMAN_INPUT_MODE", "NEVER"),
}

# 智能体角色配置
AGENT_ROLES = [
    {
        "name": "user_proxy",
        "description": "代表用户与系统交互的代理",
        "system_message": "你是用户代理，代表用户与系统交互。你将用户的需求转化为明确的指令，并评估其他智能体的输出是否满足需求。",
        "type": "user_proxy",
        "human_input_mode": "NEVER",
    },
    {
        "name": "assistant",
        "description": "通用AI助手",
        "system_message": "你是一个通用AI助手，擅长理解用户需求并组织其他专家智能体的协作以解决复杂问题。你负责协调团队工作并整合最终结果。",
        "type": "assistant",
    },
    {
        "name": "coder",
        "description": "专注于编写代码的智能体",
        "system_message": "你是一个专业的程序员，擅长编写高质量、可维护的代码。你专注于实现功能、确保代码质量和性能优化。始终提供完整可运行的代码和必要的文档。",
        "type": "assistant",
    },
    {
        "name": "planner",
        "description": "负责任务规划的智能体",
        "system_message": "你是一个任务规划专家，擅长分解和规划复杂任务。你的责任是制定详细、可执行的计划，包括步骤、依赖关系和预期结果。",
        "type": "assistant",
    },
    {
        "name": "critic",
        "description": "评估和改进解决方案的智能体",
        "system_message": "你是一个批判性思考者，负责评估和改进解决方案。你应该找出潜在问题、逻辑漏洞和改进机会，并提供具体的改进建议。",
        "type": "assistant",
    },
    {
        "name": "researcher",
        "description": "负责信息搜索和研究的智能体",
        "system_message": "你是一个研究专家，擅长搜索、整理和分析信息。你的目标是提供全面、准确的信息支持，帮助团队做出基于证据的决策。",
        "type": "assistant",
    },
    {
        "name": "product_manager",
        "description": "负责产品需求和用户体验的智能体",
        "system_message": "你是一个产品管理专家，负责定义产品需求、用户故事和验收标准。你专注于用户体验和商业价值，确保技术实现符合用户需求。",
        "type": "assistant",
    },
]

# 工具配置
AGENT_TOOLS_CONFIG = {
    "enabled_tools": os.getenv("ENABLED_AGENT_TOOLS", "web_search,file_operations,code_execution,human_feedback").split(","),
    "custom_tools_path": os.getenv("CUSTOM_TOOLS_PATH", "./app/agents/tools"),
    "tool_execution_timeout": int(os.getenv("TOOL_EXECUTION_TIMEOUT", "60")),
    "default_filesystem_base_path": os.getenv("AGENT_FILESYSTEM_PATH", "./data/workspace"),
    "allowed_code_execution_languages": os.getenv("ALLOWED_CODE_LANGUAGES", "python,javascript,bash").split(","),
}

# 多智能体协作模式
GROUPCHAT_CONFIG = {
    "name": os.getenv("GROUPCHAT_NAME", "问题解决团队"),
    "description": os.getenv("GROUPCHAT_DESCRIPTION", "一个专注于解决复杂问题的多智能体团队"),
    "max_round": int(os.getenv("GROUPCHAT_MAX_ROUND", "15")),
    "admin_name": "user_proxy",
    "speaker_selection_method": os.getenv("SPEAKER_SELECTION", "auto"),  # auto, round_robin, manual
    "allow_parallel_execution": os.getenv("ALLOW_PARALLEL", "false").lower() == "true",
    "enable_memory": os.getenv("ENABLE_MEMORY", "true").lower() == "true",
    "memory_model": os.getenv("MEMORY_MODEL", "default"),  # default, vectorstore, custom
}

# 多框架集成
FRAMEWORK_INTEGRATION = {
    "mode": os.getenv("AGENT_INTEGRATION_MODE", "hybrid"),  # langgraph, autogen, hybrid
    "priority": os.getenv("AGENT_PRIORITY", "autogen"),  # 当mode为hybrid时的优先框架
    "enable_interop": os.getenv("ENABLE_FRAMEWORK_INTEROP", "true").lower() == "true",
    "shared_memory": os.getenv("SHARED_MEMORY", "true").lower() == "true",
}
