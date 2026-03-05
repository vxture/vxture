# CLAUDE.md - Project Guidelines for Claude Code

Claude Code 项目开发规范与协作指南

## 1. 项目概述

### 项目概述

项目名称：Vxture 大模型和智能体服务平台
项目描述：基于 PNPM Monorepo 架构的智能化业务服务平台，提供智能体服务
项目状态：全新开发，持续规划与迭代

### 核心技术栈

- 前端：Next.js 15 + React 19 + TypeScript 5.9 + TailwindCSS 4 + Zustand + TanStack Query
- 后端：FastAPI 0.119 + Uvicorn + PostgreSQL + Redis + JWT + OAuth2 + Bcrypt
- 构建：PNPM 10+ Monorepo
- 运行环境：Node.js 22+，Python 3.13+

### 核心业务模块

#### 平台级应用（apps/）

- 企业官网 (website)
- 运营管理平台 (admin)
- 租户管理平台 (tenant)

#### 业务级应用（business/）

- RuinAgent 智能体应用

#### 后端服务（services/）

- 公共 API 服务 (api)
- 认证服务 (auth)
- 计费服务 (billing)
- 异步任务处理 (workers)

### 重点功能模块

- 支持多语言（i18n）
- 支持多主题
- 消息显示

## 2. 角色与职责

你是本项目专职开发助手，严格遵循以下职责与约束：

### 负责工作

- 高质量代码编写、重构、性能优化
- Bug 修复、问题排查、日志优化
- 业务逻辑实现、接口对接、组件开发
- 代码注释、模块说明、开发文档完善
- 完全遵守本文件所有规范

### 必须遵循原则

#### 1. 端口规范

- 固定端口：前端使用 3000，后端使用 8000
- 端口使用前必须先检查和清理占用

#### 2. 代码复用

- 优先使用项目已有的工具、组件、函数
- 不重复发明轮子

#### 3. 代码风格

- 代码风格必须与项目完全统一
- 严格遵循 CODE_STYLE.md 编码和注释规范

#### 4. 及时沟通

- 对业务逻辑有疑问必须提问，不能靠猜测编写业务逻辑
- 对无法识别的错误必须提问，不能靠猜测排查错误

#### 5. 修改范围限制

- 每次修改限制在一个包内
- 跨包修改必须获得明确同意

#### 6. 分层架构约束

- 严格遵守分层架构原则
- 禁止跨架构分层调用

#### 7. 代码质量保障

- 提交代码前必须执行 lint、type-check 检查
- 确保通过所有代码质量检查

#### 8. 模块设计

- 所有业务模块必须保持高内聚、低耦合
- 每个模块只负责单一职责
- 每个函数不超过200行

#### 9. 文档更新

- 修改代码后必须更新相关文档
- 使用文档前必须检查是否为最新版本

### 严格禁止行为

#### 1. 配置修改禁止

- 禁止擅自修改开发环境配置
- 禁止擅自修改构建脚本
- 禁止擅自修改项目配置文件

#### 2. 依赖管理禁止

- 禁止擅自新增依赖包
- 禁止擅自升级依赖包
- 禁止擅自删除依赖包

#### 3. 禁止越界工作

- 禁止未经统一执行超出任务范围的工作
- 禁止在未要求修改代码的任务中修改代码

#### 4. 不规范代码禁止

- 禁止生成不符合规范的代码
- 禁止生成无法直接运行的代码

#### 5. 注释和类型禁止

- 禁止省略关键注释
- 禁止省略类型定义
- 禁止省略业务说明

#### 6. 架构约束禁止

- 禁止跨架构分层调用
- 禁止破坏项目结构

## 3. 项目结构

本项目采用清晰分层架构，严禁随意修改目录结构。

### 目录说明

```
vxture/
├── packages/apps/ # 平台级应用（通用、面向所有用户）
│ ├── website/ # 企业官网（当前实现）
│ │ ├── public/ # 静态数据（\*.json）
│ │ └── src/ # 前端主项目（Next.js）
│ │ ├── app/ # App Router 路由页面
│ │ ├── presentation/ # 视图层：组件、页面、UI 渲染
│ │ ├── application/ # 应用层：业务逻辑、用例
│ │ ├── domain/ # 领域层：核心业务模型与规则
│ │ ├── infrastructure/ # 基础设施层：API、存储、外部服务
│ │ ├── stores/ # Zustand 全局状态
│ │ └── core/ # 应用核心配置（contexts、theme 等应用特有共享）
│ ├── admin/ # 运营管理平台（待开发）
│ └── tenant/ # 租户管理平台（待开发）
├── packages/business/ # 业务级应用（业务聚焦、面向特定用户）
│ └── ruinagent/ # RuinAgent 智能体应用
├── packages/api/ # 公共 API 服务
│ ├── app/
│ │ ├── main.py # 应用入口
│ │ ├── models/ # 数据模型
│ │ ├── routes/ # API 路由
│ │ └── core/ # 核心配置、中间件
│ ├── start_dev.py # 开发启动脚本
│ └── requirements.txt # 依赖声明
├── packages/services/ # 后端服务（待开发）
│ ├── auth/ # 认证服务（待开发）
│ ├── billing/ # 计费服务（待开发）
│ └── workers/ # 异步任务处理（待开发）
├── packages/design-system/ # 设计系统
├── packages/shared/ # 共享包
│ ├── types/ # TypeScript 类型
│ ├── utils/ # 工具函数
│ └── constants/ # 常量定义
├── docs/ # 项目文档
└── 自动生成目录（禁止修改）
node_modules/、dist/、build/、.git/
```

## 4. Git 提交规范

### 提交格式

#### 描述要求

添加type: 简要描述（英文/中文均可，保持简洁）

#### 类型说明

- feat：新功能
- fix：修复问题
- refactor：重构（不影响功能）
- docs：文档更新
- style：格式调整（不改变逻辑）
- test：测试用例
- chore：构建/工具/依赖相关

#### 提交要求

- 一个提交只包含一个功能或修复
- 提交前必须通过代码检查
- 描述清晰，便于回溯

## 5. 测试要求

- 必须编写单元测试
- 测试文件统一放在 tests/ 目录
- 测试命令
  - 全部：pnpm test
  - 前端：pnpm --filter website test
  - 后端：pnpm --filter api test
- 代码覆盖率要求 > 80%
- 核心业务逻辑必须覆盖测试用例

## 6. 开发命令

### 开发服务

- pnpm dev # 前端开发环境（端口 3000）
- pnpm dev:api # 后端开发环境（端口 8000）
- pnpm start # 同时启动前后端

### 构建

- pnpm build # 前端构建
- pnpm build:api # 后端构建
- pnpm build:all # 全项目构建

### 代码质量

- pnpm lint # 代码检查
- pnpm lint:fix # 自动修复
- pnpm type-check # TS 类型检查

### 测试

- pnpm test # 运行全部测试（--recursive test）
- pnpm --filter website test # 前端测试
- pnpm --filter api test # 后端测试
- pnpm test:coverage # 测试覆盖率（--recursive test:coverage）

### 数据库

- pnpm db:migrate # 数据库迁移
- pnpm db:reset # 重置数据库
- pnpm db:seed # 初始化测试数据

### 维护

- pnpm clean # 清理构建文件
- pnpm reset # 完全重置项目
- pnpm health # 项目健康检查
