# Session 管理设计

> ⏳ 待编制
>
> 本文档将描述 Vxture 的 Session 管理设计，包括：
> - Access Token / Refresh Token 生命周期
> - Cookie 命名规范（vx_tenant_* / vx_admin_* / ry_*）
> - Redis 中的 Token 存储结构（refresh / blacklist / crossdomain）
> - Token 续期流程
> - 登出与 Token 吊销流程
> - 用户级撤销水位（revoked-before）
>
> **参考文档**：
> - `docs/design/auth.md` — auth-bff 完整认证设计
> - `docs/packages/bff/auth-bff.md` — auth-bff 关键约束
