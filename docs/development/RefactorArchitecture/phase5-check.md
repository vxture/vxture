# Phase 5 检查清单 — 新 BFF 创建（ruinagent-bff）

**Version**: 1.0.0
**Last Updated**: 2026-03-11

---

## @vxture/bff-ruinagent

### 基础文件
- [ ] package.json 存在，name 为 @vxture/bff-ruinagent
- [ ] tsconfig.json 存在，extends 为 "../../tsconfig.base.json"
- [ ] src/index.ts 存在

### 目录结构
- [ ] src/routers/ 存在
- [ ] src/aggregators/ 存在
- [ ] src/middleware/ 存在
- [ ] src/types/ 存在

### 文件命名
- [ ] 路由文件以 *.router.ts 结尾
- [ ] 聚合器文件以 *.aggregator.ts 结尾
- [ ] 中间件文件以 *.middleware.ts 结尾
- [ ] 类型文件以 *.types.ts 结尾

### 注释规范
- [ ] 每个文件包含完整文件头
- [ ] @package 为 @vxture/bff-ruinagent
- [ ] @layer 为 Application
- [ ] 所有注释使用中文
- [ ] 超过 80 行有 Section 分隔注释

### Middleware 规范
- [ ] auth.middleware.ts 存在
- [ ] tenant.middleware.ts 存在
- [ ] auth middleware 调用 @vxture/core-auth
- [ ] tenant middleware 调用 @vxture/core-tenant
- [ ] 执行顺序 auth → tenant → router 正确配置

### Router 规范
- [ ] agent.router.ts 存在（核心 agent 交互）
- [ ] session.router.ts 存在（会话管理）
- [ ] billing.router.ts 存在（计费查询）
- [ ] 每个 router 有独立 try/catch 错误处理
- [ ] router 不含业务逻辑
- [ ] 响应经过字段投影，不透传原始结构

### Agent BFF 专有检查
- [ ] agent-server 通信通过 HTTP，不直接 import agent-server 代码
- [ ] agent-server 地址通过 @vxture/core-config 配置，不硬编码
- [ ] 如有流式响应，SSE 处理在 router 层，不在 aggregator 层

### Aggregator 规范
- [ ] aggregator 只做数据组合
- [ ] 多服务并发使用 Promise.all
- [ ] 无跨域业务编排逻辑

### Types 规范
- [ ] 响应 DTO 定义在 types/ 目录
- [ ] DTO 类型与后端领域类型解耦
- [ ] DTO 有 @ApiProperty() 标注

### 依赖约束
- [ ] 无 @vxture/ai-sdk 依赖
- [ ] 无 design-system / platform-* 依赖
- [ ] 无跨 BFF 导入
- [ ] 无 React / Next.js / 浏览器 API
- [ ] 无直接 import agent-server 代码

### TypeScript
- [ ] 无 any 类型
- [ ] 响应 DTO 类型明确
- [ ] 纯类型导入使用 import type

---

## 输出格式

逐项输出 ✅ / ❌ / ⚠️
❌ 和 ⚠️ 需说明问题与修复建议
最后输出：通过项 / 总项，优先修复问题列表
