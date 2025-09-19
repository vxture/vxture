# vxture 项目简介

vxture 正在从静态网站迁移为现代化的 Next.js 应用，集成智能体功能，目标是打造高性能、可扩展的智能网站基础架构。

## 技术栈

- **前端**：Next.js 14+ (App Router)，React 18+
- **样式**：Tailwind CSS，推荐 Chakra UI 或原生组件
- **状态管理**：React Query + Context API
- **后端**：Node.js + Express 或 Python + FastAPI
- **数据库**：PostgreSQL + pgvector（支持向量搜索）
- **智能体集成**：LangChain + OpenAI API
- **部署**：Vercel（前端），Railway/Render（后端）

## 目录结构

```
vxture/
├── .github/                # GitHub 配置与文档
├── public/                 # 静态资源
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API 路由
│   │   │   └── chat/       # 智能体 API
│   │   ├── (routes)/       # 页面路由组
│   ├── components/         # 可复用组件
│   ├── lib/                # 工具库
│   │   ├── agents/         # 智能体逻辑
│   ├── hooks/              # 自定义 Hooks
│   └── styles/             # 全局样式
└── ... 其他配置文件
```

## 开发指南

1. 安装依赖
   ```bash
   npm install
   ```
2. 启动开发服务器
   ```bash
   npm run dev
   ```
3. 构建生产版本
   ```bash
   npm run build
   ```
4. 启动生产服务器
   ```bash
   npm start
   ```

## 迁移路线图

1. 基础框架迁移（HTML 转 React 组件）
2. 增强功能与交互体验
3. 后端与智能体集成
4. 完善与上线

## 编码约定

- 全面使用 TypeScript
- 组件化开发，保持可访问性
- 服务端组件优化首屏加载，客户端组件加 `"use client"`
- 遵循 ESLint + Prettier 规范
- 测试覆盖：Jest + React Testing Library

## 智能体集成

- API Routes 实现智能体服务端点
- 支持 RAG 问答、流式响应
- 使用向量数据库提升检索能力

---

> 如需启动模板或组件迁移代码，请提出具体需求。
