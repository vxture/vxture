# Copilot Instructions for vxture

目标：让 AI 编码助手快速上手 `vxture` 项目并能给出高质量、可执行的代码改动建议。

简要架构（大局观）：

- **前端（Next.js 14+）**: 位于 `src/`，使用 App Router。主要入口：`src/app/page.tsx`、`src/app/api/chat/route.ts`（edge runtime）。
- **后端（FastAPI）**: 位于 `backend/app/`，主入口 `backend/app/main.py`。智能体实现放在 `backend/app/agents/`，其中 `langgraph/` 为主要实现，`autogen/` 为备选。
- **数据/向量存储**: 存放于 `backend/data/vectorstore`（项目约定，参考 `backend/data/` 目录）。

关键工作流与命令：

- 启动前端开发：`npm run dev`（workspace 根目录）。
- 前端类型检查：`npm run type-check`。
- 后端开发：在 `backend/` 中创建并激活虚拟环境，`pip install -r requirements.txt`，运行 `python app/main.py`（或 `uvicorn main:app --reload`）。

项目特有约定与样例：

- 所有 API 响应通过 `src/lib/utils/apiResponse.ts` 的 `ApiResponseHandler` 封装；修改 API 时请使用该处理器以保证统一响应格式。
- 前后端共享消息类型定义：`src/types/chat.ts`（role/content/ChatRequest/ChatResponse）。对话消息采用标准 OpenAI 风格 `{role, content}`。
- 前端客户端组件必须声明 `'use client'`（例如 `src/components/features/chat/ChatClient.tsx`）。
- 前端到后端的 chat 路由：`/api/chat`（前端会调用 `src/app/api/chat/route.ts`，该路由当前为 edge 并用 mock 回应；真实代理在后端 FastAPI 服务 `/api/chat`）。

智能体与扩展点：

- 主要智能体实现：`backend/app/agents/langgraph/simple_agent.py`，包含 `process_chat_request(messages)`，返回 `{ response, conversation_id }`。
- 如果 `langgraph` 无法加载，`backend/app/main.py` 中会回退到一个 mock `process_chat_request`，注意不要删除该回退逻辑，便于本地开发。
- 新增或修改工具（agent tools）时，请在 `backend/app/agents/tools/implementation.py` 中添加并在 `langgraph` 节点处通过 `ToolExecutor` 引用。

调试与测试提示：

- 前端开发时，若想连接本地后端，确保 `src/app/api/chat/route.ts` 指向正确的后端地址或直接在前端调用后端地址（CORS 已在后端允许所有来源，见 `backend/app/main.py`）。
- 后端运行失败时，先检查 `backend/requirements.txt` 并确保 `langgraph` / `langchain` / `openai` 等依赖已正确安装与版本匹配。

修改提交风格与审阅提示：

- 保持改变的范围小且可测试：修改智能体行为时，包含一个能够快速运行的示例调用（例如在 `backend/scripts/test_agents.py` 中）。
- 更新类型定义（`src/types/`）时，同时更新前端和后端对应 Pydantic/TypeScript 定义以保持一致。

快速文件参考（常用位置）：

- 前端 API handler: `src/app/api/chat/route.ts`
- 前端 chat UI: `src/components/features/chat/ChatClient.tsx`
- API 响应封装: `src/lib/utils/apiResponse.ts`
- 类型定义: `src/types/chat.ts`
- 后端入口: `backend/app/main.py`
- 主智能体: `backend/app/agents/langgraph/simple_agent.py`
- Agent 工具: `backend/app/agents/tools/implementation.py`

当你不确定：请先搜索并复用现有模式（例如 `ApiResponseHandler` 与 `ChatMessage` 类型），避免引入新的跨切面约定。对大型变更，先生成 PR 草案与测试用例。

若需扩展：我可以把这份指导精简或扩展为多语言版本、补充常见 PR 模板与 CI 步骤。想要我现在调整哪部分？

# Copilot Instructions for vxture

## 项目概览

- vxture 是一个基于 Next.js 14+ 的现代化网站，集成了智能代理功能
- 项目从静态网站迁移到现代化的 Next.js 应用，同时增加了智能体集成功能
- 项目目标：构建一个高性能、可扩展的网站，为未来智能体集成提供基础架构

## 技术栈

### 前端

- **框架**: Next.js 14+ (App Router)，React 18+，TypeScript
- **样式方案**: Tailwind CSS + SCSS
- **状态管理**: TanStack React Query + Context API
- **类型验证**: Zod

### 后端

- **主要后端**: Python + FastAPI
- **智能体集成**:
  - LangGraph（基于图的智能体工作流）
  - AutoGen（可选的多智能体框架）
  - 使用 OpenAI API 和 Anthropic 模型
- **数据库**: PostgreSQL + pgvector（向量存储支持）
- **缓存**: Redis（用于会话状态和任务队列）

## 项目结构

