# 多租户设计

> ⏳ 待编制
>
> 本文档将描述 Vxture 的多租户架构设计，包括：
> - PLG 租户模型（个人 / 组织）
> - tenantId 解析链路（BFF → core-tenant → JWT）
> - 租户隔离原则（数据隔离 / 功能隔离）
> - 租户初始化流程（注册 → 选择类型 → 绑定租户）
> - 运营账号与租户账号的隔离设计
>
> **参考文档**：
> - `docs/design/auth.md` — 账号体系（含租户账号说明）
> - `docs/packages/core/tenant.md` — core-tenant 包实现约束
> - `docs/architecture/00-overview.md` — 层级总览
