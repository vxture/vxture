# CLAUDE.md — portals/

> 继承根 `CLAUDE.md` 全部规则。本文件只记录 Portal 层专属约束。

---

## 层定位

**@layer**: `Presentation`
**产品面**: Platform Surface（运营后台）
**变更频率**: Slow — 面向管理员，CRUD 向，稳定迭代

Portal 是**平台运营管理界面**，服务于平台运营者和租户管理员。

```
portals/website   公开营销站点
portals/admin     平台运营后台（管理租户、账单、配置）
portals/console   租户工作台（管理用户、订阅、设置）
```

---

## 依赖约束

### 核心原则

Frontend 只允许依赖**纯显示、无安全风险**的包：

```
portals/*
  ✅ → @vxture/design-system（组件、theme、tokens）
  ✅ → @vxture/platform-*（地图、3D 等 SDK，可选）
  ✅ → @vxture/shared（基础工具）
  ✅ → @vxture/core-locale（i18n 格式化工具，唯一允许的 core 包）
  ✅ → BFF（HTTP only，禁止包引用）
  ❌ → @vxture/service-*（绕过 BFF 直连禁止）
  ❌ → @vxture/core-api, core-auth, core-config, core-tenant, core-utils（其他 core 包禁止）
  ❌ → @vxture/ai-sdk
  ❌ → agent-server/*
```

### core-locale 例外说明

`@vxture/core-locale` 是唯一允许 frontend 直接引用的 core 包，原因：
- 提供纯工具函数（formatDate、formatNumber、formatCurrency）
- 无副作用、无状态管理、无安全敏感内容
- 性能敏感（简单操作通过 HTTP 调用得不偿失）
- 符合行业最佳实践

---

## 📁 文件结构规范

```
portals/{name}/
├── src/
│   ├── pages/           # 页面组件，按路由组织
│   ├── components/      # 页面专属组件
│   │   ├── common/      # 跨页面复用
│   │   └── {page}/      # 页面专属
│   ├── hooks/           # 数据获取、业务 Hooks
│   ├── stores/          # 全局状态（Zustand / Jotai）
│   ├── api/             # BFF 接口调用层
│   └── types/           # 前端专属类型
```

---

## 编写 Portal 的要求

1. **API 调用统一放在 `api/` 目录**，页面组件不直接调用 fetch
2. 复杂业务状态使用 Hook 封装，不写在组件内部
3. 组件文件不超过 150 行，超出则拆分
4. 使用 `design-system` 的组件，不自行实现已有 UI 原语
5. 页面级组件使用懒加载（`React.lazy`）

---

## Agent 嵌入模式说明

当 agent-studio 以 **Embedded 模式**嵌入 Portal 时：

- Portal 提供 shell（导航、认证 session、主题）
- Agent 模块作为独立 micro-frontend 加载
- **不得**在 Portal 代码中直接 import agent-studio 的内部模块
