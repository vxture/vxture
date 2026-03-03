# CLAUDE.md - Project Guidelines for Claude Code

Claude Code 项目开发规范与协作指南

## 1. Project Overview

### 项目概述

项目名称：Vxture 智能云服务平台
项目描述：基于 PNPM Monorepo 架构的人工智能业务云服务平台，提供智能体服务
项目状态：全新开发，持续规划与迭代

### 核心技术栈

- 前端：Next.js 15 + React 19 + TypeScript 5.9 + TailwindCSS 4 + Zustand
- 后端：FastAPI 0.119 + Python 3.13 + PostgreSQL + Redis
- 构建：PNPM 10+ Monorepo
- 运行环境：Node.js 22+，Python 3.13+

### 核心业务模块

- 企业官网
- 运营平台
- 租户平台
- 账户系统
- 权限管理
- 订阅授权
- 工单系统
- 系统监测
- 智能体服务
- 大模型接入

### 重点功能模块

- 支持多语言（i18n）
- 支持多主题
- 消息显示

## 2. Role & Responsibilities

你是本项目专职开发助手，严格遵循以下职责与约束：

### 负责工作

- 高质量代码编写、重构、性能优化
- Bug 修复、问题排查、日志优化
- 业务逻辑实现、接口对接、组件开发
- 代码注释、模块说明、开发文档完善
- 完全遵守本文件所有规范

### 严格禁止行为

- 禁止擅自修改开发环境配置、构建脚本、配置文件
- 禁止擅自新增/升级/删除依赖包
- 禁止超出任务范围扩展功能、修改无关代码
- 禁止生成不符合规范、无法直接运行的代码
- 禁止省略关键注释、类型定义、业务说明
- 禁止跨架构分层调用、破坏项目结构
- 任何不确定的逻辑必须提问，禁止猜测实现

### Important Notes

- 固定端口：前端 3000，后端 8000，端口使用前必须先检查和清理
- 优先复用现有工具、组件、函数，不重复造轮子
- 代码风格必须与项目完全统一
- 有疑问必须提问，严禁猜测业务逻辑，严禁反复测试，最多自行测试三次
- 输出代码必须可直接运行、可直接提交
- 严格遵守分层架构，禁止跨层调用
- 提交代码前必须执行 lint、type-check 检查
- 所有业务模块必须保持高内聚、低耦合

## 3. Coding Standards

### 通用规范

- 严格遵循项目 [CODE_STYLE.md](CODE_STYLE.md) 代码风格
- 代码必须通过 lint、type-check 检查
- 所有模块必须保持单一职责
- 所有icon来自react-icons库

### 前端规范 (Next.js + React + TS)

- 缩进：2 空格
- 文件命名：kebab-case（例：user-login-form.tsx）
- 组件命名：PascalCase（例：UserLoginForm.tsx）
- 必须使用 TypeScript，禁止使用 any 类型
- 状态管理统一使用 Zustand
- 样式仅使用 TailwindCSS 4
- 页面统一存放于 app/ 目录（App Router）

### 后端规范 (FastAPI + Python)

- 遵循 PEP8 规范
- 缩进：4 空格
- 函数与接口必须编写 docstring 注释
- 数据模型、请求/响应体必须明确定义
- 异常统一处理，日志标准化

## 4. Project Structure

本项目采用清晰分层架构，严禁随意修改目录结构。

### 目录说明

vxture/
├── packages/web/public/ # 静态数据（*.json）
├── packages/web/src/ # 前端主项目（Next.js）
│ ├── app/ # App Router 路由页面
│ ├── presentation/ # 视图层：组件、页面、UI 渲染
│ ├── application/ # 应用层：业务逻辑、用例
│ ├── domain/ # 领域层：核心业务模型与规则
│ ├── infrastructure/ # 基础设施层：API、存储、外部服务
│ ├── stores/ # Zustand 全局状态
│ └── shared/ # 共享工具、常量、类型
├── packages/api/ # 后端服务（FastAPI）
│ ├── app/
│ │ ├── main.py # 应用入口
│ │ ├── models/ # 数据模型
│ │ ├── routes/ # API 路由
│ │ └── core/ # 核心配置、中间件
│ ├── start_dev.py # 开发启动脚本
│ └── requirements.txt # 依赖声明
├── docs/ # 项目文档
└── 自动生成目录（禁止修改）
node_modules/、dist/、build/、.git/

### 架构分层原则（必须遵守）

- presentation → application → domain ← infrastructure
- 禁止跨层调用，禁止领域层依赖外部服务。

## 5. Git & Commit Rules

### Commit 格式

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

## 6. Testing Requirements

- 必须编写单元测试
- 测试文件统一放在 tests/ 目录
- 测试命令
  - 前端：pnpm test:web
  - 后端：pnpm test:api
- 代码覆盖率要求 > 80%
- 核心业务逻辑必须覆盖测试用例

## 7. Development Commands

### 开发服务

pnpm dev # 前端开发环境（端口 3000）
pnpm dev:api # 后端开发环境（端口 8000）
pnpm start # 同时启动前后端

### 构建

pnpm build # 前端构建
pnpm build:api # 后端构建
pnpm build:all # 全项目构建

### 代码质量

pnpm lint # 代码检查
pnpm lint:fix # 自动修复
pnpm type-check # TS 类型检查

### 测试

pnpm test # 运行全部测试
pnpm test:web # 前端测试
pnpm test:api # 后端测试
pnpm test:coverage # 测试覆盖率

### 数据库

pnpm db:migrate # 数据库迁移
pnpm db:reset # 重置数据库
pnpm db:seed # 初始化测试数据

### 维护

pnpm clean # 清理构建文件
pnpm reset # 完全重置项目
pnpm health # 项目健康检查
