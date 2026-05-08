# @vxture/bff-console

> ⚠️ 待大版本重构 | 暂无独立 CLAUDE.md，内容待核查补充
> 架构层参考：[`docs/architecture/10-bff-layer.md`](../../architecture/10-bff-layer.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/bff-console` |
| 路径 | `bff/console-bff/` |
| @layer | `Application` |
| 服务对象 | `portals/console` |
| 端口 | 3021 |

## 职责

服务 portals/console 的 BFF：租户工作台的认证、租户数据聚合、订阅状态。

## JWT 认证架构

本 BFF **不签发 JWT**。认证端点通过 HTTP 透传至 `@vxture/bff-auth`。
本 BFF 仅保留 JWT **验证**能力，供 auth middleware 使用。

## 依赖约束

**允许：**
- `@vxture/core-auth` / `@vxture/core-tenant` / `@vxture/core-*`
- `@vxture/shared`
- `@vxture/service-subscription`（Feature Gating）/ `@vxture/service-billing`
- NestJS / class-validator

**禁止：** `@vxture/ai-sdk` / `design-system` / `platform-*` / 跨 BFF 导入

## 待核查

- [ ] 确认 console-bff 已使用的 service 包列表
- [ ] 确认 console-bff router 模块列表（members / roles / billing / settings）
- [ ] 确认 tenantId 在 JWT 中的传播路径