```
vxture/
├── src/                    # 前端源代码
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API路由
│   │   │   └── chat/       # 智能体API端点
│   │   ├── (features)/     # 页面路由组（按功能划分）
│   ├── components/         # 可复用组件
│   │   ├── common/         # 通用组件
│   │   ├── features/       # 功能特定组件
│   │   ├── layout/         # 布局组件
│   │   └── ui/             # UI原子组件
│   ├── lib/                # 工具库
│   │   ├── contexts/       # React上下文
│   │   ├── hooks/          # 自定义Hooks
│   │   └── utils/          # 通用工具函数
│   ├── styles/             # 全局样式
│   └── types/              # TypeScript类型定义
├── backend/                # 后端源代码
│   ├── app/                # FastAPI应用
│   │   ├── agents/         # 智能代理逻辑
│   │   │   ├── langgraph/  # LangGraph框架实现
│   │   │   ├── autogen/    # AutoGen框架实现
│   │   │   └── tools/      # 代理工具实现
│   │   ├── api/            # API路由
│   │   ├── core/           # 核心配置
│   │   ├── db/             # 数据库连接
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # Pydantic模式
│   │   ├── services/       # 业务服务
│   │   └── utils/          # 工具函数
│   ├── data/               # 数据相关文件
│   │   ├── vectorstore/    # 向量存储
│   │   └── workspace/      # 代理工作区
│   ├── logs/               # 日志文件
│   ├── scripts/            # 实用脚本
│   └── tests/              # 测试文件
├── public/                 # 静态资源
└── docs/                   # 项目文档
```

## 关键设计模式和约定

### 前端开发

1. **App Router结构**: 使用 Next.js App Router 架构，按功能组织代码，`src/app/(features)/` 下每个子目录对应一个主要功能区域
2. **统一API响应**: 所有API响应使用 `ApiResponseHandler` 封装，确保一致的错误处理和格式化
   ```typescript
   // src/lib/utils/apiResponse.ts
   return ApiResponseHandler.success(data);
   // 错误处理
   return ApiResponseHandler.handleError(error);
   ```
3. **类型定义集中化**: 类型定义集中在 `src/types/` 目录，为前后端通信提供一致的类型接口
4. **客户端组件标记**: 所有客户端组件必须使用 `'use client'` 指令，例如:

   ```typescript
   // src/components/features/chat/ChatClient.tsx
   'use client';

   export default function ChatClient() {...}
   ```

5. **组件分层**: 组件按照功能和复用性进行分层，从通用UI组件到特定功能组件

### 后端开发

1. **FastAPI应用**: 使用 FastAPI 构建 RESTful API，主入口为 `backend/app/main.py`
2. **智能代理双模式架构**:
   - LangGraph: `backend/app/agents/langgraph/` - 基于图的工作流实现，推荐主要使用方式
   - AutoGen: `backend/app/agents/autogen/` - 多智能体协作实现，作为备选方案
3. **工具函数扩展性**: 智能体工具封装在 `backend/app/agents/tools/implementation.py` 中，采用模块化设计

### 数据流程

1. **前端请求流**:
   - 用户输入 → ChatClient组件 → /api/chat API路由 → 后端LangGraph代理 → 响应展示
2. **后端处理流**:
   - API请求 → FastAPI路由 → process_chat_request函数 → LangGraph工作流 → 响应返回

### 智能体集成

1. 前端通过 `/api/chat` 路由与后端通信（见 `src/app/api/chat/route.ts`）
2. 后端使用 LangGraph 处理复杂的智能体工作流（见 `backend/app/agents/langgraph/simple_agent.py`）
3. 消息格式遵循 OpenAI 标准格式：`{ role, content }`

## 开发工作流

### 前端开发

```bash
# 安装依赖
npm install
# 启动开发服务器
npm run dev
# 代码格式化
npm run format
# 类型检查
npm run type-check
# 代码规范检查
npm run lint
# 完整检查（lint + type-check + format）
npm run check
# 修复所有问题
npm run fix
```

### 后端开发

```bash
# 进入后端目录
cd backend
# 创建并激活虚拟环境
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac
# 安装依赖
pip install -r requirements.txt
# 启动后端服务器
python app/main.py
# 运行测试
python -m pytest tests/
# 运行综合测试
python scripts/run_comprehensive_tests.py
```

## 关键集成点

1. **前端-后端通信**: 通过 `/api/chat` 路由处理智能体请求，负责将用户消息转发到后端

   ```typescript
   // src/app/api/chat/route.ts 示例
   const response = await fetch('http://localhost:8000/chat', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(reqBody),
   });
   ```

2. **智能体工作流**: `process_chat_request` 函数（`backend/app/agents/langgraph/simple_agent.py`）处理聊天请求

   ```python
   # 核心处理流程示例
   def process_chat_request(messages: List[Dict[str, str]]):
       graph = create_agent_graph()
       state = {"messages": messages}
       result = graph.invoke(state)
       return {
           "response": result["messages"][-1],
           "conversation_id": "langgraph-" + str(hash(str(messages)))
       }
   ```

3. **类型共享**: 前后端共享相同的消息结构，确保类型安全

   ```typescript
   // 前端 src/types/chat.ts
   export interface ChatMessage {
     role: 'user' | 'assistant' | 'system';
     content: string;
   }

   // 后端 app/main.py 中对应
   class ChatMessage(BaseModel):
       role: str  # user, assistant, system
       content: str
   ```

## 注意事项

- **环境变量配置**: 前端使用 `.env.local`，后端使用 `.env`，确保正确配置API密钥
- **模块化开发**: 按照功能模块组织代码，在前后端保持一致的命名和结构
- **测试先行**: 为新功能添加测试，可使用 `scripts/` 目录中的测试工具
- **代码风格**: 使用项目配置的linter和formatter保持一致的代码风格
- **智能体实现**: 当前以LangGraph为主要实现，但保留了AutoGen的扩展支持

## 常见问题解决

- **前端开发服务器端口冲突**: 修改 `package.json` 中的 `dev` 脚本，添加 `--port=3001` 参数
- **后端API连接问题**: 检查 `src/app/api/chat/route.ts` 中的API端点URL是否与后端一致
- **智能体集成错误**: 验证 `backend/app/agents/langgraph/simple_agent.py` 中的LLM配置是否正确

---

> 此文档反映当前项目状态，开发过程中会随着项目演进而更新。
