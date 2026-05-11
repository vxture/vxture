# BFF 层通用约束

> `@layer Application` — 适用于所有 `bff/*` 包
> 各 BFF 文档只写该包独有的接口和约束，通用约束统一在此定义。

---

## JWT 架构（全层约束）

**只有 `@vxture/bff-auth` 签发 JWT。** 其他所有 BFF 的认证流程：

1. 用户凭证在各 BFF 验证（DB / OAuth）
2. 验证通过后委托 auth-bff `POST /auth/internal/sign` 签发 Cookie
3. 各 BFF 只保留 JWT **验证**能力（本地 `JwtService.verify`）

## 请求处理约定

- **middleware 执行顺序**：`auth` → `tenant` → `router`（console-bff 额外加 `permission`）
- **错误隔离**：每个 router 独立 try/catch，错误不冒泡到上层
- **响应投影**：做字段投影，不透传后端原始结构

## auth-bff 调用路径

| BFF 类型 | 调用方式 |
|---------|---------|
| 平台 BFF（worker-01） | 容器网络直连 `http://vx-auth-bff:3090` |
| Agent BFF（worker-02） | Tailscale `http://100.100.197.42:3090` |

## 禁止

- 直接签发 JWT（无论任何场景）
- 跨 BFF 包代码引用（通信只走 HTTP）
- 引入 `@vxture/ai-sdk` / `design-system` / `platform-*`
- 在 BFF 层实现业务逻辑（聚合可以，计算/决策不行）
