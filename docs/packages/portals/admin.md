# @vxture/admin

> ⚠️ 待大版本重构 | 暂无独立 CLAUDE.md，内容待核查补充
> 架构层参考：[`docs/architecture/index.md`](../../architecture/index.md)
> 产品设计：[`docs/product/platform/admin/`](../../product/platform/admin/)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/admin` |
| 路径 | `portals/admin/` |
| @layer | `Presentation` |
| 框架 | Next.js 15（App Router） |
| 端口 | 3030 |

## 职责

平台运营后台：面向平台运营者，管理租户、账单、用户、配置、工单等。
Vela 智能助手嵌入点（`portals/admin/src/layout/VelaAdminChat.tsx`）。

## 依赖约束

```typescript
✅ @vxture/design-system
✅ @vxture/shared
✅ @vxture/core-locale（唯一允许的 core 包）
✅ BFF（HTTP only）
❌ @vxture/service-* / core-auth / core-api / core-config / core-tenant
❌ @vxture/ai-sdk / agent-server/*
```

## 待核查

- [ ] 确认 admin 当前路由组结构
- [ ] 确认 Vela 嵌入状态（VelaAdminChat.tsx 是否已接通）
- [ ] 确认已实现 vs 占位的页面列表（audit-logs / announcements / skills）
