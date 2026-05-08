# @vxture/console

> ⚠️ 待大版本重构 | 暂无独立 CLAUDE.md，内容待核查补充
> 架构层参考：[`docs/architecture/index.md`](../../architecture/index.md)

---

## 包信息

| 项 | 值 |
|----|----|
| 包名 | `@vxture/console` |
| 路径 | `portals/console/` |
| @layer | `Presentation` |
| 框架 | Next.js 15（App Router） |
| 端口 | 3020 |

## 职责

租户工作台：面向租户管理员，管理租户成员、订阅、权限、设置等。
Vela 智能助手嵌入点（console surface）。

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

- [ ] 确认 console 当前路由组结构
- [ ] 确认 BFF 接口对接状态（billing / subscription / members / roles / settings）
- [ ] 确认 tenantId 在 JWT 中的传播验证
