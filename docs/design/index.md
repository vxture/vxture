# 技术设计文档索引

> 跨包能力域的端到端技术设计。回答"某个能力如何在多个包之间协作实现"。
>
> 区别：
> - `architecture/` — 层级结构和依赖边界（系统形状）
> - `design/` — 具体能力域跨包设计（能力实现）
> - `packages/` — 单个包的实现约束

---

## 设计文档

| 文件 | 覆盖能力 | 状态 |
|------|---------|------|
| [`auth.md`](auth.md) | 账号体系 / JWT 签发 / Cookie / 跨域 SSO / OAuth / 统一登录体验 / Turnstile / 会话同步 | ✅ 已有（v1.3.0） |
| [`permissions.md`](permissions.md) | RBAC / 权限模型 / 功能开关 | ✅ 已有（迁移自 product-design/） |
| [`locale.md`](locale.md) | i18n 解析链路 / locale 系统重构 | ✅ 已有（迁移自 product-design/） |
| [`font-system.md`](font-system.md) | 字体系统 / Virtual Nature Studio 字体规范 | ✅ 已有（迁移自 docs 根目录） |
| [`tenant.md`](tenant.md) | 多租户解析 / PLG 租户模型 / 隔离原则 | ✅ 已编制 |
| [`session.md`](session.md) | Session 管理 / Cookie 生命周期 / 黑名单 | ✅ 已编制 |
| [`notification.md`](notification.md) | 邮件 / 短信通知流程 | ✅ 已编制 |

---

## 判断文档归属

- 描述**层结构 / 依赖规则**？→ `architecture/`
- 描述**某能力端到端跨多个包如何工作**？→ `design/`（本目录）
- 描述**某个具体包的实现约束**？→ `packages/`
