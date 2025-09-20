# Vxture 技术栈

以下为项目主要技术栈与关键路径的简要说明，供维护者与新贡献者参考。

## 核心技术

- 前端框架: Next.js (App Router, 14+)
- 语言与类型: TypeScript + React 18+
- 样式: Tailwind CSS
- 后端: Python + FastAPI
- 数据库: PostgreSQL（可选 pgvector 用于向量检索）
- 缓存/队列: Redis（按需）
- 向量存储: 项目约定目录 `backend/data/vectorstore`（可配 Chroma/Qdrant/FAISS 等）
- 认证/安全: python-jose, passlib 等（见 `requirements.txt`）
- 开发工具链: npm, ESLint, Prettier, TypeScript
- 测试: pytest / pytest-asyncio

## 运行与部署

- 本地开发：前端 `npm run dev`，后端可使用 `uvicorn main:app --reload` 或 `python app/main.py`。
- 推荐部署平台：Vercel（前端）、Railway/Render（后端）。

## 关键路径

- 前端入口：`src/app/page.tsx`
- 后端入口：`backend/app/main.py`
- API 响应处理：`src/lib/utils/apiResponse.ts`
- 向量数据约定：`backend/data/vectorstore`
