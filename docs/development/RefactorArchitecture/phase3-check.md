# Phase 3 检查清单 — Agent Server 层规范化

**Version**: 1.0.0
**Last Updated**: 2026-03-11

---

## agent-server/ruinagent

### 目录结构
- [ ] src/routers/ 存在
- [ ] src/workflows/ 存在
- [ ] src/providers/ 存在
- [ ] src/storage/ 存在
- [ ] src/services/ 存在
- [ ] src/types/ 存在
- [ ] src/index.ts 存在

### 文件命名
- [ ] 路由文件以 *.router.ts 结尾
- [ ] 工作流文件以 *.workflow.ts 结尾
- [ ] Provider 文件以 *.provider.ts 结尾
- [ ] 数据访问文件以 *.storage.ts 结尾
- [ ] 业务逻辑文件以 *.service.ts 结尾
- [ ] 类型文件以 *.types.ts 结尾
- [ ] 无 helpers.ts / misc.ts 泛名文件

### 注释规范
- [ ] 每个文件包含完整文件头（@package / @layer / @category / @author / @date）
- [ ] @package 为 agent-server/ruinagent
- [ ] @layer 为 Application
- [ ] 所有注释使用中文
- [ ] 超过 80 行有 Section 分隔注释
- [ ] 所有 export 方法有 JSDoc（@param / @returns / @throws）

### 分层职责
- [ ] router 只做路由和响应格式化，不含业务逻辑
- [ ] router 独立捕获处理自己的错误
- [ ] workflow 通过 @vxture/ai-sdk 调用 AI，不直接调用 provider
- [ ] provider 封装 model 配置，不在业务代码硬编码
- [ ] storage 封装所有 Prisma 操作
- [ ] storage 返回领域类型，非 Prisma 原始类型
- [ ] service 调用 storage，不内联 DB 查询

### AI 调用规范
- [ ] 所有 LLM 调用通过 @vxture/ai-sdk/llm
- [ ] 所有 Embedding 调用通过 @vxture/ai-sdk/embedding
- [ ] 无直接 import Anthropic SDK / Doubao SDK
- [ ] 无直接 import 任何 LLM provider 包

### 队列规范（如有）
- [ ] 耗时 AI 任务通过 BullMQ 异步处理
- [ ] Queue / Worker / Processor 分文件定义

### 依赖约束
- [ ] 无跨 agent-server/* 目录导入
- [ ] 无 @vxture/bff-* 依赖
- [ ] 无 design-system / platform-* 依赖
- [ ] 无 React / Next.js 依赖
- [ ] 平台服务通过 @vxture/service-{name} 导入（非域路径）

### TypeScript
- [ ] 无 any 类型
- [ ] storage 方法返回类型明确
- [ ] 纯类型导入使用 import type

---

## 全局检查

- [ ] tsconfig.json extends 路径为 "../../tsconfig.base.json"
- [ ] 无相对跨包路径导入
- [ ] index.ts 正确导出应用入口

---

## 输出格式

逐项输出 ✅ / ❌ / ⚠️
❌ 和 ⚠️ 需说明问题与修复建议
最后输出：通过项 / 总项，优先修复问题列表
