# Vxture 项目

Vxture 是一个基于 Next.js 14+ 的现代化平台网站。本仓库专注于官方网站和平台功能；聊天/智能体功能（LLM/agents）不在本仓库运行或托管。如需集成，请在独立仓库或服务中实现并通过 HTTP API 与本项目后端对接。

## 技术栈

- **前端**: Next.js 14+ (App Router)，React 18+，TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Query + Context API
- **后端**: Python + FastAPI
- **数据库**: PostgreSQL + pgvector
- **部署**: Vercel (前端) + Railway/Render (后端)

## 开始使用

### 前端开发

1. 安装依赖:

   ```bash
   npm install
   ```

2. 设置环境变量:

   ```powershell
   Copy-Item .env.example .env.local
   # 编辑 .env.local 文件，添加必要的配置
   ```

3. 启动开发服务器:

   ```bash
   npm run dev
   ```

4. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

### 后端开发

1. 进入后端目录:

   ```bash
   cd backend
   ```

2. 创建虚拟环境:

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate
   ```

3. 安装依赖:

   ```bash
   pip install -r requirements.txt
   ```

4. 设置环境变量:

   ```powershell
   Copy-Item .env.example .env
   # 编辑 .env 文件，添加必要的配置
   ```

5. 启动后端服务器:

   ```powershell
   python app/main.py
   ```

## 项目结构

```text
vxture/
├── src/                    # 前端源代码
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API路由
│   │   ├── (features)/     # 页面路由组
│   ├── components/         # 可复用组件
│   ├── lib/                # 工具库
│   ├── styles/             # 全局样式
│   └── types/              # TypeScript类型定义
├── backend/                # 后端源代码
│   ├── app/                # FastAPI应用
│   │   ├── api/            # API端点
│   └── data/               # 数据相关文件
├── public/                 # 静态资源
└── docs/                   # 文档
```

## 说明

本仓库专注于平台与官方网站功能。若需要额外的扩展或集成，请在独立仓库中维护并通过明确的 API 与平台集成。

## 样式指南

### 何时使用SCSS

- 复杂动画和过渡效果
- 需要嵌套选择器的复杂组件
- 全局样式和重置
- 主题相关的颜色方案
- 需要SCSS函数和混合的场景

### 何时使用Tailwind

- 布局和间距调整
- 简单的颜色应用
- 响应式设计调整
- 快速原型设计
- 小型UI调整

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
