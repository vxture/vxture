# ADR-004: BFF 层使用 NestJS 框架

**状态**：✅ Accepted
**日期**：2026-02-01

---

## 背景

BFF 层（7 个服务）需要 Node.js 服务端框架。BFF 的核心职责是：JWT 验证中间件、多租户上下文提取、RBAC 权限守卫、请求聚合、响应塑形。

## 决策选项

### 选项 A：Express.js

**优点**：生态最广，学习成本最低，启动速度快。
**缺点**：自由度过高导致每个 BFF 结构各异，无内置 DI，中间件链需手动组合，TypeScript 类型支持需额外配置。

### 选项 B：Fastify

**优点**：吞吐量高于 Express，内置 JSON schema 验证，TypeScript 友好。
**缺点**：插件生态相比 NestJS 更分散；对 BFF 场景的 Guards/Interceptors 模式无内置支持，需自建抽象。

### 选项 C：NestJS

模块化 DI 框架，内置 Guards、Interceptors、Pipes、ExceptionFilters。

**优点**：
- `@UseGuards(AuthGuard, TenantGuard)` 等 Decorator 直接对应 BFF 中间件链需求
- 依赖注入让单元测试中可替换 Provider（如 mock Redis）
- `class-validator` + `class-transformer` 内置请求验证
- 结构统一：所有 BFF 遵循 Module → Controller → Guard → Service 模式

**缺点**：启动时间比 Express 长（DI 容器初始化）；冷启动影响 Serverless 场景（当前不使用 Serverless）。

### 选项 D：Hono

**优点**：超轻量，边缘友好（Cloudflare Workers 等）。
**缺点**：生态不够成熟；当前 BFF 运行在容器中，边缘优化无意义；缺少 BFF 场景所需的结构化能力。

## 决策

采用**选项 C（NestJS）**。

关键决定因素：
1. 团队有 Spring Boot 背景，Module/Controller/Service/Guard 概念迁移成本低
2. BFF 的中间件链（Auth → Tenant → Permission → Router）与 NestJS Guards 执行顺序天然对应
3. 所有 BFF 结构统一，降低跨服务维护认知负担

## 后果

**正面：**
- 7 个 BFF 结构完全统一，可以互相参照
- Guards（`AuthGuard` / `TenantGuard` / `PermissionGuard`）可跨 BFF 复用
- DI 使集成测试中替换 Redis/HTTP 依赖变得简单
- NestJS 内置的 `@nestjs/jwt`、`passport` 与认证需求完美匹配

**负面：**
- 每个 BFF 构建产物约 50-100MB（含 NestJS 运行时），比 Express 方案大
- 冷启动约 500ms-1s（容器 always-on 部署，无实际影响）
- `experimentalDecorators: true` 是前提（全项目已启用）
- 新建 BFF 时有一定样板代码（Module + Controller + Guard 最小三件套）

---

_决策人：架构组 | 实施于：所有 `bff/*/` 服务_
