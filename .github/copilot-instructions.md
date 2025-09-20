# Copilot Instructions for vxture

目标：让 AI 编码助手快速上手 `vxture` 项目并能给出高质量、可执行的代码改动建议。

简要架构（大局观）：

- **前端（Next.js 14+）**: 位于 `src/`，使用 App Router。主要入口：`src/app/page.tsx`。
- **后端（FastAPI）**: 位于 `backend/app/`，主入口 `backend/app/main.py`。
- **数据/向量存储**: 存放于 `backend/data/vectorstore`（项目约定，参考 `backend/data/` 目录）。

常见开发工作流：

- 启动前端开发服务器：`npm run dev`（仓库根目录）。
- 前端类型检查：`npm run type-check`。
- 后端本地运行（PowerShell）：

```powershell
cd backend
python -m venv venv; .\venv\Scripts\Activate; pip install -r requirements.txt; python app/main.py
```

项目特有约定：

- 所有 API 响应通过 `ApiResponseHandler`（文件：`src/lib/utils/apiResponse.ts`）封装，请在修改 API 时使用该处理器以保证统一响应格式。
- 聊天/智能体功能已从本仓库移除；如需实现，请在独立服务或仓库中维护运行时与依赖，通过明确的 HTTP API 与本项目对接，不要在仓库中托管模型权重或敏感凭据。
- 客户端组件请遵循仓库约定；需要在客户端运行的组件请在文件顶部声明 `'use client'`。

调试提示：

- 后端运行失败时，先检查 `backend/requirements.txt` 并确保依赖已正确安装。

首要打开文件：

- `src/lib/utils/apiResponse.ts`
- `src/app/page.tsx`
- `backend/app/main.py`
- `src/types/`

如果不确定如何修改，请先在仓库中搜索 `ApiResponseHandler` 等关键字以查看现有用例。
