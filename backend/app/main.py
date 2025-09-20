from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import os
import json
import uvicorn
import logging
from dotenv import load_dotenv

# Platform backend entry point.

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

# 创建应用
app = FastAPI(
    title="Vxture Platform API",
    description="平台后端服务",
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

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "vxture-platform-api"}

# 主入口
if __name__ == "__main__":
    # 获取端口配置（默认8000）
    port = int(os.getenv("API_PORT", 8000))
    # 运行服务器
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
