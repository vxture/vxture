"""
AutoGen多智能体协作示例
展示如何使用AutoGen框架配置多智能体群聊
"""

import os
import json
import logging
from typing import Dict, List, Any, Optional
import autogen
from autogen.agentchat.groupchat import GroupChat, GroupChatManager
from ..autogen_config import AUTOGEN_CONFIG, AGENT_ROLES, GROUPCHAT_CONFIG

# 初始化日志
logger = logging.getLogger("autogen.example")

def create_llm_config():
    """创建LLM配置"""
    return {
        "config_list": AUTOGEN_CONFIG["llm_config"]["config_list"],
        "temperature": AUTOGEN_CONFIG["llm_config"]["temperature"],
        "timeout": AUTOGEN_CONFIG["llm_config"]["timeout"],
        "cache_seed": 42 if AUTOGEN_CONFIG["llm_config"]["use_cache"] else None,
    }

def create_agent_by_role(role_name: str):
    """根据角色名称创建智能体"""
    # 查找角色配置
    role_config = next((role for role in AGENT_ROLES if role["name"] == role_name), None)
    if not role_config:
        raise ValueError(f"未找到角色配置: {role_name}")

    # 创建LLM配置
    llm_config = create_llm_config()

    # 根据角色类型创建智能体
    if role_config["type"] == "user_proxy":
        return autogen.UserProxyAgent(
            name=role_config["name"],
            system_message=role_config["system_message"],
            human_input_mode=role_config.get("human_input_mode", "NEVER"),
            code_execution_config={"use_docker": False} if "coder" in role_name else None,
        )
    else:
        return autogen.AssistantAgent(
            name=role_config["name"],
            system_message=role_config["system_message"],
            llm_config=llm_config,
        )

def setup_multi_agent_system(agents_to_include=None):
    """设置多智能体系统"""
    # 确定要包含的智能体
    if agents_to_include is None:
        # 默认包含用户代理、助手和规划者
        agents_to_include = ["user_proxy", "assistant", "planner"]

    # 创建智能体
    agents = {}
    for role_name in agents_to_include:
        agents[role_name] = create_agent_by_role(role_name)

    # 创建群聊
    groupchat = GroupChat(
        agents=list(agents.values()),
        messages=[],
        max_round=GROUPCHAT_CONFIG["max_round"],
        speaker_selection_method=GROUPCHAT_CONFIG["speaker_selection_method"],
        allow_parallel_execution=GROUPCHAT_CONFIG["allow_parallel_execution"],
    )

    # 创建群聊管理器
    manager = GroupChatManager(
        groupchat=groupchat,
        llm_config=create_llm_config(),
    )

    return {
        "agents": agents,
        "groupchat": groupchat,
        "manager": manager,
    }

def run_task_solving_agents(task_description, agents_to_include=None):
    """运行任务解决智能体"""
    # 设置多智能体系统
    system = setup_multi_agent_system(agents_to_include)
    agents = system["agents"]
    manager = system["manager"]

    # 获取用户代理
    user_proxy = agents["user_proxy"]

    # 启动对话
    user_proxy.initiate_chat(
        manager,
        message=task_description,
    )

    # 返回对话历史
    return user_proxy.chat_messages[manager]

def create_project_planning_team():
    """创建项目规划团队"""
    return setup_multi_agent_system([
        "user_proxy", "product_manager", "planner", "coder", "critic"
    ])

def create_research_team():
    """创建研究团队"""
    return setup_multi_agent_system([
        "user_proxy", "researcher", "assistant", "critic"
    ])

def create_coding_team():
    """创建编码团队"""
    return setup_multi_agent_system([
        "user_proxy", "coder", "assistant", "critic"
    ])

# 示例使用
if __name__ == "__main__":
    # 启用AutoGen调试日志
    logging.basicConfig(level=logging.INFO)

    # 运行简单任务
    result = run_task_solving_agents(
        "设计一个简单的网站结构，包括首页、产品页和联系页。"
    )

    print("对话完成！")
