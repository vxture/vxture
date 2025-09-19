# Vxture 项目

Vxture 是一个基于 Next.js 14+ 的现代化网站，集成了智能代理功能。

## 技术栈

- **前端**: Next.js 14+ (App Router)，React 18+，TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Query + Context API
- **后端**: Python + FastAPI
- **数据库**: PostgreSQL + pgvector
- **智能代理**: LangGraph + AutoGen + OpenAI API
- **部署**: Vercel (前端) + Railway/Render (后端)

## 开始使用

### 前端开发

1. 安装依赖:

   ```bash
   npm install
   ```

2. 设置环境变量:

   ```bash
   cp .env.example .env.local
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

   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows
   ```

3. 安装依赖:

   ```bash
   pip install -r requirements.txt
   ```

4. 设置环境变量:

   ```bash
   cp .env.example .env
   # 编辑 .env 文件，添加必要的配置
   ```

5. 启动后端服务器:
   ```bash
   python app/main.py
   ```

## 项目结构

```
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
│   │   ├── agents/         # 智能代理逻辑
│   │   │   ├── langgraph/  # LangGraph框架
│   │   │   └── autogen/    # AutoGen框架
│   │   ├── api/            # API端点
│   └── data/               # 数据相关文件
├── public/                 # 静态资源
└── docs/                   # 文档
```

## 智能代理架构

### LangGraph

LangGraph是一个基于图的智能体框架，提供高度可控的处理流程：

- **强大的图结构**: 基于有向图的控制流，支持条件分支、循环和复杂决策
- **状态管理**: 内置状态持久化，支持长时运行的会话和断点恢复
- **工具集成**: 简单易用的工具接口，支持外部系统和数据源集成
- **可视化**: 图结构可视化，方便调试和监控

### AutoGen

AutoGen是一个多智能体框架，专注于智能体之间的协作：

- **多智能体群聊**: 支持多个角色智能体在群聊中协作解决问题
- **角色专业化**: 每个智能体可以扮演特定角色（编码、规划、批评等）
- **自主决策**: 智能体可以自主决定何时使用工具或请求帮助
- **记忆和反思**: 支持长期记忆和对之前决策的反思与改进

### 混合架构优势

Vxture采用LangGraph和AutoGen的混合架构，结合两者优势：

- LangGraph负责严格控制流程和状态管理
- AutoGen负责灵活的多智能体协作
- 两个框架可以无缝集成或独立运行
- 根据任务复杂度自动选择最合适的框架

## API接口

智能代理系统提供以下API端点：

- `/api/chat`: 基础聊天功能，支持单轮和多轮对话
- `/api/agent/langgraph`: LangGraph专用端点，支持图结构处理流程
- `/api/agent/autogen`: AutoGen专用端点，支持多智能体协作
- `/api/agent/hybrid`: 混合模式端点，自动选择最合适的框架

### LangGraph 代理架构

项目采用 LangGraph 框架构建智能代理，具有以下特点：

- 基于图的代理控制流
- 支持多种LLM提供商（OpenAI, Azure, Anthropic等）
- 检索增强生成 (RAG) 能力
- 工具使用与外部系统集成

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

### 混合使用示例

```tsx
// 混合使用示例
function Card() {
  return (
    <div className="custom-card">
      <div className="custom-card__header">
        <h3 className="text-xl font-bold text-primary">卡片标题</h3>
      </div>
      <div className="custom-card__body flex flex-col gap-4">
        <p className="text-gray-600">使用Tailwind的文本和间距类</p>
        <button className="btn btn--primary mt-2">使用SCSS类</button>
        <button className="bg-secondary text-white px-4 py-2 rounded hover:bg-opacity-90">
          纯Tailwind按钮
        </button>
      </div>
    </div>
  );
}
```

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)
