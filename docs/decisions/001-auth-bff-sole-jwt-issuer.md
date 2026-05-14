# ADR-001: auth-bff 作为唯一 JWT 签发者

**状态**：✅ Accepted
**日期**：2026-03-01

---

## 背景

平台有 7 个 BFF 服务（auth / gateway / website / console / admin / ruyin / vela）。每个 BFF 在用户完成认证后都有签发 JWT 的潜在需求（如 OAuth 回调后签发、内部跨域 token）。

如果每个 BFF 独立持有签发逻辑，会导致：

- JWT claims schema 分散在多个服务，任何字段变更（如新增 `tenantId` 字段）需要同步改动多处
- JWT 签发密钥（`JWT_ACCESS_SECRET`）需在多个服务中持有，密钥泄露面增大
- 黑名单/吊销逻辑（Redis jti 黑名单）需在每个签发者处实现，一致性无法保证
- OAuth 回调处理高度相似，代码重复

## 决策选项

### 选项 A：每个 BFF 独立签发

各 BFF 持有自己的 JWT 密钥和签发逻辑。

**优点**：服务解耦，无跨服务调用。
**缺点**：密钥分散，claims schema 难统一，黑名单逻辑重复，审计困难。

### 选项 B：独立 Auth 微服务

新建独立的 Auth 微服务，所有 BFF 通过 RPC 调用签发。

**优点**：职责最纯粹，Auth 可独立扩缩。
**缺点**：引入新的服务层级和通信协议；登录流程本身就是 BFF 的职责范围，再分层是过度工程化。

### 选项 C：auth-bff 作为唯一签发者，其他 BFF 委托

`auth-bff` 负责所有 JWT 签发。其他 BFF 在需要签发 token 时，通过内部接口 `POST /auth/internal/sign` 委托，该接口用 `x-vxture-internal-auth` 头保护。

**优点**：签发逻辑和密钥集中，黑名单唯一实现，claims schema 改一处即全局生效，auth-bff 职责边界清晰。
**缺点**：其他 BFF 的 OAuth 回调后多一次内部 HTTP 跳；auth-bff 成为认证关键路径上的单点。

## 决策

采用**选项 C**。

对单点风险的应对：auth-bff 以容器形式部署，可配置多副本；Redis 不可用时 fail-closed（禁止退化为无状态 token），保证安全优先。

## 后果

**正面：**
- JWT claims schema 改一处即全局生效（如新增字段、修改过期时间）
- 黑名单/吊销逻辑唯一实现，logout 一致性有保证
- JWT 签发密钥只在 auth-bff 的环境变量中持有，Secret rotation 只改一处
- 所有登录审计日志集中在 auth-bff

**负面：**
- 其他 BFF 的 OAuth 回调需要额外调用一次 auth-bff 内部接口（同 Docker 网络，延迟 < 1ms）
- auth-bff 不可用时，所有新登录均失败（已有 JWT 的存量用户不受影响）
- 内部接口需要维护 `AUTH_INTERNAL_TOKEN` 密钥并在调用方 BFF 中配置

---

_决策人：架构组 | 实施于：`bff/auth-bff/` 和所有其他 BFF 中间件_
