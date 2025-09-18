````instructions
# Copilot Instructions for vxture

## 项目概览
- vxture 正在从静态网站迁移到现代化的 Next.js 应用，同时增加智能体集成功能。
- 项目目标：构建一个高性能、可扩展的网站，为未来智能体集成提供基础架构。

## 技术栈
- **前端框架**: Next.js 14+ (App Router)，基于 React 18+
- **样式方案**: Tailwind CSS + 组件库 (建议 Chakra UI 或原生 Tailwind 组件)
- **状态管理**: React Query + Context API
- **后端选项**: 
  - Node.js + Express (JavaScript 全栈)
  - Python + FastAPI (AI/ML 集成优势)
- **数据库**: PostgreSQL + pgvector (向量搜索支持)
- **智能体集成**: LangChain + OpenAI API
- **部署平台**: Vercel (前端) + Railway/Render (后端)

## 项目结构
```
vxture/
├── .github/                # GitHub配置、工作流和说明文件
├── public/                 # 静态资源（从原始 image/ 迁移）
├── src/                    # 源代码目录
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API路由
│   │   │   └── chat/       # 智能体API
│   │   ├── (routes)/       # 页面路由组
│   ├── components/         # 可复用组件
│   ├── lib/                # 工具库
│   │   ├── agents/         # 智能体逻辑
│   ├── hooks/              # 自定义React Hooks
│   └── styles/             # 全局样式
└── ... 其他配置文件
```

## 开发工作流
- **本地开发**: 
  ```bash
  # 安装依赖
  npm install
  # 开发服务器
  npm run dev
  # 构建生产版本
  npm run build
  # 启动生产服务器
  npm start
  ```
- **代码规范**: ESLint + Prettier
- **测试策略**: Jest + React Testing Library
- **版本控制**: Git 分支策略 (feature/fix/release)

## 迁移路线图
1. **阶段1**: 基础框架迁移 (HTML转React组件)
2. **阶段2**: 增强功能与交互体验
3. **阶段3**: 后端和智能体集成
4. **阶段4**: 完善与上线

## 编码约定
- 使用 TypeScript 类型定义，保证代码健壮性
- 遵循组件化原则，构建可复用UI模块
- 保持 React 函数组件和Hooks最佳实践
- 保留原网站的可访问性设计 (ARIA属性等)
- 使用服务端组件 (RSC) 优化首屏加载
- 客户端组件使用"use client"指令标记

## 智能体集成指南
- 使用 API Routes 构建智能体服务端点
- 实现基于 RAG (检索增强生成) 的问答系统
- 考虑添加流式响应支持（SSE/WebSockets）
- 使用向量数据库存储和检索相关内容

## 原始网站参考
- 原静态网站结构保存在项目历史中
- 关键页面设计和内容可参考 `home/index.html`
- 确保新版本保持或改进原有内容的信息架构

---

> 注意：此文档反映项目的规划状态，实际实现可能根据需求和技术评估调整。
> 如需具体实施帮助，可请求生成启动模板或特定组件的迁移代码。
````