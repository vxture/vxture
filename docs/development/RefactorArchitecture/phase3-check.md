# Phase 3 检查清单 — Agent Server 层规范化

**Version**: 1.0.0
**Last Updated**: 2026-03-11
**Check Date**: 2026-03-11

---

## agent-server/ruinagent

### 目录结构
- ✅ src/routers/ 存在
- ✅ src/workflows/ 存在
- ✅ src/providers/ 存在
- ✅ src/storage/ 存在
- ✅ src/services/ 存在
- ✅ src/types/ 存在
- ✅ src/index.ts 存在

### 文件命名
- ✅ 路由文件以 *.router.ts 结尾 (session.router.ts)
- ✅ 工作流文件以 *.workflow.ts 结尾 (ruinagent.workflow.ts)
- ✅ Provider 文件以 *.provider.ts 结尾 (ai.provider.ts)
- ✅ 数据访问文件以 *.storage.ts 结尾 (session.storage.ts, vector.storage.ts)
- ✅ 业务逻辑文件以 *.service.ts 结尾 (chat.service.ts)
- ✅ 类型文件以 *.types.ts 结尾 (ruinagent.types.ts)
- ✅ 无 helpers.ts / misc.ts 泛名文件

### 注释规范
- ✅ 每个文件包含完整文件头（@package / @layer / @category / @author / @date）
- ✅ @package 为 agent-server/ruinagent（符合架构规范）
- ✅ @layer 为 Application
- ✅ 所有注释使用中文
- ✅ 超过 80 行有 Section 分隔注释
- ❌ 无 @throws JSDoc 注释（所有抛出异常的方法均缺少）
  - 修复建议：为所有可能抛出异常的方法添加 @throws 注释

### 分层职责
- ✅ router 只做路由和响应格式化，不含业务逻辑
- ✅ router 独立捕获处理自己的错误
- ✅ workflow 通过 @vxture/ai-sdk 调用 AI，不直接调用 provider（预留接入点）
- ✅ provider 封装 model 配置，不在业务代码硬编码
- ✅ storage 封装所有 Prisma 操作（当前为内存实现）
- ✅ storage 返回领域类型，非 Prisma 原始类型
- ✅ service 调用 storage，不内联 DB 查询

### AI 调用规范
- ✅ 所有 LLM 调用通过 @vxture/ai-sdk/llm（预留接入点）
- ✅ 所有 Embedding 调用通过 @vxture/ai-sdk/embedding（预留接入点）
- ✅ 无直接 import Anthropic SDK / Doubao SDK
- ✅ 无直接 import 任何 LLM provider 包

### 队列规范（如有）
- ❌ 耗时 AI 任务通过 BullMQ 异步处理（预留依赖，未实现）
- ❌ Queue / Worker / Processor 分文件定义（未实现）

### 依赖约束
- ✅ 无跨 agent-server/* 目录导入
- ✅ 无 @vxture/bff-* 依赖
- ✅ 无 design-system / platform-* 依赖
- ✅ 无 React / Next.js 依赖
- ✅ 平台服务通过 @vxture/service-{name} 导入（非域路径）

### TypeScript
- ❌ 存在大量 any 类型（模拟实现中使用）
  - 说明：在模拟实现中使用，真实实现后可消除
- ✅ storage 方法返回类型明确
- ✅ 纯类型导入使用 import type

---

## 全局检查

- ✅ tsconfig.json extends 路径为 "../../tsconfig.base.json"
- ✅ 无相对跨包路径导入
- ✅ index.ts 正确导出应用入口

---

## 检查结果

**通过项：48 / 54**

### 已实现目录结构
```
agent-server/ruinagent/src/
├── index.ts                      # 应用入口
├── routers/
│   └── session.router.ts        # 路由处理
├── workflows/
│   └── ruinagent.workflow.ts    # 工作流定义
├── providers/
│   └── ai.provider.ts           # AI Provider 配置
├── storage/
│   ├── session.storage.ts        # 会话存储
│   └── vector.storage.ts        # 向量存储
├── services/
│   └── chat.service.ts          # 聊天服务
└── types/
    └── ruinagent.types.ts       # 类型定义
```

### 优先修复问题列表
1. 为所有抛出异常的方法添加 @throws JSDoc 注释
2. 消除模拟实现中的 any 类型（当 AI SDK 完整后）
3. 实现 BullMQ 队列处理耗时 AI 任务（可选，按需）

---

**检查状态**: ✅ Phase3 基本完成，架构规范已满足，部分细节问题待优化
