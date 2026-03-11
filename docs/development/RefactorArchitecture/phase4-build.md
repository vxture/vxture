# Phase 4 AI Prompt — 现有 BFF 规范化

> 直接将以下内容发送给执行 Claude。

---

你是 Vxture Monorepo 的重构执行专家。现在执行 Phase 4：现有 BFF 层规范化。

## 目标包

- `@vxture/bff-website`  （bff/website-bff/）
- `@vxture/bff-admin`    （bff/admin-bff/）
- `@vxture/bff-tenant`   （bff/tenant-bff/）

---

## 技术栈约束

### 允许使用

| 用途 | 选型 |
|------|------|
| 框架 | NestJS（Module / Controller / Injectable） |
| 认证 | Passport.js + JWT（`@nestjs/passport` / `passport-jwt`） |
| DTO 校验 | class-validator + class-transformer |
| API 文档 | @nestjs/swagger |
| 工具 | `@vxture/core-auth` / `@vxture/core-tenant` / `@vxture/shared` |

### 严格禁止

- `@vxture/ai-sdk`（AI 能力属于 agent-server）
- `@vxture/design-system` / `platform-*`
- 跨 BFF 导入（bff 之间绝对隔离）
- React / Next.js / 任何浏览器 API
- 在 BFF 中写业务逻辑（业务逻辑属于 service / agent-server）
- 前端直接 import BFF 包（只允许 HTTP 通信）

---

## 规范要求

### 1. 目录结构

```
src/
├── routers/        # *.router.ts     — 域路由模块，每域一个文件
├── aggregators/    # *.aggregator.ts — 跨域数据聚合
├── middleware/     # *.middleware.ts — auth / tenant 中间件
├── types/          # *.types.ts      — 面向前端的 DTO 类型
└── index.ts        # 应用入口
```

### 2. 文件命名

| 类型 | 规范 |
|------|------|
| 路由模块 | `*.router.ts` |
| 聚合器 | `*.aggregator.ts` |
| 中间件 | `*.middleware.ts` |
| DTO 类型 | `*.types.ts` |

### 3. 文件头注释（每个文件必须）

```typescript
/**
 * filename.ts - 简短描述
 * @package @vxture/bff-[name]
 *
 * Description: 详细功能说明
 *
 * @author AI-Generated
 * @date 2026-03-11
 * @version 1.0
 *
 * @copyright Vxture Team
 * @license MIT
 *
 * @layer Application
 * @category Router | Aggregator | Middleware | Types
 */
```

- 注释语言：中文
- 超过 80 行必须加 Section 分隔注释

### 4. 分层职责规范

**middleware/auth.middleware.ts**
- 从请求头提取 token
- 调用 `@vxture/core-auth` 验证 token
- 将解析后的用户信息挂载到请求上下文
- token 无效返回 401，不进入路由

**middleware/tenant.middleware.ts**
- 解析 tenantId（路径参数 / 子域名 / Header）
- 调用 `@vxture/core-tenant` 验证租户合法性
- 将 tenantId 注入请求上下文
- 中间件执行顺序：auth → tenant → router

**routers/**
- 每个 router 负责一个业务域
- 每个 router 独立捕获处理自己的错误，不冒泡
- 调用 `@vxture/service-*` 获取数据，不含业务逻辑
- 负责响应塑形：字段投影、重命名、格式转换
- 不透传后端完整数据结构给前端

**aggregators/**
- 组合多个域数据，不含业务决策逻辑
- 并发调用多个下游服务时使用 Promise.all
- 跨域业务编排属于 service 层，不属于 aggregator

**types/**
- 面向前端的响应 DTO 类型
- 与后端领域类型解耦，独立定义
- 使用 @ApiProperty() 标注（swagger）

### 5. 错误处理规范

- 每个 router 模块用 try/catch 捕获内部错误
- 统一转化为标准 HTTP 错误（状态码 + 错误码 + 消息）
- auth / tenant 错误在 middleware 层处理，不进入 router
- 一个 router 的错误不影响其他 router

### 6. 响应塑形规范

- 只返回前端实际需要的字段
- 字段命名不一致时在 BFF 层转换
- 响应结构在 types/ 中明确定义

### 7. TypeScript

- 严格模式，禁止 any
- 响应 DTO 类型必须明确，禁止透传后端原始类型
- 纯类型导入使用 import type

---

## 执行方式

1. 执行顺序：website-bff → admin-bff → tenant-bff
2. 每个 BFF 输出：
   - 完整 src/ 目录结构
   - 每个文件完整内容
   - 更新后的 index.ts
3. 已有代码：合并规范，补齐缺失项，有冲突说明原因

---

End of Phase 4 Prompt.
