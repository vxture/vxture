from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
import json
import uvicorn
import logging
from dotenv import load_dotenv

# 导入LangGraph代理
try:
    from app.agents.langgraph.simple_agent import process_chat_request
except ImportError:
    # 开发阶段可能尚未实现
    def process_chat_request(messages):
        return {
            "response": {"role": "assistant", "content": "LangGraph代理尚未实现或无法加载"},
            "conversation_id": "mock-id"
        }

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# 创建应用
app = FastAPI(
    title="Vxture 智能代理 API",
    description="用于处理与LangGraph智能代理的交互的API服务",
    version="0.1.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境中应该更具体
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 定义数据模型
class ChatMessage(BaseModel):
    role: str  # user, assistant, system
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    conversation_id: Optional[str] = None
    options: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: ChatMessage
    conversation_id: str
    metadata: Optional[Dict[str, Any]] = None

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "vxture-agent-api"}

# 聊天API
@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        logger.info(f"Received chat request with {len(request.messages)} messages")

        # 转换消息格式
        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        # 处理请求
        result = process_chat_request(messages)

        return ChatResponse(
            response=ChatMessage(
                role=result["response"]["role"],
                content=result["response"]["content"]
            ),
            conversation_id=result.get("conversation_id", "default-id"),
            metadata=result.get("metadata", {})
        )
    except Exception as e:
        logger.error(f"Error processing chat request: {str(e)}")
        raise HTTPException(status_code=500, detail=f"处理请求时出错: {str(e)}")

# 主入口
if __name__ == "__main__":
    # 获取端口配置（默认8000）
    port = int(os.getenv("API_PORT", 8000))
    # 运行服务器
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
