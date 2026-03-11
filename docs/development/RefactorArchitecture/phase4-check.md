# Phase 4 检查清单 — 现有 BFF 规范化

**Version**: 1.0.0
**Last Updated**: 2026-03-11

---

## 通用检查项（三个 BFF 各自独立验证）

### 目录结构
- [ ] src/routers/ 存在
- [ ] src/aggregators/ 存在
- [ ] src/middleware/ 存在
- [ ] src/types/ 存在
- [ ] src/index.ts 存在

### 文件命名
- [ ] 路由文件以 *.router.ts 结尾
- [ ] 聚合器文件以 *.aggregator.ts 结尾
- [ ] 中间件文件以 *.middleware.ts 结尾
- [ ] 类型文件以 *.types.ts 结尾
- [ ] 无 helpers.ts / misc.ts 泛名文件

### 注释规范
- [ ] 每个文件包含完整文件头（@package / @layer / @category / @author / @date）
- [ ] @layer 为 Application
- [ ] 所有注释使用中文
- [ ] 超过 80 行有 Section 分隔注释
- [ ] 所有 export 方法有 JSDoc

### Middleware 规范
- [ ] auth.middleware.ts 存在
- [ ] tenant.middleware.ts 存在
- [ ] auth middleware 调用 @vxture/core-auth 验证 token
- [ ] tenant middleware 调用 @vxture/core-tenant 解析 tenantId
- [ ] middleware 执行顺序：auth → tenant → router
- [ ] token 无效时返回 401，不进入路由

### Router 规范
- [ ] 每个 router 对应一个业务域
- [ ] 每个 router 有独立 try/catch 错误处理
- [ ] router 不含业务逻辑（业务逻辑在 service 层）
- [ ] router 做响应塑形（字段投影 / 重命名），不透传后端原始结构
- [ ] 无 router 内联 service 逻辑

### Aggregator 规范
- [ ] aggregator 只做数据组合，不含业务决策
- [ ] 多服务并发调用使用 Promise.all
- [ ] 无跨域业务编排逻辑（应在 service 层）

### Types 规范
- [ ] 响应 DTO 定义在 types/ 目录
- [ ] DTO 类型与后端领域类型解耦
- [ ] DTO 有 @ApiProperty() 标注

### 依赖约束
- [ ] 无 @vxture/ai-sdk 依赖
- [ ] 无 @vxture/design-system / platform-* 依赖
- [ ] 无跨 BFF 导入
- [ ] 无 React / Next.js / 浏览器 API
- [ ] 无业务逻辑（只有聚合 / 路由 / 认证）

### TypeScript
- [ ] 无 any 类型
- [ ] 响应 DTO 类型明确
- [ ] 纯类型导入使用 import type

---

## @vxture/bff-website 专项

- [ ] package.json name 为 @vxture/bff-website
- [ ] 服务 portals/website 的前端需求
- [ ] router 覆盖 website 所需业务域

---

## @vxture/bff-admin 专项

- [ ] package.json name 为 @vxture/bff-admin
- [ ] 服务 portals/admin 的前端需求
- [ ] router 覆盖管理后台所需业务域（user / billing / tenant 等）

---

## @vxture/bff-tenant 专项

- [ ] package.json name 为 @vxture/bff-tenant
- [ ] 服务 portals/tenant 的前端需求
- [ ] router 覆盖租户管理所需业务域

---

## 全局检查

- [ ] 三个 BFF 之间无任何互相导入
- [ ] 所有 tsconfig.json extends 路径为 "../../tsconfig.base.json"
- [ ] 前端代码无直接 import BFF 包（只允许 HTTP 通信）

---

## 输出格式

逐项输出 ✅ / ❌ / ⚠️
❌ 和 ⚠️ 需说明问题与修复建议
最后输出：通过项 / 总项，优先修复问题列表
